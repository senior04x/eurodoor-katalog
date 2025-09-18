// Supabase Edge Function for triggering Telegram notifications from admin panel
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TriggerNotificationData {
  order_id: string;
  new_status: string;
  old_status?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { order_id, new_status, old_status }: TriggerNotificationData = await req.json()

    if (!order_id || !new_status) {
      return new Response(
        JSON.stringify({ error: 'order_id and new_status are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
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

    console.log('📋 Order found:', order.order_number)

    // Get customer details
    const { data: customer, error: customerError } = await supabase
      .from('customer_registrations')
      .select('*')
      .eq('id', order.customer_id)
      .single()

    if (customerError || !customer) {
      console.error('❌ Customer not found:', customerError)
      return new Response(
        JSON.stringify({ error: 'Customer not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('👤 Customer found:', customer.name)

    // Send Telegram notification
    const telegramData = {
      chat_id: customer.phone?.replace(/\D/g, '') || '',
      order_number: order.order_number,
      customer_name: customer.name || 'Mijoz',
      customer_phone: customer.phone || '',
      status: new_status,
      title: getStatusTitle(new_status),
      message: getStatusMessage(new_status, order.order_number),
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
          error: 'Failed to send Telegram notification',
          details: errorText 
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
        title: getStatusTitle(new_status),
        message: getStatusMessage(new_status, order.order_number),
        is_sent: true,
        is_read: false,
        push_sent: false,
        push_delivered: false,
        push_failed: false,
        telegram_sent: true,
        telegram_message_id: telegramResult.telegram_message_id
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
        telegram_message_id: telegramResult.telegram_message_id
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('❌ Error in trigger-telegram-notification function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

function getStatusTitle(status: string): string {
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

function getStatusMessage(status: string, orderNumber: string): string {
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
