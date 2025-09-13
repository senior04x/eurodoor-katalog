// Notification Test Service for Eurodoor
import { supabase } from './supabase';

export const testNotificationSystem = {
  // Test order status change notification
  async testOrderStatusChange(orderNumber: string, newStatus: string) {
    try {
      console.log(`🧪 Testing notification for order: ${orderNumber}, status: ${newStatus}`);
      
      // Update order status in database
      const { error: updateError } = await supabase
        .from('orders')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('order_number', orderNumber);

      if (updateError) {
        console.error('❌ Failed to update order status:', updateError);
        return { success: false, error: updateError.message };
      }

      console.log('✅ Order status updated successfully');
      return { success: true, message: 'Order status updated' };
    } catch (error) {
      console.error('❌ Test notification error:', error);
      return { success: false, error: 'Test failed' };
    }
  },

  // Check if order exists
  async checkOrderExists(orderNumber: string) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('order_number', orderNumber)
        .single();

      if (error) {
        console.error('❌ Order not found:', error);
        return { success: false, error: 'Order not found' };
      }

      console.log('✅ Order found:', data);
      return { success: true, data };
    } catch (error) {
      console.error('❌ Check order error:', error);
      return { success: false, error: 'Check failed' };
    }
  },

  // Get all orders for testing
  async getAllOrders() {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('❌ Failed to get orders:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Orders retrieved:', data);
      return { success: true, data };
    } catch (error) {
      console.error('❌ Get orders error:', error);
      return { success: false, error: 'Get orders failed' };
    }
  }
};

// Make it available globally for testing
if (typeof window !== 'undefined') {
  (window as any).testNotificationSystem = testNotificationSystem;
}
