// Orders API for Eurodoor Customer Panel
import { supabase, Order, OrderItem } from './supabase';

export const ordersApi = {
  // Yangi buyurtma yaratish
  async createOrder(orderData: {
    customer_name: string;
    customer_phone: string;
    customer_email?: string;
    delivery_address: string;
    notes?: string;
    products: any[];
    total_amount: number;
  }): Promise<Order | null> {
    try {
      // Buyurtma raqamini yaratish
      const orderNumber = `EURO-${Date.now().toString().slice(-6)}`;
      
      const order = {
        order_number: orderNumber,
        customer_name: orderData.customer_name,
        customer_phone: orderData.customer_phone,
        customer_email: orderData.customer_email,
        delivery_address: orderData.delivery_address,
        notes: orderData.notes,
        total_amount: orderData.total_amount,
        status: 'pending' as const
      };

      const { data, error } = await supabase
        .from('orders')
        .insert([order])
        .select()
        .single();
      
      if (error) {
        console.error('❌ Supabase error creating order:', error);
        throw new Error(`Supabase error: ${error.message}`);
      }
      
      // Order items yaratish (agar order_items jadvali mavjud bo'lsa)
      if (orderData.products && orderData.products.length > 0) {
        try {
          const orderItems = orderData.products.map(product => ({
            order_id: data.id,
            product_name: product.name || product.model_name,
            quantity: product.quantity || 1,
            unit_price: product.price || 0,
            total_price: (product.price || 0) * (product.quantity || 1),
            custom_dimensions: product.dimensions,
            color: product.color,
            material: product.material,
            notes: product.notes
          }));

          const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItems);

          if (itemsError) {
            console.error('❌ Error creating order items:', itemsError);
            // Order items yaratishda xatolik bo'lsa ham, order yaratilgan bo'ladi
          }
        } catch (error) {
          console.error('❌ Error creating order items:', error);
          // Order items yaratishda xatolik bo'lsa ham, order yaratilgan bo'ladi
        }
      }
      
      return data;
    } catch (error) {
      console.error('❌ Error creating order:', error);
      throw error;
    }
  },

  // Buyurtma holatini olish
  async getOrderByNumber(orderNumber: string): Promise<Order | null> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('order_number', orderNumber)
        .single();
      
      if (error) {
        console.error('❌ Supabase error fetching order:', error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('❌ Error fetching order:', error);
      return null;
    }
  },

  // Mijoz buyurtmalarini olish
  async getOrdersByCustomer(customerPhone: string): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_phone', customerPhone)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ Supabase error fetching customer orders:', error);
        throw new Error(`Supabase error: ${error.message}`);
      }
      
      return data || [];
    } catch (error) {
      console.error('❌ Error fetching customer orders:', error);
      throw error;
    }
  },

  // Barcha buyurtmalarni olish (admin uchun)
  async getAllOrders(): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ Supabase error fetching all orders:', error);
        throw new Error(`Supabase error: ${error.message}`);
      }
      
      return data || [];
    } catch (error) {
      console.error('❌ Error fetching all orders:', error);
      throw error;
    }
  },

  // Buyurtma holatini yangilash
  async updateOrderStatus(orderId: string, status: string): Promise<boolean> {
    try {
      // Avval eski status'ni olish
      const { data: oldOrder } = await supabase
        .from('orders')
        .select('status, customer_phone, order_number, customer_name, total_amount, delivery_address')
        .eq('id', orderId)
        .single();

      // Status'ni yangilash
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);
      
      if (error) {
        console.error('❌ Supabase error updating order status:', error);
        throw new Error(`Supabase error: ${error.message}`);
      }

      // Telegram notification yuborish (agar status o'zgargan bo'lsa)
      if (oldOrder && oldOrder.status !== status) {
        try {
          const { adminTelegramService } = await import('./adminTelegramService');
          await adminTelegramService.triggerOrderStatusNotification({
            order_id: orderId,
            status: status,
            customer_id: orderId,
            order_number: oldOrder.order_number,
            customer_name: oldOrder.customer_name,
            customer_phone: oldOrder.customer_phone,
            total_amount: oldOrder.total_amount,
            delivery_address: oldOrder.delivery_address,
            products: [] // Mahsulotlar alohida olinadi
          });
          console.log('✅ Telegram notification sent for order status change');
        } catch (telegramError) {
          console.error('❌ Telegram notification error:', telegramError);
          // Telegram xatosi buyurtma yangilanishini to'xtatmaydi
        }
      }
      
      return true;
    } catch (error) {
      console.error('❌ Error updating order status:', error);
      throw error;
    }
  },

  // Buyurtma elementlarini olish
  async getOrderItems(orderId: string): Promise<OrderItem[]> {
    try {
      const { data, error } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('❌ Supabase error fetching order items:', error);
        throw new Error(`Supabase error: ${error.message}`);
      }
      
      return data || [];
    } catch (error) {
      console.error('❌ Error fetching order items:', error);
      throw error;
    }
  },

  // Real-time subscription uchun
  subscribeToOrders(callback: (payload: any) => void) {
    return supabase
      .channel('orders')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'orders' },
        callback
      )
      .subscribe();
  }
};
