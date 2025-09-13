import { useEffect } from 'react'
import { ensurePushSubscription, shouldAskForNotifications, markNotificationsAsked, getCurrentUserId, isPushSupported } from '../lib/notificationService'
import { useAuth } from '../contexts/AuthContext'

export default function NotificationGate() {
  const { user } = useAuth()

  useEffect(() => {
    // Check if user is authenticated and should ask for notifications
    if (user && shouldAskForNotifications()) {
      console.log('🔔 User authenticated, requesting notification permission directly')
      // Directly request notification permission without modal
      requestNotificationPermission()
    }
  }, [user]) // Re-run when user changes

  // Direct notification permission request without modal
  const requestNotificationPermission = async () => {
    try {
      console.log('🔔 Requesting notification permission directly...')
      
      // Check if push is supported
      if (!isPushSupported()) {
        console.log('❌ Push notifications not supported')
        markNotificationsAsked()
        return
      }

      // Request permission directly
      const permission = await Notification.requestPermission()
      console.log('🔔 Permission result:', permission)

      if (permission === 'granted') {
        console.log('✅ Permission granted, setting up push subscription...')
        const uid = getCurrentUserId()
        if (uid) {
          try {
            await ensurePushSubscription(uid)
            console.log('✅ Push subscription successful')
          } catch (error) {
            console.error('❌ Push subscription failed:', error)
          }
        }
      } else {
        console.log('❌ Permission denied:', permission)
      }

      // Mark as asked regardless of result
      markNotificationsAsked()
    } catch (error) {
      console.error('❌ Error requesting notification permission:', error)
      markNotificationsAsked()
    }
  }

  // Debug function to manually trigger notification check
  const triggerNotificationCheck = () => {
    console.log('🔔 Manually triggering notification check...')
    if (user && shouldAskForNotifications()) {
      requestNotificationPermission()
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
      <div className="fixed bottom-4 right-4 z-[10000]">
        <button 
          onClick={triggerNotificationCheck}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm"
        >
          Test Notifications
        </button>
      </div>
    )
  }

  // No modal needed anymore - direct permission request
  return null
}