import { createClient } from '@supabase/supabase-js'

Deno.serve(async (req) => {
  const supa = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    {
      global: {
        headers: { Authorization: req.headers.get('Authorization')! },
      },
    }
  );

  const { data: { user }, error: userError } = await supa.auth.getUser();
  
  if (userError || !user) {
    return new Response(JSON.stringify({ error: 'User not authenticated' }), { 
      status: 401, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }

  const { data, error } = await supa.functions.invoke('send-push-notification', {
    body: {
      user_id: user.id,
      title: '🧪 Test Notification',
      body: 'Bu test push notification. Agar ko\'rsangiz, push notification ishlayapti!',
      tag: 'test-' + Date.now()
    }
  });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }

  return new Response(JSON.stringify({ 
    message: 'Test push notification sent successfully',
    data
  }), { 
    status: 200, 
    headers: { 'Content-Type': 'application/json' } 
  });
});
