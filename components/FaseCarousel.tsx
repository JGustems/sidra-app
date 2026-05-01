'use client'

import { useState } from 'react'
import FasePomes from '@/components/fases/FasePomes'
import FaseTriturat from '@/components/fases/FaseTriturat'
import FasePremsat from '@/components/fases/FasePremsat'
import FaseBullit from '@/components/fases/FaseBullit'
import FaseFermentat from '@/components/fases/FaseFermentat'
import FaseEmbotellat from '@/components/fases/FaseEmbotellat'

const FASES = [
  { id: 'pomes',      label: 'Pomes',      curt: 'P' },
  { id: 'triturat',   label: 'Triturat',   curt: 'T' },
  { id: 'premsat',    label: 'Premsat',    curt: 'Pr' },
  { id: 'bullit',     label: 'Bullit',     curt: 'B' },
  { id: 'fermentat',  label: 'Fermentat',  curt: 'F' },
  { id: 'embotellat', label: 'Embotellat', curt: 'E' },
]

function FaseContent({ faseId, data, compact }: { faseId: string; data: unknown; compact?: boolean }) {
  const d = data as Record<string, unknown>
  if (faseId === 'pomes')      return <FasePomes      data={d as Parameters<typeof FasePomes>[0]['data']}      compact={compact} />
  if (faseId === 'triturat')   return <FaseTriturat   data={d} />
  if (faseId === 'premsat')    return <FasePremsat    data={d} />
  if (faseId === 'bullit')     return <FaseBullit     data={d} />
  if (faseId === 'fermentat')  return <FaseFermentat  data={d} />
  if (faseId === 'embotellat') return <FaseEmbotellat data={d} />
  return null
}

function ColHeader({ fase, state }: { fase: typeof FASES[0]; state: 'prev2'|'prev1'|'active'|'next1'|'next2' }) {
  const isPrev = state === 'prev1' || state === 'prev2'
  return (
    <div className={`flex items-center justify-between px-3 py-2 rounded-lg border mb-3 ${
      state === 'active'
        ? 'bg-[#FAEEDA] border-[#EF9F27]'
        : isPrev
        ? 'bg-[#E1F5EE] border-[#5DCAA5]'
        : 'bg-white border-stone-200'
    }`}>
      <span className={`text-xs font-mono font-medium uppercase tracking-wide ${
        state === 'active' ? 'text-[#854F0B]' :
        isPrev ? 'text-[#085041]' : 'text-stone-400'
      }`}>
        {fase.label}
      </span>
      {isPrev && (
        <span className="text-xs font-mono text-[#0F6E56] bg-[#E1F5EE] px-2 py-0.5 rounded-full">✓</span>
      )}
    </div>
  )
}

export default function FaseCarousel({ data }: { data: unknown }) {
  const [current, setCurrent] = useState(0)

  function getState(i: number): 'prev2'|'prev1'|'active'|'next1'|'next2'|'hidden' {
    const d = i - current
    if (d === -2) return 'prev2'
    if (d === -1) return 'prev1'
    if (d === 0)  return 'active'
    if (d === 1)  return 'next1'
    if (d === 2)  return 'next2'
    return 'hidden'
  }

  const widths: Record<string, string> = {
    prev2:  'w-[130px] opacity-30',
    prev1:  'w-[180px] opacity-60',
    active: 'w-[340px] opacity-100',
    next1:  'w-[180px] opacity-60',
    next2:  'w-[130px] opacity-30',
    hidden: 'w-0 overflow-hidden opacity-0',
  }

  return (
    <div>
      {/* Carrusel */}
      <div className="flex gap-3 items-start overflow-hidden">
        {FASES.map((fase, i) => {
          const state = getState(i)
          if (state === 'hidden') return null
          const isActive = state === 'active'
          const isCompact = !isActive

          return (
            <div
              key={fase.id}
              className={`flex-shrink-0 transition-all duration-400 ${widths[state]}`}
              style={{ transition: 'width 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.4s' }}
            >
              <ColHeader fase={fase} state={state} />
              {isCompact ? (
                <div
                  className="cursor-pointer"
                  onClick={() => setCurrent(i)}
                >
                  <FaseContent faseId={fase.id} data={data} compact />
                </div>
              ) : (
                <FaseContent faseId={fase.id} data={data} />
              )}
            </div>
          )
        })}
      </div>

      {/* Navegació */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-stone-100">
        <button
          onClick={() => setCurrent(c => Math.max(0, c - 1))}
          disabled={current === 0}
          className="font-mono text-xs px-4 py-2 border border-stone-200 rounded hover:bg-stone-50 transition-colors disabled:opacity-30 disabled:cursor-default"
        >
          ← Anterior
        </button>

        {/* Punts de progrés */}
        <div className="flex items-center gap-2">
          {FASES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`transition-all duration-300 rounded-full ${
                i < current
                  ? 'w-2 h-2 bg-[#1D9E75]'
                  : i === current
                  ? 'w-4 h-2 bg-[#BA7517]'
                  : 'w-2 h-2 bg-stone-200'
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => setCurrent(c => Math.min(FASES.length - 1, c + 1))}
          disabled={current === FASES.length - 1}
          className="font-mono text-xs px-4 py-2 bg-[#BA7517] text-white rounded hover:bg-[#854F0B] transition-colors disabled:opacity-30 disabled:cursor-default"
        >
          Següent →
        </button>
      </div>
    </div>
  )
}
