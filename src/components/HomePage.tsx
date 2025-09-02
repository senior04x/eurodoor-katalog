import { ImageWithFallback } from './figma/ImageWithFallback';
import { ArrowRight, Shield, Award, Clock } from 'lucide-react';

interface HomePageProps {
  onNavigate: (page: string) => void;
}

export default function HomePage({ onNavigate }: HomePageProps) {
  const features = [
    {
      icon: Shield,
      title: "Yuqori xavfsizlik",
      description: "Metall va MDF materiallardan yasalgan mustahkam eshiklar"
    },
    {
      icon: Award,
      title: "Sifat sertifikati",
      description: "Barcha mahsulotlar xalqaro standartlarga javob beradi"
    },
    {
      icon: Clock,
      title: "Tez yetkazib berish",
      description: "Professional o'rnatish xizmati bilan birga"
    }
  ];

  return (
  <div className="relative min-h-screen">
    {/* Fixed background (hamma qurilmalarda ishlaydi) */}
    <div
      className="fixed inset-0 bg-cover bg-center"
      style={{ backgroundImage: "url('https://iili.io/KqAQo3g.jpg')" }}
    />
    <div className="fixed inset-0 bg-black/30" />

    {/* Hero Section */}
  <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
  <div className="relative container mx-auto px-4 h-full flex items-center justify-center">
    <div className="max-w-2xl text-white bg-none rounded-2xl p-8 border border-none text-center">
      <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
        Sizning uyingiz xavfsizligi bizning 
        <span className="text-white"> ustuvorligimiz</span>
      </h1>
      <p className="text-xl mb-8 opacity-90">
        Zamonaviy dizayn va yuqori xavfsizlik standartlarini birlashtirgan 
        premium temir va MDF eshiklar
      </p>
      <button 
        onClick={() => onNavigate('catalog')}
        className="bg-white/5 backdrop-blur-sm text-white px-8 py-4 font-semibold rounded-xl hover:bg-white/10 transition-all duration-300 flex items-center gap-2 group border border-white/30 shadow-lg hover:shadow-xl mx-auto"
      >
        Katalogni ko'rish
        <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  </div>
</section>


    {/* Features Section */}
    <section className="py-20 bg-gradient-to-b from-white/0 to-white/0 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-4">
            Nima uchun EURODOOR?
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Ko'p yillik tajriba va zamonaviy texnologiyalar asosida ishlab chiqarilgan eshiklar
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="text-center p-8 rounded-2xl hover:shadow-2xl transition-all duration-300 bg-white/10 backdrop-blur-md border border-white/20 shadow-lg hover:scale-105"
            >
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 border border-white/30">
                <feature.icon className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">
                {feature.title}
              </h3>
              <p className="text-gray-200">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* CTA Section */}
    <section className="py-16 bg-gradient-to-r from-black/30 to-black/15 backdrop-blur-md text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-6">
          Bepul maslahat va o'lchash xizmati
        </h2>
        <p className="text-lg mb-8 opacity-90">
          Mutaxassislarimiz sizga eng mos keluvchi eshikni tanlashda yordam beradi
        </p>
       <button
  onClick={() => {
    onNavigate('contact');
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }}
  className="bg-white/20 backdrop-blur-md text-white px-8 py-4 font-semibold rounded-xl hover:bg-white/30 transition-all duration-300 border border-white/30 shadow-lg hover:shadow-xl"
>
  Aloqaga chiqish
</button>

      </div>
    </section>
  </div>
);

}