import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../hooks/useLanguage';
import { CheckCircle, Package, User, Phone, MessageCircle, Calendar, ArrowLeft, Home } from 'lucide-react';

interface OrderSuccessPageProps {
  onNavigate: (page: string) => void;
}

export default function OrderSuccessPage({ onNavigate }: OrderSuccessPageProps) {
  const { t } = useLanguage();
  const [orderData, setOrderData] = useState<any>(null);

  useEffect(() => {
    // Scroll ni tepaga olib chiqish
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    
    // localStorage dan oxirgi zakazni olish
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    if (orders.length > 0) {
      setOrderData(orders[orders.length - 1]); // Oxirgi zakaz
    }
  }, []);

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('uz-UZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const pageVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    }
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  const stagger = {
    show: {
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  if (!orderData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Zakaz topilmadi</h1>
          <button
            onClick={() => onNavigate('catalog')}
            className="bg-white/20 backdrop-blur-xl text-white px-6 py-3 rounded-xl hover:bg-white/30 transition-all duration-300"
          >
            Katalogga qaytish
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {/* Background */}
      <div
        className="fixed inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('https://iili.io/KqAQo3g.jpg')" }}
      />
      <div className="fixed inset-0 bg-black/30" />

      <motion.main
        variants={pageVariants}
        initial="hidden"
        animate="show"
        className="relative z-10 py-8"
      >
        <div className="container mx-auto px-4 max-w-2xl">
          {/* Success Header */}
          <motion.div
            variants={fadeUp}
            className="text-center mb-8"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 20 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 rounded-full mb-6 border-2 border-green-500/30"
            >
              <CheckCircle className="h-12 w-12 text-green-400" />
            </motion.div>
            
            <h1 className="text-4xl font-bold text-white mb-4">
              {t('order.success_title')}
            </h1>
            <p className="text-lg text-gray-300">
              {t('order.success_message')}
            </p>
          </motion.div>

          {/* Receipt Card */}
          <motion.div
            variants={fadeUp}
            className="bg-white/10 backdrop-blur-xl backdrop-saturate-150 rounded-3xl p-8 border border-white/20 shadow-2xl mb-8"
          >
            {/* Receipt Header */}
            <div className="text-center mb-8 pb-6 border-b border-white/20">
              <h2 className="text-2xl font-bold text-white mb-2">EURODOOR</h2>
              <p className="text-gray-300">Zakaz kvitansiyasi</p>
              <p className="text-sm text-gray-400 mt-2">#{orderData.id.substring(0, 8)}</p>
            </div>

            <motion.div variants={stagger} className="space-y-6">
              {/* Order Info */}
              <div className="bg-white/5 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-400" />
                  {t('order.order_info')}
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-300">{t('order.order_id')}:</span>
                    <span className="text-white font-mono">#{orderData.id.substring(0, 8)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">{t('order.order_date')}:</span>
                    <span className="text-white">{formatTimestamp(orderData.timestamp)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">{t('order.status')}:</span>
                    <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm font-semibold">
                      {t('order.status_new')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div className="bg-white/5 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <User className="h-5 w-5 text-purple-400" />
                  {t('order.customer_info')}
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-300">{t('order.customer_name')}:</span>
                    <span className="text-white font-semibold">{orderData.customer.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">{t('order.customer_phone')}:</span>
                    <span className="text-white font-mono">{orderData.customer.phone}</span>
                  </div>
                  {orderData.customer.message && (
                    <div className="mt-4">
                      <span className="text-gray-300 block mb-2">{t('order.customer_message')}:</span>
                      <p className="text-white bg-white/10 rounded-lg p-3 text-sm">
                        {orderData.customer.message}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Product Info */}
              <div className="bg-white/5 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Package className="h-5 w-5 text-orange-400" />
                  {t('order.product_info')}
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-300">{t('order.product_name')}:</span>
                    <span className="text-white font-semibold">{orderData.product.name}</span>
                  </div>
                  {orderData.product.material && (
                    <div className="flex justify-between">
                      <span className="text-gray-300">{t('order.product_material')}:</span>
                      <span className="text-white">{orderData.product.material}</span>
                    </div>
                  )}
                  {orderData.product.security && (
                    <div className="flex justify-between">
                      <span className="text-gray-300">{t('order.product_security')}:</span>
                      <span className="text-white">{orderData.product.security}</span>
                    </div>
                  )}
                  {orderData.product.dimensions && (
                    <div className="flex justify-between">
                      <span className="text-gray-300">{t('order.product_dimensions')}:</span>
                      <span className="text-white">{orderData.product.dimensions}</span>
                    </div>
                  )}
                  {orderData.product.price && (
                    <div className="flex justify-between">
                      <span className="text-gray-300">{t('order.product_price')}:</span>
                      <span className="text-white font-semibold">{orderData.product.price}</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Receipt Footer */}
            <div className="mt-8 pt-6 border-t border-white/20 text-center">
              <p className="text-gray-400 text-sm mb-2">
                {t('order.thank_you')}
              </p>
              <p className="text-gray-500 text-xs">
                {t('order.contact_soon')}
              </p>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            variants={fadeUp}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <button
              onClick={() => onNavigate('catalog')}
              className="bg-white/20 backdrop-blur-xl text-white px-8 py-4 rounded-xl hover:bg-white/30 transition-all duration-300 flex items-center justify-center gap-3 border border-white/30 shadow-lg hover:shadow-xl"
            >
              <Package className="h-5 w-5" />
              <span className="font-semibold">{t('order.back_to_catalog')}</span>
            </button>
            
            <button
              onClick={() => onNavigate('home')}
              className="bg-white/10 backdrop-blur-xl text-white px-8 py-4 rounded-xl hover:bg-white/20 transition-all duration-300 flex items-center justify-center gap-3 border border-white/20 shadow-lg hover:shadow-xl"
            >
              <Home className="h-5 w-5" />
              <span className="font-semibold">{t('order.back_to_home')}</span>
            </button>
          </motion.div>
        </div>
      </motion.main>
    </div>
  );
}
