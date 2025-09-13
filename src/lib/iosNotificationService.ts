// iOS Safari Compatible Notification Service
import { supabase } from './supabase';

const VAPID_PUBLIC_KEY = (import.meta as any).env?.VITE_VAPID_PUBLIC_KEY as string || 'BEl62iUYgUivxIkv69yViEuiBIa40HI0lF5AwyKcnxXs4VWXK8dTInu3FIni8kHUpcMWvqyJ8sY8qa4r8UXwcm8';

function b64ToUint8Array(base64: string) {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const base64Safe = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64Safe);
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
}

export async function enablePushForCurrentUser(currentUserId: string) {
  console.log('🔔 Enabling push notifications for user:', currentUserId);
  
  // Check if push is supported
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    throw new Error('Push not supported');
  }
  
  // Check if PWA is installed (standalone mode)
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  if (!isStandalone) {
    console.warn('⚠️ PWA not installed. Ask user to Add to Home Screen.');
    // Show hint to user
    showPWAInstallHint();
  }

  // Request notification permission (must be called from user gesture)
  console.log('🔔 Requesting notification permission...');
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error('Permission denied');
  }
  console.log('✅ Notification permission granted');

  // Register Service Worker
  console.log('🔔 Registering Service Worker...');
  const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
  console.log('✅ Service Worker registered:', reg);

  // Create push subscription
  console.log('🔔 Creating push subscription...');
  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: b64ToUint8Array(VAPID_PUBLIC_KEY)
  });

  console.log('✅ Push subscription created');
  console.log('📱 Push endpoint:', sub.endpoint); // should be web.push.apple.com on iOS

  // Save subscription to Supabase
  console.log('🔔 Saving subscription to server...');
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

// Show PWA installation hint
function showPWAInstallHint() {
  // Create a banner to show PWA install hint
  const banner = document.createElement('div');
  banner.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: #3b82f6;
    color: white;
    padding: 12px;
    text-align: center;
    z-index: 9999;
    font-size: 14px;
  `;
  banner.innerHTML = `
    <div>📱 Push notifications work best when installed as an app</div>
    <div style="font-size: 12px; margin-top: 4px;">
      Tap Share → Add to Home Screen to install
    </div>
    <button onclick="this.parentElement.remove()" style="
      position: absolute;
      right: 8px;
      top: 8px;
      background: none;
      border: none;
      color: white;
      font-size: 18px;
      cursor: pointer;
    ">×</button>
  `;
  document.body.appendChild(banner);
  
  // Auto remove after 10 seconds
  setTimeout(() => {
    if (banner.parentElement) {
      banner.remove();
    }
  }, 10000);
}

// Test push notification
export async function testPushNotification() {
  try {
    console.log('🧪 Testing push notification...');
    
    const { data, error } = await supabase.functions.invoke('test-push-notification', {
      body: {}
    });

    if (error) {
      console.error('❌ Test push notification failed:', error);
      throw error;
    }
    
    console.log('✅ Test push notification sent:', data);
    return data;
  } catch (error) {
    console.error('❌ Error testing push notification:', error);
    throw error;
  }
}

// Check if PWA is installed
export function isPWAInstalled(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches;
}

// Check if push notifications are supported
export function isPushSupported(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window;
}

// Get notification permission status
export function getNotificationPermission(): NotificationPermission {
  return Notification.permission;
}
