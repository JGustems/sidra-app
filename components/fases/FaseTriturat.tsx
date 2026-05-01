'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { Triturada, TritaradaOrigen, Poma } from '@/lib/types'

type TritaradaAmbOrigen = Triturada & { triturada_origen: TritaradaOrigen[] }

interface Props {
  data: {
    jornada: { id: number }
    pomes: Poma[]
    triturades: TritaradaAmbOrigen[]
  }
  compact?: boolean
}

const S = {
  card:        { background: '#26241f', border: '0.5px solid #252422', borderRadius: '8px', overflow: 'hidden' as const, marginBottom: '8px' },
  cardEditing: { background: '#26241f', border: '0.5px solid #BA7517', borderRadius: '8px', overflow: 'hidden' as const, marginBottom: '8px' },
  cardHead:    { display: 'flex' as const, alignItems: 'center' as const, justifyContent: 'space-between' as const, padding: '7px 12px', borderBottom: '0.5px solid #252422', background: '#1e1c18' },
  cardId:      { fontSize: '11px', fontWeight: '500' as const, color: '#c8c4be', background: '#252422', padding: '2px 8px', borderRadius: '4px' },
  fieldRow:    { display: 'flex' as const, alignItems: 'center' as const, padding: '7px 12px', borderBottom: '0.5px solid #1e1d1b' },
  fieldLabel:  { fontSize: '9px', textTransform: 'uppercase' as const, letterSpacing: '0.06em', color: '#4a4846', width: '120px', flexShrink: 0 },
  fieldValue:  { fontSize: '12px', color: '#c8c4be', fontWeight: '500' as const },
  fieldEmpty:  { fontSize: '11px', color: '#2e2c2a', fontStyle: 'italic' as const },
  fieldInput:  { fontFamily: 'DM Mono, monospace', fontSize: '12px', background: 'transparent', border: 'none', borderBottom: '1px solid #2e2c2a', color: '#e8e4de', outline: 'none', flex: 1, padding: '1px 4px' },
  fieldSelect: { fontFamily: 'DM Mono, monospace', fontSize: '12px', background: '#1a1917', border: 'none', borderBottom: '1px solid #2e2c2a', color: '#e8e4de', outline: 'none', flex: 1, padding: '1px 4px' },
  cardFoot:    { display: 'flex' as const, alignItems: 'center' as const, justifyContent: 'space-between' as const, padding: '7px 12px', borderTop: '0.5px solid #252422', background: '#1e1c18' },
  badgeSaved:  { fontSize: '9px', background: '#0a2318', color: '#1D9E75', padding: '2px 8px', borderRadius: '10px' },
  badgeEdit:   { fontSize: '9px', background: '#2a1800', color: '#EF9F27', padding: '2px 8px', borderRadius: '10px' },
  btnEdit:     { fontFamily: 'DM Mono, monospace', fontSize: '10px', padding: '3px 10px', borderRadius: '5px', border: '0.5px solid #2e2c2a', background: 'none', color: '#7a7672', cursor: 'pointer' },
  btnSave:     { fontFamily: 'DM Mono, monospace', fontSize: '10px', padding: '3px 14px', borderRadius: '5px', border: 'none', background: '#BA7517', color: '#fff', cursor: 'pointer' },
  btnCancel:   { fontFamily: 'DM Mono, monospace', fontSize: '10px', padding: '3px 10px', borderRadius: '5px', border: '0.5px solid #252422', background: 'none', color: '#5a5854', cursor: 'pointer' },
  btnDel:      { fontFamily: 'DM Mono, monospace', fontSize: '10px', border: 'none', background: 'none', color: '#3a3835', cursor: 'pointer' },
  balOk:       { fontSize: '10px', padding: '5px 10px', borderRadius: '5px', background: '#0a2318', color: '#1D9E75', margin: '0 12px 8px' },
  balWarn:     { fontSize: '10px', padding: '5px 10px', borderRadius: '5px', background: '#2a1800', color: '#EF9F27', margin: '0 12px 8px' },
}

function TritaradaCard({ triturada, pomes, onDelete, onSave, compact }: {
  triturada: Partial<TritaradaAmbOrigen> & { _local?: boolean }
  pomes: Poma[]
  onDelete: () => void
  onSave: (t: Partial<TritaradaAmbOrigen>) => void
  compact?: boolean
}) {
  const [editing, setEditing] = useState(!triturada.id)
  const [form, setForm] = useState(triturada)
  const [origens, setOrigens] = useState<{ poma_id: number; pes_kg: number }[]>(
    triturada.triturada_origen?.map(o => ({ poma_id: o.poma_id, pes_kg: o.pes_kg })) ?? []
  )
  const [saving, setSaving] = useState(false)

  const totalEntrada = origens.reduce((s, o) => s + (o.pes_kg || 0), 0)
  const balancOk = form.pes_kg ? Math.abs(totalEntrada - form.pes_kg) < 0.1 : false

  function addOrigen() {
    if (pomes.length === 0) return
    setOrigens(o => [...o, { poma_id: pomes[0].id, pes_kg: 0 }])
  }

  function updateOrigen(idx: number, field: string, value: unknown) {
    setOrigens(o => o.map((item, i) => i === idx ? { ...item, [field]: value } : item))
  }

  async function save() {
    setSaving(true)
    await onSave({ ...form, triturada_origen: origens.map(o => ({ ...o, triturada_id: triturada.id ?? 0, id: 0 })) })
    setSaving(false)
    setEditing(false)
  }

  if (compact) return (
    <div style={S.card}>
      <div style={S.cardHead}>
        <span style={S.cardId}>{form.codi}</span>
        {form.pes_kg && <span style={{ fontSize: '10px', color: '#5a5854' }}>{form.pes_kg} kg</span>}
      </div>
      {[
        { label: 'Passades', value: form.passades },
        { label: 'Pes',      value: form.pes_kg ? `${form.pes_kg} kg` : null },
        { label: 'Origens',  value: origens.length > 0 ? `${origens.length} poma(es)` : null },
      ].map(f => (
        <div key={f.label} style={S.fieldRow}>
          <span style={S.fieldLabel}>{f.label}</span>
          <span style={f.value != null ? S.fieldValue : S.fieldEmpty}>{f.value ?? '—'}</span>
        </div>
      ))}
    </div>
  )

  if (!editing) return (
    <div style={S.card}>
      <div style={S.cardHead}>
        <span style={S.cardId}>{form.codi}</span>
        <span style={S.badgeSaved}>desat</span>
      </div>
      {[
        { label: 'Passades',      value: form.passades },
        { label: 'Pes total (kg)', value: form.pes_kg },
        { label: 'Notes',         value: form.notes },
      ].map(f => (
        <div key={f.label} style={S.fieldRow}>
          <span style={S.fieldLabel}>{f.label}</span>
          <span style={f.value != null ? S.fieldValue : S.fieldEmpty}>{f.value ?? '—'}</span>
        </div>
      ))}
      <div style={{ padding: '7px 12px', borderBottom: '0.5px solid #1e1d1b' }}>
        <div style={{ ...S.fieldLabel, marginBottom: '6px' }}>Origen (pomes)</div>
        {origens.length === 0 && <span style={S.fieldEmpty}>—</span>}
        {origens.map((o, i) => {
          const poma = pomes.find(p => p.id === o.poma_id)
          return (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '3px' }}>
              <span style={{ color: '#7a7672' }}>{poma?.codi} — {poma?.varietat}</span>
              <span style={{ color: '#c8c4be', fontWeight: '500' }}>{o.pes_kg} kg</span>
            </div>
          )
        })}
      </div>
      <div style={balancOk ? S.balOk : S.balWarn}>
        Entrada: {totalEntrada} kg {form.pes_kg ? `/ declarat: ${form.pes_kg} kg` : ''} {balancOk ? '✓' : '⚠ revisa els pesos'}
      </div>
      <div style={S.cardFoot}>
        <button style={S.btnDel} onClick={onDelete} onMouseOver={e => (e.currentTarget.style.color='#E24B4A')} onMouseOut={e => (e.currentTarget.style.color='#3a3835')}>eliminar</button>
        <button style={S.btnEdit} onClick={() => setEditing(true)}>Editar</button>
      </div>
    </div>
  )

  return (
    <div style={S.cardEditing}>
      <div style={S.cardHead}>
        <span style={S.cardId}>{form.codi}</span>
        <span style={S.badgeEdit}>editant</span>
      </div>
      {[
        { label: 'Passades',       field: 'passades', type: 'number' },
        { label: 'Pes total (kg)', field: 'pes_kg',   type: 'number' },
        { label: 'Notes',          field: 'notes',    type: 'text'   },
      ].map(f => (
        <div key={f.field} style={S.fieldRow}>
          <span style={S.fieldLabel}>{f.label}</span>
          <input
            style={S.fieldInput}
            type={f.type}
            value={(form as Record<string, unknown>)[f.field] as string ?? ''}
            onChange={e => setForm(fm => ({ ...fm, [f.field]: f.type === 'number' ? parseFloat(e.target.value) || null : e.target.value }))}
          />
        </div>
      ))}
      <div style={{ padding: '8px 12px', borderBottom: '0.5px solid #1e1d1b' }}>
        <div style={{ ...S.fieldLabel, marginBottom: '8px' }}>Origen (pomes)</div>
        {origens.map((o, i) => (
          <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px' }}>
            <select
              style={{ ...S.fieldSelect, flex: 2 }}
              value={o.poma_id}
              onChange={e => updateOrigen(i, 'poma_id', parseInt(e.target.value))}
            >
              {pomes.map(p => <option key={p.id} value={p.id}>{p.codi} — {p.varietat}</option>)}
            </select>
            <input
              style={{ ...S.fieldInput, width: '60px', flex: 'none' }}
              type="number"
              value={o.pes_kg || ''}
              placeholder="kg"
              onChange={e => updateOrigen(i, 'pes_kg', parseFloat(e.target.value) || 0)}
            />
            <span style={{ fontSize: '10px', color: '#4a4846' }}>kg</span>
            <button onClick={() => setOrigens(o => o.filter((_, j) => j !== i))} style={{ ...S.btnDel, fontSize: '12px' }}>✕</button>
          </div>
        ))}
        <button onClick={addOrigen} style={{ fontSize: '10px', color: '#BA7517', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'DM Mono, monospace', marginTop: '4px' }}>
          + Afegir origen
        </button>
      </div>
      <div style={balancOk ? S.balOk : S.balWarn}>
        Entrada: {totalEntrada} kg {form.pes_kg ? `/ declarat: ${form.pes_kg} kg` : ''} {balancOk ? '✓' : '⚠ revisa els pesos'}
      </div>
      <div style={S.cardFoot}>
        <button style={S.btnDel} onClick={onDelete}>eliminar</button>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button style={S.btnCancel} onClick={() => setEditing(false)}>Cancel·lar</button>
          <button style={S.btnSave} onClick={save} disabled={saving}>{saving ? 'Desant...' : 'Desar'}</button>
        </div>
      </div>
    </div>
  )
}

export default function FaseTriturat({ data, compact }: Props) {
  const router = useRouter()
  const [triturades, setTriturades] = useState<(Partial<TritaradaAmbOrigen> & { _local?: boolean })[]>(data.triturades)

  function addTriturada() {
    setTriturades(t => [...t, { codi: `T${t.length + 1}`, jornada_id: data.jornada.id, passades: 1, triturada_origen: [], _local: true }])
  }

  async function saveTriturada(idx: number, form: Partial<TritaradaAmbOrigen>) {
    const t = triturades[idx]
    const origens = form.triturada_origen ?? []
    if (t.id) {
      await supabase.from('triturada').update({ passades: form.passades, pes_kg: form.pes_kg, notes: form.notes }).eq('id', t.id)
      await supabase.from('triturada_origen').delete().eq('triturada_id', t.id)
      if (origens.length > 0) {
        await supabase.from('triturada_origen').insert(origens.map(o => ({ triturada_id: t.id!, poma_id: o.poma_id, pes_kg: o.pes_kg })))
      }
    } else {
      const { data: nova } = await supabase.from('triturada').insert({
        jornada_id: data.jornada.id, codi: form.codi!, passades: form.passades ?? 1, pes_kg: form.pes_kg, notes: form.notes,
      }).select().single()
      if (nova && origens.length > 0) {
        await supabase.from('triturada_origen').insert(origens.map(o => ({ triturada_id: nova.id, poma_id: o.poma_id, pes_kg: o.pes_kg })))
      }
      if (nova) setTriturades(tr => tr.map((item, i) => i === idx ? { ...nova, triturada_origen: [], _local: false } : item))
    }
    router.refresh()
  }

  async function deleteTriturada(idx: number) {
    const t = triturades[idx]
    if (t.id) { await supabase.from('triturada').delete().eq('id', t.id); router.refresh() }
    setTriturades(tr => tr.filter((_, i) => i !== idx))
  }

  if (compact) return (
    <div>
      {triturades.length === 0 && <div style={{ fontSize: '10px', color: '#3a3835', padding: '8px 12px' }}>Cap triturada</div>}
      {triturades.map((t, idx) => (
        <TritaradaCard key={t.id ?? `local-${idx}`} triturada={t} pomes={data.pomes} compact
          onDelete={() => deleteTriturada(idx)} onSave={f => saveTriturada(idx, f)} />
      ))}
    </div>
  )

  return (
    <div style={{ maxWidth: '460px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <span style={{ fontSize: '9px', color: '#4a4846', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Triturat</span>
        <button onClick={addTriturada} style={{ fontSize: '10px', color: '#BA7517', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'DM Mono, monospace' }}>+ Afegir triturada</button>
      </div>
      {triturades.length === 0 && (
        <div style={{ border: '0.5px dashed #252422', borderRadius: '8px', padding: '32px', textAlign: 'center', color: '#3a3835', fontSize: '12px' }}>
          Cap triturada afegida
        </div>
      )}
      {triturades.map((t, idx) => (
        <TritaradaCard key={t.id ?? `local-${idx}`} triturada={t} pomes={data.pomes}
          onDelete={() => deleteTriturada(idx)} onSave={f => saveTriturada(idx, f)} />
      ))}
    </div>
  )
}
