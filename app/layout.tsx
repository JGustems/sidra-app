import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Sidra — Producció',
  description: 'Registre de producció de sidra',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ca">
      <body className="min-h-screen bg-[#f8f7f4]">
        <header className="border-b border-stone-200 bg-white px-6 py-3 flex items-baseline gap-4">
          <h1 className="font-serif italic text-xl text-stone-800">Sidra</h1>
          <span className="text-xs text-stone-400 font-mono">producció</span>
          <nav className="ml-auto flex gap-6 text-xs font-mono text-stone-500">
            <a href="/" className="hover:text-stone-800 transition-colors">Jornades</a>
            <a href="/configuracio" className="hover:text-stone-800 transition-colors">Configuració</a>
          </nav>
        </header>
        <main className="max-w-4xl mx-auto px-6 py-8">
          {children}
        </main>
      </body>
    </html>
  )
}
