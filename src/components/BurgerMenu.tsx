import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingCart, User, LogOut, Package } from "lucide-react";
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
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

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
    setShowLogoutConfirm(false); // Modalni yopish
    onClose(); // Menuni darhol yopish
    try {
      await signOut();
      showSuccess(t('auth.logout_success') || 'Muvaffaqiyatli chiqdingiz');
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
    <>
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
                    <p className="text-white font-medium text-sm truncate">{user.name || user.email}</p>
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
                    <hr className="border-white/20 my-2" />
                    <button
                      onClick={() => setShowLogoutConfirm(true)}
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
    
    {/* Logout Confirmation Modal - Menudan tashqarida, mustaqil ishlaydi */}
    <AnimatePresence>
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
            onClick={() => setShowLogoutConfirm(false)} 
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-gradient-to-br from-slate-900 to-slate-800 border border-white/20 rounded-2xl p-6 shadow-2xl relative z-10 w-full max-w-sm"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-red-500/20 rounded-full">
                <LogOut className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-xl font-semibold text-white">Tizimdan chiqish</h3>
            </div>
            <p className="text-gray-300 mb-6">Rostdan ham profilingizdan chiqmoqchimisiz?</p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-colors"
              >
                Yo'q, qolish
              </button>
              <button
                onClick={handleSignOut}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors shadow-lg shadow-red-500/25"
              >
                Ha, chiqish
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
    </>
  );
}