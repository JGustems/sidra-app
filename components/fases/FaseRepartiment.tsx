'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { S, colors } from '@/lib/theme'
import Card, { CardHead, CardCompact } from '@/components/ui/Card'
import type { Fermentador, Embotellat, EmbotellAtBloc, TipusAmpolla } from '@/lib/types'

interface Repartiment {
  id: number
  embotellat_id: number
  persona: string
  ampolla_id: number
  quantitat: number
}

type EmbotellatAmbTot = Embotellat & {
  embotellat_bloc: EmbotellAtBloc[]
  repartiment: Repartiment[]
}
type FermentadorAmbTot = Fermentador & { embotellat: EmbotellatAmbTot[] }

interface Props {
  data: {
    fermentadors: FermentadorAmbTot[]
    tipusAmpolles: TipusAmpolla[]
  }
  compact?: boolean
}

function RepartimentLot({ fermentador, ampolles }: {
  fermentador: FermentadorAmbTot
  ampolles: TipusAmpolla[]
}) {
  const embotellat = fermentador.embotellat?.[0]
  const blocs = embotellat?.embotellat_bloc ?? []
  const [repartiments, setRepartiments] = useState<Partial<Repartiment>[]>(embotellat?.repartiment ?? [])
  const [saving, setSaving] = useState(false)

  // Total disponible per cada ampolla_id (suma dels blocs amb aquest tipus)
  const disponiblePerAmpolla = new Map<number, number>()
  blocs.forEach(b => {
    disponiblePerAmpolla.set(b.ampolla_id, (disponiblePerAmpolla.get(b.ampolla_id) ?? 0) + b.quantitat)
  })

  // Total ja repartit per cada ampolla_id
  function repartitPerAmpolla(ampollaId: number) {
    return repartiments
      .filter(r => r.ampolla_id === ampollaId)
      .reduce((s, r) => s + (r.quantitat ?? 0), 0)
  }

  // Persones úniques
  const persones = Array.from(new Set(repartiments.map(r => r.persona).filter(Boolean))) as string[]

  function addPersona() {
    const nom = prompt('Nom de la persona:')
    if (!nom) return
    const noves = Array.from(disponiblePerAmpolla.keys()).map(ampollaId => ({
      persona: nom,
      ampolla_id: ampollaId,
      quantitat: 0,
    }))
    setRepartiments(r => [...r, ...noves])
  }

  function removePersona(persona: string) {
    setRepartiments(r => r.filter(x => x.persona !== persona))
  }

  function updateQuantitat(persona: string, ampollaId: number, quantitat: number) {
    setRepartiments(r => r.map(x =>
      x.persona === persona && x.ampolla_id === ampollaId ? { ...x, quantitat } : x
    ))
  }

  async function save() {
    if (!embotellat?.id) return
    setSaving(true)
    await supabase.from('repartiment').delete().eq('embotellat_id', embotellat.id)
    const aInserir = repartiments
      .filter(r => (r.quantitat ?? 0) > 0)
      .map(r => ({
        embotellat_id: embotellat.id,
        persona: r.persona!,
        ampolla_id: r.ampolla_id!,
        quantitat: r.quantitat!,
      }))
    if (aInserir.length > 0) {
      await supabase.from('repartiment').insert(aInserir)
    }
    setSaving(false)
  }

  if (!embotellat || blocs.length === 0) return (
    <Card>
      <CardHead id={fermentador.codi} />
      <div style={{ padding: '20px', textAlign: 'center', fontSize: '11px', color: colors.text3 }}>
        Aquest LOT encara no té cap embotellat registrat
      </div>
    </Card>
  )

  return (
    <Card editing>
      <div style={S.cardHead}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={S.cardId}>{fermentador.codi}</span>
          {fermentador.lot && <span style={S.lotBadge}>LOT {fermentador.lot}</span>}
        </div>
        <button onClick={addPersona} style={S.btnAdd}>+ Afegir persona</button>
      </div>

      {/* Resum de disponibilitat per tipus d'ampolla */}
      <div style={{ padding: '8px 12px', borderBottom: `0.5px solid ${colors.bg3}` }}>
        <div style={S.sectionHead}>Disponible per repartir</div>
        {Array.from(disponiblePerAmpolla.entries()).map(([ampollaId, total]) => {
          const ampolla = ampolles.find(a => a.id === ampollaId)
          const repartit = repartitPerAmpolla(ampollaId)
          const restant = total - repartit
          return (
            <div key={ampollaId} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
              <span style={{ color: colors.text2 }}>{ampolla?.nom ?? `Ampolla #${ampollaId}`}</span>
              <span style={{ color: restant < 0 ? colors.amberHi : colors.teal, fontWeight: '500' }}>
                {repartit} / {total} {restant !== 0 && `(${restant > 0 ? 'resten' : 'excés'} ${Math.abs(restant)})`}
              </span>
            </div>
          )
        })}
      </div>

      {/* Taula de persones x tipus ampolla */}
      {persones.length === 0 ? (
        <div style={{ padding: '20px', textAlign: 'center', fontSize: '11px', color: colors.text3 }}>
          Cap persona afegida. Clica &quot;+ Afegir persona&quot;
        </div>
      ) : (
        <div style={{ padding: '8px 12px' }}>
          {persones.map(persona => (
            <div key={persona} style={{ marginBottom: '12px', borderBottom: `0.5px solid ${colors.bg3}`, paddingBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '12px', color: colors.textHi, fontWeight: '500' }}>{persona}</span>
                <button onClick={() => removePersona(persona)} style={{ ...S.btnDel, fontSize: '11px' }}>eliminar</button>
              </div>
              {Array.from(disponiblePerAmpolla.keys()).map(ampollaId => {
                const ampolla = ampolles.find(a => a.id === ampollaId)
                const valor = repartiments.find(r => r.persona === persona && r.ampolla_id === ampollaId)?.quantitat ?? 0
                return (
                  <div key={ampollaId} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '10px', color: colors.text3, width: '120px', flexShrink: 0 }}>
                      {ampolla?.nom ?? `#${ampollaId}`}
                    </span>
                    <input
                      type="number"
                      min="0"
                      value={valor || ''}
                      placeholder="0"
                      onChange={e => updateQuantitat(persona, ampollaId, parseInt(e.target.value) || 0)}
                      style={{ ...S.fieldInput, width: '60px', flex: 'none' }}
                    />
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      )}

      <div style={{ ...S.cardFoot, justifyContent: 'flex-end' }}>
        <button style={S.btnSave} onClick={save} disabled={saving}>
          {saving ? 'Desant...' : 'Desar repartiment'}
        </button>
      </div>
    </Card>
  )
}

export default function FaseRepartiment({ data, compact }: Props) {
  const router = useRouter()

  if (compact) return (
    <div>
      {data.fermentadors.length === 0 && (
        <div style={{ fontSize: '10px', color: colors.text3, padding: '8px 12px' }}>Cap repartiment</div>
      )}
      {data.fermentadors.map(f => {
        const totalRepartit = (f.embotellat?.[0]?.repartiment ?? []).reduce((s, r) => s + r.quantitat, 0)
        return (
          <CardCompact
            key={f.id}
            id={f.codi}
            badge={f.lot ? `LOT ${f.lot}` : undefined}
            badgeColor="amber"
            fields={[
              { label: 'Repartit', value: totalRepartit > 0 ? `${totalRepartit} amp.` : null },
            ]}
          />
        )
      })}
    </div>
  )

  return (
    <div style={{ maxWidth: '460px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <span style={{ fontSize: '9px', color: colors.text3, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Repartiment d&apos;ampolles
        </span>
      </div>
      {data.fermentadors.length === 0 && (
        <div style={{ border: `0.5px dashed ${colors.border}`, borderRadius: '8px', padding: '32px', textAlign: 'center', color: colors.text3, fontSize: '12px' }}>
          Cap LOT disponible
        </div>
      )}
      {data.fermentadors.map(f => (
        <div key={f.id} style={{ marginBottom: '16px' }}>
          <RepartimentLot fermentador={f} ampolles={data.tipusAmpolles} />
        </div>
      ))}
    </div>
  )
}
