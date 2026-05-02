'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Mail {
  id: number
  email: string
  actiu: boolean
  created_at: string
}

export default function GestioMails({ mails: initialMails }: { mails: Mail[] }) {
  const [mails, setMails] = useState(initialMails)
  const [nouMail, setNouMail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function afegirMail() {
    if (!nouMail) return
    setLoading(true)
    setError(null)

    const { data, error: err } = await supabase
      .from('mails_autoritzats')
      .insert({ email: nouMail.toLowerCase() })
      .select()
      .single()

    if (err) {
      setError(err.code === '23505' ? 'Aquest mail ja existeix.' : err.message)
      setLoading(false)
      return
    }

    setMails(m => [...m, data])
    setNouMail('')
    setLoading(false)
  }

  async function toggleActiu(id: number, actiu: boolean) {
    await supabase.from('mails_autoritzats').update({ actiu: !actiu }).eq('id', id)
    setMails(m => m.map(mail => mail.id === id ? { ...mail, actiu: !actiu } : mail))
  }

  async function eliminarMail(id: number) {
    await supabase.from('mails_autoritzats').delete().eq('id', id)
    setMails(m => m.filter(mail => mail.id !== id))
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <p style={{ fontSize: '9px', color: '#4a4846', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'DM Mono, monospace' }}>
          Usuaris autoritzats
        </p>
      </div>

      {/* Llista de mails */}
      <div style={{ background: '#1a1917', border: '0.5px solid #252422', borderRadius: '10px', overflow: 'hidden', marginBottom: '10px' }}>
        {mails.length === 0 && (
          <div style={{ padding: '16px', fontSize: '11px', color: '#4a4846', fontFamily: 'DM Mono, monospace', textAlign: 'center' }}>
            Cap mail autoritzat
          </div>
        )}
        {mails.map((mail, idx) => (
          <div
            key={mail.id}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 16px',
              borderBottom: idx < mails.length - 1 ? '0.5px solid #1e1d1b' : 'none',
            }}
          >
            <span style={{ fontSize: '12px', color: mail.actiu ? '#c8c4be' : '#4a4846', fontFamily: 'DM Mono, monospace' }}>
              {mail.email}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                onClick={() => toggleActiu(mail.id, mail.actiu)}
                style={{
                  fontSize: '9px', padding: '2px 8px', borderRadius: '10px',
                  fontFamily: 'DM Mono, monospace', border: 'none', cursor: 'pointer',
                  background: mail.actiu ? '#0a2318' : '#1e1d1b',
                  color: mail.actiu ? '#1D9E75' : '#4a4846',
                }}
              >
                {mail.actiu ? 'actiu' : 'inactiu'}
              </button>
              <button
                onClick={() => eliminarMail(mail.id)}
                style={{ fontSize: '10px', color: '#3a3835', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'DM Mono, monospace' }}
                onMouseOver={e => (e.currentTarget.style.color = '#E24B4A')}
                onMouseOut={e => (e.currentTarget.style.color = '#3a3835')}
              >
                eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Afegir nou mail */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <input
          type="email"
          value={nouMail}
          onChange={e => setNouMail(e.target.value)}
          placeholder="nou@mail.com"
          onKeyDown={e => e.key === 'Enter' && afegirMail()}
          style={{
            flex: 1, fontFamily: 'DM Mono, monospace', fontSize: '12px',
            background: '#1a1917', border: '0.5px solid #2e2c2a',
            borderRadius: '6px', padding: '7px 12px', color: '#f0ede8',
            outline: 'none',
          }}
        />
        <button
          onClick={afegirMail}
          disabled={loading || !nouMail}
          style={{
            fontFamily: 'DM Mono, monospace', fontSize: '11px',
            padding: '7px 14px', borderRadius: '6px', border: 'none',
            background: '#BA7517', color: '#fff', cursor: 'pointer',
            opacity: loading || !nouMail ? 0.4 : 1,
          }}
        >
          {loading ? '...' : '+ Afegir'}
        </button>
      </div>

      {error && (
        <div style={{ fontSize: '11px', color: '#E24B4A', background: '#2a0a0a', padding: '7px 12px', borderRadius: '6px', fontFamily: 'DM Mono, monospace', marginTop: '8px' }}>
          {error}
        </div>
      )}
    </div>
  )
}
