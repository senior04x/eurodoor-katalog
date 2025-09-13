-- Universal Push Notifications Setup for Eurodoor
-- Works across all platforms: iOS PWA, Android Chrome, Desktop Chrome/Edge/Firefox/Safari

-- Table for push subscriptions
create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  subscription jsonb not null,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.push_subscriptions enable row level security;

-- RLS policy - users can only see their own subscriptions
create policy if not exists "own subs"
on public.push_subscriptions for select
using (auth.uid() = user_id);

-- RLS policy - users can insert their own subscriptions
create policy if not exists "insert own subs"
on public.push_subscriptions for insert
with check (auth.uid() = user_id);

-- RLS policy - users can update their own subscriptions
create policy if not exists "update own subs"
on public.push_subscriptions for update
using (auth.uid() = user_id);

-- RLS policy - users can delete their own subscriptions
create policy if not exists "delete own subs"
on public.push_subscriptions for delete
using (auth.uid() = user_id);

-- Enable pg_net extension for HTTP requests
create extension if not exists pg_net;

-- Function to send push notification when order status changes
create or replace function public.notify_order_update()
returns trigger language plpgsql as $$
declare
  notif_title text := 'Buyurtma yangilandi';
  notif_body  text := format('#%s holati: %s', new.order_number, new.status);
begin
  if new.status is distinct from old.status then
    perform net.http_post(
      url := 'https://<PROJECT_ID>.functions.supabase.co/send-push-notification',
      headers := jsonb_build_object('Content-Type','application/json'),
      body := jsonb_build_object(
        'user_id', new.customer_id,
        'title', notif_title,
        'body', notif_body,
        'tag', 'order-' || new.order_number
      )::text
    );
  end if;
  return new;
end $$;

-- Drop existing trigger if exists
drop trigger if exists trg_orders_push on public.orders;

-- Create trigger for order updates
create trigger trg_orders_push
after update on public.orders
for each row execute function public.notify_order_update();

-- Grant necessary permissions
grant execute on function public.notify_order_update() to authenticated;
grant execute on function public.notify_order_update() to anon;
