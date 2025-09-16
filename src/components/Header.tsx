import { useEffect, useState, memo, useCallback } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { motion } from 'framer-motion';

interface HeaderProps {
  onNavigate: (page: string) => void;
}

const Header = memo<HeaderProps>(({ onNavigate }) => {
  const [showAdmin, setShowAdmin] = useState(false);
  const [isTelegramWebApp, setIsTelegramWebApp] = useState(false);

  // Optimized callbacks
  const handleLogoClick = useCallback(() => {
    setShowAdmin(prev => !prev);
  }, []);


  // Telegram WebApp ni aniqlash
  useEffect(() => {
    const isTelegram = (window as any).Telegram?.WebApp || 
                      window.location.href.includes('t.me') ||
                      window.location.href.includes('telegram.me') ||
                      navigator.userAgent.includes('TelegramBot');
    setIsTelegramWebApp(!!isTelegram);
  }, []);


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
        <div className="flex items-center justify-center h-16">
          {/* Logo - center */}
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
        </div>
      </div>
    </motion.header>
  );
});

Header.displayName = 'Header';

export default Header;