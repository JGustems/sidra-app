'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { EmbotellAtBloc, TipusAmpolla, TipusTap, TipusSucre } from '@/lib/types'
import { S, colors } from '@/lib/theme'
import Card, { CardFootEdit, CardCompact } from '@/components/ui/Card'

interface Props {
  data: {
    jornada: { id: number; data: string }
    embotellat_blocs: EmbotellAtBloc[]
    tipus_ampolla: TipusAmpolla[]
    tipus_tap: TipusTap[]
    tipus_sucre: TipusSucre[]
  }
  compact?: boolean
}

function BlocRow({ bloc, ampolles, taps, sucres, numInici, onDelete, onUpdate }: {
  bloc: Partial<EmbotellAtBloc> & { _local?: boolean }
  ampolles: TipusAmpolla[]
  taps: TipusTap[]
  sucres: TipusSucre[]
  numInici: number
  onDelete: () => void
  onUpdate: (b: Partial<EmbotellAtBloc>) => void
}) {
  const ampolla = ampolles.find(a => a.id === bloc.ampolla_id)
  const tap = taps.find(t => t.id === bloc.tap_id)
  const sucre = sucres.find(s => s.id === bloc.sucre_id)
  const numFinal = numInici + (bloc.quantitat ?? 0) - 1
  const tag = ampolla && tap && sucre ? `${ampolla.codi}.${tap.codi}.${sucre.codi}` : '—'
  const volL = ampolla ? ((bloc.quantitat ?? 0) * ampolla.mida_cl / 100).toFixed(2) : '—'

  return (
    <div style={{
      borderBottom: `0.5px solid ${colors.bg3}`,
      padding: '8px 12px',
    }}>
      {/* Fila 1: selects */}
      <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '6px' }}>
        <select
          style={{ ...S.fieldSelect, flex: 1, fontSize: '11px' }}
          value={bloc.ampolla_id ?? ''}
          onChange={e => onUpdate({ ...bloc, ampolla_id: parseInt(e.target.value) || undefined })}
        >
          <option value="">Ampolla</option>
          {ampolles.filter(a => a.actiu).map(a => <option key={a.id} value={a.id}>{a.codi} — {a.nom} ({a.mida_cl}cl)</option>)}
        </select>
        <select
          style={{ ...S.fieldSelect, flex: 1, fontSize: '11px' }}
          value={bloc.tap_id ?? ''}
          onChange={e => onUpdate({ ...bloc, tap_id: parseInt(e.target.value) || undefined })}
        >
          <option value="">Tap</option>
          {taps.filter(t => t.actiu).map(t => <option key={t.id} value={t.id}>{t.codi} — {t.nom}</option>)}
        </select>
        <select
          style={{ ...S.fieldSelect, flex: 1, fontSize: '11px' }}
          value={bloc.sucre_id ?? ''}
          onChange={e => onUpdate({ ...bloc, sucre_id: parseInt(e.target.value) || undefined })}
        >
          <option value="">Sucre</option>
          {sucres.filter(s => s.actiu).map(s => <option key={s.id} value={s.id}>{s.codi} — {s.nom}</option>)}
        </select>
        <button onClick={onDelete} style={{ ...S.btnDel, fontSize: '12px', flexShrink: 0 }}>✕</button>
      </div>
      {/* Fila 2: quantitat + info calculada */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <input
          style={{ ...S.fieldInput, width: '60px', flex: 'none' }}
          type="number" min="1"
          value={bloc.quantitat ?? ''}
          placeholder="qty"
          onChange={e => onUpdate({ ...bloc, quantitat: parseInt(e.target.value) || 0 })}
        />
        <span style={{ fontSize: '10px', color: colors.text3 }}>ampolles</span>
        <span style={{ fontSize: '10px', color: colors.text2, marginLeft: '8px' }}>
          {bloc.quantitat ? `${String(numInici).padStart(3, '0')} → ${String(numFinal).padStart(3, '0')}` : '—'}
        </span>
        <span style={{ fontSize: '10px', color: colors.teal, marginLeft: 'auto', fontWeight: '500' }}>
          {tag !== '—' ? tag : ''} {bloc.quantitat && ampolla ? `· ${volL} l` : ''}
        </span>
      </div>
    </div>
  )
}

export default function FaseEmbotellat({ data, compact }: Props) {
  const router = useRouter()
  const [blocs, setBlocs] = useState<(Partial<EmbotellAtBloc> & { _local?: boolean })[]>(data.embotellat_blocs ?? [])
  const [saving, setSaving] = useState(false)

  // Calcula el número inicial correlatiu per a cada bloc de la llista
  function getNumInici(idx: number): number {
    let acumulador = 1
    for (let i = 0; i < idx; i++) {
      acumulador += blocs[i].quantitat ?? 0
    }
    return acumulador
  }

  function addBloc() {
    setBlocs(b => [...b, { jornada_id: data.jornada.id, _local: true, quantitat: 0 }])
  }

  function updateBlocState(idx: number, updatedBloc: Partial<EmbotellAtBloc>) {
    setBlocs(b => b.map((item, i) => i === idx ? { ...item, ...updatedBloc } : item))
  }

  async function deleteBloc(idx: number) {
    const bloc = blocs[idx]
    if (bloc.id) {
      await supabase.from('embotellat_bloc').delete().eq('id', bloc.id)
      router.refresh()
    }
    setBlocs(b => b.filter((_, i) => i !== idx))
  }

  async function saveAll() {
    setSaving(true)
    for (const bloc of blocs) {
      const payload = {
        jornada_id: data.jornada.id,
        ampolla_id: bloc.ampolla_id,
        tap_id: bloc.tap_id,
        sucre_id: bloc.sucre_id,
        quantitat: bloc.quantitat ?? 0
      }

      if (bloc.id) {
        await supabase.from('embotellat_bloc').update(payload).eq('id', bloc.id)
      } else {
        await supabase.from('embotellat_bloc').insert(payload)
      }
    }
    router.refresh()
    setSaving(false)
  }

  const totalAmpolles = blocs.reduce((sum, b) => sum + (b.quantitat ?? 0), 0)

  // Vista reduïda per al carrusel lateral
  if (compact) return (
    <CardCompact
      id="EMB"
      badge={totalAmpolles > 0 ? `${totalAmpolles} u.` : undefined}
      fields={[
        { label: 'Lots totals', value: blocs.length > 0 ? `${blocs.length} lots` : 'Cap lot' },
        { label: 'Ampolles', value: totalAmpolles > 0 ? `${totalAmpolles} unitats` : null },
      ]}
    />
  )

  // Vista completa i editable
  return (
    <div style={{ maxWidth: '460px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <span style={{ fontSize: '9px', color: colors.text3, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Embotellat</span>
        <button onClick={addBloc} style={S.btnAdd}>+ Afegir lot</button>
      </div>

      {blocs.length === 0 ? (
        <div style={{ border: `0.5px dashed ${colors.border}`, borderRadius: '8px', padding: '32px', textAlign: 'center', color: colors.text3, fontSize: '12px' }}>
          Cap lot d'embotellat registrat
        </div>
      ) : (
        <Card editing>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {blocs.map((bloc, idx) => (
              <BlocRow
                key={bloc.id ?? `local-${idx}`}
                bloc={bloc}
                ampolles={data.tipus_ampolla}
                taps={data.tipus_tap}
                sucres={data.tipus_sucre}
                numInici={getNumInici(idx)}
                onDelete={() => deleteBloc(idx)}
                onUpdate={fields => updateBlocState(idx, fields)}
              />
            ))}
          </div>
          <CardFootEdit 
            onSave={saveAll} 
            onCancel={() => setBlocs(data.embotellat_blocs ?? [])} 
            saving={saving}
          />
        </Card>
      )}
    </div>
  )
}
