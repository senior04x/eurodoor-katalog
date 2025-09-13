import { supabase } from '../lib/supabase'

function withTimeout<T>(p: Promise<T>, ms = 8000): Promise<T> {
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
      const { data, error } = await supabase
        .from('customers')
        .select('id')
        .eq('user_id', session.user.id)
        .maybeSingle()

      if (error) {
        console.error('[EURODOOR] customer check error:', error)
        throw error
      }

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
