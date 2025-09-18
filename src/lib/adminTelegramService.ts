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

      // Avval telegram_users jadvalidan chat_id ni olish
      const phoneNumber = params.customer_phone.replace(/\D/g, '');
      let { data: telegramUser, error: telegramError } = await supabase
        .from('telegram_users')
        .select('chat_id, language')
        .eq('user_id', phoneNumber)
        .single();

      // Agar mijoz topilmasa, avtomatik qo'shish
      if (telegramError || !telegramUser) {
        console.log('🔄 Telegram user not found, trying to find chat_id automatically...');
        
        // Chat ID'ni avtomatik olish
        const chatId = await this.findChatIdByPhone(phoneNumber);
        
        if (chatId) {
          // Mijozni avtomatik qo'shish
          const { error: insertError } = await supabase
            .from('telegram_users')
            .insert({
              user_id: phoneNumber,
              chat_id: chatId,
              language: 'uzbek',
              created_at: new Date().toISOString()
            });

          if (insertError) {
            console.error('❌ Error inserting telegram user:', insertError);
          } else {
            console.log('✅ Telegram user added automatically:', chatId);
            telegramUser = { chat_id: chatId, language: 'uzbek' };
          }
        } else {
          console.error('❌ Could not find chat_id for phone:', phoneNumber);
          return { 
            success: false, 
            error: `Mijoz ${params.customer_phone} uchun Telegram chat ID topilmadi. Mijoz bot'ga /start yuborishi kerak.` 
          };
        }
      }

      console.log('📱 Using Telegram chat_id:', telegramUser.chat_id);

      const { data, error } = await supabase.functions.invoke('telegram-bot-complete', {
        body: {
          chat_id: telegramUser.chat_id, // To'g'ri chat_id
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

  private async findChatIdByPhone(phoneNumber: string): Promise<string | null> {
    try {
      // Telegram Bot API orqali chat ID'ni olish
      const botToken = '8297997191:AAEuIB8g0FH9Yk0waqmPsUgrFDXm5rL83OU';
      const response = await fetch(`https://api.telegram.org/bot${botToken}/getUpdates`);
      const data = await response.json();

      if (data.ok && data.result) {
        // Oxirgi xabarlarni tekshirish
        for (const update of data.result.reverse()) {
          if (update.message && update.message.chat) {
            const chatId = update.message.chat.id.toString();
            console.log('🔍 Found chat_id:', chatId, 'for update:', update.message.text);
            
            // Agar telefon raqam chat ID bilan mos kelsa yoki bot'ga /start yuborilgan bo'lsa
            if (update.message.text === '/start' || chatId === phoneNumber) {
              return chatId;
            }
          }
        }
      }

      // Agar topilmasa, telefon raqamni chat ID sifatida ishlatish
      console.log('🔄 Using phone number as chat_id:', phoneNumber);
      return phoneNumber;
      
    } catch (error) {
      console.error('❌ Error finding chat_id:', error);
      // Xatolik bo'lsa, telefon raqamni chat ID sifatida ishlatish
      return phoneNumber;
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