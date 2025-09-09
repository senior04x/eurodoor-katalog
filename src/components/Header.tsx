import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../hooks/useLanguage';
import LanguageSwitcher from './LanguageSwitcher';

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export default function Header({ currentPage, onNavigate }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const { t } = useLanguage();

  // Body scrollni bloklash (mobil menyu ochilganda)
  useEffect(() => {
    if (isMenuOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => document.body.classList.remove('overflow-hidden');
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
  const [logoClickCount, setLogoClickCount] = useState(0);
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

  // Animatsiya variantlar (mobil menyu)
  const mobileMenuVariants = {
    hidden: { opacity: 0, x: 24 },
    show: {
      opacity: 1,
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 420,
        damping: 34,
        mass: 0.7,
        staggerChildren: 0.05,
        when: 'beforeChildren'
      }
    },
    exit: {
      opacity: 0,
      x: 16,
      transition: { duration: 0.01 }
    }
  };

  const mobileItemVariants = {
    hidden: { opacity: 0, x: 28 },
    show: {
      opacity: 1,
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 500,
        damping: 30,
        mass: 0.6
      }
    },
    exit: { opacity: 0, x: 12, transition: { duration: 0.01 } }
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
      className="bg-white/10 backdrop-blur-xl backdrop-saturate-150 border border-white/20 sticky top-0 z-50 shadow-lg m-4 rounded-md"
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
          <nav className="hidden md:flex items-center space-x-8">
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
                    active ? 'text-white border-white' : 'text-gray-300'
                  ].join(' ')}
                >
                  {item.name}
                </button>
              );
            })}
            <LanguageSwitcher />
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-nav"
            onClick={() => setIsMenuOpen((v) => !v)}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-white" />
            ) : (
              <Menu className="h-6 w-6 text-white" />
            )}
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
                <div className="px-2 py-2">
                  <LanguageSwitcher />
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}
