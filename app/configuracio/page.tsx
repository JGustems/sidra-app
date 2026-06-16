import { supabase } from '@/lib/supabase'
import GestioMails from '@/components/GestioMails'
import GestioTipus from '@/components/GestioTipus'

export const revalidate = 0

export default async function ConfiguracioPage() {
  const [
    { data: ampolles },
    { data: taps },
    { data: sucres },
    { data: mails },
  ] = await Promise.all([
    supabase.from('tipus_ampolla').select('*').order('ordre'),
    supabase.from('tipus_tap').select('*').order('ordre'),
    supabase.from('tipus_sucre').select('*').order('ordre'),
    supabase.from('mails_autoritzats').select('*').order('created_at'),
  ])

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '24px', color: '#f0ede8', fontWeight: 400, marginBottom: '4px' }}>
          Configuració
        </h2>
        <p style={{ fontSize: '11px', color: '#4a4846', fontFamily: 'DM Mono, monospace' }}>
          Ampolles, taps, sucre i usuaris
        </p>
      </div>

      <GestioMails mails={mails ?? []} />

      <div style={{ borderTop: '0.5px solid #252422', margin: '32px 0' }} />

      <GestioTipus
        ampolles={ampolles ?? []}
        taps={taps ?? []}
        sucres={sucres ?? []}
      />
    </div>
  )
}
