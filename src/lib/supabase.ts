import { createClient } from '@supabase/supabase-js'

// Supabase konfiguratsiyasi
// Real ma'lumotlar - Supabase dashboard dan oling
const supabaseUrl = 'https://eurodoor-orders.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1cm9kb29yLW9yZGVycyIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzM3NDkyMDAwLCJleHAiOjIwNTMwNjgwMDB9.eurodoor-orders-real-key'

// Supabase client yaratish
export const supabase = createClient(supabaseUrl, supabaseKey)

// Debug uchun
console.log('Supabase URL:', supabaseUrl)
console.log('Supabase Key:', supabaseKey ? 'Key loaded' : 'No key')

// Orders table uchun type definition
export interface Order {
  id: string
  timestamp: string
  customer: {
    name: string
    phone: string
    message: string
  }
  product: {
    id?: string
    name: string
    material?: string
    security?: string
    dimensions?: string
    price?: string
  }
  status: string
  created_at?: string
  updated_at?: string
}

// Orders CRUD operations
export const ordersApi = {
  // Barcha zakazlarni olish
  async getAllOrders(): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('❌ Supabase error fetching orders:', error)
        // localStorage dan olish (fallback)
        const localOrders = JSON.parse(localStorage.getItem('orders') || '[]')
        console.log('📱 Using localStorage fallback:', localOrders.length, 'orders')
        return localOrders
      }
      
      console.log('✅ Supabase orders fetched:', data?.length || 0)
      return data || []
    } catch (error) {
      console.error('❌ Supabase connection error:', error)
      // localStorage dan olish (fallback)
      const localOrders = JSON.parse(localStorage.getItem('orders') || '[]')
      console.log('📱 Using localStorage fallback:', localOrders.length, 'orders')
      return localOrders
    }
  },

  // Yangi zakaz qo'shish
  async createOrder(order: Omit<Order, 'created_at' | 'updated_at'>): Promise<Order | null> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert([order])
        .select()
        .single()
      
      if (error) {
        console.error('❌ Supabase error creating order:', error)
        // localStorage ga saqlash (fallback)
        const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]')
        existingOrders.push(order)
        localStorage.setItem('orders', JSON.stringify(existingOrders))
        console.log('📱 Order saved to localStorage as fallback')
        return order as Order
      }
      
      console.log('✅ Order saved to Supabase:', data)
      return data
    } catch (error) {
      console.error('❌ Supabase connection error:', error)
      // localStorage ga saqlash (fallback)
      const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]')
      existingOrders.push(order)
      localStorage.setItem('orders', JSON.stringify(existingOrders))
      console.log('📱 Order saved to localStorage as fallback')
      return order as Order
    }
  },

  // Zakazni o'chirish
  async deleteOrder(orderId: string): Promise<boolean> {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', orderId)
    
    if (error) {
      console.error('Error deleting order:', error)
      return false
    }
    
    return true
  },

  // Zakaz holatini yangilash
  async updateOrderStatus(orderId: string, status: string): Promise<boolean> {
    const { error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId)
    
    if (error) {
      console.error('Error updating order status:', error)
      return false
    }
    
    return true
  }
}
