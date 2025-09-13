import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Home, ShoppingBag, Phone, Bell } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { notificationService } from '../lib/notificationService';
import { testNotificationSystem } from '../lib/notificationTest';

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
    totalAmount: totalAmount || 0
  });

  useEffect(() => {
    // Local storage dan buyurtma ma'lumotlarini olish
    const savedOrderData = localStorage.getItem('lastOrderData');
    if (savedOrderData) {
      const parsed = JSON.parse(savedOrderData);
      setOrderData(parsed);
    }
  }, []);

  // Notification permission holatini tekshirish
  const [notificationStatus, setNotificationStatus] = useState<'checking' | 'granted' | 'denied'>('checking');

  useEffect(() => {
    const checkNotificationStatus = () => {
      const status = notificationService.getPermissionStatus();
      setNotificationStatus(status === 'granted' ? 'granted' : 'denied');
    };

    checkNotificationStatus();
  }, []);

  // Notification permission so'rash
  const requestNotificationPermission = async () => {
    try {
      const hasPermission = await notificationService.requestPermission();
      setNotificationStatus(hasPermission ? 'granted' : 'denied');
      
      if (hasPermission) {
        // Agar permission berilgan bo'lsa, order status ni kuzatishni boshlash
        await notificationService.watchOrderStatus(orderData.orderNumber, orderData.customerPhone);
        console.log('🔔 Order status watching started from success page');
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  // Manual notification test
  const testNotification = async () => {
    try {
      if (notificationStatus !== 'granted') {
        console.log('❌ Notification permission not granted');
        return;
      }

      // Test order status change
      const testResult = await testNotificationSystem.testOrderStatusChange(
        orderData.orderNumber, 
        'confirmed'
      );

      if (testResult.success) {
        console.log('✅ Test order status change successful');
      } else {
        console.error('❌ Test order status change failed:', testResult.error);
      }

      await notificationService.showNotification({
        title: '✅ Test Notification',
        body: `Test notification for order ${orderData.orderNumber}. If you see this, notifications are working!`,
        tag: `test-${orderData.orderNumber}`,
        data: { orderNumber: orderData.orderNumber }
      });
      
      console.log('✅ Test notification sent');
    } catch (error) {
      console.error('Error sending test notification:', error);
    }
  };

  const handleGoHome = () => {
    localStorage.removeItem('lastOrderData');
    onNavigate('home');
  };

  const handleNewOrder = () => {
    localStorage.removeItem('lastOrderData');
    onNavigate('catalog');
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
              <div className="flex justify-between items-center py-2 border-b border-white/20">
                <span className="text-gray-300 font-medium">
                  {t('orderSuccess.orderNumber')}
                </span>
                <span className="text-white font-bold text-lg">
                  {orderData.orderNumber}
                </span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-white/20">
                <span className="text-gray-300 font-medium">
                  {t('orderSuccess.customerName')}
                </span>
                <span className="text-white font-semibold">
                  {orderData.customerName}
                </span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-white/20">
                <span className="text-gray-300 font-medium">
                  {t('orderSuccess.phone')}
                </span>
                <span className="text-white font-semibold">
                  {orderData.customerPhone}
                </span>
              </div>
              
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-300 font-medium">
                  {t('orderSuccess.totalAmount')}
                </span>
                <span className="text-green-400 font-bold text-xl">
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

          {/* Notification Settings */}
          {notificationStatus !== 'granted' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.95 }}
              className="bg-yellow-500/10 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-yellow-400/20"
            >
              <div className="flex items-center justify-center mb-3">
                <Bell className="w-5 h-5 text-yellow-400 mr-2" />
                <h4 className="text-lg font-semibold text-yellow-300">
                  {t('orderSuccess.notificationTitle')}
                </h4>
              </div>
              <p className="text-yellow-200 text-center mb-4">
                {t('orderSuccess.notificationText')}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={requestNotificationPermission}
                  className="flex-1 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-200 font-semibold py-3 px-6 rounded-xl border border-yellow-400/30 transition-all duration-300 hover:scale-105"
                >
                  {t('orderSuccess.enableNotifications')}
                </button>
                <button
                  onClick={testNotification}
                  className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 font-semibold py-3 px-4 rounded-xl border border-blue-400/30 transition-all duration-300 hover:scale-105"
                  title="Test notification"
                >
                  🧪
                </button>
              </div>
            </motion.div>
          )}

          {notificationStatus === 'granted' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.95 }}
              className="bg-green-500/10 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-green-400/20"
            >
              <div className="flex items-center justify-center mb-3">
                <Bell className="w-5 h-5 text-green-400 mr-2" />
                <h4 className="text-lg font-semibold text-green-300">
                  {t('orderSuccess.notificationsEnabled')}
                </h4>
              </div>
              <p className="text-green-200 text-center">
                {t('orderSuccess.notificationsEnabledText')}
              </p>
            </motion.div>
          )}

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
              onClick={handleNewOrder}
              className="flex items-center justify-center px-8 py-4 bg-gradient-to-r from-emerald-500/20 to-green-500/20 backdrop-blur-sm border border-emerald-400/30 text-emerald-300 rounded-2xl font-semibold hover:from-emerald-500/30 hover:to-green-500/30 hover:border-emerald-400/50 hover:text-emerald-200 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-105"
            >
              <ShoppingBag className="w-5 h-5 mr-2" />
              {t('orderSuccess.newOrder')}
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