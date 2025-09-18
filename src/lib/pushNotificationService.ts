export class PushNotificationService {
  private static instance: PushNotificationService;
  private notificationPermission: NotificationPermission = 'default';

  private constructor() {
    this.initializeNotifications();
  }

  public static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService();
    }
    return PushNotificationService.instance;
  }

  private async initializeNotifications() {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      this.notificationPermission = Notification.permission;
    }
  }

  // Browser notification permission so'rash
  async requestPermission(): Promise<boolean> {
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

  // Browser notification ko'rsatish
  showBrowserNotification(title: string, body: string, data?: any): boolean {
    if (this.notificationPermission !== 'granted') {
      console.log('⚠️ Notification permission not granted');
      return false;
    }

    try {
      const notification = new Notification(title, {
        body,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: data?.orderId || 'eurodoor-notification',
        requireInteraction: true,
        data: data
      });

      // Auto close after 8 seconds
      setTimeout(() => {
        notification.close();
      }, 8000);

      // Handle notification click
      notification.onclick = () => {
        window.focus();
        notification.close();
        
        // Order tracking page ga o'tish
        if (data?.orderId) {
          window.location.href = `/#orders?order=${data.orderId}`;
        }
      };

      console.log('✅ Browser notification shown:', title);
      return true;
    } catch (error) {
      console.error('❌ Error showing browser notification:', error);
      return false;
    }
  }

  // Push notification yuborish (browser notification orqali)
  async sendPushNotification(userId: string, title: string, body: string, data?: any): Promise<void> {
    try {
      console.log('📤 Sending push notification to user:', userId);
      
      // Browser notification ko'rsatish
      this.showBrowserNotification(title, body, data);
      
      console.log('✅ Push notification sent successfully');
    } catch (error) {
      console.error('❌ Error sending push notification:', error);
    }
  }

  // Order status o'zgarganida push notification yuborish
  async notifyOrderStatusChange(orderId: string, newStatus: string, customerId: string): Promise<void> {
    const statusMessages = {
      'pending': 'Buyurtmangiz qabul qilindi va ko\'rib chiqilmoqda',
      'confirmed': 'Buyurtmangiz tasdiqlandi va ishlab chiqarishga yuborildi',
      'processing': 'Buyurtmangiz ishlab chiqarilmoqda',
      'ready': 'Buyurtmangiz tayyor! Yetkazib berish uchun tayyorlanmoqda',
      'shipped': 'Buyurtmangiz yuborildi va yo\'lda',
      'delivered': 'Buyurtmangiz yetkazib berildi! Rahmat!',
      'cancelled': 'Buyurtmangiz bekor qilindi'
    };

    const title = '🔔 Eurodoor - Buyurtma Holati';
    const body = statusMessages[newStatus as keyof typeof statusMessages] || 'Buyurtmangiz holati o\'zgartirildi';
    
    const data = {
      orderId,
      status: newStatus,
      type: 'order_status_change'
    };

    await this.sendPushNotification(customerId, title, body, data);
  }

  // Test notification
  async showTestNotification(): Promise<boolean> {
    const granted = await this.requestPermission();
    if (!granted) {
      return false;
    }

    return this.showBrowserNotification(
      '🔔 Eurodoor - Test Notification',
      'Bu test xabari. Push notifications ishlayapti!',
      { type: 'test' }
    );
  }

  // Notification permission holatini olish
  getPermissionStatus(): NotificationPermission {
    return this.notificationPermission;
  }

  // Notification support tekshirish
  isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }
}

export const pushNotificationService = PushNotificationService.getInstance();

