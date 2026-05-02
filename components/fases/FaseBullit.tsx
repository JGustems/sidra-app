'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { Ebullidor, EbullidorOrigen, SucDirecte, SucDirecteOrigen, Premsa } from '@/lib/types'

type EbullidorAmbOrigen = Ebullidor & { ebullidor_origen: EbullidorOrigen[] }
type SucDirecteAmbOrigen = SucDirecte & { suc_directe_origen: SucDirecteOrigen[] }

interface Props {
  data: {
    jornada: { id: number }
    premses: Premsa[]
    ebullidors: EbullidorAmbOrigen[]
    sucsDirectes: SucDirecteAmbOrigen[]
    fermentadors: { fermentador_origen: { ebullidor_id: number | null; suc_directe_id: number | null; vol_l: number }[] }[]
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
  sectionHead: { fontSize: '9px', textTransform: 'uppercase' as const, letterSpacing: '0.06em', color: '#4a4846', marginBottom: '8px' },
}

function EbullidorCard({ ebullidor, premses, volUsat, onDelete, onSave, compact }: {
  ebullidor: Partial<EbullidorAmbOrigen> & { _local?: boolean }
  premses: Premsa[]
  volUsat: number
  onDelete: () => void
  onSave: (e: Partial<EbullidorAmbOrigen>) => void
  compact?: boolean
}) {
  const [editing, setEditing] = useState(!ebullidor.id)
  const [form, setForm] = useState(ebullidor)
  const [origens, setOrigens] = useState<{ premsa_id: number; vol_l: number }[]>(
    ebullidor.ebullidor_origen?.map(o => ({ premsa_id: o.premsa_id, vol_l: o.vol_l })) ?? []
  )
  const [saving, setSaving] = useState(false)

  const volEntrada = origens.reduce((s, o) => s + (o.vol_l || 0), 0)
  const balancOk = form.vol_final_l != null && volUsat <= (form.vol_final_l ?? 0)

  function addOrigen() {
    if (premses.length === 0) return
    setOrigens(o => [...o, { premsa_id: premses[0].id, vol_l: 0 }])
  }

  function updateOrigen(idx: number, field: string, value: unknown) {
    setOrigens(o => o.map((item, i) => i === idx ? { ...item, [field]: value } : item))
  }

  async function save() {
    setSaving(true)
    await onSave({ ...form, vol_inicial_l: volEntrada, ebullidor_origen: origens.map(o => ({ ...o, ebullidor_id: ebullidor.id ?? 0, id: 0 })) })
    setSaving(false)
    setEditing(false)
  }

  if (compact) return (
    <div style={S.card}>
      <div style={S.cardHead}>
        <span style={S.cardId}>{form.codi}</span>
        {form.vol_final_l && <span style={{ fontSize: '10px', color: '#5a5854' }}>{form.vol_final_l} l</span>}
      </div>
      {[
        { label: 'Vol entrada', value: volEntrada > 0 ? `${volEntrada} l` : null },
        { label: 'Vol final',   value: form.vol_final_l ? `${form.vol_final_l} l` : null },
        { label: 'T màx',       value: form.t_max_c ? `${form.t_max_c}°C` : null },
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
        { label: 'Vol entrada (l)', value: volEntrada > 0 ? `${volEntrada} l` : null, auto: true },
        { label: 'Vol final (l)',   value: form.vol_final_l },
        { label: 'Vol usat (l)',    value: volUsat > 0 ? volUsat : null, auto: true },
        { label: 'T inicial (°C)', value: form.t_inicial_c },
        { label: 'T màx (°C)',     value: form.t_max_c },
        { label: 'T final (°C)',   value: form.t_final_c },
        { label: 'Potència (W)',   value: form.pot_w },
        { label: 'Hora inici',     value: form.hora_inici },
        { label: 'Hora final',     value: form.hora_final },
        { label: 'Temps calor',    value: form.temps_calor_min ? `${form.temps_calor_min} min` : null },
        { label: 'Temps fred',     value: form.temps_fred_min ? `${form.temps_fred_min} min` : null },
      ].map(f => (
        <div key={f.label} style={S.fieldRow}>
          <span style={S.fieldLabel}>{f.label}</span>
          <span style={f.value != null ? S.fieldValue : S.fieldEmpty}>
            {f.value ?? '—'}
            {f.auto && f.value != null && <span style={{ fontSize: '9px', color: '#4a4846', marginLeft: '6px' }}>automàtic</span>}
          </span>
        </div>
      ))}
      <div style={{ padding: '7px 12px', borderBottom: '0.5px solid #1e1d1b' }}>
        <div style={{ ...S.sectionHead }}>Origen (premses)</div>
        {origens.length === 0 && <span style={S.fieldEmpty}>—</span>}
        {origens.map((o, i) => {
          const premsa = premses.find(p => p.id === o.premsa_id)
          return (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '3px' }}>
              <span style={{ color: '#7a7672' }}>{premsa?.codi}</span>
              <span style={{ color: '#c8c4be', fontWeight: '500' }}>{o.vol_l} l</span>
            </div>
          )
        })}
      </div>
      {form.vol_final_l != null && (
        <div style={balancOk ? S.balOk : S.balWarn}>
          {volEntrada} l entrada · {form.vol_final_l} l final · {volUsat} l usats {balancOk ? '✓' : '⚠'}
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
        <span style={S.fieldLabel}>Vol entrada (l)</span>
        <span style={S.autoField}>{volEntrada > 0 ? `${volEntrada} l — suma origens` : 'calculat automàticament'}</span>
      </div>
      {[
        { label: 'Vol final (l)',   field: 'vol_final_l',    type: 'number' },
        { label: 'T inicial (°C)', field: 't_inicial_c',    type: 'number' },
        { label: 'T màx (°C)',     field: 't_max_c',        type: 'number' },
        { label: 'T final (°C)',   field: 't_final_c',      type: 'number' },
        { label: 'Potència (W)',   field: 'pot_w',          type: 'number' },
        { label: 'Hora inici',     field: 'hora_inici',     type: 'time'   },
        { label: 'Hora final',     field: 'hora_final',     type: 'time'   },
        { label: 'Temps calor',    field: 'temps_calor_min',type: 'number' },
        { label: 'Temps fred',     field: 'temps_fred_min', type: 'number' },
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
        <div style={S.sectionHead}>Origen (premses)</div>
        {origens.map((o, i) => (
          <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px' }}>
            <select
              style={{ ...S.fieldSelect, flex: 2 }}
              value={o.premsa_id}
              onChange={e => updateOrigen(i, 'premsa_id', parseInt(e.target.value))}
            >
              {premses.map(p => <option key={p.id} value={p.id}>{p.codi}</option>)}
            </select>
            <input
              style={{ ...S.fieldInput, width: '60px', flex: 'none' }}
              type="number"
              value={o.vol_l || ''}
              placeholder="l"
              onChange={e => updateOrigen(i, 'vol_l', parseFloat(e.target.value) || 0)}
            />
            <span style={{ fontSize: '10px', color: '#4a4846' }}>l</span>
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

function SucDirecteCard({ suc, premses, volUsat, onDelete, onSave, compact }: {
  suc: Partial<SucDirecteAmbOrigen> & { _local?: boolean }
  premses: Premsa[]
  volUsat: number
  onDelete: () => void
  onSave: (s: Partial<SucDirecteAmbOrigen>) => void
  compact?: boolean
}) {
  const [editing, setEditing] = useState(!suc.id)
  const [form, setForm] = useState(suc)
  const [origens, setOrigens] = useState<{ premsa_id: number; vol_l: number }[]>(
    suc.suc_directe_origen?.map(o => ({ premsa_id: o.premsa_id, vol_l: o.vol_l })) ?? []
  )
  const [saving, setSaving] = useState(false)

  const volEntrada = origens.reduce((s, o) => s + (o.vol_l || 0), 0)

  async function save() {
    setSaving(true)
    await onSave({ ...form, vol_l: volEntrada, suc_directe_origen: origens.map(o => ({ ...o, suc_directe_id: suc.id ?? 0, id: 0 })) })
    setSaving(false)
    setEditing(false)
  }

  if (compact) return (
    <div style={{ ...S.card, borderLeft: '2px solid #1D9E75' }}>
      <div style={S.cardHead}>
        <span style={{ ...S.cardId, background: '#0a2318', color: '#1D9E75' }}>{form.codi} — directe</span>
        {volEntrada > 0 && <span style={{ fontSize: '10px', color: '#1D9E75' }}>{volEntrada} l</span>}
      </div>
      {[
        { label: 'Vol',    value: volEntrada > 0 ? `${volEntrada} l` : null },
        { label: 'Vol usat', value: volUsat > 0 ? `${volUsat} l` : null },
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
    <div style={{ ...S.card, borderLeft: '2px solid #1D9E75' }}>
      <div style={S.cardHead}>
        <span style={{ ...S.cardId, background: '#0a2318', color: '#1D9E75' }}>{form.codi} — suc directe</span>
        <span style={S.badgeSaved}>desat</span>
      </div>
      <div style={S.fieldRow}>
        <span style={S.fieldLabel}>Vol (l)</span>
        <span style={volEntrada > 0 ? S.fieldValue : S.fieldEmpty}>
          {volEntrada > 0 ? `${volEntrada} l` : '—'}
          <span style={{ fontSize: '9px', color: '#4a4846', marginLeft: '6px' }}>automàtic</span>
        </span>
      </div>
      <div style={S.fieldRow}>
        <span style={S.fieldLabel}>Vol usat (l)</span>
        <span style={volUsat > 0 ? S.fieldValue : S.fieldEmpty}>
          {volUsat > 0 ? `${volUsat} l` : '—'}
          <span style={{ fontSize: '9px', color: '#4a4846', marginLeft: '6px' }}>de fermentadors</span>
        </span>
      </div>
      <div style={S.fieldRow}>
        <span style={S.fieldLabel}>Notes</span>
        <span style={form.notes ? S.fieldValue : S.fieldEmpty}>{form.notes ?? '—'}</span>
      </div>
      <div style={{ padding: '7px 12px', borderBottom: '0.5px solid #1e1d1b' }}>
        <div style={S.sectionHead}>Origen (premses)</div>
        {origens.map((o, i) => {
          const premsa = premses.find(p => p.id === o.premsa_id)
          return (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '3px' }}>
              <span style={{ color: '#7a7672' }}>{premsa?.codi}</span>
              <span style={{ color: '#c8c4be', fontWeight: '500' }}>{o.vol_l} l</span>
            </div>
          )
        })}
      </div>
      <div style={S.cardFoot}>
        <button style={S.btnDel} onClick={onDelete} onMouseOver={e => (e.currentTarget.style.color='#E24B4A')} onMouseOut={e => (e.currentTarget.style.color='#3a3835')}>eliminar</button>
        <button style={S.btnEdit} onClick={() => setEditing(true)}>Editar</button>
      </div>
    </div>
  )

  return (
    <div style={{ ...S.cardEditing, borderLeft: '2px solid #1D9E75' }}>
      <div style={S.cardHead}>
        <span style={{ ...S.cardId, background: '#0a2318', color: '#1D9E75' }}>{form.codi} — suc directe</span>
        <span style={S.badgeEdit}>editant</span>
      </div>
      <div style={S.fieldRow}>
        <span style={S.fieldLabel}>Vol (l)</span>
        <span style={S.autoField}>{volEntrada > 0 ? `${volEntrada} l — suma origens` : 'calculat automàticament'}</span>
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
        <div style={S.sectionHead}>Origen (premses)</div>
        {origens.map((o, i) => (
          <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px' }}>
            <select
              style={{ ...S.fieldSelect, flex: 2 }}
              value={o.premsa_id}
              onChange={e => updateOrigen(i, 'premsa_id', parseInt(e.target.value))}
            >
              {premses.map(p => <option key={p.id} value={p.id}>{p.codi}</option>)}
            </select>
            <input
              style={{ ...S.fieldInput, width: '60px', flex: 'none' }}
              type="number"
              value={o.vol_l || ''}
              placeholder="l"
              onChange={e => updateOrigen(i, 'vol_l', parseFloat(e.target.value) || 0)}
            />
            <span style={{ fontSize: '10px', color: '#4a4846' }}>l</span>
            <button onClick={() => setOrigens(o => o.filter((_, j) => j !== i))} style={{ ...S.btnDel, fontSize: '12px' }}>✕</button>
          </div>
        ))}
        <button onClick={() => setOrigens(o => [...o, { premsa_id: premses[0]?.id ?? 0, vol_l: 0 }])} style={{ fontSize: '10px', color: '#1D9E75', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'DM Mono, monospace', marginTop: '4px' }}>
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

  function updateOrigen(idx: number, field: string, value: unknown) {
    setOrigens(o => o.map((item, i) => i === idx ? { ...item, [field]: value } : item))
  }
}

export default function FaseBullit({ data, compact }: Props) {
  const router = useRouter()
  const [ebullidors, setEbullidors] = useState<(Partial<EbullidorAmbOrigen> & { _local?: boolean })[]>(data.ebullidors)
  const [sucsDirectes, setSucsDirectes] = useState<(Partial<SucDirecteAmbOrigen> & { _local?: boolean })[]>(data.sucsDirectes)

  function getVolUsatEbullidor(ebullidorId: number | undefined) {
    if (!ebullidorId) return 0
    return data.fermentadors.reduce((sum, f) => {
      return sum + f.fermentador_origen
        .filter(o => o.ebullidor_id === ebullidorId)
        .reduce((s, o) => s + (o.vol_l || 0), 0)
    }, 0)
  }

  function getVolUsatSucDirecte(sucId: number | undefined) {
    if (!sucId) return 0
    return data.fermentadors.reduce((sum, f) => {
      return sum + f.fermentador_origen
        .filter(o => o.suc_directe_id === sucId)
        .reduce((s, o) => s + (o.vol_l || 0), 0)
    }, 0)
  }

  function addEbullidor() {
    setEbullidors(e => [...e, { codi: `B${e.length + 1}`, jornada_id: data.jornada.id, ebullidor_origen: [], _local: true }])
  }

  function addSucDirecte() {
    setSucsDirectes(s => [...s, { codi: `S${s.length + 1}`, jornada_id: data.jornada.id, suc_directe_origen: [], _local: true }])
  }

  async function saveEbullidor(idx: number, form: Partial<EbullidorAmbOrigen>) {
    const e = ebullidors[idx]
    const origens = form.ebullidor_origen ?? []
    const volEntrada = origens.reduce((s, o) => s + (o.vol_l || 0), 0)

    if (e.id) {
      await supabase.from('ebullidor').update({
        vol_inicial_l: volEntrada, vol_final_l: form.vol_final_l,
        t_inicial_c: form.t_inicial_c, t_max_c: form.t_max_c, t_final_c: form.t_final_c,
        pot_w: form.pot_w, hora_inici: form.hora_inici, hora_final: form.hora_final,
        temps_calor_min: form.temps_calor_min, temps_fred_min: form.temps_fred_min,
      }).eq('id', e.id)
      await supabase.from('ebullidor_origen').delete().eq('ebullidor_id', e.id)
      if (origens.length > 0) {
        await supabase.from('ebullidor_origen').insert(origens.map(o => ({ ebullidor_id: e.id!, premsa_id: o.premsa_id, vol_l: o.vol_l })))
      }
    } else {
      const { data: nou } = await supabase.from('ebullidor').insert({
        jornada_id: data.jornada.id, codi: form.codi!, vol_inicial_l: volEntrada,
        vol_final_l: form.vol_final_l, t_inicial_c: form.t_inicial_c, t_max_c: form.t_max_c,
        t_final_c: form.t_final_c, pot_w: form.pot_w, hora_inici: form.hora_inici,
        hora_final: form.hora_final, temps_calor_min: form.temps_calor_min, temps_fred_min: form.temps_fred_min,
      }).select().single()
      if (nou && origens.length > 0) {
        await supabase.from('ebullidor_origen').insert(origens.map(o => ({ ebullidor_id: nou.id, premsa_id: o.premsa_id, vol_l: o.vol_l })))
      }
      if (nou) setEbullidors(eb => eb.map((item, i) => i === idx ? { ...nou, ebullidor_origen: [], _local: false } : item))
    }
    router.refresh()
  }

  async function saveSucDirecte(idx: number, form: Partial<SucDirecteAmbOrigen>) {
    const s = sucsDirectes[idx]
    const origens = form.suc_directe_origen ?? []
    const volEntrada = origens.reduce((sum, o) => sum + (o.vol_l || 0), 0)

    if (s.id) {
      await supabase.from('suc_directe').update({ vol_l: volEntrada, notes: form.notes }).eq('id', s.id)
      await supabase.from('suc_directe_origen').delete().eq('suc_directe_id', s.id)
      if (origens.length > 0) {
        await supabase.from('suc_directe_origen').insert(origens.map(o => ({ suc_directe_id: s.id!, premsa_id: o.premsa_id, vol_l: o.vol_l })))
      }
    } else {
      const { data: nou } = await supabase.from('suc_directe').insert({
        jornada_id: data.jornada.id, codi: form.codi!, vol_l: volEntrada, notes: form.notes,
      }).select().single()
      if (nou && origens.length > 0) {
        await supabase.from('suc_directe_origen').insert(origens.map(o => ({ suc_directe_id: nou.id, premsa_id: o.premsa_id, vol_l: o.vol_l })))
      }
      if (nou) setSucsDirectes(sd => sd.map((item, i) => i === idx ? { ...nou, suc_directe_origen: [], _local: false } : item))
    }
    router.refresh()
  }

  async function deleteEbullidor(idx: number) {
    const e = ebullidors[idx]
    if (e.id) { await supabase.from('ebullidor').delete().eq('id', e.id); router.refresh() }
    setEbullidors(eb => eb.filter((_, i) => i !== idx))
  }

  async function deleteSucDirecte(idx: number) {
    const s = sucsDirectes[idx]
    if (s.id) { await supabase.from('suc_directe').delete().eq('id', s.id); router.refresh() }
    setSucsDirectes(sd => sd.filter((_, i) => i !== idx))
  }

  if (compact) return (
    <div>
      {ebullidors.length === 0 && sucsDirectes.length === 0 && (
        <div style={{ fontSize: '10px', color: '#3a3835', padding: '8px 12px' }}>Cap ebullidor</div>
      )}
      {ebullidors.map((e, idx) => (
        <EbullidorCard key={e.id ?? `local-${idx}`} ebullidor={e} premses={data.premses} compact
          volUsat={getVolUsatEbullidor(e.id)}
          onDelete={() => deleteEbullidor(idx)} onSave={f => saveEbullidor(idx, f)} />
      ))}
      {sucsDirectes.map((s, idx) => (
        <SucDirecteCard key={s.id ?? `local-${idx}`} suc={s} premses={data.premses} compact
          volUsat={getVolUsatSucDirecte(s.id)}
          onDelete={() => deleteSucDirecte(idx)} onSave={f => saveSucDirecte(idx, f)} />
      ))}
    </div>
  )

  return (
    <div style={{ maxWidth: '460px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <span style={{ fontSize: '9px', color: '#4a4846', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Ebullidors</span>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={addEbullidor} style={{ fontSize: '10px', color: '#BA7517', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'DM Mono, monospace' }}>+ Ebullidor</button>
          <button onClick={addSucDirecte} style={{ fontSize: '10px', color: '#1D9E75', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'DM Mono, monospace' }}>+ Suc directe</button>
        </div>
      </div>
      {ebullidors.length === 0 && sucsDirectes.length === 0 && (
        <div style={{ border: '0.5px dashed #252422', borderRadius: '8px', padding: '32px', textAlign: 'center', color: '#3a3835', fontSize: '12px' }}>
          Cap ebullidor ni suc directe
        </div>
      )}
      {ebullidors.map((e, idx) => (
        <EbullidorCard key={e.id ?? `local-${idx}`} ebullidor={e} premses={data.premses}
          volUsat={getVolUsatEbullidor(e.id)}
          onDelete={() => deleteEbullidor(idx)} onSave={f => saveEbullidor(idx, f)} />
      ))}
      {sucsDirectes.map((s, idx) => (
        <SucDirecteCard key={s.id ?? `local-${idx}`} suc={s} premses={data.premses}
          volUsat={getVolUsatSucDirecte(s.id)}
          onDelete={() => deleteSucDirecte(idx)} onSave={f => saveSucDirecte(idx, f)} />
      ))}
    </div>
  )
}
