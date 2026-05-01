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

  const pesDiff = form.pes_total_kg ? Math.abs(pesUsat - form.pes_total_kg) : null
  const balancOk = pesDiff !== null && pesDiff < 0.5

  if (compact) return (
    <div className="bg-white border border-stone-200 rounded-lg p-3 mb-2">
      <div className="text-xs font-mono font-medium text-stone-700 mb-2">{form.codi}</div>
      {[
        { label: 'Varietat', value: form.varietat },
        { label: 'Pes total', value: form.pes_total_kg ? `${form.pes_total_kg} kg` : null },
        { label: 'Pes usat', value: pesUsat > 0 ? `${pesUsat} kg` : null },
      ].map(f => (
        <div key={f.label} className="flex justify-between text-xs mb-1">
          <span className="text-stone-400">{f.label}</span>
          <span className="text-stone-700 font-medium">{f.value || '—'}</span>
        </div>
      ))}
    </div>
  )

  if (!editing) return (
    <div className="bg-white border border-stone-200 rounded-xl overflow-hidden mb-3">
      <div className="flex items-center justify-between px-4 py-2 border-b border-stone-100">
        <span className="font-mono text-sm font-medium bg-stone-100 px-2 py-0.5 rounded">{form.codi}</span>
        <span className="text-xs font-mono text-[#0F6E56] bg-[#E1F5EE] px-2 py-0.5 rounded-full">desat</span>
      </div>
      <div>
        {[
          { label: 'Varietat', value: form.varietat },
          { label: 'Origen', value: form.origen },
          { label: 'Maduració', value: form.maduracio },
          { label: 'Càmera (mesos)', value: form.camera_mesos },
          { label: 'Pes total (kg)', value: form.pes_total_kg },
        ].map((f, i) => (
          <div key={f.label} className={`px-4 py-2.5 border-b border-stone-100`}>
            <div className="text-xs text-stone-400 uppercase tracking-wide mb-1">{f.label}</div>
            <div className={`text-sm font-mono font-medium ${f.value ? 'text-stone-800' : 'text-stone-300 italic'}`}>
              {f.value ?? '—'}
            </div>
          </div>
        ))}
        <div className="px-4 py-2.5 border-b border-stone-100">
          <div className="text-xs text-stone-400 uppercase tracking-wide mb-1">Pes usat (kg)</div>
          <div className="text-sm font-mono font-medium text-stone-800">
            {pesUsat > 0 ? `${pesUsat} kg` : <span className="text-stone-300 italic">—</span>}
          </div>
          <div className="text-xs text-stone-400 mt-0.5">calculat de les triturades</div>
        </div>
        {pesUsat > 0 && form.pes_total_kg && (
          <div className={`mx-4 my-2 px-3 py-1.5 rounded text-xs font-mono ${balancOk ? 'bg-[#E1F5EE] text-[#0F6E56]' : 'bg-[#FAEEDA] text-[#854F0B]'}`}>
            {balancOk
              ? `Balanç correcte: ${pesUsat} kg usats de ${form.pes_total_kg} kg ✓`
              : `Diferència: ${pesUsat} kg usats vs ${form.pes_total_kg} kg totals`}
          </div>
        )}
      </div>
      <div className="flex justify-end px-4 py-2 border-t border-stone-100">
        <button onClick={() => setEditing(true)} className="text-xs font-mono text-stone-400 border border-stone-200 px-3 py-1 rounded hover:bg-stone-50 transition-colors">
          Editar
        </button>
      </div>
    </div>
  )

  return (
    <div className="bg-white border border-[#EF9F27] rounded-xl overflow-hidden mb-3">
      <div className="flex items-center justify-between px-4 py-2 border-b border-stone-100">
        <span className="font-mono text-sm font-medium bg-stone-100 px-2 py-0.5 rounded">{form.codi}</span>
        <span className="text-xs font-mono text-[#854F0B] bg-[#FAEEDA] px-2 py-0.5 rounded-full">editant</span>
      </div>
      <div>
        {[
          { label: 'Varietat', field: 'varietat', type: 'text' },
          { label: 'Origen', field: 'origen', type: 'text' },
          { label: 'Càmera (mesos)', field: 'camera_mesos', type: 'number' },
          { label: 'Pes total (kg)', field: 'pes_total_kg', type: 'number' },
        ].map((f) => (
          <div key={f.field} className="px-4 py-2.5 border-b border-stone-100">
            <div className="text-xs text-stone-400 uppercase tracking-wide mb-1">{f.label}</div>
            <input
              type={f.type}
              value={(form as Record<string, unknown>)[f.field] as string ?? ''}
              onChange={e => update(f.field, f.type === 'number' ? parseFloat(e.target.value) || null : e.target.value)}
              className="w-full font-mono text-sm bg-transparent border-b border-stone-200 focus:border-[#BA7517] outline-none py-0.5 text-stone-800"
            />
          </div>
        ))}
        <div className="px-4 py-2.5 border-b border-stone-100">
          <div className="text-xs text-stone-400 uppercase tracking-wide mb-1">Maduració</div>
          <select
            value={form.maduracio ?? ''}
            onChange={e => update('maduracio', e.target.value || null)}
            className="w-full font-mono text-sm bg-transparent border-b border-stone-200 focus:border-[#BA7517] outline-none py-0.5 text-stone-800"
          >
            <option value="">—</option>
            {['Verd', 'Punt', 'Passat'].map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div className="px-4 py-2.5">
          <div className="text-xs text-stone-400 uppercase tracking-wide mb-1">Pes usat (kg)</div>
          <div className="text-sm font-mono text-stone-400 italic">
            {pesUsat > 0 ? `${pesUsat} kg — calculat automàticament` : 'Es calcularà de les triturades'}
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2 px-4 py-2 border-t border-stone-100">
        <button onClick={onDelete} className="text-xs font-mono text-stone-300 hover:text-red-400 px-3 py-1 transition-colors">
          Eliminar
        </button>
        <button onClick={() => setEditing(false)} className="text-xs font-mono text-stone-400 border border-stone-200 px-3 py-1 rounded hover:bg-stone-50 transition-colors">
          Cancel·lar
        </button>
        <button onClick={save} disabled={saving} className="text-xs font-mono bg-[#BA7517] text-white px-4 py-1 rounded hover:bg-[#854F0B] transition-colors disabled:opacity-50">
          {saving ? 'Desant...' : 'Desar'}
        </button>
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
    </div>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-mono text-stone-400 uppercase tracking-wider">Pomes</p>
        <button onClick={addPoma} className="text-xs font-mono text-[#BA7517] hover:underline">+ Afegir varietat</button>
      </div>
      {pomes.length === 0 && (
        <div className="border border-dashed border-stone-200 rounded-xl p-8 text-center">
          <p className="text-stone-400 font-mono text-sm">Cap varietat afegida.</p>
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
