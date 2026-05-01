'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { Triturada, TritaradaOrigen, Poma } from '@/lib/types'

type TritaradaAmbOrigen = Triturada & { triturada_origen: TritaradaOrigen[] }

interface Props {
  data: {
    jornada: { id: number }
    pomes: Poma[]
    triturades: TritaradaAmbOrigen[]
  }
  compact?: boolean
}

function TritaradaCard({ triturada, pomes, onDelete, onSave, compact }: {
  triturada: Partial<TritaradaAmbOrigen> & { _local?: boolean }
  pomes: Poma[]
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

  const totalEntrada = origens.reduce((s, o) => s + (o.pes_kg || 0), 0)
  const balancOk = form.pes_kg ? Math.abs(totalEntrada - form.pes_kg) < 0.1 : false

  function addOrigen() {
    if (pomes.length === 0) return
    setOrigens(o => [...o, { poma_id: pomes[0].id, pes_kg: 0 }])
  }

  function updateOrigen(idx: number, field: string, value: unknown) {
    setOrigens(o => o.map((item, i) => i === idx ? { ...item, [field]: value } : item))
  }

  async function save() {
    setSaving(true)
    await onSave({ ...form, triturada_origen: origens.map(o => ({ ...o, triturada_id: triturada.id ?? 0, id: 0 })) })
    setSaving(false)
    setEditing(false)
  }

  if (compact) return (
    <div className="bg-white border border-stone-200 rounded-lg p-3 mb-2">
      <div className="text-xs font-mono font-medium text-stone-700 mb-2">{form.codi}</div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-stone-400">Passades</span>
        <span className="text-stone-700 font-medium">{form.passades ?? '—'}</span>
      </div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-stone-400">Pes</span>
        <span className="text-stone-700 font-medium">{form.pes_kg ? `${form.pes_kg} kg` : '—'}</span>
      </div>
      <div className="flex justify-between text-xs">
        <span className="text-stone-400">Origens</span>
        <span className="text-stone-700 font-medium">{origens.length} poma(es)</span>
      </div>
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
          { label: 'Passades', value: form.passades },
          { label: 'Pes total (kg)', value: form.pes_kg },
          { label: 'Notes', value: form.notes },
        ].map((f, i) => (
          <div key={f.label} className={`px-4 py-2.5 ${i < 2 ? 'border-b border-stone-100' : ''}`}>
            <div className="text-xs text-stone-400 uppercase tracking-wide mb-1">{f.label}</div>
            <div className={`text-sm font-mono font-medium ${f.value ? 'text-stone-800' : 'text-stone-300 italic'}`}>
              {f.value ?? '—'}
            </div>
          </div>
        ))}
        <div className="px-4 py-2.5 border-t border-stone-100">
          <div className="text-xs text-stone-400 uppercase tracking-wide mb-2">Origen (pomes)</div>
          {origens.map((o, i) => {
            const poma = pomes.find(p => p.id === o.poma_id)
            return (
              <div key={i} className="flex justify-between text-sm font-mono mb-1">
                <span className="text-stone-600">{poma?.codi ?? '—'} ({poma?.varietat})</span>
                <span className="text-stone-800 font-medium">{o.pes_kg} kg</span>
              </div>
            )
          })}
        </div>
        <div className={`mx-4 mb-3 px-3 py-1.5 rounded text-xs font-mono ${balancOk ? 'bg-[#E1F5EE] text-[#0F6E56]' : 'bg-[#FAEEDA] text-[#854F0B]'}`}>
          Entrada: {totalEntrada} kg {form.pes_kg ? `/ Pes declarat: ${form.pes_kg} kg` : ''} {balancOk ? '✓' : '⚠ revisa els pesos'}
        </div>
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
          { label: 'Passades', field: 'passades', type: 'number' },
          { label: 'Pes total (kg)', field: 'pes_kg', type: 'number' },
          { label: 'Notes', field: 'notes', type: 'text' },
        ].map((f, i) => (
          <div key={f.field} className={`px-4 py-2.5 ${i < 2 ? 'border-b border-stone-100' : ''}`}>
            <div className="text-xs text-stone-400 uppercase tracking-wide mb-1">{f.label}</div>
            <input
              type={f.type}
              value={(form as Record<string, unknown>)[f.field] as string ?? ''}
              onChange={e => setForm(fm => ({ ...fm, [f.field]: f.type === 'number' ? parseFloat(e.target.value) || null : e.target.value }))}
              className="w-full font-mono text-sm bg-transparent border-b border-stone-200 focus:border-[#BA7517] outline-none py-0.5 text-stone-800"
            />
          </div>
        ))}

        <div className="px-4 py-2.5 border-t border-stone-100">
          <div className="text-xs text-stone-400 uppercase tracking-wide mb-2">Origen (pomes)</div>
          {origens.map((o, i) => (
            <div key={i} className="flex gap-2 items-center mb-2">
              <select
                value={o.poma_id}
                onChange={e => updateOrigen(i, 'poma_id', parseInt(e.target.value))}
                className="font-mono text-sm border border-stone-200 rounded px-2 py-1 flex-1 focus:outline-none focus:border-[#BA7517]"
              >
                {pomes.map(p => <option key={p.id} value={p.id}>{p.codi} — {p.varietat}</option>)}
              </select>
              <input
                type="number"
                value={o.pes_kg || ''}
                onChange={e => updateOrigen(i, 'pes_kg', parseFloat(e.target.value) || 0)}
                placeholder="kg"
                className="font-mono text-sm border border-stone-200 rounded px-2 py-1 w-20 focus:outline-none focus:border-[#BA7517]"
              />
              <span className="text-xs text-stone-400">kg</span>
              <button onClick={() => setOrigens(o => o.filter((_, j) => j !== i))} className="text-stone-300 hover:text-red-400 text-xs transition-colors">✕</button>
            </div>
          ))}
          <button onClick={addOrigen} className="text-xs font-mono text-[#BA7517] hover:underline mt-1">
            + Afegir origen
          </button>
        </div>

        <div className={`mx-4 mb-3 px-3 py-1.5 rounded text-xs font-mono ${balancOk ? 'bg-[#E1F5EE] text-[#0F6E56]' : 'bg-[#FAEEDA] text-[#854F0B]'}`}>
          Entrada: {totalEntrada} kg {form.pes_kg ? `/ Pes declarat: ${form.pes_kg} kg` : ''} {balancOk ? '✓' : '⚠ revisa els pesos'}
        </div>
      </div>
      <div className="flex justify-end gap-2 px-4 py-2 border-t border-stone-100">
        <button onClick={onDelete} className="text-xs font-mono text-stone-300 hover:text-red-400 px-3 py-1 transition-colors">Eliminar</button>
        <button onClick={() => setEditing(false)} className="text-xs font-mono text-stone-400 border border-stone-200 px-3 py-1 rounded hover:bg-stone-50 transition-colors">Cancel·lar</button>
        <button onClick={save} disabled={saving} className="text-xs font-mono bg-[#BA7517] text-white px-4 py-1 rounded hover:bg-[#854F0B] transition-colors disabled:opacity-50">
          {saving ? 'Desant...' : 'Desar'}
        </button>
      </div>
    </div>
  )
}

export default function FaseTriturat({ data, compact }: Props) {
  const router = useRouter()
  const [triturades, setTriturades] = useState<(Partial<TritaradaAmbOrigen> & { _local?: boolean })[]>(data.triturades)

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
    if (t.id) { await supabase.from('triturada').delete().eq('id', t.id); router.refresh() }
    setTriturades(tr => tr.filter((_, i) => i !== idx))
  }

  if (compact) return (
    <div>
      {triturades.map((t, idx) => (
        <TritaradaCard key={t.id ?? `local-${idx}`} triturada={t} pomes={data.pomes} compact
          onDelete={() => deleteTriturada(idx)} onSave={f => saveTriturada(idx, f)} />
      ))}
    </div>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-mono text-stone-400 uppercase tracking-wider">Triturat</p>
        <button onClick={addTriturada} className="text-xs font-mono text-[#BA7517] hover:underline">+ Afegir triturada</button>
      </div>
      {triturades.length === 0 && (
        <div className="border border-dashed border-stone-200 rounded-xl p-8 text-center">
          <p className="text-stone-400 font-mono text-sm">Cap triturada afegida.</p>
        </div>
      )}
      {triturades.map((t, idx) => (
        <TritaradaCard key={t.id ?? `local-${idx}`} triturada={t} pomes={data.pomes}
          onDelete={() => deleteTriturada(idx)} onSave={f => saveTriturada(idx, f)} />
      ))}
    </div>
  )
}
