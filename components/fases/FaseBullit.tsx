'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { Ebullidor, EbullidorOrigen, SucDirecte, SucDirecteOrigen, Premsa } from '@/lib/types'
import { S, colors } from '@/lib/theme'
import Card, { CardHead, CardFootRead, CardFootEdit, FieldRead, FieldInput, FieldAuto, Balance, CardCompact } from '@/components/ui/Card'

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
    (ebullidor.ebullidor_origen ?? []).map(o => ({ premsa_id: o.premsa_id, vol_l: o.vol_l }))
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
    <CardCompact
      id={form.codi ?? ''}
      badge={form.vol_final_l ? `${form.vol_final_l} l` : undefined}
      fields={[
        { label: 'Entrada', value: volEntrada > 0 ? `${volEntrada} l` : null },
        { label: 'Final',   value: form.vol_final_l ? `${form.vol_final_l} l` : null },
        { label: 'T màx',   value: form.t_max_c ? `${form.t_max_c}°C` : null },
      ]}
    />
  )

  if (!editing) return (
    <Card>
      <CardHead id={form.codi ?? ''} saved />
      <FieldRead label="Vol entrada (l)" value={volEntrada > 0 ? `${volEntrada} l` : null} auto />
      <FieldRead label="Vol final (l)" value={form.vol_final_l} />
      <FieldRead label="Vol usat (l)" value={volUsat > 0 ? `${volUsat} l` : null} auto />
      <FieldRead label="T inicial (°C)" value={form.t_inicial_c} />
      <FieldRead label="T màx (°C)" value={form.t_max_c} />
      <FieldRead label="T final (°C)" value={form.t_final_c} />
      <FieldRead label="Potència (W)" value={form.pot_w} />
      <FieldRead label="Hora inici" value={form.hora_inici} />
      <FieldRead label="Hora final" value={form.hora_final} />
      <FieldRead label="Temps calor" value={form.temps_calor_min ? `${form.temps_calor_min} min` : null} />
      <FieldRead label="Temps fred" value={form.temps_fred_min ? `${form.temps_fred_min} min` : null} />
      <div style={{ padding: '7px 12px', borderBottom: `0.5px solid ${colors.bg3}` }}>
        <div style={S.sectionHead}>Origen (premses)</div>
        {origens.length === 0 && <span style={S.fieldEmpty}>—</span>}
        {origens.map((o, i) => {
          const premsa = premses.find(p => p.id === o.premsa_id)
          return (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '3px' }}>
              <span style={{ color: colors.text2 }}>{premsa?.codi}</span>
              <span style={{ color: colors.text, fontWeight: '500' }}>{o.vol_l} l</span>
            </div>
          )
        })}
      </div>
      {form.vol_final_l != null && (
        <Balance ok={balancOk} text={`${volEntrada} l entrada · ${form.vol_final_l} l final · ${volUsat} l usats ${balancOk ? '✓' : '⚠'}`} />
      )}
      <CardFootRead onEdit={() => setEditing(true)} onDelete={onDelete} />
    </Card>
  )

  return (
    <Card editing>
      <CardHead id={form.codi ?? ''} saved={false} />
      <FieldAuto label="Vol entrada (l)" value={volEntrada > 0 ? `${volEntrada} l` : null} />
      <FieldInput label="Vol final (l)" value={form.vol_final_l} type="number" onChange={v => setForm(f => ({ ...f, vol_final_l: v as number }))} />
      <FieldAuto label="Vol usat (l)" value={volUsat > 0 ? `${volUsat} l` : null} />
      <FieldInput label="T inicial (°C)" value={form.t_inicial_c} type="number" onChange={v => setForm(f => ({ ...f, t_inicial_c: v as number }))} />
      <FieldInput label="T màx (°C)" value={form.t_max_c} type="number" onChange={v => setForm(f => ({ ...f, t_max_c: v as number }))} />
      <FieldInput label="T final (°C)" value={form.t_final_c} type="number" onChange={v => setForm(f => ({ ...f, t_final_c: v as number }))} />
      <FieldInput label="Potència (W)" value={form.pot_w} type="number" onChange={v => setForm(f => ({ ...f, pot_w: v as number }))} />
      <FieldInput label="Hora inici" value={form.hora_inici} type="time" onChange={v => setForm(f => ({ ...f, hora_inici: v as string }))} />
      <FieldInput label="Hora final" value={form.hora_final} type="time" onChange={v => setForm(f => ({ ...f, hora_final: v as string }))} />
      <FieldInput label="Temps calor (min)" value={form.temps_calor_min} type="number" onChange={v => setForm(f => ({ ...f, temps_calor_min: v as number }))} />
      <FieldInput label="Temps fred (min)" value={form.temps_fred_min} type="number" onChange={v => setForm(f => ({ ...f, temps_fred_min: v as number }))} />
      <div style={{ padding: '8px 12px', borderBottom: `0.5px solid ${colors.bg3}` }}>
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
              type="number" value={o.vol_l || ''} placeholder="l"
              onChange={e => updateOrigen(i, 'vol_l', parseFloat(e.target.value) || 0)}
            />
            <span style={{ fontSize: '10px', color: colors.text3 }}>l</span>
            <button onClick={() => setOrigens(o => o.filter((_, j) => j !== i))} style={{ ...S.btnDel, fontSize: '12px' }}>✕</button>
          </div>
        ))}
        <button onClick={addOrigen} style={S.btnAdd}>+ Afegir origen</button>
      </div>
      <CardFootEdit onSave={save} onCancel={() => setEditing(false)} onDelete={onDelete} saving={saving} />
    </Card>
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
    (suc.suc_directe_origen ?? []).map(o => ({ premsa_id: o.premsa_id, vol_l: o.vol_l }))
  )
  const [saving, setSaving] = useState(false)

  const volEntrada = origens.reduce((s, o) => s + (o.vol_l || 0), 0)

  function updateOrigen(idx: number, field: string, value: unknown) {
    setOrigens(o => o.map((item, i) => i === idx ? { ...item, [field]: value } : item))
  }

  async function save() {
    setSaving(true)
    await onSave({ ...form, vol_l: volEntrada, suc_directe_origen: origens.map(o => ({ ...o, suc_directe_id: suc.id ?? 0, id: 0 })) })
    setSaving(false)
    setEditing(false)
  }

  if (compact) return (
    <CardCompact
      id={`${form.codi} — directe`}
      badgeColor="teal"
      accentLeft="teal"
      fields={[
        { label: 'Vol',  value: volEntrada > 0 ? `${volEntrada} l` : null },
        { label: 'Usat', value: volUsat > 0 ? `${volUsat} l` : null },
      ]}
    />
  )

  if (!editing) return (
    <Card accentLeft="teal">
      <CardHead id={`${form.codi} — suc directe`} saved teal />
      <FieldRead label="Vol (l)" value={volEntrada > 0 ? `${volEntrada} l` : null} auto />
      <FieldRead label="Vol usat (l)" value={volUsat > 0 ? `${volUsat} l` : null} auto />
      <FieldRead label="Notes" value={form.notes} />
      <div style={{ padding: '7px 12px', borderBottom: `0.5px solid ${colors.bg3}` }}>
        <div style={S.sectionHead}>Origen (premses)</div>
        {origens.map((o, i) => {
          const premsa = premses.find(p => p.id === o.premsa_id)
          return (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '3px' }}>
              <span style={{ color: colors.text2 }}>{premsa?.codi}</span>
              <span style={{ color: colors.text, fontWeight: '500' }}>{o.vol_l} l</span>
            </div>
          )
        })}
      </div>
      <CardFootRead onEdit={() => setEditing(true)} onDelete={onDelete} />
    </Card>
  )

  return (
    <Card editing accentLeft="teal">
      <CardHead id={`${form.codi} — suc directe`} saved={false} teal />
      <FieldAuto label="Vol (l)" value={volEntrada > 0 ? `${volEntrada} l` : null} />
      <FieldInput label="Notes" value={form.notes} onChange={v => setForm(f => ({ ...f, notes: v as string }))} />
      <div style={{ padding: '8px 12px', borderBottom: `0.5px solid ${colors.bg3}` }}>
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
              type="number" value={o.vol_l || ''} placeholder="l"
              onChange={e => updateOrigen(i, 'vol_l', parseFloat(e.target.value) || 0)}
            />
            <span style={{ fontSize: '10px', color: colors.text3 }}>l</span>
            <button onClick={() => setOrigens(o => o.filter((_, j) => j !== i))} style={{ ...S.btnDel, fontSize: '12px' }}>✕</button>
          </div>
        ))}
        <button
          onClick={() => setOrigens(o => [...o, { premsa_id: premses[0]?.id ?? 0, vol_l: 0 }])}
          style={{ ...S.btnAdd, color: colors.teal }}
        >
          + Afegir origen
        </button>
      </div>
      <CardFootEdit onSave={save} onCancel={() => setEditing(false)} onDelete={onDelete} saving={saving} />
    </Card>
  )
}

export default function FaseBullit({ data, compact }: Props) {
  const router = useRouter()
  const [ebullidors, setEbullidors] = useState<(Partial<EbullidorAmbOrigen> & { _local?: boolean })[]>(data.ebullidors ?? [])
  const [sucsDirectes, setSucsDirectes] = useState<(Partial<SucDirecteAmbOrigen> & { _local?: boolean })[]>(data.sucsDirectes ?? [])

  function getVolUsatEbullidor(id: number | undefined) {
    if (!id) return 0
    return (data.fermentadors ?? []).reduce((sum, f) =>
      sum + (f.fermentador_origen ?? []).filter(o => o.ebullidor_id === id).reduce((s, o) => s + (o.vol_l || 0), 0), 0)
  }

  function getVolUsatSucDirecte(id: number | undefined) {
    if (!id) return 0
    return (data.fermentadors ?? []).reduce((sum, f) =>
      sum + (f.fermentador_origen ?? []).filter(o => o.suc_directe_id === id).reduce((s, o) => s + (o.vol_l || 0), 0), 0)
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
      if (origens.length > 0) await supabase.from('ebullidor_origen').insert(origens.map(o => ({ ebullidor_id: e.id!, premsa_id: o.premsa_id, vol_l: o.vol_l })))
    } else {
      const { data: nou } = await supabase.from('ebullidor').insert({
        jornada_id: data.jornada.id, codi: form.codi!, vol_inicial_l: volEntrada,
        vol_final_l: form.vol_final_l, t_inicial_c: form.t_inicial_c, t_max_c: form.t_max_c,
        t_final_c: form.t_final_c, pot_w: form.pot_w, hora_inici: form.hora_inici,
        hora_final: form.hora_final, temps_calor_min: form.temps_calor_min, temps_fred_min: form.temps_fred_min,
      }).select().single()
      if (nou && origens.length > 0) await supabase.from('ebullidor_origen').insert(origens.map(o => ({ ebullidor_id: nou.id, premsa_id: o.premsa_id, vol_l: o.vol_l })))
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
      if (origens.length > 0) await supabase.from('suc_directe_origen').insert(origens.map(o => ({ suc_directe_id: s.id!, premsa_id: o.premsa_id, vol_l: o.vol_l })))
    } else {
      const { data: nou } = await supabase.from('suc_directe').insert({
        jornada_id: data.jornada.id, codi: form.codi!, vol_l: volEntrada, notes: form.notes,
      }).select().single()
      if (nou && origens.length > 0) await supabase.from('suc_directe_origen').insert(origens.map(o => ({ suc_directe_id: nou.id, premsa_id: o.premsa_id, vol_l: o.vol_l })))
      if (nou) setSucsDirectes(sd => sd.map((item, i) => i === idx ? { ...nou, suc_directe_origen: [], _local: false } : item))
    }
    router.refresh()
  }

  async function deleteEbullidor(idx: number) {
  const e = ebullidors[idx]
  if (e.id) {
    const { error } = await supabase.from('ebullidor').delete().eq('id', e.id)
    if (error) {
      alert('No es pot eliminar aquest ebullidor perquè ja s\'ha usat en un fermentador. Elimina primer la referència al fermentador.')
      return
    }
    router.refresh()
  }
  setEbullidors(eb => eb.filter((_, i) => i !== idx))
}

  async function deleteSucDirecte(idx: number) {
  const s = sucsDirectes[idx]
  if (s.id) {
    const { error } = await supabase.from('suc_directe').delete().eq('id', s.id)
    if (error) {
      alert('No es pot eliminar aquest suc directe perquè ja s\'ha usat en un fermentador. Elimina primer la referència al fermentador.')
      return
    }
    router.refresh()
  }
  setSucsDirectes(sd => sd.filter((_, i) => i !== idx))
}

  if (compact) return (
    <div>
      {ebullidors.length === 0 && sucsDirectes.length === 0 && (
        <div style={{ fontSize: '10px', color: colors.text3, padding: '8px 12px' }}>Cap ebullidor</div>
      )}
      {ebullidors.map((e, idx) => (
        <EbullidorCard key={e.id ?? `local-${idx}`} ebullidor={e} premses={data.premses} compact
          volUsat={getVolUsatEbullidor(e.id)} onDelete={() => deleteEbullidor(idx)} onSave={f => saveEbullidor(idx, f)} />
      ))}
      {sucsDirectes.map((s, idx) => (
        <SucDirecteCard key={s.id ?? `local-${idx}`} suc={s} premses={data.premses} compact
          volUsat={getVolUsatSucDirecte(s.id)} onDelete={() => deleteSucDirecte(idx)} onSave={f => saveSucDirecte(idx, f)} />
      ))}
    </div>
  )

  return (
    <div style={{ maxWidth: '460px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <span style={{ fontSize: '9px', color: colors.text3, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Bullit / Suc directe</span>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => setEbullidors(e => [...e, { codi: `B${e.length + 1}`, jornada_id: data.jornada.id, ebullidor_origen: [], _local: true }])} style={S.btnAdd}>+ Ebullidor</button>
          <button onClick={() => setSucsDirectes(s => [...s, { codi: `S${s.length + 1}`, jornada_id: data.jornada.id, suc_directe_origen: [], _local: true }])} style={{ ...S.btnAdd, color: colors.teal }}>+ Suc directe</button>
        </div>
      </div>
      {ebullidors.length === 0 && sucsDirectes.length === 0 && (
        <div style={{ border: `0.5px dashed ${colors.border}`, borderRadius: '8px', padding: '32px', textAlign: 'center', color: colors.text3, fontSize: '12px' }}>
          Cap ebullidor ni suc directe
        </div>
      )}
      {ebullidors.map((e, idx) => (
        <EbullidorCard key={e.id ?? `local-${idx}`} ebullidor={e} premses={data.premses}
          volUsat={getVolUsatEbullidor(e.id)} onDelete={() => deleteEbullidor(idx)} onSave={f => saveEbullidor(idx, f)} />
      ))}
      {sucsDirectes.map((s, idx) => (
        <SucDirecteCard key={s.id ?? `local-${idx}`} suc={s} premses={data.premses}
          volUsat={getVolUsatSucDirecte(s.id)} onDelete={() => deleteSucDirecte(idx)} onSave={f => saveSucDirecte(idx, f)} />
      ))}
    </div>
  )
}
