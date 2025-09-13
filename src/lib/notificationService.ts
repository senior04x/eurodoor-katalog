// Notification Service for Eurodoor
import { supabase } from './supabase';

export interface NotificationData {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

class NotificationService {
  private permission: NotificationPermission = 'default';
  private isSupported: boolean = false;
  private lastNotificationTime: { [key: string]: number } = {};
  private notificationDebounceTime: number = 1000; // 1 soniya
  private globalSubscription: any = null;
  private isWatching: boolean = false;

  constructor() {
    this.isSupported = 'Notification' in window;
    this.permission = this.isSupported ? Notification.permission : 'denied';
  }

  // Notification ruxsatini so'rash
  async requestPermission(): Promise<boolean> {
    if (!this.isSupported) {
      console.warn('Notifications are not supported in this browser');
      return false;
    }

    if (this.permission === 'granted') {
      return true;
    }

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  // Browser notification yuborish
  async showNotification(data: NotificationData): Promise<void> {
    console.log('🔔 showNotification called with data:', data);
    console.log('🔔 Permission status:', this.permission);
    console.log('🔔 Is supported:', this.isSupported);
    
    if (!this.isSupported || this.permission !== 'granted') {
      console.warn('Cannot show notification: permission not granted or not supported');
      console.warn('Permission:', this.permission, 'Supported:', this.isSupported);
      return;
    }

    try {
      // Duplicate notification'larni oldini olish uchun tag ishlatish
      const tag = data.tag || `notification-${Date.now()}`;
      console.log('🔔 Using tag:', tag);
      
      // Service Worker orqali notification yuborish (background support uchun)
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.ready;
          if (registration.active) {
            console.log('🔔 Sending notification via Service Worker for background support');
            registration.active.postMessage({
              type: 'SHOW_NOTIFICATION',
              data: {
                ...data,
                tag: tag,
                requireInteraction: true,
                silent: false,
                vibrate: [200, 100, 200]
              }
            });
            console.log('✅ Notification sent via Service Worker');
            return; // Service Worker orqali yuborildi
          }
        } catch (error) {
          console.log('⚠️ Service Worker notification failed, falling back to direct notification:', error);
        }
      }

      console.log('🔔 Creating browser notification directly');
      const notificationOptions: NotificationOptions = {
        body: data.body,
        icon: data.icon || '/favicon.ico',
        badge: data.badge || '/favicon.ico',
        tag: tag, // Duplicate'larni oldini olish uchun
        data: data.data,
        requireInteraction: true, // Notification avtomatik yopilmasin
        silent: false
      };

      // Add actions if supported (Chrome/Edge only)
      if (data.actions && 'actions' in Notification.prototype) {
        (notificationOptions as any).actions = data.actions;
      }

      console.log('🔔 Notification options:', notificationOptions);
      const notification = new Notification(data.title, notificationOptions);
      console.log('🔔 Notification created:', notification);

      // Notification click event
      notification.onclick = () => {
        console.log('🔔 Notification clicked');
        window.focus();
        notification.close();
        
        // Buyurtmalar sahifasiga o'tish
        if (data.data?.orderNumber) {
          // Order tracking sahifasiga o'tish
          window.location.href = `#orders`;
          console.log(`🔔 Notification clicked - navigating to orders page for order: ${data.data.orderNumber}`);
        } else {
          // Umumiy buyurtmalar sahifasiga o'tish
          window.location.href = `#orders`;
          console.log('🔔 Notification clicked - navigating to orders page');
        }
      };

      // Notification yopilganda
      notification.onclose = () => {
        console.log('🔔 Notification closed');
      };

      // 15 soniyadan keyin avtomatik yopish
      setTimeout(() => {
        notification.close();
      }, 15000);

      console.log(`✅ Notification shown with tag: ${tag}`);

    } catch (error) {
      console.error('❌ Error showing notification:', error);
    }
  }

  // Global order status o'zgarishini kuzatish (barcha order'lar uchun)
  async startGlobalOrderWatching(): Promise<void> {
    if (this.isWatching) {
      console.log('🔔 Already watching orders globally');
      return;
    }

    try {
      console.log('🔔 Starting global order watching...');
      console.log(`🔐 Notification permission: ${this.permission}`);
      
      // Global real-time subscription - barcha order'lar uchun
      this.globalSubscription = supabase
        .channel('global-orders-watching')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'orders'
          },
          async (payload) => {
            console.log('📦 Global order status changed:', payload);
            console.log('📦 Payload details:', {
              new: payload.new,
              old: payload.old,
              eventType: payload.eventType
            });
            
            const order = payload.new as any;
            const oldOrder = payload.old as any;
            
            // Agar status o'zgargan bo'lsa
            if (order.status !== oldOrder.status) {
              console.log(`🔄 Status changed from ${oldOrder.status} to ${order.status} for order: ${order.order_number}`);
              console.log(`🔔 Permission status: ${this.permission}`);
              console.log(`🔔 Is supported: ${this.isSupported}`);
              await this.handleOrderStatusChange(order, order.order_number);
            } else {
              console.log('⚠️ Status did not change, skipping notification');
            }
          }
        )
        .subscribe((status) => {
          console.log(`📡 Global subscription status: ${status}`);
          if (status === 'SUBSCRIBED') {
            console.log('✅ Successfully subscribed to global orders');
            this.isWatching = true;
            
            // Background sync'ni boshlash
            this.startBackgroundSync();
          } else if (status === 'CHANNEL_ERROR') {
            console.error('❌ Global channel error');
          } else if (status === 'TIMED_OUT') {
            console.error('⏰ Global subscription timed out');
          }
        });

    } catch (error) {
      console.error('Error starting global order watching:', error);
    }
  }

  // Background sync'ni boshlash
  async startBackgroundSync(): Promise<void> {
    try {
      if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
        const registration = await navigator.serviceWorker.ready;
        
        // Periodic background sync
        if ('periodicSync' in window.ServiceWorkerRegistration.prototype) {
          try {
            await (registration as any).periodicSync.register('order-sync', {
              minInterval: 60000 // 1 daqiqa
            });
            console.log('✅ Periodic background sync registered');
          } catch (error) {
            console.log('⚠️ Periodic sync not supported:', error);
          }
        }

        // Background sync
        try {
          if ('sync' in registration) {
            await (registration as any).sync.register('order-sync');
            console.log('✅ Background sync registered');
          } else {
            console.log('⚠️ Background sync not supported');
          }
        } catch (error) {
          console.log('⚠️ Background sync failed:', error);
        }
      }
    } catch (error) {
      console.error('❌ Error starting background sync:', error);
    }
  }

  // Global subscription'ni to'xtatish
  stopGlobalOrderWatching(): void {
    if (this.globalSubscription) {
      this.globalSubscription.unsubscribe();
      this.globalSubscription = null;
      this.isWatching = false;
      console.log('🔔 Stopped global order watching');
    }
  }

  // Order status o'zgarishini kuzatish (legacy method - faqat bir order uchun)
  async watchOrderStatus(orderNumber: string, customerPhone: string): Promise<void> {
    try {
      console.log(`🔔 Watching order status for: ${orderNumber}`);
      console.log(`📱 Customer phone: ${customerPhone}`);
      console.log(`🔐 Notification permission: ${this.permission}`);
      
      // Global watching'ni boshlash (agar hali boshlanmagan bo'lsa)
      if (!this.isWatching) {
        await this.startGlobalOrderWatching();
      }

    } catch (error) {
      console.error('Error watching order status:', error);
    }
  }

  // Order status o'zgarishini boshqarish
  private async handleOrderStatusChange(order: any, orderNumber: string): Promise<void> {
    console.log(`🔔 handleOrderStatusChange called for order: ${orderNumber}, status: ${order.status}`);
    console.log(`🔔 Current permission: ${this.permission}`);
    console.log(`🔔 Is supported: ${this.isSupported}`);
    
    const statusMessages = {
      'confirmed': {
        title: '✅ Buyurtma Tasdiqlandi!',
        body: `Sizning ${orderNumber} raqamli buyurtmangiz tasdiqlandi. Tez orada siz bilan bog'lanamiz.`,
        tag: `order-${orderNumber}-confirmed`
      },
      'processing': {
        title: '🔄 Buyurtma Tayyorlanmoqda',
        body: `Sizning ${orderNumber} raqamli buyurtmangiz tayyorlanmoqda.`,
        tag: `order-${orderNumber}-processing`
      },
      'shipped': {
        title: '🚚 Buyurtma Yuborildi',
        body: `Sizning ${orderNumber} raqamli buyurtmangiz yuborildi. Tez orada yetkazib beriladi.`,
        tag: `order-${orderNumber}-shipped`
      },
      'delivered': {
        title: '🎉 Buyurtma Yetkazib Berildi!',
        body: `Sizning ${orderNumber} raqamli buyurtmangiz muvaffaqiyatli yetkazib berildi.`,
        tag: `order-${orderNumber}-delivered`
      },
      'cancelled': {
        title: '❌ Buyurtma Bekor Qilindi',
        body: `Sizning ${orderNumber} raqamli buyurtmangiz bekor qilindi.`,
        tag: `order-${orderNumber}-cancelled`
      }
    };

    const message = statusMessages[order.status as keyof typeof statusMessages];
    console.log(`🔔 Message for status ${order.status}:`, message);
    
    if (message) {
      // Duplicate notification'larni oldini olish
      const notificationKey = `${orderNumber}-${order.status}`;
      const now = Date.now();
      const lastTime = this.lastNotificationTime[notificationKey] || 0;
      
      if (now - lastTime < this.notificationDebounceTime) {
        console.log(`⚠️ Skipping duplicate notification for ${notificationKey}`);
        console.log(`⚠️ Time difference: ${now - lastTime}ms, debounce time: ${this.notificationDebounceTime}ms`);
        return;
      }
      
      this.lastNotificationTime[notificationKey] = now;
      console.log(`✅ Showing notification for ${notificationKey}`);
      console.log(`🔔 Notification data:`, {
        ...message,
        data: { orderNumber, status: order.status }
      });

      try {
        await this.showNotification({
          ...message,
          data: { orderNumber, status: order.status },
          actions: [
            {
              action: 'view',
              title: 'Ko\'rish',
              icon: '/icons/eye.png'
            },
            {
              action: 'close',
              title: 'Yopish',
              icon: '/icons/close.png'
            }
          ]
        });
        console.log(`✅ Notification sent successfully for ${notificationKey}`);
      } catch (error) {
        console.error(`❌ Error sending notification for ${notificationKey}:`, error);
      }

      // Email notification yuborish (agar email mavjud bo'lsa)
      // Temporarily disabled due to CORS issues
      // if (order.customer_email) {
      //   await this.sendEmailNotification(order, message);
      // }
    } else {
      console.log(`⚠️ No message found for status: ${order.status}`);
    }
  }

  // Email notification yuborish - DISABLED due to CORS issues
  private async sendEmailNotification(order: any, message: any): Promise<void> {
    console.log('📧 Email notification disabled due to CORS issues');
    // Email notification temporarily disabled
    // This prevents CORS errors in console
  }

  // Service Worker registration
  async registerServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('✅ Service Worker registered:', registration);
        
        // Push subscription uchun
        if ('PushManager' in window) {
          console.log('✅ Push API supported');
          await this.subscribeToPush(registration);
        } else {
          console.log('❌ Push API not supported');
        }
      } catch (error) {
        console.error('❌ Service Worker registration failed:', error);
      }
    }
  }

  // Push subscription
  async subscribeToPush(registration: ServiceWorkerRegistration): Promise<void> {
    try {
      const subscription = await registration.pushManager.getSubscription();
      
      if (!subscription) {
        console.log('🔔 Creating new push subscription...');
        const newSubscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(
            'BEl62iUYgUivxIkv69yViEuiBIa40HI0lF5AwyKcnxXs4VWXK8dTInu3FIni8kHUpcMWvqyJ8sY8qa4r8UXwcm8'
          ) as BufferSource
        });
        console.log('✅ Push subscription created:', newSubscription);
        
        // Subscription'ni server'ga yuborish
        await this.sendSubscriptionToServer(newSubscription);
      } else {
        console.log('✅ Push subscription already exists:', subscription);
        // Mavjud subscription'ni server'ga yuborish
        await this.sendSubscriptionToServer(subscription);
      }
    } catch (error) {
      console.error('❌ Push subscription failed:', error);
    }
  }

  // Subscription'ni server'ga yuborish
  async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
    try {
      console.log('📤 Sending subscription to server...');
      console.log('📤 Subscription details:', {
        endpoint: subscription.endpoint,
        keys: subscription.getKey ? {
          p256dh: subscription.getKey('p256dh'),
          auth: subscription.getKey('auth')
        } : 'No keys available'
      });
      
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) {
        console.error('❌ No authenticated user found');
        return;
      }

      // Supabase'ga subscription'ni saqlash
      const { data, error } = await supabase
        .from('push_subscriptions')
        .upsert({
          user_id: user.id,
          subscription: subscription.toJSON(),
          created_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('❌ Failed to save subscription:', error);
      } else {
        console.log('✅ Subscription saved to server:', data);
      }
    } catch (error) {
      console.error('❌ Error sending subscription to server:', error);
    }
  }

  // VAPID key conversion
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Test push notification yuborish
  async sendTestPushNotification(): Promise<void> {
    try {
      console.log('🧪 Sending test push notification...');
      
      const { data, error } = await supabase.functions.invoke('test-push-notification', {
        body: {}
      });

      if (error) {
        console.error('❌ Test push notification failed:', error);
        throw error;
      } else {
        console.log('✅ Test push notification sent:', data);
      }
    } catch (error) {
      console.error('❌ Error sending test push notification:', error);
      throw error;
    }
  }

  // Notification permission holatini olish
  getPermissionStatus(): NotificationPermission {
    return this.permission;
  }

  // Notification support holatini olish
  isNotificationSupported(): boolean {
    return this.isSupported;
  }
}

// Singleton instance
export const notificationService = new NotificationService();
