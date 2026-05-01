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
      <body className="min-h-screen" style={{ background: '#141412' }}>
        <header style={{ background: '#0e0d0c', borderBottom: '0.5px solid #252422' }} className="px-6 py-3 flex items-baseline gap-4">
          <a href="/" style={{ color: '#e8e4de' }} className="font-serif italic text-xl hover:opacity-80 transition-opacity">Sidra</a>
          <span style={{ color: '#5a5854' }} className="text-xs font-mono">producció</span>
          <nav className="ml-auto flex gap-6 text-xs font-mono">
            <a href="/" style={{ color: '#5a5854' }} className="hover:text-[#c8c4be] transition-colors">Jornades</a>
            <a href="/configuracio" style={{ color: '#5a5854' }} className="hover:text-[#c8c4be] transition-colors">Configuració</a>
          </nav>
        </header>
        <main className="max-w-5xl mx-auto px-6 py-8">
          {children}
        </main>
      </body>
    </html>
  )
}
