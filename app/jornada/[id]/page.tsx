import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import FaseCarousel from '@/components/FaseCarousel'
import type { Jornada } from '@/lib/types'

export const revalidate = 0

function formatData(iso: string) {
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

export default async function JornadaPage({
  params,
}: {
  params: { id: string }
}) {
  const { data, error } = await supabase
    .from('jornada')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !data) notFound()

  const jornada = data as Jornada

  const [
    { data: pomes },
    { data: triturades },
    { data: premses },
    { data: ebullidors },
    { data: sucsDirectes },
    { data: fermentadors },
  ] = await Promise.all([
    supabase.from('poma').select('*').eq('jornada_id', jornada.id).order('codi'),
    supabase.from('triturada').select('*, triturada_origen(*)').eq('jornada_id', jornada.id).order('codi'),
    supabase.from('premsa').select('*, premsa_origen(*)').eq('jornada_id', jornada.id).order('codi'),
    supabase.from('ebullidor').select('*, ebullidor_origen(*)').eq('jornada_id', jornada.id).order('codi'),
    supabase.from('suc_directe').select('*, suc_directe_origen(*)').eq('jornada_id', jornada.id).order('codi'),
    supabase.from('fermentador').select('*, fermentador_origen(*)').eq('jornada_id', jornada.id).order('lot'),
  ])

  const jornadaData = {
    jornada,
    pomes: pomes ?? [],
    triturades: triturades ?? [],
    premses: premses ?? [],
    ebullidors: ebullidors ?? [],
    sucsDirectes: sucsDirectes ?? [],
    fermentadors: fermentadors ?? [],
  }

  return (
    <div>
      <div className="flex items-baseline gap-4 mb-6">
        <Link href="/" className="text-xs text-stone-400 font-mono hover:text-stone-600">
          ← Jornades
        </Link>
        <h2 className="font-serif italic text-2xl text-stone-800">
          {formatData(jornada.data)}
        </h2>
        {jornada.notes && (
          <span className="text-xs text-stone-400">{jornada.notes}</span>
        )}
      </div>

      <FaseCarousel data={jornadaData} />
    </div>
  )
}
