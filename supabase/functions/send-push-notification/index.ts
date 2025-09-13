import { createClient } from '@supabase/supabase-js'
import webpush from 'web-push'

webpush.setVapidDetails(
  'mailto:support@eurodoor.uz',
  Deno.env.get('VAPID_PUBLIC_KEY')!,
  Deno.env.get('VAPID_PRIVATE_KEY')!
);

Deno.serve(async (req) => {
  const { user_id, title, body, tag, icon } = await req.json();
  const supa = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );
  const { data: subs } = await supa
    .from('push_subscriptions')
    .select('id, subscription')
    .eq('user_id', user_id);

  const payload = JSON.stringify({ 
    title, 
    body, 
    tag, 
    icon: icon || '/favicon.ico', 
    url: '/en/orders.html' 
  });
  const results: any[] = [];

  for (const row of subs ?? []) {
    try {
      await webpush.sendNotification(row.subscription as any, payload);
      results.push({ id: row.id, ok: true });
    } catch (e: any) {
      const code = e?.statusCode ?? e?.status;
      if (code === 404 || code === 410) {
        await supa.from('push_subscriptions').delete().eq('id', row.id);
      }
      results.push({ id: row.id, ok: false, code });
    }
  }
  return new Response(JSON.stringify({ results }), { headers: { 'Content-Type':'application/json' }});
});
