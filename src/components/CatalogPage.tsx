import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Eye, Layers, Package } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { useLanguage } from '../hooks/useLanguage';
import { productsApi } from '../lib/productsApi';

interface CatalogPageProps {
  onNavigate: (page: string, productId?: string) => void;
}

interface DoorProduct {
  id: string;
  name: string;
  image: string;
  material: string;
  security: string;
  dimensions: string; // "2000x900mm"
  description: string;
}

type GroupMode = 'material' | 'size';

export default function CatalogPage({ onNavigate }: CatalogPageProps) {
  const { t } = useLanguage();
  
  // Faqat Supabase dan mahsulotlarni olish
  const [doors, setDoors] = useState<DoorProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const products = await productsApi.getAllProducts();
        const convertedProducts: DoorProduct[] = products.map((product: any) => ({
          id: product.id,
          name: product.name,
          image: product.image,
          material: product.material,
          security: product.security,
          dimensions: product.dimensions,
          description: product.description
        }));
        setDoors(convertedProducts);
      } catch (error) {
        console.error('Error loading products:', error);
        setDoors([]);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // --- Helperlar ---
  // sinonimlarni yagona formatga o‘tkazamiz:
  // temir -> metall, po'lat -> metall, yog'och/yogoch -> mdf, shisha -> oyna
// sinonimlarni bir xil ko‘rinishga keltirish
const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/’/g, "'")
    .replace(/temir/g, 'metall')
    .replace(/po'lat/g, 'metall')
    .replace(/yog'och|yogoch/g, 'mdf')
    .replace(/shisha/g, 'oyna');

const getMaterialKey = (m: string, t: any) => {
  const x = norm(m);
  const hasMetall = x.includes('metall');
  const hasMdf = x.includes('mdf');
  const hasOyna = x.includes('oyna');
  const hasKompozit = x.includes('kompozit');
  const hasNatural = x.includes('natural');

  // 1) Avval uchlik kombinatsiya
  if (hasMetall && hasMdf && hasOyna) return t('catalog.material_metall_mdf_oyna');

  // 2) Keyin qolganlari
  if (hasMetall && hasMdf) return t('catalog.material_metall_mdf');
  if (hasMdf && !hasMetall) return t('catalog.material_mdf_mdf');
  if (hasMetall && !hasMdf && !hasOyna && !hasKompozit && !hasNatural) return t('catalog.material_metall_metall');
  if (hasMetall && hasOyna) return t('catalog.material_metall_mdf_oyna');
  if (hasMetall && hasKompozit) return t('catalog.material_metall_kompozit');

  return t('catalog.material_other');
};


  const parseHeight = (d: string) => {
    const m = d.match(/(\d+)\s*x\s*\d+/i);
    return m ? parseInt(m[1], 10) : NaN;
  };

  const getSizeKey = (d: string, t: any) => {
    const h = parseHeight(d);
    if (isNaN(h)) return t('catalog.size_other');
    if (h <= 2000) return t('catalog.size_2050_series');
    if (h <= 2100) return t('catalog.size_2050_series');
    return t('catalog.size_2300_series');
  };

  const [mode, setMode] = useState<GroupMode>('material');
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  // Ref: har bo‘lim uchun (scrollga)
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Animatsiya uchun: foydalanuvchi "reduced motion" yoqganmi?
  const prefersReduced = useReducedMotion();

  // Guruhlash
  const grouped = useMemo(() => {
    const map = new Map<string, DoorProduct[]>();
    for (const d of doors) {
      const key = mode === 'material' ? getMaterialKey(d.material, t) : getSizeKey(d.dimensions, t);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(d);
    }

    const order =
      mode === 'material'
        ? [t('catalog.material_metall_mdf'), t('catalog.material_mdf_mdf'), t('catalog.material_metall_metall'), t('catalog.material_metall_mdf_oyna'), t('catalog.material_metall_kompozit'), t('catalog.material_other')]
        : [t('catalog.size_2050_series'), t('catalog.size_2300_series'), t('catalog.size_2100_series'), t('catalog.size_other')];

    return Array.from(map.entries()).sort((a, b) => {
      const ai = order.indexOf(a[0]);
      const bi = order.indexOf(b[0]);
      return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
    });
  }, [doors, mode]);

  // Yangi bo‘lim ochilganda shu bo‘lim tepaga kelsin
  useEffect(() => {
    if (openKey && sectionRefs.current[openKey]) {
      sectionRefs.current[openKey]!.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [openKey]);

  // ---- ANIMATSIYA VARIANTLAR ----
  const containerVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: prefersReduced ? 0 : 0.2,
      },
    },
  };

  const sectionHeaderVariants = {
    hidden: { opacity: 0, y: 40 },
    show: {
      opacity: 1,
      y: 0,
      transition: prefersReduced
        ? { duration: 0 }
        : { type: 'spring', stiffness: 600, damping: 28, mass: 0.5 },
    },
  };

  const cardsContainerVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: prefersReduced ? 0 : 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 36, scale: 0.98 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: prefersReduced
        ? { duration: 0 }
        : { type: 'spring', stiffness: 550, damping: 26, mass: 0.6 },
    },
    exit: { opacity: 0, y: 10, scale: 0.98, transition: { duration: 0.15 } },
  };

  return (
    <div className="relative min-h-screen">
      {/* Fixed background */}
      <div
        className="fixed inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('https://iili.io/KqAQo3g.jpg')" }}
      />
      <div className="fixed inset-0 bg-black/30" />

      {/* Header */}
      <section className="bg-none backdrop-blur-xl py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">{t('catalog.title')}</h1>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              {t('catalog.description')}
            </p>

            {/* Rejim tanlash */}
            <div className="mt-6 inline-flex rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl overflow-hidden">
              <button
                type="button"
                onClick={() => { setMode('material'); setOpenKey(null); }}
                className={`px-4 py-2 text-sm font-semibold transition-colors border-b-2 border-transparent pb-1 ${
                  mode === 'material' ? 'bg-white/25 text-white' : 'text-gray-200 hover:bg-white/10'
                }`}
              >
                {t('catalog.group_by_material')}
              </button>
              <button
                type="button"
                onClick={() => { setMode('size'); setOpenKey(null); }}
                className={`px-4 py-2 text-sm font-semibold transition-colors border-b-2 border-transparent pb-1 ${
                  mode === 'size' ? 'bg-white/25 text-white' : 'text-gray-200 hover:bg-white/10'
                }`}
              >
                {t('catalog.group_by_size')}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Accordion Bo'limlar */}
      <section className="py-12">
        <motion.div
          className="container mx-auto px-4 space-y-6"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {/* Mahsulotlar yo'q bo'lganda */}
          {doors.length === 0 ? (
            <motion.div
              variants={sectionHeaderVariants}
              className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl overflow-hidden"
            >
              <div className="text-center py-16 px-6">
                <div className="mb-6">
                  <div className="mx-auto w-20 h-20 bg-white/20 border border-white/30 rounded-full flex items-center justify-center mb-4">
                    <Package className="h-10 w-10 text-white/60" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Mahsulotlar hali qo'shilmagan
                  </h3>
                  <p className="text-gray-300 text-lg max-w-md mx-auto">
                    Admin panel orqali yangi mahsulotlar qo'shing va ular bu yerda ko'rinadi
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => window.open('/admin', '_blank')}
                    className="bg-blue-500/20 text-blue-300 px-6 py-3 rounded-lg font-semibold hover:bg-blue-500/30 transition-colors border border-blue-500/30"
                  >
                    Admin Panel ga o'tish
                  </button>
                  <button
                    onClick={() => window.location.reload()}
                    className="bg-white/20 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/30 transition-colors border border-white/30"
                  >
                    Sahifani yangilash
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            grouped.map(([key, list]) => {
            const isOpen = openKey === key;
            return (
              <motion.div
                key={key}
                ref={(el) => { sectionRefs.current[key] = el; }}
                variants={sectionHeaderVariants}
                className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl overflow-hidden"
              >
                {/* Sarlavha */}
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpenKey(isOpen ? null : key)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 border border-white/30 rounded-full p-2">
                      <Layers className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <div className="text-white font-semibold">{key}</div>
                      <div className="text-xs text-gray-300">{list.length} ta model</div>
                    </div>
                  </div>
                  <svg
                    className={`h-5 w-5 text-white transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Kontent */}
                {isOpen && (
                  <motion.div
                    className="px-6 pb-6"
                    variants={cardsContainerVariants}
                    initial="hidden"
                    animate="show"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {list.map((door) => (
                        <motion.div
                          key={door.id}
                          variants={cardVariants}
                          className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden border border-white/20"
                        >
                          <div className="relative aspect-square overflow-hidden">
                            <img
                              src={door.image}
                              alt={door.name}
                              loading="lazy"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="p-5">
                            <h3 className="text-lg font-semibold text-white mb-2">{door.name}</h3>
                            <div className="space-y-1 mb-3 text-sm text-gray-300">
                              <div><span className="font-medium">{t('catalog.material')}:</span> {door.material}</div>
                              <div><span className="font-medium">{t('catalog.security')}:</span> {door.security}</div>
                              <div><span className="font-medium">{t('catalog.dimensions')}:</span> {door.dimensions}</div>
                            </div>
                            <p className="text-gray-300 text-sm mb-4">{door.description}</p>

                            <button
                              type="button"
                              disabled={isNavigating}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (isNavigating) return;
                                setIsNavigating(true);
                                onNavigate('product', door.id);
                                window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                              }}
                              className="w-full bg-white/20 backdrop-blur-md text-white py-3 px-4 rounded-xl font-semibold hover:bg-white/30 disabled:opacity-60 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 border border-white/30 shadow-lg"
                  >
                    <Eye className="h-4 w-4" />
                              {isNavigating ? t('catalog.opening') : t('catalog.view_details')}
                  </button>
                </div>
                        </motion.div>
            ))}
          </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })
          )}
        </motion.div>
      </section>
    </div>
  );
}
