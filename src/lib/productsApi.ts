// Products API for Eurodoor Customer Panel
import { supabase, Product } from './supabase';

export const productsApi = {
  // Barcha faol mahsulotlarni olish
  async getAllProducts(forceRefresh: boolean = false): Promise<Product[]> {
    try {
      console.log('🔄 Fetching products...', forceRefresh ? '(force refresh)' : '');
      
      // Add cache busting for force refresh
      const query = supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      // Add timestamp for cache busting if force refresh
      if (forceRefresh) {
        query.gt('updated_at', new Date(0).toISOString());
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('❌ Supabase error fetching products:', error);
        throw new Error(`Supabase error: ${error.message}`);
      }
      
      console.log('✅ Products fetched:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('❌ Error fetching products:', error);
      throw error;
    }
  },

  // ID bo'yicha mahsulot olish
  async getProductById(id: string): Promise<Product | null> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
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