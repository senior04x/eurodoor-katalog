import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react'
import { useCart } from '../contexts/CartContext'
import { useLanguage } from '../contexts/LanguageContext'
import { ImageWithFallback } from './figma/ImageWithFallback'

interface CartSidebarProps {
  onNavigate: (page: string) => void
}

export default function CartSidebar({ onNavigate }: CartSidebarProps) {
  const { items, totalItems, totalPrice, updateQuantity, removeFromCart, clearCart, isCartOpen, setIsCartOpen } = useCart()
  const { t } = useLanguage()

  // Modal ochilganda header blur ni o'chirish
  useEffect(() => {
    const header = document.querySelector('header')
    if (header) {
      if (isCartOpen) {
        header.classList.remove('backdrop-blur-sm')
      } else {
        header.classList.add('backdrop-blur-sm')
      }
    }
  }, [isCartOpen])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uz-UZ', {
      style: 'currency',
      currency: 'UZS',
      minimumFractionDigits: 0
    }).format(price)
  }

  const handleCheckout = () => {
    setIsCartOpen(false)
    onNavigate('contact')
  }


  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/30 cart-backdrop-blur z-[9998]"
            style={{
              backdropFilter: 'blur(8px) !important',
              WebkitBackdropFilter: 'blur(8px) !important'
            }}
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed right-0 top-0 h-screen w-full md:w-2/5 bg-black/30 cart-modal-blur shadow-2xl z-[9999] flex flex-col border-l border-white/30"
            style={{
              backdropFilter: 'blur(24px) saturate(150%) !important',
              WebkitBackdropFilter: 'blur(24px) saturate(150%) !important'
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-8 border-b border-white/20">
              <h2 className="text-xl font-semibold text-white">
                {t('cart.title')} ({totalItems})
              </h2>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-white/80" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingBag className="h-16 w-16 text-white/50 mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">
                    {t('cart.empty')}
                  </h3>
                  <p className="text-white/70 mb-6">
                    {t('cart.empty_desc')}
                  </p>
                  <button
                    onClick={() => {
                      setIsCartOpen(false)
                      onNavigate('catalog')
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500/30 to-purple-500/30 text-white rounded-xl hover:from-blue-500/40 hover:to-purple-500/40 transition-all duration-300 border border-blue-500/50 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    {t('cart.go_to_catalog')}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <motion.div
                      key={`${item.id}-${item.dimensions}-${item.color}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center space-x-4 p-4 bg-gradient-to-br from-black/40 to-black/20 cart-item-blur rounded-xl border border-white/30 hover:border-blue-500/50 transition-all duration-300"
                    >
                      <ImageWithFallback
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-white truncate">
                          {item.name}
                        </h4>
                        {item.dimensions && (
                          <p className="text-xs text-white/70">
                            {t('cart.dimensions')}: {item.dimensions}
                          </p>
                        )}
                        {item.color && (
                          <p className="text-xs text-white/70">
                            {t('cart.color')}: {item.color}
                          </p>
                        )}
                        <p className="text-sm font-semibold text-blue-300">
                          {formatPrice(item.price)}
                        </p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 hover:bg-white/20 rounded-full transition-colors"
                        >
                          <Minus className="h-4 w-4 text-white" />
                        </button>
                        
                        <span className="w-8 text-center text-sm font-medium text-white">
                          {item.quantity}
                        </span>
                        
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 hover:bg-white/20 rounded-full transition-colors"
                        >
                          <Plus className="h-4 w-4 text-white" />
                        </button>
                        
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-1 hover:bg-red-500/20 rounded-full transition-colors ml-2"
                        >
                          <Trash2 className="h-4 w-4 text-red-400" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-white/20 p-8 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-white">
                    {t('cart.total')}:
                  </span>
                  <span className="text-xl font-bold text-blue-300">
                    {formatPrice(totalPrice)}
                  </span>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={clearCart}
                    className="flex-1 px-4 py-2 border border-white/30 text-white rounded-xl hover:bg-white/20 transition-all duration-300"
                  >
                    {t('cart.clear')}
                  </button>
                  <button
                    onClick={handleCheckout}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500/30 to-purple-500/30 text-white rounded-xl hover:from-blue-500/40 hover:to-purple-500/40 transition-all duration-300 border border-blue-500/50 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    {t('cart.checkout')}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
