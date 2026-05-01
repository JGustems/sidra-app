'use client'

import Link from 'next/link'

const FASES = [
  { id: 'pomes',      label: 'Pomes',      curt: 'P'  },
  { id: 'triturat',   label: 'Triturat',   curt: 'T'  },
  { id: 'premsat',    label: 'Premsat',    curt: 'Pr' },
  { id: 'bullit',     label: 'Bullit',     curt: 'B'  },
  { id: 'fermentat',  label: 'Fermentat',  curt: 'F'  },
  { id: 'embotellat', label: 'Embotellat', curt: 'E'  },
]

export default function FaseNav({
  jornadaId,
  faseActual,
}: {
  jornadaId: number
  faseActual: string
}) {
  const idx = FASES.findIndex(f => f.id === faseActual)

  return (
    <nav className="flex border border-stone-200 rounded-lg overflow-hidden">
      {FASES.map((fase, i) => {
        const isActive = fase.id === faseActual
        const isDone   = i < idx
        return (
          <Link
            key={fase.id}
            href={`/jornada/${jornadaId}?fase=${fase.id}`}
            className={[
              'flex-1 text-center py-2 text-xs font-mono border-r border-stone-200 last:border-r-0 transition-colors',
              isActive ? 'bg-[#FAEEDA] text-[#BA7517] font-medium' :
              isDone   ? 'bg-[#E1F5EE] text-[#0F6E56]' :
                         'bg-white text-stone-400 hover:bg-stone-50',
            ].join(' ')}
          >
            <span className="block text-base font-medium">{fase.curt}</span>
            <span className="hidden sm:block">{fase.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
