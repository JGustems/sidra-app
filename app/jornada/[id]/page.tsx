import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import FaseNav from '@/components/FaseNav'
import FasePomes from '@/components/fases/FasePomes'
import FaseTriturat from '@/components/fases/FaseTriturat'
import FasePremsat from '@/components/fases/FasePremsat'
import FaseBullit from '@/components/fases/FaseBullit'
import FaseFermentat from '@/components/fases/FaseFermentat'
import FaseEmbotellat from '@/components/fases/FaseEmbotellat'

export const revalidate = 0

function formatData(iso: string) {
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

export default async function JornadaPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { fase?: string }
}) {
  const { data: jornada, error } = await supabase
    .from('jornada')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !jornada) notFound()

  const j = jornada as NonNullable<typeof jornada>
  const fase = searchParams.fase ?? 'pomes'

  const [
    { data: pomes },
    { data: triturades },
    { data: premses },
    { data: ebullidors },
    { data: sucsDirectes },
    { data: fermentadors },
  ] = await Promise.all([
    supabase.from('poma').select('*').eq('jornada_id', j.id).order('codi'),
    supabase.from('triturada').select('*, triturada_origen(*)').eq('jornada_id', j.id).order('codi'),
    supabase.from('premsa').select('*, premsa_origen(*)').eq('jornada_id', j.id).order('codi'),
    supabase.from('ebullidor').select('*, ebullidor_origen(*)').eq('jornada_id', j.id).order('codi'),
    supabase.from('suc_directe').select('*, suc_directe_origen(*)').eq('jornada_id', j.id).order('codi'),
    supabase.from('fermentador').select('*, fermentador_origen(*)').eq('jornada_id', j.id).order('lot'),
  ])

  const jornadaData = {
    jornada: j,
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
        <Link href="/" className="text-xs text-stone-400 font-mono hover:text-stone-600">← Jornades</Link>
        <h2 className="font-serif italic text-2xl text-stone-800">{formatData(j.data)}</h2>
        {j.notes && <span className="text-xs text-stone-400">{j.notes}</span>}
      </div>

      <FaseNav jornadaId={jornada.id} faseActual={fase} />

      <div className="mt-6">
        {fase === 'pomes'      && <FasePomes      data={jornadaData} />}
        {fase === 'triturat'   && <FaseTriturat   data={jornadaData} />}
        {fase === 'premsat'    && <FasePremsat    data={jornadaData} />}
        {fase === 'bullit'     && <FaseBullit     data={jornadaData} />}
        {fase === 'fermentat'  && <FaseFermentat  data={jornadaData} />}
        {fase === 'embotellat' && <FaseEmbotellat data={jornadaData} />}
      </div>
    </div>
  )
}
