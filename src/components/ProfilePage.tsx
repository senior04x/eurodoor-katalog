import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Phone, Mail, Edit, Save, X, ShoppingCart, Package, Calendar } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { supabase } from '../lib/supabase'

interface ProfilePageProps {
  onNavigate: (page: string) => void
}

export default function ProfilePage({ onNavigate }: ProfilePageProps) {
  const { user, updateProfile } = useAuth()
  const { } = useLanguage()
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    name: '',
    phone: ''
  })
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    memberDays: 0
  })
  const [loading, setLoading] = useState(true)

  // Load user statistics
  const loadUserStats = async () => {
    if (!user) return

    try {
      setLoading(true)
      
      // Get user's orders
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('id, total_amount, status, created_at')
        .eq('customer_email', user.email)

      if (ordersError) {
        console.error('Error fetching orders:', ordersError)
        return
      }

      // Calculate statistics
      const totalOrders = orders?.length || 0
      const totalSpent = orders?.reduce((sum, order) => {
        // Only count completed/delivered orders
        if (order.status === 'delivered' || order.status === 'completed') {
          return sum + (order.total_amount || 0)
        }
        return sum
      }, 0) || 0

      // Calculate member days
      const memberDays = Math.floor((Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24))

      setStats({
        totalOrders,
        totalSpent,
        memberDays
      })

      console.log('📊 User stats loaded:', { totalOrders, totalSpent, memberDays })
    } catch (error) {
      console.error('Error loading user stats:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      setEditData({
        name: user.name || '',
        phone: user.phone || ''
      })
      loadUserStats()
    }
  }, [user])


  const handleSave = async () => {
    try {
      const result = await updateProfile(editData)
      if (result.success) {
        setIsEditing(false)
        alert('Profil muvaffaqiyatli yangilandi!')
      } else {
        alert('Xatolik: ' + result.error)
      }
    } catch (error) {
      alert('Profil yangilashda xatolik yuz berdi')
    }
  }

  const handleCancel = () => {
    setEditData({
      name: user?.name || '',
      phone: user?.phone || ''
    })
    setIsEditing(false)
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Profil ko'rish uchun tizimga kiring</h2>
          <button
            onClick={() => onNavigate('home')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Bosh sahifaga qaytish
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-4">Mening Profilim</h1>
          <p className="text-gray-300">Shaxsiy ma'lumotlaringizni boshqaring</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profil ma'lumotlari */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Shaxsiy ma'lumotlar</h2>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Tahrirlash</span>
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSave}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      <span>Saqlash</span>
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                      <span>Bekor qilish</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                {/* Ism */}
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Ism</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.name}
                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40 transition-colors"
                        placeholder="Ismingizni kiriting"
                      />
                    ) : (
                      <p className="text-white font-medium">{user.name || 'Kiritilmagan'}</p>
                    )}
                  </div>
                </div>

                {/* Telefon */}
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <Phone className="w-6 h-6 text-green-400" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Telefon raqami</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editData.phone}
                        onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40 transition-colors"
                        placeholder="+998 90 123 45 67"
                      />
                    ) : (
                      <p className="text-white font-medium">{user.phone || 'Kiritilmagan'}</p>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <Mail className="w-6 h-6 text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                    <p className="text-white font-medium">{user.email}</p>
                    <p className="text-gray-400 text-sm">Email o'zgartirib bo'lmaydi</p>
                  </div>
                </div>

                {/* Ro'yxatdan o'tgan sana */}
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-orange-400" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Ro'yxatdan o'tgan sana</label>
                    <p className="text-white font-medium">
                      {new Date(user.created_at).toLocaleDateString('uz-UZ', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Tezkor amallar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            {/* Buyurtmalar */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4">Tezkor amallar</h3>
              <div className="space-y-3">
                <button
                  onClick={() => onNavigate('orders')}
                  className="w-full flex items-center space-x-3 px-4 py-3 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 rounded-lg transition-colors"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>Buyurtmalarim</span>
                </button>
                
                <button
                  onClick={() => onNavigate('catalog')}
                  className="w-full flex items-center space-x-3 px-4 py-3 bg-green-600/20 hover:bg-green-600/30 text-green-300 rounded-lg transition-colors"
                >
                  <Package className="w-5 h-5" />
                  <span>Mahsulotlar</span>
                </button>
              </div>
            </div>

            {/* Statistika */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4">Statistika</h3>
              {loading ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Buyurtmalar soni</span>
                    <div className="w-8 h-4 bg-white/20 rounded animate-pulse"></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Jami xarid</span>
                    <div className="w-16 h-4 bg-white/20 rounded animate-pulse"></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">A'zo bo'lgan</span>
                    <div className="w-12 h-4 bg-white/20 rounded animate-pulse"></div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Buyurtmalar soni</span>
                    <span className="text-white font-semibold">{stats.totalOrders}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Jami xarid</span>
                    <span className="text-white font-semibold">
                      {stats.totalSpent.toLocaleString('uz-UZ')} UZS
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">A'zo bo'lgan</span>
                    <span className="text-white font-semibold">
                      {stats.memberDays} kun
                    </span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
