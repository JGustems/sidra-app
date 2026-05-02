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
    ebullidors: { ebullidor_origen: { premsa_id: number; vol_l: number }[] }[]
    sucsDirectes: { suc_directe_origen: { premsa_id: number; vol_l: number }[] }[]
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
  autoField:   { fontSize: '11px', color: '#4a4846', fontStyle: 'italic' as const },
}

function PremsaCard({ premsa, triturades, volUsat, onDelete, onSave, compact }: {
  premsa: Partial<PremsaAmbOrigen> & { _local?: boolean }
  triturades: Triturada[]
  volUsat: number
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

  const pesTotal = origens.reduce((s, o) => s + (o.pes_kg || 0), 0)
  const eficiencia = pesTotal > 0 && form.vol_prod_l
    ? ((form.vol_prod_l / pesTotal) * 100).toFixed(1)
    : null
  const balancOk = form.vol_prod_l != null && volUsat <= form.vol_prod_l

  function addOrigen() {
    if (triturades.length === 0) return
    setOrigens(o => [...o, { triturada_id: triturades[0].id, pes_kg: 0 }])
  }

  function updateOrigen(idx: number, field: string, value: unknown) {
    setOrigens(o => o.map((item, i) => i === idx ? { ...item, [field]: value } : item))
  }

  async function save() {
    setSaving(true)
    await onSave({ ...form, pes_kg: pesTotal, premsa_origen: origens.map(o => ({ ...o, premsa_id: premsa.id ?? 0, id: 0 })) })
    setSaving(false)
    setEditing(false)
  }

  if (compact) return (
  <div style={S.card}>
    <div style={S.cardHead}>
      <span style={S.cardId}>{form.codi}</span>
      {form.vol_prod_l && <span style={{ fontSize: '10px', color: '#5a5854' }}>{form.vol_prod_l} l</span>}
    </div>
    {[
      { label: 'Pes entrada', value: pesTotal > 0 ? `${pesTotal} kg` : null },
      { label: 'Vol produït', value: form.vol_prod_l ? `${form.vol_prod_l} l` : null },
      { label: 'Vol usat',    value: volUsat > 0 ? `${volUsat} l` : null },
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
      <div style={S.fieldRow}>
        <span style={S.fieldLabel}>Pes entrada (kg)</span>
        <span style={pesTotal > 0 ? S.fieldValue : S.fieldEmpty}>
          {pesTotal > 0 ? `${pesTotal} kg` : '—'}
          <span style={{ fontSize: '9px', color: '#4a4846', marginLeft: '6px' }}>automàtic</span>
        </span>
      </div>
      <div style={S.fieldRow}>
        <span style={S.fieldLabel}>Vol produït (l)</span>
        <span style={form.vol_prod_l != null ? S.fieldValue : S.fieldEmpty}>{form.vol_prod_l ?? '—'}</span>
      </div>
      <div style={S.fieldRow}>
        <span style={S.fieldLabel}>Vol usat (l)</span>
        <span style={volUsat > 0 ? S.fieldValue : S.fieldEmpty}>
          {volUsat > 0 ? `${volUsat} l` : '—'}
          <span style={{ fontSize: '9px', color: '#4a4846', marginLeft: '6px' }}>de fases següents</span>
        </span>
      </div>
      <div style={S.fieldRow}>
        <span style={S.fieldLabel}>Eficiència</span>
        <span style={eficiencia ? S.fieldValue : S.fieldEmpty}>
          {eficiencia ? `${eficiencia} l/100kg` : '—'}
        </span>
      </div>
      <div style={S.fieldRow}>
        <span style={S.fieldLabel}>Notes</span>
        <span style={form.notes ? S.fieldValue : S.fieldEmpty}>{form.notes ?? '—'}</span>
      </div>
      <div style={{ padding: '7px 12px', borderBottom: '0.5px solid #1e1d1b' }}>
        <div style={{ ...S.fieldLabel, marginBottom: '6px' }}>Origen (triturades)</div>
        {origens.length === 0 && <span style={S.fieldEmpty}>—</span>}
        {origens.map((o, i) => {
          const trit = triturades.find(t => t.id === o.triturada_id)
          return (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '3px' }}>
              <span style={{ color: '#7a7672' }}>{trit?.codi}</span>
              <span style={{ color: '#c8c4be', fontWeight: '500' }}>{o.pes_kg} kg</span>
            </div>
          )
        })}
      </div>
      {form.vol_prod_l != null && (
        <div style={balancOk ? S.balOk : S.balWarn}>
          {pesTotal} kg → {form.vol_prod_l} l produïts · {volUsat} l usats
          {eficiencia && ` · Eff ${eficiencia} l/100kg`} {balancOk ? '✓' : '⚠'}
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
      <div style={S.fieldRow}>
        <span style={S.fieldLabel}>Pes entrada (kg)</span>
        <span style={S.autoField}>{pesTotal > 0 ? `${pesTotal} kg — suma origens` : 'calculat automàticament'}</span>
      </div>
      <div style={S.fieldRow}>
        <span style={S.fieldLabel}>Vol produït (l)</span>
        <input
          style={S.fieldInput}
          type="number"
          value={form.vol_prod_l ?? ''}
          onChange={e => setForm(fm => ({ ...fm, vol_prod_l: parseFloat(e.target.value) || null }))}
        />
      </div>
      <div style={S.fieldRow}>
        <span style={S.fieldLabel}>Vol usat (l)</span>
        <span style={S.autoField}>{volUsat > 0 ? `${volUsat} l — de fases següents` : 'calculat automàticament'}</span>
      </div>
      <div style={S.fieldRow}>
        <span style={S.fieldLabel}>Eficiència</span>
        <span style={S.autoField}>{eficiencia ? `${eficiencia} l/100kg` : 'automàtic'}</span>
      </div>
      <div style={S.fieldRow}>
        <span style={S.fieldLabel}>Notes</span>
        <input
          style={S.fieldInput}
          type="text"
          value={form.notes ?? ''}
          onChange={e => setForm(fm => ({ ...fm, notes: e.target.value || null }))}
        />
      </div>
      <div style={{ padding: '8px 12px', borderBottom: '0.5px solid #1e1d1b' }}>
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
            <span style={{ fontSize: '10px', color: '#4a4846' }}>kg</span>
            <button onClick={() => setOrigens(o => o.filter((_, j) => j !== i))} style={{ ...S.btnDel, fontSize: '12px' }}>✕</button>
          </div>
        ))}
        <button onClick={addOrigen} style={{ fontSize: '10px', color: '#BA7517', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'DM Mono, monospace', marginTop: '4px' }}>
          + Afegir origen
        </button>
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

export default function FasePremsat({ data, compact }: Props) {
  const router = useRouter()
  const [premses, setPremses] = useState<(Partial<PremsaAmbOrigen> & { _local?: boolean })[]>(data.premses)

  function getVolUsat(premsaId: number | undefined) {
    if (!premsaId) return 0
    const deEbullidors = data.ebullidors.reduce((sum, b) => {
      return sum + b.ebullidor_origen
        .filter(o => o.premsa_id === premsaId)
        .reduce((s, o) => s + (o.vol_l || 0), 0)
    }, 0)
    const deSucsDirectes = data.sucsDirectes.reduce((sum, s) => {
      return sum + s.suc_directe_origen
        .filter(o => o.premsa_id === premsaId)
        .reduce((s2, o) => s2 + (o.vol_l || 0), 0)
    }, 0)
    return deEbullidors + deSucsDirectes
  }

  function addPremsa() {
    setPremses(p => [...p, { codi: `P${p.length + 1}`, jornada_id: data.jornada.id, premsa_origen: [], _local: true }])
  }

  async function savePremsa(idx: number, form: Partial<PremsaAmbOrigen>) {
    const p = premses[idx]
    const origens = form.premsa_origen ?? []
    const totalKg = origens.reduce((s, o) => s + (o.pes_kg || 0), 0)

    if (p.id) {
      await supabase.from('premsa').update({ pes_kg: totalKg, vol_prod_l: form.vol_prod_l, notes: form.notes }).eq('id', p.id)
      await supabase.from('premsa_origen').delete().eq('premsa_id', p.id)
      if (origens.length > 0) {
        await supabase.from('premsa_origen').insert(origens.map(o => ({ premsa_id: p.id!, triturada_id: o.triturada_id, pes_kg: o.pes_kg })))
      }
    } else {
      const { data: nova } = await supabase.from('premsa').insert({
        jornada_id: data.jornada.id, codi: form.codi!, pes_kg: totalKg,
        vol_prod_l: form.vol_prod_l, notes: form.notes,
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
      {premses.length === 0 && <div style={{ fontSize: '10px', color: '#3a3835', padding: '8px 12px' }}>Cap premsa</div>}
      {premses.map((p, idx) => (
        <PremsaCard key={p.id ?? `local-${idx}`} premsa={p} triturades={data.triturades} compact
          volUsat={getVolUsat(p.id)}
          onDelete={() => deletePremsa(idx)} onSave={f => savePremsa(idx, f)} />
      ))}
    </div>
  )

  return (
    <div style={{ maxWidth: '460px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <span style={{ fontSize: '9px', color: '#4a4846', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Premsat</span>
        <button onClick={addPremsa} style={{ fontSize: '10px', color: '#BA7517', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'DM Mono, monospace' }}>+ Afegir premsa</button>
      </div>
      {premses.length === 0 && (
        <div style={{ border: '0.5px dashed #252422', borderRadius: '8px', padding: '32px', textAlign: 'center', color: '#3a3835', fontSize: '12px' }}>
          Cap premsa afegida
        </div>
      )}
      {premses.map((p, idx) => (
        <PremsaCard key={p.id ?? `local-${idx}`} premsa={p} triturades={data.triturades}
          volUsat={getVolUsat(p.id)}
          onDelete={() => deletePremsa(idx)} onSave={f => savePremsa(idx, f)} />
      ))}
    </div>
  )
}
