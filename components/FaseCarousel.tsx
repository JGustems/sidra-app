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

type ColState = 'prev2' | 'prev1' | 'active' | 'next1' | 'next2'

export default function FaseCarousel({ data }: { data: unknown }) {
  const [current, setCurrent] = useState(0)

  // Columnes esquerra (màx 2)
  const leftCols: { idx: number; state: ColState }[] = []
  if (current - 2 >= 0) leftCols.push({ idx: current - 2, state: 'prev2' })
  if (current - 1 >= 0) leftCols.push({ idx: current - 1, state: 'prev1' })

  // Columnes dreta (màx 2)
  const rightCols: { idx: number; state: ColState }[] = []
  if (current + 1 < FASES.length) rightCols.push({ idx: current + 1, state: 'next1' })
  if (current + 2 < FASES.length) rightCols.push({ idx: current + 2, state: 'next2' })

  const sideWidth = { prev2: '110px', prev1: '150px', next1: '150px', next2: '110px' }
  const sideOpacity = { prev2: 0.35, prev1: 0.65, next1: 0.45, next2: 0.3 }

  return (
    <div>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>

        {/* Sidebar vertical */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flexShrink: 0, paddingTop: '30px', width: '36px' }}>
          {FASES.map((fase, i) => (
            <button
              key={fase.id}
              onClick={() => setCurrent(i)}
              title={fase.label}
              style={{
                width: '32px', height: '32px', borderRadius: '7px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '9px', fontWeight: '500', fontFamily: 'DM Mono, monospace',
                cursor: 'pointer',
                background: i === current ? '#2a1800' : i < current ? '#0a2318' : 'transparent',
                color: i === current ? '#EF9F27' : i < current ? '#1D9E75' : '#4a4846',
                border: i >= current ? '0.5px solid #252422' : 'none',
                transition: 'all 0.2s',
              }}
            >
              {fase.curt}
            </button>
          ))}
        </div>

        {/* Columnes esquerra */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', flexShrink: 0 }}>
          {leftCols.map(({ idx, state }) => (
            <div
              key={idx}
              style={{ width: sideWidth[state as keyof typeof sideWidth], opacity: sideOpacity[state as keyof typeof sideOpacity], cursor: 'pointer', transition: 'opacity 0.3s', flexShrink: 0 }}
              onClick={() => setCurrent(idx)}
            >
              <ColHeader label={FASES[idx].label} state={state} />
              <FaseContent faseId={FASES[idx].id} data={data} compact />
            </div>
          ))}
          {/* Espai buit si no hi ha 2 columnes esquerra */}
          {leftCols.length < 2 && (
            <div style={{ width: leftCols.length === 0 ? '270px' : '110px', flexShrink: 0 }} />
          )}
        </div>

        {/* Columna activa */}
        <div style={{ width: '460px', flexShrink: 0 }}>
          <ColHeader label={FASES[current].label} state="active" />
          <FaseContent faseId={FASES[current].id} data={data} />
        </div>

        {/* Columnes dreta — enganxades a la central */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', flexShrink: 0 }}>
          {rightCols.map(({ idx, state }) => (
            <div
              key={idx}
              style={{ width: sideWidth[state as keyof typeof sideWidth], opacity: sideOpacity[state as keyof typeof sideOpacity], cursor: 'pointer', transition: 'opacity 0.3s', flexShrink: 0 }}
              onClick={() => setCurrent(idx)}
            >
              <ColHeader label={FASES[idx].label} state={state} />
              <FaseContent faseId={FASES[idx].id} data={data} compact />
            </div>
          ))}
        </div>

      </div>

      {/* Navegació inferior */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
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
