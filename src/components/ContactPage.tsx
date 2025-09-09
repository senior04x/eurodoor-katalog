import React, { useState, useEffect } from 'react';
import { Phone, MessageCircle, Instagram, MapPin, Clock, Mail, Package, ArrowLeft } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { motion, useReducedMotion } from 'framer-motion';
import { useLanguage } from '../hooks/useLanguage';
import { ordersApi } from '../lib/supabase';

interface ContactPageProps {
  onNavigate?: (page: string, productId?: string) => void;
}

export default function ContactPage({ onNavigate }: ContactPageProps) {
  const prefersReduced = useReducedMotion();
  const { t } = useLanguage();
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  // localStorage dan selected product ni o'qish
  useEffect(() => {
    const savedProduct = localStorage.getItem('selectedProduct');
    if (savedProduct) {
      try {
        const product = JSON.parse(savedProduct);
        setSelectedProduct(product);
        // Form data ga product nomini qo'shish
        setFormData(prev => ({
          ...prev,
          product: product.name
        }));
        // localStorage ni tozalash - faqat form submit qilinganda
        // localStorage.removeItem('selectedProduct');
      } catch (error) {
        console.error('Error parsing selected product:', error);
      }
    }
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    product: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Zakaz ma'lumotlarini yaratish
    const order = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      customer: {
        name: formData.name,
        phone: formData.phone,
        message: formData.message
      },
      product: selectedProduct ? {
        id: selectedProduct.id,
        name: selectedProduct.name,
        material: selectedProduct.material,
        security: selectedProduct.security,
        dimensions: selectedProduct.dimensions,
        price: selectedProduct.price
      } : {
        name: formData.product
      },
      status: 'new'
    };
    
    try {
      // Supabase backend ga zakaz yuborish
      console.log('Sending order to Supabase backend:', order);
      const savedOrder = await ordersApi.createOrder(order);
      
      if (savedOrder) {
        // Muvaffaqiyatli saqlangan
        console.log('✅ Order saved to Supabase backend:', savedOrder);
        
        // Form ma'lumotlarini tozalash
        setFormData({ name: '', phone: '', product: '', message: '' });
        setSelectedProduct(null);
        localStorage.removeItem('selectedProduct');
        
        // Order success sahifasiga yo'naltirish
        if (onNavigate) {
          onNavigate('order-success');
          window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
        }
      }
    } catch (error) {
      console.error('❌ Error saving order to backend:', error);
      alert('Xatolik yuz berdi! Iltimos, qaytadan urinib ko\'ring.');
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleBackToProduct = () => {
    if (selectedProduct && onNavigate) {
      // Product detail page ga qaytish
      onNavigate('product', selectedProduct.id);
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    } else if (onNavigate) {
      // Agar product yo'q bo'lsa, catalog ga qaytish
      onNavigate('catalog');
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }
  };

  // ---- Umumiy (ota) variant: hammasini bir vaqtda boshqaradi
  const pageVariants = {
    hidden: {},
    show: {
      transition: prefersReduced ? {} : {
        // bolalar bir vaqtda boshlaydi (stagger yo‘q)
        when: 'beforeChildren',
      }
    }
  };

  // ---- Bolalar uchun fade + pastdan ko‘tarilish (hammasida bir xil)
  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    show: {
      opacity: 1,
      y: 0,
      transition: prefersReduced
        ? { duration: 0 }
        : { duration: 0.9, ease: 'easeOut' }
    }
  };

  const cardClass =
    "w-full bg-white/10 backdrop-blur-xl backdrop-saturate-150 rounded-2xl p-6 py-16 shadow-2xl border border-white/20 transform-gpu will-change-transform";

  return (
    <div className="relative min-h-screen">
      {/* Fixed background */}
      <div
        className="fixed inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('https://iili.io/KqAQo3g.jpg')" }}
      />
      <div className="fixed inset-0 bg-black/30" />


      {/* OTA KONTROL: barcha sectionlar sinxron chiqadi */}
      <motion.main
        variants={pageVariants}
        initial="hidden"
        animate="show"
        className="relative"
      >
        {/* Header (bola) - only show when no product selected */}
        {!selectedProduct && (
          <motion.section
            variants={fadeUp}
            className="bg-white/10 backdrop-blur-xl backdrop-saturate-150 rounded-2xl mx-4 py-16 shadow-2xl border border-white/20 mb-0 transform-gpu will-change-transform"
          >
            <div className="container mx-auto px-4">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-white mb-4">
                  {t('contact.title')}
                </h1>
                <p className="text-lg text-white/90 max-w-2xl mx-auto">
                  {t('contact.description')}
                </p>
              </div>
            </div>
          </motion.section>
        )}

        {/* Back Button - faqat product tanlangan bo'lsa ko'rinadi */}
        {selectedProduct && onNavigate && (
          <motion.section
            variants={fadeUp}
            className="py-4"
          >
            <div className="container mx-auto px-4">
              <button
                onClick={handleBackToProduct}
                className="bg-white/20 backdrop-blur-xl text-white px-6 py-3 rounded-xl hover:bg-white/30 transition-all duration-300 flex items-center gap-3 border border-white/30 shadow-lg hover:shadow-xl"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="font-medium">{t('contact.back_to_product')}</span>
              </button>
            </div>
          </motion.section>
        )}

        {/* Selected Product Info */}
        {selectedProduct && (
          <section className="py-8">
            <div className="container mx-auto px-4">
              <div className="bg-white/5 backdrop-blur-xl backdrop-saturate-150 rounded-2xl p-6 border border-white/20 shadow-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="h-5 w-5 text-white" />
                      <h4 className="font-semibold text-white">{selectedProduct.name}</h4>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-300">{t('contact.product_material')}:</span>
                        <span className="text-white">{selectedProduct.material}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">{t('contact.product_security')}:</span>
                        <span className="text-white">{selectedProduct.security}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">{t('contact.product_dimensions')}:</span>
                        <span className="text-white">{selectedProduct.dimensions}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">{t('contact.product_price')}:</span>
                        <span className="text-white font-semibold">{selectedProduct.price}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Main grid (bola) */}
        <motion.div
          variants={fadeUp}
          className="py-12 mt-0 transform-gpu will-change-transform"
        >
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <motion.div variants={fadeUp} className={cardClass}>
                <h2 className="text-2xl font-bold text-white mb-6">
                  {selectedProduct ? t('contact.order_form') : t('contact.contact_form')}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <input
                      type="text"
                      placeholder={t('contact.name_placeholder')}
                      value={formData.name}
                      onChange={(e) => handleChange(e)}
                      name="name"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:border-white/40 transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="tel"
                      placeholder={t('contact.phone_placeholder')}
                      value={formData.phone}
                      onChange={(e) => handleChange(e)}
                      name="phone"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:border-white/40 transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder={t('contact.product_placeholder')}
                      value={formData.product}
                      onChange={(e) => handleChange(e)}
                      name="product"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:border-white/40 transition-colors"
                    />
                  </div>
                  <div>
                    <textarea
                      placeholder={t('contact.message_placeholder')}
                      value={formData.message}
                      onChange={(e) => handleChange(e)}
                      name="message"
                      rows={4}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:border-[#E32C27] transition-colors resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-white/20 text-white py-3 px-6 rounded-lg font-semibold hover:bg-white/30 transition-colors duration-300 flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="h-5 w-5" />
                    {selectedProduct ? t('contact.order_button') : t('contact.send_button')}
                  </button>
                </form>
              </motion.div>

              {/* Contact Information */}
              <motion.div variants={fadeUp} className={cardClass}>
                <h2 className="text-2xl font-bold text-white mb-6">{t('contact.contact_info')}</h2>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#D4AF37]/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Phone className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">{t('contact.phone')}</h3>
                          <a href="tel:+998901234567" className="text-white hover:underline">
                              +998 90 123 45 67
                            </a> <br />
                          <a href="tel:+998912345678" className="text-white hover:underline">
                              +998 91 234 56 78
                            </a>

                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#D4AF37]/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">{t('contact.telegram')}</h3>
                     <a
                       href="https://t.me/eurodoor_uz"
                       target="_blank"
                       rel="noopener noreferrer"
                       className="text-white hover:underline"
                     >
                       @eurodoor_uz
                     </a>

                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#D4AF37]/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Instagram className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">{t('contact.instagram')}</h3>
                       <a
                         href="https://instagram.com/eurodoor.uz"
                         target="_blank"
                         rel="noopener noreferrer"
                         className="text-white hover:underline"
                       >
                             @eurodoor.uz
                       </a>

                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#D4AF37]/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Mail className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">{t('contact.email')}</h3>
                      <p className="text-white">info@eurodoor.uz</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#D4AF37]/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">{t('contact.address')}</h3>
                      <p className="text-white" dangerouslySetInnerHTML={{ __html: t('contact.address_detail') }}>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#D4AF37]/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Clock className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">{t('contact.working_hours')}</h3>
                      <p className="text-white">
                        Dushanba - Shanba: 9:00 - 19:00 <br />
                        Yakshanba: 10:00 - 17:00
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Map */}
              <motion.div variants={fadeUp} className={cardClass}>
  <h3 className="text-xl font-semibold text-white mb-4">{t('contact.our_location')}</h3>
  <div className="rounded-lg overflow-hidden h-64 lg:h-[500px] flex items-center justify-center">
    <div style={{ position: "relative", overflow: "hidden", width: "100%", height: "100%" }}>
      <a
        href="https://yandex.uz/maps/org/204432436811/?utm_medium=mapframe&utm_source=maps"
        style={{
          color: "#eee",
          fontSize: "12px",
          position: "absolute",
          top: 0,
          left: 0,
        }}
        target="_blank"
        rel="noopener noreferrer"
      >
        Eurodoor.Uz
      </a>
      <a
        href="https://yandex.uz/maps/10335/tashkent/category/doors/184107677/?utm_medium=mapframe&utm_source=maps"
        style={{
          color: "#eee",
          fontSize: "12px",
          position: "absolute",
          top: "14px",
          left: 0,
        }}
        target="_blank"
        rel="noopener noreferrer"
      >
        {t('contact.doors_tashkent')}
      </a>
      <iframe
        src="https://yandex.uz/map-widget/v1/?ll=69.194934%2C41.250800&mode=search&oid=204432436811&ol=biz&z=17.75"
        width="100%"
        height="100%"
        style={{ position: "relative", border: 0 }}
        frameBorder={1}
        allowFullScreen
        title="Yandex Maps"
      />
    </div>
  </div>
</motion.div>

            </div>
          </div>
        </motion.div>

        {/* Services (bola) */}
        <motion.section
          variants={fadeUp}
          className="py-16 bg-white/10 backdrop-blur-xl backdrop-saturate-150 rounded-2xl mx-4 shadow-2xl border border-white/20 mb-16 transform-gpu will-change-transform"
        >
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-2">{t('contact.our_services')}</h2>
              <p className="text-gray-300">{t('contact.services_desc')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{t('contact.free_consultation')}</h3>
                <p className="text-gray-300">
                  {t('contact.free_consultation_desc')}
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{t('contact.free_measurement')}</h3>
                <p className="text-gray-300">
                  {t('contact.free_measurement_desc')}
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{t('contact.fast_installation')}</h3>
                <p className="text-gray-300">
                  {t('contact.fast_installation_desc')}
                </p>
              </div>
            </div>
          </div>
        </motion.section>
      </motion.main>
    </div>
  );
}
