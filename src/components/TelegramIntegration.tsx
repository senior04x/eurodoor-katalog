import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, CheckCircle, XCircle, Loader } from 'lucide-react';
import { adminTelegramService } from '../lib/adminTelegramService';

interface TelegramIntegrationProps {
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  currentStatus: string;
  totalAmount?: number;
  deliveryAddress?: string;
  products?: any[];
  onStatusChange?: (newStatus: string) => void;
}

const TelegramIntegration: React.FC<TelegramIntegrationProps> = ({
  orderId,
  orderNumber,
  customerName,
  customerPhone,
  currentStatus,
  totalAmount,
  deliveryAddress,
  products,
  onStatusChange
}) => {
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const statusOptions = [
    { value: 'pending', label: 'Kutilmoqda', emoji: '⏳' },
    { value: 'confirmed', label: 'Tasdiqlandi', emoji: '✅' },
    { value: 'processing', label: 'Tayyorlanmoqda', emoji: '🔄' },
    { value: 'ready', label: 'Tayyor', emoji: '📦' },
    { value: 'shipped', label: 'Yuborildi', emoji: '🚚' },
    { value: 'delivered', label: 'Yetkazib berildi', emoji: '🎉' },
    { value: 'cancelled', label: 'Bekor qilindi', emoji: '❌' }
  ];

  const handleStatusChange = async () => {
    if (selectedStatus === currentStatus) {
      setError('Holat o\'zgarishsiz qoldi');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const result = await adminTelegramService.triggerOrderStatusNotification({
        order_id: orderId,
        status: selectedStatus,
        customer_id: orderId, // Assuming orderId can be used as customer_id
        order_number: orderNumber,
        customer_name: customerName,
        customer_phone: customerPhone,
        total_amount: totalAmount,
        delivery_address: deliveryAddress,
        products: products
      });

      if (result.success) {
        setMessage('✅ Telegram xabari muvaffaqiyatli yuborildi!');
        onStatusChange?.(selectedStatus);
      } else {
        setError(`❌ Xatolik: ${result.error}`);
      }
    } catch (err: any) {
      setError(`❌ Kutilmagan xatolik: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-800 to-gray-900 rounded-xl p-6 border border-white/20">
      <div className="flex items-center gap-3 mb-6">
        <MessageSquare className="w-6 h-6 text-blue-400" />
        <h3 className="text-xl font-bold text-white">Telegram Integration</h3>
      </div>

      <div className="space-y-4">
        {/* Order Info */}
        <div className="bg-white/5 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-300 mb-2">Buyurtma Ma'lumotlari</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-400">Raqam:</span>
              <span className="text-white ml-2">{orderNumber}</span>
            </div>
            <div>
              <span className="text-gray-400">Mijoz:</span>
              <span className="text-white ml-2">{customerName}</span>
            </div>
            <div>
              <span className="text-gray-400">Telefon:</span>
              <span className="text-white ml-2">{customerPhone}</span>
            </div>
            <div>
              <span className="text-gray-400">Jami:</span>
              <span className="text-white ml-2">{totalAmount?.toLocaleString()} so'm</span>
            </div>
          </div>
        </div>

        {/* Status Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Yangi Holatni Tanlang
          </label>
          <div className="grid grid-cols-2 gap-2">
            {statusOptions.map((status) => (
              <button
                key={status.value}
                onClick={() => setSelectedStatus(status.value)}
                className={`p-3 rounded-lg border transition-colors ${
                  selectedStatus === status.value
                    ? 'bg-blue-600 border-blue-500 text-white'
                    : 'bg-white/5 border-white/20 text-gray-300 hover:bg-white/10'
                }`}
                disabled={loading}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{status.emoji}</span>
                  <span className="text-sm font-medium">{status.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Send Button */}
        <button
          onClick={handleStatusChange}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading || selectedStatus === currentStatus}
        >
          {loading ? (
            <Loader className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
          {loading ? 'Yuborilmoqda...' : 'Telegram Xabar Yuborish'}
        </button>

        {/* Messages */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2 p-3 bg-green-500/20 border border-green-500/30 rounded-lg"
            >
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-green-400">{message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2 p-3 bg-red-500/20 border border-red-500/30 rounded-lg"
            >
              <XCircle className="w-5 h-5 text-red-400" />
              <span className="text-red-400">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TelegramIntegration;