import { supabase } from '@/lib/supabase'

export const revalidate = 0

export default async function ConfiguracioPage() {
  const [
    { data: ampolles },
    { data: taps },
    { data: sucres },
  ] = await Promise.all([
    supabase.from('tipus_ampolla').select('*').order('ordre'),
    supabase.from('tipus_tap').select('*').order('ordre'),
    supabase.from('tipus_sucre').select('*').order('ordre'),
  ])

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-serif italic text-2xl text-stone-800 mb-1">Configuració</h2>
        <p className="text-xs text-stone-400 font-mono">Tipus d&apos;ampolles, taps i sucre</p>
      </div>

      {[
        { title: 'Ampolles', items: ampolles ?? [], extra: (i: Record<string, unknown>) => `${i.mida_cl}cl` },
        { title: 'Taps',     items: taps ?? [],     extra: () => '' },
        { title: 'Sucre',    items: sucres ?? [],   extra: (i: Record<string, unknown>) => i.quantitat_g ? `${i.quantitat_g}g` : '—' },
      ].map(({ title, items, extra }) => (
        <div key={title}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-mono text-stone-400 uppercase tracking-wider">{title}</p>
            <button className="text-xs font-mono text-[#BA7517] hover:underline">+ Afegir</button>
          </div>
          <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
            {items.map((item: Record<string, unknown>, idx: number) => (
              <div
                key={item.id as number}
                className={`flex items-center justify-between px-5 py-3 ${idx < items.length - 1 ? 'border-b border-stone-100' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-stone-400 w-8">{item.codi as string}</span>
                  <span className="text-sm font-mono text-stone-800">{item.nom as string}</span>
                  {extra(item) && (
                    <span className="text-xs text-stone-400">{extra(item)}</span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-mono px-2 py-0.5 rounded ${item.actiu ? 'bg-[#E1F5EE] text-[#0F6E56]' : 'bg-stone-100 text-stone-400'}`}>
                    {item.actiu ? 'actiu' : 'inactiu'}
                  </span>
                  <button className="text-xs text-stone-400 hover:text-stone-600 font-mono">editar</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
