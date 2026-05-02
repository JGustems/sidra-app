'use client'

import { createClient } from '@/lib/supabase-browser'

export default function LogoutButton() {
  async function logout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <button
      onClick={logout}
      style={{
        fontFamily: 'DM Mono, monospace', fontSize: '11px',
        color: '#5a5854', background: 'none',
        border: '0.5px solid #252422', borderRadius: '5px',
        padding: '3px 10px', cursor: 'pointer',
      }}
    >
      Sortir
    </button>
  )
}
