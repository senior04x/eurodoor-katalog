-- Create function to send push notification when order status changes
CREATE OR REPLACE FUNCTION send_order_push_notification()
RETURNS TRIGGER AS $$
DECLARE
  customer_user_id UUID;
  notification_title TEXT;
  notification_body TEXT;
BEGIN
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
      url := current_setting('app.supabase_url') || '/functions/v1/send-push-notification',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.supabase_anon_key')
      ),
      body := jsonb_build_object(
        'user_id', customer_user_id,
        'title', notification_title,
        'body', notification_body,
        'data', jsonb_build_object(
          'order_id', NEW.id,
          'order_number', NEW.order_number,
          'status', NEW.status,
          'type', 'order_status_change'
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
DROP TRIGGER IF EXISTS trigger_send_order_push_notification ON orders;
CREATE TRIGGER trigger_send_order_push_notification
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION send_order_push_notification();

-- Alternative simpler approach using pg_cron (if available)
-- This would be more reliable than the trigger approach
-- CREATE OR REPLACE FUNCTION check_and_send_order_notifications()
-- RETURNS void AS $$
-- BEGIN
--   -- This function would be called periodically by pg_cron
--   -- to check for order status changes and send notifications
-- END;
-- $$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION send_order_push_notification() TO authenticated;
GRANT EXECUTE ON FUNCTION send_order_push_notification() TO anon;
