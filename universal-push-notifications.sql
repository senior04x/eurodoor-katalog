-- Universal Push Notifications Setup for Eurodoor
-- Run this SQL in your Supabase SQL editor

-- Create push_subscriptions table
create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  subscription jsonb not null,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.push_subscriptions enable row level security;

-- Create policy for users to manage their own subscriptions
create policy if not exists "own subs"
on public.push_subscriptions for select
to authenticated
using (auth.uid() = user_id);

create policy if not exists "insert own subs"
on public.push_subscriptions for insert
to authenticated
with check (auth.uid() = user_id);

create policy if not exists "update own subs"
on public.push_subscriptions for update
to authenticated
using (auth.uid() = user_id);

create policy if not exists "delete own subs"
on public.push_subscriptions for delete
to authenticated
using (auth.uid() = user_id);

-- Enable pg_net extension for HTTP requests
create extension if not exists pg_net;

-- Create function to send push notifications
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
        'user_id', new.user_id,
        'title', notif_title,
        'body', notif_body,
        'tag', 'order-' || new.order_number
      )::text
    );
  end if;
  return new;
end $$;

-- Create trigger for order status changes
drop trigger if exists trg_orders_push on public.orders;
create trigger trg_orders_push
after update on public.orders
for each row execute function public.notify_order_update();