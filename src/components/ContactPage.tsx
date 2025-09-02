import { useState } from 'react';
import { Phone, MessageCircle, Instagram, MapPin, Clock, Mail } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { motion, useReducedMotion } from 'framer-motion';

export default function ContactPage() {
  const prefersReduced = useReducedMotion();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    product: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Sizning so'rovingiz qabul qilindi! Tez orada aloqaga chiqamiz.");
    setFormData({ name: '', phone: '', product: '', message: '' });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // ---- Umumiy (ota) variant: hammasini bir vaqtda boshqaradi
  const pageVariants = {
    hidden: {},
    show: {
      transition: prefersReduced ? {} : {
        // bolalar bir vaqtda boshlaydi (stagger yo‘q)
        when: 'beforeChildren',
      }
    }
  };

  // ---- Bolalar uchun fade + pastdan ko‘tarilish (hammasida bir xil)
  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    show: {
      opacity: 1,
      y: 0,
      transition: prefersReduced
        ? { duration: 0 }
        : { duration: 0.9, ease: 'easeOut' }
    }
  };

  const cardClass =
    "w-full bg-white/10 backdrop-blur-xl backdrop-saturate-150 rounded-2xl p-6 py-16 shadow-2xl border border-white/20 transform-gpu will-change-transform";

  return (
    <div className="relative min-h-screen">
      {/* Fixed background */}
      <div
        className="fixed inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('https://iili.io/KqAQo3g.jpg')" }}
      />
      <div className="fixed inset-0 bg-black/30" />

      {/* OTA KONTROL: barcha sectionlar sinxron chiqadi */}
      <motion.main
        variants={pageVariants}
        initial="hidden"
        animate="show"
        className="relative"
      >
        {/* Header (bola) */}
        <motion.section
          variants={fadeUp}
          className="bg-white/10 backdrop-blur-xl backdrop-saturate-150 rounded-2xl mx-4 py-16 shadow-2xl border border-white/20 mb-0 transform-gpu will-change-transform"
        >
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-white mb-4">Aloqa</h1>
              <p className="text-lg text-white/90 max-w-2xl mx-auto">
                Sizga kerakli eshikni tanlashda yordam berish uchun biz bilan bog'laning.
                Mutaxassislarimiz bepul maslahat va o'lchash xizmati taklif qiladi.
              </p>
            </div>
          </div>
        </motion.section>

        {/* Main grid (bola) */}
        <motion.div
          variants={fadeUp}
          className="py-12 mt-0 transform-gpu will-change-transform"
        >
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Information */}
              <motion.div variants={fadeUp} className={cardClass}>
                <h2 className="text-2xl font-bold text-white mb-6">Bog'lanish ma'lumotlari</h2>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#D4AF37]/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Phone className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">Telefon</h3>
                          <a href="tel:+998901234567" className="text-white hover:underline">
                              +998 90 123 45 67
                            </a> <br />
                          <a href="tel:+998912345678" className="text-white hover:underline">
                              +998 91 234 56 78
                            </a>

                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#D4AF37]/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">Telegram</h3>
                     <a
                       href="https://t.me/eurodoor_uz"
                       target="_blank"
                       rel="noopener noreferrer"
                       className="text-white hover:underline"
                     >
                       @eurodoor_uz
                     </a>

                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#D4AF37]/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Instagram className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">Instagram</h3>
                       <a
                         href="https://instagram.com/eurodoor.uz"
                         target="_blank"
                         rel="noopener noreferrer"
                         className="text-white hover:underline"
                       >
                             @eurodoor.uz
                       </a>

                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#D4AF37]/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Mail className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">Email</h3>
                      <p className="text-white">info@eurodoor.uz</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#D4AF37]/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">Manzil</h3>
                      <p className="text-white">
                         Chilonzor tumani, Toshkent <br />
                       Tirsakobod mahalla fuqarolar yigʻini
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#D4AF37]/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Clock className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">Ish vaqti</h3>
                      <p className="text-white">
                        Dushanba - Shanba: 9:00 - 19:00 <br />
                        Yakshanba: 10:00 - 17:00
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Map */}
              <motion.div variants={fadeUp} className={cardClass}>
  <h3 className="text-xl font-semibold text-white mb-4">Bizning joylashuvimiz</h3>
  <div className="rounded-lg overflow-hidden h-64 lg:h-[500px] flex items-center justify-center">
    <div style={{ position: "relative", overflow: "hidden", width: "100%", height: "100%" }}>
      <a
        href="https://yandex.uz/maps/org/204432436811/?utm_medium=mapframe&utm_source=maps"
        style={{
          color: "#eee",
          fontSize: "12px",
          position: "absolute",
          top: 0,
          left: 0,
        }}
        target="_blank"
        rel="noopener noreferrer"
      >
        Eurodoor.Uz
      </a>
      <a
        href="https://yandex.uz/maps/10335/tashkent/category/doors/184107677/?utm_medium=mapframe&utm_source=maps"
        style={{
          color: "#eee",
          fontSize: "12px",
          position: "absolute",
          top: "14px",
          left: 0,
        }}
        target="_blank"
        rel="noopener noreferrer"
      >
        Eshiklar Toshkentda
      </a>
      <iframe
        src="https://yandex.uz/map-widget/v1/?ll=69.194934%2C41.250800&mode=search&oid=204432436811&ol=biz&z=17.75"
        width="100%"
        height="100%"
        style={{ position: "relative", border: 0 }}
        frameBorder={1}
        allowFullScreen
        title="Yandex Maps"
      />
    </div>
  </div>
</motion.div>

            </div>
          </div>
        </motion.div>

        {/* Services (bola) */}
        <motion.section
          variants={fadeUp}
          className="py-16 bg-white/10 backdrop-blur-xl backdrop-saturate-150 rounded-2xl mx-4 shadow-2xl border border-white/20 mb-16 transform-gpu will-change-transform"
        >
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-2">Bizning xizmatlarimiz</h2>
              <p className="text-gray-300">Mahsulot tanlashdan tortib o‘rnatishgacha — barchasi bir joyda</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Bepul maslahat</h3>
                <p className="text-gray-300">
                  Mutaxassislarimiz sizga eng mos eshikni tanlashda yordam beradi
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Bepul o'lchash</h3>
                <p className="text-gray-300">
                  Uyingizga borib, aniq o'lchamlarni olamiz
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Tez o'rnatish</h3>
                <p className="text-gray-300">
                  Professional jamoa tomonidan sifatli o'rnatish
                </p>
              </div>
            </div>
          </div>
        </motion.section>
      </motion.main>
    </div>
  );
}
