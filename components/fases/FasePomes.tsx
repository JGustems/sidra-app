'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { Poma, TritaradaOrigen } from '@/lib/types'
import { S, colors } from '@/lib/theme'
import Card, { CardHead, CardFootRead, CardFootEdit, FieldRead, FieldInput, FieldSelect, FieldAuto, Balance, CardCompact } from '@/components/ui/Card'

interface Props {
  data: {
    jornada: { id: number; data: string }
    pomes: Poma[]
    triturades: { triturada_origen: TritaradaOrigen[] }[]
  }
  compact?: boolean
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
    <CardCompact
      id={form.codi ?? ''}
      badge={pesUsat > 0 ? `${pesUsat} kg` : undefined}
      fields={[
        { label: 'Varietat', value: form.varietat },
        { label: 'Pes total', value: form.pes_total_kg ? `${form.pes_total_kg} kg` : null },
        { label: 'Pes usat', value: pesUsat > 0 ? `${pesUsat} kg` : null },
      ]}
    />
  )

  if (!editing) return (
    <Card>
      <CardHead id={form.codi ?? ''} saved />
      <FieldRead label="Varietat" value={form.varietat} />
      <FieldRead label="Origen" value={form.origen} />
      <FieldRead label="Maduració" value={form.maduracio} />
      <FieldRead label="Càmera (mesos)" value={form.camera_mesos} />
      <FieldRead label="Pes total (kg)" value={form.pes_total_kg} />
      <FieldRead label="Pes usat (kg)" value={pesUsat > 0 ? pesUsat : null} auto />
      {pesUsat > 0 && form.pes_total_kg && (
        <Balance
          ok={balancOk}
          text={balancOk
            ? `✓ ${pesUsat} kg usats de ${form.pes_total_kg} kg`
            : `⚠ ${pesUsat} kg usats vs ${form.pes_total_kg} kg totals`}
        />
      )}
      <CardFootRead onEdit={() => setEditing(true)} onDelete={onDelete} />
    </Card>
  )

  return (
    <Card editing>
      <CardHead id={form.codi ?? ''} saved={false} />
      <FieldInput label="Varietat" value={form.varietat} onChange={v => update('varietat', v)} />
      <FieldInput label="Origen" value={form.origen} onChange={v => update('origen', v)} />
      <FieldSelect
        label="Maduració"
        value={form.maduracio ?? ''}
        options={['Verd', 'Punt', 'Passat'].map(m => ({ value: m, label: m }))}
        onChange={v => update('maduracio', v)}
      />
      <FieldInput label="Càmera (mesos)" value={form.camera_mesos} type="number" onChange={v => update('camera_mesos', v)} />
      <FieldInput label="Pes total (kg)" value={form.pes_total_kg} type="number" onChange={v => update('pes_total_kg', v)} />
      <FieldAuto label="Pes usat (kg)" value={pesUsat > 0 ? `${pesUsat} kg` : null} />
      <CardFootEdit onSave={save} onCancel={() => setEditing(false)} onDelete={onDelete} saving={saving} />
    </Card>
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
      {pomes.length === 0 && <div style={{ fontSize: '10px', color: colors.text3, padding: '8px 12px' }}>Cap poma</div>}
      {pomes.map((poma, idx) => (
        <PomaCard key={poma.id ?? `local-${idx}`} poma={poma} compact
          pesUsat={getPesUsat(poma.id)}
          onDelete={() => deletePoma(idx)} onSave={f => savePoma(idx, f)} />
      ))}
    </div>
  )

  return (
    <div style={{ maxWidth: '460px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <span style={{ fontSize: '9px', color: colors.text3, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Pomes</span>
        <button onClick={addPoma} style={S.btnAdd}>+ Afegir varietat</button>
      </div>
      {pomes.length === 0 && (
        <div style={{ border: `0.5px dashed ${colors.border}`, borderRadius: '8px', padding: '32px', textAlign: 'center', color: colors.text3, fontSize: '12px' }}>
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
