// Order Notification Service for Customer Website
import { supabase } from './supabase';

export interface OrderNotification {
  id: string;
  order_id: string;
  customer_id: string;
  type: string;
  title: string;
  message: string;
  is_sent: boolean;
  is_read: boolean;
  push_sent: boolean;
  push_delivered: boolean;
  push_failed: boolean;
  created_at: string;
}

export class OrderNotificationService {
  private static instance: OrderNotificationService;
  private notificationPermission: NotificationPermission = 'default';

  private constructor() {
    this.initializeNotifications();
  }

  public static getInstance(): OrderNotificationService {
    if (!OrderNotificationService.instance) {
      OrderNotificationService.instance = new OrderNotificationService();
    }
    return OrderNotificationService.instance;
  }

  private async initializeNotifications() {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      this.notificationPermission = Notification.permission;
      
      if (this.notificationPermission === 'default') {
        this.notificationPermission = await Notification.requestPermission();
      }
    }
  }

  // Real-time order notifications subscription
  public subscribeToOrderNotifications(orderId: string, callback: (notification: OrderNotification) => void) {
    console.log('🔔 Subscribing to order notifications for order:', orderId);
    
    return supabase
      .channel(`order-notifications-${orderId}`, {
        config: {
          broadcast: { self: true },
          presence: { key: `order-${orderId}` }
        }
      })
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'order_notifications' },
        (payload) => {
          const notification = payload.new as OrderNotification;
          if (notification.order_id === orderId) {
            console.log('🔔 New order notification received:', notification);
            
            // Show browser notification
            this.showBrowserNotification(notification);
            
            // Call callback
            callback(notification);
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Order notification subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Successfully subscribed to order notifications');
        }
      });
  }

  // Show browser notification
  private showBrowserNotification(notification: OrderNotification) {
    if (this.notificationPermission === 'granted') {
      try {
        const browserNotification = new Notification(notification.title, {
          body: notification.message,
          icon: '/icon-192.png',
          badge: '/icon-192.png',
          tag: `order-${notification.order_id}`,
          requireInteraction: true,
          data: {
            orderId: notification.order_id,
            notificationId: notification.id
          }
        });

        // Auto close after 8 seconds
        setTimeout(() => {
          browserNotification.close();
        }, 8000);

        // Handle notification click
        browserNotification.onclick = () => {
          window.focus();
          browserNotification.close();
        };

        console.log('✅ Browser notification shown:', notification.title);
      } catch (error) {
        console.error('❌ Error showing browser notification:', error);
      }
    } else {
      console.log('⚠️ Notification permission not granted');
    }
  }

  // Mark notification as read
  public async markNotificationAsRead(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('order_notifications')
        .update({ 
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('id', notificationId);

      if (error) {
        console.error('❌ Error marking notification as read:', error);
        return false;
      }

      console.log('✅ Notification marked as read:', notificationId);
      return true;
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
      return false;
    }
  }

  // Get notifications for order
  public async getOrderNotifications(orderId: string): Promise<OrderNotification[]> {
    try {
      const { data, error } = await supabase
        .from('order_notifications')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching order notifications:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('❌ Error fetching order notifications:', error);
      return [];
    }
  }

  // Request notification permission
  public async requestNotificationPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      console.log('❌ Notifications not supported');
      return false;
    }

    if (this.notificationPermission === 'granted') {
      return true;
    }

    if (this.notificationPermission === 'denied') {
      console.log('❌ Notification permission denied');
      return false;
    }

    try {
      this.notificationPermission = await Notification.requestPermission();
      console.log('📱 Notification permission:', this.notificationPermission);
      return this.notificationPermission === 'granted';
    } catch (error) {
      console.error('❌ Error requesting notification permission:', error);
      return false;
    }
  }

  // Check if notifications are supported
  public isNotificationSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  // Get notification permission status
  public getNotificationPermission(): NotificationPermission {
    return this.notificationPermission;
  }

  // Show test notification
  public async showTestNotification(): Promise<boolean> {
    if (this.notificationPermission !== 'granted') {
      const granted = await this.requestNotificationPermission();
      if (!granted) {
        return false;
      }
    }

    try {
      const testNotification = new Notification('Eurodoor - Test Notification', {
        body: 'Bu test xabari. Push notifications ishlayapti!',
        icon: '/icon-192.png',
        tag: 'test-notification'
      });

      setTimeout(() => {
        testNotification.close();
      }, 5000);

      console.log('✅ Test notification shown');
      return true;
    } catch (error) {
      console.error('❌ Error showing test notification:', error);
      return false;
    }
  }
}

// Export singleton instance
export const orderNotificationService = OrderNotificationService.getInstance();
