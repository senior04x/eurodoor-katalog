import React, { useState, useEffect } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { Package, User, Phone, MessageCircle, Calendar, Eye, Trash2, Lock, Plus, LogOut, ExternalLink, Edit, EyeOff } from 'lucide-react';
import { ordersApi, Order } from '../lib/supabase';
import { productsApi, Product } from '../lib/productsApi';
import { motion } from 'framer-motion';

export default function AdminPanel() {
  const { t } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [showProducts, setShowProducts] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    material: '',
    security: '',
    dimensions: '',
    customDimensions: '',
    description: '',
    image: ''
  });
  const [isAddingProduct, setIsAddingProduct] = useState(false);

  // Admin paroli - bu yerdan o'zgartiring
  const ADMIN_PASSWORD = 'eurodoor2025';

  // LocalStorage ni tozalash funksiyasi
  const clearLocalStorage = () => {
    localStorage.removeItem('adminProducts');
    localStorage.removeItem('orders');
    localStorage.removeItem('lastOrder');
    localStorage.removeItem('selectedProduct');
    console.log('🧹 LocalStorage cleared');
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        // Zakazlarni yuklash
        console.log('🔄 Loading orders from Supabase backend...');
        const orders = await ordersApi.getAllOrders();
        console.log('✅ Orders loaded from backend:', orders.length);
        setOrders(orders);
        
        // Mahsulotlarni yuklash
        console.log('🔄 Loading products...');
        const products = await productsApi.getAllProducts();
        console.log('✅ Products loaded:', products.length);
        setProducts(products);
        
        if (orders.length === 0) {
          console.log('📭 No orders found in backend database');
        }
      } catch (error) {
        console.error('❌ Error loading data:', error);
        setOrders([]);
        setProducts([]);
      }
    };
    
    loadData();
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setError('');
      setPassword('');
    } else {
      setError('Noto\'g\'ri parol!');
      setPassword('');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword('');
    setError('');
  };

  const deleteOrder = async (orderId: string) => {
    try {
      // Supabase dan zakazni o'chirish
      const success = await ordersApi.deleteOrder(orderId);
      
      if (success) {
        // Muvaffaqiyatli o'chirilgan
        const updatedOrders = orders.filter(order => order.id !== orderId);
        setOrders(updatedOrders);
        
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(null);
        }
      } else {
        // Xatolik bo'lsa localStorage dan o'chirish (fallback)
        const updatedOrders = orders.filter(order => order.id !== orderId);
        setOrders(updatedOrders);
        localStorage.setItem('orders', JSON.stringify(updatedOrders));
        
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(null);
        }
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      
      // Xatolik bo'lsa localStorage dan o'chirish (fallback)
      const updatedOrders = orders.filter(order => order.id !== orderId);
      setOrders(updatedOrders);
      localStorage.setItem('orders', JSON.stringify(updatedOrders));
      
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(null);
      }
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      console.log('Updating order status:', orderId, newStatus);
      const success = await ordersApi.updateOrderStatus(orderId, newStatus);
      
      if (success) {
        console.log('✅ Order status updated successfully');
        // UI ni yangilash
        setOrders(orders.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        ));
        if (selectedOrder?.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
      } else {
        console.error('❌ Failed to update order status');
        alert('Zakaz holatini yangilashda xatolik yuz berdi!');
      }
    } catch (error) {
      console.error('❌ Error updating order status:', error);
      alert('Zakaz holatini yangilashda xatolik yuz berdi!');
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('uz-UZ', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Avtomatik tarjima funksiyasi
  const translateText = async (text: string, targetLang: string) => {
    // Bu yerda haqiqiy tarjima API ishlatilishi mumkin
    // Hozircha oddiy mapping qilamiz
    const translations: { [key: string]: { [key: string]: string } } = {
      'A+ sinf': {
        'ru': 'Класс A+',
        'en': 'Class A+'
      },
      'A sinf': {
        'ru': 'Класс A',
        'en': 'Class A'
      },
      'B+ sinf': {
        'ru': 'Класс B+',
        'en': 'Class B+'
      },
      'Premium': {
        'ru': 'Премиум',
        'en': 'Premium'
      },
      'Metall + MDF': {
        'ru': 'Металл + МДФ',
        'en': 'Metal + MDF'
      },
      'MDF + MDF': {
        'ru': 'МДФ + МДФ',
        'en': 'MDF + MDF'
      },
      'Metall + Metall': {
        'ru': 'Металл + Металл',
        'en': 'Metal + Metal'
      },
      'Metall + MDF + Oyna': {
        'ru': 'Металл + МДФ + Стекло',
        'en': 'Metal + MDF + Glass'
      },
      'Metall + Kompozit': {
        'ru': 'Металл + Композит',
        'en': 'Metal + Composite'
      }
    };

    return translations[text]?.[targetLang] || text;
  };

  // Mahsulot qo'shish funksiyasi
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isAddingProduct) return; // Agar qo'shish jarayoni davom etsa, qayta ishlamasin
    
    setIsAddingProduct(true);
    
    try {
      // Yangi mahsulot ID yaratish
      const productId = `euro-model${Date.now()}`;
      
      // Tarjimalar yaratish
      const nameRu = await translateText(newProduct.name, 'ru');
      const nameEn = await translateText(newProduct.name, 'en');
      const materialRu = await translateText(newProduct.material, 'ru');
      const materialEn = await translateText(newProduct.material, 'en');
      const securityRu = await translateText(newProduct.security, 'ru');
      const securityEn = await translateText(newProduct.security, 'en');
      const descriptionRu = await translateText(newProduct.description, 'ru');
      const descriptionEn = await translateText(newProduct.description, 'en');
      
      // O'lchamlarni aniqlash
      const finalDimensions = newProduct.dimensions === 'custom' ? newProduct.customDimensions : newProduct.dimensions;
      
      // Yangi mahsulot obyekti (Supabase format)
      const product = {
        id: productId,
        name: newProduct.name,
        name_ru: nameRu,
        name_en: nameEn,
        image: newProduct.image || 'https://iili.io/KqcGK21.jpg', // Default image
        material: newProduct.material,
        material_ru: materialRu,
        material_en: materialEn,
        security: newProduct.security,
        security_ru: securityRu,
        security_en: securityEn,
        dimensions: finalDimensions,
        description: newProduct.description,
        description_ru: descriptionRu,
        description_en: descriptionEn,
        is_active: true
      };

      // Backend API orqali saqlash
      const success = await productsApi.addProduct(product);
      
      if (success) {
        // UI ni yangilash
        setProducts(prev => [...prev, product]);
      } else {
        throw new Error('Failed to save product');
      }

      // Formani tozalash
      setNewProduct({
        name: '',
        material: '',
        security: '',
        dimensions: '',
        customDimensions: '',
        description: '',
        image: ''
      });
      
      setShowAddProduct(false);
      
      // Muvaffaqiyat xabari
      alert('Mahsulot muvaffaqiyatli qo\'shildi!');
      
    } catch (error) {
      console.error('Error adding product:', error);
      
      // Foydalanuvchiga aniqroq xabar berish
      const errorMessage = error instanceof Error ? error.message : 'Noma\'lum xatolik';
      
      if (errorMessage.includes('Supabase error')) {
        alert('Server bilan bog\'lanishda xatolik! Mahsulot mahalliy saqlanadi. Sahifani yangilang.\n\nConsole da xatolikni ko\'ring: F12 > Console');
      } else if (errorMessage.includes('Connection error')) {
        alert('Internet aloqasi yo\'q! Mahsulot mahalliy saqlanadi. Internet qayta ulangandan keyin qaytadan urinib ko\'ring.');
      } else {
        alert('Mahsulot qo\'shishda xatolik yuz berdi! Iltimos, qaytadan urinib ko\'ring.\n\nConsole da xatolikni ko\'ring: F12 > Console');
      }
    } finally {
      setIsAddingProduct(false);
    }
  };

  // Mahsulot o'chirish funksiyasi
  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Bu mahsulotni o\'chirishni xohlaysizmi?')) {
      return;
    }

    try {
      const success = await productsApi.deleteProduct(productId);
      
      if (success) {
        // UI dan o'chirish
        setProducts(prev => prev.filter(p => p.id !== productId));
        alert('Mahsulot muvaffaqiyatli o\'chirildi!');
      } else {
        alert('Mahsulot o\'chirishda xatolik yuz berdi!');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Mahsulot o\'chirishda xatolik yuz berdi!');
    }
  };

  // Mahsulot holatini o'zgartirish
  const handleToggleProductStatus = async (productId: string) => {
    try {
      const success = await productsApi.toggleProductStatus(productId);
      
      if (success) {
        // UI ni yangilash
        setProducts(prev => prev.map(p => 
          p.id === productId ? { ...p, is_active: !p.is_active } : p
        ));
      } else {
        alert('Mahsulot holatini o\'zgartirishda xatolik yuz berdi!');
      }
    } catch (error) {
      console.error('Error toggling product status:', error);
      alert('Mahsulot holatini o\'zgartirishda xatolik yuz berdi!');
    }
  };

  // Agar autentifikatsiya bo'lmagan bo'lsa, login form ko'rsatish
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white/3 backdrop-blur-sm rounded-2xl p-8 border border-white/20 max-w-md w-full">
          <div className="text-center mb-6">
            <Lock className="h-12 w-12 text-white mx-auto mb-4" />
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
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:border-white/40 transition-colors"
                required
              />
            </div>
            
            {error && (
              <div className="text-red-400 text-sm text-center">
                {error}
              </div>
            )}
            
            <button
              type="submit"
              className="w-full bg-white/20 text-white py-3 px-6 rounded-lg font-semibold hover:bg-white/30 transition-colors duration-300"
            >
              Kirish
            </button>
          </form>

          {/* Sayt linki */}
          <div className="mt-6 pt-6 border-t border-white/20">
            <p className="text-gray-300 text-sm text-center mb-3">
              Saytni ko'rish uchun:
            </p>
            <a
              href="https://eurodoor.uz"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-blue-500/20 text-blue-300 py-3 px-6 rounded-lg font-semibold hover:bg-blue-500/30 transition-colors duration-300"
            >
              <ExternalLink className="h-4 w-4" />
              eurodoor.uz saytini ochish
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Admin Panel Header - Mobilga moslashtirilgan */}
      <div className="bg-white/5 backdrop-blur-md border-b border-white/20 p-3 sm:p-4">
        <div className="container mx-auto max-w-6xl">
          {/* Logo va sarlavha - mobil uchun vertikal */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            {/* Logo va "Admin Panel" */}
            <div className="flex items-center gap-3">
              <img 
                src="https://iili.io/K2WCLJV.png" 
                alt="EURODOOR Logo" 
                className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
              />
              <div className="flex flex-col">
                <p className="text-gray-300 text-xs sm:text-sm font-medium">Admin Panel</p>
              </div>
            </div>
            
            {/* Action Buttons - mobil uchun moslashtirilgan */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <button
                onClick={() => setShowProducts(!showProducts)}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors text-xs sm:text-sm"
              >
                <Package className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">
                  {showProducts ? 'Zakazlarni ko\'rish' : 'Mahsulotlarni ko\'rish'}
                </span>
                <span className="sm:hidden">
                  {showProducts ? 'Zakazlar' : 'Mahsulotlar'}
                </span>
              </button>
              <button
                onClick={() => setShowAddProduct(true)}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 bg-green-500/20 text-green-300 rounded-lg hover:bg-green-500/30 transition-colors text-xs sm:text-sm"
              >
                <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Mahsulot qo'shish</span>
                <span className="sm:hidden">Qo'shish</span>
              </button>
              <button
                onClick={clearLocalStorage}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 bg-yellow-500/20 text-yellow-300 rounded-lg hover:bg-yellow-500/30 transition-colors text-xs sm:text-sm"
              >
                <Package className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Tozalash</span>
                <span className="sm:hidden">Tozalash</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors text-xs sm:text-sm"
              >
                <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Chiqish</span>
                <span className="sm:hidden">Chiqish</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl p-4">

        <div className="max-w-4xl mx-auto">
          {/* Mahsulotlar yoki Zakazlar */}
          {showProducts ? (
            /* Mahsulotlar ro'yxati */
            <div>
              <div className="bg-white/3 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Mahsulotlar ({products.length})
                </h2>
                
                {products.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">Hozircha mahsulotlar yo'q</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {products.map((product) => (
                      <div key={product.id} className="p-4 rounded-lg border bg-white/5 border-white/20 hover:bg-white/10 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <img 
                              src={product.image} 
                              alt={product.name}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                            <div>
                              <h3 className="font-semibold text-white">{product.name}</h3>
                              <p className="text-sm text-gray-300">{product.material}</p>
                              <p className="text-xs text-gray-400">{product.dimensions}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded text-xs ${
                              product.is_active 
                                ? 'bg-green-500/20 text-green-300' 
                                : 'bg-red-500/20 text-red-300'
                            }`}>
                              {product.is_active ? 'Faol' : 'Nofaol'}
                            </span>
                            <button
                              onClick={() => handleToggleProductStatus(product.id)}
                              className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
                              title={product.is_active ? 'Nofaol qilish' : 'Faol qilish'}
                            >
                              {product.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="p-1 text-red-400 hover:text-red-300 transition-colors"
                              title="O'chirish"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Zakazlar ro'yxati */
            <div className="bg-white/3 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Package className="h-5 w-5" />
                Zakazlar ({orders.length})
              </h2>
              
              {orders.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400">Hozircha zakazlar yo'q</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((order) => (
                    <div key={order.id} className="space-y-2">
                      {/* Zakaz kartasi */}
                      <div
                        className={`p-4 rounded-lg border cursor-pointer transition-all ${
                          selectedOrder?.id === order.id
                            ? 'bg-white/20 border-white/40'
                            : 'bg-white/5 border-white/20 hover:bg-white/10'
                        }`}
                        onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-white">{order.customer.name}</h3>
                            <p className="text-sm text-gray-300">{order.product.name}</p>
                            <p className="text-xs text-gray-400">{formatDate(order.timestamp)}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded text-xs ${
                              order.status === 'new' 
                                ? 'bg-green-500/20 text-green-300' 
                                : order.status === 'accepted'
                                ? 'bg-blue-500/20 text-blue-300'
                                : order.status === 'completed'
                                ? 'bg-purple-500/20 text-purple-300'
                                : 'bg-gray-500/20 text-gray-300'
                            }`}>
                              {order.status === 'new' ? 'Yangi' : 
                               order.status === 'accepted' ? 'Qabul qilindi' :
                               order.status === 'completed' ? 'Yakunlandi' : order.status}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteOrder(order.id);
                              }}
                              className="p-1 text-red-400 hover:text-red-300 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Zakaz tafsilotlari (animatsiya bilan) */}
                      {selectedOrder?.id === order.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0, y: -10 }}
                          animate={{ opacity: 1, height: 'auto', y: 0 }}
                          exit={{ opacity: 0, height: 0, y: -10 }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                          className="bg-white/3 backdrop-blur-sm rounded-lg p-4 border border-white/20 overflow-hidden"
                        >
                          <div className="space-y-4">
                            {/* Customer Info */}
                            <div>
                              <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                                <User className="h-4 w-4" />
                                Mijoz ma'lumotlari
                              </h4>
                              <div className="space-y-2 text-sm">
                                <div>
                                  <span className="text-gray-300">Ism:</span>
                                  <span className="text-white ml-2">{order.customer.name}</span>
                                </div>
                                <div>
                                  <span className="text-gray-300">Telefon:</span>
                                  <span className="text-white ml-2">{order.customer.phone}</span>
                                </div>
                                {order.customer.message && (
                                  <div>
                                    <span className="text-gray-300">Xabar:</span>
                                    <p className="text-white mt-1">{order.customer.message}</p>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Product Info */}
                            <div>
                              <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                                <Package className="h-4 w-4" />
                                Mahsulot ma'lumotlari
                              </h4>
                              <div className="space-y-2 text-sm">
                                <div>
                                  <span className="text-gray-300">Nomi:</span>
                                  <span className="text-white ml-2">{order.product.name}</span>
                                </div>
                                {order.product.material && (
                                  <div>
                                    <span className="text-gray-300">Material:</span>
                                    <span className="text-white ml-2">{order.product.material}</span>
                                  </div>
                                )}
                                {order.product.security && (
                                  <div>
                                    <span className="text-gray-300">Xavfsizlik:</span>
                                    <span className="text-white ml-2">{order.product.security}</span>
                                  </div>
                                )}
                                {order.product.dimensions && (
                                  <div>
                                    <span className="text-gray-300">O'lchamlar:</span>
                                    <span className="text-white ml-2">{order.product.dimensions}</span>
                                  </div>
                                )}
                                {order.product.price && (
                                  <div>
                                    <span className="text-gray-300">Narx:</span>
                                    <span className="text-white ml-2">{order.product.price}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Order Info */}
                            <div>
                              <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                Zakaz ma'lumotlari
                              </h4>
                              <div className="space-y-2 text-sm">
                                <div>
                                  <span className="text-gray-300">ID:</span>
                                  <span className="text-white ml-2 font-mono">{order.id}</span>
                                </div>
                                <div>
                                  <span className="text-gray-300">Sana:</span>
                                  <span className="text-white ml-2">{formatDate(order.timestamp)}</span>
                                </div>
                                <div>
                                  <span className="text-gray-300">Holat:</span>
                                  <span className={`ml-2 px-2 py-1 rounded text-xs ${
                                    order.status === 'new' 
                                      ? 'bg-green-500/20 text-green-300' 
                                      : order.status === 'accepted'
                                      ? 'bg-blue-500/20 text-blue-300'
                                      : order.status === 'completed'
                                      ? 'bg-purple-500/20 text-purple-300'
                                      : 'bg-gray-500/20 text-gray-300'
                                  }`}>
                                    {order.status === 'new' ? 'Yangi' : 
                                     order.status === 'accepted' ? 'Qabul qilindi' :
                                     order.status === 'completed' ? 'Yakunlandi' : order.status}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Status Actions */}
                            <div>
                              <h4 className="font-semibold text-white mb-2">Zakaz holatini o'zgartirish</h4>
                              <div className="flex flex-wrap gap-2">
                                {order.status === 'new' && (
                                  <button
                                    onClick={() => updateOrderStatus(order.id, 'accepted')}
                                    className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-lg text-sm hover:bg-blue-500/30 transition-colors"
                                  >
                                    Qabul qilish
                                  </button>
                                )}
                                {order.status === 'accepted' && (
                                  <button
                                    onClick={() => updateOrderStatus(order.id, 'completed')}
                                    className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-lg text-sm hover:bg-purple-500/30 transition-colors"
                                  >
                                    Yakunlash
                                  </button>
                                )}
                                {order.status === 'completed' && (
                                  <button
                                    onClick={() => updateOrderStatus(order.id, 'new')}
                                    className="px-3 py-1 bg-green-500/20 text-green-300 rounded-lg text-sm hover:bg-green-500/30 transition-colors"
                                  >
                                    Yangi qilish
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 max-w-md w-full"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Yangi mahsulot qo'shish</h2>
              <button
                onClick={() => setShowAddProduct(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Mahsulot nomi (O'zbek tilida)
                </label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:border-white/40 transition-colors"
                  placeholder="Masalan: EURO Model-558 Metal Door"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Material
                </label>
                <select 
                  value={newProduct.material}
                  onChange={(e) => setNewProduct({...newProduct, material: e.target.value})}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40 transition-colors"
                  required
                >
                  <option value="">Materialni tanlang</option>
                  <option value="Metall + MDF">Metall + MDF</option>
                  <option value="MDF + MDF">MDF + MDF</option>
                  <option value="Metall + Metall">Metall + Metall</option>
                  <option value="Metall + MDF + Oyna">Metall + MDF + Oyna</option>
                  <option value="Metall + Kompozit">Metall + Kompozit</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Xavfsizlik darajasi
                </label>
                <select 
                  value={newProduct.security}
                  onChange={(e) => setNewProduct({...newProduct, security: e.target.value})}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40 transition-colors"
                  required
                >
                  <option value="">Xavfsizlik darajasini tanlang</option>
                  <option value="A+ sinf">A+ sinf</option>
                  <option value="A sinf">A sinf</option>
                  <option value="B+ sinf">B+ sinf</option>
                  <option value="Premium">Premium</option>
                </select>
              </div>
              
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
                  <option value="2050x860mm + 2050x960mm + 100mm">2050x860mm + 2050x960mm + 100mm</option>
                  <option value="2050x860mm + 90mm">2050x860mm + 90mm</option>
                  <option value="2300x860mm">2300x860mm</option>
                  <option value="2050x860mm + 2050x960mm + 90mm">2050x860mm + 2050x960mm + 90mm</option>
                  <option value="2050x860mm + 2050x960mm + 80mm">2050x860mm + 2050x960mm + 80mm</option>
                  <option value="2050x860mm">2050x860mm</option>
                  <option value="custom">Boshqa o'lcham</option>
                </select>
                
                {/* Custom dimensions input */}
                {newProduct.dimensions === 'custom' && (
                  <div className="mt-3">
                    <input
                      type="text"
                      value={newProduct.customDimensions}
                      onChange={(e) => setNewProduct({...newProduct, customDimensions: e.target.value})}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:border-white/40 transition-colors"
                      placeholder="Masalan: 2100x900mm + 50mm"
                      required
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      💡 O'zingizning o'lchamingizni kiriting
                    </p>
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tavsif (O'zbek tilida)
                </label>
                <textarea
                  rows={3}
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:border-white/40 transition-colors resize-none"
                  placeholder="Mahsulot tavsifini kiriting"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Rasm URL (ixtiyoriy)
                </label>
                <input
                  type="url"
                  value={newProduct.image}
                  onChange={(e) => setNewProduct({...newProduct, image: e.target.value})}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:border-white/40 transition-colors"
                  placeholder="https://example.com/image.jpg (bo'sh qoldirilsa default rasm ishlatiladi)"
                />
                <p className="text-xs text-gray-400 mt-1">
                  💡 Rasm joylasa avtomatik link qilib saqlanadi
                </p>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddProduct(false)}
                  className="flex-1 px-4 py-3 bg-gray-500/20 text-gray-300 rounded-lg hover:bg-gray-500/30 transition-colors"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={isAddingProduct}
                  className="flex-1 px-4 py-3 bg-green-500/20 text-green-300 rounded-lg hover:bg-green-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAddingProduct ? 'Qo\'shilmoqda...' : 'Mahsulot qo\'shish'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
