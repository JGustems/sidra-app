'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function NovaJornadaPage() {
  const router = useRouter()
  const [data, setData] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: nova, error: err } = await (supabase as any)
      .from('jornada')
      .insert({ data, notes: notes || null })
      .select()
      .single()

    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }

    router.push(`/jornada/${nova.id}`)
  }

  return (
    <div className="max-w-md">
      <div className="mb-8">
        <h2 className="font-serif italic text-2xl text-stone-800">Nova jornada</h2>
        <p className="text-xs text-stone-400 font-mono mt-1">Inici d&apos;un nou dia de producció</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-white border border-stone-200 rounded-xl p-5 space-y-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-stone-400 font-mono">Data</label>
            <input
              type="date"
              value={data}
              onChange={e => setData(e.target.value)}
              required
              className="font-mono text-sm border border-stone-200 rounded px-3 py-2 focus:outline-none focus:border-[#BA7517]"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-stone-400 font-mono">Notes (opcional)</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              placeholder="Observacions generals de la jornada..."
              className="font-mono text-sm border border-stone-200 rounded px-3 py-2 focus:outline-none focus:border-[#BA7517] resize-none"
            />
          </div>
        </div>

        {error && (
          <p className="text-xs text-red-600 font-mono bg-red-50 px-3 py-2 rounded">{error}</p>
        )}

        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={() => router.back()}
            className="font-mono text-xs px-4 py-2 border border-stone-200 rounded hover:bg-stone-50 transition-colors"
          >
            Cancel·lar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="font-mono text-xs px-4 py-2 bg-[#BA7517] text-white rounded hover:bg-[#9A6010] transition-colors disabled:opacity-50"
          >
            {loading ? 'Creant...' : 'Crear jornada →'}
          </button>
        </div>
      </form>
    </div>
  )
}
