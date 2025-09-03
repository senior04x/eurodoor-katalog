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
    name: 'EURO Model-558 Metal Door',
    image: 'https://iili.io/KqcGK21.jpg',
    material: 'Metall + MDF',
    security: 'A+ sinf',
    dimensions: '2050x860mm + 2050x960mm + 100mm',
    price: "Narx so'rang",
    description: "Zamonaviy dizaynli metall eshik, ichki qismi yuqori sifatli MDF qoplama bilan.",
    features: [
      "Galvanizatsiyalangan metall korpus",
      "Ichki MDF panel",
      "3-nuqtali qulflash tizimi",
      "Issiqlik va shovqin izolyatsiyasi",
      "UVga chidamli bo'yoq"
    ],
    specifications: [
      { label: "Material", value: "Metall + MDF" },
      { label: "Qalinlik", value: "≈100mm" },
      { label: "Qulf", value: "3-nuqtali" },
      { label: "Ilgaklar", value: "4 ta" },
      { label: "Izolyatsiya", value: "Mineral paxta" },
      { label: "Kafolat", value: "5 yil" }
    ]
  },

  'euro-model2': {
    name: 'EURO Model-556 Metal Door',
    image: 'https://iili.io/KqcGqkg.jpg',
    material: 'Metall + MDF + Oyna',
    security: 'A+ sinf',
    dimensions: '2050x860mm + 2050x960mm + 100mm',
    price: "Narx so'rang",
    description: "Metall korpus, MDF va oyna dekor bilan uyg‘unlashgan model.",
    features: [
      "MDF + oyna dekor panellari",
      "3-nuqtali qulflash",
      "Yaxshilangan izolyatsiya",
      "Chizilishga chidamli qoplama",
      "Professional montaj imkoniyati"
    ],
    specifications: [
      { label: "Material", value: "Metall + MDF + Oyna" },
      { label: "Qalinlik", value: "≈100mm" },
      { label: "Qulf", value: "3-nuqtali" },
      { label: "Shisha", value: "Temirlangan (tempered)" },
      { label: "Izolyatsiya", value: "Mineral paxta" },
      { label: "Kafolat", value: "5 yil" }
    ]
  },

  'euro-model3': {
    name: 'EURO Model-555 Metal Door',
    image: 'https://iili.io/KqcGBpa.jpg',
    material: 'Metall + MDF + Oyna',
    security: 'A sinf',
    dimensions: '2050x860mm + 2050x960mm + 100mm',
    price: "Narx so'rang",
    description: "Klassik uslubdagi metall eshik, oyna elementlari bilan bezatilgan.",
    features: [
      "Klassik panelli dizayn",
      "Oyna dekor",
      "3-nuqtali qulflash",
      "Yorug'lik tushirish imkoniyati",
      "Estetik ko‘rinish"
    ],
    specifications: [
      { label: "Material", value: "Metall + MDF + Oyna" },
      { label: "Qalinlik", value: "≈100mm" },
      { label: "Qulf", value: "3-nuqtali" },
      { label: "Shisha", value: "Temirlangan" },
      { label: "Kafolat", value: "5 yil" }
    ]
  },

  'euro-model4': {
    name: 'EURO Model-557 Metal Door',
    image: 'https://iili.io/KqcGnTJ.jpg',
    material: 'Metall + MDF',
    security: 'A+ sinf',
    dimensions: '2050x860mm + 2050x960mm + 100mm',
    price: "Narx so'rang",
    description: "Designer uslubidagi eshik, MDF dekor elementlari bilan.",
    features: [
      "Yuqori mustahkam metall plita",
      "MDF dekor panellari",
      "3-nuqtali qulflash",
      "Issiqlik va tovush izolyatsiyasi",
      "Korroziv muhitga chidamli qoplama"
    ],
    specifications: [
      { label: "Material", value: "Metall + MDF" },
      { label: "Qalinlik", value: "≈100mm" },
      { label: "Qulf", value: "3-nuqtali" },
      { label: "Ilgaklar", value: "4 ta" },
      { label: "Kafolat", value: "5 yil" }
    ]
  },

  'euro-model5': {
    name: 'EURO Model-516 Metal Door',
    image: 'https://iili.io/KqcGu4I.jpg',
    material: 'Metall + MDF',
    security: 'A+ sinf',
    dimensions: '2050x860mm + 90mm',
    price: "Narx so'rang",
    description: "Eng yuqori darajadagi xavfsizlik va dizayn uyg‘unligi.",
    features: [
      "Qalin metall qatlam",
      "MDF ichki qoplama",
      "3–4 nuqtali qulflash tizimi",
      "Tovushni yutuvchi qatlam",
      "Katta o‘lcham varianti"
    ],
    specifications: [
      { label: "Material", value: "Metall + MDF" },
      { label: "Qalinlik", value: "≈90–100mm" },
      { label: "Qulf", value: "3–4 nuqtali" },
      { label: "Izolyatsiya", value: "Mineral paxta/PU to'ldiruvchi" },
      { label: "Kafolat", value: "5 yil" }
    ]
  },

  'euro-model6': {
    name: 'EURO Model-020 MDF Door',
    image: 'https://iili.io/KqcGR2t.jpg',
    material: 'MDF + MDF',
    security: 'Premium',
    dimensions: '2300x860mm',
    price: "Narx so'rang",
    description: "Hashamatli dizayn va MDF materiallar, elektron quluf bilan mos.",
    features: [
      "Premium MDF yuzalar",
      "Elektron quluf o‘rnatish imkoniyati",
      "Tovush va issiqlik izolyatsiyasi",
      "Silliq laklangan qoplama",
      "Yuqori balandlik (2300mm)"
    ],
    specifications: [
      { label: "Material", value: "MDF + MDF" },
      { label: "Bal. x En", value: "2300x860mm" },
      { label: "Qulf", value: "Elektron/3-nuqtali (variant)" },
      { label: "Kafolat", value: "5 yil" }
    ]
  },

  'euro-model7': {
    name: 'EURO Model-513 Metal Door',
    image: 'https://iili.io/KqcG5YX.jpg',
    material: 'Metall + MDF + Oyna',
    security: 'A+ sinf',
    dimensions: '2050x860mm + 2050x960mm + 90mm',
    price: "Narx so'rang",
    description: "Zamonaviy kompozit yechim: metall, MDF va oyna uyg‘unligi.",
    features: [
      "Oyna dekor bilan zamonaviy ko‘rinish",
      "3–4 nuqtali qulflash tizimi",
      "Yaxshi izolyatsiya",
      "Chidamli tashqi qoplama",
      "Ko‘p o‘lcham varianti"
    ],
    specifications: [
      { label: "Material", value: "Metall + MDF + Oyna" },
      { label: "Qalinlik", value: "≈90mm" },
      { label: "Qulf", value: "3–4 nuqtali" },
      { label: "Shisha", value: "Temirlangan" },
      { label: "Kafolat", value: "5 yil" }
    ]
  },

  'euro-model8': {
    name: 'EURO Model-588 Metal Door',
    image: 'https://iili.io/KqcG7vn.jpg',
    material: 'Metall + MDF',
    security: 'A+ sinf',
    dimensions: '2050x860mm + 2050x960mm + 80mm',
    price: "Narx so'rang",
    description: "Elite darajadagi xavfsizlik va dizayn, ixcham qalinlik bilan.",
    features: [
      "Metall ramka va MDF panel",
      "3-nuqtali qulflash",
      "Yengil, lekin mustahkam tuzilma",
      "Estetik tashqi ko‘rinish",
      "UVga chidamli qoplama"
    ],
    specifications: [
      { label: "Material", value: "Metall + MDF" },
      { label: "Qalinlik", value: "≈80mm" },
      { label: "Qulf", value: "3-nuqtali" },
      { label: "Kafolat", value: "5 yil" }
    ]
  },

  'euro-model9': {
    name: 'EURO Model-514 Metal Door',
    image: 'https://iili.io/KqcGljf.jpg',
    material: 'Metall + MDF',
    security: 'A+ sinf',
    dimensions: '2050x860mm + 2050x960mm + 90mm',
    price: "Narx so'rang",
    description: "Klassik va zamonaviy elementlar uyg‘unlashgan model.",
    features: [
      "Klassik panel kompozitsiyasi",
      "3–4 nuqtali qulflash",
      "Tovush/issiqlik izolyatsiyasi",
      "Chidamli bo‘yoq",
      "O‘lcham varianti mavjud"
    ],
    specifications: [
      { label: "Material", value: "Metall + MDF" },
      { label: "Qalinlik", value: "≈90mm" },
      { label: "Qulf", value: "3–4 nuqtali" },
      { label: "Kafolat", value: "5 yil" }
    ]
  },

  'euro-model10': {
    name: 'EURO Model-111 Metal Door',
    image: 'https://iili.io/KqcGECl.jpg',
    material: 'Metall + MDF',
    security: 'A+ sinf',
    dimensions: '2050x860mm + 2050x960mm + 90mm',
    price: "Narx so'rang",
    description: "Ijrochi darajadagi ko‘rinish va yuqori xavfsizlik.",
    features: [
      "Qalin metall plita",
      "MDF bezak panellari",
      "4 nuqtali qulflash",
      "Premium izolyatsiya",
      "Korrozivga chidamli qoplama"
    ],
    specifications: [
      { label: "Material", value: "Metall + MDF" },
      { label: "Qalinlik", value: "≈90mm" },
      { label: "Qulf", value: "4-nuqtali" },
      { label: "Kafolat", value: "6 yil" }
    ]
  },

  'euro-model11': {
    name: 'EURO Model-512 Metal Door',
    image: 'https://iili.io/KqcGM4S.jpg',
    material: 'Metall + MDF',
    security: 'A+ sinf',
    dimensions: '2050x860mm + 2050x960mm + 90mm',
    price: "Narx so'rang",
    description: "Mustahkamlik va dizayn uyg‘unligi, ko‘p nuqtali qulflash bilan.",
    features: [
      "Metall+MDF kombinatsiyasi",
      "4 nuqtali qulflash",
      "Issiqlik/tovush yalıtımı",
      "Qoplama rangi variantlari",
      "O‘lcham varianti"
    ],
    specifications: [
      { label: "Material", value: "Metall + MDF" },
      { label: "Qalinlik", value: "≈90mm" },
      { label: "Qulf", value: "4-nuqtali" },
      { label: "Kafolat", value: "6 yil" }
    ]
  },

  'euro-model12': {
    name: 'EURO Model-599 Metal Door',
    image: 'https://iili.io/KqcGW37.jpg',
    material: 'Metall + MDF',
    security: 'A+ sinf',
    dimensions: '2050x860mm + 2050x960mm + 80mm',
    price: "Narx so'rang",
    description: "Yuqori xavfsizlik va ixcham qalinlikdagi model.",
    features: [
      "Yengil konstruktsiya",
      "3-nuqtali qulflash",
      "Sifatli izolyatsiya",
      "Silliq qoplama",
      "Oson parvarish"
    ],
    specifications: [
      { label: "Material", value: "Metall + MDF" },
      { label: "Qalinlik", value: "≈80mm" },
      { label: "Qulf", value: "3-nuqtali" },
      { label: "Kafolat", value: "5 yil" }
    ]
  },

  'euro-model13': {
    name: 'EURO Model-511 Metal Door',
    image: 'https://iili.io/KqcGhve.jpg',
    material: 'Metall + MDF + Oyna',
    security: 'A+ sinf',
    dimensions: '2050x860mm + 2050x960mm + 90mm',
    price: "Narx so'rang",
    description: "Oyna elementlari bilan zamonaviy ko‘rinishga ega metall eshik.",
    features: [
      "Oyna dekor",
      "4 nuqtali qulflash",
      "Tovush/issiqlik yalıtımı",
      "Chidamli tashqi qatlam",
      "O‘lchamlar tanlovi"
    ],
    specifications: [
      { label: "Material", value: "Metall + MDF + Oyna" },
      { label: "Qalinlik", value: "≈90mm" },
      { label: "Qulf", value: "4-nuqtali" },
      { label: "Shisha", value: "Temirlangan" },
      { label: "Kafolat", value: "6 yil" }
    ]
  },

  'euro-model14': {
    name: 'EURO Model-112 Metal Door',
    image: 'https://iili.io/KqcGjyu.jpg',
    material: 'Metall + MDF',
    security: 'A+ sinf',
    dimensions: '2050x860mm + 2050x960mm + 90mm',
    price: "Narx so'rang",
    description: "Kuchli ramka va MDF bezak bilan ishonchli model.",
    features: [
      "Metall ramka",
      "MDF panel",
      "4 nuqtali qulflash",
      "Yuqori chidamlilik",
      "Estetik dizayn"
    ],
    specifications: [
      { label: "Material", value: "Metall + MDF" },
      { label: "Qalinlik", value: "≈90mm" },
      { label: "Qulf", value: "4-nuqtali" },
      { label: "Kafolat", value: "6 yil" }
    ]
  },

  'euro-model15': {
    name: 'EURO Model-710 MDF Door',
    image: 'https://iili.io/KqcGNTb.jpg',
    material: 'MDF + MDF',
    security: 'B+ sinf',
    dimensions: '2050x860mm + 2050x960mm',
    price: "Narx so'rang",
    description: "MDF materialidan tayyorlangan, uy ichki eshiklari uchun qulay tanlov.",
    features: [
      "Yengil va silliq yuzalar",
      "Ichki makon uchun ideal",
      "Sokin yopilish imkoniyati",
      "Rang/lak variantlari",
      "O‘lchamlar varianti"
    ],
    specifications: [
      { label: "Material", value: "MDF + MDF" },
      { label: "O'lchamlar", value: "2050x860/960mm" },
      { label: "Qulf", value: "Standart ichki eshik qulfi" },
      { label: "Kafolat", value: "3 yil" }
    ]
  },

  'euro-model16': {
    name: 'EURO Model-601 MDF Door',
    image: 'https://iili.io/KqcGOjj.jpg',
    material: 'MDF + MDF',
    security: 'B+ sinf',
    dimensions: '2050x860mm',
    price: "Narx so'rang",
    description: "Minimalistik MDF eshik, ichki xonalar uchun.",
    features: [
      "Minimal dizayn",
      "Yengil vazn",
      "Silliq qoplama",
      "Oson tozalash",
      "Ichki sifat standartlari"
    ],
    specifications: [
      { label: "Material", value: "MDF + MDF" },
      { label: "O'lcham", value: "2050x860mm" },
      { label: "Qulf", value: "Standart ichki" },
      { label: "Kafolat", value: "3 yil" }
    ]
  },

  'euro-model17': {
    name: 'EURO Model-600 MDF Door',
    image: 'https://iili.io/KqcGS6B.jpg',
    material: 'MDF + MDF',
    security: 'B+ sinf',
    dimensions: '2050x860mm',
    price: "Narx so'rang",
    description: "MDF dan tayyorlangan amaliy va byudjetga mos eshik.",
    features: [
      "Byudjet dostona",
      "Silliq MDF panellar",
      "Rang/lak variantlari",
      "Ichki foydalanish uchun",
      "Oson montaj"
    ],
    specifications: [
      { label: "Material", value: "MDF + MDF" },
      { label: "O'lcham", value: "2050x860mm" },
      { label: "Qulf", value: "Standart ichki" },
      { label: "Kafolat", value: "3 yil" }
    ]
  },

  'euro-model18': {
    name: 'EURO Model-515 Metal Door',
    image: 'https://iili.io/KqM7TKB.png',
    material: 'Metall + Metall',
    security: 'A+ sinf',
    dimensions: '2050x860mm + 2050x960mm + 90mm',
    price: "Narx so'rang",
    description: "100% metall konstruksiya: maksimal xavfsizlik va barqarorlik.",
    features: [
      "Ikki tomonlama metall qatlam",
      "4–5 nuqtali qulflash",
      "O‘ta yuqori mustahkamlik",
      "Yaxshi izolyatsiya",
      "Tashqi muhitga chidamli qoplama"
    ],
    specifications: [
      { label: "Material", value: "Metall + Metall" },
      { label: "Qalinlik", value: "≈90mm" },
      { label: "Qulf", value: "4–5 nuqtali" },
      { label: "Ilgaklar", value: "6 ta" },
      { label: "Kafolat", value: "7 yil" }
    ]
  },

  'euro-model19': {
    name: 'EURO Model-517 Metal Door',
    image: 'https://iili.io/KqM7oox.png',
    material: 'Metall + MDF',
    security: 'A+ sinf',
    dimensions: '2050x860mm + 90mm',
    price: "Narx so'rang",
    description: "Metall ramka va MDF ichki qoplama bilan ishonchli model.",
    features: [
      "Metall ramka",
      "MDF ichki panel",
      "3–4 nuqtali qulflash",
      "Izolyatsiya qatlamlari",
      "Zamonaviy tashqi ko‘rinish"
    ],
    specifications: [
      { label: "Material", value: "Metall + MDF" },
      { label: "Qalinlik", value: "≈90mm" },
      { label: "Qulf", value: "3–4 nuqtali" },
      { label: "Kafolat", value: "5 yil" }
    ]
  },

  'euro-model20': {
    name: 'EURO Model-518 Metal Door',
    image: 'https://iili.io/KqM7f9e.png',
    material: 'Metall + MDF',
    security: 'A+ sinf',
    dimensions: '2050x860mm + 90mm',
    price: "Narx so'rang",
    description: "Yuqori darajadagi xavfsizlikka ega metall + MDF kombinatsiyasi.",
    features: [
      "Mustahkam metall plita",
      "MDF bezak paneli",
      "3–4 nuqtali qulflash",
      "Tovush/issiqlik yalıtımı",
      "Uzoq xizmat muddati"
    ],
    specifications: [
      { label: "Material", value: "Metall + MDF" },
      { label: "Qalinlik", value: "≈90mm" },
      { label: "Qulf", value: "3–4 nuqtali" },
      { label: "Kafolat", value: "5 yil" }
    ]
  },

  'euro-model21': {
    name: 'EURO Model-519 Metal Door',
    image: 'https://iili.io/KqM7zPV.png',
    material: 'Metall + MDF',
    security: 'A+ sinf',
    dimensions: '2050x860mm + 90mm',
    price: "Narx so'rang",
    description: "Metall va MDF uyg‘unligidagi funksional va nafis eshik.",
    features: [
      "3–4 nuqtali qulflash tizimi",
      "Chidamli tashqi qoplama",
      "Yaxshi izolyatsiya",
      "Zamonaviy ko‘rinish",
      "Oson parvarish"
    ],
    specifications: [
      { label: "Material", value: "Metall + MDF" },
      { label: "Qalinlik", value: "≈90mm" },
      { label: "Qulf", value: "3–4 nuqtali" },
      { label: "Kafolat", value: "5 yil" }
    ]
  }
};

    
    return products[id] || products['euro-model1'];
  };

  const product = getProductData(productId);

   return (
    <div className="relative min-h-screen">
      {/* ===== Local CSS: sekin animatsiyalar + stagger ===== */}
      <style>{`
        @keyframes fadeSlideUpSlow {
          0% { opacity: 0; transform: translateY(18px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .anim-base {
          animation: fadeSlideUpSlow 0.55s ease-out both;
        }
        .anim-slower {
          animation: fadeSlideUpSlow 0.7s ease-out both;
        }
        .anim-card {
          animation: fadeSlideUpSlow 0.6s ease-out both;
        }
        .anim-stagger {
          animation: fadeSlideUpSlow 0.5s ease-out both;
        }
        /* Reduced motion foydalanuvchilar uchun animatsiyalarni o‘chirib qo‘yamiz */
        @media (prefers-reduced-motion: reduce) {
          .anim-base,
          .anim-slower,
          .anim-card,
          .anim-stagger {
            animation: none !important;
          }
        }
      `}</style>

      {/* Fixed background — rasmga blur beramiz */}
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-cover bg-center blur-[2px]"
        style={{ backgroundImage: "url('https://iili.io/KqAQo3g.jpg')" }}
      />

      {/* Back Navigation (sekinsiz emas, lekin ozgina yumshoq anim beramiz) */}
      <div className="bg-none backdrop-blur border-b border-none shadow-lg anim-base" style={{ animationDelay: '40ms' }}>
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
            {/* ========== Chap: rasmlar ========== */}
            <div className="space-y-4">
              {/* Product Image */}
              <div
                className="bg-white/0 backdrop-blur-sm rounded-2xl p-3 border border-white/0 shadow-lg aspect-square flex items-center justify-center anim-slower"
                style={{ animationDelay: '100ms' }}
              >
                <ImageWithFallback
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>

              {/* Technical Drawing */}
              <div
                className="bg-white/0 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-white/0 anim-base"
                style={{ animationDelay: '160ms' }}
              >
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Ruler className="h-5 w-5 text-white" />
                  Texnik chizma
                </h3>
                <div className="bg-white/0 backdrop-blur-sm rounded-xl aspect-square flex items-center justify-center border-2 border-dashed border-white/0 overflow-hidden shadow-lg">
                  <ImageWithFallback
                    src="https://iili.io/Kdgszdb.jpg"
                    alt="Texnik chizma - O'rtadan kesilgan ko'rinish"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* ========== O'ng: detallar ========== */}
            <div className="space-y-6">
              {/* Product Details */}
              <div
                className="bg-white/0 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-white/0 anim-base"
                style={{ animationDelay: '120ms' }}
              >
                <h1 className="text-3xl font-bold text-white mb-4">
                  {product.name}
                </h1>

                <div className="text-2xl font-bold text-white mb-6 anim-stagger" style={{ animationDelay: '180ms' }}>
                  {product.price}
                </div>

                <p className="text-gray-300 mb-6 leading-relaxed anim-stagger" style={{ animationDelay: '220ms' }}>
                  {product.description}
                </p>

                {/* Key Features */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2 anim-stagger" style={{ animationDelay: '240ms' }}>
                    <Shield className="h-5 w-5 text-white" />
                    Asosiy xususiyatlar
                  </h3>
                  <ul className="space-y-2">
                    {product.features.map((feature: string, index: number) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-gray-300 anim-stagger"
                        style={{ animationDelay: `${260 + index * 60}ms` }} // ketma-ket sekin
                      >
                        <div className="w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Order Button (agar kerak bo'lsa) */}
                {/* <button className="w-full bg-white/0 backdrop-blur-sm text-white py-4 px-6 rounded-xl font-semibold hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-2 border border-white/30 shadow-lg hover:shadow-xl">
                  <Phone className="h-5 w-5" />
                  Buyurtma berish
                </button> */}
              </div>

              {/* Specifications */}
              <div
                className="bg-white/0 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-white/0 anim-base"
                style={{ animationDelay: '180ms' }}
              >
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2 anim-stagger" style={{ animationDelay: '220ms' }}>
                  <Award className="h-5 w-5 text-white" />
                  Texnik xususiyatlar
                </h3>
                <div className="space-y-3">
                  {product.specifications.map((spec: any, index: number) => (
                    <div
                      key={index}
                      className="flex justify-between items-center py-2 border-b border-white/10 anim-stagger"
                      style={{ animationDelay: `${240 + index * 60}ms` }} // ketma-ket
                    >
                      <span className="text-gray-300">{spec.label}:</span>
                      <span className="font-medium text-white">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Installation Info */}
              <div
                className="bg-white/0 backdrop-blur-sm rounded-2xl p-6 border border-white/0 shadow-2xl anim-base"
                style={{ animationDelay: '220ms' }}
              >
                <h3 className="text-lg font-semibold text-white mb-3 anim-stagger" style={{ animationDelay: '260ms' }}>
                  O'rnatish bo'yicha tavsiyalar
                </h3>
                <ul className="space-y-2 text-gray-300">
                  {[
                    "• Professional o'rnatish xizmati mavjud",
                    '• O\'rnatish 2-3 soat davom etadi',
                    "• Barcha kerakli jihozlar ta'minlanadi",
                    "• 1 yillik o'rnatish kafolati",
                  ].map((tip, i) => (
                    <li
                      key={i}
                      className="anim-stagger"
                      style={{ animationDelay: `${280 + i * 60}ms` }}
                    >
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            {/* ========== /O'ng ========== */}
          </div>
        </div>
      </div>
    </div>
  );

}