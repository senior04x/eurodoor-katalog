import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, X, AlertCircle, Package, CheckCircle, Clock } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

interface Notification {
  id: string
  user_id: string
  order_id?: string
  order_number?: string
  type: 'order_update' | 'system_alert' | 'promotion'
  title: string
  message: string
  is_read: boolean
  priority: 'low' | 'medium' | 'high'
  created_at: string
  updated_at: string
}

interface NotificationCenterProps {
  isMobile?: boolean
  onMobileClose?: () => void
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ isMobile = false, onMobileClose }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  // Load notifications
  const loadNotifications = async () => {
    if (!user) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error

      setNotifications(data || [])
      setUnreadCount(data?.filter(n => !n.is_read).length || 0)
    } catch (error) {
      console.error('Error loading notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)

      if (error) throw error

      // Update local state
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  // Handle mobile close
  const handleMobileClose = () => {
    setIsOpen(false)
    if (onMobileClose) {
      onMobileClose()
    }
  }

  // Mark all as read
  const markAllAsRead = async () => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false)

      if (error) throw error

      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  // Get notification icon
  const getNotificationIcon = (type: string, priority: string) => {
    const iconClass = `w-5 h-5 ${
      priority === 'high' ? 'text-red-500' : 
      priority === 'medium' ? 'text-yellow-500' : 'text-blue-500'
    }`

    switch (type) {
      case 'order_update':
        return <Package className={iconClass} />
      case 'system_alert':
        return <AlertCircle className={iconClass} />
      case 'promotion':
        return <CheckCircle className={iconClass} />
      default:
        return <Bell className={iconClass} />
    }
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      return 'Az oldin'
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} soat oldin`
    } else if (diffInHours < 48) {
      return 'Kecha'
    } else {
      return date.toLocaleDateString('uz-UZ')
    }
  }

  // Load notifications when component mounts or user changes
  useEffect(() => {
    if (user) {
      loadNotifications()
    }
  }, [user])

  // Real-time subscription for new notifications
  useEffect(() => {
    if (!user) return

    const subscription = supabase
      .channel('notifications-realtime')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('🔔 New notification received:', payload.new)
          setNotifications(prev => [payload.new as Notification, ...prev])
          setUnreadCount(prev => prev + 1)
        }
      )
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('🔔 Notification updated:', payload.new)
          setNotifications(prev => 
            prev.map(n => n.id === payload.new.id ? payload.new as Notification : n)
          )
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [user])

  if (!user) return null

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 text-white/80 hover:text-white transition-colors ${isMobile ? 'w-full justify-start' : ''}`}
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.div>
        )}
        {isMobile && (
          <span className="ml-3 text-sm">Bildirishnomalar</span>
        )}
      </button>

      {/* Notification Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className={`absolute ${isMobile ? 'left-0 right-0 mx-4' : 'right-0'} top-full mt-2 ${isMobile ? 'w-auto' : 'w-80'} bg-white/95 backdrop-blur-xl rounded-lg shadow-2xl border border-gray-200 z-50`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-gray-900 font-semibold">Bildirishnomalar</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Barchasini o'qilgan deb belgilash
                  </button>
                )}
                <button
                  onClick={isMobile ? handleMobileClose : () => setIsOpen(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-gray-600 bg-gray-50">
                  <Clock className="w-6 h-6 mx-auto mb-2 animate-spin" />
                  Yuklanmoqda...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-600 bg-gray-50">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Bildirishnomalar yo'q</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${
                      !notification.is_read ? 'bg-blue-50' : 'bg-white'
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type, notification.priority)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-gray-900 font-medium text-sm truncate">
                            {notification.title}
                          </h4>
                          {!notification.is_read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500 text-xs">
                            {formatDate(notification.created_at)}
                          </span>
                          {notification.order_number && (
                            <span className="text-blue-600 text-xs font-medium">
                              #{notification.order_number}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-200 bg-gray-50 text-center">
                <button
                  onClick={() => {
                    if (isMobile) {
                      handleMobileClose()
                    } else {
                      setIsOpen(false)
                    }
                    // Navigate to full notifications page if needed
                  }}
                  className="text-blue-600 hover:text-blue-700 text-sm transition-colors"
                >
                  Barcha bildirishnomalarni ko'rish
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default NotificationCenter
