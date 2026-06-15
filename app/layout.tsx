import type { Metadata } from 'next'
import './globals.css'
import LogoutButton from '@/components/LogoutButton'
import { colors } from '@/lib/theme'

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
      <body style={{ background: colors.bg, minHeight: '100vh', margin: 0 }}>
        <header style={{
          background: colors.bgHead,
          borderBottom: `0.5px solid ${colors.border}`,
          padding: '10px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <a href="/" style={{
            fontFamily: 'Georgia, serif',
            fontStyle: 'italic',
            fontSize: '18px',
            color: colors.textHi,
            textDecoration: 'none',
          }}>
            Sidra
          </a>
          <span style={{ fontSize: '11px', color: colors.text3, fontFamily: 'DM Mono, monospace' }}>
            producció
          </span>
          <nav style={{ marginLeft: 'auto', display: 'flex', gap: '20px', alignItems: 'center' }}>
            <a href="/" style={{ fontSize: '11px', color: colors.text2, fontFamily: 'DM Mono, monospace', textDecoration: 'none' }}>
              Jornades
            </a>
            <a href="/configuracio" style={{ fontSize: '11px', color: colors.text2, fontFamily: 'DM Mono, monospace', textDecoration: 'none' }}>
              Configuració
            </a>
            <LogoutButton />
          </nav>
        </header>
        <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
          {children}
        </main>
      </body>
    </html>
  )
}
