// Debug script for notification issues
console.log('🔍 Notification Debug Script Started');

// 1. Check Notification Support
console.log('📱 Notification Support:', 'Notification' in window);

// 2. Check Permission Status
console.log('🔐 Permission Status:', Notification.permission);

// 3. Check Service Worker Support
console.log('⚙️ Service Worker Support:', 'serviceWorker' in navigator);

// 4. Check if Service Worker is registered
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    console.log('📋 Service Worker Registrations:', registrations.length);
    registrations.forEach((reg, index) => {
      console.log(`SW ${index + 1}:`, reg.scope);
    });
  });
}

// 5. Test Basic Notification
function testNotification() {
  if (Notification.permission === 'granted') {
    const notification = new Notification('Test Notification', {
      body: 'Bu test notification. Agar siz buni ko\'ryapsiz, notification system ishlayapti!',
      icon: '/favicon.ico',
      tag: 'debug-test'
    });
    
    notification.onclick = () => {
      console.log('✅ Test notification clicked');
      notification.close();
    };
    
    console.log('✅ Test notification sent');
  } else {
    console.log('❌ Notification permission not granted');
  }
}

// 6. Request Permission
async function requestPermission() {
  try {
    const permission = await Notification.requestPermission();
    console.log('🔐 Permission result:', permission);
    return permission === 'granted';
  } catch (error) {
    console.error('❌ Error requesting permission:', error);
    return false;
  }
}

// 7. Check Local Storage for Order Data
function checkOrderData() {
  const lastOrderData = localStorage.getItem('lastOrderData');
  console.log('📦 Last Order Data:', lastOrderData);
  
  if (lastOrderData) {
    try {
      const orderData = JSON.parse(lastOrderData);
      console.log('📋 Parsed Order Data:', orderData);
      return orderData;
    } catch (error) {
      console.error('❌ Error parsing order data:', error);
    }
  }
  return null;
}

// 8. Check if notification service is available
function checkNotificationService() {
  if (typeof window !== 'undefined' && window.notificationService) {
    console.log('✅ Notification Service available');
    return true;
  } else {
    console.log('❌ Notification Service not available');
    return false;
  }
}

// 9. Manual notification test for order status
function testOrderNotification(orderNumber = 'EURO-872475', status = 'confirmed') {
  if (Notification.permission !== 'granted') {
    console.log('❌ Permission not granted for order notification');
    return;
  }

  const statusMessages = {
    'confirmed': {
      title: '✅ Buyurtma Tasdiqlandi!',
      body: `Sizning ${orderNumber} raqamli buyurtmangiz tasdiqlandi. Tez orada siz bilan bog'lanamiz.`
    },
    'processing': {
      title: '🔄 Buyurtma Tayyorlanmoqda',
      body: `Sizning ${orderNumber} raqamli buyurtmangiz tayyorlanmoqda.`
    },
    'shipped': {
      title: '🚚 Buyurtma Yuborildi',
      body: `Sizning ${orderNumber} raqamli buyurtmangiz yuborildi.`
    },
    'delivered': {
      title: '🎉 Buyurtma Yetkazib Berildi!',
      body: `Sizning ${orderNumber} raqamli buyurtmangiz yetkazib berildi.`
    }
  };

  const message = statusMessages[status];
  if (message) {
    const notification = new Notification(message.title, {
      body: message.body,
      icon: '/favicon.ico',
      tag: `order-${orderNumber}-${status}`,
      data: { orderNumber, status },
      requireInteraction: true
    });

    notification.onclick = () => {
      console.log('✅ Order notification clicked');
      notification.close();
    };

    console.log(`✅ Order notification sent for ${orderNumber} with status ${status}`);
  }
}

// 10. Check Supabase connection
async function checkSupabaseConnection() {
  try {
    // This will only work if Supabase is available in the current context
    if (typeof window !== 'undefined' && window.supabase) {
      const { data, error } = await window.supabase.from('orders').select('count').limit(1);
      if (error) {
        console.log('❌ Supabase connection error:', error);
      } else {
        console.log('✅ Supabase connection OK');
      }
    } else {
      console.log('⚠️ Supabase not available in current context');
    }
  } catch (error) {
    console.log('❌ Supabase check error:', error);
  }
}

// Run all checks
console.log('🚀 Running all debug checks...');

// Make functions available globally for manual testing
window.debugNotifications = {
  testNotification,
  requestPermission,
  checkOrderData,
  checkNotificationService,
  testOrderNotification,
  checkSupabaseConnection
};

console.log('🔧 Debug functions available as window.debugNotifications');
console.log('📖 Usage examples:');
console.log('  - window.debugNotifications.requestPermission()');
console.log('  - window.debugNotifications.testNotification()');
console.log('  - window.debugNotifications.testOrderNotification("EURO-872475", "confirmed")');
console.log('  - window.debugNotifications.checkOrderData()');
