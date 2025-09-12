import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Package, Clock, CheckCircle, Truck, Home, Search, AlertCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'

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
  const { user } = useAuth()
  const { t } = useLanguage()


  useEffect(() => {
    if (user) {
      loadUserOrders()
    }
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
      }
    } catch (error) {
      console.error('Qidiruvda xatolik:', error)
      setError('Qidiruvda xatolik yuz berdi')
    } finally {
      setLoading(false)
    }
  }

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
                  <div className="flex items-center justify-between mb-4">
                    {statusSteps.map((step, index) => {
                      const currentIndex = getStatusIndex(order.status)
                      const isActive = index <= currentIndex
                      const Icon = step.icon
                      
                      return (
                        <div key={step.key} className="flex flex-col items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                            isActive ? 'bg-blue-600' : 'bg-gray-600'
                          }`}>
                            <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                          </div>
                          <span className={`text-xs text-center ${isActive ? 'text-white' : 'text-gray-400'}`}>
                            {step.label}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                  
                  {/* Progress Line */}
                  <div className="relative">
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
