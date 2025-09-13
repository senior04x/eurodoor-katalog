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
    if (!this.isSupported || this.permission !== 'granted') {
      console.warn('Cannot show notification: permission not granted');
      return;
    }

    try {
      const notification = new Notification(data.title, {
        body: data.body,
        icon: data.icon || '/favicon.ico',
        badge: data.badge || '/favicon.ico',
        tag: data.tag,
        data: data.data,
        actions: data.actions,
        requireInteraction: true, // Notification avtomatik yopilmasin
        silent: false
      });

      // Notification click event
      notification.onclick = () => {
        window.focus();
        notification.close();
        
        // Agar order tracking sahifasiga o'tish kerak bo'lsa
        if (data.data?.orderNumber) {
          // Order tracking sahifasiga o'tish
          window.location.href = `#order-tracking?order=${data.data.orderNumber}`;
        }
      };

      // Notification yopilganda
      notification.onclose = () => {
        console.log('Notification closed');
      };

      // 10 soniyadan keyin avtomatik yopish
      setTimeout(() => {
        notification.close();
      }, 10000);

    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }

  // Order status o'zgarishini kuzatish
  async watchOrderStatus(orderNumber: string, customerPhone: string): Promise<void> {
    try {
      console.log(`🔔 Watching order status for: ${orderNumber}`);
      console.log(`📱 Customer phone: ${customerPhone}`);
      console.log(`🔐 Notification permission: ${this.permission}`);
      
      // Real-time subscription
      const subscription = supabase
        .channel(`order-${orderNumber}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'orders',
            filter: `order_number=eq.${orderNumber}`
          },
          async (payload) => {
            console.log('📦 Order status changed:', payload);
            console.log('📦 Payload details:', {
              new: payload.new,
              old: payload.old,
              eventType: payload.eventType
            });
            
            const order = payload.new as any;
            const oldOrder = payload.old as any;
            
            // Agar status o'zgargan bo'lsa
            if (order.status !== oldOrder.status) {
              console.log(`🔄 Status changed from ${oldOrder.status} to ${order.status}`);
              await this.handleOrderStatusChange(order, orderNumber);
            } else {
              console.log('⚠️ Status did not change, skipping notification');
            }
          }
        )
        .subscribe((status) => {
          console.log(`📡 Subscription status: ${status}`);
          if (status === 'SUBSCRIBED') {
            console.log(`✅ Successfully subscribed to order: ${orderNumber}`);
          } else if (status === 'CHANNEL_ERROR') {
            console.error(`❌ Channel error for order: ${orderNumber}`);
          } else if (status === 'TIMED_OUT') {
            console.error(`⏰ Subscription timed out for order: ${orderNumber}`);
          }
        });

      // 30 daqiqadan keyin subscription ni to'xtatish
      setTimeout(() => {
        subscription.unsubscribe();
        console.log(`🔔 Stopped watching order: ${orderNumber}`);
      }, 30 * 60 * 1000); // 30 daqiqa

    } catch (error) {
      console.error('Error watching order status:', error);
    }
  }

  // Order status o'zgarishini boshqarish
  private async handleOrderStatusChange(order: any, orderNumber: string): Promise<void> {
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
    if (message) {
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

      // Email notification yuborish (agar email mavjud bo'lsa)
      if (order.customer_email) {
        await this.sendEmailNotification(order, message);
      }
    }
  }

  // Email notification yuborish
  private async sendEmailNotification(order: any, message: any): Promise<void> {
    try {
      // Supabase Edge Function chaqirish
      const { error } = await supabase.functions.invoke('send-order-notification', {
        body: {
          email: order.customer_email,
          orderNumber: order.order_number,
          customerName: order.customer_name,
          status: order.status,
          title: message.title,
          body: message.body,
          totalAmount: order.total_amount
        }
      });

      if (error) {
        console.error('Error sending email notification:', error);
      } else {
        console.log('✅ Email notification sent successfully');
      }
    } catch (error) {
      console.error('Error sending email notification:', error);
    }
  }

  // Service Worker registration
  async registerServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('✅ Service Worker registered:', registration);
      } catch (error) {
        console.error('❌ Service Worker registration failed:', error);
      }
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
