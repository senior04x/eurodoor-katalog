import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  MapPin, 
  User,
  Phone,
  Calendar,
  AlertCircle,
  Bell,
  RefreshCw
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ordersApi } from '../lib/ordersApi';
import { telegramNotificationService } from '../lib/telegramNotificationService';

interface OrderTrackingNewProps {
  orderNumber?: string;
  customerPhone?: string;
}

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  delivery_address: string;
  total_amount: number;
  currency?: string;
  status: string;
  payment_method?: string;
  notes?: string;
  delivery_date?: string;
  estimated_delivery?: string;
  actual_delivery?: string;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
  order_tracking?: OrderTracking[];
}

interface OrderItem {
  id: string;
  product_name: string;
  product_model?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  custom_dimensions?: string;
  color?: string;
  material?: string;
  notes?: string;
}

interface OrderTracking {
  id: string;
  status: string;
  status_message?: string;
  location_info?: string;
  delivery_person?: string;
  delivery_contact?: string;
  estimated_delivery?: string;
  actual_delivery?: string;
  created_at: string;
}

const OrderTrackingNew: React.FC<OrderTrackingNewProps> = ({ 
  orderNumber, 
  customerPhone 
}) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchOrderNumber, setSearchOrderNumber] = useState(orderNumber || '');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const orderStatuses = [
    { value: 'pending', label: 'Kutilmoqda', color: 'yellow', icon: Clock },
    { value: 'confirmed', label: 'Tasdiqlangan', color: 'blue', icon: CheckCircle },
    { value: 'processing', label: 'Tayyorlanmoqda', color: 'purple', icon: Package },
    { value: 'ready', label: 'Tayyor', color: 'indigo', icon: Package },
    { value: 'shipped', label: 'Yetkazilmoqda', color: 'cyan', icon: Truck },
    { value: 'delivered', label: 'Yetkazilgan', color: 'green', icon: CheckCircle },
    { value: 'cancelled', label: 'Bekor qilingan', color: 'red', icon: AlertCircle }
  ];

  useEffect(() => {
    if (orderNumber) {
      fetchOrderByNumber(orderNumber);
    } else if (customerPhone) {
      fetchCustomerOrders(customerPhone);
    }
    
    // Real-time subscription for order updates
    const subscription = supabase
      .channel('customer-order-tracking-new', {
        config: {
          broadcast: { self: true },
          presence: { key: 'customer-orders-new' }
        }
      })
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'orders' },
        (payload) => {
          console.log('🔄 Order updated in real-time:', payload.new);
          if (order && order.id === payload.new.id) {
            // Check if this is a status change
            const oldStatus = payload.old?.status;
            const newStatus = payload.new?.status;
            
            if (oldStatus && newStatus && oldStatus !== newStatus) {
              console.log('🔔 OrderTrackingNew: Order status changed:', { oldStatus, newStatus });
              
              // Send Telegram notification
              if (customerPhone) {
                try {
                  const chatId = customerPhone.replace(/\D/g, ''); // Faqat raqamlarni olish
                  
                  telegramNotificationService.sendOrderStatusNotification(
                    chatId,
                    payload.new.order_number,
                    payload.new.customer_name || 'Mijoz',
                    customerPhone,
                    newStatus,
                    payload.new.total_amount,
                    payload.new.delivery_address,
                    payload.new.order_items
                  ).then(result => {
                    if (result.success) {
                      console.log('✅ OrderTrackingNew: Telegram notification sent successfully');
                    } else {
                      console.error('❌ OrderTrackingNew: Telegram notification failed:', result.error);
                    }
                  });
                } catch (error) {
                  console.error('❌ OrderTrackingNew: Telegram notification error:', error);
                }
              }
            }
            
            setOrder(prev => prev ? { ...prev, ...payload.new } : null);
            setLastUpdate(new Date());
          }
        }
      )
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'order_tracking' },
        (payload) => {
          console.log('📊 New tracking entry:', payload.new);
          if (order && order.id === payload.new.order_id) {
            setOrder(prev => prev ? {
              ...prev,
              order_tracking: [...(prev.order_tracking || []), payload.new as OrderTracking]
            } : null);
            setLastUpdate(new Date());
          }
        }
      )
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'order_notifications' },
        (payload) => {
          console.log('🔔 New notification:', payload.new);
          if (order && order.id === payload.new.order_id) {
            // Show browser notification
            if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
              new Notification(payload.new.title, {
                body: payload.new.message,
                icon: '/icon-192.png',
                tag: `order-${order.id}`,
                requireInteraction: true
              });
            }
            setLastUpdate(new Date());
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Customer order tracking subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Real-time order tracking is active!');
        }
      });

    return () => {
      subscription.unsubscribe();
    };
  }, [orderNumber, customerPhone, order?.id]);

  const fetchOrderByNumber = async (orderNum: string) => {
    try {
      console.log('🔄 OrderTrackingNew: Fetching order by number:', orderNum);
      setLoading(true);
      setError(null);
      
      const orderData = await ordersApi.getOrderByNumber(orderNum);
      
      if (orderData) {
        setOrder(orderData);
        setLastUpdate(new Date());
        console.log('✅ OrderTrackingNew: Order found:', orderData);
      } else {
        console.log('⚠️ OrderTrackingNew: Order not found');
        setError('Buyurtma topilmadi');
      }
    } catch (error: any) {
      console.error('❌ OrderTrackingNew: Error fetching order:', error);
      setError('Buyurtmani yuklashda xatolik yuz berdi');
    } finally {
      console.log('✅ OrderTrackingNew: Setting loading to false');
      setLoading(false);
    }
  };

  const fetchCustomerOrders = async (phone: string) => {
    try {
      console.log('🔄 OrderTrackingNew: Fetching customer orders:', phone);
      setLoading(true);
      setError(null);
      
      const orders = await ordersApi.getOrdersByCustomer(phone);
      
      if (orders && orders.length > 0) {
        // Show the most recent order
        setOrder(orders[0]);
        setLastUpdate(new Date());
        console.log('✅ OrderTrackingNew: Customer orders found:', orders.length);
      } else {
        console.log('⚠️ OrderTrackingNew: No orders found for customer');
        setError('Hali buyurtmalar yo\'q');
      }
    } catch (error: any) {
      console.error('❌ OrderTrackingNew: Error fetching customer orders:', error);
      setError('Buyurtmalarni yuklashda xatolik yuz berdi');
    } finally {
      console.log('✅ OrderTrackingNew: Setting loading to false');
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchOrderNumber.trim()) {
      fetchOrderByNumber(searchOrderNumber.trim());
    }
  };

  const handleRefresh = () => {
    if (order) {
      fetchOrderByNumber(order.order_number);
    }
  };

  const getStatusInfo = (status: string) => {
    return orderStatuses.find(s => s.value === status) || orderStatuses[0];
  };

  const getStatusProgress = (status: string) => {
    const statusIndex = orderStatuses.findIndex(s => s.value === status);
    return ((statusIndex + 1) / orderStatuses.length) * 100;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/70">Buyurtma ma'lumotlari yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Xatolik</h2>
          <p className="text-white/70 mb-6">{error}</p>
          
          {!orderNumber && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Buyurtma raqamini kiriting..."
                  value={searchOrderNumber}
                  onChange={(e) => setSearchOrderNumber(e.target.value)}
                  className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleSearch}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Qidirish
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-white/30 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Buyurtma topilmadi</h2>
          <p className="text-white/70">Buyurtma raqamini tekshirib ko'ring</p>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(order.status);
  const StatusIcon = statusInfo.icon;
  const progress = getStatusProgress(order.status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Buyurtma Kuzatuv</h1>
          <p className="text-white/70">Buyurtmangizning holatini real vaqtda kuzating</p>
          {lastUpdate && (
            <p className="text-white/50 text-sm mt-2">
              Oxirgi yangilanish: {lastUpdate.toLocaleTimeString('uz-UZ')}
            </p>
          )}
        </div>

        {/* Order Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-lg rounded-lg shadow-lg p-6 border border-white/20 mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <StatusIcon className={`w-8 h-8 text-${statusInfo.color}-400`} />
              <div>
                <h2 className="text-xl font-semibold text-white">Buyurtma #{order.order_number}</h2>
                <p className="text-white/70">Jami: {order.total_amount} {order.currency || 'UZS'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                title="Yangilash"
              >
                <RefreshCw className="w-5 h-5 text-white/70" />
              </button>
              <div className={`px-4 py-2 rounded-full bg-${statusInfo.color}-500/20 text-${statusInfo.color}-400 border border-${statusInfo.color}-500/30`}>
                {statusInfo.label}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-white/70 mb-2">
              <span>Buyurtma jarayoni</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div 
                className={`bg-gradient-to-r from-${statusInfo.color}-400 to-${statusInfo.color}-600 h-2 rounded-full transition-all duration-500`}
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Order Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-white/80">
              <User className="w-4 h-4 text-white/60" />
              <span>{order.customer_name}</span>
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <Phone className="w-4 h-4 text-white/60" />
              <span>{order.customer_phone}</span>
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <MapPin className="w-4 h-4 text-white/60" />
              <span>{order.delivery_address}</span>
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <Calendar className="w-4 h-4 text-white/60" />
              <span>{new Date(order.created_at).toLocaleDateString('uz-UZ')}</span>
            </div>
          </div>
        </motion.div>

        {/* Order Items */}
        {order.order_items && order.order_items.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/10 backdrop-blur-lg rounded-lg shadow-lg p-6 border border-white/20 mb-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Buyurtma mahsulotlari</h3>
            <div className="space-y-3">
              {order.order_items.map((item, index) => (
                <div key={item.id || index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex-1">
                    <h4 className="text-white font-medium">{item.product_name}</h4>
                    {item.product_model && (
                      <p className="text-white/60 text-sm">Model: {item.product_model}</p>
                    )}
                    {item.custom_dimensions && (
                      <p className="text-white/60 text-sm">O'lcham: {item.custom_dimensions}</p>
                    )}
                    {item.color && (
                      <p className="text-white/60 text-sm">Rang: {item.color}</p>
                    )}
                    {item.material && (
                      <p className="text-white/60 text-sm">Material: {item.material}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-white font-semibold">{item.quantity} ta</p>
                    <p className="text-blue-400 font-semibold">{item.total_price} {order.currency || 'UZS'}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Real-time Tracking Timeline */}
        {order.order_tracking && order.order_tracking.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-lg rounded-lg shadow-lg p-6 border border-white/20"
          >
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Kuzatuv tarixi (Real-time)
            </h3>
            <div className="space-y-4">
              {order.order_tracking
                .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                .map((tracking, index) => {
                  const trackingStatusInfo = getStatusInfo(tracking.status);
                  const TrackingIcon = trackingStatusInfo.icon;
                  
                  return (
                    <div key={tracking.id || index} className="flex items-start space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        tracking.status === 'delivered' ? 'bg-green-500/20' :
                        tracking.status === 'shipped' ? 'bg-cyan-500/20' :
                        tracking.status === 'ready' ? 'bg-indigo-500/20' :
                        tracking.status === 'processing' ? 'bg-purple-500/20' :
                        tracking.status === 'confirmed' ? 'bg-blue-500/20' :
                        'bg-yellow-500/20'
                      }`}>
                        <TrackingIcon className={`w-5 h-5 ${
                          tracking.status === 'delivered' ? 'text-green-400' :
                          tracking.status === 'shipped' ? 'text-cyan-400' :
                          tracking.status === 'ready' ? 'text-indigo-400' :
                          tracking.status === 'processing' ? 'text-purple-400' :
                          tracking.status === 'confirmed' ? 'text-blue-400' :
                          'text-yellow-400'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className={`text-sm font-medium ${
                            tracking.status === 'delivered' ? 'text-green-400' :
                            tracking.status === 'shipped' ? 'text-cyan-400' :
                            tracking.status === 'ready' ? 'text-indigo-400' :
                            tracking.status === 'processing' ? 'text-purple-400' :
                            tracking.status === 'confirmed' ? 'text-blue-400' :
                            'text-yellow-400'
                          }`}>
                            {trackingStatusInfo.label}
                          </h4>
                          <span className="text-white/50 text-xs">
                            {new Date(tracking.created_at).toLocaleString('uz-UZ')}
                          </span>
                        </div>
                        {tracking.status_message && (
                          <p className="text-white/80 text-sm mt-1">{tracking.status_message}</p>
                        )}
                        {tracking.location_info && (
                          <p className="text-white/60 text-xs mt-1 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {tracking.location_info}
                          </p>
                        )}
                        {tracking.delivery_person && (
                          <p className="text-white/60 text-xs mt-1 flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {tracking.delivery_person}
                            {tracking.delivery_contact && ` (${tracking.delivery_contact})`}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </motion.div>
        )}

        {/* Search Form (if no order number provided) */}
        {!orderNumber && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/10 backdrop-blur-lg rounded-lg shadow-lg p-6 border border-white/20 mt-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Boshqa buyurtmani kuzatish</h3>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Buyurtma raqamini kiriting..."
                value={searchOrderNumber}
                onChange={(e) => setSearchOrderNumber(e.target.value)}
                className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleSearch}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Qidirish
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default OrderTrackingNew;
