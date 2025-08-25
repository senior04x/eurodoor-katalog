import { ImageWithFallback } from './figma/ImageWithFallback';
import { ArrowLeft, Shield, Ruler, Award, Phone } from 'lucide-react';

interface ProductDetailPageProps {
  productId: string;
  onNavigate: (page: string) => void;
}

export default function ProductDetailPage({ productId, onNavigate }: ProductDetailPageProps) {
  // Mock product data - in a real app this would come from an API
  const getProductData = (id: string) => {
    const products: { [key: string]: any } = {
      'euro-m45': {
        name: 'EURO M-45 Metal Door',
        image: 'https://images.unsplash.com/photo-1754792480714-f01a690aabd4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZXRhbCUyMGRvb3IlMjBlbnRyYW5jZXxlbnwxfHx8fDE3NTYxMDgyMzR8MA&ixlib=rb-4.1.0&q=80&w=1080',
        material: 'Metall + MDF',
        security: 'A+ sinf',
        dimensions: '2000x900x80mm',
        price: '2,500,000 so\'m',
        description: 'EURO M-45 - zamonaviy dizaynli metall eshik bo\'lib, ichki qismida yuqori sifatli MDF qoplama mavjud. Bu model kuchli xavfsizlik va estetik ko\'rinishni birlashtiradi.',
        features: [
          'Galvanizlangan po\'latdan yasalgan tashqi qism',
          'Ichki qismida 16mm MDF qoplama',
          '3-nuqtali qulflash tizimi',
          'Termal izolyatsiya',
          'UV nurlariga chidamli bo\'yoq qoplama'
        ],
        specifications: [
          { label: 'Material', value: 'Galvanizlangan po\'lat + MDF' },
          { label: 'Qalinligi', value: '80mm' },
          { label: 'Qulf', value: '3-nuqtali Mottura' },
          { label: 'Ilgak', value: '3ta mustahkam ilgak' },
          { label: 'Izolyatsiya', value: 'Mineral paxta' },
          { label: 'Kafolat', value: '5 yil' }
        ]
      }
    };
    
    return products[id] || products['euro-m45'];
  };

  const product = getProductData(productId);

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Back Navigation */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={() => onNavigate('catalog')}
            className="flex items-center gap-2 text-gray-600 hover:text-[#D4AF37] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Katalogga qaytish
          </button>
        </div>
      </div>

      <div className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Image */}
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4 shadow-lg">
                <ImageWithFallback
                  src={product.image}
                  alt={product.name}
                  className="w-full h-96 object-cover rounded-lg"
                />
              </div>
              
              {/* Technical Drawing */}
              <div className="bg-white rounded-lg p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4 flex items-center gap-2">
                  <Ruler className="h-5 w-5 text-[#D4AF37]" />
                  Texnik chizma
                </h3>
                <div className="bg-gray-100 rounded-lg h-48 flex items-center justify-center border-2 border-dashed border-gray-300">
                  <div className="text-center text-gray-500">
                    <Ruler className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>O'rtadan kesilgan ko'rinish</p>
                    <p className="text-sm">Ichki qatlam struktura</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg p-6 shadow-lg">
                <h1 className="text-3xl font-bold text-[#1A1A1A] mb-4">
                  {product.name}
                </h1>
                
                <div className="text-2xl font-bold text-[#D4AF37] mb-6">
                  {product.price}
                </div>

                <p className="text-gray-600 mb-6 leading-relaxed">
                  {product.description}
                </p>

                {/* Key Features */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-[#1A1A1A] mb-3 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-[#D4AF37]" />
                    Asosiy xususiyatlar
                  </h3>
                  <ul className="space-y-2">
                    {product.features.map((feature: string, index: number) => (
                      <li key={index} className="flex items-start gap-2 text-gray-600">
                        <div className="w-2 h-2 bg-[#D4AF37] rounded-full mt-2 flex-shrink-0"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Order Button */}
                <button className="w-full bg-[#D4AF37] text-black py-4 px-6 rounded-lg font-semibold hover:bg-[#B8941F] transition-colors flex items-center justify-center gap-2">
                  <Phone className="h-5 w-5" />
                  Buyurtma berish
                </button>
              </div>

              {/* Specifications */}
              <div className="bg-white rounded-lg p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4 flex items-center gap-2">
                  <Award className="h-5 w-5 text-[#D4AF37]" />
                  Texnik xususiyatlar
                </h3>
                <div className="space-y-3">
                  {product.specifications.map((spec: any, index: number) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">{spec.label}:</span>
                      <span className="font-medium text-[#1A1A1A]">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Installation Info */}
              <div className="bg-[#D4AF37]/10 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-[#1A1A1A] mb-3">
                  O'rnatish bo'yicha tavsiyalar
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Professional o'rnatish xizmati mavjud</li>
                  <li>• O'rnatish 2-3 soat davom etadi</li>
                  <li>• Barcha kerakli jihozlar ta'minlanadi</li>
                  <li>• 1 yillik o'rnatish kafolati</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}