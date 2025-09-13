import { supabase } from '../lib/supabase'

function withTimeout<T>(p: Promise<T>, ms = 8000) {
  return Promise.race([
    p,
    new Promise<T>((_, rej) => setTimeout(() => rej(new Error('Request timeout')), ms))
  ])
}

let routed = false

export function attachAuthListener() {
  supabase.auth.onAuthStateChange(async (event, session) => {
    console.log('[EURODOOR] auth state =', event)
    if (event !== 'SIGNED_IN' || !session?.user) return
    try {
      const q = supabase
        .from('customers')           // adjust if your table is 'profiles'
        .select('id')
        .eq('user_id', session.user.id)
        .maybeSingle()
        .throwOnError()

      const { data } = await withTimeout(q, 8000)
      console.log('[EURODOOR] customer row:', data)

      if (!routed) {
        routed = true
        if (location.hash !== '#orders') location.hash = 'orders'
      }
    } catch (e) {
      console.error('[EURODOOR] customer check failed:', e)
      if (!routed) {
        routed = true
        if (location.hash !== '#home') location.hash = 'home'
      }
    }
  })
}
