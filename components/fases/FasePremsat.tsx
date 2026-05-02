'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { Premsa, PremsaOrigen, Triturada } from '@/lib/types'

type PremsaAmbOrigen = Premsa & { premsa_origen: PremsaOrigen[] }

interface Props {
  data: {
    jornada: { id: number }
    triturades: Triturada[]
    premses: PremsaAmbOrigen[]
  }
  compact?: boolean
}

const S = {
  card:        { background: '#1a1f1a', border: '0.5px solid #2a352a', borderRadius: '8px', overflow: 'hidden' as const, marginBottom: '8px' },
  cardEditing: { background: '#1a1f1a', border: '0.5px solid #4A8A4A', borderRadius: '8px', overflow: 'hidden' as const, marginBottom: '8px' },
  cardHead:    { display: 'flex' as const, alignItems: 'center' as const, justifyContent: 'space-between' as const, padding: '7px 12px', borderBottom: '0.5px solid #2a352a', background: '#121712' },
  cardId:      { fontSize: '11px', fontWeight: '500' as const, color: '#b8d4b8', background: '#2a352a', padding: '2px 8px', borderRadius: '4px' },
  fieldRow:    { display: 'flex' as const, alignItems: 'center' as const, padding: '7px 12px', borderBottom: '0.5px solid #1a1f1a' },
  fieldLabel:  { fontSize: '9px', textTransform: 'uppercase' as const, letterSpacing: '0.06em', color: '#4a5a4a', width: '120px', flexShrink: 0 },
  fieldValue:  { fontSize: '12px', color: '#b8d4b8', fontWeight: '500' as const },
  fieldEmpty:  { fontSize: '11px', color: '#2a352a', fontStyle: 'italic' as const },
  fieldInput:  { fontFamily: 'DM Mono, monospace', fontSize: '12px', background: 'transparent', border: 'none', borderBottom: '1px solid #2a352a', color: '#d8f4d8', outline: 'none', flex: 1, padding: '1px 4px' },
  fieldSelect: { fontFamily: 'DM Mono, monospace', fontSize: '12px', background: '#1a1f1a', border: 'none', borderBottom: '1px solid #2a352a', color: '#d8f4d8', outline: 'none', flex: 1, padding: '1px 4px' },
  cardFoot:    { display: 'flex' as const, alignItems: 'center' as const, justifyContent: 'space-between' as const, padding: '7px 12px', borderTop: '0.5px solid #2a352a', background: '#121712' },
  badgeSaved:  { fontSize: '9px', background: '#0a2318', color: '#1D9E75', padding: '2px 8px', borderRadius: '10px' },
  badgeEdit:   { fontSize: '9px', background: '#1a3a1a', color: '#4A8A4A', padding: '2px 8px', borderRadius: '10px' },
  btnEdit:     { fontFamily: 'DM Mono, monospace', fontSize: '10px', padding: '3px 10px', borderRadius: '5px', border: '0.5px solid #2a352a', background: 'none', color: '#6a8a6a', cursor: 'pointer' },
  btnSave:     { fontFamily: 'DM Mono, monospace', fontSize: '10px', padding: '3px 14px', borderRadius: '5px', border: 'none', background: '#4A8A4A', color: '#fff', cursor: 'pointer' },
  btnCancel:   { fontFamily: 'DM Mono, monospace', fontSize: '10px', padding: '3px 10px', borderRadius: '5px', border: '0.5px solid #2a352a', background: 'none', color: '#4a5a4a', cursor: 'pointer' },
  btnDel:      { fontFamily: 'DM Mono, monospace', fontSize: '10px', border: 'none', background: 'none', color: '#3a4a3a', cursor: 'pointer' },
  balOk:       { fontSize: '10px', padding: '5px 10px', borderRadius: '5px', background: '#0a2318', color: '#1D9E75', margin: '0 12px 8px' },
  balWarn:     { fontSize: '10px', padding: '5px 10px', borderRadius: '5px', background: '#2a1800', color: '#EF9F27', margin: '0 12px 8px' },
}

function PremsaCard({ premsa, triturades, onDelete, onSave, compact }: {
  premsa: Partial<PremsaAmbOrigen> & { _local?: boolean }
  triturades: Triturada[]
  onDelete: () => void
  onSave: (p: Partial<PremsaAmbOrigen>) => void
  compact?: boolean
}) {
  const [editing, setEditing] = useState(!premsa.id)
  const [form, setForm] = useState(premsa)
  const [origens, setOrigens] = useState<{ triturada_id: number; pes_kg: number }[]>(
    premsa.premsa_origen?.map(o => ({ triturada_id: o.triturada_id, pes_kg: o.pes_kg })) ?? []
  )
  const [saving, setSaving] = useState(false)

  const totalEntrada = origens.reduce((s, o) => s + (o.pes_kg || 0), 0)
  const eficiencia = totalEntrada > 0 && form.vol_prod_l ? ((form.vol_prod_l / totalEntrada) * 100).toFixed(1) : null
  const balancOk = form.vol_prod_l != null && totalEntrada > 0

  function addOrigen() {
    if (triturades.length === 0) return
    setOrigens(o => [...o, { triturada_id: triturades[0].id, pes_kg: 0 }])
  }

  function updateOrigen(idx: number, field: string, value: unknown) {
    setOrigens(o => o.map((item, i) => i === idx ? { ...item, [field]: value } : item))
  }

  async function save() {
    setSaving(true)
    await onSave({ ...form, premsa_origen: origens.map(o => ({ ...o, premsa_id: premsa.id ?? 0, id: 0 })) })
    setSaving(false)
    setEditing(false)
  }

  if (compact) return (
    <div style={S.card}>
      <div style={S.cardHead}>
        <span style={S.cardId}>{form.codi}</span>
        {form.vol_prod_l && <span style={{ fontSize: '10px', color: '#6a8a6a' }}>{form.vol_prod_l} l</span>}
      </div>
      {[
        { label: 'Pes entrada', value: totalEntrada > 0 ? `${totalEntrada} kg` : null },
        { label: 'Vol produït', value: form.vol_prod_l ? `${form.vol_prod_l} l` : null },
        { label: 'Eficiència',  value: eficiencia ? `${eficiencia} l/100kg` : null },
      ].map(f => (
        <div key={f.label} style={{ ...S.fieldRow, gap: '4px', overflow: 'hidden' }}>
          <span style={{ ...S.fieldLabel, width: '60px', flexShrink: 0 }}>{f.label}</span>
          <span style={{ ...(f.value ? S.fieldValue : S.fieldEmpty), overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
            {f.value ?? '—'}
          </span>
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
        { label: 'Pes entrada (kg)', value: totalEntrada > 0 ? totalEntrada : null },
        { label: 'Vol produït (l)',  value: form.vol_prod_l },
        { label: 'Vol usat (l)',     value: form.vol_usat_l },
        { label: 'Eficiència',       value: eficiencia ? `${eficiencia} l/100kg` : null },
      ].map(f => (
        <div key={f.label} style={S.fieldRow}>
          <span style={S.fieldLabel}>{f.label}</span>
          <span style={f.value != null ? S.fieldValue : S.fieldEmpty}>{f.value ?? '—'}</span>
        </div>
      ))}
      <div style={{ padding: '7px 12px', borderBottom: '0.5px solid #1a1f1a' }}>
        <div style={{ ...S.fieldLabel, marginBottom: '6px' }}>Origen (triturades)</div>
        {origens.length === 0 && <span style={S.fieldEmpty}>—</span>}
        {origens.map((o, i) => {
          const trit = triturades.find(t => t.id === o.triturada_id)
          return (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '3px' }}>
              <span style={{ color: '#6a8a6a' }}>{trit?.codi}</span>
              <span style={{ color: '#b8d4b8', fontWeight: '500' }}>{o.pes_kg} kg</span>
            </div>
          )
        })}
      </div>
      {balancOk && (
        <div style={S.balOk}>
          {totalEntrada} kg entrada → {form.vol_prod_l} l · Eff {eficiencia} l/100kg ✓
        </div>
      )}
      <div style={S.cardFoot}>
        <button style={S.btnDel} onClick={onDelete} onMouseOver={e => (e.currentTarget.style.color='#E24B4A')} onMouseOut={e => (e.currentTarget.style.color='#3a4a3a')}>eliminar</button>
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
        { label: 'Vol produït (l)', field: 'vol_prod_l', type: 'number' },
        { label: 'Vol usat (l)',    field: 'vol_usat_l', type: 'number' },
        { label: 'Notes',          field: 'notes',      type: 'text'   },
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
      <div style={{ ...S.fieldRow, borderBottom: 'none' }}>
        <span style={S.fieldLabel}>Eficiència</span>
        <span style={{ fontSize: '11px', color: '#4a5a4a', fontStyle: 'italic' }}>
          {eficiencia ? `${eficiencia} l/100kg` : 'automàtic'}
        </span>
      </div>
      <div style={{ padding: '8px 12px', borderBottom: '0.5px solid #1a1f1a' }}>
        <div style={{ ...S.fieldLabel, marginBottom: '8px' }}>Origen (triturades)</div>
        {origens.map((o, i) => (
          <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px' }}>
            <select
              style={{ ...S.fieldSelect, flex: 2 }}
              value={o.triturada_id}
              onChange={e => updateOrigen(i, 'triturada_id', parseInt(e.target.value))}
            >
              {triturades.map(t => <option key={t.id} value={t.id}>{t.codi}</option>)}
            </select>
            <input
              style={{ ...S.fieldInput, width: '60px', flex: 'none' }}
              type="number"
              value={o.pes_kg || ''}
              placeholder="kg"
              onChange={e => updateOrigen(i, 'pes_kg', parseFloat(e.target.value) || 0)}
            />
            <span style={{ fontSize: '10px', color: '#4a5a4a' }}>kg</span>
            <button onClick={() => setOrigens(o => o.filter((_, j) => j !== i))} style={{ ...S.btnDel, fontSize: '12px' }}>✕</button>
          </div>
        ))}
        <button onClick={addOrigen} style={{ fontSize: '10px', color: '#4A8A4A', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'DM Mono, monospace', marginTop: '4px' }}>
          + Afegir origen
        </button>
      </div>
      {balancOk && (
        <div style={S.balOk}>
          {totalEntrada} kg entrada → {form.vol_prod_l} l · Eff {eficiencia} l/100kg ✓
        </div>
      )}
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

export default function FasePremsat({ data, compact }: Props) {
  const router = useRouter()
  const [premses, setPremses] = useState<(Partial<PremsaAmbOrigen> & { _local?: boolean })[]>(data.premses)

  function addPremsa() {
    setPremses(p => [...p, { codi: `P${p.length + 1}`, jornada_id: data.jornada.id, premsa_origen: [], _local: true }])
  }

  async function savePremsa(idx: number, form: Partial<PremsaAmbOrigen>) {
    const p = premses[idx]
    const origens = form.premsa_origen ?? []
    if (p.id) {
      await supabase.from('premsa').update({ vol_prod_l: form.vol_prod_l, vol_usat_l: form.vol_usat_l, notes: form.notes }).eq('id', p.id)
      await supabase.from('premsa_origen').delete().eq('premsa_id', p.id)
      if (origens.length > 0) {
        const totalKg = origens.reduce((s, o) => s + (o.pes_kg || 0), 0)
        await supabase.from('premsa').update({ pes_kg: totalKg }).eq('id', p.id)
        await supabase.from('premsa_origen').insert(origens.map(o => ({ premsa_id: p.id!, triturada_id: o.triturada_id, pes_kg: o.pes_kg })))
      }
    } else {
      const totalKg = origens.reduce((s, o) => s + (o.pes_kg || 0), 0)
      const { data: nova } = await supabase.from('premsa').insert({
        jornada_id: data.jornada.id, codi: form.codi!, pes_kg: totalKg,
        vol_prod_l: form.vol_prod_l, vol_usat_l: form.vol_usat_l, notes: form.notes,
      }).select().single()
      if (nova && origens.length > 0) {
        await supabase.from('premsa_origen').insert(origens.map(o => ({ premsa_id: nova.id, triturada_id: o.triturada_id, pes_kg: o.pes_kg })))
      }
      if (nova) setPremses(pr => pr.map((item, i) => i === idx ? { ...nova, premsa_origen: [], _local: false } : item))
    }
    router.refresh()
  }

  async function deletePremsa(idx: number) {
    const p = premses[idx]
    if (p.id) { await supabase.from('premsa').delete().eq('id', p.id); router.refresh() }
    setPremses(pr => pr.filter((_, i) => i !== idx))
  }

  if (compact) return (
    <div>
      {premses.length === 0 && <div style={{ fontSize: '10px', color: '#3a4a3a', padding: '8px 12px' }}>Cap premsa</div>}
      {premses.map((p, idx) => (
        <PremsaCard key={p.id ?? `local-${idx}`} premsa={p} triturades={data.triturades} compact
          onDelete={() => deletePremsa(idx)} onSave={f => savePremsa(idx, f)} />
      ))}
    </div>
  )

  return (
    <div style={{ maxWidth: '460px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <span style={{ fontSize: '9px', color: '#4a5a4a', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Premsat</span>
        <button onClick={addPremsa} style={{ fontSize: '10px', color: '#4A8A4A', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'DM Mono, monospace' }}>+ Afegir premsa</button>
      </div>
      {premses.length === 0 && (
        <div style={{ border: '0.5px dashed #2a352a', borderRadius: '8px', padding: '32px', textAlign: 'center', color: '#3a4a3a', fontSize: '12px' }}>
          Cap premsa afegida
        </div>
      )}
      {premses.map((p, idx) => (
        <PremsaCard key={p.id ?? `local-${idx}`} premsa={p} triturades={data.triturades}
          onDelete={() => deletePremsa(idx)} onSave={f => savePremsa(idx, f)} />
      ))}
    </div>
  )
}
