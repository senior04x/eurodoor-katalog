import { Eye, Layers } from 'lucide-react';
import { useMemo, useState } from 'react';

interface CatalogPageProps {
  onNavigate: (page: string, productId?: string) => void;
}

interface DoorProduct {
  id: string;
  name: string;
  image: string;
  material: string;
  security: string;
  dimensions: string; // format: "2000x900mm"
  description: string;
}

type GroupMode = 'material' | 'size';

export default function CatalogPage({ onNavigate }: CatalogPageProps) {
  const doors: DoorProduct[] = [
    { id: 'euro-model1',  name: 'EURO Model-1 Metal Door',     image: 'https://iili.io/2XPGae9.png', material: 'Metall + MDF',                         security: 'A+ sinf', dimensions: '2000x900mm',  description: 'Zamonaviy dizaynli metall eshik ichki MDF qoplama bilan' },
    { id: 'euro-model2',  name: 'EURO Model-2 Security Door',  image: 'https://iili.io/2XiBAMJ.png', material: "Po'lat + MDF",                          security: 'Premium', dimensions: '2100x950mm',  description: 'Yuqori xavfsizlik darajasiga ega premium eshik' },
    { id: 'euro-model3',  name: 'EURO Model-3 Classic Door',   image: 'https://iili.io/2XiBwS2.png', material: 'Metall + Shisha',                       security: 'A sinf',  dimensions: '2000x850mm',  description: 'Klassik uslubdagi metall eshik shisha elementlar bilan' },
    { id: 'euro-model4',  name: 'EURO Model-4 Design Door',    image: 'https://iili.io/2XPGzWG.png', material: "Metall + Yog'och",                      security: 'A+ sinf', dimensions: '2100x900mm',  description: "Designer uslubidagi eshik yog'och dekor elementlari bilan" },
    { id: 'euro-model5',  name: 'EURO Model-5 Premium Door',   image: 'https://iili.io/2Xige71.jpg', material: "Premium po'lat",                        security: 'Ultra',   dimensions: '2200x1000mm', description: 'Eng yuqori darajadagi xavfsizlik va dizayn' },
    { id: 'euro-model6',  name: 'EURO Model-6 Luxury Door',    image: 'https://iili.io/2Xir2Y7.jpg', material: "Metall + Natutal yog'och",              security: 'A+ sinf', dimensions: '2100x950mm',  description: 'Hashamatli dizayn va natural materiallar' },
    { id: 'euro-model7',  name: 'EURO Model-7 Modern Door',    image: '/image/model7.jpg',           material: 'Metall + Kompozit',                     security: 'A+ sinf', dimensions: '2000x900mm',  description: 'Zamonaviy kompozit materiallar bilan ishlangan eshik' },
    { id: 'euro-model8',  name: 'EURO Model-8 Elite Door',     image: '/image/model8.jpg',           material: "Premium po'lat + MDF",                  security: 'Ultra Premium', dimensions: '2100x1000mm', description: 'Elite darajadagi xavfsizlik va dizayn' },
    { id: 'euro-model9',  name: 'EURO Model-9 Classic Premium',image: '/image/model9.jpg',           material: "Metall + Yog'och + Shisha",             security: 'A+ sinf', dimensions: '2100x950mm',  description: 'Klassik va zamonaviy elementlarni birlashtirgan eshik' },
    { id: 'euro-model10', name: 'EURO Model-10 Executive Door',image: '/image/model10.jpg',          material: "Premium po'lat + Natural yog'och",      security: 'Executive', dimensions: '2200x1000mm', description: 'Ijrochi darajadagi xavfsizlik va hashamat' },
    { id: 'euro-model11', name: 'EURO Model-11 Ultimate Door', image: '/image/model11.jpg',          material: "Ultra Premium po'lat + MDF",            security: 'Ultimate', dimensions: '2200x1000mm', description: 'Eng yuqori darajadagi xavfsizlik va dizayn' }
  ];

  // ---------- Helperlar ----------
  const norm = (s: string) =>
    s.toLowerCase()
      .replace(/’/g, "'")
      .replace(/metall/g, 'temir')
      .replace(/po'lat/g, 'temir')
      .replace(/yog'och/g, 'yogoch');

  const getMaterialKey = (m: string) => {
    const x = norm(m);
    const hasTemir = x.includes('temir');
    const hasMdf = x.includes('mdf');
    const hasTemirOnly = hasTemir && !hasMdf && !x.includes('yogoch') && !x.includes('shisha') && !x.includes('kompozit') && !x.includes('natural');
    if (hasTemir && hasMdf) return 'Temir + MDF';
    if (x.includes('mdf') && !hasTemir) return 'MDF + MDF';
    if (hasTemirOnly) return 'Temir + Temir';
    if (x.includes('yogoch')) return "Temir + Yog'och";
    if (x.includes('shisha')) return 'Temir + Shisha';
    if (x.includes('kompozit')) return 'Temir + Kompozit';
    return 'Boshqa';
  };

  const parseHeight = (d: string) => {
    // "2100x950mm" -> 2100
    const m = d.match(/(\d+)\s*x\s*\d+/i);
    return m ? parseInt(m[1], 10) : NaN;
  };

  const getSizeKey = (d: string) => {
    const h = parseHeight(d);
    if (isNaN(h)) return 'Boshqa o‘lcham';
    if (h <= 2000) return '2000 mm seriya';
    if (h <= 2100) return '2100 mm seriya';
    return '2200 mm seriya';
  };

  const [mode, setMode] = useState<GroupMode>('material');
  const [openKey, setOpenKey] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const map = new Map<string, DoorProduct[]>();
    for (const d of doors) {
      const key = mode === 'material' ? getMaterialKey(d.material) : getSizeKey(d.dimensions);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(d);
    }
    // Tartib: foydali bo‘limlar yuqorida
    const order =
      mode === 'material'
        ? ['Temir + MDF', 'MDF + MDF', 'Temir + Temir', "Temir + Yog'och", 'Temir + Shisha', 'Temir + Kompozit', 'Boshqa']
        : ['2000 mm seriya', '2100 mm seriya', '2200 mm seriya', 'Boshqa o‘lcham'];

    const sortedEntries = Array.from(map.entries()).sort((a, b) => {
      const ai = order.indexOf(a[0]);
      const bi = order.indexOf(b[0]);
      return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
    });
    return sortedEntries;
  }, [doors, mode]);

  return (
    <div className="relative min-h-screen">
      {/* Fixed background */}
      <div
        className="fixed inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('https://iili.io/K2Em0Cu.png')" }}
      />
      <div className="fixed inset-0 bg-black/30" />

      {/* Header */}
      <section className="bg-none backdrop-blur-xl py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">Eshiklar katalogi</h1>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Yuqori sifatli temir va MDF eshiklarimiz bilan tanishing. Har bir model maxsus
              texnologiya asosida ishlab chiqarilgan.
            </p>

            {/* Rejim tanlash: Material / O'lcham */}
            <div className="mt-6 inline-flex rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl overflow-hidden">
              <button
                onClick={() => { setMode('material'); setOpenKey(null); }}
                className={`px-4 py-2 text-sm font-semibold transition ${mode === 'material' ? 'bg-white/25 text-white' : 'text-gray-200 hover:bg-white/10'}`}
              >
                Material bo‘yicha
              </button>
              <button
                onClick={() => { setMode('size'); setOpenKey(null); }}
                className={`px-4 py-2 text-sm font-semibold transition ${mode === 'size' ? 'bg-white/25 text-white' : 'text-gray-200 hover:bg-white/10'}`}
              >
                O‘lcham bo‘yicha
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Accordion Bo‘limlar */}
      <section className="py-12">
        <div className="container mx-auto px-4 space-y-6">
          {grouped.map(([key, list]) => {
            const isOpen = openKey === key;
            return (
              <div
                key={key}
                className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl overflow-hidden"
              >
                {/* Sarlavha */}
                <button
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
                  <div className="px-6 pb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {list.map((door) => (
                        <div
                          key={door.id}
                          className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-white/20 hover:scale-[1.02] transition"
                        >
                          <div className="relative aspect-square overflow-hidden">
                            <img src={door.image} alt={door.name} className="w-full h-full object-cover" />
                            <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-xl rounded-full p-3 border border-white/30 shadow-lg">
                              <Layers className="h-5 w-5 text-white" />
                              <span className="sr-only">Kesim ko‘rinishi</span>
                            </div>
                          </div>
                          <div className="p-5">
                            <h3 className="text-lg font-semibold text-white mb-2">{door.name}</h3>
                            <div className="space-y-1 mb-3 text-sm text-gray-300">
                              <div><span className="font-medium">Material:</span> {door.material}</div>
                              <div><span className="font-medium">Xavfsizlik:</span> {door.security}</div>
                              <div><span className="font-medium">O‘lcham:</span> {door.dimensions}</div>
                            </div>
                            <p className="text-gray-300 text-sm mb-4">{door.description}</p>
                            <button
                              onClick={() => onNavigate('product', door.id)}
                              className="w-full bg-white/20 backdrop-blur-md text-white py-3 px-4 rounded-xl font-semibold hover:bg-white/30 transition flex items-center justify-center gap-2 border border-white/30 shadow-lg"
                            >
                              <Eye className="h-4 w-4" />
                              Batafsil ko‘rish
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
