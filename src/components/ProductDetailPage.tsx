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
      'euro-model1': {
        name: 'EURO Model-1 Metal Door',
        image: 'https://iili.io/2XPGae9.png',
        material: 'Metall + MDF',
        security: 'A+ sinf',
        dimensions: '2000x900x80mm',
        price: '2,500,000 so\'m',
        description: 'EURO Model-1 - zamonaviy dizaynli metall eshik bo\'lib, ichki qismida yuqori sifatli MDF qoplama mavjud. Bu model kuchli xavfsizlik va estetik ko\'rinishni birlashtiradi.',
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
      },
      'euro-model2': {
        name: 'EURO Model-2 Security Door',
        image: 'https://iili.io/2XiBAMJ.png',
        material: 'Po\'lat + MDF',
        security: 'Premium',
        dimensions: '2100x950x85mm',
        price: '3,200,000 so\'m',
        description: 'EURO Model-2 - yuqori xavfsizlik darajasiga ega premium eshik. Maxsus po\'lat qatlamlari va ilg\'or qulflash tizimi bilan jihozlangan.',
        features: [
          'Maxsus po\'lat qatlamlari',
          '5-nuqtali qulflash tizimi',
          'Antivandal qoplama',
          'Yuqori darajadagi izolyatsiya',
          'Professional o\'rnatish'
        ],
        specifications: [
          { label: 'Material', value: 'Maxsus po\'lat + MDF' },
          { label: 'Qalinligi', value: '85mm' },
          { label: 'Qulf', value: '5-nuqtali Premium' },
          { label: 'Ilgak', value: '5ta mustahkam ilgak' },
          { label: 'Izolyatsiya', value: 'Premium mineral paxta' },
          { label: 'Kafolat', value: '7 yil' }
        ]
      },
      'euro-model3': {
        name: 'EURO Model-3 Classic Door',
        image: 'https://iili.io/2XiBwS2.png',
        material: 'Metall + Shisha',
        security: 'A sinf',
        dimensions: '2000x850x75mm',
        price: '2,800,000 so\'m',
        description: 'EURO Model-3 - klassik uslubdagi metall eshik shisha elementlar bilan. Zamonaviy xavfsizlik va klassik dizaynni birlashtiradi.',
        features: [
          'Klassik dizayn elementlari',
          'Shisha dekor elementlari',
          '3-nuqtali qulflash tizimi',
          'Yorug\'lik o\'tkazish',
          'Estetik ko\'rinish'
        ],
        specifications: [
          { label: 'Material', value: 'Metall + Shisha' },
          { label: 'Qalinligi', value: '75mm' },
          { label: 'Qulf', value: '3-nuqtali Classic' },
          { label: 'Ilgak', value: '3ta mustahkam ilgak' },
          { label: 'Shisha', value: 'Temirli shisha' },
          { label: 'Kafolat', value: '5 yil' }
        ]
      },
      'euro-model4': {
        name: 'EURO Model-4 Design Door',
        image: 'https://iili.io/2XPGzWG.png',
        material: 'Metall + Yog\'och',
        security: 'A+ sinf',
        dimensions: '2100x900x80mm',
        price: '3,500,000 so\'m',
        description: 'EURO Model-4 - designer uslubidagi eshik yog\'och dekor elementlari bilan. Hashamatli ko\'rinish va yuqori xavfsizlik.',
        features: [
          'Yog\'och dekor elementlari',
          'Designer uslub',
          '4-nuqtali qulflash tizimi',
          'Natural materiallar',
          'Hashamatli ko\'rinish'
        ],
        specifications: [
          { label: 'Material', value: 'Metall + Yog\'och' },
          { label: 'Qalinligi', value: '80mm' },
          { label: 'Qulf', value: '4-nuqtali Design' },
          { label: 'Ilgak', value: '4ta mustahkam ilgak' },
          { label: 'Yog\'och', value: 'Natural yog\'och' },
          { label: 'Kafolat', value: '6 yil' }
        ]
      },
      'euro-model5': {
        name: 'EURO Model-5 Premium Door',
        image: 'https://iili.io/2Xige71.jpg',
        material: 'Premium po\'lat',
        security: 'Ultra',
        dimensions: '2200x1000x90mm',
        price: '4,500,000 so\'m',
        description: 'EURO Model-5 - eng yuqori darajadagi xavfsizlik va dizayn. Premium po\'lat materiallari va ilg\'or texnologiyalar.',
        features: [
          'Premium po\'lat materiallari',
          '6-nuqtali qulflash tizimi',
          'Ultra xavfsizlik',
          'Premium izolyatsiya',
          'Professional montaj'
        ],
        specifications: [
          { label: 'Material', value: 'Premium po\'lat' },
          { label: 'Qalinligi', value: '90mm' },
          { label: 'Qulf', value: '6-nuqtali Ultra' },
          { label: 'Ilgak', value: '6ta mustahkam ilgak' },
          { label: 'Izolyatsiya', value: 'Ultra premium' },
          { label: 'Kafolat', value: '10 yil' }
        ]
      },
      'euro-model6': {
        name: 'EURO Model-6 Luxury Door',
        image: 'https://iili.io/2Xir2Y7.jpg',
        material: 'Metall + Natutal yog\'och',
        security: 'A+ sinf',
        dimensions: '2100x950x85mm',
        price: '5,200,000 so\'m',
        description: 'EURO Model-6 - hashamatli dizayn va natural materiallar. Eng yuqori sifatli yog\'och va metall kombinatsiyasi.',
        features: [
          'Natural yog\'och elementlari',
          'Luxury dizayn',
          '5-nuqtali qulflash tizimi',
          'Hashamatli ko\'rinish',
          'Premium materiallar'
        ],
        specifications: [
          { label: 'Material', value: 'Metall + Natural yog\'och' },
          { label: 'Qalinligi', value: '85mm' },
          { label: 'Qulf', value: '5-nuqtali Luxury' },
          { label: 'Ilgak', value: '5ta mustahkam ilgak' },
          { label: 'Yog\'och', value: 'Premium natural yog\'och' },
          { label: 'Kafolat', value: '8 yil' }
        ]
      },
      'euro-model7': {
        name: 'EURO Model-7 Modern Door',
        image: '/image/model7.jpg',
        material: 'Metall + Kompozit',
        security: 'A+ sinf',
        dimensions: '2000x900x80mm',
        price: '3,800,000 so\'m',
        description: 'EURO Model-7 - zamonaviy kompozit materiallar bilan ishlangan eshik. Yangi texnologiyalar va zamonaviy dizayn.',
        features: [
          'Kompozit materiallar',
          'Zamonaviy dizayn',
          '4-nuqtali qulflash tizimi',
          'Yengil va mustahkam',
          'Zamonaviy texnologiya'
        ],
        specifications: [
          { label: 'Material', value: 'Metall + Kompozit' },
          { label: 'Qalinligi', value: '80mm' },
          { label: 'Qulf', value: '4-nuqtali Modern' },
          { label: 'Ilgak', value: '4ta mustahkam ilgak' },
          { label: 'Kompozit', value: 'Yuqori sifatli' },
          { label: 'Kafolat', value: '6 yil' }
        ]
      },
      'euro-model8': {
        name: 'EURO Model-8 Elite Door',
        image: '/image/model8.jpg',
        material: 'Premium po\'lat + MDF',
        security: 'Ultra Premium',
        dimensions: '2100x1000x90mm',
        price: '6,500,000 so\'m',
        description: 'EURO Model-8 - elite darajadagi xavfsizlik va dizayn. Eng yuqori sifatli materiallar va texnologiyalar.',
        features: [
          'Elite darajadagi xavfsizlik',
          'Premium materiallar',
          '7-nuqtali qulflash tizimi',
          'Ultra premium izolyatsiya',
          'Elite dizayn'
        ],
        specifications: [
          { label: 'Material', value: 'Premium po\'lat + MDF' },
          { label: 'Qalinligi', value: '90mm' },
          { label: 'Qulf', value: '7-nuqtali Elite' },
          { label: 'Ilgak', value: '7ta mustahkam ilgak' },
          { label: 'Izolyatsiya', value: 'Ultra premium' },
          { label: 'Kafolat', value: '12 yil' }
        ]
      },
      'euro-model9': {
        name: 'EURO Model-9 Classic Premium',
        image: '/image/model9.jpg',
        material: 'Metall + Yog\'och + Shisha',
        security: 'A+ sinf',
        dimensions: '2100x950x85mm',
        price: '4,800,000 so\'m',
        description: 'EURO Model-9 - klassik va zamonaviy elementlarni birlashtirgan eshik. Hashamatli dizayn va yuqori xavfsizlik.',
        features: [
          'Klassik va zamonaviy elementlar',
          'Yog\'och va shisha kombinatsiyasi',
          '5-nuqtali qulflash tizimi',
          'Hashamatli ko\'rinish',
          'Premium sifat'
        ],
        specifications: [
          { label: 'Material', value: 'Metall + Yog\'och + Shisha' },
          { label: 'Qalinligi', value: '85mm' },
          { label: 'Qulf', value: '5-nuqtali Premium' },
          { label: 'Ilgak', value: '5ta mustahkam ilgak' },
          { label: 'Shisha', value: 'Temirli shisha' },
          { label: 'Kafolat', value: '7 yil' }
        ]
      },
      'euro-model10': {
        name: 'EURO Model-10 Executive Door',
        image: '/image/model10.jpg',
        material: 'Premium po\'lat + Natural yog\'och',
        security: 'Executive',
        dimensions: '2200x1000x90mm',
        price: '7,500,000 so\'m',
        description: 'EURO Model-10 - ijrochi darajadagi xavfsizlik va hashamat. Eng yuqori sifatli materiallar va texnologiyalar.',
        features: [
          'Ijrochi darajadagi xavfsizlik',
          'Natural yog\'och elementlari',
          '8-nuqtali qulflash tizimi',
          'Ultra premium izolyatsiya',
          'Executive dizayn'
        ],
        specifications: [
          { label: 'Material', value: 'Premium po\'lat + Natural yog\'och' },
          { label: 'Qalinligi', value: '90mm' },
          { label: 'Qulf', value: '8-nuqtali Executive' },
          { label: 'Ilgak', value: '8ta mustahkam ilgak' },
          { label: 'Yog\'och', value: 'Elite natural yog\'och' },
          { label: 'Kafolat', value: '15 yil' }
        ]
      },
      'euro-model11': {
        name: 'EURO Model-11 Ultimate Door',
        image: '/image/model11.jpg',
        material: 'Ultra Premium po\'lat + MDF',
        security: 'Ultimate',
        dimensions: '2200x1000x95mm',
        price: '9,500,000 so\'m',
        description: 'EURO Model-11 - eng yuqori darajadagi xavfsizlik va dizayn. Ultimate texnologiya va premium materiallar.',
        features: [
          'Ultimate xavfsizlik darajasi',
          'Ultra premium materiallar',
          '10-nuqtali qulflash tizimi',
          'Ultimate izolyatsiya',
          'Ultimate dizayn'
        ],
        specifications: [
          { label: 'Material', value: 'Ultra Premium po\'lat + MDF' },
          { label: 'Qalinligi', value: '95mm' },
          { label: 'Qulf', value: '10-nuqtali Ultimate' },
          { label: 'Ilgak', value: '10ta mustahkam ilgak' },
          { label: 'Izolyatsiya', value: 'Ultimate premium' },
          { label: 'Kafolat', value: '20 yil' }
        ]
      }
    };
    
    return products[id] || products['euro-model1'];
  };

  const product = getProductData(productId);

  return (
    <div className="min-h-screen bg-black">
      {/* Back Navigation */}
      <div className="bg-black/60 backdrop-blur-xl border-b border-white/20 shadow-lg">
        <div className="container mx-auto px-4 py-4">
                      <button
              onClick={() => onNavigate('catalog')}
              className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
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
              <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-xl rounded-full p-3 border border-white/30 shadow-lg">
                <ImageWithFallback
                  src={product.image}
                  alt={product.name}
                  className="w-full h-96 object-cover rounded-lg"
                />
              </div>
              
              {/* Technical Drawing */}
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/20">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Ruler className="h-5 w-5 text-white" />
                  Texnik chizma
                </h3>
                <div className="bg-white/5 backdrop-blur-sm rounded-xl aspect-square flex items-center justify-center border-2 border-dashed border-white/30 overflow-hidden shadow-lg">
  <ImageWithFallback
    src="https://iili.io/Kdgszdb.jpg"
    alt="Texnik chizma - O'rtadan kesilgan ko'rinish"
    className="w-full h-full object-cover"
  />
</div>
              </div>
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/20">
                <h1 className="text-3xl font-bold text-white mb-4">
                  {product.name}
                </h1>
                
                <div className="text-2xl font-bold text-white mb-6">
                  {product.price}
                </div>

                <p className="text-gray-300 mb-6 leading-relaxed">
                  {product.description}
                </p>

                {/* Key Features */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-white" />
                    Asosiy xususiyatlar
                  </h3>
                  <ul className="space-y-2">
                    {product.features.map((feature: string, index: number) => (
                      <li key={index} className="flex items-start gap-2 text-gray-300">
                        <div className="w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Order Button */}
                <button className="w-full bg-white/20 backdrop-blur-md text-white py-4 px-6 rounded-xl font-semibold hover:bg-white/30 transition-all duration-300 flex items-center justify-center gap-2 border border-white/30 shadow-lg hover:shadow-xl">
                  <Phone className="h-5 w-5" />
                  Buyurtma berish
                </button>
              </div>

              {/* Specifications */}
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/20">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Award className="h-5 w-5 text-white" />
                  Texnik xususiyatlar
                </h3>
                <div className="space-y-3">
                  {product.specifications.map((spec: any, index: number) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-white/10">
                      <span className="text-gray-300">{spec.label}:</span>
                      <span className="font-medium text-white">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Installation Info */}
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-2xl">
                <h3 className="text-lg font-semibold text-white mb-3">
                  O'rnatish bo'yicha tavsiyalar
                </h3>
                <ul className="space-y-2 text-gray-300">
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