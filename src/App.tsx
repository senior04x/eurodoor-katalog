import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Header from './components/Header'
import HomePage from './components/HomePage'
import CatalogPage from './components/CatalogPage'
import AboutPage from './components/AboutPage'
import ContactPage from './components/ContactPage'
import ProductDetailPage from './components/ProductDetailPage'
import OrderSuccessPage from './components/OrderSuccessPage'
import OrderTracking from './components/OrderTracking'
import ProfilePage from './components/ProfilePage'
import AppLoader from './components/AppLoader'
import { CartProvider } from './contexts/CartContext'
import { AuthProvider } from './contexts/AuthContext'
import { LanguageProvider } from './contexts/LanguageContext'
import { ToastProvider } from './contexts/ToastContext'
import AuthModal from './components/AuthModal'
import { notificationService } from './lib/notificationService'

function App() {
  // URL hash'dan current page ni olish
  const getInitialPage = () => {
    const hash = window.location.hash.replace('#', '')
    const validPages = ['home', 'catalog', 'about', 'contact', 'orders', 'profile', 'order-success', 'product-detail']
    
    console.log('🔍 getInitialPage - hash:', hash)
    console.log('🔍 getInitialPage - validPages:', validPages)
    
    // Product detail page uchun
    if (hash.startsWith('product-detail/')) {
      console.log('✅ getInitialPage - returning product-detail')
      return 'product-detail'
    }
    
    const isValidPage = validPages.includes(hash)
    console.log('🔍 getInitialPage - isValidPage:', isValidPage)
    const result = isValidPage ? hash : 'home'
    console.log('🔍 getInitialPage - returning:', result)
    
    return result
  }

  // Product ID ni hash'dan olish
  const getProductIdFromHash = () => {
    const hash = window.location.hash.replace('#', '')
    console.log('🔍 getProductIdFromHash - hash:', hash)
    if (hash.startsWith('product-detail/')) {
      const productId = hash.split('/')[1]
      console.log('🔍 getProductIdFromHash - extracted productId:', productId)
      return productId
    }
    console.log('🔍 getProductIdFromHash - no product ID found')
    return null
  }

  const [currentPage, setCurrentPage] = useState(getInitialPage())
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [isTelegramWebApp, setIsTelegramWebApp] = useState(false)

  useEffect(() => {
    // Telegram WebApp ni aniqlash
    const isTelegram = (window as any).Telegram?.WebApp || 
                      window.location.href.includes('t.me') ||
                      window.location.href.includes('telegram.me') ||
                      navigator.userAgent.includes('TelegramBot');
    setIsTelegramWebApp(!!isTelegram);

    // Sayt yuklanishini simulyatsiya qilish
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)

    // Scroll muammosini hal qilish
    document.body.style.overflow = 'auto'
    document.body.classList.remove('overflow-hidden')

    // Hash change listener qo'shish
    const handleHashChange = () => {
      const newPage = getInitialPage()
      const productId = getProductIdFromHash()
      console.log('🔄 Hash changed to:', newPage)
      console.log('🔄 Product ID from hash:', productId)
      
      setCurrentPage(newPage)
      
      // Product detail page uchun selectedProduct ni o'rnatish
      if (newPage === 'product-detail' && productId) {
        setSelectedProduct({ id: productId })
        console.log('✅ Set selectedProduct to:', { id: productId })
      } else {
        setSelectedProduct(null)
      }
    }

    // Service Worker message listener
    const handleServiceWorkerMessage = (event: MessageEvent) => {
      console.log('🔔 Service Worker message received:', event.data);
      
      if (event.data && event.data.type === 'NAVIGATE_TO_ORDERS') {
        console.log('🔔 Navigating to orders page from Service Worker');
        handleNavigate('orders');
      }
    }

    // Notification permission tekshirish va Service Worker register qilish
    const initializeNotifications = async () => {
      try {
        console.log('🔔 Checking notification permission...');
        const permission = notificationService.getPermissionStatus();
        console.log('🔔 Current permission status:', permission);
        
        if (permission === 'granted') {
          console.log('✅ Notification permission already granted');
          // Service Worker'ni register qilish
          await notificationService.registerServiceWorker();
          console.log('✅ Service Worker registered');
          // Global order watching'ni boshlash
          await notificationService.startGlobalOrderWatching();
          console.log('✅ Global order watching started');
        } else if (permission === 'default') {
          console.log('🔔 Requesting notification permission...');
          const hasPermission = await notificationService.requestPermission();
          if (hasPermission) {
            console.log('✅ Notification permission granted');
            await notificationService.registerServiceWorker();
            // Global order watching'ni boshlash
            await notificationService.startGlobalOrderWatching();
            console.log('✅ Global order watching started');
          } else {
            console.log('❌ Notification permission denied');
          }
        } else {
          console.log('❌ Notification permission denied by user');
        }
      } catch (error) {
        console.error('❌ Error initializing notifications:', error);
      }
    };

    window.addEventListener('hashchange', handleHashChange)
    navigator.serviceWorker?.addEventListener('message', handleServiceWorkerMessage)
    
    // Notification permission tekshirish va Service Worker register qilish
    initializeNotifications();

    return () => {
      clearTimeout(timer)
      window.removeEventListener('hashchange', handleHashChange)
      navigator.serviceWorker?.removeEventListener('message', handleServiceWorkerMessage)
      // Cleanup
      document.body.style.overflow = 'auto'
      document.body.classList.remove('overflow-hidden')
    }
  }, [])

  // Initial selectedProduct ni o'rnatish
  useEffect(() => {
    const hash = window.location.hash.replace('#', '')
    console.log('🔍 Initial hash check:', hash)
    
    if (hash.startsWith('product-detail/')) {
      const productId = hash.split('/')[1]
      console.log('🔍 Initial product ID:', productId)
      setSelectedProduct({ id: productId })
      console.log('✅ Initial selectedProduct set to:', { id: productId })
    } else {
      setSelectedProduct(null)
    }
  }, [])

  // Scroll muammosini hal qilish - har sahifa o'zgarishida
  useEffect(() => {
    // Har sahifa o'zgarishida scroll ni tiklash
    document.body.style.overflow = 'auto'
    document.body.classList.remove('overflow-hidden')
    
    // Sahifa tepasiga scroll qilish
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentPage])

  const handleNavigate = (page: string, productId?: string) => {
    console.log('🔄 App: Navigating to page:', page, 'productId:', productId);
    console.log('🔄 App: Current state before navigation - currentPage:', currentPage, 'selectedProduct:', selectedProduct);
    
    if (page === 'product-detail' && productId) {
      // Product detail sahifasiga o'tish
      console.log('🔄 App: Setting selectedProduct to:', { id: productId });
      setSelectedProduct({ id: productId });
      console.log('🔄 App: Setting currentPage to: product-detail');
      setCurrentPage('product-detail');
      // URL hash ni o'zgartirish
      window.location.hash = `product-detail/${productId}`;
      console.log('✅ App: Product selected:', productId);
      console.log('✅ App: Hash set to:', window.location.hash);
    } else {
      // Oddiy sahifa o'tish
      setCurrentPage(page);
      setSelectedProduct(null);
      // URL hash ni o'zgartirish
      window.location.hash = page;
      console.log('✅ App: Page set to:', page);
      
      // Force reload for catalog page to fix loading issues
      if (page === 'catalog') {
        console.log('🔄 Forcing catalog reload...');
        setTimeout(() => {
          // Trigger a small state change to force re-render
          setCurrentPage('catalog');
        }, 50);
      }
    }
    
    console.log('🔍 Current page state:', page);
  }

  const handleProductSelect = (product: any) => {
    setSelectedProduct(product)
    setCurrentPage('product-detail')
  }

  const renderPage = () => {
    console.log('🎯 Rendering page:', currentPage);
    console.log('🎯 Current hash:', window.location.hash);
    console.log('🎯 Selected product:', selectedProduct);
    
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} />
      case 'catalog':
        return <CatalogPage onNavigate={handleNavigate} />
      case 'about':
        return <AboutPage onNavigate={handleNavigate} />
      case 'contact':
        return <ContactPage onNavigate={handleNavigate} />
      case 'product-detail':
        const productId = selectedProduct?.id || getProductIdFromHash()
        console.log('🎯 ProductDetail case - productId:', productId, 'selectedProduct:', selectedProduct)
        console.log('🎯 Current hash:', window.location.hash)
        console.log('🎯 getProductIdFromHash result:', getProductIdFromHash())
        console.log('🎯 selectedProduct?.id:', selectedProduct?.id)
        console.log('🎯 getProductIdFromHash():', getProductIdFromHash())
        
        if (productId) {
          console.log('✅ Rendering ProductDetailPage with productId:', productId)
          return (
            <ProductDetailPage 
              productId={productId} 
              onNavigate={handleNavigate}
            />
          )
        } else {
          console.log('❌ No productId found, showing error page')
          console.log('❌ selectedProduct:', selectedProduct)
          console.log('❌ getProductIdFromHash():', getProductIdFromHash())
          return (
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-4">Mahsulot topilmadi</h2>
                <p className="text-gray-300 mb-4">Product ID: {productId || 'undefined'}</p>
                <p className="text-gray-300 mb-4">Current hash: {window.location.hash}</p>
                <p className="text-gray-300 mb-4">Selected product: {selectedProduct ? JSON.stringify(selectedProduct) : 'null'}</p>
                <p className="text-gray-300 mb-4">getProductIdFromHash(): {getProductIdFromHash() || 'null'}</p>
                <button
                  onClick={() => handleNavigate('catalog')}
                  className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600"
                >
                  Katalogga qaytish
                </button>
              </div>
            </div>
          )
        }
      case 'order-success':
        console.log('🎉 Rendering OrderSuccessPage!');
        return <OrderSuccessPage onNavigate={handleNavigate} />
      case 'orders':
        return <OrderTracking />
      case 'profile':
        return <ProfilePage onNavigate={handleNavigate} />
      case 'admin':
        // Admin panel alohida saytda: http://localhost:3000
        window.open('http://localhost:5175', '_blank')
        return <HomePage onNavigate={handleNavigate} />
      default:
        return <HomePage onNavigate={handleNavigate} />
    }
  }

  if (isLoading) {
    return <AppLoader isLoading={true} />
  }

  return (
    <LanguageProvider>
      <AuthProvider>
        <CartProvider>
          <ToastProvider>
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
              <Header 
                currentPage={currentPage} 
                onNavigate={handleNavigate}
                onShowAuthModal={(mode) => {
                  setAuthMode(mode)
                  setShowAuthModal(true)
                }}
              />
              
              <AnimatePresence mode="wait">
                <motion.main
                  key={currentPage}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className={`relative ${isTelegramWebApp ? 'pt-24' : ''}`}
                  style={isTelegramWebApp ? { 
                    paddingTop: 'calc(env(safe-area-inset-top, 0px) + 80px)'
                  } : {}}
                >
                  {renderPage()}
                </motion.main>
              </AnimatePresence>
              
              {/* Auth Modal */}
              <AuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                mode={authMode}
                onModeChange={setAuthMode}
              />
            </div>
          </ToastProvider>
        </CartProvider>
      </AuthProvider>
    </LanguageProvider>
  )
}

export default App