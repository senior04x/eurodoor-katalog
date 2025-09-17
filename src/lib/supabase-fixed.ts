import { createClient } from '@supabase/supabase-js'

// Supabase configuration for Eurodoor Customer Panel
const supabaseUrl = 'https://oathybjrmhtubbemjeyy.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hdGh5YmpybWh0dWJiZW1qZXl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0MjMzOTIsImV4cCI6MjA3Mjk5OTM5Mn0.GlKHHQj1nhDGwF78Fr7zlKytRxEwXwlyRTlgEX6d4io'

// Create optimized Supabase client with performance improvements
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Disable for faster loading
    flowType: 'pkce'
  },
  realtime: {
    params: {
      eventsPerSecond: 2, // Further reduced for better performance
      heartbeatIntervalMs: 30000, // 30 seconds
      reconnectAfterMs: [1000, 2000, 5000, 10000] // Progressive reconnection
    }
  },
  global: {
    headers: {
      'X-Client-Info': 'eurodoor-customer-panel',
      'Cache-Control': 'max-age=600' // 10 minutes cache
    }
  },
  db: {
    schema: 'public'
  }
})

// Connection pooling and retry logic
// let connectionRetries = 0
// const MAX_RETRIES = 3

// Database types
export interface Product {
  id: string;
  name: string;
  name_ru?: string;
  name_en?: string;
  description?: string;
  description_ru?: string;
  description_en?: string;
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
  stock?: number; // Admin panel uchun qo'shildi
  slug?: string;
  meta_title?: string;
  meta_description?: string;
  view_count?: number;
  is_featured?: boolean;
  sort_order?: number;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  phone: string;
  name: string;
  email?: string;
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
  status: string;
  created_at: string;
  updated_at: string;
}

