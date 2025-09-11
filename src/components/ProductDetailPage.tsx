import React from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ArrowLeft, Shield, Ruler, Award, Phone } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { useMemo } from 'react';

interface ProductDetailPageProps {
  productId: string;
  onNavigate: (page: string) => void;
}

export default function ProductDetailPage({ productId, onNavigate }: ProductDetailPageProps) {
  const { t } = useLanguage();
  
  // Mock product data - in a real app this would come from an API
  const getProductData = (id: string) => {
   const products: { [key: string]: any } = {
  'euro-model1': {
    name: 'EURO Model-558 Metal Door',
    model: 'Model-558',
    image: 'https://iili.io/KqcGK21.jpg',
    material: 'Metall + MDF',
    security: 'A+ sinf',
    dimensions: '2050x860mm + 2050x960mm + 100mm',
    price: "Narx so'rang",
    description: t('product.modern_design'),
    features: [
      t('product.galvanized_corpus'),
      t('product.inner_mdf_panel'),
      t('product.three_point_lock'),
      t('product.heat_sound_insulation'),
      t('product.uv_resistant_paint')
    ],
    specifications: [
      { label: t('product.material'), value: "Metall + MDF" },
      { label: t('product.thickness'), value: "≈100mm" },
      { label: t('product.lock'), value: "3-nuqtali" },
      { label: t('product.hinges'), value: "4 ta" },
      { label: t('product.insulation'), value: "Mineral paxta" },
      { label: t('product.warranty'), value: "5 yil" }
    ]
  },

  'euro-model2': {
    name: 'EURO Model-556 Metal Door',
    model: 'Model-556',
    image: 'https://iili.io/KqcGqkg.jpg',
    material: 'Metall + MDF + Oyna',
    security: 'A+ sinf',
    dimensions: '2050x860mm + 2050x960mm + 100mm',
    price: "Narx so'rang",
    description: t('product.metal_mdf_decor'),
    features: [
      t('product.mdf_glass_decor_panels'),
      t('product.three_point_lock'),
      t('product.improved_insulation'),
      t('product.scratch_resistant_coating'),
      t('product.professional_installation_option')
    ],
    specifications: [
      { label: t('product.material'), value: "Metall + MDF + Oyna" },
      { label: t('product.thickness'), value: "≈100mm" },
      { label: t('product.lock'), value: "3-nuqtali" },
      { label: t('product.glass'), value: t('product.tempered_glass') },
      { label: t('product.insulation'), value: "Mineral paxta" },
      { label: t('product.warranty'), value: "5 yil" }
    ]
  },

  'euro-model3': {
    name: 'EURO Model-555 Metal Door',
    model: 'Model-555',
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
    model: 'Model-557',
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
    model: 'Model-516',
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
    model: 'Model-513',
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
    model: 'Model-588',
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
    model: 'Model-514',
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
    model: 'Model-111',
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
    model: 'Model-512',
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
    model: 'Model-599',
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
    model: 'Model-511',
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
    model: 'Model-112',
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
    model: 'Model-515',
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
    model: 'Model-517',
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
    model: 'Model-518',
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
    model: 'Model-519',
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

  const product = useMemo(() => getProductData(productId), [productId, t]);

   return (
    <div className="relative min-h-screen">
      {/* ===== Simple CSS without animations ===== */}
      <style>{`
        /* Simple styles without animations for better performance */
        .simple-button {
          transition: background-color 0.2s ease;
        }
        .simple-button:hover {
          background-color: rgba(255, 255, 255, 0.1);
        }
      `}</style>

      {/* Fixed background — rasmga blur beramiz */}
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-cover bg-center blur-[2px]"
        style={{ backgroundImage: "url('https://iili.io/KqAQo3g.jpg')" }}
      />

      {/* Back Navigation (sekinsiz emas, lekin ozgina yumshoq anim beramiz) */}
      <div className="bg-none backdrop-blur border-b border-none shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={() => onNavigate('catalog')}
            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('product.back_to_catalog')}
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
                className="bg-white/0 backdrop-blur-sm rounded-2xl p-3 border border-white/0 shadow-lg aspect-square flex items-center justify-center"
              >
                <ImageWithFallback
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>

              {/* Technical Drawing */}
              <div
                className="bg-white/0 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-white/0"
              >
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Ruler className="h-5 w-5 text-white" />
                  {t('product.technical_drawing')}
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
                className="bg-white/0 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-white/0"
              >
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
                    {t('product.key_features')}
                  </h3>
                  <ul className="space-y-2">
                    {product.features.map((feature: string, index: number) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-gray-300"
                      >
                        <div className="w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

              </div>

              {/* Specifications */}
              <div
                className="bg-white/0 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-white/0"
              >
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Award className="h-5 w-5 text-white" />
                  {t('product.technical_specs')}
                </h3>
                <div className="space-y-3">
                  {product.specifications.map((spec: any, index: number) => (
                    <div
                      key={index}
                      className="flex justify-between items-center py-2 border-b border-white/10"
                    >
                      <span className="text-gray-300">{spec.label}:</span>
                      <span className="font-medium text-white">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Installation Info */}
              <div
                className="bg-white/0 backdrop-blur-sm rounded-2xl p-6 border border-white/0 shadow-2xl"
              >
                <h3 className="text-lg font-semibold text-white mb-3">
                  {t('product.installation_tips')}
                </h3>
                <ul className="space-y-2 text-gray-300">
                  {[
                    t('product.professional_installation'),
                    t('product.installation_time'),
                    t('product.all_equipment'),
                    t('product.installation_warranty'),
                  ].map((tip, i) => (
                    <li
                      key={i}
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

      {/* Order Button - Suv akvarium effektli past panel (safe-area bilan) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 px-0 pt-0 pb-0" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="w-full">
          <button
            onClick={() => {
              // Product ma'lumotini localStorage ga saqlash
              localStorage.setItem('selectedProduct', JSON.stringify({
                id: productId,
                name: product.name,
                material: product.material,
                security: product.security,
                dimensions: product.dimensions,
                price: product.price
              }));
              // Contact page ga o'tish
              onNavigate('contact');
              window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
            }}
            className="w-full bg-white/20 text-white py-5 px-6 rounded-none font-semibold simple-button flex items-center justify-center gap-3 border-t border-white/10 shadow-2xl"
          >
            {/* Button content */}
            <div className="flex items-center gap-3">
              <Phone className="h-6 w-6" />
              <span className="text-lg font-bold">
                Ushbu {product.model} ga buyurtma berish
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );

}