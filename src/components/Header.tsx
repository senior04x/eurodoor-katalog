import { useEffect, useState } from 'react';
import { Menu, X, ShoppingCart, User, LogOut, LogIn, UserPlus } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import LanguageSwitcher from './LanguageSwitcher';
import CartSidebar from './CartSidebar';
import NotificationCenter from './NotificationCenter';

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onShowAuthModal: (mode: 'login' | 'register') => void;
}

export default function Header({ currentPage, onNavigate, onShowAuthModal }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isTelegramWebApp, setIsTelegramWebApp] = useState(false);
  const { t } = useLanguage();
  const { totalItems, isCartOpen, setIsCartOpen } = useCart();
  const { user, signOut } = useAuth();
  const { showSuccess } = useToast();

  // Profile modal functions

  // Telegram WebApp ni aniqlash
  useEffect(() => {
    const isTelegram = (window as any).Telegram?.WebApp || 
                      window.location.href.includes('t.me') ||
                      window.location.href.includes('telegram.me') ||
                      navigator.userAgent.includes('TelegramBot');
    setIsTelegramWebApp(!!isTelegram);
  }, []);

  // Body scrollni bloklash (mobil menyu ochilganda)
  useEffect(() => {
    if (isMenuOpen) {
      document.body.classList.add('overflow-hidden');
      document.body.style.overflow = 'hidden';
    } else {
      document.body.classList.remove('overflow-hidden');
      document.body.style.overflow = 'auto';
    }
    
    // Cleanup function
    return () => {
      document.body.classList.remove('overflow-hidden');
      document.body.style.overflow = 'auto';
    };
  }, [isMenuOpen]);

  // Maxsus kombinatsiya uchun event listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl + Shift + A bosganda admin link ko'rinadi
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        setShowAdmin(!showAdmin);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showAdmin]);

  // Logo ustida 5 marta bosish (mobil uchun)
  const [, setLogoClickCount] = useState(0);
  const handleLogoClick = () => {
    setLogoClickCount(prev => {
      const newCount = prev + 1;
      if (newCount >= 5) {
        setShowAdmin(!showAdmin);
        return 0;
      }
      // 3 soniyadan keyin counter reset
      setTimeout(() => setLogoClickCount(0), 3000);
      return newCount;
    });
  };

  const navigation = [
    { name: t('nav.catalog'), id: 'catalog' },
    { name: t('nav.about'), id: 'about' },
    { name: t('nav.contact'), id: 'contact' },
    { name: t('nav.blog'), id: 'blog' },
    // Admin link faqat maxsus kombinatsiya orqali ko'rinadi
    ...(showAdmin ? [{ name: 'Admin', id: 'admin' }] : [])
  ];

  // Animatsiya variantlar (mobil menyu) - sekinroq va oddiyroq
  const mobileMenuVariants = {
    hidden: { 
      opacity: 0, 
      y: -20,
      scale: 0.95
    },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'tween',
        ease: 'easeOut',
        duration: 0.3,
        staggerChildren: 0.05,
        when: 'beforeChildren'
      }
    },
    exit: {
      opacity: 0,
      y: -5,
      scale: 0.98,
      transition: { 
        duration: 0.4,
        ease: 'easeInOut',
        staggerChildren: 0.03,
        when: 'afterChildren'
      }
    }
  };

  const mobileItemVariants = {
    hidden: { 
      opacity: 0, 
      y: 10,
      scale: 0.9
    },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'tween',
        ease: 'easeOut',
        duration: 0.25
      }
    },
    exit: { 
      opacity: 0, 
      y: 3, 
      scale: 0.95,
      transition: { 
        duration: 0.3,
        ease: 'easeInOut'
      } 
    }
  };

  // Headerning mayin paydo bo‘lishi (ilk render)
  const headerVariants = {
    hidden: { opacity: 0, y: -12 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 500, damping: 32 }
    }
  };

  return (
    <motion.header
      variants={headerVariants}
      initial="hidden"
      animate="show"
      className={`bg-white/3 backdrop-blur-sm border border-white/20 z-40 shadow-lg rounded-md overflow-visible ${
        isTelegramWebApp 
          ? 'fixed top-0 left-0 right-0 m-4' 
          : 'sticky top-0 m-4'
      }`}
      style={isTelegramWebApp ? { 
        top: 'env(safe-area-inset-top, 0px)',
        marginTop: 'env(safe-area-inset-top, 16px)',
        marginLeft: 'env(safe-area-inset-left, 16px)',
        marginRight: 'env(safe-area-inset-right, 16px)'
      } : {}}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20 md:h-15">
          {/* Logo */}
          <div
            onClick={(e) => {
              // Agar Ctrl yoki Shift bosilgan bo'lsa, admin toggle
              if (e.ctrlKey || e.shiftKey) {
                handleLogoClick();
              } else {
                onNavigate('home');
                window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
              }
            }}
            className="cursor-pointer"
          >
            <ImageWithFallback
              src="https://iili.io/K2WCLJV.png"
              alt="EURODOOR Logo"
              className="h-8 w-auto"
            />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navigation.map((item) => {
              const active = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
                  }}
                  aria-current={active ? 'page' : undefined}
                  className={[
                    'text-sm font-medium transition-colors hover:text-white',
                    'border-b-2 border-transparent pb-1',
                    active ? 'text-white border-white' : 'text-white'
                  ].join(' ')}
                >
                  {item.name}
                </button>
              );
            })}
            
            {/* Auth buttons in nav */}
            {user ? (
              <div className="flex items-center space-x-2 ml-4">
                {/* Notification Center */}
                <NotificationCenter />
                
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-1 px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-md transition-colors"
                >
                  <User className="h-4 w-4" />
                  <span className="text-sm">{user.name || user.email}</span>
                </button>
                
                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-gradient-to-br from-blue-500/90 via-purple-500/90 to-blue-600/90 backdrop-blur-xl rounded-lg border border-white/30 shadow-2xl py-1 z-50">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onNavigate('profile');
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors"
                    >
                      <User className="h-4 w-4 mr-2" />
                      {t('header.profile')}
                    </button>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onNavigate('orders');
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      {t('header.orders')}
                    </button>
                    <hr className="my-1 border-white/20" />
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        signOut();
                        showSuccess('Tizimdan chiqildi!', 'Muvaffaqiyatli tizimdan chiqdingiz');
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      {t('header.logout')}
                    </button>
                  </div>
                )}
                
              </div>
            ) : (
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => onShowAuthModal('login')}
                  className="flex items-center space-x-1 px-3 py-1 text-sm text-white hover:text-gray-200 transition-colors"
                >
                  <LogIn className="h-4 w-4" />
                  <span>{t('header.login')}</span>
                </button>
                <button
                  onClick={() => onShowAuthModal('register')}
                  className="flex items-center space-x-1 px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-md transition-colors"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>{t('header.register')}</span>
                </button>
              </div>
            )}
            
            {/* Korzinka tugmasi */}
            <button
              onClick={() => setIsCartOpen(!isCartOpen)}
              className="relative p-2 text-white hover:text-gray-200 transition-colors"
            >
              <ShoppingCart className="h-6 w-6" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>

            <LanguageSwitcher />
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 transition-all duration-300 hover:bg-white/10 rounded-lg"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-nav"
            data-burger-button
            onClick={() => setIsMenuOpen((v) => !v)}
          >
            <motion.div
              key={isMenuOpen ? 'close' : 'menu'}
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 90 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6 text-white" />
              ) : (
                <Menu className="h-6 w-6 text-white" />
              )}
            </motion.div>
          </button>
        </div>

        {/* Mobile Navigation (animated) */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              id="mobile-nav"
              key="mobile-nav"
              variants={mobileMenuVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              className="md:hidden py-4 border-t border-white/10"
              data-mobile-menu
            >
              <nav className="flex flex-col space-y-3">
                {navigation.map((item) => {
                  const active = currentPage === item.id;
                  return (
                    <motion.button
                      key={item.id}
                      variants={mobileItemVariants}
                      onClick={() => {
                        onNavigate(item.id);
                        setIsMenuOpen(false);
                        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
                      }}
                      className={[
                        'text-left px-2 py-2 text-sm font-medium transition-colors',
                        'hover:text-white rounded-md',
                        active ? 'text-white' : 'text-gray-300'
                      ].join(' ')}
                    >
                      {item.name}
                    </motion.button>
                  );
                })}
                
                {/* Mobil korzinka va foydalanuvchi tugmalari */}
                <div className="px-2 py-2 border-t border-white/10 mt-4 pt-4">
                  {/* Mobile Notification Center */}
                  {user && (
                    <div className="mb-3">
                      <NotificationCenter 
                        isMobile={true} 
                        onMobileClose={() => setIsMenuOpen(false)} 
                      />
                    </div>
                  )}
                  
                  <button
                    onClick={() => {
                      setIsCartOpen(!isCartOpen);
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center w-full px-2 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                  >
                    <ShoppingCart className="h-5 w-5 mr-3" />
                    <span>{t('header.cart')}</span>
                    {totalItems > 0 && (
                      <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {totalItems}
                      </span>
                    )}
                  </button>
                  
                  {user ? (
                    <>
                      <button
                        onClick={() => {
                          onNavigate('profile');
                          setIsMenuOpen(false);
                        }}
                        className="flex items-center w-full px-2 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                      >
                        <User className="h-5 w-5 mr-3" />
                        <span>{t('header.profile')}</span>
                      </button>
                      <button
                        onClick={() => {
                          onNavigate('orders');
                          setIsMenuOpen(false);
                        }}
                        className="flex items-center w-full px-2 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                      >
                        <ShoppingCart className="h-5 w-5 mr-3" />
                        <span>{t('header.orders')}</span>
                      </button>
                      <button
                        onClick={() => {
                          signOut();
                          setIsMenuOpen(false);
                          showSuccess('Tizimdan chiqildi!', 'Muvaffaqiyatli tizimdan chiqdingiz');
                        }}
                        className="flex items-center w-full px-2 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                      >
                        <LogOut className="h-5 w-5 mr-3" />
                        <span>{t('header.logout')}</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          onShowAuthModal('login');
                          setIsMenuOpen(false);
                        }}
                        className="flex items-center w-full px-2 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                      >
                        <LogIn className="h-5 w-5 mr-3" />
                        <span>{t('header.login')}</span>
                      </button>
                      <button
                        onClick={() => {
                          onShowAuthModal('register');
                          setIsMenuOpen(false);
                        }}
                        className="flex items-center w-full px-2 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                      >
                        <UserPlus className="h-5 w-5 mr-3" />
                        <span>{t('header.register')}</span>
                      </button>
                    </>
                  )}
                </div>
                
                <div className="px-2 py-2">
                  <LanguageSwitcher />
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Cart Sidebar */}
      <CartSidebar onNavigate={onNavigate} />

    </motion.header>
  );
}
