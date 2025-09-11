import { createClient } from '@supabase/supabase-js'

// Supabase konfiguratsiyasi
// Real ma'lumotlar - Supabase dashboard dan oling
const supabaseUrl = 'https://oathybjrmhtubbemjeyy.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hdGh5YmpybWh0dWJiZW1qZXl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0MjMzOTIsImV4cCI6MjA3Mjk5OTM5Mn0.GlKHHQj1nhDGwF78Fr7zlKytRxEwXwlyRTlgEX6d4io'

// Faqat Supabase - localStorage fallback yo'q

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
      console.log('🔄 Loading orders from Supabase backend...')
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('❌ Supabase error fetching orders:', error)
        throw new Error(`Supabase error: ${error.message}`)
      }
      
      console.log('✅ Supabase orders fetched:', data?.length || 0)
      return data || []
    } catch (error) {
      console.error('❌ Supabase connection error:', error)
      throw new Error(`Connection error: ${error}`)
    }
  },

  // Yangi zakaz qo'shish
  async createOrder(order: Omit<Order, 'created_at' | 'updated_at'>): Promise<Order | null> {
    try {
      console.log('🔄 Saving order to Supabase backend...')
      const { data, error } = await supabase
        .from('orders')
        .insert([order])
        .select()
        .single()
      
      if (error) {
        console.error('❌ Supabase error creating order:', error)
        throw new Error(`Supabase error: ${error.message}`)
      }
      
      console.log('✅ Order saved to Supabase backend:', data)
      return data
    } catch (error) {
      console.error('❌ Supabase connection error:', error)
      throw new Error(`Connection error: ${error}`)
    }
  },

  // Zakazni o'chirish
  async deleteOrder(orderId: string): Promise<boolean> {
    try {
      console.log('🔄 Deleting order from Supabase backend...')
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId)
      
      if (error) {
        console.error('❌ Supabase error deleting order:', error)
        throw new Error(`Supabase error: ${error.message}`)
      }
      
      console.log('✅ Order deleted from Supabase backend:', orderId)
      return true
    } catch (error) {
      console.error('❌ Supabase connection error:', error)
      throw new Error(`Connection error: ${error}`)
    }
  },

  // Zakaz holatini yangilash
  async updateOrderStatus(orderId: string, status: string): Promise<boolean> {
    try {
      console.log('🔄 Updating order status in Supabase backend...')
      const { error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', orderId)
      
      if (error) {
        console.error('❌ Supabase error updating order status:', error)
        throw new Error(`Supabase error: ${error.message}`)
      }
      
      console.log('✅ Order status updated in Supabase backend:', orderId, status)
      return true
    } catch (error) {
      console.error('❌ Supabase connection error:', error)
      throw new Error(`Connection error: ${error}`)
    }
  }
}
