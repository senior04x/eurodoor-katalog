import { ensurePushSubscription, shouldAskForNotifications, markNotificationsAsked, getCurrentUserId } from '../lib/notificationService'

async function tryEnable() {
  const uid = getCurrentUserId()
  if (!uid) return
  try { await ensurePushSubscription(uid) }
  catch (e) { console.warn('[EURODOOR] notif enable failed', e) }
  finally { markNotificationsAsked() }
}

export function installAutoAskNotifications() {
  if (!shouldAskForNotifications()) return
  const handler = () => {
    window.removeEventListener('pointerdown', handler)
    window.removeEventListener('touchend', handler)
    tryEnable() // no await → never blocks login flow
  }
  window.addEventListener('pointerdown', handler, { once: true })
  window.addEventListener('touchend', handler, { once: true })

  setTimeout(() => { if (shouldAskForNotifications()) tryEnable() }, 1500) // desktop-friendly fallback
}
