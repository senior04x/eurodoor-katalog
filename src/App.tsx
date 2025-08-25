import { useState } from 'react';
import Header from './components/Header';
import HomePage from './components/HomePage';
import CatalogPage from './components/CatalogPage';
import ProductDetailPage from './components/ProductDetailPage';
import AboutPage from './components/AboutPage';
import ContactPage from './components/ContactPage';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedProductId, setSelectedProductId] = useState<string>('');

  const handleNavigate = (page: string, productId?: string) => {
    setCurrentPage(page);
    if (productId) {
      setSelectedProductId(productId);
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
        return <ContactPage />;
      case 'blog':
        return (
          <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-[#1A1A1A] mb-4">Blog</h1>
              <p className="text-gray-600">Tez orada...</p>
            </div>
          </div>
        );
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-black font-[Inter]">
      <Header currentPage={currentPage} onNavigate={handleNavigate} />
      {renderCurrentPage()}
    </div>
  );
}