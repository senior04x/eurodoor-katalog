// Admin panel uchun Telegram notification trigger
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AdminTriggerData {
  order_id: string;
  new_status: string;
  old_status?: string;
  admin_user_id?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { order_id, new_status, old_status, admin_user_id }: AdminTriggerData = await req.json()

    if (!order_id || !new_status) {
      return new Response(
        JSON.stringify({ error: 'order_id and new_status are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`🔔 Admin triggered Telegram notification for order ${order_id}: ${old_status} → ${new_status}`)

    // Create Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        customer_registrations!inner(
          id,
          name,
          phone,
          email
        )
      `)
      .eq('id', order_id)
      .single()

    if (orderError || !order) {
      console.error('❌ Order not found:', orderError)
      return new Response(
        JSON.stringify({ error: 'Order not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const customer = order.customer_registrations
    console.log('📋 Order found:', order.order_number, 'Customer:', customer.name)

    // Get customer's Telegram chat ID
    const { data: telegramUser, error: telegramError } = await supabase
      .from('telegram_users')
      .select('chat_id, language')
      .eq('user_id', customer.phone?.replace(/\D/g, '') || '')
      .single()

    if (telegramError || !telegramUser) {
      console.log('⚠️ Customer not found in Telegram users or no phone number')
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Customer not found in Telegram users or no phone number',
          order_number: order.order_number,
          customer_name: customer.name
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('📱 Telegram user found:', telegramUser.chat_id)

    // Send Telegram notification
    const telegramData = {
      chat_id: telegramUser.chat_id.toString(),
      order_number: order.order_number,
      customer_name: customer.name || 'Mijoz',
      customer_phone: customer.phone || '',
      status: new_status,
      title: getStatusTitle(new_status, telegramUser.language || 'uzbek'),
      message: getStatusMessage(new_status, order.order_number, telegramUser.language || 'uzbek'),
      total_amount: order.total_amount,
      delivery_address: order.delivery_address,
      products: order.products || []
    }

    // Call Telegram notification function
    const telegramResponse = await fetch(`${supabaseUrl}/functions/v1/send-telegram-notification`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(telegramData)
    })

    if (!telegramResponse.ok) {
      const errorText = await telegramResponse.text()
      console.error('❌ Telegram notification failed:', errorText)
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Failed to send Telegram notification',
          details: errorText,
          order_number: order.order_number,
          customer_name: customer.name
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const telegramResult = await telegramResponse.json()
    console.log('✅ Telegram notification sent:', telegramResult)

    // Create notification record in database
    const { error: notificationError } = await supabase
      .from('order_notifications')
      .insert({
        order_id: order_id,
        customer_id: order.customer_id,
        type: 'status_change',
        title: getStatusTitle(new_status, telegramUser.language || 'uzbek'),
        message: getStatusMessage(new_status, order.order_number, telegramUser.language || 'uzbek'),
        is_sent: true,
        is_read: false,
        push_sent: false,
        push_delivered: false,
        push_failed: false,
        telegram_sent: true,
        telegram_message_id: telegramResult.telegram_message_id,
        admin_user_id: admin_user_id
      })

    if (notificationError) {
      console.error('❌ Failed to create notification record:', notificationError)
    } else {
      console.log('✅ Notification record created')
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Telegram notification sent successfully',
        order_number: order.order_number,
        customer_name: customer.name,
        telegram_message_id: telegramResult.telegram_message_id,
        chat_id: telegramUser.chat_id
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('❌ Error in admin-trigger-telegram function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

function getStatusTitle(status: string, language: string = 'uzbek'): string {
  const titles = {
    uzbek: {
      'pending': 'Buyurtma qabul qilindi',
      'confirmed': 'Buyurtma tasdiqlandi',
      'processing': 'Buyurtma tayyorlanmoqda',
      'ready': 'Buyurtma tayyor',
      'shipped': 'Buyurtma yuborildi',
      'delivered': 'Buyurtma yetkazib berildi',
      'cancelled': 'Buyurtma bekor qilindi'
    },
    russian: {
      'pending': 'Заказ принят',
      'confirmed': 'Заказ подтвержден',
      'processing': 'Заказ готовится',
      'ready': 'Заказ готов',
      'shipped': 'Заказ отправлен',
      'delivered': 'Заказ доставлен',
      'cancelled': 'Заказ отменен'
    },
    english: {
      'pending': 'Order received',
      'confirmed': 'Order confirmed',
      'processing': 'Order processing',
      'ready': 'Order ready',
      'shipped': 'Order shipped',
      'delivered': 'Order delivered',
      'cancelled': 'Order cancelled'
    }
  };

  return titles[language as keyof typeof titles]?.[status as keyof typeof titles.uzbek] || 
         titles.uzbek[status as keyof typeof titles.uzbek] || 
         'Buyurtma holati o\'zgartirildi';
}

function getStatusMessage(status: string, orderNumber: string, language: string = 'uzbek'): string {
  const messages = {
    uzbek: {
      'pending': `Hurmatli mijoz, ${orderNumber} raqamli buyurtmangiz qabul qilindi va tez orada ko'rib chiqiladi.`,
      'confirmed': `Hurmatli mijoz, ${orderNumber} raqamli buyurtmangiz tasdiqlandi va tayyorlash jarayoni boshlandi.`,
      'processing': `Hurmatli mijoz, ${orderNumber} raqamli buyurtmangiz hozir tayyorlanmoqda. Tez orada tayyor bo'ladi.`,
      'ready': `Hurmatli mijoz, ${orderNumber} raqamli buyurtmangiz tayyor! Yetkazib berish uchun tayyorlanmoqda.`,
      'shipped': `Hurmatli mijoz, ${orderNumber} raqamli buyurtmangiz yuborildi va yo'lda. Tez orada yetkazib beriladi.`,
      'delivered': `Hurmatli mijoz, ${orderNumber} raqamli buyurtmangiz muvaffaqiyatli yetkazib berildi! Rahmat!`,
      'cancelled': `Hurmatli mijoz, ${orderNumber} raqamli buyurtmangiz texnik sabablarga ko'ra bekor qilindi.`
    },
    russian: {
      'pending': `Уважаемый клиент, ваш заказ ${orderNumber} принят и будет рассмотрен в ближайшее время.`,
      'confirmed': `Уважаемый клиент, ваш заказ ${orderNumber} подтвержден и начался процесс подготовки.`,
      'processing': `Уважаемый клиент, ваш заказ ${orderNumber} сейчас готовится. Скоро будет готов.`,
      'ready': `Уважаемый клиент, ваш заказ ${orderNumber} готов! Готовится к доставке.`,
      'shipped': `Уважаемый клиент, ваш заказ ${orderNumber} отправлен и в пути. Скоро будет доставлен.`,
      'delivered': `Уважаемый клиент, ваш заказ ${orderNumber} успешно доставлен! Спасибо!`,
      'cancelled': `Уважаемый клиент, ваш заказ ${orderNumber} отменен по техническим причинам.`
    },
    english: {
      'pending': `Dear customer, your order ${orderNumber} has been received and will be reviewed shortly.`,
      'confirmed': `Dear customer, your order ${orderNumber} has been confirmed and preparation has begun.`,
      'processing': `Dear customer, your order ${orderNumber} is currently being prepared. It will be ready soon.`,
      'ready': `Dear customer, your order ${orderNumber} is ready! Preparing for delivery.`,
      'shipped': `Dear customer, your order ${orderNumber} has been shipped and is on its way. It will be delivered soon.`,
      'delivered': `Dear customer, your order ${orderNumber} has been successfully delivered! Thank you!`,
      'cancelled': `Dear customer, your order ${orderNumber} has been cancelled due to technical reasons.`
    }
  };

  return messages[language as keyof typeof messages]?.[status as keyof typeof messages.uzbek] || 
         messages.uzbek[status as keyof typeof messages.uzbek] || 
         `Hurmatli mijoz, ${orderNumber} raqamli buyurtmangizning holati o'zgartirildi.`;
}
