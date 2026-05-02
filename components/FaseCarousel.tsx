'use client'

import { useState } from 'react'
import FasePomes from '@/components/fases/FasePomes'
import FaseTriturat from '@/components/fases/FaseTriturat'
import FasePremsat from '@/components/fases/FasePremsat'
import FaseBullit from '@/components/fases/FaseBullit'
import FaseFermentat from '@/components/fases/FaseFermentat'
import FaseEmbotellat from '@/components/fases/FaseEmbotellat'

const FASES = [
  { id: 'pomes',      label: 'Pomes',      curt: 'P'  },
  { id: 'triturat',   label: 'Triturat',   curt: 'T'  },
  { id: 'premsat',    label: 'Premsat',    curt: 'Pr' },
  { id: 'bullit',     label: 'Bullit',     curt: 'B'  },
  { id: 'fermentat',  label: 'Fermentat',  curt: 'F'  },
  { id: 'embotellat', label: 'Embotellat', curt: 'E'  },
]

function FaseContent({ faseId, data, compact }: { faseId: string; data: unknown; compact?: boolean }) {
  const d = data as Record<string, unknown>
  if (faseId === 'pomes')      return <FasePomes      data={d as Parameters<typeof FasePomes>[0]['data']}    compact={compact} />
  if (faseId === 'triturat')   return <FaseTriturat   data={d as Parameters<typeof FaseTriturat>[0]['data']} compact={compact} />
  if (faseId === 'premsat')    return <FasePremsat    data={d} />
  if (faseId === 'bullit')     return <FaseBullit     data={d} />
  if (faseId === 'fermentat')  return <FaseFermentat  data={d} />
  if (faseId === 'embotellat') return <FaseEmbotellat data={d} />
  return null
}

function ColHeader({ label, state }: { label: string; state: 'prev2' | 'prev1' | 'active' | 'next1' | 'next2' }) {
  const styles = {
    prev2:  { background: '#0a2318', color: '#0F6E56' },
    prev1:  { background: '#0a2318', color: '#1D9E75' },
    active: { background: '#2a1800', color: '#EF9F27' },
    next1:  { background: '#1a1917', color: '#3a3835', border: '0.5px solid #252422' },
    next2:  { background: '#1a1917', color: '#2e2c2a', border: '0.5px solid #1e1d1b' },
  }
  return (
    <div style={{
      ...styles[state],
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '4px 8px', borderRadius: '6px', marginBottom: '8px',
      fontSize: '9px', fontFamily: 'DM Mono, monospace',
      textTransform: 'uppercase', letterSpacing: '0.09em',
    }}>
      <span>{label}</span>
      {(state === 'prev1' || state === 'prev2') && <span>✓</span>}
    </div>
  )
}

export default function FaseCarousel({ data }: { data: unknown }) {
  const [current, setCurrent] = useState(0)

  // Sempre 5 posicions: [-2, -1, 0, +1, +2] relatius a current
  const positions = [-2, -1, 0, 1, 2]
  const states = ['prev2', 'prev1', 'active', 'next1', 'next2'] as const
  const widths = [110, 150, 460, 150, 110]
  const opacities = [0.35, 0.65, 1, 0.45, 0.3]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

      {/* Carrusel sempre centrat */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
        {positions.map((offset, i) => {
          const idx = current + offset
          const state = states[i]
          const width = widths[i]
          const opacity = opacities[i]
          const isActive = offset === 0
          const hasContent = idx >= 0 && idx < FASES.length

          return (
            <div
              key={i}
              style={{ width: `${width}px`, flexShrink: 0, opacity: hasContent ? opacity : 0, transition: 'opacity 0.3s' }}
              onClick={hasContent && !isActive ? () => setCurrent(idx) : undefined}
              style2={{ cursor: hasContent && !isActive ? 'pointer' : 'default' }}
            >
              {hasContent && (
                <>
                  <ColHeader label={FASES[idx].label} state={state} />
                  <FaseContent faseId={FASES[idx].id} data={data} compact={!isActive} />
                </>
              )}
            </div>
          )
        })}
      </div>

      {/* Navegació */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        width: '100%', maxWidth: '990px',
        marginTop: '24px', paddingTop: '16px', borderTop: '0.5px solid #252422',
      }}>
        <button
          onClick={() => setCurrent(c => Math.max(0, c - 1))}
          disabled={current === 0}
          style={{
            fontFamily: 'DM Mono, monospace', fontSize: '11px', padding: '5px 14px',
            borderRadius: '5px', border: '0.5px solid #252422', background: 'none',
            color: '#7a7672', cursor: 'pointer', opacity: current === 0 ? 0.2 : 1,
          }}
        >
          ← Anterior
        </button>

        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          {FASES.map((f, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              title={f.label}
              style={{
                width: i === current ? '16px' : '6px', height: '6px',
                borderRadius: '3px', border: 'none', cursor: 'pointer', padding: 0,
                background: i < current ? '#1D9E75' : i === current ? '#BA7517' : '#252422',
                transition: 'all 0.25s',
              }}
            />
          ))}
        </div>

        <button
          onClick={() => setCurrent(c => Math.min(FASES.length - 1, c + 1))}
          disabled={current === FASES.length - 1}
          style={{
            fontFamily: 'DM Mono, monospace', fontSize: '11px', padding: '5px 14px',
            borderRadius: '5px', border: 'none', background: '#BA7517',
            color: '#fff', cursor: 'pointer', opacity: current === FASES.length - 1 ? 0.2 : 1,
          }}
        >
          Següent →
        </button>
      </div>
    </div>
  )
}
