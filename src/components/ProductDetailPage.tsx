import React, { useState, useEffect, useMemo } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ArrowLeft, Shield, Ruler, Award, Package, ShoppingCart, Plus, Minus } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';
import { productsApi } from '../lib/productsApi';
import { Product } from '../lib/supabase';

interface ProductDetailPageProps {
  productId: string;
  onNavigate: (page: string) => void;
}

export default function ProductDetailPage({ productId, onNavigate }: ProductDetailPageProps) {
  const { t, language } = useLanguage();
  const { addToCart } = useCart();
  const { showSuccess } = useToast();
  
  console.log('🎯 ProductDetailPage rendered with productId:', productId);

  // Real Supabase product
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  // Load product data
  useEffect(() => {
    const loadProduct = async () => {
      try {
        console.log('🔄 Loading product with ID:', productId);
        setLoading(true);
        const fetchedProduct = await productsApi.getProductById(productId);
        console.log('📦 Fetched product:', fetchedProduct);
        setProduct(fetchedProduct);
        console.log('✅ Product loaded successfully');
      } catch (error) {
        console.error('❌ Error loading product:', error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      console.log('🎯 ProductId exists, loading product...');
      loadProduct();
    } else {
      console.log('❌ No productId provided');
      setLoading(false);
    }
  }, [productId]);

  const handleAddToCart = () => {
    if (!product) return;

    // Check stock availability
    if (product.stock <= 0) {
      showSuccess('Xatolik!', 'Bu mahsulot omborda yo\'q');
      return;
    }

    if (quantity > product.stock) {
      showSuccess('Xatolik!', `Omborda faqat ${product.stock} dona mavjud`);
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

    // Har bir miqdor uchun alohida qo'shish
    for (let i = 0; i < quantity; i++) {
      addToCart(cartItem);
    }

    // Muvaffaqiyat xabari
    showSuccess('Mahsulot qo\'shildi!', `${quantity} ta ${product.name} korzinkaga qo'shildi`);
  };

  // Loading state
  if (loading) {
    return (
      <div className="relative min-h-screen">
        <div className="fixed inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://iili.io/KqAQo3g.jpg')" }} />
        <div className="fixed inset-0 bg-black/30" />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white text-lg">Mahsulot yuklanmoqda...</p>
          </div>
        </div>
      </div>
    );
  }

  // Product not found
  if (!product) {
    return (
      <div className="relative min-h-screen">
        <div className="fixed inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://iili.io/KqAQo3g.jpg')" }} />
        <div className="fixed inset-0 bg-black/30" />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Mahsulot topilmadi</h3>
            <p className="text-gray-300 mb-4">Kechirasiz, bu mahsulot mavjud emas</p>
            <button
              onClick={() => onNavigate('catalog')}
              className="bg-blue-500/20 text-blue-300 px-6 py-3 rounded-lg font-semibold hover:bg-blue-500/30 transition-colors"
            >
              Katalogga qaytish
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {/* Fixed background */}
      <div className="fixed inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://iili.io/KqAQo3g.jpg')" }} />
      <div className="fixed inset-0 bg-black/30" />

      {/* Back button */}
      <div className="relative z-10 p-4">
        <button
          onClick={() => onNavigate('catalog')}
          className="flex items-center gap-2 text-white hover:text-gray-300 transition-all duration-300 bg-white/10 backdrop-blur-xl px-4 py-2 rounded-xl border border-white/20 hover:border-blue-500/50 hover:bg-white/20"
        >
          <ArrowLeft className="h-5 w-5" />
          Katalogga qaytish
        </button>
      </div>

      {/* Product content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Product Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
              {product.name}
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Product Image */}
            <div className="lg:col-span-1">
              <div className="aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 shadow-2xl hover:border-blue-500/50 transition-all duration-300">
                <img
                  src={product.image || product.image_url || 'https://picsum.photos/600/600?random=1'}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>
            </div>

            {/* Product Details */}
            <div className="lg:col-span-1 space-y-6">
              {/* Price Card */}
              <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm rounded-2xl p-6 border border-green-500/30 shadow-xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-green-500/30 border border-green-500/50 rounded-full p-2">
                    <Award className="h-5 w-5 text-green-300" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Narx</h3>
                </div>
                <div className="mb-2">
                  <p className="text-3xl font-bold text-green-300">
                    {product.price.toLocaleString()} {product.currency}
                  </p>
                  <p className="text-gray-300 text-sm">
                    {product.currency === 'USD' ? 'Dollar' : 'Sum'}
                  </p>
                </div>
                <p className="text-gray-300 text-sm">Batafsil ma'lumot uchun biz bilan bog'laning</p>
              </div>

              {/* Add to Cart Section */}
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-xl hover:border-blue-500/50 transition-all duration-300">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Korzinkaga qo'shish
                </h3>
                
                {/* Quantity Selector */}
                <div className="mb-4">
                  <label className="block text-gray-300 font-medium mb-2">Miqdor</label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
                    >
                      <Minus className="h-4 w-4 text-white" />
                    </button>
                    <span className="w-16 text-center text-white font-semibold">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product?.stock || 1, quantity + 1))}
                      disabled={quantity >= (product?.stock || 0)}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                        quantity >= (product?.stock || 0)
                          ? 'bg-gray-500/20 cursor-not-allowed opacity-50'
                          : 'bg-white/20 hover:bg-white/30'
                      }`}
                    >
                      <Plus className="h-4 w-4 text-white" />
                    </button>
                  </div>
                </div>


                {/* Add to Cart Button */}
                <button
                  onClick={handleAddToCart}
                  disabled={!product || product.stock <= 0}
                  className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg ${
                    !product || product.stock <= 0
                      ? 'bg-gray-500/20 text-gray-400 cursor-not-allowed border border-gray-500/50'
                      : 'bg-gradient-to-r from-blue-500/30 to-purple-500/30 text-blue-300 hover:from-blue-500/40 hover:to-purple-500/40 border border-blue-500/50 hover:shadow-xl transform hover:scale-105'
                  }`}
                >
                  <ShoppingCart className="h-5 w-5" />
                  {!product || product.stock <= 0 ? "Omborda yo'q" : "Korzinkaga qo'shish"}
                </button>
              </div>

              {/* Technical Specs */}
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-xl hover:border-blue-500/50 transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-blue-500/30 border border-blue-500/50 rounded-full p-2">
                    <Ruler className="h-5 w-5 text-blue-300" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Texnik xususiyatlar</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-white/10">
                    <span className="text-gray-300 font-medium">Material:</span>
                    <span className="text-white font-semibold">{product.material}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/10">
                    <span className="text-gray-300 font-medium">Xavfsizlik:</span>
                    <span className="text-white font-semibold">{product.security}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/10">
                    <span className="text-gray-300 font-medium">O'lcham:</span>
                    <span className="text-white font-semibold">{product.dimensions}</span>
                  </div>
                  {product.thickness && (
                    <div className="flex justify-between items-center py-2 border-b border-white/10">
                      <span className="text-gray-300 font-medium">Qalinlik:</span>
                      <span className="text-white font-semibold">{product.thickness}mm</span>
                    </div>
                  )}
                  {product.lock_stages && (
                    <div className="flex justify-between items-center py-2 border-b border-white/10">
                      <span className="text-gray-300 font-medium">Qulf:</span>
                      <span className="text-white font-semibold">{product.lock_stages}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-300 font-medium">Omborda:</span>
                    <span className={`font-semibold ${product.stock > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {product.stock} dona
                    </span>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-purple-500/30 border border-purple-500/50 rounded-full p-2">
                    <Shield className="h-5 w-5 text-purple-300" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Xususiyatlar</h3>
                </div>
                <ul className="space-y-2">
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-gray-300">Galvanizlangan korpus</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-gray-300">Issiqlik va tovush izolyatsiyasi</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-gray-300">UV chidamli bo'yoq</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Product Description */}
          {product.description && (
            <div className="mt-8">
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-xl">
                <h3 className="text-xl font-bold text-white mb-4">Tavsif</h3>
                <p className="text-gray-300 leading-relaxed">{product.description}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
