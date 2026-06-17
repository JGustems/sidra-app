'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { Premsa, PremsaOrigen, Triturada } from '@/lib/types'
import { S, colors } from '@/lib/theme'
import { deleteAmbAvis } from '@/lib/supabase'

import Card, { CardHead, CardFootRead, CardFootEdit, FieldRead, FieldInput, FieldAuto, Balance, CardCompact } from '@/components/ui/Card'

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
    <CardCompact
      id={form.codi ?? ''}
      badge={form.vol_prod_l ? `${form.vol_prod_l} l` : undefined}
      fields={[
        { label: 'Pes',     value: pesTotal > 0 ? `${pesTotal} kg` : null },
        { label: 'Vol',     value: form.vol_prod_l ? `${form.vol_prod_l} l` : null },
        { label: 'Vol usat',value: volUsat > 0 ? `${volUsat} l` : null },
      ]}
    />
  )

  if (!editing) return (
    <Card>
      <CardHead id={form.codi ?? ''} saved />
      <FieldRead label="Pes entrada (kg)" value={pesTotal > 0 ? `${pesTotal} kg` : null} auto />
      <FieldRead label="Vol produït (l)" value={form.vol_prod_l} />
      <FieldRead label="Vol usat (l)" value={volUsat > 0 ? `${volUsat} l` : null} auto />
      <FieldRead label="Eficiència" value={eficiencia ? `${eficiencia} l/100kg` : null} auto />
      <FieldRead label="Notes" value={form.notes} />
      <div style={{ padding: '7px 12px', borderBottom: `0.5px solid ${colors.bg3}` }}>
        <div style={S.sectionHead}>Origen (triturades)</div>
        {origens.length === 0 && <span style={S.fieldEmpty}>—</span>}
        {origens.map((o, i) => {
          const trit = triturades.find(t => t.id === o.triturada_id)
          return (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '3px' }}>
              <span style={{ color: colors.text2 }}>{trit?.codi}</span>
              <span style={{ color: colors.text, fontWeight: '500' }}>{o.pes_kg} kg</span>
            </div>
          )
        })}
      </div>
      {form.vol_prod_l != null && (
        <Balance
          ok={balancOk}
          text={`${pesTotal} kg → ${form.vol_prod_l} l · ${volUsat} l usats${eficiencia ? ` · Eff ${eficiencia} l/100kg` : ''} ${balancOk ? '✓' : '⚠'}`}
        />
      )}
      <CardFootRead onEdit={() => setEditing(true)} onDelete={onDelete} />
    </Card>
  )

  return (
    <Card editing>
      <CardHead id={form.codi ?? ''} saved={false} />
      <FieldAuto label="Pes entrada (kg)" value={pesTotal > 0 ? `${pesTotal} kg` : null} />
      <FieldInput label="Vol produït (l)" value={form.vol_prod_l} type="number" onChange={v => setForm(f => ({ ...f, vol_prod_l: v as number }))} />
      <FieldAuto label="Vol usat (l)" value={volUsat > 0 ? `${volUsat} l` : null} />
      <FieldAuto label="Eficiència" value={eficiencia ? `${eficiencia} l/100kg` : null} />
      <FieldInput label="Notes" value={form.notes} onChange={v => setForm(f => ({ ...f, notes: v as string }))} />
      <div style={{ padding: '8px 12px', borderBottom: `0.5px solid ${colors.bg3}` }}>
        <div style={S.sectionHead}>Origen (triturades)</div>
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
              type="number" value={o.pes_kg || ''} placeholder="kg"
              onChange={e => updateOrigen(i, 'pes_kg', parseFloat(e.target.value) || 0)}
            />
            <span style={{ fontSize: '10px', color: colors.text3 }}>kg</span>
            <button onClick={() => setOrigens(o => o.filter((_, j) => j !== i))} style={{ ...S.btnDel, fontSize: '12px' }}>✕</button>
          </div>
        ))}
        <button onClick={addOrigen} style={S.btnAdd}>+ Afegir origen</button>
      </div>
      <CardFootEdit onSave={save} onCancel={() => setEditing(false)} onDelete={onDelete} saving={saving} />
    </Card>
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
    const deSucs = data.sucsDirectes.reduce((sum, s) => {
      return sum + s.suc_directe_origen
        .filter(o => o.premsa_id === premsaId)
        .reduce((s2, o) => s2 + (o.vol_l || 0), 0)
    }, 0)
    return deEbullidors + deSucs
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
  if (p.id) {
    const ok = await deleteAmbAvis('premsa', p.id, 'Aquesta premsa ja s\'ha usat en un ebullidor o suc directe i no es pot eliminar.')
    if (!ok) return
    router.refresh()
  }
  setPremses(pr => pr.filter((_, i) => i !== idx))
}

  if (compact) return (
    <div>
      {premses.length === 0 && <div style={{ fontSize: '10px', color: colors.text3, padding: '8px 12px' }}>Cap premsa</div>}
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
        <span style={{ fontSize: '9px', color: colors.text3, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Premsat</span>
        <button onClick={addPremsa} style={S.btnAdd}>+ Afegir premsa</button>
      </div>
      {premses.length === 0 && (
        <div style={{ border: `0.5px dashed ${colors.border}`, borderRadius: '8px', padding: '32px', textAlign: 'center', color: colors.text3, fontSize: '12px' }}>
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
