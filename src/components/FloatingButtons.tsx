import { useState, useEffect, memo, useCallback } from 'react';
import { Menu, ShoppingCart, Bell } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '../contexts/CartContext';
import CartSidebar from './CartSidebar';
import BurgerMenu from './BurgerMenu';
import NotificationCenter from './NotificationCenter';

interface FloatingButtonsProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onShowAuthModal: (mode: 'login' | 'register') => void;
}

const FloatingButtons = memo<FloatingButtonsProps>(({ currentPage, onNavigate, onShowAuthModal }) => {
  const [isBurgerMenuOpen, setIsBurgerMenuOpen] = useState(false);
  const [isTelegramWebApp, setIsTelegramWebApp] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { totalItems, setIsCartOpen } = useCart();

  // Optimized callbacks
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

  // Button animatsiya variantlari
  const buttonVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    show: {
      opacity: 1,
      scale: 1,
      transition: { type: 'spring', stiffness: 500, damping: 32 }
    }
  };

  return (
    <>
      {/* Floating Buttons Container */}
      <motion.div
        variants={buttonVariants}
        initial="hidden"
        animate="show"
        className={`fixed z-50 ${
          isTelegramWebApp 
            ? 'top-4 right-4' 
            : 'top-4 right-4'
        }`}
        style={isTelegramWebApp ? { 
          top: 'calc(env(safe-area-inset-top, 0px) + 16px)',
          right: 'calc(env(safe-area-inset-right, 0px) + 16px)'
        } : {}}
      >
        <div className="flex gap-3">
          {/* Notifications Button */}
          <button
            onClick={() => setShowNotifications(true)}
            className="relative inline-flex h-12 w-12 items-center justify-center rounded-full text-white transition-all duration-300 hover:bg-white/10"
            aria-label="Notifications"
          >
            <Bell className="h-6 w-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-semibold">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Cart Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative inline-flex h-12 w-12 items-center justify-center rounded-full text-white transition-all duration-300 hover:bg-white/10"
            aria-label="Shopping cart"
          >
            <ShoppingCart className="h-6 w-6" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-semibold">
                {totalItems}
              </span>
            )}
          </button>

          {/* Burger Button */}
          <button
            aria-controls="burger-menu"
            aria-expanded={isBurgerMenuOpen}
            onClick={() => setIsBurgerMenuOpen(true)}
            className="inline-flex h-12 w-12 items-center justify-center rounded-full text-white transition-all duration-300 hover:bg-white/10"
            aria-label="Menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </motion.div>
      
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
      
      {/* Notification Center */}
      <NotificationCenter 
        isMobile={true}
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        onUnreadCountChange={setUnreadCount}
      />
    </>
  );
});

FloatingButtons.displayName = 'FloatingButtons';

export default FloatingButtons;
