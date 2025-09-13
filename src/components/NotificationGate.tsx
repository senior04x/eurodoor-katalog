import { useEffect, useState } from 'react'
import { ensurePushSubscription, shouldAskForNotifications, markNotificationsAsked, getCurrentUserId, isStandalone } from '../lib/notificationService'

export default function NotificationGate() {
  const [open, setOpen] = useState(false)
  const [showInstallHint, setShowInstallHint] = useState(false)

  useEffect(() => {
    if (shouldAskForNotifications()) setOpen(true)
    setShowInstallHint(!isStandalone())
  }, [])

  const onEnable = async () => {
    const uid = getCurrentUserId()
    if (!uid) { alert('Avval hisobga kiring'); return }
    try { await ensurePushSubscription(uid) }
    catch (e) { console.warn(e) }
    finally { markNotificationsAsked(); setOpen(false) }
  }

  const onLater = () => { markNotificationsAsked(); setOpen(false) }

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
