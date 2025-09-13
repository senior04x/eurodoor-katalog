// Universal Notification Service for All Platforms
import { supabase } from './supabase';

export const VAPID_PUBLIC_KEY = (import.meta as any).env?.VITE_VAPID_PUBLIC_KEY as string || 'BEl62iUYgUivxIkv69yViEuiBIa40HI0lF5AwyKcnxXs4VWXK8dTInu3FIni8kHUpcMWvqyJ8sY8qa4r8UXwcm8';

export function b64ToUint8Array(base64: string) {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const base64Safe = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64Safe);
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
}

export async function registerSW() {
  if (!('serviceWorker' in navigator)) throw new Error('SW not supported');
  return navigator.serviceWorker.register('/sw.js', { scope: '/' });
}

export function isStandalone(): boolean {
  return window.matchMedia?.('(display-mode: standalone)')?.matches ?? false;
}

export async function ensurePushSubscription(currentUserId: string) {
  console.log('🔔 Ensuring push subscription for user:', currentUserId);
  
  if (!('Notification' in window)) throw new Error('Notifications not supported');
  if (!('PushManager' in window)) throw new Error('Push not supported');

  // Request permission (must be from user gesture)
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') throw new Error('Permission denied');
  console.log('✅ Notification permission granted');

  // Register Service Worker
  const reg = await registerSW();
  console.log('✅ Service Worker registered');

  // Create push subscription
  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: b64ToUint8Array(VAPID_PUBLIC_KEY)
  });

  console.log('✅ Push subscription created');
  console.log('[Push endpoint]', sub.endpoint);

  // Save subscription to Supabase
  const { data, error } = await supabase
    .from('push_subscriptions')
    .upsert({
      user_id: currentUserId,
      subscription: sub.toJSON(),
      created_at: new Date().toISOString()
    }, {
      onConflict: 'user_id'
    });

  if (error) {
    console.error('❌ Failed to save subscription:', error);
    throw error;
  }
  
  console.log('✅ Subscription saved to server:', data);
  return { subscription: sub, registration: reg };
}

// Check if push notifications are supported
export function isPushSupported(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

// Get notification permission status
export function getNotificationPermission(): NotificationPermission {
  return Notification.permission;
}

// Check if we should ask for notifications
export function shouldAskForNotifications(): boolean {
  if (!isPushSupported()) return false;
  const asked = localStorage.getItem('notif:asked');
  return Notification.permission === 'default' && !asked;
}

// Mark that we've asked for notifications
export function markNotificationsAsked(): void {
  localStorage.setItem('notif:asked', '1');
}

// Get current user ID from localStorage
export function getCurrentUserId(): string | null {
  try {
    return localStorage.getItem('user:id');
  } catch {
    return null;
  }
}

// Save user ID to localStorage
export function setCurrentUserId(userId: string): void {
  try {
    localStorage.setItem('user:id', userId);
  } catch (error) {
    console.error('Failed to save user ID:', error);
  }
}