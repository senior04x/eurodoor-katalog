import { useEffect, useState } from 'react';
import { ensurePushSubscription, isStandalone, getCurrentUserId, shouldAskForNotifications, markNotificationsAsked } from '../lib/notificationService';

export default function NotificationGate() {
  const [open, setOpen] = useState(false);
  const [showInstallHint, setShowInstallHint] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if we should show the modal
    if (shouldAskForNotifications()) {
      setOpen(true);
    }
    
    // Show install hint if not in standalone mode (iOS PWA requirement)
    setShowInstallHint(!isStandalone());
  }, []);

  const onEnable = async () => {
    const uid = getCurrentUserId();
    if (!uid) { 
      alert('Avval hisobga kiring'); 
      return; 
    }
    
    setIsLoading(true);
    try {
      await ensurePushSubscription(uid);
      console.log('✅ Push notifications enabled via modal');
    } catch (e) {
      console.warn('Failed to enable notifications:', e);
      alert('Bildirishnomalarni yoqishda xatolik yuz berdi');
    } finally {
      markNotificationsAsked();
      setOpen(false);
      setIsLoading(false);
    }
  };

  const onLater = () => {
    markNotificationsAsked();
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white text-gray-900 shadow-xl p-5">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl">🔔</span>
          </div>
          <h3 className="text-lg font-semibold mb-2">Bildirishnomalarni yoqamizmi?</h3>
          <p className="text-sm text-gray-600 mb-4">
            Buyurtma holati o'zgarsa darhol xabar yuboramiz.
          </p>
        </div>

        {showInstallHint && (
          <div className="mb-4 text-xs rounded-lg bg-blue-50 p-3 border border-blue-200">
            <div className="flex items-start">
              <span className="text-blue-600 mr-2">ℹ️</span>
              <div>
                <p className="font-medium text-blue-800 mb-1">iOS uchun:</p>
                <p className="text-blue-700">
                  Push bildirishnomalar faqat <strong>Add to Home Screen</strong> orqali o'rnatilgan PWA'da ishlaydi.
                  Avval Eurodoor'ni Home Screen'ga qo'shing, so'ng "Yoqish" ni bosing.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <button 
            onClick={onEnable} 
            disabled={isLoading}
            className="flex-1 rounded-xl bg-blue-600 text-white py-3 font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            {isLoading ? 'Yoqilmoqda...' : 'Yoqish'}
          </button>
          <button 
            onClick={onLater}
            disabled={isLoading}
            className="flex-1 rounded-xl border border-gray-300 py-3 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Keyin
          </button>
        </div>
      </div>
    </div>
  );
}
