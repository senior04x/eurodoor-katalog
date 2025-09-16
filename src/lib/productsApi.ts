// Optimized Products API for Eurodoor Customer Panel
import { supabase, Product, createPaginatedQuery } from './supabase';

// Cache for products
let productsCache: Product[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Mock data for fallback
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Model 020',
    material: 'Metal',
    security: 'High',
    dimensions: '2300 x 960',
    price: 1500000,
    stock: 5,
    currency: 'UZS',
    image_url: 'https://picsum.photos/400/300?random=1',
    category: 'doors',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Model 710',
    material: 'MDF',
    security: 'Medium',
    dimensions: '2050 x 860',
    price: 1200000,
    stock: 3,
    currency: 'UZS',
    image_url: 'https://picsum.photos/400/300?random=2',
    category: 'doors',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Model 601',
    material: 'Wood',
    security: 'High',
    dimensions: '2050 x 960',
    price: 1800000,
    stock: 2,
    currency: 'UZS',
    image_url: 'https://picsum.photos/400/300?random=3',
    category: 'doors',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const productsApi = {
  // Optimized: Barcha faol mahsulotlarni olish with fallback to mock data
  async getAllProducts(forceRefresh: boolean = false): Promise<Product[]> {
    try {
      // Check cache first
      if (!forceRefresh && productsCache && (Date.now() - cacheTimestamp) < CACHE_DURATION) {
        return productsCache;
      }
      
      // Try to fetch from database with short timeout
      const queryPromise = supabase
        .from('products')
        .select('id, name, material, security, dimensions, price, stock, currency, image, image_url, category, is_active')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(20);
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database timeout')), 3000)
      );
      
      const { data, error } = await Promise.race([queryPromise, timeoutPromise]);
      
      if (error || !data) {
        // Use mock data as fallback
        productsCache = mockProducts;
        cacheTimestamp = Date.now();
        return mockProducts;
      }
      
      // Update cache with real data
      productsCache = data || [];
      cacheTimestamp = Date.now();
      return productsCache;
      
    } catch (error) {
      // Always fallback to mock data
      productsCache = mockProducts;
      cacheTimestamp = Date.now();
      return mockProducts;
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

  // Optimized: ID bo'yicha mahsulot olish with fallback
  async getProductById(id: string): Promise<Product | null> {
    try {
      // Check cache first
      if (productsCache) {
        const cachedProduct = productsCache.find(p => p.id === id);
        if (cachedProduct) {
          return cachedProduct;
        }
      }
      
      // Try database with short timeout
      const queryPromise = supabase
        .from('products')
        .select('id, name, material, security, dimensions, price, stock, currency, image, image_url, category, is_active')
        .eq('id', id)
        .eq('is_active', true)
        .single();
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database timeout')), 3000)
      );
      
      const { data, error } = await Promise.race([queryPromise, timeoutPromise]);
      
      if (error || !data) {
        // Fallback to mock data
        return mockProducts.find(p => p.id === id) || null;
      }
      
      return data;
    } catch (error) {
      // Fallback to mock data
      return mockProducts.find(p => p.id === id) || null;
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