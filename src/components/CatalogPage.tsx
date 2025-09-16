import { useMemo, useState, useEffect } from 'react';
import { Eye, ShoppingCart, Search, Package, Ruler } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';
import { productsApi } from '../lib/productsApi';
import { Product } from '../lib/supabase';

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

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        console.log('🔄 Loading products...');
        
        // Add timeout for better error handling
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout after 8 seconds')), 8000)
        );
        
        const productsPromise = productsApi.getAllProducts();
        const fetchedProducts = await Promise.race([productsPromise, timeoutPromise]) as Product[];
        
        setProducts(fetchedProducts);
        console.log('✅ Products loaded:', fetchedProducts.length);
      } catch (error) {
        console.error('❌ Error loading products:', error);
        setProducts([]);
        
        // Show user-friendly error message
        if (error instanceof Error) {
          if (error.message.includes('timeout')) {
            console.error('⏰ Products loading timeout - check network connection');
          } else if (error.message.includes('Supabase')) {
            console.error('🗄️ Database connection issue');
          } else {
            console.error('🔧 Unknown error:', error.message);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    // Load products immediately
    loadProducts();

    // Real-time subscription with error handling
    let subscription: any = null;
    try {
      subscription = productsApi.subscribeToProducts((payload) => {
        console.log('🔄 Products updated:', payload);
        loadProducts(); // Reload products when changes occur
      });
    } catch (error) {
      console.error('❌ Failed to setup real-time subscription:', error);
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  // Force reload products when component mounts (for navigation issues)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('🔄 Page became visible, reloading products...');
        const loadProducts = async () => {
          try {
            setLoading(true);
            const fetchedProducts = await productsApi.getAllProducts(true); // Force refresh
            setProducts(fetchedProducts);
            console.log('✅ Products reloaded:', fetchedProducts.length);
          } catch (error) {
            console.error('❌ Error reloading products:', error);
          } finally {
            setLoading(false);
          }
        };
        loadProducts();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Filter products based on search, dimensions, and material
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.material.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase())
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
        product.material.toLowerCase().includes(selectedMaterial.toLowerCase())
      );
    }

    return filtered;
  }, [products, searchQuery, selectedDimensions, selectedMaterial]);

  // Get unique dimensions and materials
  const dimensions = useMemo(() => {
    const dims = ['all', ...new Set(products.map(p => p.dimensions).filter(Boolean))];
    return dims;
  }, [products]);

  const materials = useMemo(() => {
    const mats = ['all', ...new Set(products.map(p => p.material))];
    return mats;
  }, [products]);

  // Add to cart handler
  const handleAddToCart = (product: Product) => {
    // Check stock availability
    if (product.stock <= 0) {
      showSuccess('Xatolik!', 'Bu mahsulot omborda yo\'q');
      return;
    }

    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image || product.image_url || '',
      dimensions: product.dimensions,
      material: product.material,
      stock: product.stock
    };

    addToCart(cartItem);
    showSuccess('Mahsulot qo\'shildi!', `${product.name} korzinkaga qo'shildi`);
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
    }
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
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
            {filteredProducts.map((product) => (
            <motion.div
                key={product.id}
                variants={cardVariants}
                className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl shadow-xl overflow-hidden border border-white/20 hover:border-blue-500/50 transition-all duration-300 hover:scale-105 group"
              >
                {/* Product Image */}
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={product.image || product.image_url || 'https://picsum.photos/400/300?random=1'}
                    alt={product.name}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                {/* Product Info */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">
                    {product.name}
                  </h3>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-300">
                      <span className="font-medium">Material:</span>
                      <span className="ml-2">{product.material}</span>
                </div>
                    <div className="flex items-center text-sm text-gray-300">
                      <span className="font-medium">Xavfsizlik:</span>
                      <span className="ml-2">{product.security}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-300">
                      <span className="font-medium">O'lcham:</span>
                      <span className="ml-2">{product.dimensions}</span>
                    </div>
                  </div>

                  {product.description && (
                    <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                      {product.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-white">
                        {product.price.toLocaleString()} {product.currency}
                      </div>
                      <div className="text-sm text-gray-300">
                        Qoldiq: {product.stock} dona
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          console.log('🔍 CatalogPage: Navigating to product detail:', product.id);
                          onNavigate('product-detail', product.id);
                        }}
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                        title="Batafsil ko'rish"
                      >
                        <Eye className="w-5 h-5 text-white" />
                      </button>
                            <button
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock <= 0}
                        className={`p-2 rounded-lg transition-colors ${
                          product.stock <= 0 
                            ? 'bg-gray-500/20 cursor-not-allowed opacity-50' 
                            : 'bg-blue-500/20 hover:bg-blue-500/30'
                        }`}
                        title={product.stock <= 0 ? "Omborda yo'q" : "Korzinkaga qo'shish"}
                      >
                        <ShoppingCart className="w-5 h-5 text-white" />
                      </button>
                    </div>
                  </div>
                </div>
                        </motion.div>
            ))}
                  </motion.div>
                )}
      </section>
    </div>
  );
}
