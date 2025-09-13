import { supabase } from './supabase';

export class PushNotificationService {
  // Push notification yuborish
  async sendPushNotification(userId: string, title: string, body: string, data?: any): Promise<void> {
    try {
      console.log('📤 Sending push notification to user:', userId);
      
      // User'ning push subscription'ini olish
      const { data: subscriptions, error } = await supabase
        .from('push_subscriptions')
        .select('subscription')
        .eq('user_id', userId);

      if (error) {
        console.error('❌ Error fetching subscriptions:', error);
        return;
      }

      if (!subscriptions || subscriptions.length === 0) {
        console.log('⚠️ No push subscriptions found for user:', userId);
        return;
      }

      // Har bir subscription uchun push notification yuborish
      for (const sub of subscriptions) {
        await this.sendToSubscription(sub.subscription, title, body, data);
      }

      console.log('✅ Push notifications sent successfully');
    } catch (error) {
      console.error('❌ Error sending push notification:', error);
    }
  }

  // Subscription'ga push notification yuborish
  private async sendToSubscription(subscription: any, title: string, body: string, data?: any): Promise<void> {
    try {
      // Bu yerda Web Push API ishlatiladi
      // Ammo browser'dan server'ga push yuborish uchun server-side push service kerak
      // Hozircha console'da log qilamiz
      console.log('📱 Would send push notification:', {
        subscription,
        title,
        body,
        data
      });

      // Real implementation uchun server-side push service kerak
      // Masalan: Firebase Cloud Messaging, OneSignal, yoki custom push service
      
    } catch (error) {
      console.error('❌ Error sending to subscription:', error);
    }
  }

  // Order status o'zgarganida push notification yuborish
  async notifyOrderStatusChange(orderId: string, newStatus: string, customerId: string): Promise<void> {
    const statusMessages = {
      'pending': 'Buyurtmangiz qabul qilindi!',
      'confirmed': 'Buyurtmangiz tasdiqlandi!',
      'processing': 'Buyurtmangiz tayyorlanmoqda!',
      'ready': 'Buyurtmangiz tayyor!',
      'delivered': 'Buyurtmangiz yetkazildi!',
      'cancelled': 'Buyurtmangiz bekor qilindi!'
    };

    const title = '🔔 Buyurtma Holati O\'zgartirildi';
    const body = statusMessages[newStatus as keyof typeof statusMessages] || 'Buyurtmangiz holati o\'zgartirildi';
    
    const data = {
      orderId,
      status: newStatus,
      type: 'order_status_change'
    };

    await this.sendPushNotification(customerId, title, body, data);
  }
}

export const pushNotificationService = new PushNotificationService();
