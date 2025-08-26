import { useState } from 'react';
import { Phone, MessageCircle, Instagram, MapPin, Clock, Mail } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    product: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    alert('Sizning so\'rovingiz qabul qilindi! Tez orada aloqaga chiqamiz.');
    setFormData({ name: '', phone: '', product: '', message: '' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5]"
         style={{ backgroundImage: "url('https://iili.io/Kd4L7wv.jpg" }}>
      
      {/* Header */}
      <section className="bg-white/10 backdrop-blur-xl rounded-2xl mx-4 py-16 shadow-2xl border border-white/20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">
              Aloqa
            </h1>
            <p className="text-lg text-white max-w-2xl mx-auto">
              Sizga kerakli eshikni tanlashda yordam berish uchun biz bilan bog'laning. 
              Mutaxassislarimiz bepul maslahat va o'lchash xizmati taklif qiladi.
            </p>
          </div>
        </div>
      </section>

      <div className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div className="space-y-8">
             <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/20">
                <h2 className="text-2xl font-bold text-white mb-6">
                  Bog'lanish ma'lumotlari
                </h2>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#D4AF37]/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Phone className="h-6 w-6 text-[#DE32C27]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">Telefon</h3>
                      <p className="text-white">+998 90 123 45 67</p>
                      <p className="text-white">+998 91 234 56 78</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#D4AF37]/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="h-6 w-6 text-[#DE32C27]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">Telegram</h3>
                      <p className="text-white">@eurodoor_uz</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#D4AF37]/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Instagram className="h-6 w-6 text-[#DE32C27]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">Instagram</h3>
                      <p className="text-white">@eurodoor.uz</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#D4AF37]/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Mail className="h-6 w-6 text-[#DE32C27]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">Email</h3>
                      <p className="text-white">info@eurodoor.uz</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#D4AF37]/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-6 w-6 text-[#DE32C27]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">Manzil</h3>
                      <p className="text-white">
                        Toshkent shahar, Sergeli tumani<br />
                        Buyuk Ipak Yo'li ko'chasi, 12-uy
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#D4AF37]/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Clock className="h-6 w-6 text-[#DE32C27]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">Ish vaqti</h3>
                      <p className="text-white">
                        Dushanba - Shanba: 9:00 - 19:00<br />
                        Yakshanba: 10:00 - 17:00
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map */}
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/20">
                <h3 className="text-xl font-semibold text-white mb-4">
                  Bizning joylashuvimiz
                </h3>
                <div className="rounded-lg overflow-hidden h-64 flex items-center justify-center">
    <iframe
      src="https://www.google.com/maps/embed?pb=!1m13!1m8!1m3!1d1998.5340553151188!2d69.24062708578978!3d41.36500662946383!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zNDHCsDIxJzU0LjIiTiA2OcKwMTQnMzAuNCJF!5e0!3m2!1suz!2s!4v1732125780839!5m2!1suz!2s"
      width="100%"
      height="100%"
      style={{ border: 0 }}
      allowFullScreen={true}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      title="Google Maps"
    ></iframe>
  </div>
              </div>
            </div>

            {/* Order Form */}
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-6">
                Onlayn buyurtma berish
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-[#1A1A1A] mb-2">
                    To'liq ismingiz *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-colors"
                    placeholder="Ismingizni kiriting"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-[#1A1A1A] mb-2">
                    Telefon raqami *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-colors"
                    placeholder="+998 90 123 45 67"
                  />
                </div>

                <div>
                  <label htmlFor="product" className="block text-sm font-medium text-[#1A1A1A] mb-2">
                    Qiziqtirgan mahsulot
                  </label>
                  <select
                    id="product"
                    name="product"
                    value={formData.product}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-colors"
                  >
                    <option value="">Mahsulotni tanlang</option>
                    <option value="euro-m45">EURO M-45 Metal Door</option>
                    <option value="euro-s32">EURO S-32 Security Door</option>
                    <option value="euro-c28">EURO C-28 Classic Door</option>
                    <option value="euro-d41">EURO D-41 Design Door</option>
                    <option value="euro-p55">EURO P-55 Premium Door</option>
                    <option value="euro-l33">EURO L-33 Luxury Door</option>
                    <option value="other">Boshqa</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-[#1A1A1A] mb-2">
                    Qo'shimcha ma'lumot
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-colors resize-none"
                    placeholder="O'lchamlar, rang, boshqa talablar..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#D4AF37] text-black py-4 px-6 rounded-lg font-semibold hover:bg-[#B8941F] transition-colors"
                >
                  So'rov yuborish
                </button>

                <div className="text-sm text-gray-500 text-center">
                  * Majburiy maydonlar. Ma'lumotlaringiz xavfsiz va maxfiy saqlanadi.
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Service Info */}
      <section className="py-16 bg-[#1A1A1A] text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Bizning xizmatlarimiz
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#D4AF37] rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="h-8 w-8 text-black" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Bepul maslahat</h3>
              <p className="text-gray-300">
                Mutaxassislarimiz sizga eng mos eshikni tanlashda yordam beradi
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#D4AF37] rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-black" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Bepul o'lchash</h3>
              <p className="text-gray-300">
                Uyingizga borib, aniq o'lchamlarni olamiz
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#D4AF37] rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-black" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Tez o'rnatish</h3>
              <p className="text-gray-300">
                Professional jamoa tomonidan sifatli o'rnatish
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}