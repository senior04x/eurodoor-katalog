import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Package, Clock, CheckCircle, Truck, Home, Search, AlertCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { pushNotificationService } from '../lib/pushNotificationService'

interface Order {
  id: string
  order_number: string
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  created_at: string
  updated_at: string
  total_amount: number
  customer_name: string
  customer_phone: string
  customer_email: string
  delivery_address: string
  notes?: string
  products: any[]
}

const statusSteps = [
  { key: 'pending', label: 'Kutilmoqda', icon: Clock, color: 'text-yellow-600' },
  { key: 'confirmed', label: 'Tasdiqlangan', icon: CheckCircle, color: 'text-blue-600' },
  { key: 'processing', label: 'Tayyorlanmoqda', icon: Package, color: 'text-purple-600' },
  { key: 'shipped', label: 'Yuborilgan', icon: Truck, color: 'text-indigo-600' },
  { key: 'delivered', label: 'Yetkazilgan', icon: Home, color: 'text-green-600' }
]

export default function OrderTracking() {
  const [searchTerm, setSearchTerm] = useState('')
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const { user } = useAuth()
  const { } = useLanguage()


  useEffect(() => {
    if (user) {
      // Test Supabase connection first
      const testConnection = async () => {
        try {
          const { error } = await supabase.from('orders').select('count').limit(1)
          if (error) {
            console.error('❌ Supabase connection error:', error)
          } else {
            console.log('✅ Supabase connection OK')
          }
        } catch (err) {
          console.error('❌ Supabase test error:', err)
        }
      }
      
      testConnection()
      loadUserOrders()
      
      // Enhanced real-time subscription for order updates (matching admin panel)
      const subscription = supabase
        .channel('customer-orders-realtime', {
          config: {
            broadcast: { self: true },
            presence: { key: 'customer-orders' }
          }
        })
        .on('postgres_changes', 
          { event: 'INSERT', schema: 'public', table: 'orders' },
          (payload) => {
            console.log('🆕 New order added:', payload.new)
            console.log('🔄 Refreshing orders list...')
            loadUserOrders() // Refresh to get latest data
          }
        )
        .on('postgres_changes', 
          { event: 'UPDATE', schema: 'public', table: 'orders' },
          (payload) => {
            console.log('✏️ Order updated:', payload.new)
            console.log('🔄 Payload details:', {
              new: payload.new,
              old: payload.old,
              eventType: payload.eventType,
              schema: payload.schema,
              table: payload.table
            })
            
            // Check if this is a status change
            const oldStatus = payload.old?.status
            const newStatus = payload.new?.status
            
            if (oldStatus && newStatus && oldStatus !== newStatus) {
              console.log('🔔 Order status changed:', { oldStatus, newStatus })
              
              // Show browser notification
              if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
                const statusMessages: { [key: string]: string } = {
                  'pending': 'Buyurtmangiz qabul qilindi va ko\'rib chiqilmoqda',
                  'confirmed': 'Buyurtmangiz tasdiqlandi va ishlab chiqarishga yuborildi',
                  'processing': 'Buyurtmangiz ishlab chiqarilmoqda',
                  'ready': 'Buyurtmangiz tayyor! Yetkazib berish uchun tayyorlanmoqda',
                  'shipped': 'Buyurtmangiz yuborildi va yo\'lda',
                  'delivered': 'Buyurtmangiz yetkazib berildi! Rahmat!',
                  'cancelled': 'Buyurtmangiz bekor qilindi'
                };

                const message = statusMessages[newStatus] || `Buyurtma holati o'zgartirildi: ${newStatus}`;
                
                new Notification(`Eurodoor - Buyurtma #${payload.new.order_number}`, {
                  body: message,
                  icon: '/favicon.ico',
                  tag: `order-${payload.new.order_number}`,
                  requireInteraction: true
                });
              }
              
              // Send push notification to user's device
              if (user && user.id) {
                try {
                  await pushNotificationService.notifyOrderStatusChange(
                    payload.new.order_number,
                    newStatus,
                    user.id
                  );
                  console.log('✅ Push notification sent to user device');
                } catch (error) {
                  console.error('❌ Push notification error:', error);
                }
              }
            }
            
            // Immediately update local state for instant feedback
            setOrders(prevOrders => {
              return prevOrders.map(order => {
                if (order.id === payload.new.id) {
                  console.log('✅ Updating order status:', payload.new.status)
                  setLastUpdate(new Date())
                  return { ...order, ...payload.new }
                }
                return order
              })
            })
          }
        )
        .on('postgres_changes', 
          { event: 'DELETE', schema: 'public', table: 'orders' },
          (payload) => {
            console.log('🗑️ Order deleted:', payload.old)
            console.log('🔄 Updating local state...')
            // Immediately update local state for instant feedback
            setOrders(prevOrders => prevOrders.filter(order => order.id !== payload.old.id))
          }
        )
        .subscribe((status) => {
          console.log('📡 Customer orders subscription status:', status)
          if (status === 'SUBSCRIBED') {
            console.log('✅ Successfully subscribed to customer orders real-time updates')
            console.log('🎯 Real-time sync is now active for customer!')
          } else if (status === 'CHANNEL_ERROR') {
            console.error('❌ Channel error in customer orders subscription')
            console.error('❌ Real-time sync will not work!')
          } else if (status === 'TIMED_OUT') {
            console.error('⏰ Customer orders subscription timed out')
            console.error('❌ Real-time sync will not work!')
          } else if (status === 'CLOSED') {
            console.log('🔌 Customer orders subscription closed')
          } else {
            console.log('📡 Customer orders subscription status:', status)
          }
        })

      return () => {
        subscription.unsubscribe()
      }
    }
    return undefined;
  }, [user])

  const loadUserOrders = async () => {
    if (!user) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_email', user.email)
        .order('created_at', { ascending: false })

      if (error) throw error
      setOrders(data || [])
    } catch (error) {
      console.error('Buyurtmalarni yuklashda xatolik:', error)
      setError('Buyurtmalarni yuklashda xatolik yuz berdi')
    } finally {
      setLoading(false)
    }
  }

  const searchOrder = async () => {
    if (!searchTerm.trim()) return

    try {
      setLoading(true)
      setError('')
      
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .or(`order_number.ilike.%${searchTerm}%,customer_phone.ilike.%${searchTerm}%,customer_email.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false })

      if (error) throw error
      setOrders(data || [])
      
      if (!data || data.length === 0) {
        setError('Buyurtma topilmadi')
      } else {
        // Real-time subscription global notification service orqali ishlayapti
        console.log('✅ Orders loaded, real-time updates handled by global notification service');
      }
    } catch (error) {
      console.error('Qidiruvda xatolik:', error)
      setError('Qidiruvda xatolik yuz berdi')
    } finally {
      setLoading(false)
    }
  }

  // Real-time subscription removed - handled by global notification service
  // This prevents duplicate notifications

  const getStatusIndex = (status: string) => {
    return statusSteps.findIndex(step => step.key === status)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uz-UZ', {
      style: 'currency',
      currency: 'UZS',
      minimumFractionDigits: 0
    }).format(price)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">
              Buyurtma Holatini Kuzatish
            </h1>
            <p className="text-gray-300 text-lg">
              Buyurtmalaringizning holatini real vaqtda kuzating
            </p>
          </div>

          {/* Search Section */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buyurtma raqami, telefon yoki email orqali qidiring"
                    className="w-full pl-10 pr-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onKeyPress={(e) => e.key === 'Enter' && searchOrder()}
                  />
                </div>
              </div>
              <button
                onClick={searchOrder}
                disabled={loading || !searchTerm.trim()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {loading ? 'Qidirilmoqda...' : 'Qidirish'}
              </button>
            </div>
            
            {/* Real-time Status Indicator */}
            {lastUpdate && (
              <div className="mt-4 flex items-center justify-center text-sm text-green-400">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                Oxirgi yangilanish: {lastUpdate.toLocaleTimeString('uz-UZ')}
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 mb-6"
            >
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                <p className="text-red-300">{error}</p>
              </div>
            </motion.div>
          )}

          {/* Orders List */}
          <div className="space-y-6">
            {orders.map((order) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6"
              >
                {/* Order Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-1">
                      Buyurtma #{order.order_number}
                    </h3>
                    <p className="text-gray-300">
                      {formatDate(order.created_at)}
                    </p>
                  </div>
                  <div className="mt-4 md:mt-0">
                    <span className="text-2xl font-bold text-blue-400">
                      {formatPrice(order.total_amount)}
                    </span>
                  </div>
                </div>

                {/* Status Progress */}
                <div className="mb-6">
                  {/* Status Icons - Mobile: Only icons, Desktop: Icons with labels */}
                  <div className="flex items-center justify-between mb-4 overflow-x-auto pb-2">
                    {statusSteps.map((step, index) => {
                      const currentIndex = getStatusIndex(order.status)
                      const isActive = index <= currentIndex
                      const isCurrentStatus = index === currentIndex
                      const Icon = step.icon
                      
                      return (
                        <div key={step.key} className="flex flex-col items-center min-w-0 flex-1">
                          <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center mb-2 ${
                            isActive ? 'bg-blue-600' : 'bg-gray-600'
                          }`}>
                            <Icon className={`h-4 w-4 md:h-5 md:w-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                          </div>
                          {/* Mobile: Only show label for current status, Desktop: Show all labels */}
                          <span className={`text-xs text-center leading-tight hidden md:block ${isActive ? 'text-white' : 'text-gray-400'}`}>
                            {step.label}
                          </span>
                          {/* Mobile: Show current status label below icons */}
                          {isCurrentStatus && (
                            <span className="text-xs text-center leading-tight text-blue-400 font-medium md:hidden mt-1">
                              {step.label}
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                  
                  {/* Progress Line */}
                  <div className="relative hidden md:block">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gray-600 rounded-full"></div>
                    <div 
                      className="absolute top-0 left-0 h-1 bg-blue-600 rounded-full transition-all duration-500"
                      style={{ width: `${(getStatusIndex(order.status) / (statusSteps.length - 1)) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Order Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-3">Mijoz Ma'lumotlari</h4>
                    <div className="space-y-2 text-gray-300">
                      <p><span className="font-medium">Ism:</span> {order.customer_name}</p>
                      <p><span className="font-medium">Telefon:</span> {order.customer_phone}</p>
                      <p><span className="font-medium">Email:</span> {order.customer_email}</p>
                      <p><span className="font-medium">Manzil:</span> {order.delivery_address}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-3">Mahsulotlar</h4>
                    <div className="space-y-2">
                      {order.products?.map((product, index) => (
                        <div key={index} className="text-gray-300">
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm">
                            Miqdor: {product.quantity} | 
                            Narx: {formatPrice(product.price * product.quantity)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {order.notes && (
                  <div className="mt-6 p-4 bg-white/5 rounded-lg">
                    <h4 className="text-lg font-semibold text-white mb-2">Qo'shimcha Izoh</h4>
                    <p className="text-gray-300">{order.notes}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {orders.length === 0 && !loading && !error && (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Buyurtmalar topilmadi
              </h3>
              <p className="text-gray-300">
                Buyurtma raqami, telefon yoki email orqali qidiring
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
