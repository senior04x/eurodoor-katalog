import React, { useState, useEffect } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { Package, User, Phone, MessageCircle, Calendar, Eye, Trash2, Lock } from 'lucide-react';
import { ordersApi, Order } from '../lib/supabase';
import { motion } from 'framer-motion';

export default function AdminPanel() {
  const { t } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Admin paroli - bu yerdan o'zgartiring
  const ADMIN_PASSWORD = 'eurodoor2025';

  useEffect(() => {
    const loadOrders = async () => {
      try {
        // Supabase backend dan zakazlarni olish
        console.log('🔄 Loading orders from Supabase backend...');
        const orders = await ordersApi.getAllOrders();
        console.log('✅ Orders loaded from backend:', orders.length);
        setOrders(orders);
        
        if (orders.length === 0) {
          console.log('📭 No orders found in backend database');
        }
      } catch (error) {
        console.error('❌ Error loading orders from backend:', error);
        setOrders([]); // Xatolik bo'lsa bo'sh array
      }
    };
    
    loadOrders();
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
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="bg-white/3 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Admin Panel</h1>
              <p className="text-gray-300">Mijoz zakazlarini ko'rish va boshqarish</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors"
            >
              Chiqish
            </button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Orders List */}
          <div>
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
          </div>

        </div>
      </div>
    </div>
  );
}
