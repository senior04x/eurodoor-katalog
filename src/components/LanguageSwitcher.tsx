import { Globe } from 'lucide-react';
import { useLanguage, Language } from '../hooks/useLanguage';

export default function LanguageSwitcher() {
  const { language, changeLanguage } = useLanguage();

  const languages = [
    { code: 'uz' as Language, name: 'O\'zbek', flag: '🇺🇿' },
    { code: 'ru' as Language, name: 'Русский', flag: '🇷🇺' },
    { code: 'en' as Language, name: 'English', flag: '🇺🇸' }
  ];

  return (
    <div className="relative group">
      <button className="flex items-center space-x-2 text-white hover:text-gray-300 transition-colors">
        <Globe className="h-5 w-5" />
        <span className="text-sm font-medium">
          {languages.find(lang => lang.code === language)?.flag} {languages.find(lang => lang.code === language)?.name}
        </span>
      </button>
      
      <div className="absolute right-0 top-full mt-2 w-40 bg-white/10 backdrop-blur-xl backdrop-saturate-150 border border-white/20 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => {
              console.log('Changing language to:', lang.code);
              changeLanguage(lang.code);
            }}
            className={`w-full text-left px-4 py-2 text-sm transition-colors first:rounded-t-md last:rounded-b-md ${
              language === lang.code 
                ? 'text-white bg-white/20' 
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <span className="mr-2">{lang.flag}</span>
            {lang.name}
          </button>
        ))}
      </div>
    </div>
  );
}
