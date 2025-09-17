import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Phone, Mail, Edit, ShoppingCart, Package, Camera, Clock, CheckCircle, Check, RotateCcw } from 'lucide-react'
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
    phone: '',
    email: '',
    avatar_url: ''
  })
  const [customerData, setCustomerData] = useState<{
    total_purchases: number;
    total_orders: number;
    avatar_url: string;
    name?: string;
    phone?: string;
    email?: string;
  }>({
    total_purchases: 0,
    total_orders: 0,
    avatar_url: ''
  })
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    memberDays: 0
  })
  const [loading, setLoading] = useState(true)

  // Load user statistics and customer data
  const loadUserStats = async () => {
    if (!user) return

    try {
      setLoading(true)
      
      // Get customer data using migration helper
      try {
        const { customerMigrationApi } = await import('../lib/customerMigration')
        const customerResult = await customerMigrationApi.getCustomerData(user.id)
        
        if (customerResult.data) {
          console.log('✅ Customer data found:', customerResult.data)
          setCustomerData({ 
            total_purchases: customerResult.data.total_purchases || 0, 
            total_orders: customerResult.data.total_orders || 0, 
            avatar_url: customerResult.data.avatar_url || '' 
          })
        } else {
          console.log('⚠️ Customer data not found in any system')
          setCustomerData({ total_purchases: 0, total_orders: 0, avatar_url: '' })
        }
      } catch (error) {
        console.warn('⚠️ Customer data loading failed:', error)
        setCustomerData({ total_purchases: 0, total_orders: 0, avatar_url: '' })
      }
      
      // Get user's orders for detailed tracking (optional)
      let orders: any[] = [];
      try {
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('id, total_amount, status, created_at, updated_at')
          .eq('customer_id', user.id)
          .order('created_at', { ascending: false })

        if (ordersError) {
          console.warn('⚠️ Orders data not available:', ordersError.message)
        } else {
          orders = ordersData || [];
        }
      } catch (error) {
        console.warn('⚠️ Orders table not available:', error)
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
        name: user.name || customerData.name || '',
        phone: user.phone || customerData.phone || '',
        email: user.email || customerData.email || '',
        avatar_url: customerData.avatar_url || ''
      })
      loadUserStats()
    }
  }, [user, customerData.name, customerData.phone, customerData.email, customerData.avatar_url])

  // Real-time subscription for customer data changes (disabled for now)
  useEffect(() => {
    if (!user) return

    // Real-time subscription disabled to avoid table structure issues
    // This can be re-enabled once the customer system is fully migrated
    console.log('Real-time customer updates disabled during migration')
    
    return () => {
      // Cleanup if needed
    }
  }, [user])


  // Avatar upload function
  const handleAvatarUpload = async (file: File) => {
    if (!user) return

    try {
      setUploadingAvatar(true)
      
      // Create FormData for ImageBB
      const formData = new FormData()
      formData.append('image', file)
      
      const imgbbApiKey = '15ccd1b7ef91f19fe2f3c4d2600ab9ee'
      
      const response = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbApiKey}`, {
        method: 'POST',
        body: formData
      })
      
      const result = await response.json()
      
      if (result.success) {
        const avatarUrl = result.data.url
        
        // Update customer avatar using migration helper
        try {
          const { customerMigrationApi } = await import('../lib/customerMigration')
          const updateResult = await customerMigrationApi.updateCustomer(user.id, { avatar_url: avatarUrl })
          
          if (updateResult.success) {
            console.log('✅ Avatar updated in database:', updateResult.data)
            setEditData(prev => ({ ...prev, avatar_url: avatarUrl }))
            setCustomerData(prev => ({ ...prev, avatar_url: avatarUrl }))
            alert('Avatar muvaffaqiyatli yangilandi!')
          } else {
            console.warn('⚠️ Avatar database update failed:', updateResult.error)
            // Avatar yuklandi, lekin database yangilanmadi
            setEditData(prev => ({ ...prev, avatar_url: avatarUrl }))
            setCustomerData(prev => ({ ...prev, avatar_url: avatarUrl }))
            alert('Avatar yuklandi, lekin database yangilanmadi')
          }
        } catch (error) {
          console.error('Error updating avatar:', error)
          // Avatar yuklandi, lekin database yangilanmadi
          setEditData(prev => ({ ...prev, avatar_url: avatarUrl }))
          setCustomerData(prev => ({ ...prev, avatar_url: avatarUrl }))
          alert('Avatar yuklandi, lekin database yangilanmadi')
        }
      } else {
        alert('Rasm yuklashda xatolik yuz berdi')
      }
    } catch (error) {
      console.error('Avatar upload error:', error)
      alert('Avatar yuklashda xatolik yuz berdi')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleSave = async () => {
    try {
      console.log('🔄 Customer profile update started:', editData)
      console.log('📡 This update will be reflected in admin panel via real-time sync')
      console.log('🎯 User ID:', user?.id)
      console.log('📝 Current user data:', user)
      
      const result = await updateProfile(editData)
      if (result.success) {
        setIsEditing(false)
        console.log('✅ Customer profile updated successfully')
        console.log('📡 Admin panel should receive real-time update within seconds')
        console.log('🔍 Check admin panel at localhost:5173 to see the changes!')
        alert('✅ Profil muvaffaqiyatli yangilandi!\n\n📡 Admin panelida ham darhol ko\'rinadi.\n🔄 Real-time sinxronlash ishlayapti.\n\n🔍 Admin panelni tekshiring: localhost:5173')
      } else {
        console.error('❌ Customer profile update failed:', result.error)
        alert('❌ Xatolik: ' + result.error)
      }
    } catch (error) {
      console.error('❌ Customer profile update error:', error)
      alert('❌ Profil yangilashda xatolik yuz berdi')
    }
  }

  const handleCancel = () => {
    setEditData({
      name: user?.name || customerData.name || '',
      phone: user?.phone || customerData.phone || '',
      email: user?.email || customerData.email || '',
      avatar_url: customerData.avatar_url || ''
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
                    className="flex items-center justify-center w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    title="Tahrirlash"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSave}
                      className="flex items-center justify-center w-10 h-10 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                      title="Saqlash"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex items-center justify-center w-10 h-10 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                      title="Bekor qilish"
                    >
                      <RotateCcw className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-6">

                {/* Ism */}
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    {customerData.avatar_url ? (
                      <img 
                        src={customerData.avatar_url} 
                        alt="Avatar" 
                        className="w-12 h-12 rounded-lg object-cover border-2 border-white/20"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <User className="w-6 h-6 text-blue-400" />
                      </div>
                    )}
                    {isEditing && (
                      <label className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors">
                        <Camera className="w-3 h-3 text-white" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleAvatarUpload(file)
                          }}
                          className="hidden"
                          disabled={uploadingAvatar}
                        />
                      </label>
                    )}
                    {uploadingAvatar && (
                      <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                        <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                      </div>
                    )}
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
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email (ixtiyoriy)</label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={editData.email}
                        onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40 transition-colors"
                        placeholder="Email manzilingiz (ixtiyoriy)"
                      />
                    ) : (
                      <p className="text-white font-medium">{user.email || customerData.email || 'Kiritilmagan'}</p>
                    )}
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
                    <span className="text-white font-semibold">{customerData.total_orders || stats.totalOrders}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Jami xarid</span>
                    <span className="text-white font-semibold">
                      {(customerData.total_purchases || stats.totalSpent).toLocaleString('uz-UZ')} UZS
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Real-time Order Tracking */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <Clock className="w-5 h-5 text-yellow-400" />
                <span>Buyurtmalar holati</span>
              </h3>
              {loading ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Yuklangan buyurtmalar</span>
                    <div className="w-8 h-4 bg-white/20 rounded animate-pulse"></div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {stats.totalOrders > 0 ? (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Jami buyurtmalar</span>
                        <span className="text-white font-semibold">{stats.totalOrders}</span>
                      </div>
                      <div className="text-sm text-gray-400">
                        Oxirgi yangilanish: {new Date().toLocaleString('uz-UZ')}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-400">Hali buyurtma yo'q</p>
                      <p className="text-gray-500 text-sm">Birinchi buyurtmangizni berish uchun katalogga o'ting</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
