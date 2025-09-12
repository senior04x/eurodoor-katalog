import { ImageWithFallback } from './figma/ImageWithFallback';
import { Shield, Award, Users, MapPin } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useEffect } from 'react';

interface AboutPageProps {
  onNavigate: (page: string) => void;
}

export default function AboutPage({ onNavigate }: AboutPageProps) {
  const { t } = useLanguage();

  
  const stats = [
    { number: '10+', label: t('about.experience') },
    { number: '5000+', label: t('about.customers') },
    { number: '50+', label: t('about.models') },
    { number: '100%', label: t('about.quality') }
  ];

  const certificates = [
    'ISO 9001:2015',
    t('about.gost_cert'),
    t('about.ce_mark'),
    t('about.fire_cert')
  ];

  return (
    <div className="relative min-h-screen">
      {/* Fixed background — rasmga blur beramiz */}
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-cover bg-center blur-[2px]"
        style={{ backgroundImage: "url('https://iili.io/KqAQo3g.jpg')" }}
      />

      {/* Kontent — fonnning ustida turadi */}
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="bg-white/0 rounded-2xl m-4 p-8 py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl font-bold text-white mb-6">
                {t('about.title')}
              </h1>
              <p className="text-lg text-white leading-relaxed">
                {t('about.description')}
              </p>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-white/0 rounded-2xl m-4 p-8 text-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-[#E32C27] mb-2">
                    {stat.number}
                  </div>
                  <div className="text-sm text-gray-200">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Company Info */}
        <section className="py-16 bg-white/0 m-4 rounded-2xl p-8">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-white mb-6">
                  {t('about.mission')}
                </h2>
                <div className="space-y-4 text-white">
                  <p>
                    {t('about.mission_text')}
                  </p>
                  <p>
                    {t('about.doors_description')}
                  </p>
                  <p>
                    {t('about.customer_needs')}
                  </p>
                </div>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start gap-3">
                    <Shield className="h-6 w-6 text-[#E32C27] mt-1" />
                    <div>
                      <h4 className="font-semibold text-white mb-1">{t('about.security')}</h4>
                      <p className="text-sm text-white">
                        {t('about.highest_security')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Award className="h-6 w-6 text-[#E32C27] mt-1" />
                    <div>
                      <h4 className="font-semibold text-white mb-1">Sifat</h4>
                      <p className="text-sm text-white">
                        Premium materiallar va ishlov
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Users className="h-6 w-6 text-[#E32C27] mt-1" />
                    <div>
                      <h4 className="font-semibold text-white mb-1">Xizmat</h4>
                      <p className="text-sm text-white">Professional yondashuv</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-6 w-6 text-[#E32C27] mt-1" />
                    <div>
                      <h4 className="font-semibold text-white mb-1">
                        Yetkazib berish
                      </h4>
                      <p className="text-sm text-white">
                        Toshkent bo'ylab bepul yetkazib berish
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white/10 rounded-lg h-64 flex items-center justify-center">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1629649933424-42da2426e3ed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBkb29yJTIwc3RlZWx8ZW58MXx8fHwxNzU2MTA4MjM0fDA&ixlib=rb-4.1.0&q=80&w=1080"
                    alt={t('about.factory_alt')}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Certificates */}
        <section className="py-16 bg-white/0 m-4 rounded-2xl p-8">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">
                {t('about.certificates_standards')}
              </h2>
              <p className="text-white max-w-2xl mx-auto">
                {t('about.international_standards')}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {certificates.map((cert, index) => (
                <div
                  key={index}
                  className="bg-white/10 rounded-lg p-6 text-center shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="w-16 h-16 bg-[#D4AF37]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="h-8 w-8 text-[#E32C27]" />
                  </div>
                  <h3 className="font-semibold text-white">{cert}</h3>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="py-16 bg-white/0qwwqwqqwwq m-4 rounded-2xl p-8 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">{t('about.partnership')}</h2>
            <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
              {t('about.partnership_desc')}
            </p>
            <button
              onClick={() => onNavigate('contact')}
              className="bg-[#E32C27] text-white px-8 py-4 font-semibold rounded-lg hover:bg-[#F43737] transition-colors"
            >
              {t('about.contact_info')}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
