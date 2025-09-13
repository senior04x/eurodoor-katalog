/**
 * Auto-ask for push notifications on first user interaction
 * Works across all platforms with iOS PWA constraints
 */
import { ensurePushSubscription, isStandalone, getCurrentUserId, shouldAskForNotifications, markNotificationsAsked } from '../lib/notificationService';

async function tryEnableNotifications() {
  const uid = getCurrentUserId();
  if (!uid) {
    console.log('🔔 No user ID found, skipping notification setup');
    return;
  }
  
  try {
    console.log('🔔 Attempting to enable push notifications...');
    await ensurePushSubscription(uid);
    console.log('✅ Push notifications enabled successfully');
  } catch (e) {
    console.warn('[Notif] Enable failed:', e);
  } finally {
    markNotificationsAsked();
  }
}

export function installAutoAskNotifications() {
  if (!shouldAskForNotifications()) {
    console.log('🔔 Not asking for notifications (already asked or not supported)');
    return;
  }

  console.log('🔔 Setting up auto-ask for notifications on first interaction');

  // Universal handler for first user interaction
  const handler = async () => {
    console.log('🔔 First user interaction detected, attempting to enable notifications');
    
    // Remove event listeners to prevent multiple triggers
    window.removeEventListener('pointerdown', handler, { capture: true } as any);
    window.removeEventListener('touchend', handler, { capture: true } as any);
    window.removeEventListener('click', handler, { capture: true } as any);
    window.removeEventListener('keydown', handler, { capture: true } as any);
    window.removeEventListener('scroll', handler, { capture: true } as any);
    
    await tryEnableNotifications();
  };

  // Add event listeners for various user interactions
  window.addEventListener('pointerdown', handler, { capture: true, once: true });
  window.addEventListener('touchend', handler, { capture: true, once: true });
  window.addEventListener('click', handler, { capture: true, once: true });
  window.addEventListener('keydown', handler, { capture: true, once: true });
  window.addEventListener('scroll', handler, { capture: true, once: true });

  // Desktop-friendly: try once after a short delay
  // This will be ignored by iOS (needs user gesture) but may work on desktop
  setTimeout(async () => {
    if (shouldAskForNotifications()) {
      console.log('🔔 Desktop auto-attempt after delay');
      await tryEnableNotifications();
    }
  }, 1500);

  // Log PWA status for debugging
  if (!isStandalone()) {
    console.info('[PWA] Not in standalone mode. Show install hint in modal.');
  } else {
    console.info('[PWA] Running in standalone mode (PWA installed)');
  }
}
