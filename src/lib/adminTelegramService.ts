import { supabase } from './supabase';

interface TriggerTelegramNotificationParams {
  order_id: string;
  status: string;
  customer_id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  total_amount?: number;
  delivery_address?: string;
  products?: any[];
}

export class AdminTelegramService {
  private static instance: AdminTelegramService;

  private constructor() {}

  public static getInstance(): AdminTelegramService {
    if (!AdminTelegramService.instance) {
      AdminTelegramService.instance = new AdminTelegramService();
    }
    return AdminTelegramService.instance;
  }

  public async triggerOrderStatusNotification(
    params: TriggerTelegramNotificationParams
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🔄 AdminTelegramService: Triggering Telegram notification for order:', params.order_number);

      const { data, error } = await supabase.functions.invoke('send-telegram-notification', {
        body: {
          chat_id: params.customer_phone.replace(/\D/g, ''), // Faqat raqamlarni olish
          order_number: params.order_number,
          customer_name: params.customer_name,
          customer_phone: params.customer_phone,
          status: params.status,
          title: `Buyurtma holati o'zgardi: #${params.order_number}`,
          message: `Sizning buyurtmangizning holati *${this.getStatusText(params.status)}* ga o'zgardi.`,
          total_amount: params.total_amount,
          delivery_address: params.delivery_address,
          products: params.products,
        },
      });

      if (error) {
        console.error('❌ Supabase function invoke error:', error);
        return { success: false, error: error.message };
      }

      if (data.error) {
        console.error('❌ Telegram notification function error:', data.error);
        return { success: false, error: data.error };
      }

      console.log('✅ AdminTelegramService: Telegram notification sent successfully:', data);
      return { success: true };
    } catch (error: any) {
      console.error('❌ AdminTelegramService: Error sending Telegram notification:', error);
      return { success: false, error: error.message || 'Unknown error' };
    }
  }

  private getStatusText(status: string): string {
    const statusMap: Record<string, string> = {
      'pending': 'Kutilmoqda',
      'confirmed': 'Tasdiqlandi',
      'processing': 'Tayyorlanmoqda',
      'ready': 'Tayyor',
      'shipped': 'Yuborildi',
      'delivered': 'Yetkazib berildi',
      'cancelled': 'Bekor qilindi'
    };
    return statusMap[status] || status;
  }
}

export const adminTelegramService = AdminTelegramService.getInstance();