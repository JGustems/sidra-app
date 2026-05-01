'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link' // Importat per al botó final
import { supabase } from '@/lib/supabase'
import type { Poma } from '@/lib/types'

interface Props {
  data: {
    jornada: { id: number; data: string }
    pomes: Poma[]
  }
}

const MADURACIO = ['Verd', 'Punt', 'Passat'] as const

function PomaCard({
  poma,
  onDelete,
  onSave,
}: {
  poma: Partial<Poma> & { _local?: boolean }
  onDelete: () => void
  onSave: (p: Partial<Poma>) => void
}) {
  const [form, setForm] = useState(poma)
  const [saving, setSaving] = useState(false)

  function update(field: string, value: unknown) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function save() {
    setSaving(true)
    await onSave(form)
    setSaving(false)
  }

  return (
    <div className="bg-white border border-stone-200 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <span className="font-mono text-sm font-medium bg-stone-100 px-2 py-0.5 rounded">
          {form.codi}
        </span>
        <button onClick={onDelete} className="text-stone-300 hover:text-red-400 text-xs font-mono transition-colors">
          eliminar
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Varietat', field: 'varietat', type: 'text' },
          { label: 'Origen',   field: 'origen',   type: 'text' },
          { label: 'Càmera (mesos)', field: 'camera_mesos', type: 'number' },
          { label: 'Pes total (kg)', field: 'pes_total_kg', type: 'number' },
          { label: 'Pes usat (kg)',  field: 'pes_usat_kg',  type: 'number' },
        ].map(({ label, field, type }) => (
          <div key={field} className="flex flex-col gap-1">
            <label className="text-xs text-stone-400">{label}</label>
            <input
              type={type}
              value={(form as Record<string, unknown>)[field] as string ?? ''}
              onChange={e => update(field, type === 'number' ? parseFloat(e.target.value) || null : e.target.value)}
              className="font-mono text-sm border border-stone-200 rounded px-2 py-1.5 focus:outline-none focus:border-[#BA7517]"
            />
          </div>
        ))}

        <div className="flex flex-col gap-1">
          <label className="text-xs text-stone-400">Maduració</label>
          <select
            value={form.maduracio ?? ''}
            onChange={e => update('maduracio', e.target.value || null)}
            className="font-mono text-sm border border-stone-200 rounded px-2 py-1.5 focus:outline-none focus:border-[#BA7517]"
          >
            <option value="">—</option>
            {MADURACIO.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1 mt-3">
        <label className="text-xs text-stone-400">Notes</label>
        <textarea
          value={form.notes ?? ''}
          onChange={e => update('notes', e.target.value || null)}
          rows={2}
          className="font-mono text-xs border border-stone-200 rounded px-2 py-1.5 focus:outline-none focus:border-[#BA7517] resize-none"
        />
      </div>

      {form.pes_total_kg && form.pes_usat_kg && (
        <div className={`mt-3 text-xs font-mono px-3 py-1.5 rounded ${
          Math.abs((form.pes_usat_kg ?? 0) - (form.pes_total_kg ?? 0)) < 1
            ? 'bg-[#E1F5EE] text-[#0F6E56]'
            : 'bg-[#FAEEDA] text-[#BA7517]'
        }`}>
          Pes usat: {form.pes_usat_kg} kg de {form.pes_total_kg} kg totals
        </div>
      )}

      <div className="flex justify-end mt-4">
        <button
          onClick={save}
          disabled={saving}
          className="font-mono text-xs px-4 py-1.5 bg-[#BA7517] text-white rounded hover:bg-[#9A6010] transition-colors disabled:opacity-50"
        >
          {saving ? 'Desant...' : 'Desar'}
        </button>
      </div>
    </div>
  )
}

export default function FasePomes({ data }: Props) {
  const router = useRouter()
  const [pomes, setPomes] = useState<(Partial<Poma> & { _local?: boolean })[]>(data.pomes)

  function nextCodi() {
    return `Pom${pomes.length + 1}`
  }

  function addPoma() {
    setPomes(p => [...p, { codi: nextCodi(), jornada_id: data.jornada.id, _local: true }])
  }

  async function savePoma(idx: number, form: Partial<Poma>) {
    const poma = pomes[idx]

    if (poma.id) {
      await supabase.from('poma').update({
        varietat: form.varietat,
        origen: form.origen,
        maduracio: form.maduracio,
        camera_mesos: form.camera_mesos,
        pes_total_kg: form.pes_total_kg,
        pes_usat_kg: form.pes_usat_kg,
        notes: form.notes,
      }).eq('id', poma.id)
    } else {
      const { data: nova } = await supabase.from('poma').insert({
        jornada_id: data.jornada.id,
        codi: form.codi!,
        varietat: form.varietat ?? '',
        origen: form.origen,
        maduracio: form.maduracio,
        camera_mesos: form.camera_mesos,
        pes_total_kg: form.pes_total_kg,
        pes_usat_kg: form.pes_usat_kg,
        notes: form.notes,
      }).select().single()
      if (nova) {
        setPomes(p => p.map((item, i) => i === idx ? { ...nova, _local: false } : item))
      }
    }
    router.refresh()
  }

  async function deletePoma(idx: number) {
    const poma = pomes[idx]
    if (poma.id) {
      await supabase.from('poma').delete().eq('id', poma.id)
      router.refresh()
    }
    setPomes(p => p.filter((_, i) => i !== idx))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-mono text-stone-400 uppercase tracking-wider">Matèria primera — Pomes</p>
        <button onClick={addPoma} className="text-xs font-mono text-[#BA7517] hover:underline">
          + Afegir varietat
        </button>
      </div>

      {pomes.length === 0 && (
        <div className="border border-dashed border-stone-300 rounded-xl p-8 text-center">
          <p className="text-stone-400 font-mono text-sm">Cap varietat de poma afegida.</p>
        </div>
      )}

      {pomes.map((poma, idx) => (
        <PomaCard
          key={poma.id ?? `local-${idx}`}
          poma={poma}
          onDelete={() => deletePoma(idx)}
          onSave={(form) => savePoma(idx, form)}
        />
      ))}

      <div className="flex justify-end pt-2">
        <Link
          href={`/jornada/${data.jornada.id}?fase=triturat`}
          className="font-mono text-xs px-4 py-2 bg-[#BA7517] text-white rounded hover:bg-[#9A6010] transition-colors"
        >
          Següent: Triturat →
        </Link>
      </div>
    </div>
  )
}
