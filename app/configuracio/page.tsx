import { supabase } from '@/lib/supabase'
import GestioMails from '@/components/GestioMails'

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

      {/* Mails autoritzats */}
      <GestioMails mails={mails ?? []} />

      {/* Separador */}
      <div style={{ borderTop: '0.5px solid #252422', margin: '32px 0' }} />

      {/* Ampolles, taps, sucre */}
      {[
        { title: 'Ampolles', items: ampolles ?? [], extra: (i: Record<string, unknown>) => `${i.mida_cl}cl` },
        { title: 'Taps',     items: taps ?? [],     extra: () => '' },
        { title: 'Sucre',    items: sucres ?? [],   extra: (i: Record<string, unknown>) => i.quantitat_g ? `${i.quantitat_g}g` : '—' },
      ].map(({ title, items, extra }) => (
        <div key={title} style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <p style={{ fontSize: '9px', color: '#4a4846', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'DM Mono, monospace' }}>
              {title}
            </p>
            <button style={{ fontSize: '10px', color: '#BA7517', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'DM Mono, monospace' }}>
              + Afegir
            </button>
          </div>
          <div style={{ background: '#1a1917', border: '0.5px solid #252422', borderRadius: '10px', overflow: 'hidden' }}>
            {items.map((item: Record<string, unknown>, idx: number) => (
              <div
                key={item.id as number}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 16px',
                  borderBottom: idx < items.length - 1 ? '0.5px solid #1e1d1b' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '10px', color: '#4a4846', fontFamily: 'DM Mono, monospace', width: '28px' }}>
                    {item.codi as string}
                  </span>
                  <span style={{ fontSize: '12px', color: '#c8c4be', fontFamily: 'DM Mono, monospace' }}>
                    {item.nom as string}
                  </span>
                  {extra(item) && (
                    <span style={{ fontSize: '10px', color: '#5a5854', fontFamily: 'DM Mono, monospace' }}>
                      {extra(item)}
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{
                    fontSize: '9px', padding: '2px 8px', borderRadius: '10px', fontFamily: 'DM Mono, monospace',
                    background: item.actiu ? '#0a2318' : '#1e1d1b',
                    color: item.actiu ? '#1D9E75' : '#4a4846',
                  }}>
                    {item.actiu ? 'actiu' : 'inactiu'}
                  </span>
                  <button style={{ fontSize: '10px', color: '#4a4846', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'DM Mono, monospace' }}>
                    editar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
