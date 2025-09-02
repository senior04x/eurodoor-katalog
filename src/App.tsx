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
    if (productId) setSelectedProductId(productId);
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
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-white mb-4">Chegirma Mahsulotlar</h1>
              <p className="text-gray-300">Tez orada...</p>
            </div>
          </div>
        );
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="relative min-h-screen font-[Inter] overflow-x-hidden">
      {/* ===== Fixed Background (past qatlam) ===== */}
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: "url('https://iili.io/KqAQo3g.jpg')" }}
      />
      {/* Yengil qoraytirish (o‘chirmoqchi bo‘lsangiz, pastdagi divni olib tashlang) */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-black/30" />

      {/* ===== Kontent (ustki qatlam) ===== */}
      <div className="relative z-10">
        <Header currentPage={currentPage} onNavigate={handleNavigate} />
        {renderCurrentPage()}
      </div>
    </div>
  );
}
