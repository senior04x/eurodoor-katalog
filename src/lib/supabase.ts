import { createClient } from '@supabase/supabase-js'

// Supabase konfiguratsiyasi
// Bu ma'lumotlarni Supabase dashboard dan olasiz
const supabaseUrl = 'https://your-project.supabase.co'
const supabaseKey = 'your-anon-key'

// Supabase client yaratish
export const supabase = createClient(supabaseUrl, supabaseKey)

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
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching orders:', error)
      return []
    }
    
    return data || []
  },

  // Yangi zakaz qo'shish
  async createOrder(order: Omit<Order, 'created_at' | 'updated_at'>): Promise<Order | null> {
    const { data, error } = await supabase
      .from('orders')
      .insert([order])
      .select()
      .single()
    
    if (error) {
      console.error('Error creating order:', error)
      return null
    }
    
    return data
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
