// Universal Service Worker for Eurodoor Notifications
console.log('🔧 Service Worker loading...');

// Push event - universal background notifications
self.addEventListener('push', (event) => {
  console.log('📱 Push event received:', event);
  
  let data = {};
  try { 
    if (event.data) data = event.data.json(); 
  } catch(e) {
    console.log('📱 Failed to parse push data:', e);
  }
  
  const title = data.title || 'Eurodoor';
  const options = {
    body: data.body || '',
    icon: data.icon || '/favicon.ico',
    badge: '/favicon.ico',
    tag: data.tag || 'eurodoor',
    timestamp: Date.now()
  };
  
  console.log('📱 Showing notification:', title, options);
  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification click event - universal compatibility
self.addEventListener('notificationclick', (event) => {
  console.log('👆 Notification clicked:', event);
  event.notification.close();
  
  const url = dataSafe(() => event?.notification?.data?.url) || '/#orders';
  event.waitUntil((async () => {
    const list = await clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of list) { 
      if ('focus' in c) { 
        c.focus(); 
        return; 
      } 
    }
    await clients.openWindow(url);
  })());
});

// Message event - main thread communication
self.addEventListener('message', (event) => {
  console.log('💬 Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Safe data access helper
function dataSafe(fn) { 
  try { 
    return fn(); 
  } catch(_) { 
    return undefined; 
  } 
}