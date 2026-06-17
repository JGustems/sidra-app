'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { Triturada, TritaradaOrigen, Poma } from '@/lib/types'
import { S, colors } from '@/lib/theme'
import { deleteAmbAvis } from '@/lib/supabase'

import Card, { CardHead, CardFootRead, CardFootEdit, FieldRead, FieldInput, FieldAuto, Balance, CardCompact } from '@/components/ui/Card'

type TritaradaAmbOrigen = Triturada & { triturada_origen: TritaradaOrigen[] }

interface Props {
  data: {
    jornada: { id: number }
    pomes: Poma[]
    triturades: TritaradaAmbOrigen[]
    premses: { premsa_origen: { triturada_id: number; pes_kg: number }[] }[]
  }
  compact?: boolean
}

function TritaradaCard({ triturada, pomes, pesUsat, onDelete, onSave, compact }: {
  triturada: Partial<TritaradaAmbOrigen> & { _local?: boolean }
  pomes: Poma[]
  pesUsat: number
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

  const pesTotal = origens.reduce((s, o) => s + (o.pes_kg || 0), 0)
  const balancOk = pesUsat > 0 && Math.abs(pesUsat - pesTotal) < 0.1

  function addOrigen() {
    if (pomes.length === 0) return
    setOrigens(o => [...o, { poma_id: pomes[0].id, pes_kg: 0 }])
  }

  function updateOrigen(idx: number, field: string, value: unknown) {
    setOrigens(o => o.map((item, i) => i === idx ? { ...item, [field]: value } : item))
  }

  async function save() {
    setSaving(true)
    await onSave({ ...form, pes_kg: pesTotal, triturada_origen: origens.map(o => ({ ...o, triturada_id: triturada.id ?? 0, id: 0 })) })
    setSaving(false)
    setEditing(false)
  }

  if (compact) return (
    <CardCompact
      id={form.codi ?? ''}
      badge={pesTotal > 0 ? `${pesTotal} kg` : undefined}
      fields={[
        { label: 'Passades', value: form.passades },
        { label: 'Pes total', value: pesTotal > 0 ? `${pesTotal} kg` : null },
        { label: 'Pes usat', value: pesUsat > 0 ? `${pesUsat} kg` : null },
      ]}
    />
  )

  if (!editing) return (
    <Card>
      <CardHead id={form.codi ?? ''} saved />
      <FieldRead label="Passades" value={form.passades} />
      <FieldRead label="Pes total (kg)" value={pesTotal > 0 ? `${pesTotal} kg` : null} auto />
      <FieldRead label="Pes usat (kg)" value={pesUsat > 0 ? `${pesUsat} kg` : null} auto />
      <FieldRead label="Notes" value={form.notes} />
      <div style={{ padding: '7px 12px', borderBottom: `0.5px solid ${colors.bg3}` }}>
        <div style={S.sectionHead}>Origen (pomes)</div>
        {origens.length === 0 && <span style={S.fieldEmpty}>—</span>}
        {origens.map((o, i) => {
          const poma = pomes.find(p => p.id === o.poma_id)
          return (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '3px' }}>
              <span style={{ color: colors.text2 }}>{poma?.codi} — {poma?.varietat}</span>
              <span style={{ color: colors.text, fontWeight: '500' }}>{o.pes_kg} kg</span>
            </div>
          )
        })}
      </div>
      <Balance ok={balancOk} text={`${pesTotal} kg totals · ${pesUsat > 0 ? `${pesUsat} kg usats` : 'sense usar encara'} ${balancOk ? '✓' : ''}`} />
      <CardFootRead onEdit={() => setEditing(true)} onDelete={onDelete} />
    </Card>
  )

  return (
    <Card editing>
      <CardHead id={form.codi ?? ''} saved={false} />
      <FieldInput label="Passades" value={form.passades} type="number" onChange={v => setForm(f => ({ ...f, passades: v as number ?? 1 }))} />
      <FieldAuto label="Pes total (kg)" value={pesTotal > 0 ? `${pesTotal} kg` : null} />
      <FieldInput label="Notes" value={form.notes} onChange={v => setForm(f => ({ ...f, notes: v as string }))} />
      <div style={{ padding: '8px 12px', borderBottom: `0.5px solid ${colors.bg3}` }}>
        <div style={S.sectionHead}>Origen (pomes)</div>
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

export default function FaseTriturat({ data, compact }: Props) {
  const router = useRouter()
  const [triturades, setTriturades] = useState<(Partial<TritaradaAmbOrigen> & { _local?: boolean })[]>(data.triturades)

  function getPesUsat(tritId: number | undefined) {
    if (!tritId) return 0
    return data.premses.reduce((sum, p) => {
      return sum + p.premsa_origen
        .filter(o => o.triturada_id === tritId)
        .reduce((s, o) => s + (o.pes_kg || 0), 0)
    }, 0)
  }

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
  if (t.id) {
    const ok = await deleteAmbAvis('triturada', t.id, 'Aquesta triturada ja s\'ha usat en una premsa i no es pot eliminar.')
    if (!ok) return
    router.refresh()
  }
  setTriturades(tr => tr.filter((_, i) => i !== idx))
}

  if (compact) return (
    <div>
      {triturades.length === 0 && <div style={{ fontSize: '10px', color: colors.text3, padding: '8px 12px' }}>Cap triturada</div>}
      {triturades.map((t, idx) => (
        <TritaradaCard key={t.id ?? `local-${idx}`} triturada={t} pomes={data.pomes} compact
          pesUsat={getPesUsat(t.id)}
          onDelete={() => deleteTriturada(idx)} onSave={f => saveTriturada(idx, f)} />
      ))}
    </div>
  )

  return (
    <div style={{ maxWidth: '460px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <span style={{ fontSize: '9px', color: colors.text3, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Triturat</span>
        <button onClick={addTriturada} style={S.btnAdd}>+ Afegir triturada</button>
      </div>
      {triturades.length === 0 && (
        <div style={{ border: `0.5px dashed ${colors.border}`, borderRadius: '8px', padding: '32px', textAlign: 'center', color: colors.text3, fontSize: '12px' }}>
          Cap triturada afegida
        </div>
      )}
      {triturades.map((t, idx) => (
        <TritaradaCard key={t.id ?? `local-${idx}`} triturada={t} pomes={data.pomes}
          pesUsat={getPesUsat(t.id)}
          onDelete={() => deleteTriturada(idx)} onSave={f => saveTriturada(idx, f)} />
      ))}
    </div>
  )
}
