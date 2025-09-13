import { useEffect, useState } from 'react'
import { ensurePushSubscription, shouldAskForNotifications, markNotificationsAsked, getCurrentUserId, isStandalone } from '../lib/notificationService'
import { useAuth } from '../contexts/AuthContext'

export default function NotificationGate() {
  const [open, setOpen] = useState(false)
  const [showInstallHint, setShowInstallHint] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    // Check if user is authenticated and should ask for notifications
    if (user && shouldAskForNotifications()) {
      console.log('🔔 User authenticated, showing notification gate')
      setOpen(true)
    }
    setShowInstallHint(!isStandalone())
  }, [user]) // Re-run when user changes

  const onEnable = async () => {
    const uid = getCurrentUserId()
    console.log('🔔 NotificationGate onEnable called, user ID:', uid)
    if (!uid) { 
      console.log('❌ No user ID found')
      alert('Avval hisobga kiring'); 
      return 
    }
    try { 
      console.log('🔔 Starting push subscription process...')
      await ensurePushSubscription(uid) 
      console.log('✅ Push subscription successful')
    }
    catch (e) { 
      console.error('❌ Push subscription failed:', e)
      alert('Bildirishnomalarni yoqishda xatolik yuz berdi')
    }
    finally { 
      markNotificationsAsked(); 
      setOpen(false) 
    }
  }

  const onLater = () => { markNotificationsAsked(); setOpen(false) }

  // Debug function to manually trigger notification check
  const triggerNotificationCheck = () => {
    console.log('🔔 Manually triggering notification check...')
    if (user && shouldAskForNotifications()) {
      setOpen(true)
    } else {
      console.log('🔔 Notification check conditions not met:', {
        user: !!user,
        shouldAsk: shouldAskForNotifications()
      })
    }
  }

  // Add debug button in development
  if (process.env.NODE_ENV === 'development' && user) {
    return (
      <>
        <div className="fixed bottom-4 right-4 z-[10000]">
          <button 
            onClick={triggerNotificationCheck}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm"
          >
            Test Notifications
          </button>
        </div>
        {open && (
          <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white text-gray-900 shadow-xl p-5">
              <h3 className="text-lg font-semibold">Bildirishnomalarni yoqamizmi?</h3>
              <p className="mt-2 text-sm">Buyurtma holati o'zgarsa darhol xabar yuboramiz.</p>

              {showInstallHint && (
                <div className="mt-3 text-xs rounded-lg bg-blue-50 p-3">
                  iOS'da push faqat <b>Add to Home Screen</b> orqali o'rnatilgan PWA'da ishlaydi.
                  Avval Eurodoor'ni Home Screen'ga qo'shing, so'ng "Yoqish" ni bosing.
                </div>
              )}

              <div className="mt-4 flex gap-2">
                <button onClick={onEnable} className="flex-1 rounded-xl bg-blue-600 text-white py-2 font-medium hover:opacity-90">Yoqish</button>
                <button onClick={onLater} className="flex-1 rounded-xl border border-gray-300 py-2 font-medium">Keyin</button>
              </div>
            </div>
          </div>
        )}
      </>
    )
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white text-gray-900 shadow-xl p-5">
        <h3 className="text-lg font-semibold">Bildirishnomalarni yoqamizmi?</h3>
        <p className="mt-2 text-sm">Buyurtma holati o'zgarsa darhol xabar yuboramiz.</p>

        {showInstallHint && (
          <div className="mt-3 text-xs rounded-lg bg-blue-50 p-3">
            iOS'da push faqat <b>Add to Home Screen</b> orqali o'rnatilgan PWA'da ishlaydi.
            Avval Eurodoor'ni Home Screen'ga qo'shing, so'ng "Yoqish" ni bosing.
          </div>
        )}

        <div className="mt-4 flex gap-2">
          <button onClick={onEnable} className="flex-1 rounded-xl bg-blue-600 text-white py-2 font-medium hover:opacity-90">Yoqish</button>
          <button onClick={onLater} className="flex-1 rounded-xl border border-gray-300 py-2 font-medium">Keyin</button>
        </div>
      </div>
    </div>
  )
}
