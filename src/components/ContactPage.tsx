import React, { useState, useEffect } from 'react';
import { Phone, MessageCircle, Instagram, MapPin, Clock, Mail, Package, ArrowLeft, ShoppingCart } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { motion, useReducedMotion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { ordersApi } from '../lib/ordersApi';
import { customersApi } from '../lib/customersApi';
import { notificationService } from '../lib/notificationService';

interface ContactPageProps {
  onNavigate?: (page: string, productId?: string) => void;
}

export default function ContactPage({ onNavigate }: ContactPageProps): JSX.Element {
  const prefersReduced = useReducedMotion();
  const { t } = useLanguage();
  const { items: cartItems, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);


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
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    product: '',
    message: '',
    delivery_address: ''
  });

  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');

  // Notification permission so'rash
  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        // Service Worker ni register qilish
        await notificationService.registerServiceWorker();
        
        // Notification permission so'rash
        const hasPermission = await notificationService.requestPermission();
        
        if (hasPermission) {
          console.log('✅ Notification permission granted');
        } else {
          console.log('❌ Notification permission denied');
        }
      } catch (error) {
        console.error('Error initializing notifications:', error);
      }
    };

    initializeNotifications();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Customer yaratish yoki olish
      const customer = await customersApi.upsertCustomer({
        name: formData.name,
        phone: formData.phone,
        email: formData.email
      });

      // Buyurtma yaratish
      const order = await ordersApi.createOrder({
        customer_name: formData.name,
        customer_phone: formData.phone,
        customer_email: formData.email,
        delivery_address: formData.delivery_address,
        notes: formData.message,
        total_amount: cartItems.length > 0 ? totalPrice : (selectedProduct?.price || 0),
        products: cartItems.length > 0 ? cartItems : (selectedProduct ? [{
          name: selectedProduct.name,
          price: selectedProduct.price,
          quantity: 1,
          image: selectedProduct.image,
          dimensions: selectedProduct.dimensions,
          color: selectedProduct.color,
          material: selectedProduct.material
        }] : [])
      });

      if (order) {
        // Buyurtma ma'lumotlarini localStorage ga saqlash
        const orderData = {
          orderNumber: order.order_number,
          customerName: formData.name,
          customerPhone: formData.phone,
          totalAmount: cartItems.length > 0 ? totalPrice : (selectedProduct?.price || 0)
        };
        localStorage.setItem('lastOrderData', JSON.stringify(orderData));
        
        // Notification service ni ishga tushirish
        try {
          await notificationService.watchOrderStatus(order.order_number, formData.phone);
          console.log('🔔 Order status watching started for:', order.order_number);
        } catch (error) {
          console.error('Error starting order status watching:', error);
        }
        
        // Form va cart ni tozalash
        setFormData({
          name: user?.name || '',
          phone: user?.phone || '',
          email: user?.email || '',
          product: '',
          message: '',
          delivery_address: ''
        });
        clearCart();
        setSelectedProduct(null);
        localStorage.removeItem('selectedProduct');
        
        // Order success sahifasiga o'tish
        if (onNavigate) {
          onNavigate('order-success');
        }
      }
    } catch (error) {
      console.error('❌ Error submitting order:', error);
      showError('Xatolik yuz berdi!', 'Buyurtma yuborishda xatolik yuz berdi. Qaytadan urinib ko\'ring.');
    } finally {
      setIsSubmitting(false);
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
      onNavigate('product', selectedProduct.id);
    } else if (onNavigate) {
      onNavigate('catalog');
    }
  };

  // Animation variants
  const pageVariants = {
    hidden: {},
    show: {
      transition: prefersReduced ? {} : {
        when: 'beforeChildren',
      }
    }
  };

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

  return (
    <div className="relative min-h-screen">
      {/* Fixed background */}
      <div
        className="fixed inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('https://iili.io/KqAQo3g.jpg')" }}
      />
      <div className="fixed inset-0 bg-black/30" />


      <motion.main
        variants={pageVariants}
        initial="hidden"
        animate="show"
        className="relative"
      >
        {/* Header */}
        {!selectedProduct && (
          <motion.section
            variants={fadeUp}
            className="bg-white/10 backdrop-blur-xl rounded-2xl mx-4 py-16 shadow-2xl border border-white/20 mb-0"
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

        {/* Back Button */}
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

        {/* Cart Items or Selected Product Info */}
        {(cartItems.length > 0 || selectedProduct) && (
          <section className="py-8">
            <div className="container mx-auto px-4">
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-2xl">
                <div className="flex items-center gap-2 mb-4">
                  <ShoppingCart className="h-5 w-5 text-white" />
                  <h4 className="font-semibold text-white">
                    {cartItems.length > 0 ? `${t('contact.cart_items')} (${cartItems.length})` : t('contact.selected_product')}
                  </h4>
                </div>
                
                {cartItems.length > 0 ? (
                  <div className="space-y-4">
                    {cartItems.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-12 h-12 object-cover rounded-md"
                          />
                          <div>
                            <p className="text-white font-medium">{item.name}</p>
                            <p className="text-gray-300 text-sm">
                              {item.dimensions && `${t('contact.dimensions')}: ${item.dimensions}`}
                              {item.color && ` | ${t('contact.color')}: ${item.color}`}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-semibold">
                            {item.price.toLocaleString()} UZS
                          </p>
                          <p className="text-gray-300 text-sm">{t('contact.quantity')}: {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                    <div className="border-t border-white/20 pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-white">{t('contact.total')}:</span>
                        <span className="text-xl font-bold text-blue-400">
                          {totalPrice.toLocaleString()} UZS
                        </span>
                      </div>
                    </div>
                  </div>
                ) : selectedProduct ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Package className="h-5 w-5 text-white" />
                        <h4 className="font-semibold text-white">{selectedProduct.name}</h4>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-300">{t('contact.material')}:</span>
                          <span className="text-white">{selectedProduct.material}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">{t('contact.security')}:</span>
                          <span className="text-white">{selectedProduct.security}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">{t('contact.dimensions')}:</span>
                          <span className="text-white">{selectedProduct.dimensions}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">{t('contact.price')}:</span>
                          <span className="text-white font-semibold">{selectedProduct.price}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </section>
        )}

        {/* Main grid */}
        <motion.div
          variants={fadeUp}
          className="py-12 mt-0"
        >
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <motion.div variants={fadeUp} className="w-full bg-white/10 backdrop-blur-xl rounded-2xl p-6 py-16 shadow-2xl border border-white/20">
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
                      type="email"
                      placeholder={t('contact.email_placeholder')}
                      value={formData.email}
                      onChange={(e) => handleChange(e)}
                      name="email"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:border-white/40 transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder={t('contact.delivery_address_placeholder')}
                      value={formData.delivery_address}
                      onChange={(e) => handleChange(e)}
                      name="delivery_address"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:border-white/40 transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <textarea
                      placeholder={t('contact.message_placeholder')}
                      value={formData.message}
                      onChange={(e) => handleChange(e)}
                      name="message"
                      rows={4}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:border-white/40 transition-colors resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-white/20 text-white py-3 px-6 rounded-lg font-semibold hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300 flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="h-5 w-5" />
                    {isSubmitting ? t('contact.sending') : (cartItems.length > 0 ? t('contact.place_order') : selectedProduct ? t('contact.place_order') : t('contact.send_message'))}
                  </button>
                </form>
              </motion.div>

              {/* Contact Information */}
              <motion.div variants={fadeUp} className="w-full bg-white/10 backdrop-blur-xl rounded-2xl p-6 py-16 shadow-2xl border border-white/20">
                <h2 className="text-2xl font-bold text-white mb-6">{t('contact.contact_info')}</h2>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
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
                    <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
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
                        {t('contact.telegram_handle')}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
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
                        {t('contact.instagram_handle')}
                      </a>

                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Mail className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">{t('contact.email')}</h3>
                      <p className="text-white">{t('contact.email_address')}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">{t('contact.our_location')}</h3>
                      <p className="text-white">
                        {t('contact.address_detail')}, <br />
                        {t('contact.address_street')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Clock className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">{t('contact.working_hours')}</h3>
                      <p className="text-white">
                        {t('contact.working_hours_weekdays')} <br />
                        {t('contact.working_hours_weekend')}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </motion.main>
    </div>
  );
}
