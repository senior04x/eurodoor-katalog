import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, CheckCircle, AlertCircle, Phone } from 'lucide-react';
import { telegramNotificationService } from '../lib/telegramNotificationService';

interface TelegramTestProps {
  onClose: () => void;
}

export default function TelegramTest({ onClose }: TelegramTestProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSendTest = async () => {
    if (!phoneNumber.trim()) {
      setResult({ success: false, message: 'Telefon raqamini kiriting' });
      return;
    }

    try {
      setLoading(true);
      setResult(null);

      // Clean phone number (remove all non-digits)
      const cleanPhone = phoneNumber.replace(/\D/g, '');
      
      console.log('📱 Sending test Telegram notification to:', cleanPhone);

      const response = await telegramNotificationService.sendTestNotification(cleanPhone);

      if (response.success) {
        setResult({ 
          success: true, 
          message: 'Test xabari muvaffaqiyatli yuborildi! Telegram bot orqali xabarni tekshiring.' 
        });
      } else {
        setResult({ 
          success: false, 
          message: `Xatolik: ${response.error}` 
        });
      }
    } catch (error: any) {
      console.error('❌ Test notification error:', error);
      setResult({ 
        success: false, 
        message: `Xatolik: ${error.message}` 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl p-6 w-full max-w-md"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Telegram Bot Test</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Telefon raqami (chat ID)
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="998901234567"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Faqat raqamlar (masalan: 998901234567)
            </p>
          </div>

          <button
            onClick={handleSendTest}
            disabled={loading || !phoneNumber.trim()}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
            <span>{loading ? 'Yuborilmoqda...' : 'Test xabari yuborish'}</span>
          </button>

          {result && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-lg flex items-center space-x-3 ${
                result.success 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}
            >
              {result.success ? (
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              )}
              <p className={`text-sm ${
                result.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {result.message}
              </p>
            </motion.div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">Qanday ishlaydi:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Telefon raqamini chat ID sifatida ishlatadi</li>
              <li>• Test xabari yuboradi</li>
              <li>• Telegram bot orqali xabarni tekshiring</li>
              <li>• Agar ishlamasa, bot token'ni tekshiring</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
