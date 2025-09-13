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

function App() {
  const [currentPage, setCurrentPage] = useState('home')
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

    return () => {
      clearTimeout(timer)
      // Cleanup
      document.body.style.overflow = 'auto'
      document.body.classList.remove('overflow-hidden')
    }
  }, [])

  // URL hash ni tekshirish
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '')
      if (hash && hash !== currentPage) {
        console.log('🔄 Hash change detected:', hash)
        setCurrentPage(hash)
      }
    }

    // Dastlabki hash ni tekshirish
    handleHashChange()

    // Hash o'zgarishlarini kuzatish
    window.addEventListener('hashchange', handleHashChange)
    
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [currentPage])

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
    
    if (page === 'product' && productId) {
      // Product detail sahifasiga o'tish
      setSelectedProduct({ id: productId });
      setCurrentPage('product-detail');
      console.log('✅ App: Product selected:', productId);
    } else {
      // Oddiy sahifa o'tish
      setCurrentPage(page);
      setSelectedProduct(null);
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
        return selectedProduct ? (
          <ProductDetailPage 
            productId={selectedProduct.id} 
            onNavigate={handleNavigate}
          />
        ) : null
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