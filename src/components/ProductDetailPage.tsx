import React, { useState, useEffect } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ArrowLeft, Shield, Ruler, Award, Phone, Package } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { productsApi } from '../lib/productsApi';

interface ProductDetailPageProps {
  productId: string;
  onNavigate: (page: string) => void;
}

export default function ProductDetailPage({ productId, onNavigate }: ProductDetailPageProps) {
  const { t } = useLanguage();
  
  // Faqat Supabase dan mahsulot olish
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        console.log('🔍 ProductDetailPage: Loading product with ID:', productId);
        const products = await productsApi.getAllProducts();
        console.log('🔍 ProductDetailPage: All products:', products);
        const foundProduct = products.find((p: any) => p.id === productId);
        console.log('🔍 ProductDetailPage: Found product:', foundProduct);
        
        if (foundProduct) {
          setProduct({
            name: foundProduct.name,
            model: foundProduct.name.split(' ')[1] || 'Custom',
            image: foundProduct.image,
            material: foundProduct.material,
            security: foundProduct.security,
            dimensions: foundProduct.dimensions,
            price: "Narx so'rang",
            description: foundProduct.description,
            features: [
              t('product.galvanized_corpus'),
              t('product.inner_mdf_panel'),
              t('product.three_point_lock'),
              t('product.heat_sound_insulation'),
              t('product.uv_resistant_paint')
            ],
            specifications: [
              { label: t('product.material'), value: foundProduct.material },
              { label: t('product.thickness'), value: "≈100mm" },
              { label: t('product.lock'), value: "3-nuqtali" },
              { label: t('product.hinges'), value: "4 ta" },
              { label: t('product.insulation'), value: "Mineral paxta" },
              { label: t('product.warranty'), value: "5 yil" }
            ]
          });
        } else {
          setProduct(null);
        }
      } catch (error) {
        console.error('Error loading product:', error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [productId, t]);

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
                Yuklanmoqda...
              </h1>
              <p className="text-gray-300 text-lg max-w-md mx-auto">
                Mahsulot ma'lumotlari yuklanmoqda
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
                Mahsulot topilmadi
              </h1>
              <p className="text-gray-300 text-lg max-w-md mx-auto">
                Bu mahsulot mavjud emas yoki o'chirilgan bo'lishi mumkin
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
          className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          {t('product.back_to_catalog')}
        </button>
      </div>

      {/* Product content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Product image */}
            <div className="space-y-4">
              <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-white/10 backdrop-blur-sm border border-white/20">
                <ImageWithFallback
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Product details */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">{product.name}</h1>
                <p className="text-gray-300 text-lg">{product.description}</p>
              </div>

              {/* Price */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-green-500/20 border border-green-500/30 rounded-full p-2">
                    <Award className="h-5 w-5 text-green-300" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">Narx</h3>
                </div>
                <p className="text-2xl font-bold text-green-300">{product.price}</p>
              </div>

              {/* Specifications */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-blue-500/20 border border-blue-500/30 rounded-full p-2">
                    <Ruler className="h-5 w-5 text-blue-300" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">Texnik xususiyatlar</h3>
                </div>
                <div className="space-y-3">
                  {product.specifications.map((spec, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-gray-300">{spec.label}:</span>
                      <span className="text-white font-medium">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Features */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-purple-500/20 border border-purple-500/30 rounded-full p-2">
                    <Shield className="h-5 w-5 text-purple-300" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">Xususiyatlar</h3>
                </div>
                <ul className="space-y-2">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-white/60 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Contact button */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-white mb-4">
                    Mahsulot haqida batafsil ma'lumot
                  </h3>
                  <p className="text-gray-300 mb-6">
                    Bu mahsulot haqida batafsil ma'lumot olish uchun biz bilan bog'laning
                  </p>
                  <button
                    onClick={() => onNavigate('contact')}
                    className="w-full bg-blue-500/20 text-blue-300 py-4 px-6 rounded-xl font-semibold hover:bg-blue-500/30 transition-colors border border-blue-500/30 flex items-center justify-center gap-2"
                  >
                    <Phone className="h-5 w-5" />
                    Bog'lanish
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}