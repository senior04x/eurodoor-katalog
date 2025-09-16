import { useEffect, useState, memo, useCallback } from 'react';
import { Menu, ShoppingCart } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { motion } from 'framer-motion';
import { useCart } from '../contexts/CartContext';
import CartSidebar from './CartSidebar';
import BurgerMenu from './BurgerMenu';

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onShowAuthModal: (mode: 'login' | 'register') => void;
}

const Header = memo<HeaderProps>(({ currentPage, onNavigate, onShowAuthModal }) => {
  const [isBurgerMenuOpen, setIsBurgerMenuOpen] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [isTelegramWebApp, setIsTelegramWebApp] = useState(false);
  const { totalItems, setIsCartOpen } = useCart();

  // Optimized callbacks
  const handleLogoClick = useCallback(() => {
    setShowAdmin(prev => !prev);
  }, []);

  const handleNavigate = useCallback((page: string) => {
    onNavigate(page);
    setIsBurgerMenuOpen(false);
  }, [onNavigate]);

  const handleShowAuthModal = useCallback((mode: 'login' | 'register') => {
    onShowAuthModal(mode);
    setIsBurgerMenuOpen(false);
  }, [onShowAuthModal]);

  // Telegram WebApp ni aniqlash
  useEffect(() => {
    const isTelegram = (window as any).Telegram?.WebApp || 
                      window.location.href.includes('t.me') ||
                      window.location.href.includes('telegram.me') ||
                      navigator.userAgent.includes('TelegramBot');
    setIsTelegramWebApp(!!isTelegram);
  }, []);

  // Body scrollni bloklash (burger menyu ochilganda)
  useEffect(() => {
    if (isBurgerMenuOpen) {
      document.body.classList.add('overflow-hidden');
      document.body.style.overflow = 'hidden';
    } else {
      document.body.classList.remove('overflow-hidden');
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.classList.remove('overflow-hidden');
      document.body.style.overflow = 'auto';
    };
  }, [isBurgerMenuOpen]);

  // Admin panel uchun keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        setShowAdmin(prev => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showAdmin]);



  // Headerning mayin paydo bo'lishi (ilk render)
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
      className={`bg-transparent z-40 overflow-visible ${
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
        <div className="flex items-center gap-3 flex-nowrap h-16">
          {/* Logo - shrink-0 */}
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
            className="cursor-pointer shrink-0 w-28"
          >
            <ImageWithFallback
              src="https://iili.io/K2WCLJV.png"
              alt="EURODOOR Logo"
              className="h-8 w-auto"
            />
          </div>


          {/* Right side actions - ml-auto */}
          <div className="ml-auto flex items-center gap-3">
            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl hover:bg-white/10 text-white transition-colors"
              aria-label="Shopping cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>


            {/* Burger Button - Always visible */}
            <button
              aria-controls="burger-menu"
              aria-expanded={isBurgerMenuOpen}
              onClick={() => setIsBurgerMenuOpen(true)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl hover:bg-white/10 text-white transition-colors"
              aria-label="Menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Burger Menu */}
      <BurgerMenu 
        open={isBurgerMenuOpen} 
        onClose={() => setIsBurgerMenuOpen(false)}
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onShowAuthModal={handleShowAuthModal}
      />
      
      {/* Cart Sidebar */}
      <CartSidebar onNavigate={onNavigate} />

    </motion.header>
  );
});

Header.displayName = 'Header';

export default Header;