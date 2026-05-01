'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { Poma, TritaradaOrigen } from '@/lib/types'

interface Props {
  data: {
    jornada: { id: number; data: string }
    pomes: Poma[]
    triturades: { triturada_origen: TritaradaOrigen[] }[]
  }
  compact?: boolean
}

const S = {
  card:        { background: '#1a1917', border: '0.5px solid #252422', borderRadius: '8px', overflow: 'hidden' as const, marginBottom: '8px' },
  cardEditing: { background: '#1a1917', border: '0.5px solid #BA7517', borderRadius: '8px', overflow: 'hidden' as const, marginBottom: '8px' },
  cardHead:    { display: 'flex' as const, alignItems: 'center' as const, justifyContent: 'space-between' as const, padding: '7px 12px', borderBottom: '0.5px solid #252422', background: '#141412' },
  cardId:      { fontSize: '11px', fontWeight: '500' as const, color: '#c8c4be', background: '#252422', padding: '2px 8px', borderRadius: '4px' },
  fieldRow:    { display: 'flex' as const, alignItems: 'center' as const, padding: '7px 12px', borderBottom: '0.5px solid #1e1d1b' },
  fieldLabel:  { fontSize: '9px', textTransform: 'uppercase' as const, letterSpacing: '0.06em', color: '#4a4846', width: '120px', flexShrink: 0 },
  fieldValue:  { fontSize: '12px', color: '#c8c4be', fontWeight: '500' as const },
  fieldEmpty:  { fontSize: '11px', color: '#2e2c2a', fontStyle: 'italic' as const },
  fieldInput:  { fontFamily: 'DM Mono, monospace', fontSize: '12px', background: 'transparent', border: 'none', borderBottom: '1px solid #2e2c2a', color: '#e8e4de', outline: 'none', flex: 1, padding: '1px 4px' },
  fieldSelect: { fontFamily: 'DM Mono, monospace', fontSize: '12px', background: '#1a1917', border: 'none', borderBottom: '1px solid #2e2c2a', color: '#e8e4de', outline: 'none', flex: 1, padding: '1px 4px' },
  cardFoot:    { display: 'flex' as const, alignItems: 'center' as const, justifyContent: 'space-between' as const, padding: '7px 12px', borderTop: '0.5px solid #252422', background: '#141412' },
  badgeSaved:  { fontSize: '9px', background: '#0a2318', color: '#1D9E75', padding: '2px 8px', borderRadius: '10px' },
  badgeEdit:   { fontSize: '9px', background: '#2a1800', color: '#EF9F27', padding: '2px 8px', borderRadius: '10px' },
  btnEdit:     { fontFamily: 'DM Mono, monospace', fontSize: '10px', padding: '3px 10px', borderRadius: '5px', border: '0.5px solid #2e2c2a', background: 'none', color: '#7a7672', cursor: 'pointer' },
  btnSave:     { fontFamily: 'DM Mono, monospace', fontSize: '10px', padding: '3px 14px', borderRadius: '5px', border: 'none', background: '#BA7517', color: '#fff', cursor: 'pointer' },
  btnCancel:   { fontFamily: 'DM Mono, monospace', fontSize: '10px', padding: '3px 10px', borderRadius: '5px', border: '0.5px solid #252422', background: 'none', color: '#5a5854', cursor: 'pointer' },
  btnDel:      { fontFamily: 'DM Mono, monospace', fontSize: '10px', border: 'none', background: 'none', color: '#3a3835', cursor: 'pointer' },
  balOk:       { fontSize: '10px', padding: '5px 10px', borderRadius: '5px', background: '#0a2318', color: '#1D9E75', margin: '0 12px 8px' },
  balWarn:     { fontSize: '10px', padding: '5px 10px', borderRadius: '5px', background: '#2a1800', color: '#EF9F27', margin: '0 12px 8px' },
}

function PomaCard({ poma, pesUsat, onDelete, onSave, compact }: {
  poma: Partial<Poma> & { _local?: boolean }
  pesUsat: number
  onDelete: () => void
  onSave: (p: Partial<Poma>) => void
  compact?: boolean
}) {
  const [editing, setEditing] = useState(!poma.id)
  const [form, setForm] = useState(poma)
  const [saving, setSaving] = useState(false)

  function update(field: string, value: unknown) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function save() {
    setSaving(true)
    await onSave(form)
    setSaving(false)
    setEditing(false)
  }

  const balancOk = form.pes_total_kg ? Math.abs(pesUsat - form.pes_total_kg) < 0.5 : false

  if (compact) return (
    <div style={S.card}>
      <div style={S.cardHead}>
        <span style={S.cardId}>{form.codi}</span>
        {pesUsat > 0 && <span style={{ fontSize: '10px', color: '#5a5854' }}>{pesUsat} kg</span>}
      </div>
      {[
        { label: 'Varietat', value: form.varietat },
        { label: 'Pes total', value: form.pes_total_kg ? `${form.pes_total_kg} kg` : null },
        { label: 'Pes usat', value: pesUsat > 0 ? `${pesUsat} kg` : null },
      ].map(f => (
        <div key={f.label} style={S.fieldRow}>
          <span style={S.fieldLabel}>{f.label}</span>
          <span style={f.value ? S.fieldValue : S.fieldEmpty}>{f.value ?? '—'}</span>
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
        { label: 'Varietat',       value: form.varietat },
        { label: 'Origen',         value: form.origen },
        { label: 'Maduració',      value: form.maduracio },
        { label: 'Càmera (mesos)', value: form.camera_mesos },
        { label: 'Pes total (kg)', value: form.pes_total_kg },
        { label: 'Pes usat (kg)',  value: pesUsat > 0 ? pesUsat : null },
      ].map(f => (
        <div key={f.label} style={S.fieldRow}>
          <span style={S.fieldLabel}>{f.label}</span>
          <span style={f.value != null ? S.fieldValue : S.fieldEmpty}>{f.value ?? '—'}</span>
        </div>
      ))}
      {pesUsat > 0 && form.pes_total_kg && (
        <div style={balancOk ? S.balOk : S.balWarn}>
          {balancOk ? `✓ ${pesUsat} kg usats de ${form.pes_total_kg} kg` : `⚠ ${pesUsat} kg usats vs ${form.pes_total_kg} kg totals`}
        </div>
      )}
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
        { label: 'Varietat',       field: 'varietat',      type: 'text'   },
        { label: 'Origen',         field: 'origen',        type: 'text'   },
        { label: 'Càmera (mesos)', field: 'camera_mesos',  type: 'number' },
        { label: 'Pes total (kg)', field: 'pes_total_kg',  type: 'number' },
      ].map(f => (
        <div key={f.field} style={S.fieldRow}>
          <span style={S.fieldLabel}>{f.label}</span>
          <input
            style={S.fieldInput}
            type={f.type}
            value={(form as Record<string, unknown>)[f.field] as string ?? ''}
            onChange={e => update(f.field, f.type === 'number' ? parseFloat(e.target.value) || null : e.target.value)}
          />
        </div>
      ))}
      <div style={S.fieldRow}>
        <span style={S.fieldLabel}>Maduració</span>
        <select style={S.fieldSelect} value={form.maduracio ?? ''} onChange={e => update('maduracio', e.target.value || null)}>
          <option value="">—</option>
          {['Verd','Punt','Passat'].map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>
      <div style={{ ...S.fieldRow, borderBottom: 'none' }}>
        <span style={S.fieldLabel}>Pes usat (kg)</span>
        <span style={{ fontSize: '11px', color: '#4a4846', fontStyle: 'italic' }}>
          {pesUsat > 0 ? `${pesUsat} kg — de les triturades` : 'calculat automàticament'}
        </span>
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

export default function FasePomes({ data, compact }: Props) {
  const router = useRouter()
  const [pomes, setPomes] = useState<(Partial<Poma> & { _local?: boolean })[]>(data.pomes)

  function getPesUsat(pomaId: number | undefined) {
    if (!pomaId) return 0
    return data.triturades.reduce((sum, t) => {
      return sum + t.triturada_origen
        .filter(o => o.poma_id === pomaId)
        .reduce((s, o) => s + (o.pes_kg || 0), 0)
    }, 0)
  }

  function addPoma() {
    setPomes(p => [...p, { codi: `Pom${p.length + 1}`, jornada_id: data.jornada.id, _local: true }])
  }

  async function savePoma(idx: number, form: Partial<Poma>) {
    const poma = pomes[idx]
    if (poma.id) {
      await supabase.from('poma').update({
        varietat: form.varietat, origen: form.origen, maduracio: form.maduracio,
        camera_mesos: form.camera_mesos, pes_total_kg: form.pes_total_kg,
      }).eq('id', poma.id)
    } else {
      const { data: nova } = await supabase.from('poma').insert({
        jornada_id: data.jornada.id, codi: form.codi!, varietat: form.varietat ?? '',
        origen: form.origen, maduracio: form.maduracio, camera_mesos: form.camera_mesos,
        pes_total_kg: form.pes_total_kg,
      }).select().single()
      if (nova) setPomes(p => p.map((item, i) => i === idx ? { ...nova } : item))
    }
    router.refresh()
  }

  async function deletePoma(idx: number) {
    const poma = pomes[idx]
    if (poma.id) { await supabase.from('poma').delete().eq('id', poma.id); router.refresh() }
    setPomes(p => p.filter((_, i) => i !== idx))
  }

  if (compact) return (
    <div>
      {pomes.map((poma, idx) => (
        <PomaCard key={poma.id ?? `local-${idx}`} poma={poma} compact
          pesUsat={getPesUsat(poma.id)}
          onDelete={() => deletePoma(idx)} onSave={f => savePoma(idx, f)} />
      ))}
      {pomes.length === 0 && <div style={{ fontSize: '10px', color: '#3a3835', padding: '8px 12px' }}>Cap poma</div>}
    </div>
  )

  return (
    <div style={{ maxWidth: '460px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <span style={{ fontSize: '9px', color: '#4a4846', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Pomes</span>
        <button onClick={addPoma} style={{ fontSize: '10px', color: '#BA7517', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'DM Mono, monospace' }}>+ Afegir varietat</button>
      </div>
      {pomes.length === 0 && (
        <div style={{ border: '0.5px dashed #252422', borderRadius: '8px', padding: '32px', textAlign: 'center', color: '#3a3835', fontSize: '12px' }}>
          Cap varietat afegida
        </div>
      )}
      {pomes.map((poma, idx) => (
        <PomaCard key={poma.id ?? `local-${idx}`} poma={poma}
          pesUsat={getPesUsat(poma.id)}
          onDelete={() => deletePoma(idx)} onSave={f => savePoma(idx, f)} />
      ))}
    </div>
  )
}
