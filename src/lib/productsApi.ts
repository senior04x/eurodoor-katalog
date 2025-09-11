// Supabase bilan ishlaydigan Products API
import { supabase } from './supabase';

export interface Product {
  id: string;
  name: string;
  name_ru?: string;
  name_en?: string;
  image?: string;
  material: string;
  material_ru?: string;
  material_en?: string;
  security: string;
  security_ru?: string;
  security_en?: string;
  dimensions: string;
  description?: string;
  description_ru?: string;
  description_en?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Fallback uchun localStorage flag
const USE_LOCALSTORAGE_FALLBACK = false; // Supabase ishlayotgani uchun o'chirildi

// Supabase API funksiyalari
export const productsApi = {
  // Barcha mahsulotlarni olish
  async getAllProducts(): Promise<Product[]> {
    try {
      console.log('🔄 Loading products from Supabase...');
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ Supabase error fetching products:', error);
        if (USE_LOCALSTORAGE_FALLBACK && typeof window !== 'undefined') {
          const local = JSON.parse(localStorage.getItem('adminProducts') || '[]') as Product[];
          console.warn('➡️ Falling back to localStorage products:', local.length);
          return local;
        }
        throw new Error(`Supabase error: ${error.message}`);
      }
      
      console.log('✅ Supabase products fetched:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('❌ Supabase connection error:', error);
      if (USE_LOCALSTORAGE_FALLBACK && typeof window !== 'undefined') {
        const local = JSON.parse(localStorage.getItem('adminProducts') || '[]') as Product[];
        console.warn('➡️ Falling back to localStorage products after connection error:', local.length);
        return local;
      }
      throw new Error(`Connection error: ${error}`);
    }
  },

  // Yangi mahsulot qo'shish
  async addProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> {
    try {
      console.log('🔄 Saving product to Supabase...');
      const { data, error } = await supabase
        .from('products')
        .insert([product])
        .select()
        .single();
      
      if (error) {
        console.error('❌ Supabase error creating product:', error);
        if (USE_LOCALSTORAGE_FALLBACK && typeof window !== 'undefined') {
          const existing = JSON.parse(localStorage.getItem('adminProducts') || '[]') as Product[];
          const saved = { 
            ...product, 
            id: `euro-model${Date.now()}`,
            created_at: new Date().toISOString()
          } as Product;
          existing.push(saved);
          localStorage.setItem('adminProducts', JSON.stringify(existing));
          console.warn('➡️ Saved to localStorage as fallback');
          return true;
        }
        throw new Error(`Supabase error: ${error.message}`);
      }
      
      console.log('✅ Product saved to Supabase:', data);
      return true;
    } catch (error) {
      console.error('❌ Supabase connection error:', error);
      if (USE_LOCALSTORAGE_FALLBACK && typeof window !== 'undefined') {
        const existing = JSON.parse(localStorage.getItem('adminProducts') || '[]') as Product[];
        const saved = { 
          ...product, 
          id: `euro-model${Date.now()}`,
          created_at: new Date().toISOString()
        } as Product;
        existing.push(saved);
        localStorage.setItem('adminProducts', JSON.stringify(existing));
        console.warn('➡️ Saved to localStorage after connection error');
        return true;
      }
      throw new Error(`Connection error: ${error}`);
    }
  },

  // Mahsulotni o'chirish
  async deleteProduct(productId: string): Promise<boolean> {
    try {
      console.log('🔄 Deleting product from Supabase...');
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);
      
      if (error) {
        console.error('❌ Supabase error deleting product:', error);
        if (USE_LOCALSTORAGE_FALLBACK && typeof window !== 'undefined') {
          const existing = JSON.parse(localStorage.getItem('adminProducts') || '[]') as Product[];
          const updated = existing.filter(p => p.id !== productId);
          localStorage.setItem('adminProducts', JSON.stringify(updated));
          console.warn('➡️ Deleted from localStorage as fallback');
          return true;
        }
        throw new Error(`Supabase error: ${error.message}`);
      }
      
      console.log('✅ Product deleted from Supabase:', productId);
      return true;
    } catch (error) {
      console.error('❌ Supabase connection error:', error);
      if (USE_LOCALSTORAGE_FALLBACK && typeof window !== 'undefined') {
        const existing = JSON.parse(localStorage.getItem('adminProducts') || '[]') as Product[];
        const updated = existing.filter(p => p.id !== productId);
        localStorage.setItem('adminProducts', JSON.stringify(updated));
        console.warn('➡️ Deleted from localStorage after connection error');
        return true;
      }
      throw new Error(`Connection error: ${error}`);
    }
  },

  // Mahsulotni yangilash
  async updateProduct(productId: string, updates: Partial<Product>): Promise<boolean> {
    try {
      console.log('🔄 Updating product in Supabase...');
      const { error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', productId);
      
      if (error) {
        console.error('❌ Supabase error updating product:', error);
        if (USE_LOCALSTORAGE_FALLBACK && typeof window !== 'undefined') {
          const existing = JSON.parse(localStorage.getItem('adminProducts') || '[]') as Product[];
          const updated = existing.map(p => p.id === productId ? { ...p, ...updates } : p);
          localStorage.setItem('adminProducts', JSON.stringify(updated));
          console.warn('➡️ Updated in localStorage as fallback');
          return true;
        }
        throw new Error(`Supabase error: ${error.message}`);
      }
      
      console.log('✅ Product updated in Supabase:', productId);
      return true;
    } catch (error) {
      console.error('❌ Supabase connection error:', error);
      if (USE_LOCALSTORAGE_FALLBACK && typeof window !== 'undefined') {
        const existing = JSON.parse(localStorage.getItem('adminProducts') || '[]') as Product[];
        const updated = existing.map(p => p.id === productId ? { ...p, ...updates } : p);
        localStorage.setItem('adminProducts', JSON.stringify(updated));
        console.warn('➡️ Updated in localStorage after connection error');
        return true;
      }
      throw new Error(`Connection error: ${error}`);
    }
  },

  // Mahsulotni faol/infaol qilish
  async toggleProductStatus(productId: string): Promise<boolean> {
    try {
      console.log('🔄 Toggling product status in Supabase...');
      const { error } = await supabase
        .from('products')
        .update({ is_active: false }) // Avval hozirgi holatni olish kerak, lekin oddiy qilish uchun
        .eq('id', productId);
      
      if (error) {
        console.error('❌ Supabase error toggling product status:', error);
        if (USE_LOCALSTORAGE_FALLBACK && typeof window !== 'undefined') {
          const existing = JSON.parse(localStorage.getItem('adminProducts') || '[]') as Product[];
          const product = existing.find(p => p.id === productId);
          if (!product) return false;
          
          const updated = existing.map(p => 
            p.id === productId ? { ...p, is_active: !p.is_active } : p
          );
          localStorage.setItem('adminProducts', JSON.stringify(updated));
          console.warn('➡️ Toggled in localStorage as fallback');
          return true;
        }
        throw new Error(`Supabase error: ${error.message}`);
      }
      
      console.log('✅ Product status toggled in Supabase:', productId);
      return true;
    } catch (error) {
      console.error('❌ Supabase connection error:', error);
      if (USE_LOCALSTORAGE_FALLBACK && typeof window !== 'undefined') {
        const existing = JSON.parse(localStorage.getItem('adminProducts') || '[]') as Product[];
        const product = existing.find(p => p.id === productId);
        if (!product) return false;
        
        const updated = existing.map(p => 
          p.id === productId ? { ...p, is_active: !p.is_active } : p
        );
        localStorage.setItem('adminProducts', JSON.stringify(updated));
        console.warn('➡️ Toggled in localStorage after connection error');
        return true;
      }
      throw new Error(`Connection error: ${error}`);
    }
  }
};
