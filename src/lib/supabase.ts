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
  model_name: string; // Updated field name
  name?: string; // Legacy field name for backward compatibility
  price: number;
  image_url?: string;
  dimensions: string;
  material: string;
  security_class: string; // Updated field name
  security?: string; // Legacy field name for backward compatibility
  thickness: string; // New field
  lock_stages: string; // New field
  stock_quantity: number; // Updated field name
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  currency?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
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