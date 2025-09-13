// Service Worker for Eurodoor Notifications
const CACHE_NAME = 'eurodoor-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/favicon.ico'
];

// Install event
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('✅ Cache opened');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

// Push event - background notifications
self.addEventListener('push', (event) => {
  console.log('📱 Push event received:', event);
  
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'Eurodoor', body: event.data.text() };
    }
  }

  console.log('📱 Push data:', data);

  const options = {
    body: data.body || 'Yangi xabar',
    icon: data.icon || '/favicon.ico',
    badge: data.badge || '/favicon.ico',
    tag: data.tag || 'eurodoor-notification',
    data: data.data || {},
    actions: data.actions || [
      {
        action: 'view',
        title: 'Ko\'rish'
      },
      {
        action: 'close',
        title: 'Yopish'
      }
    ],
    requireInteraction: true,
    silent: false,
    vibrate: [200, 100, 200], // Vibration pattern
    timestamp: Date.now()
  };

  console.log('📱 Showing notification with options:', options);

  event.waitUntil(
    self.registration.showNotification(data.title || 'Eurodoor', options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('👆 Notification clicked:', event);
  console.log('👆 Notification data:', event.notification.data);
  
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  // Client'ni ochish yoki focus qilish
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Agar sahifa ochiq bo'lsa, uni focus qilish va orders sahifasiga o'tish
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          // Orders sahifasiga o'tish
          client.postMessage({
            type: 'NAVIGATE_TO_ORDERS',
            orderNumber: event.notification.data?.orderNumber
          });
          return client.focus();
        }
      }
      
      // Agar sahifa ochiq bo'lmasa, yangi oynada ochish
      if (clients.openWindow) {
        // Har doim orders sahifasiga o'tish
        const url = `/#orders`;
        console.log('🔔 Opening new window with URL:', url);
        return clients.openWindow(url);
      }
    })
  );
});

// Background sync
self.addEventListener('sync', (event) => {
  console.log('🔄 Background sync:', event.tag);
  
  if (event.tag === 'order-sync') {
    event.waitUntil(
      // Bu yerda background'da order ma'lumotlarini sync qilish mumkin
      console.log('Syncing order data in background...')
    );
  }
});

// Message event - main thread bilan aloqa
self.addEventListener('message', (event) => {
  console.log('💬 Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  // Notification yuborish uchun message
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const data = event.data.data;
    console.log('🔔 Showing notification from Service Worker:', data);
    
    const options = {
      body: data.body,
      icon: data.icon || '/favicon.ico',
      badge: data.badge || '/favicon.ico',
      tag: data.tag,
      data: data.data || {},
      actions: data.actions || [
        {
          action: 'view',
          title: 'Ko\'rish'
        },
        {
          action: 'close',
          title: 'Yopish'
        }
      ],
      requireInteraction: true,
      silent: false,
      vibrate: data.vibrate || [200, 100, 200], // Vibration pattern
      timestamp: Date.now()
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});
