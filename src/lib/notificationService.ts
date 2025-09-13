// Universal Notification Service for All Platforms
import { supabase } from './supabase';

export const VAPID_PUBLIC_KEY = (import.meta as any).env?.VITE_VAPID_PUBLIC_KEY as string

function b64ToUint8Array(base64: string) {
  const pad = '='.repeat((4 - (base64.length % 4)) % 4)
  const b64 = (base64 + pad).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(b64)
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)))
}

export function isStandalone(): boolean {
  return window.matchMedia?.('(display-mode: standalone)')?.matches ?? false
}
export function isPushSupported(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
}
export function getNotificationPermission(): NotificationPermission {
  return Notification.permission
}
export function shouldAskForNotifications(): boolean {
  return isPushSupported() && Notification.permission === 'default' && !localStorage.getItem('notif:asked')
}
export function markNotificationsAsked(): void {
  try { localStorage.setItem('notif:asked', '1') } catch {}
}
export function getCurrentUserId(): string | null {
  try { return localStorage.getItem('user:id') } catch { return null }
}
export function setCurrentUserId(id: string) {
  try { localStorage.setItem('user:id', id) } catch {}
}

export async function registerSW(): Promise<ServiceWorkerRegistration> {
  if (!('serviceWorker' in navigator)) throw new Error('SW not supported')
  return navigator.serviceWorker.register('/sw.js', { scope: '/' })
}

export async function ensurePushSubscription(userId: string) {
  console.log('🔔 Starting push subscription process for user:', userId)
  
  if (!isPushSupported()) throw new Error('Push not supported')
  
  // Check if user is authenticated
  console.log('🔔 Checking user authentication...')
  const { data: { session } } = await supabase.auth.getSession()
  if (!session || !session.user) {
    throw new Error('User not authenticated')
  }
  console.log('✅ User is authenticated:', session.user.id)
  
  console.log('🔔 Requesting notification permission...')
  const perm = await Notification.requestPermission()
  if (perm !== 'granted') throw new Error('Permission denied')
  console.log('✅ Notification permission granted')

  console.log('🔔 Registering service worker...')
  const reg = await registerSW()
  console.log('✅ Service worker registered:', reg.scope)
  
  console.log('🔔 Creating push subscription...')
  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: b64ToUint8Array(VAPID_PUBLIC_KEY)
  })

  console.log('[EURODOOR] Push endpoint:', sub.endpoint) // iOS PWA: web.push.apple.com
  console.log('📤 Sending subscription to server...')
  
  // Save subscription to Supabase
  try {
    console.log('🔔 Saving subscription to Supabase...')
    const subscriptionData = {
      user_id: userId,
      subscription: sub.toJSON(),
      created_at: new Date().toISOString()
    }
    console.log('📋 Subscription data:', subscriptionData)
    
    const { data, error } = await supabase
      .from('push_subscriptions')
      .upsert(subscriptionData, {
        onConflict: 'user_id'
      })

    if (error) {
      console.error('❌ Subscription save error:', error)
      console.error('❌ Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      })
      throw error
    }
    
    console.log('✅ Subscription saved:', data)
    return data
  } catch (error) {
    console.error('❌ Subscription save error:', error)
    throw error
  }
}
