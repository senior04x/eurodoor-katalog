import React, { useState, useEffect, useMemo } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ArrowLeft, Shield, Ruler, Award, Package, ShoppingCart, Plus, Minus } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';
import { productsApi } from '../lib/productsApi';

interface ProductDetailPageProps {
  productId: string;
  onNavigate: (page: string) => void;
}

export default function ProductDetailPage({ productId, onNavigate }: ProductDetailPageProps) {
  const { t, language } = useLanguage();
  const { addToCart } = useCart();
  const { showSuccess } = useToast();
  

  // Faqat Supabase dan mahsulot olish
  const [rawProduct, setRawProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedDimensions, setSelectedDimensions] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [customDimensions, setCustomDimensions] = useState('');

  // Mahsulot ma'lumotlarini yuklash
  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        const products = await productsApi.getAllProducts();
        const foundProduct = products.find((p: any) => p.id === productId);
        
        if (foundProduct) {
          setRawProduct(foundProduct); // To'g'ridan-to'g'ri Supabase ma'lumotini saqlash
        } else {
          setRawProduct(null);
        }
      } catch (error) {
        console.error('Error loading product:', error);
        setRawProduct(null);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [productId]); // Faqat productId o'zgarganida

  const handleAddToCart = () => {
    if (!product) return;

    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      dimensions: selectedDimensions || customDimensions,
      color: selectedColor,
      material: product.material
    };

    // Har bir miqdor uchun alohida qo'shish
    for (let i = 0; i < quantity; i++) {
      addToCart(cartItem);
    }

    // Muvaffaqiyat xabari
    showSuccess('Mahsulot qo\'shildi!', `${quantity} ta ${product.name} korzinkaga qo'shildi`);
  };

  // Tilga mos mahsulot ma'lumotlarini hisoblash
  const product = useMemo(() => {
    if (!rawProduct) return null;
    
    // Tilga qarab ma'lumotlarni tanlash
    const name = rawProduct[`name_${language}`] || rawProduct.name;
    const material = rawProduct[`material_${language}`] || rawProduct.material;
    const security = rawProduct[`security_${language}`] || rawProduct.security;
    const dimensions = rawProduct[`dimensions_${language}`] || rawProduct.dimensions;
    // Qulf bosqichlari uchun faqat sonni olish
    const lockStagesNumber = rawProduct.lock_stages;
    const lockStages = lockStagesNumber || (rawProduct[`lock_stages_${language}`] || rawProduct.lock_stages);
    const price = rawProduct.price;
    const currency = rawProduct.currency;
    const thickness = rawProduct.thickness;

    return {
      ...rawProduct,
      name: name,
      material: material,
      security: security,
      dimensions: dimensions,
      lockStages: lockStages,
      price: price,
      currency: currency,
      thickness: thickness
    };
  }, [rawProduct, language]);

  // Debug log
  console.log('🔍 ProductDetailPage - productId:', productId, 'loading:', loading, 'product:', product);

  // Loading holatini ko'rsatish
  if (loading) {
    return (
      <div className="relative min-h-screen">
        {/* Fixed background */}
        <div
          className="fixed inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://iili.io/KqAQo3g.jpg')" }}
        />
        <div className="fixed inset-0 bg-black/30" />

        {/* Back button */}
        <div className="relative z-10 p-4">
          <button
            onClick={() => onNavigate('catalog')}
            className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            {t('product.back_to_catalog')}
          </button>
        </div>

        {/* Loading message */}
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="mb-6">
              <div className="mx-auto w-20 h-20 bg-white/20 border border-white/30 rounded-full flex items-center justify-center mb-4">
                <Package className="h-10 w-10 text-white/60 animate-pulse" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {t('loading.loading')}
              </h1>
              <p className="text-gray-300 text-lg max-w-md mx-auto">
                {t('loading.loading_product_details')}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Mahsulot topilmadi bo'lsa
  if (!product) {
    return (
      <div className="relative min-h-screen">
        {/* Fixed background */}
        <div
          className="fixed inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://iili.io/KqAQo3g.jpg')" }}
        />
        <div className="fixed inset-0 bg-black/30" />

        {/* Back button */}
        <div className="relative z-10 p-4">
          <button
            onClick={() => onNavigate('catalog')}
            className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            {t('product.back_to_catalog')}
          </button>
        </div>

        {/* Error message */}
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="mb-6">
              <div className="mx-auto w-20 h-20 bg-white/20 border border-white/30 rounded-full flex items-center justify-center mb-4">
                <Package className="h-10 w-10 text-white/60" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {t('loading.product_not_found')}
              </h1>
              <p className="text-gray-300 text-lg max-w-md mx-auto">
                {t('loading.product_not_found_desc')}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => onNavigate('catalog')}
                className="bg-blue-500/20 text-blue-300 px-6 py-3 rounded-lg font-semibold hover:bg-blue-500/30 transition-colors border border-blue-500/30"
              >
                Katalogga qaytish
              </button>
              <button
                onClick={() => window.location.reload()}
                className="bg-white/20 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/30 transition-colors border border-white/30"
              >
                Sahifani yangilash
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {/* Fixed background */}
      <div
        className="fixed inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('https://iili.io/KqAQo3g.jpg')" }}
      />
      <div className="fixed inset-0 bg-black/30" />

      {/* Back button */}
      <div className="relative z-10 p-4">
        <button
          onClick={() => onNavigate('catalog')}
          className="flex items-center gap-2 text-white hover:text-gray-300 transition-all duration-300 bg-white/10 backdrop-blur-xl px-4 py-2 rounded-xl border border-white/20 hover:border-blue-500/50 hover:bg-white/20"
        >
          <ArrowLeft className="h-5 w-5" />
          {t('product.back_to_catalog')}
        </button>
      </div>

      {/* Product content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Product Header */}
                  <div className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">{product.name}</h1>
                  </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Product Image - Left Column */}
            <div className="lg:col-span-1">
              <div className="aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 shadow-2xl hover:border-blue-500/50 transition-all duration-300">
                <ImageWithFallback
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>
            </div>

            {/* Product Details - Right Column */}
            <div className="lg:col-span-1 space-y-6">
              {/* Price Card */}
              <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm rounded-2xl p-6 border border-green-500/30 shadow-xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-green-500/30 border border-green-500/50 rounded-full p-2">
                    <Award className="h-5 w-5 text-green-300" />
                  </div>
                  <h3 className="text-xl font-bold text-white">{t('product.price')}</h3>
                </div>
                {product.price ? (
                  <div className="mb-2">
                    <p className="text-3xl font-bold text-green-300">
                      {product.price.toLocaleString()} {product.currency === 'USD' ? '$' : 'S'}
                    </p>
                    <p className="text-gray-300 text-sm">
                      {product.currency === 'USD' ? 'Dollar' : 'Sum'}
                    </p>
                  </div>
                ) : (
                  <p className="text-2xl font-bold text-green-300 mb-1">{t('product.ask_for_price')}</p>
                )}
                <p className="text-gray-300 text-sm">{t('product.contact_for_price')}</p>
              </div>

              {/* Add to Cart Section */}
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-xl hover:border-blue-500/50 transition-all duration-300">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Korzinkaga qo'shish
                </h3>
                
                {/* Quantity Selector */}
                <div className="mb-4">
                  <label className="block text-gray-300 font-medium mb-2">Miqdor:</label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
                    >
                      <Minus className="h-4 w-4 text-white" />
                    </button>
                    <span className="w-16 text-center text-white font-semibold">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
                    >
                      <Plus className="h-4 w-4 text-white" />
                    </button>
                  </div>
                </div>

                {/* Dimensions Selector */}
                <div className="mb-4">
                  <label className="block text-gray-300 font-medium mb-2">O'lcham:</label>
                  <select
                    value={selectedDimensions}
                    onChange={(e) => setSelectedDimensions(e.target.value)}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                  >
                    <option value="">Standart o'lcham</option>
                    <option value="2000x800">2000x800 mm</option>
                    <option value="2100x900">2100x900 mm</option>
                    <option value="2200x1000">2200x1000 mm</option>
                    <option value="custom">Boshqa o'lcham</option>
                  </select>
                  {selectedDimensions === 'custom' && (
                    <input
                      type="text"
                      value={customDimensions}
                      onChange={(e) => setCustomDimensions(e.target.value)}
                      placeholder="Masalan: 1900x750"
                      className="w-full mt-2 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-white/40"
                    />
                  )}
                </div>

                {/* Color Selector */}
                <div className="mb-6">
                  <label className="block text-gray-300 font-medium mb-2">Rang:</label>
                  <select
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                  >
                    <option value="">Standart rang</option>
                    <option value="oq">Oq</option>
                    <option value="qora">Qora</option>
                    <option value="kulrang">Kulrang</option>
                    <option value="jigarrang">Jigarrang</option>
                  </select>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={handleAddToCart}
                  className="w-full bg-gradient-to-r from-blue-500/30 to-purple-500/30 text-blue-300 py-3 px-6 rounded-xl font-semibold hover:from-blue-500/40 hover:to-purple-500/40 transition-all duration-300 flex items-center justify-center gap-2 border border-blue-500/50 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <ShoppingCart className="h-5 w-5" />
                  Korzinkaga qo'shish
                </button>
              </div>

              {/* Technical Specs */}
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-xl hover:border-blue-500/50 transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-blue-500/30 border border-blue-500/50 rounded-full p-2">
                    <Ruler className="h-5 w-5 text-blue-300" />
                  </div>
                  <h3 className="text-xl font-bold text-white">{t('product.technical_specs')}</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-white/10">
                    <span className="text-gray-300 font-medium">{t('product.material')}:</span>
                    <span className="text-white font-semibold">{product.material}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/10">
                    <span className="text-gray-300 font-medium">{t('product.security')}:</span>
                    <span className="text-white font-semibold">{product.security}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/10">
                    <span className="text-gray-300 font-medium">{t('product.dimensions')}:</span>
                    <span className="text-white font-semibold">{product.dimensions}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/10">
                    <span className="text-gray-300 font-medium">{t('product.thickness')}:</span>
                    <span className="text-white font-semibold">{product.thickness}mm</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/10">
                    <span className="text-gray-300 font-medium">{t('product.lock')}:</span>
                    <span className="text-white font-semibold">{product.lockStages}</span>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-purple-500/30 border border-purple-500/50 rounded-full p-2">
                    <Shield className="h-5 w-5 text-purple-300" />
                  </div>
                  <h3 className="text-xl font-bold text-white">{t('product.features')}</h3>
                </div>
                <ul className="space-y-2">
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-gray-300">{t('product.galvanized_body')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-gray-300">{t('product.heat_sound_insulation')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-gray-300">{t('product.uv_resistant_paint')}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
