import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import type { Jornada } from '@/lib/types'
import { colors } from '@/lib/theme'

export const revalidate = 0

async function getJornades(): Promise<Jornada[]> {
  const { data, error } = await supabase
    .from('jornada')
    .select('*')
    .order('data', { ascending: false })
  if (error) return []
  return data ?? []
}

async function getLots(jornadaId: number): Promise<string[]> {
  const { data, error } = await supabase
    .from('fermentador')
    .select('lot')
    .eq('jornada_id', jornadaId)
    .not('lot', 'is', null)
    .order('lot', { ascending: true })
  
  if (error || !data) return []
  
  // Filtrar els lots únics i sense valors buits
  const lotsUnics = Array.from(new Set(
    data
      .map(f => f.lot)
      .filter((lot): lot is string => lot !== null && lot !== '')
  ))
  
  return lotsUnics
}

function formatData(iso: string) {
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

export default async function HomePage() {
  const jornades = await getJornades()

  // Carregar lots per a cada jornada
  const jornadesAmbLots = await Promise.all(
    jornades.map(async (j) => ({
      ...j,
      lots: await getLots(j.id),
    }))
  )

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '24px', color: colors.textHi, fontWeight: 400 }}>
            Jornades de producció
          </h2>
          <p style={{ fontSize: '11px', color: colors.text3, fontFamily: 'DM Mono, monospace', marginTop: '4px' }}>
            {jornades.length} jornades registrades
          </p>
        </div>
        <Link href="/jornada/nova" style={{
          fontFamily: 'DM Mono, monospace', fontSize: '11px',
          padding: '6px 14px', borderRadius: '6px',
          background: colors.teal, color: '#fff',
          textDecoration: 'none',
        }}>
          + Nova jornada
        </Link>
      </div>

      {jornades.length === 0 ? (
        <div style={{
          border: `0.5px dashed ${colors.border}`, borderRadius: '10px',
          padding: '48px', textAlign: 'center',
        }}>
          <p style={{ color: colors.text2, fontFamily: 'DM Mono, monospace', fontSize: '13px' }}>
            Cap jornada registrada encara.
          </p>
          <Link href="/jornada/nova" style={{
            color: colors.teal, fontFamily: 'DM Mono, monospace',
            fontSize: '12px', marginTop: '8px', display: 'inline-block',
          }}>
            Crea la primera jornada →
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {jornadesAmbLots.map((j) => (
            <Link
              key={j.id}
              href={`/jornada/${j.id}`}
              style={{
                display: 'block', textDecoration: 'none',
                background: colors.bg2, border: `0.5px solid ${colors.border}`,
                borderRadius: '10px', padding: '14px 18px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                  <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '14px', fontWeight: '500', color: colors.textHi }}>
                    {formatData(j.data)}
                  </span>
                  {j.notes && (
                    <span style={{ fontSize: '11px', color: colors.text2, fontFamily: 'DM Mono, monospace' }}>
                      {j.notes}
                    </span>
                  )}
                </div>
                <span style={{ fontSize: '11px', color: colors.text3, fontFamily: 'DM Mono, monospace' }}>
                  Obrir →
                </span>
              </div>
              {j.lots.length > 0 && (
                <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: `0.5px solid ${colors.border}` }}>
                  <span style={{ fontSize: '10px', color: colors.text3, fontFamily: 'DM Mono, monospace' }}>
                    Lots: <span style={{ color: colors.amber, fontWeight: '500' }}>{j.lots.join(', ')}</span>
                  </span>
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
