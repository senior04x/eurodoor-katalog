import { Eye, Layers } from 'lucide-react';

interface CatalogPageProps {
  onNavigate: (page: string, productId?: string) => void;
}

interface DoorProduct {
  id: string;
  name: string;
  image: string;
  material: string;
  security: string;
  dimensions: string;
  description: string;
}

export default function CatalogPage({ onNavigate }: CatalogPageProps) {
  const doors: DoorProduct[] = [
    {
      id: 'euro-model1',
      name: 'EURO Model-1 Metal Door',
      image: 'https://iili.io/2XPGae9.png',
      material: 'Metall + MDF',
      security: 'A+ sinf',
      dimensions: '2000x900mm',
      description: 'Zamonaviy dizaynli metall eshik ichki MDF qoplama bilan'
    },
    {
      id: 'euro-model2',
      name: 'EURO Model-2 Security Door',
      image: 'https://iili.io/2XiBAMJ.png',
      material: 'Po\'lat + MDF',
      security: 'Premium',
      dimensions: '2100x950mm',
      description: 'Yuqori xavfsizlik darajasiga ega premium eshik'
    },
    {
      id: 'euro-model3',
      name: 'EURO Model-3 Classic Door',
      image: 'https://iili.io/2XiBwS2.png',
      material: 'Metall + Shisha',
      security: 'A sinf',
      dimensions: '2000x850mm',
      description: 'Klassik uslubdagi metall eshik shisha elementlar bilan'
    },
    {
      id: 'euro-model4',
      name: 'EURO Model-4 Design Door',
      image: 'https://iili.io/2XPGzWG.png',
      material: 'Metall + Yog\'och',
      security: 'A+ sinf',
      dimensions: '2100x900mm',
      description: 'Designer uslubidagi eshik yog\'och dekor elementlari bilan'
    },
    {
      id: 'euro-model5',
      name: 'EURO Model-5 Premium Door',
      image: 'https://iili.io/2Xige71.jpg',
      material: 'Premium po\'lat',
      security: 'Ultra',
      dimensions: '2200x1000mm',
      description: 'Eng yuqori darajadagi xavfsizlik va dizayn'
    },
    {
      id: 'euro-model6',
      name: 'EURO Model-6 Luxury Door',
      image: 'https://iili.io/2Xir2Y7.jpg',
      material: 'Metall + Natutal yog\'och',
      security: 'A+ sinf',
      dimensions: '2100x950mm',
      description: 'Hashamatli dizayn va natural materiallar'
    },
    {
      id: 'euro-model7',
      name: 'EURO Model-7 Modern Door',
      image: '/image/model7.jpg',
      material: 'Metall + Kompozit',
      security: 'A+ sinf',
      dimensions: '2000x900mm',
      description: 'Zamonaviy kompozit materiallar bilan ishlangan eshik'
    },
    {
      id: 'euro-model8',
      name: 'EURO Model-8 Elite Door',
      image: '/image/model8.jpg',
      material: 'Premium po\'lat + MDF',
      security: 'Ultra Premium',
      dimensions: '2100x1000mm',
      description: 'Elite darajadagi xavfsizlik va dizayn'
    },
    {
      id: 'euro-model9',
      name: 'EURO Model-9 Classic Premium',
      image: '/image/model9.jpg',
      material: 'Metall + Yog\'och + Shisha',
      security: 'A+ sinf',
      dimensions: '2100x950mm',
      description: 'Klassik va zamonaviy elementlarni birlashtirgan eshik'
    },
    {
      id: 'euro-model10',
      name: 'EURO Model-10 Executive Door',
      image: '/image/model10.jpg',
      material: 'Premium po\'lat + Natural yog\'och',
      security: 'Executive',
      dimensions: '2200x1000mm',
      description: 'Ijrochi darajadagi xavfsizlik va hashamat'
    },
    {
      id: 'euro-model11',
      name: 'EURO Model-11 Ultimate Door',
      image: '/image/model11.jpg',
      material: 'Ultra Premium po\'lat + MDF',
      security: 'Ultimate',
      dimensions: '2200x1000mm',
      description: 'Eng yuqori darajadagi xavfsizlik va dizayn'
    }
  ];

  return (
    <div className="relative min-h-screen">
       {/* Fixed background */}
    <div
      className="fixed inset-0 bg-cover bg-center"
      style={{ backgroundImage: "url('https://iili.io/K2Em0Cu.png')" }}
    />
    <div className="fixed inset-0 bg-black/30" />
      {/* Header Section */}
      <section className="bg-none backdrop-blur-xl py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">
              Eshiklar katalogi
            </h1>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Yuqori sifatli temir va MDF eshiklarimiz bilan tanishing. 
              Har bir model maxsus texnologiya asosida ishlab chiqarilgan.
            </p>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {doors.map((door) => (
              <div key={door.id} className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden hover:shadow-3xl transition-all duration-300 border border-white/20 hover:scale-105">
                {/* Product Image */}
                  <div className="relative aspect-square overflow-hidden">
                     <img
                       src={door.image}
                       alt={door.name}
                       className="w-full h-full object-cover"
                      />
                    <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-xl rounded-full p-3 border border-white/30 shadow-lg">
                      <Layers className="h-5 w-5 text-white" />
                      <span className="sr-only">Kesim ko'rinishi</span>
                    </div>
                   </div>

                {/* Product Info */}
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-white mb-3">
                    {door.name}
                  </h3>
                  
                  <div className="space-y-2 mb-4 text-sm text-gray-300">
                    <div>
                      <span className="font-medium">Material:</span> {door.material}
                    </div>
                    <div>
                      <span className="font-medium">Xavfsizlik darajasi:</span> {door.security}
                    </div>
                    <div>
                      <span className="font-medium">O'lchamlar:</span> {door.dimensions}
                    </div>
                  </div>

                  <p className="text-gray-300 text-sm mb-6">
                    {door.description}
                  </p>

                  <button
                    onClick={() => onNavigate('product', door.id)}
                    className="w-full bg-white/20 backdrop-blur-md text-white py-3 px-4 rounded-xl font-semibold hover:bg-white/30 transition-all duration-300 flex items-center justify-center gap-2 border border-white/30 shadow-lg hover:shadow-xl"
                  >
                    <Eye className="h-4 w-4" />
                    Batafsil ko'rish
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}