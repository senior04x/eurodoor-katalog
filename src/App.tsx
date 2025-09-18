import { useState, useEffect, Suspense, lazy, memo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Header from './components/Header'
import FloatingButtons from './components/FloatingButtons'
import AppLoader from './components/AppLoader'

// Lazy load components with preloading for better performance
const HomePage = lazy(() => import('./components/HomePage'))
const CatalogPage = lazy(() => import('./components/CatalogPage'))
const AboutPage = lazy(() => import('./components/AboutPage'))
const ContactPage = lazy(() => import('./components/ContactPage'))
const ProductDetailPage = lazy(() => import('./components/ProductDetailPage'))
const OrderSuccessPage = lazy(() => import('./components/OrderSuccessPage'))
const OrderTracking = lazy(() => import('./components/OrderTracking'))
const ProfilePage = lazy(() => import('./components/ProfilePage'))
const NotificationCenter = lazy(() => import('./components/NotificationCenter'))

// Preload critical components
const preloadComponents = () => {
  import('./components/HomePage')
  import('./components/CatalogPage')
}
import { CartProvider } from './contexts/CartContext'
import { AuthProvider } from './contexts/AuthContext'
import { LanguageProvider } from './contexts/LanguageContext'
import { ToastProvider } from './contexts/ToastContext'
import AuthModal from './components/AuthModal'
import ErrorBoundary from './components/ErrorBoundary'
import { installAutoAskNotifications } from './boot/autoAskNotifications'
import NotificationGate from './components/NotificationGate'

function App() {
  // URL hash'dan current page ni olish
  const getInitialPage = () => {
    const hash = window.location.hash.replace('#', '')
    const validPages = ['home', 'catalog', 'about', 'contact', 'orders', 'profile', 'order-success', 'product-detail']
    
    // Product detail page uchun
    if (hash.startsWith('product-detail/')) {
      return 'product-detail'
    }
    
    const isValidPage = validPages.includes(hash)
    return isValidPage ? hash : 'home'
  }

  // Product ID ni hash'dan olish
  const getProductIdFromHash = () => {
    const hash = window.location.hash.replace('#', '')
    if (hash.startsWith('product-detail/')) {
      return hash.split('/')[1]
    }
    return null
  }

  const [currentPage, setCurrentPage] = useState(getInitialPage())
  const [selectedProduct, setSelectedProduct] = useState<{ id: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [isTelegramWebApp, setIsTelegramWebApp] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)

  // Pull-to-refresh functionality
  useEffect(() => {
    let startY = 0
    let currentY = 0
    let isPulling = false

    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0) {
        startY = e.touches[0].clientY
        isPulling = true
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling) return
      
      currentY = e.touches[0].clientY
      const distance = currentY - startY
      
      if (distance > 0) {
        e.preventDefault()
        setPullDistance(Math.min(distance, 100))
      }
    }

    const handleTouchEnd = () => {
      if (isPulling && pullDistance > 60) {
        window.location.reload()
      }
      isPulling = false
      setPullDistance(0)
    }

    document.addEventListener('touchstart', handleTouchStart, { passive: false })
    document.addEventListener('touchmove', handleTouchMove, { passive: false })
    document.addEventListener('touchend', handleTouchEnd)

    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [pullDistance])

  useEffect(() => {
    // Telegram WebApp ni aniqlash
    const isTelegram = (window as any).Telegram?.WebApp || 
                      window.location.href.includes('t.me') ||
                      window.location.href.includes('telegram.me') ||
                      navigator.userAgent.includes('TelegramBot');
    setIsTelegramWebApp(!!isTelegram);

    // Preload critical components
    preloadComponents();

    // Listen for service worker messages (notification clicks)
    const handleServiceWorkerMessage = (event: MessageEvent) => {
      if (event.data?.type === 'NAVIGATE_TO_ORDERS') {
        console.log('🔔 Notification clicked, navigating to orders')
        handleNavigate('orders')
      }
    }

    navigator.serviceWorker?.addEventListener('message', handleServiceWorkerMessage)

    // Sayt yuklanishini simulyatsiya qilish - tezroq
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 800) // Loading vaqtini qisqartirish - 800ms

    // Scroll muammosini hal qilish
    document.body.style.overflow = 'auto'
    document.body.classList.remove('overflow-hidden')

    // Hash change listener qo'shish
    const handleHashChange = () => {
      const newPage = getInitialPage()
      const productId = getProductIdFromHash()
      
      setCurrentPage(newPage)
      
      // Product detail page uchun selectedProduct ni o'rnatish
      if (newPage === 'product-detail' && productId) {
        setSelectedProduct({ id: productId })
      } else {
        setSelectedProduct(null)
      }
    }

    window.addEventListener('hashchange', handleHashChange)
    
    // Initialize auto-ask notifications system
    installAutoAskNotifications();

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
    
    if (hash.startsWith('product-detail/')) {
      const productId = hash.split('/')[1]
      setSelectedProduct({ id: productId })
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

  const handleNavigate = useCallback((page: string, productId?: string) => {
    if (page === 'product-detail' && productId) {
      // Product detail sahifasiga o'tish
      setSelectedProduct({ id: productId });
      setCurrentPage('product-detail');
      // URL hash ni o'zgartirish
      window.location.hash = `product-detail/${productId}`;
    } else {
      // Oddiy sahifa o'tish
      setCurrentPage(page);
      setSelectedProduct(null);
      // URL hash ni o'zgartirish
      window.location.hash = page;
      
      // Force reload for catalog page to fix loading issues
      if (page === 'catalog') {
        setTimeout(() => {
          // Trigger a small state change to force re-render
          setCurrentPage('catalog');
        }, 50);
      }
    }
  }, [currentPage, selectedProduct])


  const renderPage = () => {
    const LoadingFallback = memo(() => (
      <div className="min-h-screen flex items-center justify-center">
        <AppLoader isLoading={true} />
      </div>
    ));
    
    switch (currentPage) {
      case 'home':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <HomePage onNavigate={handleNavigate} />
          </Suspense>
        )
      case 'catalog':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <CatalogPage onNavigate={handleNavigate} />
          </Suspense>
        )
      case 'about':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <AboutPage onNavigate={handleNavigate} />
          </Suspense>
        )
      case 'contact':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <ContactPage onNavigate={handleNavigate} />
          </Suspense>
        )
      case 'product-detail': {
        const productId = selectedProduct?.id || getProductIdFromHash()
        
        if (productId) {
          return (
            <Suspense fallback={<LoadingFallback />}>
              <ProductDetailPage 
                productId={productId} 
                onNavigate={handleNavigate}
              />
            </Suspense>
          )
        } else {
          return (
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-4">Mahsulot topilmadi</h2>
                <p className="text-gray-300 mb-4">Product ID: {productId || 'undefined'}</p>
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
      }
      case 'order-success':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <OrderSuccessPage onNavigate={handleNavigate} />
          </Suspense>
        )
      case 'orders':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <OrderTracking />
          </Suspense>
        )
      case 'profile':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <ProfilePage onNavigate={handleNavigate} />
          </Suspense>
        )
      case 'notifications':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <NotificationCenter />
          </Suspense>
        )
      case 'admin':
        // Admin panel alohida saytda: http://localhost:3001
        window.open('http://localhost:3001', '_blank')
        return (
          <Suspense fallback={<LoadingFallback />}>
            <HomePage onNavigate={handleNavigate} />
          </Suspense>
        )
      default:
        return (
          <Suspense fallback={<LoadingFallback />}>
            <HomePage onNavigate={handleNavigate} />
          </Suspense>
        )
    }
  }

  if (isLoading) {
    return <AppLoader isLoading={true} />
  }

  return (
    <ErrorBoundary>
      <LanguageProvider>
        <AuthProvider>
          <CartProvider>
            <ToastProvider>
              <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
                {/* Pull-to-refresh indicator */}
                {pullDistance > 0 && (
                  <div 
                    className="fixed top-0 left-0 right-0 z-50 bg-blue-500 text-white text-center py-2 transition-all duration-200"
                    style={{ 
                      transform: `translateY(${Math.min(pullDistance - 60, 40)}px)`,
                      opacity: Math.min(pullDistance / 60, 1)
                    }}
                  >
                    {pullDistance > 60 ? 'Yangilash uchun qo\'yib bering' : 'Yangilash uchun torting'}
                  </div>
                )}
                
                <Header 
                  onNavigate={handleNavigate}
                />
                
                {/* Floating Buttons - Korzinka va Burger */}
                <FloatingButtons
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
                
                {/* Notification Gate Modal */}
                <NotificationGate />
              </div>
            </ToastProvider>
          </CartProvider>
        </AuthProvider>
      </LanguageProvider>
    </ErrorBoundary>
  )
}

export default App