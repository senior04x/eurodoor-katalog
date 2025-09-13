// Service Worker for Eurodoor Notifications - iOS Safari Compatible
console.log('🔧 Service Worker loading...');

// Push event - background notifications (iOS Safari compatible)
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
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: data.tag || 'eurodoor',
    timestamp: Date.now()
  };
  
  console.log('📱 Showing notification:', title, options);
  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification click event (iOS Safari compatible)
self.addEventListener('notificationclick', (event) => {
  console.log('👆 Notification clicked:', event);
  event.notification.close();
  
  const url = '/#orders';
  event.waitUntil((async () => {
    const list = await clients.matchAll({ type:'window', includeUncontrolled:true });
    for (const c of list) { 
      if (c.url.includes(self.location.origin)) { 
        c.focus(); 
        return; 
      } 
    }
    await clients.openWindow(url);
  })());
});

// Message event - main thread communication (iOS Safari compatible)
self.addEventListener('message', (event) => {
  console.log('💬 Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});