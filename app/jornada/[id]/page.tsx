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
    { data: tipusAmpolles },
    { data: tipusTaps },
    { data: tipusSucres },
     { data: mails },
  ] = await Promise.all([
    supabase.from('poma').select('*').eq('jornada_id', jornada.id).order('codi'),
    supabase.from('triturada').select('*, triturada_origen(*)').eq('jornada_id', jornada.id).order('codi'),
    supabase.from('premsa').select('*, premsa_origen(*)').eq('jornada_id', jornada.id).order('codi'),
    supabase.from('ebullidor').select('*, ebullidor_origen(*)').eq('jornada_id', jornada.id).order('codi'),
    supabase.from('suc_directe').select('*, suc_directe_origen(*)').eq('jornada_id', jornada.id).order('codi'),
    supabase.from('fermentador').select('*, fermentador_origen(*), embotellat(*, embotellat_bloc(*), repartiment(*))').eq('jornada_id', jornada.id).order('lot'),
    supabase.from('tipus_ampolla').select('*').order('ordre'),
    supabase.from('tipus_tap').select('*').order('ordre'),
    supabase.from('tipus_sucre').select('*').order('ordre'),
    supabase.from('mails_autoritzats').select('*').eq('actiu', true).order('email'),
  ])
    


  const jornadaData = {
    jornada,
    pomes: pomes ?? [],
    triturades: triturades ?? [],
    premses: premses ?? [],
    ebullidors: ebullidors ?? [],
    sucsDirectes: sucsDirectes ?? [],
    fermentadors: fermentadors ?? [],
    tipusAmpolles: tipusAmpolles ?? [],
    tipusTaps: tipusTaps ?? [],
    tipusSucres: tipusSucres ?? [],
    mails: mails ?? [],
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px', marginBottom: '24px' }}>
        <Link href="/" style={{ fontSize: '11px', color: '#5a5854', fontFamily: 'DM Mono, monospace', textDecoration: 'none' }}>
          ← Jornades
        </Link>
        <h2 style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '22px', color: '#f0ede8', fontWeight: 400 }}>
          {formatData(jornada.data)}
        </h2>
        {jornada.notes && (
          <span style={{ fontSize: '11px', color: '#5a5854', fontFamily: 'DM Mono, monospace' }}>
            {jornada.notes}
          </span>
        )}
      </div>
      <FaseCarousel data={jornadaData} />
    </div>
  )
}
