// Supabase bilan ishlaydigan Products API - faqat Supabase
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

// Supabase API funksiyalari - faqat Supabase
export const productsApi = {
  // Barcha mahsulotlarni olish - faqat Supabase
  async getAllProducts(): Promise<Product[]> {
    console.log('🔄 Loading products from Supabase...');
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Supabase error fetching products:', error);
      throw new Error(`Supabase error: ${error.message}`);
    }
    
    console.log('✅ Supabase products fetched:', data?.length || 0);
    return data || [];
  },

  // Yangi mahsulot qo'shish - faqat Supabase
  async addProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> {
    console.log('🔄 Saving product to Supabase...');
    
    const { data, error } = await supabase
      .from('products')
      .insert([product])
      .select()
      .single();
    
    if (error) {
      console.error('❌ Supabase error creating product:', error);
      throw new Error(`Supabase error: ${error.message}`);
    }
    
    console.log('✅ Product saved to Supabase:', data);
    return true;
  },

  // Mahsulotni o'chirish - faqat Supabase
  async deleteProduct(productId: string): Promise<boolean> {
    console.log('🔄 Deleting product from Supabase...');
    
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);
    
    if (error) {
      console.error('❌ Supabase error deleting product:', error);
      throw new Error(`Supabase error: ${error.message}`);
    }
    
    console.log('✅ Product deleted from Supabase:', productId);
    return true;
  },

  // Mahsulotni yangilash - faqat Supabase
  async updateProduct(productId: string, updates: Partial<Product>): Promise<boolean> {
    console.log('🔄 Updating product in Supabase...');
    
    const { error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', productId);
    
    if (error) {
      console.error('❌ Supabase error updating product:', error);
      throw new Error(`Supabase error: ${error.message}`);
    }
    
    console.log('✅ Product updated in Supabase:', productId);
    return true;
  },

  // Mahsulot statusini o'zgartirish - faqat Supabase
  async toggleProductStatus(productId: string): Promise<boolean> {
    console.log('🔄 Toggling product status in Supabase...');
    
    // Avval mahsulotni olish
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('is_active')
      .eq('id', productId)
      .single();
    
    if (fetchError) {
      console.error('❌ Supabase error fetching product:', fetchError);
      throw new Error(`Supabase error: ${fetchError.message}`);
    }
    
    // Statusni o'zgartirish
    const newStatus = !product.is_active;
    const { error } = await supabase
      .from('products')
      .update({ is_active: newStatus })
      .eq('id', productId);
    
    if (error) {
      console.error('❌ Supabase error updating product status:', error);
      throw new Error(`Supabase error: ${error.message}`);
    }
    
    console.log('✅ Product status toggled in Supabase:', productId, '->', newStatus);
    return true;
  }
};