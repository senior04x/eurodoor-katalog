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
  if (!isPushSupported()) throw new Error('Push not supported')
  const perm = await Notification.requestPermission()
  if (perm !== 'granted') throw new Error('Permission denied')

  const reg = await registerSW()
  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: b64ToUint8Array(VAPID_PUBLIC_KEY)
  })

  console.log('[EURODOOR] Push endpoint:', sub.endpoint) // iOS PWA: web.push.apple.com
  
  // Save subscription to Supabase
  const { data, error } = await supabase
    .from('push_subscriptions')
    .upsert({
      user_id: userId,
      subscription: sub.toJSON(),
      created_at: new Date().toISOString()
    }, {
      onConflict: 'user_id'
    })

  if (error) {
    console.error('❌ Failed to save subscription:', error)
    throw error
  }
  
  console.log('✅ Subscription saved to server:', data)
}
