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
  if (faseId === 'pomes')      return <FasePomes      data={d as Parameters<typeof FasePomes>[0]['data']}      compact={compact} />
  if (faseId === 'triturat')   return <FaseTriturat   data={d as Parameters<typeof FaseTriturat>[0]['data']}   compact={compact} />
  if (faseId === 'premsat')    return <FasePremsat    data={d} />
  if (faseId === 'bullit')     return <FaseBullit     data={d} />
  if (faseId === 'fermentat')  return <FaseFermentat  data={d} />
  if (faseId === 'embotellat') return <FaseEmbotellat data={d} />
  return null
}

function ColHeader({ fase, state }: {
  fase: typeof FASES[0]
  state: 'prev' | 'active' | 'next'
}) {
  return (
    <div className="flex items-center justify-between px-2 py-1.5 rounded-md mb-2 text-xs font-mono uppercase tracking-wider"
      style={{
        background: state === 'active' ? '#2a1800' : state === 'prev' ? '#0a2318' : '#1a1917',
        color: state === 'active' ? '#EF9F27' : state === 'prev' ? '#1D9E75' : '#3a3835',
        border: state === 'next' ? '0.5px solid #252422' : 'none',
      }}
    >
      <span>{fase.label}</span>
      {state === 'prev' && <span>✓</span>}
    </div>
  )
}

export default function FaseCarousel({ data }: { data: unknown }) {
  const [current, setCurrent] = useState(0)

  return (
    <div>
      <div className="flex gap-3 items-start overflow-hidden">

        {/* Sidebar fases */}
        <div className="flex flex-col gap-1 flex-shrink-0 pt-8" style={{ width: '40px' }}>
          {FASES.map((fase, i) => (
            <button
              key={fase.id}
              onClick={() => setCurrent(i)}
              title={fase.label}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-mono font-medium transition-colors"
              style={{
                background: i === current ? '#2a1800' : i < current ? '#0a2318' : 'none',
                color: i === current ? '#EF9F27' : i < current ? '#1D9E75' : '#4a4846',
                border: i === current ? 'none' : i < current ? 'none' : '0.5px solid #252422',
              }}
            >
              {fase.curt}
            </button>
          ))}
        </div>

        {/* Col anterior */}
        {current > 0 && (
          <div
            className="flex-shrink-0 cursor-pointer"
            style={{ width: '148px', opacity: 0.6 }}
            onClick={() => setCurrent(c => c - 1)}
          >
            <ColHeader fase={FASES[current - 1]} state="prev" />
            <FaseContent faseId={FASES[current - 1].id} data={data} compact />
          </div>
        )}

        {/* Col activa */}
        <div className="flex-1 min-w-0">
          <ColHeader fase={FASES[current]} state="active" />
          <FaseContent faseId={FASES[current].id} data={data} />
        </div>

        {/* Col següent */}
        {current < FASES.length - 1 && (
          <div
            className="flex-shrink-0 cursor-pointer"
            style={{ width: '148px', opacity: 0.4 }}
            onClick={() => setCurrent(c => c + 1)}
          >
            <ColHeader fase={FASES[current + 1]} state="next" />
            <FaseContent faseId={FASES[current + 1].id} data={data} compact />
          </div>
        )}
      </div>

      {/* Navegació */}
      <div className="flex items-center justify-between mt-6 pt-4" style={{ borderTop: '0.5px solid #252422' }}>
        <button
          onClick={() => setCurrent(c => Math.max(0, c - 1))}
          disabled={current === 0}
          className="font-mono text-xs px-4 py-2 rounded transition-colors disabled:opacity-20"
          style={{ border: '0.5px solid #252422', background: 'none', color: '#7a7672' }}
        >
          ← Anterior
        </button>

        <div className="flex items-center gap-2">
          {FASES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === current ? '16px' : '6px',
                height: '6px',
                background: i < current ? '#1D9E75' : i === current ? '#BA7517' : '#252422',
              }}
            />
          ))}
        </div>

        <button
          onClick={() => setCurrent(c => Math.min(FASES.length - 1, c + 1))}
          disabled={current === FASES.length - 1}
          className="font-mono text-xs px-4 py-2 rounded transition-colors disabled:opacity-20"
          style={{ background: '#BA7517', color: 'white', border: 'none' }}
        >
          Següent →
        </button>
      </div>
    </div>
  )
}
