import { useState, useEffect } from 'react';
import Header from './components/Header';
import HomePage from './components/HomePage';
import CatalogPage from './components/CatalogPage';
import ProductDetailPage from './components/ProductDetailPage';
import AboutPage from './components/AboutPage';
import ContactPage from './components/ContactPage';
import AdminPanel from './components/AdminPanel';
import { useLanguage } from './hooks/useLanguage';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const { language, t } = useLanguage();

  // localStorage dan current page ni o'qish
  useEffect(() => {
    const savedPage = localStorage.getItem('currentPage');
    const savedProductId = localStorage.getItem('selectedProductId');
    if (savedPage) {
      setCurrentPage(savedPage);
    }
    if (savedProductId) {
      setSelectedProductId(savedProductId);
    }
    
    // Loading ni o'chirish
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Til o'zgarishi paytida current state ni saqlash
  useEffect(() => {
    const handleBeforeUnload = () => {
      localStorage.setItem('currentPage', currentPage);
      if (selectedProductId) {
        localStorage.setItem('selectedProductId', selectedProductId);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [currentPage, selectedProductId]);

  const handleNavigate = (page: string, productId?: string) => {
    setCurrentPage(page);
    localStorage.setItem('currentPage', page);
    if (productId) {
      setSelectedProductId(productId);
      localStorage.setItem('selectedProductId', productId);
    }
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'catalog':
        return <CatalogPage onNavigate={handleNavigate} />;
      case 'product':
        return <ProductDetailPage productId={selectedProductId} onNavigate={handleNavigate} />;
      case 'about':
        return <AboutPage onNavigate={handleNavigate} />;
      case 'contact':
        return <ContactPage onNavigate={handleNavigate} />;
      case 'admin':
        return <AdminPanel />;
      case 'blog':
        return (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-white mb-4">{t('app.promotions')}</h1>
              <p className="text-gray-300">{t('app.coming_soon')}</p>
            </div>
          </div>
        );
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="relative min-h-screen font-[Inter] overflow-x-hidden">
        {/* ===== Fixed Background (past qatlam) ===== */}
        <div
          className="pointer-events-none fixed inset-0 z-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://iili.io/KqAQo3g.jpg')" }}
        />
        {/* Yengil qoraytirish */}
        <div className="pointer-events-none fixed inset-0 z-0 bg-black/30" />
        
        {/* Loading spinner */}
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
            <p className="text-white mt-4 text-center">Yuklanmoqda...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen font-[Inter] overflow-x-hidden">
      {/* ===== Fixed Background (past qatlam) ===== */}
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: "url('https://iili.io/KqAQo3g.jpg')" }}
      />
      {/* Yengil qoraytirish (o'chirmoqchi bo'lsangiz, pastdagi divni olib tashlang) */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-black/30" />

      {/* ===== Kontent (ustki qatlam) ===== */}
      <div className="relative z-10">
        <Header currentPage={currentPage} onNavigate={handleNavigate} />
        {renderCurrentPage()}
      </div>
    </div>
  );
}
