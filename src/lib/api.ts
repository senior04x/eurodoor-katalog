// API utilities for push notifications
import { supabase } from './supabase';

export async function savePushSubscription(userId: string, subscription: any) {
  try {
    console.log('💾 Saving push subscription for user:', userId);
    
    const { data, error } = await supabase
      .from('push_subscriptions')
      .upsert({
        user_id: userId,
        subscription: subscription,
        created_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (error) {
      console.error('❌ Failed to save subscription:', error);
      throw error;
    }
    
    console.log('✅ Subscription saved successfully:', data);
    return data;
  } catch (error) {
    console.error('❌ Error saving subscription:', error);
    throw error;
  }
}

export async function testPushNotification() {
  try {
    console.log('🧪 Testing push notification...');
    
    const { data, error } = await supabase.functions.invoke('test-push-notification', {
      body: {}
    });

    if (error) {
      console.error('❌ Test push notification failed:', error);
      throw error;
    }
    
    console.log('✅ Test push notification sent:', data);
    return data;
  } catch (error) {
    console.error('❌ Error testing push notification:', error);
    throw error;
  }
}
