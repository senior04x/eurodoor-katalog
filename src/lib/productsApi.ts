// Optimized Products API for Eurodoor Customer Panel
import { supabase, Product } from './supabase';
import { fetchOmborProducts, fetchOmborEntries, calculateStock } from './omborApi';

// Enhanced cache for products with better performance
let productsCache: Product[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes cache (tezroq yangilanish uchun)

// Separate ombor cache to avoid refetching heavy stock data
let omborCache: { products: any[]; stockMap: Record<string, { left: number; right: number }> } | null = null;
let omborCacheTimestamp: number = 0;
const OMBOR_CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

export const productsApi = {
  // Test database connection
  async testConnection() {
    try {
      console.log('🔍 Testing database connection...');
      
      const { data, error } = await supabase
        .from('products')
        .select('id')
        .limit(1);
      
      if (error) {
        console.error('❌ Database connection failed:', error);
        return { success: false, error: error.message };
      }
      
      return { success: true, data };
    } catch (error) {
      console.error('❌ Database test error:', error);
      return { success: false, error: 'Connection failed' };
    }
  },

  // Optimized: parallel fetching with separate ombor cache
  async getAllProducts(forceRefresh: boolean = false): Promise<Product[]> {
    // Check cache first (HMR forced reload)
    if (!forceRefresh && productsCache && (Date.now() - cacheTimestamp) < CACHE_DURATION) {
      return productsCache;
    }
    
    try {
      const now = Date.now();
      const needsOmborRefresh = forceRefresh || !omborCache || (now - omborCacheTimestamp) > OMBOR_CACHE_DURATION;
      
      // Build parallel promises — LIMIT 1000 (eski: 100, ko'p mahsulotlar o'qilmay qolardi!)
      const catalogPromise = supabase
        .from('products')
        .select('id, model_name, price, image_url, dimensions, material, security_class, thickness, lock_stages, stock_quantity, description, is_active, created_at, updated_at')
        .order('created_at', { ascending: false })
        .limit(1000);

      let omborProducts: any[];
      let stockMap: Record<string, { left: number; right: number }>;

      if (needsOmborRefresh) {
        // Fetch ombor data and catalog data in parallel
        const [omborProds, omborEntries, catalogResult] = await Promise.all([
          fetchOmborProducts(),
          fetchOmborEntries(),
          catalogPromise
        ]);
        
        omborProducts = omborProds;
        stockMap = calculateStock(omborEntries);
        
        // Update ombor cache
        omborCache = { products: omborProducts, stockMap };
        omborCacheTimestamp = now;
        
        const catalogProducts = (catalogResult.data as Product[]) || [];
        if (catalogResult.error) console.error('❌ Supabase error:', catalogResult.error);
        
        console.log(`📊 Catalog DB: ${catalogProducts.length} yozuv, Ombor: ${omborProducts.length} mahsulot`);
        
        // Merge
        productsCache = this._mergeProducts(omborProducts, catalogProducts, stockMap);
      } else {
        // Ombor cache is fresh, only fetch catalog
        omborProducts = omborCache!.products;
        stockMap = omborCache!.stockMap;
        
        const { data, error } = await catalogPromise;
        if (error) console.error('❌ Supabase error:', error);
        const catalogProducts = (data as Product[]) || [];
        
        productsCache = this._mergeProducts(omborProducts, catalogProducts, stockMap);
      }
      
      cacheTimestamp = now;
      console.log(`✅ Products loaded: ${productsCache.length} items`);
      return productsCache;
      
    } catch (error) {
      console.error('❌ Error loading products:', error);
      // Return stale cache if available
      if (productsCache) return productsCache;
      throw error;
    }
  },

  // Internal merge helper — MUSTAHKAMLANGAN MATCHING LOGIKASI
  _mergeProducts(omborProducts: any[], catalogProducts: Product[], stockMap: Record<string, { left: number; right: number }>): Product[] {
    // 1) Katalog mahsulotlari uchun lookup maplar yaratish (O(1) tezlikda matching)
    //    Composite key: "model 050 | 2400*2200*90mm" (lowercase)
    //    Model+Dim key: "model 050::2400*2200*90mm" (lowercase)
    const catalogByComposite = new Map<string, Product>();
    const catalogByModelDim = new Map<string, Product>();
    
    catalogProducts.forEach((cp: any) => {
      // Composite key matching: "Model 050 | 2400*2200*90mm"
      if (cp.model_name && cp.model_name.includes(' | ')) {
        catalogByComposite.set(cp.model_name.toLowerCase().trim(), cp);
      }
      // Model + dimensions matching: separate fields
      if (cp.model_name && cp.dimensions) {
        const key = `${cp.model_name.toLowerCase().trim()}::${cp.dimensions.toLowerCase().trim()}`;
        catalogByModelDim.set(key, cp);
      }
    });

    let matchCount = 0;
    let noMatchCount = 0;

    const mergedProducts: Product[] = omborProducts.map(op => {
      // Ombor mahsulotini katalog bazasida qidirish (3 xil usulda)
      const compositeKey = `${op.model} | ${op.razmer}`.toLowerCase().trim();
      const modelDimKey = `${op.model}::${op.razmer}`.toLowerCase().trim();
      
      const extraInfo: any = 
        // 1-usul: Composite key bo'yicha (admin panel yangi yozuv yaratganda shu formatda saqlaydi)
        catalogByComposite.get(compositeKey) ||
        // 2-usul: model_name + dimensions alohida maydonlar bo'yicha
        catalogByModelDim.get(modelDimKey) ||
        // 3-usul: bo'sh object (hech narsa topilmasa)
        {};
      
      if (extraInfo.id) {
        matchCount++;
      } else {
        noMatchCount++;
      }
      
      const stockKey = `${op.model}-${op.razmer}`;
      const stockInfo = stockMap[stockKey] || { left: 0, right: 0 };
      
      return {
        id: op.id,
        model_name: op.model,
        dimensions: op.razmer,
        image_url: op.image || extraInfo.image_url,
        stock_quantity: 0,
        stock_left: stockInfo.left,
        stock_right: stockInfo.right,
        price: extraInfo.price || 0,
        material: extraInfo.material || '-',
        security_class: extraInfo.security_class || '-',
        thickness: extraInfo.thickness || '-',
        lock_stages: extraInfo.lock_stages || '-',
        description: extraInfo.description || '',
        is_active: extraInfo.is_active !== undefined ? extraInfo.is_active : true,
        created_at: op.created_at,
        updated_at: extraInfo.updated_at || op.created_at
      } as Product & { stock_left: number, stock_right: number };
    });
    
    console.log(`🔗 Merge natijasi: ${matchCount} mos topildi, ${noMatchCount} mos topilmadi (jami: ${mergedProducts.length})`);
    
    // is_active === false bo'lgan mahsulotlarni filtrlab tashlash
    const activeProducts = mergedProducts.filter(p => p.is_active !== false);
    console.log(`👁️ Ko'rinadigan: ${activeProducts.length}, Yashirilgan: ${mergedProducts.length - activeProducts.length}`);
    
    return activeProducts;
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
      
      // Real database query: for getting by ID we can just load all and find it since we already cache
      const products = await this.getAllProducts();
      const product = products.find(p => p.id === id);
      
      if (!product) {
        throw new Error(`Product not found`);
      }
      
      return product;
    } catch (error) {
      console.error('Database connection error:', error);
      throw error;
    }
  },


  // Cache ni tozalash
  clearCache() {
    productsCache = null;
    cacheTimestamp = 0;
    omborCache = null;
    omborCacheTimestamp = 0;
  }
};