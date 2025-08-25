import { ImageWithFallback } from './figma/ImageWithFallback';
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
      id: 'euro-m45',
      name: 'EURO M-45 Metal Door',
      image: 'https://images.unsplash.com/photo-1754792480714-f01a690aabd4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZXRhbCUyMGRvb3IlMjBlbnRyYW5jZXxlbnwxfHx8fDE3NTYxMDgyMzR8MA&ixlib=rb-4.1.0&q=80&w=1080',
      material: 'Metall + MDF',
      security: 'A+ sinf',
      dimensions: '2000x900mm',
      description: 'Zamonaviy dizaynli metall eshik ichki MDF qoplama bilan'
    },
    {
      id: 'euro-s32',
      name: 'EURO S-32 Security Door',
      image: 'https://images.unsplash.com/photo-1629649933424-42da2426e3ed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBkb29yJTIwc3RlZWx8ZW58MXx8fHwxNzU2MTA4MjM0fDA&ixlib=rb-4.1.0&q=80&w=1080',
      material: 'Po\'lat + MDF',
      security: 'Premium',
      dimensions: '2100x950mm',
      description: 'Yuqori xavfsizlik darajasiga ega premium eshik'
    },
    {
      id: 'euro-c28',
      name: 'EURO C-28 Classic Door',
      image: 'https://images.unsplash.com/photo-1705776919715-fa052f797923?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzZWN1cml0eSUyMGRvb3IlMjBtZXRhbHxlbnwxfHx8fDE3NTYxMDgyMzR8MA&ixlib=rb-4.1.0&q=80&w=1080',
      material: 'Metall + Shisha',
      security: 'A sinf',
      dimensions: '2000x850mm',
      description: 'Klassik uslubdagi metall eshik shisha elementlar bilan'
    },
    {
      id: 'euro-d41',
      name: 'EURO D-41 Design Door',
      image: 'https://images.unsplash.com/photo-1660492040179-f90d8dc0dfb9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbnRyYW5jZSUyMGRvb3IlMjBkZXNpZ258ZW58MXx8fHwxNzU2MTA4MjM0fDA&ixlib=rb-4.1.0&q=80&w=1080',
      material: 'Metall + Yog\'och',
      security: 'A+ sinf',
      dimensions: '2100x900mm',
      description: 'Designer uslubidagi eshik yog\'och dekor elementlari bilan'
    },
    {
      id: 'euro-p55',
      name: 'EURO P-55 Premium Door',
      image: 'https://images.unsplash.com/photo-1754792480714-f01a690aabd4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZXRhbCUyMGRvb3IlMjBlbnRyYW5jZXxlbnwxfHx8fDE3NTYxMDgyMzR8MA&ixlib=rb-4.1.0&q=80&w=1080',
      material: 'Premium po\'lat',
      security: 'Ultra',
      dimensions: '2200x1000mm',
      description: 'Eng yuqori darajadagi xavfsizlik va dizayn'
    },
    {
      id: 'euro-l33',
      name: 'EURO L-33 Luxury Door',
      image: 'https://images.unsplash.com/photo-1629649933424-42da2426e3ed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBkb29yJTIwc3RlZWx8ZW58MXx8fHwxNzU2MTA4MjM0fDA&ixlib=rb-4.1.0&q=80&w=1080',
      material: 'Metall + Natutal yog\'och',
      security: 'A+ sinf',
      dimensions: '2100x950mm',
      description: 'Hashamatli dizayn va natural materiallar'
    }
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Header Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-[#1A1A1A] mb-4">
              Eshiklar katalogi
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
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
              <div key={door.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                {/* Product Image */}
                <div className="relative h-64 overflow-hidden">
                  <ImageWithFallback
                    src={door.image}
                    alt={door.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Kesim ko'rinishi icon */}
                  <div className="absolute top-4 right-4 bg-white/90 rounded-full p-2">
                    <Layers className="h-4 w-4 text-[#D4AF37]" />
                    <span className="sr-only">Kesim ko'rinishi</span>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-[#1A1A1A] mb-3">
                    {door.name}
                  </h3>
                  
                  <div className="space-y-2 mb-4 text-sm text-gray-600">
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

                  <p className="text-gray-600 text-sm mb-6">
                    {door.description}
                  </p>

                  <button
                    onClick={() => onNavigate('product', door.id)}
                    className="w-full bg-[#D4AF37] text-black py-3 px-4 rounded-lg font-semibold hover:bg-[#B8941F] transition-colors flex items-center justify-center gap-2"
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