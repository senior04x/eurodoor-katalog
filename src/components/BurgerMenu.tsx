import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingCart, User, LogOut, Bell, Package } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";

type Props = { 
  open: boolean; 
  onClose: () => void;
  currentPage: string;
  onNavigate: (page: string) => void;
  onShowAuthModal: (mode: 'login' | 'register') => void;
};

export default function BurgerMenu({ open, onClose, currentPage, onNavigate, onShowAuthModal }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const { t, language, changeLanguage } = useLanguage();
  const { totalItems, setIsCartOpen } = useCart();
  const { user, signOut } = useAuth();
  const { showSuccess } = useToast();

  // body scroll lock
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = open ? "hidden" : prev;
    return () => { 
      document.body.style.overflow = prev; 
    };
  }, [open]);

  // ESC yopish
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { 
      if (e.key === "Escape") onClose(); 
    };
    if (open) {
      window.addEventListener("keydown", onKey);
      // Focus panelga ko'chirish
      setTimeout(() => {
        panelRef.current?.focus();
      }, 100);
    }
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const handleNavigate = (page: string) => {
    onNavigate(page);
    onClose();
  };

  const handleShowAuthModal = (mode: 'login' | 'register') => {
    onShowAuthModal(mode);
    onClose();
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      showSuccess(t('auth.logout_success'));
      onClose();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navigation = [
    { name: t('nav.catalog'), id: 'catalog' },
    { name: t('nav.about'), id: 'about' },
    { name: t('nav.contact'), id: 'contact' },
  ];

  const languages = [
    { code: 'uz', name: 'O\'zbek', flag: '🇺🇿' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
  ];

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            aria-hidden={!open}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 cart-backdrop-blur z-[9998]"
          />

          {/* Panel */}
          <motion.aside
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Main menu"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}
            className="fixed right-0 top-0 h-screen w-full md:w-2/5 bg-black/30 cart-modal-blur shadow-2xl z-[9999] flex flex-col border-l border-white/30"
            style={{
              backdropFilter: 'blur(24px) saturate(150%) !important',
              WebkitBackdropFilter: 'blur(24px) saturate(150%) !important'
            }}
            tabIndex={-1}
          >
            {/* Header */}
            <div className="h-16 flex items-center justify-between px-6 border-b border-white/20">
              <span className="text-lg font-semibold text-white">{t('header.menu')}</span>
              <button 
                onClick={onClose} 
                aria-label="Yopish" 
                className="h-9 w-9 rounded-xl hover:bg-white/10 flex items-center justify-center text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex flex-col flex-1 overflow-y-auto custom-scrollbar">
              {/* Navigation Links */}
              <nav className="px-6 py-6 flex flex-col gap-3">
                {navigation.map((item) => {
                  const active = currentPage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavigate(item.id)}
                      className={`block w-full text-left rounded-lg px-4 py-3 transition-colors truncate ${
                        active 
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' 
                          : 'text-white hover:bg-white/10'
                      }`}
                    >
                      {item.name}
                    </button>
                  );
                })}
              </nav>

              {/* User Section */}
              {user ? (
                <div className="px-6 py-4 border-t border-white/20">
                  {/* User Info */}
                  <div className="px-4 py-3 bg-white/10 rounded-lg mb-4">
                    <p className="text-white font-medium text-sm truncate">{user.email}</p>
                    <p className="text-gray-300 text-xs">{t('header.welcome')}</p>
                  </div>

                  {/* User Actions */}
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleNavigate('profile')}
                      className="flex items-center w-full px-4 py-3 text-white hover:bg-white/10 rounded-lg transition-colors text-sm"
                    >
                      <User className="h-4 w-4 mr-3 flex-shrink-0" />
                      <span className="truncate">{t('header.profile')}</span>
                    </button>
                    <button
                      onClick={() => handleNavigate('orders')}
                      className="flex items-center w-full px-4 py-3 text-white hover:bg-white/10 rounded-lg transition-colors text-sm"
                    >
                      <Package className="h-4 w-4 mr-3 flex-shrink-0" />
                      <span className="truncate">{t('header.orders')}</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsCartOpen(true);
                        onClose();
                      }}
                      className="flex items-center w-full px-4 py-3 text-white hover:bg-white/10 rounded-lg transition-colors text-sm"
                    >
                      <ShoppingCart className="h-4 w-4 mr-3 flex-shrink-0" />
                      <span className="truncate">{t('header.cart')} ({totalItems})</span>
                    </button>
                    <button
                      onClick={() => {
                        // setShowNotifications(!showNotifications);
                        onClose();
                      }}
                      className="flex items-center w-full px-4 py-3 text-white hover:bg-white/10 rounded-lg transition-colors text-sm"
                    >
                      <Bell className="h-4 w-4 mr-3 flex-shrink-0" />
                      <span className="truncate">{t('header.notifications')}</span>
                    </button>
                    <hr className="border-white/20 my-2" />
                    <button
                      onClick={handleSignOut}
                      className="flex items-center w-full px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-sm"
                    >
                      <LogOut className="h-4 w-4 mr-3 flex-shrink-0" />
                      <span className="truncate">{t('header.logout')}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="px-6 py-4 border-t border-white/20">
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => handleShowAuthModal('login')}
                      className="w-full px-4 py-3 text-white hover:bg-white/10 rounded-lg transition-colors text-sm"
                    >
                      {t('header.login')}
                    </button>
                    <button
                      onClick={() => handleShowAuthModal('register')}
                      className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                    >
                      {t('header.register')}
                    </button>
                  </div>
                </div>
              )}

              {/* Language Switcher */}
              <div className="mt-auto px-6 py-6 border-t border-white/20">
                <div className="space-y-2">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        changeLanguage(lang.code as 'uz' | 'ru' | 'en');
                        onClose();
                      }}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                        language === lang.code
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' 
                          : 'text-white hover:bg-white/10'
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <span className="text-lg">{lang.flag}</span>
                        <span className="font-medium">{lang.name}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}