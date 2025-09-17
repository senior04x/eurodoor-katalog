// Optimized Products API for Eurodoor Customer Panel
import { supabase, Product } from './supabase';

// Enhanced cache for products with better performance
let productsCache: Product[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes cache
// const MAX_RETRIES = 3;
// const RETRY_DELAY = 1000; // 1 second

export const productsApi = {
  // Test database connection
  async testConnection() {
    try {
      console.log('🔍 Testing database connection...');
      
      // First, try to get all products without filters
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .limit(5);
      
      if (error) {
        console.error('❌ Database connection failed:', error);
        console.error('❌ Error details:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        return { success: false, error: error.message };
      }
      
      console.log('✅ Database connection successful');
      console.log('📦 Test data:', data);
      return { success: true, data };
    } catch (error) {
      console.error('❌ Database test error:', error);
      return { success: false, error: 'Connection failed' };
    }
  },

  // Simple database connection without retry logic for debugging
  async getAllProducts(forceRefresh: boolean = false): Promise<Product[]> {
    // Check cache first
    if (!forceRefresh && productsCache && (Date.now() - cacheTimestamp) < CACHE_DURATION) {
      return productsCache;
    }
    
    try {
      console.log('🔄 Loading products from database...');
      
      // Try without is_active filter first to see if that's the issue
      const { data, error } = await supabase
        .from('products')
        .select('id, model_name, price, image_url, dimensions, material, security_class, thickness, lock_stages, stock_quantity, description, is_active, created_at, updated_at')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) {
        console.error('❌ Supabase error:', error);
        console.error('❌ Error details:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        throw new Error(`Database error: ${error.message}`);
      }
      
      console.log('📦 Raw data from Supabase:', data);
      
      // Filter for active products
      const activeProducts = (data as Product[])?.filter(product => product.is_active !== false) || [];
      
      // Update cache with real data
      productsCache = activeProducts;
      cacheTimestamp = Date.now();
      console.log(`✅ Products loaded successfully: ${productsCache.length} items (${activeProducts.length} active)`);
      return productsCache;
      
    } catch (error) {
      console.error('❌ Error loading products:', error);
      throw error;
    }
  },


  // Real database: ID bo'yicha mahsulot olish
  async getProductById(id: string): Promise<Product | null> {
    try {
      // Check cache first
      if (productsCache) {
        const cachedProduct = productsCache.find(p => p.id === id);
        if (cachedProduct) {
          return cachedProduct;
        }
      }
      
      // Real database query
      const { data, error } = await supabase
        .from('products')
        .select('id, model_name, price, image_url, dimensions, material, security_class, thickness, lock_stages, stock_quantity, description, is_active, created_at, updated_at')
        .eq('id', id)
        .eq('is_active', true)
        .single();
      
      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }
      
      return data as Product;
    } catch (error) {
      console.error('Database connection error:', error);
      throw error;
    }
  },


  // Cache ni tozalash
  clearCache() {
    productsCache = null;
    cacheTimestamp = 0;
  }
};