self.addEventListener('push', (event) => {
  let data = {}
  try { if (event.data) data = event.data.json() } catch(e){}
  const title = data.title || 'Eurodoor'
  const options = {
    body: data.body || '',
    icon: data.icon || '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag: data.tag || 'eurodoor',
    timestamp: Date.now(),
    data: { 
      url: data.url || '/orders',
      orderId: data.orderId,
      orderNumber: data.orderNumber,
      status: data.status
    }
  }
  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const targetUrl = event?.notification?.data?.url || '/orders'
  
  event.waitUntil((async () => {
    // Try to focus existing window first
    const list = await clients.matchAll({ type: 'window', includeUncontrolled: true })
    for (const c of list) { 
      if ('focus' in c) { 
        c.focus()
        // If it's an order notification, navigate to orders page
        if (event.notification.data?.orderId) {
          c.postMessage({ type: 'NAVIGATE_TO_ORDERS' })
        }
        return 
      } 
    }
    // Open new window if no existing window
    await clients.openWindow(targetUrl)
  })())
})