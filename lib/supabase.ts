import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
})
export async function deleteAmbAvis(taula: string, id: number, missatgeError = 'Aquest element ja s\'ha utilitzat en una fase posterior i no es pot eliminar. Elimina primer la referència.') {
  const { error } = await supabase.from(taula).delete().eq('id', id)
  if (error) {
    alert(missatgeError)
    return false
  }
  return true
}
