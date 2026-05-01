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
  const s = styles[state]
  return (
    <div className="flex items-center justify-between px-2 py-1.5 rounded-md mb-2 text-xs font-mono uppercase tracking-wider"
      style={s}>
      <span>{label}</span>
      {(state === 'prev1' || state === 'prev2') && <span style={{ fontSize: '10px' }}>✓</span>}
    </div>
  )
}

export default function FaseCarousel({ data }: { data: unknown }) {
  const [current, setCurrent] = useState(0)

  const cols: { idx: number; state: 'prev2' | 'prev1' | 'active' | 'next1' | 'next2'; empty?: boolean }[] = []
if (current - 2 >= 0) cols.push({ idx: current - 2, state: 'prev2' })
else cols.push({ idx: -2, state: 'prev2', empty: true })
if (current - 1 >= 0) cols.push({ idx: current - 1, state: 'prev1' })
else cols.push({ idx: -1, state: 'prev1', empty: true })
cols.push({ idx: current, state: 'active' })
if (current + 1 < FASES.length) cols.push({ idx: current + 1, state: 'next1' })
else cols.push({ idx: -3, state: 'next1', empty: true })
if (current + 2 < FASES.length) cols.push({ idx: current + 2, state: 'next2' })
else cols.push({ idx: -4, state: 'next2', empty: true })

  const widths = {
    prev2:  '120px',
    prev1:  '160px',
    active: '1fr',
    next1:  '160px',
    next2:  '120px',
  }

  return (
    <div>
      {/* Sidebar + Carrusel */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>

        {/* Sidebar vertical */}
        <div style={{
          display: 'flex', flexDirection: 'column', gap: '4px',
          flexShrink: 0, paddingTop: '32px', width: '36px',
        }}>
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

        {/* Grid de columnes */}
        <div style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: cols.map(c => widths[c.state]).join(' '),
          gap: '10px',
          alignItems: 'start',
          transition: 'grid-template-columns 0.3s ease',
          minWidth: 0,
        }}>
          {cols.map(({ idx, state, empty }) => {
  const fase = !empty ? FASES[idx] : null
  const isActive = state === 'active'
  const isCompact = !isActive
  const opacity = state === 'prev2' ? 0.35 : state === 'next2' ? 0.3 : state === 'next1' ? 0.45 : state === 'prev1' ? 0.65 : 1

  return (
    <div
      key={`col-${idx}`}
      style={{
        opacity: empty ? 0 : opacity,
        transition: 'opacity 0.3s',
        minWidth: 0,
        maxWidth: isActive ? '480px' : undefined,
      }}
      onClick={isCompact && !empty && fase ? () => setCurrent(idx) : undefined}
      className={isCompact && !empty ? 'cursor-pointer' : ''}
    >
      {!empty && fase && <ColHeader label={fase.label} state={state} />}
      {!empty && fase && (
        <div style={{ overflow: isCompact ? 'hidden' : 'visible' }}>
          <FaseContent faseId={fase.id} data={data} compact={isCompact} />
        </div>
      )}
    </div>
  )
})}
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
          className="btn-secondary"
          style={{ opacity: current === 0 ? 0.2 : 1 }}
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
                width: i === current ? '16px' : '6px',
                height: '6px',
                borderRadius: '3px',
                border: 'none',
                cursor: 'pointer',
                background: i < current ? '#1D9E75' : i === current ? '#BA7517' : '#252422',
                transition: 'all 0.25s',
                padding: 0,
              }}
            />
          ))}
        </div>

        <button
          onClick={() => setCurrent(c => Math.min(FASES.length - 1, c + 1))}
          disabled={current === FASES.length - 1}
          className="btn-primary"
          style={{ opacity: current === FASES.length - 1 ? 0.2 : 1 }}
        >
          Següent →
        </button>
      </div>
    </div>
  )
}
