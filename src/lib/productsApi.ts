// Optimized Products API for Eurodoor Customer Panel
import { supabase, Product, createPaginatedQuery } from './supabase';

// Cache for products
let productsCache: Product[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const productsApi = {
  // Optimized: Barcha faol mahsulotlarni olish with caching and retry logic
  async getAllProducts(forceRefresh: boolean = false, retryCount: number = 0): Promise<Product[]> {
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 1000; // 1 second
    
    try {
      console.log('🔄 Fetching products...', forceRefresh ? '(force refresh)' : '', retryCount > 0 ? `(retry ${retryCount})` : '');
      
      // Check cache first
      if (!forceRefresh && productsCache && (Date.now() - cacheTimestamp) < CACHE_DURATION) {
        console.log('✅ Using cached products:', productsCache.length);
        return productsCache;
      }
      
      // Optimized query with shorter timeout
      const queryPromise = supabase
        .from('products')
        .select('id, name, material, security, dimensions, price, stock, currency, image, image_url, category, is_active')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(50); // Limit results for faster query
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database query timeout')), 8000)
      );
      
      const { data, error } = await Promise.race([queryPromise, timeoutPromise]);
      
      if (error) {
        console.error('❌ Supabase error fetching products:', error);
        
        // Retry logic for network errors
        if (retryCount < MAX_RETRIES && (
          error.message.includes('network') || 
          error.message.includes('timeout') ||
          error.message.includes('fetch')
        )) {
          console.log(`🔄 Retrying in ${RETRY_DELAY}ms... (${retryCount + 1}/${MAX_RETRIES})`);
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
          return this.getAllProducts(forceRefresh, retryCount + 1);
        }
        
        throw new Error(`Supabase error: ${error.message}`);
      }
      
      // Update cache
      productsCache = data || [];
      cacheTimestamp = Date.now();
      
      console.log('✅ Products fetched:', productsCache.length);
      return productsCache;
    } catch (error) {
      console.error('❌ Error fetching products:', error);
      
      // Retry logic for general errors
      if (retryCount < MAX_RETRIES && error instanceof Error && (
        error.message.includes('timeout') ||
        error.message.includes('network') ||
        error.message.includes('fetch')
      )) {
        console.log(`🔄 Retrying in ${RETRY_DELAY}ms... (${retryCount + 1}/${MAX_RETRIES})`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return this.getAllProducts(forceRefresh, retryCount + 1);
      }
      
      // Fallback to cached data if available
      if (productsCache && productsCache.length > 0) {
        console.log('⚠️ Using cached data due to error');
        return productsCache;
      }
      
      throw error;
    }
  },

  // Optimized: Paginated products
  async getProductsPaginated(page: number = 0, limit: number = 20): Promise<{ data: Product[], count: number }> {
    try {
      const { data, error, count } = await createPaginatedQuery('products', page, limit)
        .select('id, name, name_ru, name_en, description, material, material_ru, material_en, security, security_ru, security_en, dimensions, dimensions_ru, dimensions_en, lock_stages, lock_stages_ru, lock_stages_en, thickness, price, stock, currency, image, image_url, category, is_active, created_at, updated_at', { count: 'exact' })
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ Supabase error fetching paginated products:', error);
        throw new Error(`Supabase error: ${error.message}`);
      }
      
      return { data: data || [], count: count || 0 };
    } catch (error) {
      console.error('❌ Error fetching paginated products:', error);
      throw error;
    }
  },

  // Optimized: ID bo'yicha mahsulot olish
  async getProductById(id: string): Promise<Product | null> {
    try {
      // Check cache first
      if (productsCache) {
        const cachedProduct = productsCache.find(p => p.id === id);
        if (cachedProduct) {
          console.log('✅ Using cached product:', id);
          return cachedProduct;
        }
      }
      
      const { data, error } = await supabase
        .from('products')
        .select('id, name, name_ru, name_en, description, material, material_ru, material_en, security, security_ru, security_en, dimensions, dimensions_ru, dimensions_en, lock_stages, lock_stages_ru, lock_stages_en, thickness, price, stock, currency, image, image_url, category, is_active, created_at, updated_at')
        .eq('id', id)
        .eq('is_active', true)
        .single();
      
      if (error) {
        console.error('❌ Supabase error fetching product:', error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('❌ Error fetching product:', error);
      return null;
    }
  },

  // Kategoriya bo'yicha mahsulotlarni olish
  async getProductsByCategory(category: string): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', category)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ Supabase error fetching products by category:', error);
        throw new Error(`Supabase error: ${error.message}`);
      }
      
      return data || [];
    } catch (error) {
      console.error('❌ Error fetching products by category:', error);
      throw error;
    }
  },

  // Material bo'yicha mahsulotlarni olish
  async getProductsByMaterial(material: string): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .ilike('material', `%${material}%`)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ Supabase error fetching products by material:', error);
        throw new Error(`Supabase error: ${error.message}`);
      }
      
      return data || [];
    } catch (error) {
      console.error('❌ Error fetching products by material:', error);
      throw error;
    }
  },

  // Qidiruv bo'yicha mahsulotlarni olish
  async searchProducts(query: string): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%,material.ilike.%${query}%`)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ Supabase error searching products:', error);
        throw new Error(`Supabase error: ${error.message}`);
      }
      
      return data || [];
    } catch (error) {
      console.error('❌ Error searching products:', error);
      throw error;
    }
  },

  // Real-time subscription uchun
  subscribeToProducts(callback: (payload: any) => void) {
    return supabase
      .channel('products')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'products' },
        callback
      )
      .subscribe();
  }
};