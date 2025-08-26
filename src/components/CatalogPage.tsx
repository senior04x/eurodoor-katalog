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

const doors: DoorProduct[] = [
  {
    id: '1',
    name: 'Model 1',
    image: '/image/model1.jpg',
    material: 'Po‘lat',
    security: 'Yuqori',
    dimensions: '210x90 sm',
    description: 'Zamonaviy dizayn, yuqori xavfsizlik.',
  },
  {
    id: '2',
    name: 'Model 2',
    image: '/image/model2.jpg',
    material: 'Temir',
    security: 'O‘rta',
    dimensions: '205x85 sm',
    description: 'Klassik ko‘rinish, ishonchli himoya.',
  },
  // Qo'shimcha eshik modellarini shu tarzda qo'shing
];

export default function CatalogPage({ onNavigate }: CatalogPageProps) {
  return (
    <div className="min-h-screen bg-[#F5F5F5] py-10">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 text-center text-[#1A1A1A]">Katalog</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {doors.map((door) => (
            <div key={door.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300">
              <div className="relative h-64 overflow-hidden">
                <img
                  src={door.image}
                  alt={door.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-xl rounded-full p-3 border border-white/30 shadow-lg">
                  <Layers className="h-5 w-5 text-white" />
                  <span className="sr-only">Kesim ko'rinishi</span>
                </div>
              </div>
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-2">{door.name}</h2>
                <p className="text-gray-600 mb-2">{door.description}</p>
                <ul className="text-sm text-gray-500 mb-4">
                  <li><strong>Material:</strong> {door.material}</li>
                  <li><strong>Xavfsizlik:</strong> {door.security}</li>
                  <li><strong>O‘lcham:</strong> {door.dimensions}</li>
                </ul>
                <button
                  className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition"
                  onClick={() => onNavigate('product', door.id)}
                >
                  Batafsil
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}