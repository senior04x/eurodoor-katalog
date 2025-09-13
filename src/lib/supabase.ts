import { createClient } from '@supabase/supabase-js'

// Supabase configuration for Eurodoor Customer Panel
const supabaseUrl = 'https://oathybjrmhtubbemjeyy.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hdGh5YmpybWh0dWJiZW1qZXl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0MjMzOTIsImV4cCI6MjA3Mjk5OTM5Mn0.GlKHHQj1nhDGwF78Fr7zlKytRxEwXwlyRTlgEX6d4io'

// Create Supabase client with enhanced real-time configuration
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    },
    transport: 'websocket',
    timeout: 20000
  },
  global: {
    headers: {
      'X-Client-Info': 'eurodoor-customer-panel'
    }
  }
})

// Database types
export interface Product {
  id: string;
  name: string;
  name_ru?: string;
  name_en?: string;
  description?: string;
  material: string;
  material_ru?: string;
  material_en?: string;
  security: string;
  security_ru?: string;
  security_en?: string;
  dimensions: string;
  dimensions_ru?: string;
  dimensions_en?: string;
  lock_stages?: string;
  lock_stages_ru?: string;
  lock_stages_en?: string;
  thickness?: string;
  price: number;
  currency: string;
  image?: string;
  image_url?: string;
  category: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  phone: string;
  name: string;
  email?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id?: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  delivery_address: string;
  notes?: string;
  total_amount: number;
  products: any[];
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  delivery_date?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id?: string;
  product_name: string;
  quantity: number;
  price: number;
  custom_dimensions?: string;
  color?: string;
  notes?: string;
  created_at: string;
}