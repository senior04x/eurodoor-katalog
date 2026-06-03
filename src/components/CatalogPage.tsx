import { useMemo, useState, useEffect } from 'react';
import { Eye, ShoppingCart, Search, Package, Ruler } from 'lucide-react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';
import { productsApi } from '../lib/productsApi';
import { Product, supabase } from '../lib/supabase';

interface CatalogPageProps {
  onNavigate: (page: string, productId?: string) => void;
}

export default function CatalogPage({ onNavigate }: CatalogPageProps) {
  const { t } = useLanguage();
  const { addToCart } = useCart();
  const { showSuccess } = useToast();
  const prefersReduced = useReducedMotion();
  
  // Real Supabase products
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDimensions, setSelectedDimensions] = useState<string>('all');
  const [selectedMaterial, setSelectedMaterial] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 0, max: 100000 });
  const [maxPossiblePrice, setMaxPossiblePrice] = useState<number>(100000);
  const [minPossiblePrice, setMinPossiblePrice] = useState<number>(0);
  const [displayLimit, setDisplayLimit] = useState<number>(20);

  // Update min/max possible prices when products load
  useEffect(() => {
    if (products.length > 0) {
      const prices = products.map(p => p.price).filter(p => typeof p === 'number' && !isNaN(p));
      if (prices.length > 0) {
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        setMinPossiblePrice(min);
        setMaxPossiblePrice(max);
        setPriceRange({ min, max });
      }
    }
  }, [products]);

  // Load products function (optimized - no testConnection)
  const loadProducts = async (silent: boolean = false, forceRefresh: boolean = false) => {
    try {
      if (!silent) setLoading(true);
      
      const fetchedProducts = await productsApi.getAllProducts(forceRefresh);
      setProducts(fetchedProducts);
      
    } catch (error) {
      console.error('❌ CatalogPage: Error loading products:', error);
      if (products.length === 0) {
        setProducts([]);
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {

    // Load products immediately
    loadProducts();

    // Real-time subscription with error handling
    let subscription: any = null;
    try {
      subscription = supabase
        .channel('products-realtime')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'products' },
          (payload) => {
            console.log('🔄 Products updated:', payload);
            // Always reload silently and force refresh cache
            loadProducts(true, true);
          }
        )
        .subscribe((status) => {
          console.log('📡 Products subscription status:', status);
        });
    } catch (error) {
      console.error('❌ Failed to setup real-time subscription:', error);
    }

    return () => {
      if (subscription) {
        console.log('🔌 Unsubscribing from products real-time updates');
        subscription.unsubscribe();
      }
    };
  }, []);

  // Remove visibility change handler to prevent infinite loops

  // Filter products based on search, dimensions, and material
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(product =>
        (product.model_name || product.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.material || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.description || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Dimensions filter
    if (selectedDimensions !== 'all') {
      filtered = filtered.filter(product => 
        product.dimensions?.toLowerCase().includes(selectedDimensions.toLowerCase())
      );
    }

    // Material filter
    if (selectedMaterial !== 'all') {
      filtered = filtered.filter(product => 
        (product.material || '').toLowerCase().includes(selectedMaterial.toLowerCase())
      );
    }

    // Price range filter
    filtered = filtered.filter(product => {
      const price = product.price || 0;
      return price >= priceRange.min && price <= priceRange.max;
    });

    return filtered;
  }, [products, searchQuery, selectedDimensions, selectedMaterial, priceRange]);

  // Reset display limit when filters change
  useEffect(() => {
    setDisplayLimit(20);
  }, [searchQuery, selectedDimensions, selectedMaterial, priceRange]);

  // Get unique dimensions and materials
  const dimensions = useMemo(() => {
    const dims = ['all', ...new Set(products.map(p => p.dimensions).filter(Boolean))];
    return dims;
  }, [products]);

  const materials = useMemo(() => {
    const mats = ['all', ...new Set(products.map(p => p.material).filter(Boolean))];
    return mats;
  }, [products]);

  // Add to cart handler
  const handleAddToCart = (product: Product) => {
    const cartItem = {
      id: product.id,
      name: product.model_name || product.name || 'Mahsulot',
      price: product.price,
      image: product.image_url || '',
      dimensions: product.dimensions,
      material: product.material,
      stock: 1 // Default stock value
    };

    addToCart(cartItem);
    showSuccess('Mahsulot qo\'shildi!', `${product.model_name || product.name} korzinkaga qo'shildi`);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: prefersReduced
        ? { duration: 0 }
        : { type: 'spring', stiffness: 300, damping: 20 }
    },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
  };

  if (loading) {
    return (
      <div className="relative min-h-screen">
        <div
          className="fixed inset-0 bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: "url('/images/hero-bg.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
          }}
        />
        <div className="fixed inset-0 bg-black/30" />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white text-lg">Mahsulotlar yuklanmoqda...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {/* Optimized background with HomePage style */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: "url('/images/hero-bg.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      />
      <div className="fixed inset-0 bg-black/30" />

      {/* Hero Section - Compact layout */}
      <section className="relative py-8 flex items-center overflow-hidden">
        <div className="relative container mx-auto px-4 flex items-center">
          <div className="max-w-2xl text-white ml-8 md:ml-16">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 leading-tight bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
              {t('catalog.title')}
            </h1>
            <p className="text-lg md:text-xl mb-4 opacity-90 text-gray-100">
              {t('catalog.description')}
            </p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="container mx-auto px-4 py-8">
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Mahsulot qidirish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>

            {/* Dimensions Filter */}
            <div className="relative">
              <Ruler className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedDimensions}
                onChange={(e) => setSelectedDimensions(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none"
              >
                {dimensions.map(dimension => (
                  <option key={dimension} value={dimension} className="bg-gray-800 text-white">
                    {dimension === 'all' ? 'Barcha o\'lchamlar' : dimension}
                  </option>
                ))}
              </select>
            </div>

            {/* Material Filter */}
            <div className="relative">
              <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedMaterial}
                onChange={(e) => setSelectedMaterial(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none"
              >
                {materials.map(material => (
                  <option key={material} value={material} className="bg-gray-800 text-white">
                    {material === 'all' ? 'Barcha materiallar' : material}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range Slider */}
            <div className="col-span-1 md:col-span-3 mt-2 pt-4 border-t border-white/10">
              <label className="block text-white text-sm font-medium mb-4">
                Narx oralig'i: <span className="font-bold text-blue-400 bg-blue-500/20 px-2 py-1 rounded-md ml-1">${priceRange.min.toLocaleString()}</span> - <span className="font-bold text-blue-400 bg-blue-500/20 px-2 py-1 rounded-md ml-1">${priceRange.max.toLocaleString()}</span>
              </label>
              
              <div className="relative w-full h-8 flex items-center group">
                <div className="absolute w-full h-2 bg-white/10 rounded-full overflow-hidden shadow-inner">
                  <div 
                    className="absolute h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-75"
                    style={{ 
                      left: `${((priceRange.min - minPossiblePrice) / (maxPossiblePrice - minPossiblePrice || 1)) * 100}%`, 
                      right: `${100 - ((priceRange.max - minPossiblePrice) / (maxPossiblePrice - minPossiblePrice || 1)) * 100}%` 
                    }}
                  />
                </div>
                
                <input 
                  type="range" 
                  min={minPossiblePrice} 
                  max={maxPossiblePrice} 
                  value={priceRange.min}
                  onChange={(e) => {
                    const value = Math.min(Number(e.target.value), priceRange.max - 1);
                    setPriceRange(prev => ({ ...prev, min: value }));
                  }}
                  className="absolute w-full h-2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:border-blue-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(59,130,246,0.5)] [&::-webkit-slider-thumb]:cursor-pointer z-10"
                />
                
                <input 
                  type="range" 
                  min={minPossiblePrice} 
                  max={maxPossiblePrice} 
                  value={priceRange.max}
                  onChange={(e) => {
                    const value = Math.max(Number(e.target.value), priceRange.min + 1);
                    setPriceRange(prev => ({ ...prev, max: value }));
                  }}
                  className="absolute w-full h-2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:border-blue-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(59,130,246,0.5)] [&::-webkit-slider-thumb]:cursor-pointer z-20"
                />
              </div>
              <div className="flex justify-between text-white/40 text-[11px] font-medium mt-2 px-1">
                <span>${minPossiblePrice.toLocaleString()}</span>
                <span>${maxPossiblePrice.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Results count */}
          <div className="mt-4 text-center">
            <p className="text-gray-300">
              {filteredProducts.length} ta mahsulot topildi
            </p>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="container mx-auto px-4 pb-16">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-8">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Mahsulot topilmadi</h3>
              <p className="text-gray-300">Qidiruv shartlarini o'zgartiring yoki boshqa kategoriyani tanlang</p>
            </div>
          </div>
        ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-4"
        >
          <AnimatePresence>
            {filteredProducts.slice(0, displayLimit).map((product) => (
              <motion.div
                key={product.id}
                variants={cardVariants}
                initial="hidden"
                animate="show"
                exit="exit"
                className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl shadow-lg overflow-hidden border border-white/20 hover:border-blue-500/50 transition-all duration-300 hover:scale-[1.03] group flex flex-col mb-4 break-inside-avoid"
              >
                {/* Product Image */}
                <div className="relative w-full overflow-hidden shrink-0">
                  <img
                    src={product.image_url || 'https://picsum.photos/400/300?random=1'}
                    alt={product.model_name || product.name || 'Product'}
                    loading="lazy"
                    className="w-full h-auto transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <h3 className="text-lg font-bold text-white mb-1 group-hover:text-blue-300 transition-colors truncate">
                    {product.model_name || product.name || 'Product'}
                  </h3>
                  <p className="text-xs text-gray-400 mb-3">{product.dimensions}</p>

                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-xl font-bold text-white">
                        {!product.price || product.price === 0 ? '-' : `$${Number(product.price).toLocaleString()}`}
                      </div>
                      <div className="flex gap-2 mt-1 text-[10px] font-medium">
                        <span className={product.stock_left && product.stock_left > 0 ? 'text-green-400' : 'text-red-400/60'}>
                          L: {product.stock_left && product.stock_left > 0 ? '✓' : '✗'}
                        </span>
                        <span className={product.stock_right && product.stock_right > 0 ? 'text-green-400' : 'text-red-400/60'}>
                          R: {product.stock_right && product.stock_right > 0 ? '✓' : '✗'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-1.5">
                      <button
                        onClick={() => {
                          onNavigate('product-detail', product.id);
                        }}
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                        title="Batafsil ko'rish"
                      >
                        <Eye className="w-4 h-4 text-white" />
                      </button>
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="p-2 rounded-lg transition-colors bg-blue-500/20 hover:bg-blue-500/30"
                        title="Korzinkaga qo'shish"
                      >
                        <ShoppingCart className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
        )}

        {filteredProducts.length > displayLimit && (
          <div className="mt-12 flex justify-center">
            <button
              onClick={() => setDisplayLimit(prev => prev + 20)}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 transform hover:-translate-y-1"
            >
              Yana ko'rsatish
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
