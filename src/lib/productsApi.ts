// Optimized Products API for Eurodoor Customer Panel
import { supabase, Product, createPaginatedQuery } from './supabase';

// Cache for products
let productsCache: Product[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const productsApi = {
  // Real database connection - barcha faol mahsulotlarni olish
  async getAllProducts(forceRefresh: boolean = false): Promise<Product[]> {
    try {
      // Check cache first
      if (!forceRefresh && productsCache && (Date.now() - cacheTimestamp) < CACHE_DURATION) {
        return productsCache;
      }
      
      // Real database query
      const { data, error } = await supabase
        .from('products')
        .select('id, name, material, security, dimensions, price, stock, currency, image, image_url, category, is_active')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }
      
      // Update cache with real data
      productsCache = data || [];
      cacheTimestamp = Date.now();
      return productsCache;
      
    } catch (error) {
      console.error('Database connection error:', error);
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
        .select('id, name, material, security, dimensions, price, stock, currency, image, image_url, category, is_active')
        .eq('id', id)
        .eq('is_active', true)
        .single();
      
      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }
      
      return data;
    } catch (error) {
      console.error('Database connection error:', error);
      throw error;
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