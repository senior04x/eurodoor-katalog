import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, Package, Phone, MapPin, Calendar, ArrowLeft, Home } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'

interface OrderSuccessPageProps {
  onNavigate: (page: string) => void
}

export default function OrderSuccessPage({ onNavigate }: OrderSuccessPageProps) {
  const { t } = useLanguage()
  const [orderData, setOrderData] = useState<any>(null)


  useEffect(() => {
    // LocalStorage dan so'nggi buyurtma ma'lumotlarini olish
    const lastOrder = localStorage.getItem('lastOrder')
    if (lastOrder) {
      try {
        setOrderData(JSON.parse(lastOrder))
      } catch (error) {
        console.error('Error parsing last order:', error)
      }
    }
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Muvaffaqiyat xabari */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Buyurtma muvaffaqiyatli qabul qilindi! 🎉
          </h1>
          
          <p className="text-lg text-gray-600 mb-2">
            Sizning buyurtmangiz qabul qilindi va tez orada qayta ishlanadi.
          </p>
          
          <p className="text-gray-500">
            Buyurtma holatini kuzatish uchun "Buyurtmalarim" bo'limidan foydalaning.
          </p>
        </motion.div>

        {/* Buyurtma ma'lumotlari */}
        {orderData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-lg p-6 mb-8"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Package className="w-5 h-5 mr-2 text-blue-600" />
              Buyurtma ma'lumotlari
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Buyurtma raqami */}
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <Package className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Buyurtma raqami</p>
                  <p className="font-semibold text-gray-900">{orderData.order_number}</p>
                </div>
              </div>

              {/* Sana */}
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                  <Calendar className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Sana</p>
                  <p className="font-semibold text-gray-900">{formatDate(orderData.created_at)}</p>
                </div>
              </div>

              {/* Mijoz nomi */}
              <div className="flex items-center">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                  <Phone className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Mijoz</p>
                  <p className="font-semibold text-gray-900">{orderData.customer_name}</p>
                </div>
              </div>

              {/* Telefon */}
              <div className="flex items-center">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                  <Phone className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Telefon</p>
                  <p className="font-semibold text-gray-900">{orderData.customer_phone}</p>
                </div>
              </div>

              {/* Yetkazib berish manzili */}
              {orderData.delivery_address && (
                <div className="flex items-center md:col-span-2">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                    <MapPin className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Yetkazib berish manzili</p>
                    <p className="font-semibold text-gray-900">{orderData.delivery_address}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Mahsulotlar */}
            {orderData.products && orderData.products.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Buyurtma qilingan mahsulotlar</h3>
                <div className="space-y-3">
                  {orderData.products.map((product: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        {product.image && (
                          <img 
                            src={product.image} 
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded-lg mr-3"
                          />
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{product.name}</p>
                          {product.dimensions && (
                            <p className="text-sm text-gray-500">O'lcham: {product.dimensions}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{product.quantity} ta</p>
                        <p className="text-sm text-gray-500">{product.price} UZS</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Jami summa */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Jami summa:</span>
                    <span className="text-xl font-bold text-blue-600">{orderData.total_amount} UZS</span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Keyingi qadamlar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-blue-50 rounded-lg p-6 mb-8"
        >
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Keyingi qadamlar</h3>
          <div className="space-y-3 text-blue-800">
            <p>• Bizning mutaxassislarimiz siz bilan tez orada bog'lanadi</p>
            <p>• Mahsulot tayyor bo'lganda sizga xabar beramiz</p>
            <p>• Yetkazib berish vaqti kelishiladi</p>
            <p>• Buyurtma holatini "Buyurtmalarim" bo'limidan kuzatishingiz mumkin</p>
          </div>
        </motion.div>

        {/* Tugmalar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <button
            onClick={() => onNavigate('orders')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center"
          >
            <Package className="w-5 h-5 mr-2" />
            Buyurtmalarim
          </button>
          
          <button
            onClick={() => onNavigate('home')}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center"
          >
            <Home className="w-5 h-5 mr-2" />
            Bosh sahifa
          </button>
        </motion.div>
      </div>
    </div>
  )
}