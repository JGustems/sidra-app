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
        <header style={{
          background: '#0e0d0c',
          borderBottom: '0.5px solid #252422',
        }} className="px-6 py-3 flex items-center gap-4">
          <a href="/" className="font-serif italic text-xl hover:opacity-80 transition-opacity"
            style={{ color: '#e8e4de' }}>
            Sidra
          </a>
          <span className="text-xs font-mono" style={{ color: '#4a4846' }}>producció</span>
          <nav className="ml-auto flex gap-6 text-xs font-mono">
            <a href="/" className="transition-colors" style={{ color: '#5a5854' }}
              onMouseOver={e => (e.currentTarget.style.color = '#c8c4be')}
              onMouseOut={e => (e.currentTarget.style.color = '#5a5854')}>
              Jornades
            </a>
            <a href="/configuracio" className="transition-colors" style={{ color: '#5a5854' }}
              onMouseOver={e => (e.currentTarget.style.color = '#c8c4be')}
              onMouseOut={e => (e.currentTarget.style.color = '#5a5854')}>
              Configuració
            </a>
          </nav>
        </header>
        <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px 24px' }}>
          {children}
        </main>
      </body>
    </html>
  )
}
