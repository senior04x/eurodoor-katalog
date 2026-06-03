import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Home, ClipboardList, Phone } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
// import { notificationService } from '../lib/notificationService'; // Replaced with new system

interface OrderSuccessPageProps {
  orderNumber?: string;
  customerName?: string;
  customerPhone?: string;
  totalAmount?: number;
  onNavigate: (page: string) => void;
}

const OrderSuccessPage: React.FC<OrderSuccessPageProps> = ({
  orderNumber,
  customerName,
  customerPhone,
  totalAmount,
  onNavigate
}) => {
  const { t } = useLanguage();
  const [orderData, setOrderData] = useState({
    orderNumber: orderNumber || '',
    customerName: customerName || '',
    customerPhone: customerPhone || '',
    totalAmount: totalAmount || 0,
    products: [] as any[]
  });

  useEffect(() => {
    // Local storage dan buyurtma ma'lumotlarini olish
    const savedOrderData = localStorage.getItem('lastOrderData');
    if (savedOrderData) {
      const parsed = JSON.parse(savedOrderData);
      setOrderData(parsed);
    }
  }, []);

  const handleGoHome = () => {
    localStorage.removeItem('lastOrderData');
    onNavigate('home');
  };

  const handleViewDetails = () => {
    localStorage.removeItem('lastOrderData');
    localStorage.removeItem('pendingCheckout');
    onNavigate('orders');
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-auto">
      <div className="flex flex-col items-center justify-center min-h-screen p-4 pt-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl w-full"
        >
        {/* Success Card */}
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 text-center"
        >
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, duration: 0.5, type: "spring" }}
            className="flex justify-center mb-6"
          >
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
          </motion.div>

          {/* Success Message */}
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-3xl font-bold text-white mb-4"
          >
            {t('orderSuccess.title')}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-gray-200 text-lg mb-8"
          >
            {t('orderSuccess.subtitle')}
          </motion.p>

          {/* Order Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 mb-8 text-left border border-white/10"
          >
            <h3 className="text-xl font-semibold text-white mb-4 text-center">
              {t('orderSuccess.orderDetails')}
            </h3>
            
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 border-b border-white/20 gap-1 sm:gap-0">
                <span className="text-gray-300 font-medium text-sm sm:text-base">
                  {t('orderSuccess.orderNumber')}
                </span>
                <span className="text-white font-bold text-base sm:text-lg break-all">
                  {orderData.orderNumber}
                </span>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 border-b border-white/20 gap-1 sm:gap-0">
                <span className="text-gray-300 font-medium text-sm sm:text-base">
                  {t('orderSuccess.customerName')}
                </span>
                <span className="text-white font-semibold text-sm sm:text-base break-all">
                  {orderData.customerName}
                </span>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 border-b border-white/20 gap-1 sm:gap-0">
                <span className="text-gray-300 font-medium text-sm sm:text-base">
                  {t('orderSuccess.phone')}
                </span>
                <span className="text-white font-semibold text-sm sm:text-base break-all">
                  {orderData.customerPhone}
                </span>
              </div>

              {/* Product Images Stack (oysimon card) */}
              {orderData.products && orderData.products.length > 0 && (
                <div className="flex justify-center py-4 border-b border-white/20">
                  <div className="flex -space-x-4 hover:space-x-1 transition-all duration-300">
                    {orderData.products.slice(0, 5).map((prod: any, idx: number) => (
                      <div 
                        key={idx} 
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-[#1E1B4B] overflow-hidden shadow-lg relative group transition-transform duration-300 hover:-translate-y-2 hover:scale-110"
                        style={{ zIndex: 10 - idx }}
                      >
                        <img 
                          src={prod.image_url || prod.image || 'https://picsum.photos/100?random=1'} 
                          alt="product" 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                          <span className="text-white text-xs font-bold px-1 text-center">{prod.quantity || 1} ta</span>
                        </div>
                      </div>
                    ))}
                    {orderData.products.length > 5 && (
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-[#1E1B4B] overflow-hidden shadow-lg bg-white/10 backdrop-blur-md flex items-center justify-center text-white font-bold text-lg z-0">
                        +{orderData.products.length - 5}
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 gap-1 sm:gap-0">
                <span className="text-gray-300 font-medium text-sm sm:text-base">
                  {t('orderSuccess.totalAmount')}
                </span>
                <span className="text-green-400 font-bold text-lg sm:text-xl break-all">
                  {orderData.totalAmount.toLocaleString()} so'm
                </span>
              </div>
            </div>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="bg-blue-500/10 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-blue-400/20"
          >
            <div className="flex items-center justify-center mb-3">
              <Phone className="w-5 h-5 text-blue-400 mr-2" />
              <h4 className="text-lg font-semibold text-blue-300">
                {t('orderSuccess.contactInfo')}
              </h4>
            </div>
            <p className="text-blue-200 text-center">
              {t('orderSuccess.contactText')}
            </p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <button
              onClick={handleGoHome}
              className="flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-2xl font-semibold hover:bg-white/20 hover:border-white/30 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-105"
            >
              <Home className="w-5 h-5 mr-2" />
              {t('orderSuccess.goHome')}
            </button>
            
            <button
              onClick={handleViewDetails}
              className="flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 backdrop-blur-sm border border-blue-400/30 text-blue-300 rounded-2xl font-semibold hover:from-blue-500/30 hover:to-indigo-500/30 hover:border-blue-400/50 hover:text-blue-200 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-105"
            >
              <ClipboardList className="w-5 h-5 mr-2" />
              Tafsilotlar
            </button>
          </motion.div>
        </motion.div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="mt-8 text-center"
        >
          <p className="text-gray-300 text-sm">
            {t('orderSuccess.thankYou')}
          </p>
        </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;