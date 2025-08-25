import { useState } from 'react';
import { Menu, X } from 'lucide-react';

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export default function Header({ currentPage, onNavigate }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigation = [
    { name: 'Katalog', id: 'catalog' },
    { name: 'Biz haqimizda', id: 'about' },
    { name: 'Aloqa', id: 'contact' },
    { name: 'Blog', id: 'blog' }
  ];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div 
            onClick={() => onNavigate('home')}
            className="cursor-pointer"
          >
            <h1 className="text-2xl font-bold text-gray-900 tracking-wider">
              EURO<span className="text-[#D4AF37]">DOOR</span>
            </h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`text-sm font-medium transition-colors hover:text-[#D4AF37] ${
                  currentPage === item.id 
                    ? 'text-[#D4AF37] border-b-2 border-[#D4AF37] pb-1' 
                    : 'text-gray-700'
                }`}
              >
                {item.name}
              </button>
            ))}
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-gray-700" />
            ) : (
              <Menu className="h-6 w-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-3">
              {navigation.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setIsMenuOpen(false);
                  }}
                  className={`text-left px-2 py-1 text-sm font-medium transition-colors hover:text-[#D4AF37] ${
                    currentPage === item.id ? 'text-[#D4AF37]' : 'text-gray-700'
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}