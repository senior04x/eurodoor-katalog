-- Fix Push Notification Trigger for Eurodoor
-- This will ensure notifications are sent when admin changes order status

-- First, ensure push_subscriptions table exists
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  subscription jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies and recreate them
DROP POLICY IF EXISTS "own subs" ON public.push_subscriptions;
DROP POLICY IF EXISTS "insert own subs" ON public.push_subscriptions;
DROP POLICY IF EXISTS "update own subs" ON public.push_subscriptions;
DROP POLICY IF EXISTS "delete own subs" ON public.push_subscriptions;

-- Create policies for push subscriptions
CREATE POLICY "own subs" ON public.push_subscriptions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "insert own subs" ON public.push_subscriptions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update own subs" ON public.push_subscriptions FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "delete own subs" ON public.push_subscriptions FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS trigger_send_order_push_notification ON orders;
DROP FUNCTION IF EXISTS send_order_push_notification();

-- Create the function to send push notifications
CREATE OR REPLACE FUNCTION send_order_push_notification()
RETURNS TRIGGER AS $$
DECLARE
  customer_user_id UUID;
  notification_title TEXT;
  notification_body TEXT;
  supabase_url TEXT;
  supabase_anon_key TEXT;
BEGIN
  -- Get Supabase configuration
  supabase_url := 'https://oathybjrmhtubbemjeyy.supabase.co';
  supabase_anon_key := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hdGh5YmpybWh0dWJiZW1qZXl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQxNzQ4NzQsImV4cCI6MjA0OTc1MDg3NH0.8QZqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJq';
  
  -- Get customer user_id from the order
  SELECT user_id INTO customer_user_id 
  FROM customers 
  WHERE id = NEW.customer_id;
  
  -- Only send notification if customer has a user_id and status changed
  IF customer_user_id IS NOT NULL AND OLD.status IS DISTINCT FROM NEW.status THEN
    -- Determine notification content based on new status
    CASE NEW.status
      WHEN 'pending' THEN
        notification_title := '📝 Buyurtma Qabul Qilindi';
        notification_body := 'Sizning ' || NEW.order_number || ' raqamli buyurtmangiz qabul qilindi.';
      WHEN 'confirmed' THEN
        notification_title := '✅ Buyurtma Tasdiqlandi';
        notification_body := 'Sizning ' || NEW.order_number || ' raqamli buyurtmangiz tasdiqlandi.';
      WHEN 'processing' THEN
        notification_title := '🔄 Buyurtma Tayyorlanmoqda';
        notification_body := 'Sizning ' || NEW.order_number || ' raqamli buyurtmangiz tayyorlanmoqda.';
      WHEN 'ready' THEN
        notification_title := '📦 Buyurtma Tayyor';
        notification_body := 'Sizning ' || NEW.order_number || ' raqamli buyurtmangiz tayyor!';
      WHEN 'delivered' THEN
        notification_title := '🚚 Buyurtma Yetkazildi';
        notification_body := 'Sizning ' || NEW.order_number || ' raqamli buyurtmangiz yetkazildi.';
      WHEN 'cancelled' THEN
        notification_title := '❌ Buyurtma Bekor Qilindi';
        notification_body := 'Sizning ' || NEW.order_number || ' raqamli buyurtmangiz bekor qilindi.';
      ELSE
        notification_title := '🔔 Buyurtma Holati O''zgartirildi';
        notification_body := 'Sizning ' || NEW.order_number || ' raqamli buyurtmangiz holati o''zgartirildi.';
    END CASE;
    
    -- Call the Edge Function to send push notification
    PERFORM net.http_post(
      url := supabase_url || '/functions/v1/send-push-notification',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || supabase_anon_key
      ),
      body := jsonb_build_object(
        'user_id', customer_user_id,
        'title', notification_title,
        'body', notification_body,
        'tag', 'order-' || NEW.order_number,
        'icon', '/icons/icon-192.png',
        'data', jsonb_build_object(
          'order_id', NEW.id,
          'order_number', NEW.order_number,
          'status', NEW.status,
          'type', 'order_status_change',
          'url', '/orders'
        )
      )
    );
    
    -- Log the notification attempt
    RAISE LOG 'Push notification sent for order % to user %', NEW.order_number, customer_user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on orders table
CREATE TRIGGER trigger_send_order_push_notification
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION send_order_push_notification();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION send_order_push_notification() TO authenticated;
GRANT EXECUTE ON FUNCTION send_order_push_notification() TO anon;

-- Test the setup
SELECT 'Push notification trigger setup completed successfully!' as status;
