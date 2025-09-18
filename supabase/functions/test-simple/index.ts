import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🧪 Test function started')
    
    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN')
    console.log('🔍 Bot token exists:', !!botToken)
    console.log('🔍 Bot token length:', botToken ? botToken.length : 0)
    
    const data = await req.json()
    console.log('📤 Received data:', data)
    
    if (!botToken) {
      return new Response(
        JSON.stringify({ error: 'TELEGRAM_BOT_TOKEN not found' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { chat_id, message } = data
    
    console.log('📤 Sending to chat_id:', chat_id)
    console.log('📤 Message:', message)

    const telegramResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chat_id,
        text: message || '🧪 Test message from Supabase!',
        parse_mode: 'Markdown'
      }),
    })

    const result = await telegramResponse.json()
    console.log('📥 Telegram API response:', result)

    if (!telegramResponse.ok) {
      return new Response(
        JSON.stringify({ 
          error: 'Telegram API error',
          details: result,
          status: telegramResponse.status
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        result: result,
        chat_id: chat_id
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ Test function error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal error', 
        details: error.message,
        stack: error.stack
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
