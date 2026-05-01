import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import type { Jornada } from '@/lib/types'

export const revalidate = 0

async function getJornades(): Promise<Jornada[]> {
  const { data, error } = await supabase
    .from('jornada')
    .select('*')
    .order('data', { ascending: false })

  if (error) {
    console.error(error)
    return []
  }
  return data ?? []
}

function formatData(iso: string) {
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

export default async function HomePage() {
  const jornades = await getJornades()

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-serif italic text-2xl text-stone-800">Jornades de producció</h2>
          <p className="text-xs text-stone-400 font-mono mt-1">{jornades.length} jornades registrades</p>
        </div>
        <Link
          href="/jornada/nova"
          className="font-mono text-xs px-4 py-2 bg-[#BA7517] text-white rounded hover:bg-[#9A6010] transition-colors"
        >
          + Nova jornada
        </Link>
      </div>

      {jornades.length === 0 ? (
        <div className="border border-dashed border-stone-300 rounded-xl p-12 text-center">
          <p className="text-stone-400 font-mono text-sm">Cap jornada registrada encara.</p>
          <Link href="/jornada/nova" className="text-[#BA7517] font-mono text-sm mt-2 inline-block hover:underline">
            Crea la primera jornada →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {jornades.map((j) => (
            <Link
              key={j.id}
              href={`/jornada/${j.id}`}
              className="block bg-white border border-stone-200 rounded-xl px-5 py-4 hover:border-[#BA7517] transition-colors group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-baseline gap-4">
                  <span className="font-mono text-sm font-medium text-stone-800">
                    {formatData(j.data)}
                  </span>
                  {j.notes && (
                    <span className="text-xs text-stone-400 truncate max-w-xs">{j.notes}</span>
                  )}
                </div>
                <span className="text-xs text-stone-400 group-hover:text-[#BA7517] transition-colors">
                  Obrir →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
