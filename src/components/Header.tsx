import { useEffect, useState } from 'react';
import { Menu, X, ShoppingCart, User, LogOut, LogIn, UserPlus, Edit, Save, Phone, Mail, Calendar } from 'lucide-react';
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
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editProfileData, setEditProfileData] = useState({
    name: '',
    phone: ''
  });
  const [isTelegramWebApp, setIsTelegramWebApp] = useState(false);
  const { t } = useLanguage();
  const { totalItems, isCartOpen, setIsCartOpen } = useCart();
  const { user, signOut, updateProfile } = useAuth();
  const { showSuccess } = useToast();

  // Profile modal functions
  const handleProfileEdit = () => {
    if (user) {
      setEditProfileData({
        name: user.name || '',
        phone: user.phone || ''
      });
      setIsEditingProfile(true);
    }
  };

  const handleProfileSave = async () => {
    try {
      const result = await updateProfile(editProfileData);
      if (result.success) {
        setIsEditingProfile(false);
        showSuccess('Profil muvaffaqiyatli yangilandi!');
      } else {
        showSuccess('Xatolik: ' + result.error);
      }
    } catch (error) {
      showSuccess('Profil yangilashda xatolik yuz berdi');
    }
  };

  const handleProfileCancel = () => {
    setEditProfileData({
      name: user?.name || '',
      phone: user?.phone || ''
    });
    setIsEditingProfile(false);
  };

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
                
                <div className="relative">
                  <button
                    onClick={() => setShowProfileModal(true)}
                    className="flex items-center space-x-1 px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-md transition-colors"
                  >
                    <User className="h-4 w-4" />
                    <span className="text-sm">{user.name || user.email}</span>
                  </button>
                  
                  {/* Profile Modal positioned below user name */}
                  <AnimatePresence>
                    {showProfileModal && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 top-full mt-2 w-80 bg-gradient-to-br from-blue-500/90 via-purple-500/90 to-blue-600/90 backdrop-blur-2xl border border-white/30 shadow-2xl z-50"
                        style={{ borderRadius: '0' }}
                      >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-white/30 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm">
                          <h3 className="text-white font-semibold text-lg">Mening Profilim</h3>
                          <button
                            onClick={() => setShowProfileModal(false)}
                            className="text-white/70 hover:text-white transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-4">
                          {/* Name */}
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                              <User className="w-5 h-5 text-blue-400" />
                            </div>
                            <div className="flex-1">
                              <label className="block text-sm font-medium text-gray-300 mb-1">Ism</label>
                              {isEditingProfile ? (
                                <input
                                  type="text"
                                  value={editProfileData.name}
                                  onChange={(e) => setEditProfileData({ ...editProfileData, name: e.target.value })}
                                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white focus:outline-none focus:border-white/40 transition-colors text-sm"
                                  placeholder="Ismingizni kiriting"
                                />
                              ) : (
                                <p className="text-white font-medium">{user?.name || 'Kiritilmagan'}</p>
                              )}
                            </div>
                          </div>

                          {/* Phone */}
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                              <Phone className="w-5 h-5 text-green-400" />
                            </div>
                            <div className="flex-1">
                              <label className="block text-sm font-medium text-gray-300 mb-1">Telefon raqami</label>
                              {isEditingProfile ? (
                                <input
                                  type="tel"
                                  value={editProfileData.phone}
                                  onChange={(e) => setEditProfileData({ ...editProfileData, phone: e.target.value })}
                                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white focus:outline-none focus:border-white/40 transition-colors text-sm"
                                  placeholder="+998 90 123 45 67"
                                />
                              ) : (
                                <p className="text-white font-medium">{user?.phone || 'Kiritilmagan'}</p>
                              )}
                            </div>
                          </div>

                          {/* Email */}
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                              <Mail className="w-5 h-5 text-purple-400" />
                            </div>
                            <div className="flex-1">
                              <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                              <p className="text-white font-medium">{user?.email}</p>
                              <p className="text-gray-400 text-xs">Email o'zgartirib bo'lmaydi</p>
                            </div>
                          </div>

                          {/* Registration Date */}
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                              <Calendar className="w-5 h-5 text-orange-400" />
                            </div>
                            <div className="flex-1">
                              <label className="block text-sm font-medium text-gray-300 mb-1">Ro'yxatdan o'tgan sana</label>
                              <p className="text-white font-medium">
                                {user?.created_at ? new Date(user.created_at).toLocaleDateString('uz-UZ', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                }) : 'Noma\'lum'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-white/30 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm">
                          {isEditingProfile ? (
                            <div className="flex space-x-3">
                              <button
                                onClick={handleProfileSave}
                                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-600/80 hover:bg-green-600 text-white transition-colors text-sm"
                              >
                                <Save className="w-4 h-4" />
                                <span>Saqlash</span>
                              </button>
                              <button
                                onClick={handleProfileCancel}
                                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gray-600/80 hover:bg-gray-600 text-white transition-colors text-sm"
                              >
                                <X className="w-4 h-4" />
                                <span>Bekor qilish</span>
                              </button>
                            </div>
                          ) : (
                            <div className="flex space-x-3">
                              <button
                                onClick={handleProfileEdit}
                                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600/80 hover:bg-blue-600 text-white transition-colors text-sm"
                              >
                                <Edit className="w-4 h-4" />
                                <span>Tahrirlash</span>
                              </button>
                              <button
                                onClick={() => {
                                  setShowProfileModal(false);
                                  onNavigate('orders');
                                }}
                                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-purple-600/80 hover:bg-purple-600 text-white transition-colors text-sm"
                              >
                                <ShoppingCart className="w-4 h-4" />
                                <span>Buyurtmalarim</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
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
