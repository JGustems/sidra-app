'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [missatge, setMissatge] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMissatge(null)

    if (mode === 'register') {
      const { data: autoritzat } = await supabase
        .from('mails_autoritzats')
        .select('id')
        .eq('email', email.toLowerCase())
        .eq('actiu', true)
        .single()

      if (!autoritzat) {
        setError('Aquest mail no està autoritzat per registrar-se.')
        setLoading(false)
        return
      }

      const { error: err } = await supabase.auth.signUp({ email, password })
      if (err) { setError(err.message); setLoading(false); return }
      setMissatge('Comprova el teu mail per confirmar el registre.')
      setLoading(false)
      return
    }

    const { data, error: err } = await supabase.auth.signInWithPassword({ email, password })
    
    if (err || !data.session) {
      setError('Mail o contrasenya incorrectes.')
      setLoading(false)
      return
    }

    // Guardem la sessió manualment i redirigim
    await supabase.auth.setSession({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    })

    window.location.href = '/'
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#141412',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{ width: '360px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{
            fontFamily: 'Georgia, serif', fontStyle: 'italic',
            fontSize: '28px', color: '#f0ede8', fontWeight: 400, marginBottom: '6px',
          }}>
            Sidra
          </h1>
          <p style={{ fontSize: '11px', color: '#4a4846', fontFamily: 'DM Mono, monospace' }}>
            producció
          </p>
        </div>

        <div style={{
          background: '#1a1917', border: '0.5px solid #252422',
          borderRadius: '10px', overflow: 'hidden',
        }}>
          <div style={{ display: 'flex', borderBottom: '0.5px solid #252422' }}>
            {(['login', 'register'] as const).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(null); setMissatge(null) }}
                style={{
                  flex: 1, padding: '10px', border: 'none', cursor: 'pointer',
                  fontFamily: 'DM Mono, monospace', fontSize: '11px',
                  background: mode === m ? '#2a1800' : 'transparent',
                  color: mode === m ? '#EF9F27' : '#4a4846',
                  borderBottom: mode === m ? '1px solid #BA7517' : 'none',
                }}
              >
                {m === 'login' ? 'Entrar' : 'Registrar-se'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '9px', color: '#4a4846', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px', fontFamily: 'DM Mono, monospace' }}>
                Mail
              </div>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="nom@exemple.com"
                style={{
                  width: '100%', fontFamily: 'DM Mono, monospace', fontSize: '13px',
                  background: '#141412', border: '0.5px solid #2e2c2a',
                  borderRadius: '6px', padding: '8px 12px', color: '#f0ede8',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <div style={{ fontSize: '9px', color: '#4a4846', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px', fontFamily: 'DM Mono, monospace' }}>
                Contrasenya
              </div>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={{
                  width: '100%', fontFamily: 'DM Mono, monospace', fontSize: '13px',
                  background: '#141412', border: '0.5px solid #2e2c2a',
                  borderRadius: '6px', padding: '8px 12px', color: '#f0ede8',
                  outline: 'none',
                }}
              />
            </div>

            {error && (
              <div style={{ fontSize: '11px', color: '#E24B4A', background: '#2a0a0a', padding: '8px 12px', borderRadius: '6px', fontFamily: 'DM Mono, monospace' }}>
                {error}
              </div>
            )}

            {missatge && (
              <div style={{ fontSize: '11px', color: '#1D9E75', background: '#0a2318', padding: '8px 12px', borderRadius: '6px', fontFamily: 'DM Mono, monospace' }}>
                {missatge}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                fontFamily: 'DM Mono, monospace', fontSize: '12px',
                padding: '9px', borderRadius: '6px', border: 'none',
                background: '#BA7517', color: '#fff', cursor: 'pointer',
                opacity: loading ? 0.5 : 1, marginTop: '4px',
              }}
            >
              {loading ? '...' : mode === 'login' ? 'Entrar' : 'Registrar-se'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
