import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import webpush from 'https://esm.sh/web-push@3.6.5'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// VAPID keys - in production, these should be environment variables
const VAPID_PUBLIC_KEY = 'BEl62iUYgUivxIkv69yViEuiBIa40HI0lF5AwyKcnxXs4VWXK8dTInu3FIni8kHUpcMWvqyJ8sY8qa4r8UXwcm8'
const VAPID_PRIVATE_KEY = 'your-vapid-private-key-here' // Replace with actual private key
const VAPID_SUBJECT = 'mailto:admin@eurodoor.uz'

// Configure web-push
webpush.setVapidDetails(
  VAPID_SUBJECT,
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
)

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('📤 Push notification request received')
    
    const { user_id, title, body, data } = await req.json()
    console.log('📤 Push notification data:', { user_id, title, body, data })

    if (!user_id || !title || !body) {
      console.error('❌ Missing required fields')
      return new Response(
        JSON.stringify({ error: 'Missing required fields: user_id, title, body' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get user's push subscriptions
    const { data: subscriptions, error: fetchError } = await supabaseClient
      .from('push_subscriptions')
      .select('subscription')
      .eq('user_id', user_id)

    if (fetchError) {
      console.error('❌ Error fetching subscriptions:', fetchError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch subscriptions' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log('⚠️ No push subscriptions found for user:', user_id)
      return new Response(
        JSON.stringify({ message: 'No push subscriptions found' }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`📤 Found ${subscriptions.length} subscriptions for user ${user_id}`)

    // Send push notification to each subscription
    const results = []
    for (const sub of subscriptions) {
      try {
        const pushSubscription = sub.subscription
        console.log('📤 Sending to subscription:', pushSubscription)

        const payload = JSON.stringify({
          title,
          body,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: `eurodoor-${user_id}-${Date.now()}`,
          data: data || {},
          requireInteraction: true,
          vibrate: [200, 100, 200]
        })

        const result = await webpush.sendNotification(pushSubscription, payload)
        console.log('✅ Push sent successfully:', result)
        results.push({ success: true, subscription: pushSubscription.endpoint })
      } catch (error) {
        console.error('❌ Failed to send push notification:', error)
        results.push({ 
          success: false, 
          error: error.message,
          subscription: sub.subscription.endpoint 
        })
      }
    }

    console.log('📤 Push notification results:', results)

    return new Response(
      JSON.stringify({ 
        message: 'Push notifications sent',
        results,
        total: subscriptions.length,
        successful: results.filter(r => r.success).length
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('❌ Push notification error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
