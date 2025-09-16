// import { ImageWithFallback } from './figma/ImageWithFallback';
import { ArrowRight, Shield, Award, Clock } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
// import { useEffect } from 'react';

interface HomePageProps {
  onNavigate: (page: string) => void;
}

export default function HomePage({ onNavigate }: HomePageProps) {
  const { t } = useLanguage();

  
  const features = [
    {
      icon: Shield,
      title: t('home.security'),
      description: t('home.security_desc')
    },
    {
      icon: Award,
      title: t('home.quality'),
      description: t('home.quality_desc')
    },
    {
      icon: Clock,
      title: t('home.delivery'),
      description: t('home.delivery_desc')
    }
  ];

  return (
  <div className="relative min-h-screen">
    {/* Optimized background with new PNG */}
    <div
      className="fixed inset-0 bg-cover bg-center bg-no-repeat"
      style={{ 
        backgroundImage: "url('/images/hero-bg.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    />
    <div className="fixed inset-0 bg-black/30" />

    {/* Hero Section - Text slightly higher */}
  <section className="relative h-screen flex items-center overflow-hidden">
  <div className="relative container mx-auto px-4 pr-8 md:pr-16 lg:pr-24 h-full flex items-center">
    <div className="max-w-2xl text-white -mt-24">
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
        {t('home.hero_title')}
      </h1>
      <p className="text-xl md:text-2xl mb-6 opacity-90 text-gray-100">
        {t('home.hero_subtitle')}
      </p>
      <button 
        onClick={() => onNavigate('catalog')}
        className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-4 font-semibold rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 flex items-center gap-2 group shadow-lg hover:shadow-xl transform hover:scale-105"
      >
        {t('home.view_catalog')}
        <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  </div>
</section>


    {/* Features Section */}
    <section className="py-20 bg-gradient-to-b from-white/0 to-white/0 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-4 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
            {t('home.why_eurodoor')}
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            {t('home.experience_text')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="text-center p-8 rounded-3xl hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 shadow-lg hover:scale-105 hover:border-blue-500/50 group"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500/30 to-purple-500/30 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 border border-white/30 group-hover:border-blue-500/50 transition-all duration-300">
                <feature.icon className="h-10 w-10 text-white group-hover:text-blue-200 transition-colors duration-300" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-4 group-hover:text-blue-100 transition-colors duration-300">
                {feature.title}
              </h3>
              <p className="text-gray-200 group-hover:text-gray-100 transition-colors duration-300">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* CTA Section */}
    <section className="py-16 bg-gradient-to-r from-slate-900/50 via-purple-900/50 to-slate-900/50 backdrop-blur-xl text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-xl md:text-2xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
          {t('home.free_consultation')}
        </h2>
        <p className="text-lg mb-8 opacity-90 text-gray-100">
          {t('home.specialists_help')}
        </p>
       <button
  onClick={() => {
    onNavigate('contact');
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }}
  className="bg-gradient-to-r from-blue-500/30 to-purple-500/30 backdrop-blur-md text-white px-8 py-4 font-semibold rounded-xl hover:from-blue-500/40 hover:to-purple-500/40 transition-all duration-300 border border-blue-500/50 shadow-lg hover:shadow-xl transform hover:scale-105"
>
  {t('home.contact_button')}
</button>

      </div>
    </section>
  </div>
);

}