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

  // Fade + Pastdan ko‘tarilish varianti
  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    show: {
      opacity: 1,
      y: 0,
      transition: prefersReduced
        ? { duration: 0 }
        : { duration: 1, ease: "easeOut" }
    }
  };

  const cardClass =
    "w-full bg-white/10 backdrop-blur-xl backdrop-saturate-150 rounded-2xl p-6 py-16 shadow-2xl border border-white/20 transition-transform duration-300";

  return (
    <div className="relative min-h-screen">
      {/* Background */}
      <div
        className="fixed inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('https://iili.io/K2Em0Cu.png')" }}
      />
      <div className="fixed inset-0 bg-black/30" />

      {/* Header */}
      <motion.section
        variants={fadeUp}
        initial="hidden"
        animate="show"
        className="bg-white/10 backdrop-blur-xl backdrop-saturate-150 rounded-2xl mx-4 py-16 shadow-2xl border border-white/20 mb-0"
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

      {/* Main grid */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="show"
        transition={{ delay: 0.2, duration: 1 }}
        className="py-12 mt-0"
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              transition={{ delay: 0.3, duration: 1 }}
              className={cardClass}
            >
              <h2 className="text-2xl font-bold text-white mb-6">Bog'lanish ma'lumotlari</h2>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#D4AF37]/10 rounded-full flex items-center justify-center">
                    <Phone className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">Telefon</h3>
                    <p className="text-white">+998 90 123 45 67</p>
                    <p className="text-white">+998 91 234 56 78</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#D4AF37]/10 rounded-full flex items-center justify-center">
                    <MessageCircle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">Telegram</h3>
                    <p className="text-white">@eurodoor_uz</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#D4AF37]/10 rounded-full flex items-center justify-center">
                    <Instagram className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">Instagram</h3>
                    <p className="text-white">@eurodoor.uz</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#D4AF37]/10 rounded-full flex items-center justify-center">
                    <Mail className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">Email</h3>
                    <p className="text-white">info@eurodoor.uz</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#D4AF37]/10 rounded-full flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">Manzil</h3>
                    <p className="text-white">
                      Toshkent shahar, Sergeli tumani <br />
                      Buyuk Ipak Yo'li ko'chasi, 12-uy
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#D4AF37]/10 rounded-full flex items-center justify-center">
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
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              transition={{ delay: 0.4, duration: 1 }}
              className={cardClass}
            >
              <h3 className="text-xl font-semibold text-white mb-4">Bizning joylashuvimiz</h3>
              <div className="rounded-lg overflow-hidden h-64 lg:h-[500px] flex items-center justify-center">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m13!1m8!1m3!1d1998.5340553151188!2d69.24062708578978!3d41.36500662946383!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zNDHCsDIxJzU0LjIiTiA2OcKwMTQnMzAuNCJF!5e0!3m2!1suz!2s!4v1732125780839!5m2!1suz!2s"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={true}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Google Maps"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Services */}
      <motion.section
        variants={fadeUp}
        initial="hidden"
        animate="show"
        transition={{ delay: 0.6, duration: 1 }}
        className="py-16 bg-white/10 backdrop-blur-xl backdrop-saturate-150 rounded-2xl mx-4 shadow-2xl border border-white/20 mb-16"
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
    </div>
  );
}
