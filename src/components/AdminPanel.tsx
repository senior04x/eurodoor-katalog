import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Plus, Trash2, LogOut, Package, Users, Settings, 
  BarChart3, ShoppingCart, User, Bell, Search,
  Grid, Edit, Eye, CheckCircle, XCircle, Clock,
  TrendingUp, DollarSign, Calendar, Filter
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { uploadImage } from '../lib/imageUpload'

const ADMIN_PASSWORD = 'eurodoor2024'

interface Product {
  id: number
  name: string
  name_ru: string
  name_en: string
  material: string
  material_ru: string
  material_en: string
  security: string
  security_ru: string
  security_en: string
  dimensions: string
  dimensions_ru: string
  dimensions_en: string
  lock_stages: string
  lock_stages_ru: string
  lock_stages_en: string
  thickness: string
  price: number
  currency: string
  image: string
  is_active: boolean
  created_at: string
}

interface Order {
  id: string
  timestamp: string
  customer: {
    name: string
    phone: string
    message?: string
  }
  product: {
    name: string
    material: string
    security: string
    dimensions: string
    price: string
  }
  status: 'new' | 'processing' | 'completed' | 'cancelled'
  created_at: string
  updated_at: string
}

interface DashboardStats {
  totalProducts: number
  totalOrders: number
  totalCustomers: number
  totalRevenue: number
  ordersThisMonth: number
  revenueThisMonth: number
}

const AdminPanel = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [users, setUsers] = useState([])
  const [dashboardStats, setDashboardStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalRevenue: 0,
    ordersThisMonth: 0,
    revenueThisMonth: 0
  })
  const [loading, setLoading] = useState(false)
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [isAddingProduct, setIsAddingProduct] = useState(false)
  const [newProduct, setNewProduct] = useState({
    name: '',
    material: '',
    security: '',
    dimensions: '',
    customDimensions: '',
    lockStages: '',
    thickness: '',
    price: '',
    currency: 'USD',
    image: ''
  })
  const [imageFile, setImageFile] = useState(null)

  // Parolni localStorage dan yuklash
  useEffect(() => {
    const savedPassword = localStorage.getItem('admin_password')
    if (savedPassword === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      loadData()
    }
  }, [])

  const loadData = async () => {
    await Promise.all([
      loadProducts(),
      loadOrders(),
      loadUsers(),
      loadDashboardStats()
    ])
  }

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Error loading products:', error)
    }
  }

  const loadOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setOrders(data || [])
    } catch (error) {
      console.error('Error loading orders:', error)
    }
  }

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error loading users:', error)
    }
  }

  const loadDashboardStats = async () => {
    try {
      // Mahsulotlar soni
      const { count: productsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })

      // Buyurtmalar soni
      const { count: ordersCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })

      // Bu oygi buyurtmalar
      const thisMonth = new Date()
      thisMonth.setDate(1)
      thisMonth.setHours(0, 0, 0, 0)

      const { count: ordersThisMonth } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thisMonth.toISOString())

      // Barcha buyurtmalardan mijozlar sonini hisoblash
      const { data: ordersData } = await supabase
        .from('orders')
        .select('customer')

      const uniqueCustomers = new Set()
      ordersData?.forEach(order => {
        uniqueCustomers.add(order.customer.phone)
      })

      // Daromadni hisoblash
      const { data: allOrders } = await supabase
        .from('orders')
        .select('product, created_at')

      let totalRevenue = 0
      let revenueThisMonth = 0

      allOrders?.forEach(order => {
        const price = parseFloat(order.product.price) || 0
        totalRevenue += price
        
        const orderDate = new Date(order.created_at)
        if (orderDate >= thisMonth) {
          revenueThisMonth += price
        }
      })

      setDashboardStats({
        totalProducts: productsCount || 0,
        totalOrders: ordersCount || 0,
        totalCustomers: uniqueCustomers.size,
        totalRevenue: totalRevenue,
        ordersThisMonth: ordersThisMonth || 0,
        revenueThisMonth: revenueThisMonth
      })
    } catch (error) {
      console.error('Error loading dashboard stats:', error)
    }
  }

  const handleLogin = (e) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      setError('')
      setPassword('')
      localStorage.setItem('admin_password', ADMIN_PASSWORD)
      loadData()
    } else {
      setError('Noto\'g\'ri parol!')
      setPassword('')
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setPassword('')
    setError('')
    localStorage.removeItem('admin_password')
  }

  const handleAddProduct = async (e) => {
    e.preventDefault()
    if (isAddingProduct) return

    if (!newProduct.name || !newProduct.material || !newProduct.security || !newProduct.dimensions || !newProduct.lockStages || !newProduct.thickness || !newProduct.price) {
      alert('Barcha maydonlarni to\'ldiring!')
      return
    }

    setIsAddingProduct(true)

    try {
      let imageUrl = newProduct.image

      if (imageFile) {
        imageUrl = await uploadImage(imageFile)
      }

      // Google Translate API orqali tarjima qilish
      const translateText = async (text: string, targetLang: string) => {
        try {
          const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=uz|${targetLang}`)
          const data = await response.json()
          return data.responseData?.translatedText || text
        } catch {
          return text
        }
      }

      const [nameRu, nameEn, materialRu, materialEn, securityRu, securityEn, dimensionsRu, dimensionsEn, lockStagesRu, lockStagesEn] = await Promise.all([
        translateText(newProduct.name, 'ru'),
        translateText(newProduct.name, 'en'),
        translateText(newProduct.material, 'ru'),
        translateText(newProduct.material, 'en'),
        translateText(newProduct.security, 'ru'),
        translateText(newProduct.security, 'en'),
        translateText(newProduct.dimensions, 'ru'),
        translateText(newProduct.dimensions, 'en'),
        translateText(`${newProduct.lockStages}-nuqtali`, 'ru'),
        translateText(`${newProduct.lockStages}-point`, 'en')
      ])

      const product = {
        name: newProduct.name,
        name_ru: nameRu,
        name_en: nameEn,
        material: newProduct.material,
        material_ru: materialRu,
        material_en: materialEn,
        security: newProduct.security,
        security_ru: securityRu,
        security_en: securityEn,
        dimensions: newProduct.dimensions,
        dimensions_ru: dimensionsRu,
        dimensions_en: dimensionsEn,
        lock_stages: newProduct.lockStages,
        lock_stages_ru: lockStagesRu,
        lock_stages_en: lockStagesEn,
        thickness: newProduct.thickness,
        price: parseFloat(newProduct.price),
        currency: newProduct.currency,
        image: imageUrl,
        is_active: true
      }

      const { error } = await supabase
        .from('products')
        .insert([product])

      if (error) {
        if (error.message.includes('currency') || error.message.includes('lock_stages') || error.message.includes('dimensions_en')) {
          alert('Database da ba\'zi ustunlar yo\'q. SQL scriptlarni ishga tushiring!')
        } else {
          throw error
        }
      } else {
        setShowAddProduct(false)
        setNewProduct({
          name: '',
          material: '',
          security: '',
          dimensions: '',
          customDimensions: '',
          lockStages: '',
          thickness: '',
          price: '',
          currency: 'USD',
          image: ''
        })
        setImageFile(null)
        loadProducts()
        alert('Mahsulot muvaffaqiyatli qo\'shildi!')
      }
    } catch (error) {
      console.error('Error adding product:', error)
      alert('Mahsulot qo\'shishda xatolik yuz berdi!')
    } finally {
      setIsAddingProduct(false)
    }
  }

  const handleDeleteProduct = async (id: number) => {
    if (!confirm('Bu mahsulotni o\'chirishni xohlaysizmi?')) return

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)

      if (error) throw error

      loadProducts()
      alert('Mahsulot muvaffaqiyatli o\'chirildi!')
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('Mahsulot o\'chirishda xatolik yuz berdi!')
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type === 'image/png' || file.type === 'image/jpeg') {
        setImageFile(file)
        setNewProduct({ ...newProduct, image: '' })
      } else {
        alert('Faqat PNG yoki JPEG formatdagi rasmlar qabul qilinadi!')
      }
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)

      if (error) throw error

      loadOrders()
      loadDashboardStats()
      alert('Buyurtma holati yangilandi!')
    } catch (error) {
      console.error('Error updating order status:', error)
      alert('Buyurtma holatini yangilashda xatolik!')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800'
      case 'processing': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'new': return 'Yangi'
      case 'processing': return 'Jarayonda'
      case 'completed': return 'Tugallangan'
      case 'cancelled': return 'Bekor qilingan'
      default: return status
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md border border-white/20"
        >
          <div className="text-center mb-8">
            <img 
              src="https://iili.io/K2WCLJV.png" 
              alt="Eurodoor Admin" 
              className="w-20 h-20 mx-auto mb-4 rounded-xl"
            />
            <h1 className="text-2xl font-bold text-white mb-2">Admin Panel</h1>
            <p className="text-gray-300">Parolni kiriting</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Parol"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white/40 transition-colors"
                required
              />
            </div>

            {error && (
              <div className="text-red-400 text-sm text-center">{error}</div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              Kirish
            </button>
          </form>

          <div className="mt-6 text-center">
            <a 
              href="https://eurodoor.uz" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 text-sm underline"
            >
              Asosiy saytga o'tish
            </a>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex">
      {/* Sidebar */}
      <div className="w-64 bg-white/5 backdrop-blur-lg border-r border-white/10 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center space-x-3">
              <img 
                src="https://iili.io/K2WCLJV.png" 
                alt="Eurodoor Admin" 
              className="w-8 h-8 rounded-lg"
              />
              <div>
              <h1 className="text-lg font-bold text-white">Eurodoor</h1>
              <p className="text-xs text-gray-400">Admin Panel</p>
            </div>
              </div>
            </div>
            
        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
              <button
            onClick={() => setCurrentPage('dashboard')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              currentPage === 'dashboard' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Grid className="w-5 h-5" />
            <span>Dashboard</span>
              </button>
              
          <button
            onClick={() => setCurrentPage('products')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              currentPage === 'products' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Package className="w-5 h-5" />
            <span>Mahsulotlar</span>
          </button>

          <button
            onClick={() => setCurrentPage('orders')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              currentPage === 'orders' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <ShoppingCart className="w-5 h-5" />
            <span>Buyurtmalar</span>
          </button>

          <button
            onClick={() => setCurrentPage('customers')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              currentPage === 'customers' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Users className="w-5 h-5" />
            <span>Mijozlar</span>
          </button>

          <button
            onClick={() => setCurrentPage('analytics')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              currentPage === 'analytics' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            <span>Analitika</span>
          </button>

          <button
            onClick={() => setCurrentPage('settings')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              currentPage === 'settings' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span>Sozlamalar</span>
          </button>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-white/10">
              <button
                onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
              >
            <LogOut className="w-5 h-5" />
            <span>Chiqish</span>
              </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white/5 backdrop-blur-lg border-b border-white/10">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {currentPage === 'dashboard' && 'Dashboard'}
                  {currentPage === 'products' && 'Mahsulotlar'}
                  {currentPage === 'orders' && 'Buyurtmalar'}
                  {currentPage === 'customers' && 'Mijozlar'}
                  {currentPage === 'analytics' && 'Analitika'}
                  {currentPage === 'settings' && 'Sozlamalar'}
                </h1>
                <p className="text-gray-400">
                  {currentPage === 'dashboard' && 'Umumiy ma\'lumotlar va statistika'}
                  {currentPage === 'products' && 'Mahsulotlarni boshqaring'}
                  {currentPage === 'orders' && 'Buyurtmalarni ko\'ring va boshqaring'}
                  {currentPage === 'customers' && 'Mijozlar ma\'lumotlari'}
                  {currentPage === 'analytics' && 'Sotuvlar va daromad tahlili'}
                  {currentPage === 'settings' && 'Tizim sozlamalari'}
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Qidirish..."
                    className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white/40 transition-colors"
                  />
                </div>
                
                <button className="p-2 text-gray-400 hover:text-white transition-colors">
                  <Bell className="w-5 h-5" />
                </button>
                
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-white">Admin</p>
                    <p className="text-xs text-gray-400">admin@eurodoor.uz</p>
                  </div>
                </div>
            </div>
          </div>
        </div>
      </header>

        {/* Main Content Area */}
        <main className="flex-1 p-6 overflow-y-auto">
          {currentPage === 'dashboard' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Jami Mahsulotlar</p>
                      <p className="text-2xl font-bold text-white">{dashboardStats.totalProducts}</p>
                      <p className="text-green-400 text-xs flex items-center mt-1">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        +12% o'tgan oydan
                      </p>
                    </div>
                    <div className="p-3 bg-blue-500/20 rounded-lg">
                      <Package className="w-6 h-6 text-blue-400" />
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Buyurtmalar</p>
                      <p className="text-2xl font-bold text-white">{dashboardStats.totalOrders}</p>
                      <p className="text-green-400 text-xs flex items-center mt-1">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        +8% o'tgan oydan
                      </p>
                    </div>
                    <div className="p-3 bg-green-500/20 rounded-lg">
                      <ShoppingCart className="w-6 h-6 text-green-400" />
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Mijozlar</p>
                      <p className="text-2xl font-bold text-white">{dashboardStats.totalCustomers}</p>
                      <p className="text-green-400 text-xs flex items-center mt-1">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        +15% o'tgan oydan
                      </p>
                    </div>
                    <div className="p-3 bg-purple-500/20 rounded-lg">
                      <Users className="w-6 h-6 text-purple-400" />
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Daromad</p>
                      <p className="text-2xl font-bold text-white">${dashboardStats.totalRevenue.toLocaleString()}</p>
                      <p className="text-green-400 text-xs flex items-center mt-1">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        +23% o'tgan oydan
                      </p>
                    </div>
                    <div className="p-3 bg-yellow-500/20 rounded-lg">
                      <DollarSign className="w-6 h-6 text-yellow-400" />
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Recent Orders */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white">So'nggi Buyurtmalar</h3>
                  <button
                    onClick={() => setCurrentPage('orders')}
                    className="text-blue-400 hover:text-blue-300 text-sm"
                  >
                    Barchasini ko'rish
                  </button>
                </div>
                
                <div className="space-y-4">
                  {orders.slice(0, 5).map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                          <ShoppingCart className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium">{order.customer_name || 'Noma\'lum mijoz'}</p>
                          <p className="text-gray-400 text-sm">{order.products?.[0]?.name || 'Mahsulot'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                        <p className="text-gray-400 text-sm mt-1">
                          {new Date(order.created_at).toLocaleDateString('uz-UZ')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          )}

          {currentPage === 'products' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">Mahsulotlar</h2>
          <p className="text-gray-400">Barcha mahsulotlarni boshqaring</p>
                </div>
                <button
                  onClick={() => setShowAddProduct(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Mahsulot qo'shish</span>
                </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-white">Yuklanmoqda...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:border-white/30 transition-colors"
              >
                <div className="aspect-square bg-gray-700 rounded-lg mb-4 overflow-hidden">
                  {product.image ? (
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-12 h-12 text-gray-500" />
                    </div>
                  )}
                </div>
                
                <h3 className="text-lg font-semibold text-white mb-2">{product.name}</h3>
                <p className="text-gray-300 text-sm mb-4">{product.material}</p>
                
                <div className="flex items-center justify-between">
                  <span className="text-blue-400 font-semibold">
                    {product.price} {product.currency}
                  </span>
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    className="text-red-400 hover:text-red-300 p-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {products.length === 0 && !loading && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Mahsulotlar yo'q</h3>
            <p className="text-gray-400 mb-6">Birinchi mahsulotni qo'shing</p>
            <button
              onClick={() => setShowAddProduct(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 mx-auto transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Mahsulot qo'shish</span>
            </button>
                </div>
              )}
            </div>
          )}

          {currentPage === 'orders' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">Buyurtmalar</h2>
                  <p className="text-gray-400">Barcha buyurtmalarni ko'ring va boshqaring</p>
                </div>
                <div className="flex items-center space-x-2">
                  <select className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm">
                    <option value="">Barcha holatlar</option>
                    <option value="new">Yangi</option>
                    <option value="processing">Jarayonda</option>
                    <option value="completed">Tugallangan</option>
                    <option value="cancelled">Bekor qilingan</option>
                  </select>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/5">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Mijoz</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Mahsulot</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Narx</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Holat</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Sana</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Amallar</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {orders.map((order) => (
                        <tr key={order.id} className="hover:bg-white/5">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-white">{order.customer.name}</div>
                              <div className="text-sm text-gray-400">{order.customer.phone}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-white">{order.product.name}</div>
                            <div className="text-sm text-gray-400">{order.product.material}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                            {order.product.price} UZS
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                              {getStatusText(order.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                            {new Date(order.created_at).toLocaleDateString('uz-UZ')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <select
                                value={order.status}
                                onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                className="px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-xs"
                              >
                                <option value="new">Yangi</option>
                                <option value="processing">Jarayonda</option>
                                <option value="completed">Tugallangan</option>
                                <option value="cancelled">Bekor qilingan</option>
                              </select>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {currentPage === 'customers' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white">Mijozlar</h2>
                <p className="text-gray-400">Barcha mijozlar ma'lumotlari</p>
              </div>

              <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/5">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Ism</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Telefon</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Ro'yxatdan o'tgan</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Buyurtmalar soni</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {users.map((user) => {
                        const userOrders = orders.filter(order => order.user_id === user.id)
                        
                        return (
                          <tr key={user.id} className="hover:bg-white/5">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-white">{user.name || 'Noma\'lum'}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                              {user.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                              {user.phone || 'Noma\'lum'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                              {new Date(user.created_at).toLocaleDateString('uz-UZ')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                              {userOrders.length}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {currentPage === 'analytics' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white">Analitika</h2>
                <p className="text-gray-400">Sotuvlar va daromad tahlili</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                  <h3 className="text-lg font-semibold text-white mb-4">Oylik Sotuvlar</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Bu oy</span>
                      <span className="text-white font-semibold">{dashboardStats.ordersThisMonth}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Jami</span>
                      <span className="text-white font-semibold">{dashboardStats.totalOrders}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                  <h3 className="text-lg font-semibold text-white mb-4">Daromad</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Bu oy</span>
                      <span className="text-white font-semibold">${dashboardStats.revenueThisMonth.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Jami</span>
                      <span className="text-white font-semibold">${dashboardStats.totalRevenue.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentPage === 'settings' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white">Sozlamalar</h2>
                <p className="text-gray-400">Tizim sozlamalari</p>
              </div>

              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                <h3 className="text-lg font-semibold text-white mb-4">Umumiy Sozlamalar</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Sayt nomi</label>
                    <input
                      type="text"
                      defaultValue="Eurodoor"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Admin email</label>
                    <input
                      type="email"
                      defaultValue="admin@eurodoor.uz"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Telefon raqam</label>
                    <input
                      type="tel"
                      defaultValue="+998 90 123 45 67"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40 transition-colors"
                    />
                  </div>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors">
                    Saqlash
                  </button>
                </div>
              </div>
          </div>
        )}
      </main>
      </div>

      {/* Add Product Modal */}
      {showAddProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center p-4 z-50 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-gray-800 rounded-2xl p-6 w-full max-w-2xl border border-white/20 mt-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Yangi mahsulot qo'shish</h2>
              <button
                onClick={() => setShowAddProduct(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-4 max-h-96 overflow-y-auto">
              {/* Mahsulot nomi */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Mahsulot nomi
                </label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40 transition-colors"
                  placeholder="Masalan: Premium Eshik"
                  required
                />
              </div>

              {/* Material */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Material
                </label>
                <input
                  type="text"
                  value={newProduct.material}
                  onChange={(e) => setNewProduct({...newProduct, material: e.target.value})}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40 transition-colors"
                  placeholder="Masalan: Metall"
                  required
                />
              </div>

              {/* Xavfsizlik */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Xavfsizlik
                </label>
                <input
                  type="text"
                  value={newProduct.security}
                  onChange={(e) => setNewProduct({...newProduct, security: e.target.value})}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40 transition-colors"
                  placeholder="Masalan: Yuqori darajada xavfsiz"
                  required
                />
              </div>

              {/* O'lchamlar */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  O'lchamlar
                </label>
                <select 
                  value={newProduct.dimensions}
                  onChange={(e) => setNewProduct({...newProduct, dimensions: e.target.value})}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40 transition-colors"
                  required
                >
                  <option value="">O'lchamni tanlang</option>
                  <option value="2000x800">2000x800 mm</option>
                  <option value="2100x900">2100x900 mm</option>
                  <option value="2200x1000">2200x1000 mm</option>
                  <option value="2300x1100">2300x1100 mm</option>
                  <option value="2400x1200">2400x1200 mm</option>
                  <option value="Boshqa o'lcham">Boshqa o'lcham</option>
                </select>
                
                {newProduct.dimensions === "Boshqa o'lcham" && (
                  <input
                    type="text"
                    value={newProduct.customDimensions}
                    onChange={(e) => setNewProduct({...newProduct, customDimensions: e.target.value, dimensions: e.target.value})}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40 transition-colors mt-2"
                    placeholder="Masalan: 2500x1300 mm"
                    required
                  />
                )}
              </div>

              {/* Qulf bosqichlari */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Qulf bosqichlari
                </label>
                <select 
                  value={newProduct.lockStages}
                  onChange={(e) => setNewProduct({...newProduct, lockStages: e.target.value})}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40 transition-colors"
                  required
                >
                  <option value="">Qulf bosqichlarini tanlang</option>
                  <option value="3">3-nuqtali</option>
                  <option value="4">4-nuqtali</option>
                  <option value="5">5-nuqtali</option>
                  <option value="6">6-nuqtali</option>
                  <option value="7">7-nuqtali</option>
                  <option value="8">8-nuqtali</option>
                  <option value="9">9-nuqtali</option>
                  <option value="10">10-nuqtali</option>
                </select>
              </div>

              {/* Eshik qalinligi */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Eshik qalinligi
                </label>
                <select 
                  value={newProduct.thickness}
                  onChange={(e) => setNewProduct({...newProduct, thickness: e.target.value})}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40 transition-colors"
                  required
                >
                  <option value="">Qalinlikni tanlang</option>
                  <option value="80">80mm</option>
                  <option value="90">90mm</option>
                  <option value="100">100mm</option>
                </select>
              </div>

              {/* Narx */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Narx
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                    className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40 transition-colors"
                    placeholder="0"
                    required
                  />
                  <div className="flex space-x-1">
                    <button
                      type="button"
                      onClick={() => setNewProduct({...newProduct, currency: 'USD'})}
                      className={`px-4 py-3 rounded-lg font-semibold transition-colors ${
                        newProduct.currency === 'USD' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-white/10 text-gray-300 hover:bg-white/20'
                      }`}
                    >
                      $
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewProduct({...newProduct, currency: 'UZS'})}
                      className={`px-4 py-3 rounded-lg font-semibold transition-colors ${
                        newProduct.currency === 'UZS' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-white/10 text-gray-300 hover:bg-white/20'
                      }`}
                    >
                      S
                    </button>
                  </div>
                </div>
              </div>

              {/* Rasm yuklash */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Rasm
                </label>
                <input
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={handleImageChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                />
                <p className="text-xs text-gray-400 mt-1">PNG yoki JPEG formatda</p>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddProduct(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={isAddingProduct}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  {isAddingProduct ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Qo'shilmoqda...</span>
                    </>
                  ) : (
                    <span>Qo'shish</span>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default AdminPanel