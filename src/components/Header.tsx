import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

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
    <header className="bg-white/1 backdrop-blur-sm border-b border-none sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div 
            onClick={() => onNavigate('home')}
            className="cursor-pointer"
          >
            <ImageWithFallback
              src="https://iili.io/2XPEgR9.png"
              alt="EURODOOR Logo"
              className="h-20 w-auto"
            />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`text-sm font-medium transition-colors hover:text-white ${
                  currentPage === item.id 
                    ? 'text-white border-b-2 border-white pb-1' 
                    : 'text-gray-300'
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
              <X className="h-6 w-6 text-white" />
            ) : (
              <Menu className="h-6 w-6 text-white" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/10">
            <nav className="flex flex-col space-y-3">
              {navigation.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setIsMenuOpen(false);
                  }}
                  className={`text-left px-2 py-1 text-sm font-medium transition-colors hover:text-white ${
                    currentPage === item.id ? 'text-white' : 'text-gray-300'
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