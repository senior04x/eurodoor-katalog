// import { ChevronDown } from 'lucide-react'; // Kerak emas
import { useLanguage, Language } from '../contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';

export default function LanguageSwitcher() {
  const { language, changeLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: 'uz' as Language, name: 'O\'zbek', flag: '🇺🇿' },
    { code: 'ru' as Language, name: 'Русский', flag: '🇷🇺' },
    { code: 'en' as Language, name: 'English', flag: '🇺🇸' }
  ];

  const currentLanguage = languages.find(lang => lang.code === language);
  const otherLanguages = languages.filter(lang => lang.code !== language);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="flex items-center space-x-4" ref={dropdownRef}>
      {/* Asosiy til tugmasi */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center text-white hover:text-gray-300 transition-colors"
      >
        <span className="text-sm font-medium">
          {currentLanguage?.name}
        </span>
      </button>
      
      {/* Boshqa tillar - Inline Gorizontal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center space-x-4 overflow-hidden"
          >
            {otherLanguages.map((lang, index) => (
              <motion.button
                key={lang.code}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.2 }}
                onClick={() => {
                  changeLanguage(lang.code);
                  setIsOpen(false);
                }}
                className="flex items-center space-x-1 text-white hover:text-gray-300 transition-colors"
              >
                <span className="text-xs whitespace-nowrap">{lang.name}</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
