self.addEventListener('push', (event) => {
  let data = {}
  try { if (event.data) data = event.data.json() } catch(e){}
  const title = data.title || 'Eurodoor'
  const options = {
    body: data.body || '',
    icon: data.icon || '/favicon.ico',
    badge: '/favicon.ico',
    tag: data.tag || 'eurodoor',
    timestamp: Date.now(),
    data: { url: data.url || '/en/orders.html' }
  }
  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const targetUrl = event?.notification?.data?.url || '/en/orders.html'
  event.waitUntil((async () => {
    const list = await clients.matchAll({ type: 'window', includeUncontrolled: true })
    for (const c of list) { if ('focus' in c) { c.focus(); return } }
    await clients.openWindow(targetUrl)
  })())
})