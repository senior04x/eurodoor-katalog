// Supabase Edge Function for sending Telegram notifications
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TelegramNotificationData {
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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const data: TelegramNotificationData = await req.json()
    const { chat_id, order_number, customer_name, customer_phone, status, title, message, total_amount, delivery_address, products } = data

    if (!chat_id || !order_number || !customer_name) {
      return new Response(
        JSON.stringify({ error: 'chat_id, order_number, and customer_name are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get Telegram Bot Token from environment
    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN')
    if (!botToken) {
      console.error('❌ TELEGRAM_BOT_TOKEN not found in environment variables')
      return new Response(
        JSON.stringify({ error: 'Telegram bot token not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Format status text
    const statusText = getStatusText(status)
    const statusEmoji = getStatusEmoji(status)

    // Format products list
    let productsList = '';
    if (products && products.length > 0) {
      productsList = products.map((p: any, index: number) => `${index + 1}. ${p.product_name || 'N/A'}
   Miqdor: ${p.quantity || 1} ta
   Narx: ${p.unit_price ? p.unit_price.toLocaleString() + ' so\'m' : 'N/A'}
   Jami: ${p.total_price ? p.total_price.toLocaleString() + ' so\'m' : 'N/A'}${p.product_model ? `\n   Model: ${p.product_model}` : ''}${p.color ? `\n   Rang: ${p.color}` : ''}${p.material ? `\n   Material: ${p.material}` : ''}`).join('\n');
    } else {
      productsList = 'Mahsulotlar ro\'yxati mavjud emas';
    }

    // Create Telegram message in HTML quote format
    const telegramMessage = `
<blockquote>
EURODOOR
────────────────────────
BUYURTMA CHEKI
────────────────────────

Mijoz: ${customer_name}
Telefon: ${customer_phone}
Buyurtma: #${order_number}
Sana: ${new Date().toLocaleDateString('uz-UZ')}
Vaqt: ${new Date().toLocaleTimeString('uz-UZ')}

${productsList}

────────────────────────
TO'LOV MA'LUMOTLARI
────────────────────────
Jami summa: ${total_amount ? total_amount.toLocaleString() + ' so\'m' : 'N/A'}
Yetkazib berish: ${delivery_address || 'Kiritilmagan'}

────────────────────────
BUYURTMA HOLATI
────────────────────────
Holat: ${statusText}

${getStatusDescription(status)}
────────────────────────
</blockquote>
    `.trim()

    // Send message to Telegram
    const telegramResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chat_id,
        text: telegramMessage,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "Buyurtmalarimni ko'rish",
                web_app: {
                  url: `https://eurodoor.uz/#orders`
                }
              }
            ],
            [
              {
                text: "Bosh sahifa",
                web_app: {
                  url: `https://eurodoor.uz/#home`
                }
              }
            ]
          ]
        }
      }),
    })

    if (!telegramResponse.ok) {
      const errorText = await telegramResponse.text()
      console.error('❌ Telegram API error:', errorText)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to send Telegram message',
          details: errorText 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const telegramResult = await telegramResponse.json()
    console.log('✅ Telegram message sent successfully:', telegramResult)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Telegram notification sent successfully',
        telegram_message_id: telegramResult.result?.message_id,
        chat_id: chat_id
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('❌ Error in send-telegram-notification function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

function getStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    'pending': 'Kutilmoqda',
    'confirmed': 'Tasdiqlandi',
    'processing': 'Tayyorlanmoqda',
    'ready': 'Tayyor',
    'shipped': 'Yuborildi',
    'delivered': 'Yetkazib berildi',
    'cancelled': 'Bekor qilindi'
  }
  return statusMap[status] || status
}

function getStatusEmoji(status: string): string {
  const emojiMap: Record<string, string> = {
    'pending': '⏳',
    'confirmed': '✅',
    'processing': '🔄',
    'ready': '📦',
    'shipped': '🚚',
    'delivered': '🎉',
    'cancelled': '❌'
  }
  return emojiMap[status] || '📋'
}

function getStatusDescription(status: string): string {
  const descriptions: Record<string, string> = {
    'pending': 'Buyurtmangiz qabul qilindi va tasdiqlanishi kutilmoqda.',
    'confirmed': 'Buyurtmangiz tasdiqlandi. Tez orada tayyorlanishga kirishamiz.',
    'processing': 'Buyurtmangiz tayyorlanish jarayonida.',
    'ready': 'Buyurtmangiz tayyor bo\'ldi va yetkazib berishga tayyor.',
    'shipped': 'Buyurtmangiz yo\'lda! Tez orada yetkazib beriladi.',
    'delivered': 'Buyurtmangiz muvaffaqiyatli yetkazib berildi. Xaridingiz uchun rahmat!',
    'cancelled': 'Buyurtmangiz bekor qilindi. Qo\'shimcha ma\'lumot uchun biz bilan bog\'laning.'
  }
  return descriptions[status] || 'Buyurtma holati yangilandi.'
}
