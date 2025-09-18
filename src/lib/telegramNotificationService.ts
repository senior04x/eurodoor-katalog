// Telegram Notification Service for Customer Website
import { supabase } from './supabase';

export interface TelegramNotificationData {
  chat_id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  status: string;
  title: string;
  message: string;
  total_amount?: number;
  delivery_address?: string;
  products?: any[];
}

export class TelegramNotificationService {
  private static instance: TelegramNotificationService;

  private constructor() {}

  public static getInstance(): TelegramNotificationService {
    if (!TelegramNotificationService.instance) {
      TelegramNotificationService.instance = new TelegramNotificationService();
    }
    return TelegramNotificationService.instance;
  }

  // Send order status notification to Telegram
  public async sendOrderStatusNotification(
    chatId: string,
    orderNumber: string,
    customerName: string,
    customerPhone: string,
    status: string,
    totalAmount?: number,
    deliveryAddress?: string,
    products?: any[]
  ): Promise<{ success: boolean; error?: string; messageId?: number }> {
    try {
      console.log('📱 TelegramNotificationService: Sending order status notification...');
      console.log('📱 Chat ID:', chatId);
      console.log('📱 Order:', orderNumber);
      console.log('📱 Status:', status);

      const title = this.getStatusTitle(status);
      const message = this.getStatusMessage(status, orderNumber);

      const notificationData: TelegramNotificationData = {
        chat_id: chatId,
        order_number: orderNumber,
        customer_name: customerName,
        customer_phone: customerPhone,
        status: status,
        title: title,
        message: message,
        total_amount: totalAmount,
        delivery_address: deliveryAddress,
        products: products
      };

      // Call Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('send-telegram-notification', {
        body: notificationData
      });

      if (error) {
        console.error('❌ TelegramNotificationService: Supabase function error:', error);
        return { success: false, error: error.message };
      }

      if (data?.success) {
        console.log('✅ TelegramNotificationService: Notification sent successfully');
        console.log('📱 Message ID:', data.telegram_message_id);
        return { 
          success: true, 
          messageId: data.telegram_message_id 
        };
      } else {
        console.error('❌ TelegramNotificationService: Function returned error:', data?.error);
        return { success: false, error: data?.error || 'Unknown error' };
      }

    } catch (error: any) {
      console.error('❌ TelegramNotificationService: Error sending notification:', error);
      return { success: false, error: error.message };
    }
  }

  // Get status title
  private getStatusTitle(status: string): string {
    const titleMap: Record<string, string> = {
      'pending': 'Buyurtma qabul qilindi',
      'confirmed': 'Buyurtma tasdiqlandi',
      'processing': 'Buyurtma tayyorlanmoqda',
      'ready': 'Buyurtma tayyor',
      'shipped': 'Buyurtma yuborildi',
      'delivered': 'Buyurtma yetkazib berildi',
      'cancelled': 'Buyurtma bekor qilindi'
    };
    return titleMap[status] || 'Buyurtma holati o\'zgartirildi';
  }

  // Get status message
  private getStatusMessage(status: string, orderNumber: string): string {
    const messageMap: Record<string, string> = {
      'pending': `Hurmatli mijoz, ${orderNumber} raqamli buyurtmangiz qabul qilindi va tez orada ko'rib chiqiladi.`,
      'confirmed': `Hurmatli mijoz, ${orderNumber} raqamli buyurtmangiz tasdiqlandi va tayyorlash jarayoni boshlandi.`,
      'processing': `Hurmatli mijoz, ${orderNumber} raqamli buyurtmangiz hozir tayyorlanmoqda. Tez orada tayyor bo'ladi.`,
      'ready': `Hurmatli mijoz, ${orderNumber} raqamli buyurtmangiz tayyor! Yetkazib berish uchun tayyorlanmoqda.`,
      'shipped': `Hurmatli mijoz, ${orderNumber} raqamli buyurtmangiz yuborildi va yo'lda. Tez orada yetkazib beriladi.`,
      'delivered': `Hurmatli mijoz, ${orderNumber} raqamli buyurtmangiz muvaffaqiyatli yetkazib berildi! Rahmat!`,
      'cancelled': `Hurmatli mijoz, ${orderNumber} raqamli buyurtmangiz texnik sabablarga ko'ra bekor qilindi.`
    };
    return messageMap[status] || `Hurmatli mijoz, ${orderNumber} raqamli buyurtmangizning holati o'zgartirildi.`;
  }

  // Test Telegram notification
  public async sendTestNotification(chatId: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('📱 TelegramNotificationService: Sending test notification...');

      const testData: TelegramNotificationData = {
        chat_id: chatId,
        order_number: 'TEST-001',
        customer_name: 'Test Mijoz',
        customer_phone: '+998 90 123 45 67',
        status: 'confirmed',
        title: 'Test xabari',
        message: 'Bu test xabari. Telegram bot ishlayapti!',
        total_amount: 100000,
        delivery_address: 'Test manzil'
      };

      const { data, error } = await supabase.functions.invoke('send-telegram-notification', {
        body: testData
      });

      if (error) {
        console.error('❌ TelegramNotificationService: Test notification error:', error);
        return { success: false, error: error.message };
      }

      if (data?.success) {
        console.log('✅ TelegramNotificationService: Test notification sent successfully');
        return { success: true };
      } else {
        console.error('❌ TelegramNotificationService: Test notification failed:', data?.error);
        return { success: false, error: data?.error || 'Unknown error' };
      }

    } catch (error: any) {
      console.error('❌ TelegramNotificationService: Test notification error:', error);
      return { success: false, error: error.message };
    }
  }
}

// Export singleton instance
export const telegramNotificationService = TelegramNotificationService.getInstance();
