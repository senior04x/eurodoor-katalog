import { ImageWithFallback } from './figma/ImageWithFallback';
import { Shield, Award, Users, MapPin } from 'lucide-react';

interface AboutPageProps {
  onNavigate: (page: string) => void;
}

export default function AboutPage({ onNavigate }: AboutPageProps) {
  const stats = [
    { number: '10+', label: 'Yillik tajriba' },
    { number: '5000+', label: 'Mamnun mijozlar' },
    { number: '50+', label: 'Eshik modellari' },
    { number: '100%', label: 'Sifat kafolati' }
  ];

  const certificates = [
    'ISO 9001:2015',
    'GOST sertifikati', 
    'CE belgisi',
    'Yong\'indan himoya sertifikati'
  ];

return (
  <div className="relative min-h-screen">
    {/* Fixed background — doimo tagda */}
    <div
      className="pointer-events-none fixed inset-0 -z-10 bg-cover bg-center"
      style={{ backgroundImage: "url('https://iili.io/Kd4L7wv.jpg')" }}
    />
    <div className="pointer-events-none fixed inset-0 -z-10 bg-black/30 backdrop-blur-sm" />

    {/* Kontent */}
    <div className="relative z-10">
      {/* Hero Section */}
      <section className="py-16 bg-black/40 backdrop-blur-md rounded-2xl mx-4 my-4">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-white mb-6">
              EURODOOR haqida
            </h1>
            <p className="text-lg text-white leading-relaxed">
              EURODOOR kompaniyasi 2014-yilda tashkil etilgan bo'lib, yuqori
              sifatli temir va MDF eshiklar ishlab chiqarish sohasida yetakchi
              o'rinni egallaydi. Bizning asosiy maqsadimiz - mijozlarimizga
              xavfsizlik va estetikani birlashtirgan zamonaviy eshiklar taqdim
              etishdir.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-black/40 backdrop-blur-md rounded-2xl mx-4 my-4 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-[#E32C27] mb-2">
                  {stat.number}
                </div>
                <div className="text-sm text-gray-300">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Company Info */}
      <section className="py-16 bg-black/40 backdrop-blur-md rounded-2xl mx-4 my-4">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* ... kontent o‘zgarmaydi ... */}
          </div>
        </div>
      </section>

      {/* Certificates */}
      <section className="py-16 bg-black/40 backdrop-blur-md rounded-2xl mx-4 my-4">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Sertifikatlar va standartlar
            </h2>
            <p className="text-white max-w-2xl mx-auto">
              Bizning barcha mahsulotlarimiz xalqaro standartlarga javob beradi
              va tegishli sertifikatlarga ega
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {certificates.map((cert, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-lg rounded-lg p-6 text-center shadow-lg hover:shadow-xl transition-shadow"
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
      <section className="py-16 bg-black/40 backdrop-blur-md rounded-2xl mx-4 my-4 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Biz bilan hamkorlik qiling</h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Professional maslahat va eng yaxshi eshiklarni tanlash uchun
            mutaxassislarimiz bilan bog'laning
          </p>
          <button
            onClick={() => onNavigate("contact")}
            className="bg-[#E32C27] text-white px-8 py-4 font-semibold rounded-lg hover:bg-[#F43737] transition-colors"
          >
            Aloqa ma'lumotlari
          </button>
        </div>
      </section>
    </div>
  </div>
);



}