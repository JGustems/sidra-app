import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import type { Jornada } from '@/lib/types'

export const revalidate = 0

async function getJornades(): Promise<Jornada[]> {
  const { data, error } = await supabase
    .from('jornada')
    .select('*')
    .order('data', { ascending: false })
  if (error) return []
  return data ?? []
}

function formatData(iso: string) {
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

export default async function HomePage() {
  const jornades = await getJornades()

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '24px', color: '#f0ede8', fontWeight: 400 }}>
            Jornades de producció
          </h2>
          <p style={{ fontSize: '11px', color: '#4a4846', fontFamily: 'DM Mono, monospace', marginTop: '4px' }}>
            {jornades.length} jornades registrades
          </p>
        </div>
        <Link href="/jornada/nova" style={{
          fontFamily: 'DM Mono, monospace', fontSize: '11px',
          padding: '6px 14px', borderRadius: '6px',
          background: '#BA7517', color: '#fff',
          textDecoration: 'none',
        }}>
          + Nova jornada
        </Link>
      </div>

      {jornades.length === 0 ? (
        <div style={{
          border: '0.5px dashed #252422', borderRadius: '10px',
          padding: '48px', textAlign: 'center',
        }}>
          <p style={{ color: '#4a4846', fontFamily: 'DM Mono, monospace', fontSize: '13px' }}>
            Cap jornada registrada encara.
          </p>
          <Link href="/jornada/nova" style={{
            color: '#BA7517', fontFamily: 'DM Mono, monospace',
            fontSize: '12px', marginTop: '8px', display: 'inline-block',
          }}>
            Crea la primera jornada →
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {jornades.map((j) => (
            <Link
              key={j.id}
              href={`/jornada/${j.id}`}
              style={{
                display: 'block', textDecoration: 'none',
                background: '#1a1917', border: '0.5px solid #252422',
                borderRadius: '10px', padding: '14px 18px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                  <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '14px', fontWeight: '500', color: '#f0ede8' }}>
                    {formatData(j.data)}
                  </span>
                  {j.notes && (
                    <span style={{ fontSize: '11px', color: '#5a5854', fontFamily: 'DM Mono, monospace' }}>
                      {j.notes}
                    </span>
                  )}
                </div>
                <span style={{ fontSize: '11px', color: '#4a4846', fontFamily: 'DM Mono, monospace' }}>
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
