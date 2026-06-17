'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { S, colors } from '@/lib/theme'
import Card, { CardHead, CardCompact } from '@/components/ui/Card'
import type { Fermentador, Embotellat, EmbotellAtBloc, TipusAmpolla, TipusTap, TipusSucre } from '@/lib/types'

interface Repartiment {
  id: number
  embotellat_bloc_id: number
  persona: string
  quantitat: number
}

type EmbotellAtBlocAmbRepartiment = EmbotellAtBloc & { repartiment: Repartiment[] }
type EmbotellatAmbTot = Embotellat & { embotellat_bloc: EmbotellAtBlocAmbRepartiment[] }
type FermentadorAmbTot = Fermentador & { embotellat: EmbotellatAmbTot[] }

interface Props {
  data: {
    fermentadors: FermentadorAmbTot[]
    tipusAmpolles: TipusAmpolla[]
    tipusTaps: TipusTap[]
    tipusSucres: TipusSucre[]
  }
  compact?: boolean
}

function nomBloc(bloc: EmbotellAtBloc, ampolles: TipusAmpolla[], taps: TipusTap[], sucres: TipusSucre[]) {
  const ampolla = ampolles.find(a => a.id === bloc.ampolla_id)
  const tap = taps.find(t => t.id === bloc.tap_id)
  const sucre = sucres.find(s => s.id === bloc.sucre_id)
  const rang = `${String(bloc.num_inici).padStart(3, '0')}→${String(bloc.num_final).padStart(3, '0')}`
  return `${ampolla?.nom ?? '?'} · ${tap?.nom ?? '?'} · ${sucre?.nom ?? '?'} (${rang})`
}

function RepartimentLot({ fermentador, ampolles, taps, sucres }: {
  fermentador: FermentadorAmbTot
  ampolles: TipusAmpolla[]
  taps: TipusTap[]
  sucres: TipusSucre[]
}) {
  const embotellat = fermentador.embotellat?.[0]
  const blocs = embotellat?.embotellat_bloc ?? []
  const [repartiments, setRepartiments] = useState<Partial<Repartiment>[]>(
    blocs.flatMap(b => b.repartiment ?? [])
  )
  const [saving, setSaving] = useState(false)

  function repartitPerBloc(blocId: number) {
    return repartiments
      .filter(r => r.embotellat_bloc_id === blocId)
      .reduce((s, r) => s + (r.quantitat ?? 0), 0)
  }

  const persones = Array.from(new Set(repartiments.map(r => r.persona).filter(Boolean))) as string[]

  function litresPersona(persona: string): number {
    return repartiments
      .filter(r => r.persona === persona)
      .reduce((sum, r) => {
        const bloc = blocs.find(b => b.id === r.embotellat_bloc_id)
        const ampolla = ampolles.find(a => a.id === bloc?.ampolla_id)
        return sum + ((r.quantitat ?? 0) * (ampolla?.mida_cl ?? 0) / 100)
      }, 0)
  }

  function ampollesPersona(persona: string): number {
    return repartiments
      .filter(r => r.persona === persona)
      .reduce((s, r) => s + (r.quantitat ?? 0), 0)
  }

  function addPersona() {
    const nom = prompt('Nom de la persona:')
    if (!nom) return
    const noves = blocs.map(b => ({
      persona: nom,
      embotellat_bloc_id: b.id,
      quantitat: 0,
    }))
    setRepartiments(r => [...r, ...noves])
  }

  function removePersona(persona: string) {
    setRepartiments(r => r.filter(x => x.persona !== persona))
  }

  function updateQuantitat(persona: string, blocId: number, quantitat: number) {
    setRepartiments(r => r.map(x =>
      x.persona === persona && x.embotellat_bloc_id === blocId ? { ...x, quantitat } : x
    ))
  }

  async function save() {
    if (!embotellat) return
    setSaving(true)
    const blocIds = blocs.map(b => b.id)
    await supabase.from('repartiment').delete().in('embotellat_bloc_id', blocIds)
    const aInserir = repartiments
      .filter(r => (r.quantitat ?? 0) > 0)
      .map(r => ({
        embotellat_bloc_id: r.embotellat_bloc_id!,
        persona: r.persona!,
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

      <div style={{ padding: '8px 12px', borderBottom: `0.5px solid ${colors.bg3}` }}>
        <div style={S.sectionHead}>Disponible per repartir</div>
        {blocs.map(bloc => {
          const repartit = repartitPerBloc(bloc.id)
          const restant = bloc.quantitat - repartit
          return (
            <div key={bloc.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
              <span style={{ color: colors.text2 }}>{nomBloc(bloc, ampolles, taps, sucres)}</span>
              <span style={{ color: restant < 0 ? colors.amberHi : colors.teal, fontWeight: '500' }}>
                {repartit} / {bloc.quantitat} {restant !== 0 && `(${restant > 0 ? 'resten' : 'excés'} ${Math.abs(restant)})`}
              </span>
            </div>
          )
        })}
      </div>

      {persones.length === 0 ? (
        <div style={{ padding: '20px', textAlign: 'center', fontSize: '11px', color: colors.text3 }}>
          Cap persona afegida. Clica &quot;+ Afegir persona&quot;
        </div>
      ) : (
        <div style={{ padding: '8px 12px' }}>
          {persones.map(persona => (
            <div key={persona} style={{ marginBottom: '12px', borderBottom: `0.5px solid ${colors.bg3}`, paddingBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <span style={{ fontSize: '12px', color: colors.textHi, fontWeight: '500' }}>{persona}</span>
                  <span style={{ fontSize: '10px', color: colors.teal }}>
                    {ampollesPersona(persona)} amp · {litresPersona(persona).toFixed(2)} l
                  </span>
                </div>
                <button onClick={() => removePersona(persona)} style={{ ...S.btnDel, fontSize: '11px' }}>eliminar</button>
              </div>
              {blocs.map(bloc => {
                const valor = repartiments.find(r => r.persona === persona && r.embotellat_bloc_id === bloc.id)?.quantitat ?? 0
                return (
                  <div key={bloc.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '10px', color: colors.text3, width: '160px', flexShrink: 0 }}>
                      {nomBloc(bloc, ampolles, taps, sucres)}
                    </span>
                    <input
                      type="number"
                      min="0"
                      value={valor || ''}
                      placeholder="0"
                      onChange={e => updateQuantitat(persona, bloc.id, parseInt(e.target.value) || 0)}
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
  if (compact) return (
    <div>
      {data.fermentadors.length === 0 && (
        <div style={{ fontSize: '10px', color: colors.text3, padding: '8px 12px' }}>Cap repartiment</div>
      )}
      {data.fermentadors.map(f => {
        const totalRepartit = (f.embotellat?.[0]?.embotellat_bloc ?? [])
          .flatMap(b => b.repartiment ?? [])
          .reduce((s, r) => s + r.quantitat, 0)
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
          <RepartimentLot fermentador={f} ampolles={data.tipusAmpolles} taps={data.tipusTaps} sucres={data.tipusSucres} />
        </div>
      ))}
    </div>
  )
}
