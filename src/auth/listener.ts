import { supabase } from '@/supabaseClient'

function withTimeout<T>(p: Promise<T>, ms = 6000) {
  return Promise.race([
    p,
    new Promise<T>((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))
  ])
}

let routed = false

export function attachAuthListener() {
  supabase.auth.onAuthStateChange(async (event, session) => {
    console.log('[EURODOOR] auth =', event)
    if (event !== 'SIGNED_IN' || !session?.user) return

    // NEVER block UI: try customer check, but continue on any error/timeout
    try {
      const { data } = await withTimeout(
        supabase.from('customers').select('id').eq('user_id', session.user.id).maybeSingle(),
        6000
      )
      console.log('[EURODOOR] customer row:', data)
    } catch (e) {
      console.warn('[EURODOOR] customer check skip:', e)
    } finally {
      if (!routed) {
        routed = true
        location.hash = 'orders'
      }
    }
  })
}
