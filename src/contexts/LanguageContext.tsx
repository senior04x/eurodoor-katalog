import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'uz' | 'ru' | 'en';

interface Translations {
  [key: string]: {
    uz: string;
    ru: string;
    en: string;
  };
}

const translations: Translations = {
  // Navigation
  'nav.catalog': {
    uz: 'Katalog',
    ru: 'Каталог',
    en: 'Catalog'
  },
  'nav.about': {
    uz: 'Biz haqimizda',
    ru: 'О нас',
    en: 'About Us'
  },
  'nav.contact': {
    uz: 'Aloqa',
    ru: 'Контакты',
    en: 'Contact'
  },
  'nav.blog': {
    uz: 'Aksiyalar',
    ru: 'Акции',
    en: 'Promotions'
  },
  
  // Home Page
  'home.title': {
    uz: 'Eurodoor — Euro Doors Toshkentda',
    ru: 'Eurodoor — Euro Doors в Ташкенте',
    en: 'Eurodoor — Euro Doors in Tashkent'
  },
  'home.subtitle': {
    uz: 'Temir eshiklar & MDF eshiklar',
    ru: 'Железные двери & MDF двери',
    en: 'Iron doors & MDF doors'
  },
  'home.description': {
    uz: 'Ko\'cha/tashqi uchun temir va MDF eshiklar. Toshkentda o\'rnatish, kafolat va bepul maslahat.',
    ru: 'Железные и MDF двери для улицы/внешнего использования. Установка в Ташкенте, гарантия и бесплатная консультация.',
    en: 'Iron and MDF doors for street/external use. Installation in Tashkent, warranty and free consultation.'
  },
  'home.hero_title': {
    uz: 'Sizning uyingiz xavfsizligi bizning ustuvorligimiz',
    ru: 'Безопасность вашего дома - наш приоритет',
    en: 'Your home security is our priority'
  },
  'home.hero_subtitle': {
    uz: 'Zamonaviy dizayn va yuqori xavfsizlik standartlarini birlashtirgan premium temir va MDF eshiklar',
    ru: 'Премиум железные и MDF двери, сочетающие современный дизайн и высокие стандарты безопасности',
    en: 'Premium iron and MDF doors combining modern design and high security standards'
  },
  'home.security': {
    uz: 'Yuqori xavfsizlik',
    ru: 'Высокая безопасность',
    en: 'High Security'
  },
  'home.security_desc': {
    uz: 'Metall va MDF materiallardan yasalgan mustahkam eshiklar',
    ru: 'Прочные двери из металла и MDF материалов',
    en: 'Strong doors made from metal and MDF materials'
  },
  'home.quality': {
    uz: 'Sifat sertifikati',
    ru: 'Сертификат качества',
    en: 'Quality Certificate'
  },
  'home.quality_desc': {
    uz: 'Barcha mahsulotlar xalqaro standartlarga javob beradi',
    ru: 'Все продукты соответствуют международным стандартам',
    en: 'All products meet international standards'
  },
  'home.delivery': {
    uz: 'Tez yetkazib berish',
    ru: 'Быстрая доставка',
    en: 'Fast Delivery'
  },
  'home.delivery_desc': {
    uz: 'Professional o\'rnatish xizmati bilan birga',
    ru: 'Вместе с профессиональной установкой',
    en: 'Along with professional installation service'
  },
  'home.view_catalog': {
    uz: 'Katalogni ko\'rish',
    ru: 'Посмотреть каталог',
    en: 'View Catalog'
  },

  // Header translations
  'header.profile': {
    uz: 'Profil',
    ru: 'Профиль',
    en: 'Profile'
  },
  'header.orders': {
    uz: 'Buyurtmalarim',
    ru: 'Мои заказы',
    en: 'My Orders'
  },
  'header.logout': {
    uz: 'Chiqish',
    ru: 'Выйти',
    en: 'Logout'
  },
  'header.login': {
    uz: 'Kirish',
    ru: 'Войти',
    en: 'Login'
  },
  'header.register': {
    uz: 'Ro\'yxatdan o\'tish',
    ru: 'Регистрация',
    en: 'Register'
  },
  'header.cart': {
    uz: 'Korzinka',
    ru: 'Корзина',
    en: 'Cart'
  },

  // Cart translations
  'cart.title': {
    uz: 'Korzinka',
    ru: 'Корзина',
    en: 'Cart'
  },
  'cart.empty': {
    uz: 'Korzinka bo\'sh',
    ru: 'Корзина пуста',
    en: 'Cart is empty'
  },
  'cart.empty_desc': {
    uz: 'Mahsulotlar qo\'shish uchun katalogga o\'ting',
    ru: 'Перейдите в каталог, чтобы добавить товары',
    en: 'Go to catalog to add products'
  },
  'cart.go_to_catalog': {
    uz: 'Katalogga o\'tish',
    ru: 'Перейти в каталог',
    en: 'Go to Catalog'
  },
  'cart.dimensions': {
    uz: 'O\'lcham',
    ru: 'Размер',
    en: 'Size'
  },
  'cart.color': {
    uz: 'Rang',
    ru: 'Цвет',
    en: 'Color'
  },
  'cart.total': {
    uz: 'Jami',
    ru: 'Итого',
    en: 'Total'
  },
  'cart.clear': {
    uz: 'Tozalash',
    ru: 'Очистить',
    en: 'Clear'
  },
  'cart.checkout': {
    uz: 'Buyurtma berish',
    ru: 'Оформить заказ',
    en: 'Checkout'
  },

  // Order Success Page
  'orderSuccess.title': {
    uz: 'Buyurtma muvaffaqiyatli qabul qilindi!',
    ru: 'Заказ успешно принят!',
    en: 'Order Successfully Accepted!'
  },
  'orderSuccess.subtitle': {
    uz: 'Sizning buyurtmangiz qabul qilindi va tez orada siz bilan bog\'lanamiz.',
    ru: 'Ваш заказ принят, и мы свяжемся с вами в ближайшее время.',
    en: 'Your order has been accepted and we will contact you soon.'
  },
  'orderSuccess.orderDetails': {
    uz: 'Buyurtma ma\'lumotlari',
    ru: 'Детали заказа',
    en: 'Order Details'
  },
  'orderSuccess.orderNumber': {
    uz: 'Buyurtma raqami:',
    ru: 'Номер заказа:',
    en: 'Order Number:'
  },
  'orderSuccess.customerName': {
    uz: 'Mijoz:',
    ru: 'Клиент:',
    en: 'Customer:'
  },
  'orderSuccess.phone': {
    uz: 'Telefon:',
    ru: 'Телефон:',
    en: 'Phone:'
  },
  'orderSuccess.totalAmount': {
    uz: 'Jami summa:',
    ru: 'Общая сумма:',
    en: 'Total Amount:'
  },
  'orderSuccess.contactInfo': {
    uz: 'Bog\'lanish ma\'lumotlari',
    ru: 'Контактная информация',
    en: 'Contact Information'
  },
  'orderSuccess.contactText': {
    uz: 'Bizning mutaxassislarimiz 24 soat ichida siz bilan bog\'lanadi va buyurtmangizni batafsil muhokama qiladi.',
    ru: 'Наши специалисты свяжутся с вами в течение 24 часов и подробно обсудят ваш заказ.',
    en: 'Our specialists will contact you within 24 hours and discuss your order in detail.'
  },
  'orderSuccess.goHome': {
    uz: 'Bosh sahifaga qaytish',
    ru: 'Вернуться на главную',
    en: 'Return to Home'
  },
  'orderSuccess.newOrder': {
    uz: 'Yangi buyurtma',
    ru: 'Новый заказ',
    en: 'New Order'
  },
  'orderSuccess.thankYou': {
    uz: 'Eurodoor jamoasi nomidan rahmat! Sizning ishonchingiz biz uchun juda muhim.',
    ru: 'Спасибо от команды Eurodoor! Ваше доверие очень важно для нас.',
    en: 'Thank you from the Eurodoor team! Your trust is very important to us.'
  },

  // Auth translations
  'auth.login': {
    uz: 'Kirish',
    ru: 'Войти',
    en: 'Login'
  },
  'auth.register': {
    uz: 'Ro\'yxatdan o\'tish',
    ru: 'Регистрация',
    en: 'Register'
  },
  'auth.name': {
    uz: 'Ism',
    ru: 'Имя',
    en: 'Name'
  },
  'auth.phone': {
    uz: 'Telefon raqami',
    ru: 'Номер телефона',
    en: 'Phone Number'
  },
  'auth.password': {
    uz: 'Parol',
    ru: 'Пароль',
    en: 'Password'
  },
  'auth.confirm_password': {
    uz: 'Parolni tasdiqlang',
    ru: 'Подтвердите пароль',
    en: 'Confirm Password'
  },
  'auth.name_placeholder': {
    uz: 'Ismingizni kiriting',
    ru: 'Введите ваше имя',
    en: 'Enter your name'
  },
  'auth.phone_placeholder': {
    uz: '+998 90 123 45 67',
    ru: '+998 90 123 45 67',
    en: '+998 90 123 45 67'
  },
  'auth.password_placeholder': {
    uz: 'Parolingizni kiriting',
    ru: 'Введите ваш пароль',
    en: 'Enter your password'
  },
  'auth.confirm_password_placeholder': {
    uz: 'Parolni qayta kiriting',
    ru: 'Повторите пароль',
    en: 'Repeat password'
  },
  'auth.loading': {
    uz: 'Kutilmoqda...',
    ru: 'Ожидание...',
    en: 'Loading...'
  },
  'auth.no_account': {
    uz: 'Hali ro\'yxatdan o\'tmaganmisiz?',
    ru: 'Еще не зарегистрированы?',
    en: 'Don\'t have an account?'
  },
  'auth.have_account': {
    uz: 'Allaqachon ro\'yxatdan o\'tganmisiz?',
    ru: 'Уже зарегистрированы?',
    en: 'Already have an account?'
  },
  'auth.register_link': {
    uz: 'Ro\'yxatdan o\'ting',
    ru: 'Зарегистрироваться',
    en: 'Register'
  },
  'auth.login_link': {
    uz: 'Kirish',
    ru: 'Войти',
    en: 'Login'
  },
  'auth.name_required': {
    uz: 'Ism kiritish majburiy',
    ru: 'Имя обязательно',
    en: 'Name is required'
  },
  'auth.phone_required': {
    uz: 'Telefon raqami kiritish majburiy',
    ru: 'Номер телефона обязателен',
    en: 'Phone number is required'
  },
  'auth.password_min_length': {
    uz: 'Parol kamida 6 ta belgi bo\'lishi kerak',
    ru: 'Пароль должен содержать минимум 6 символов',
    en: 'Password must be at least 6 characters'
  },
  'auth.passwords_not_match': {
    uz: 'Parollar mos kelmaydi',
    ru: 'Пароли не совпадают',
    en: 'Passwords do not match'
  },
  'auth.login_success': {
    uz: 'Kirish muvaffaqiyatli!',
    ru: 'Вход успешен!',
    en: 'Login successful!'
  },
  'auth.register_success': {
    uz: 'Muvaffaqiyatli ro\'yxatdan o\'tdingiz! Endi kirishingiz mumkin.',
    ru: 'Регистрация прошла успешно! Теперь можете войти.',
    en: 'Registration successful! You can now login.'
  },
  'auth.login_error': {
    uz: 'Kirishda xatolik yuz berdi',
    ru: 'Ошибка при входе',
    en: 'Login error occurred'
  },
  'auth.register_error': {
    uz: 'Ro\'yxatdan o\'tishda xatolik yuz berdi',
    ru: 'Ошибка при регистрации',
    en: 'Registration error occurred'
  },
  'auth.general_error': {
    uz: 'Xatolik yuz berdi. Iltimos, qaytadan urinib ko\'ring.',
    ru: 'Произошла ошибка. Пожалуйста, попробуйте снова.',
    en: 'An error occurred. Please try again.'
  },

  // Contact translations
  'contact.title': {
    uz: 'Biz bilan bog\'laning',
    ru: 'Свяжитесь с нами',
    en: 'Contact Us'
  },
  'contact.description': {
    uz: 'Sizga kerakli eshikni tanlashda yordam berish uchun biz bilan bog\'laning. Mutaxassislarimiz bepul maslahat va o\'lchash xizmati taklif qiladi.',
    ru: 'Свяжитесь с нами для помощи в выборе нужной двери. Наши специалисты предлагают бесплатную консультацию и услуги по замерам.',
    en: 'Contact us for help in choosing the right door. Our specialists offer free consultation and measurement services.'
  },
  'contact.contact_form': {
    uz: 'Aloqa formasi',
    ru: 'Форма связи',
    en: 'Contact Form'
  },
  'contact.contact_info': {
    uz: 'Bog\'lanish ma\'lumotlari',
    ru: 'Контактная информация',
    en: 'Contact Information'
  },
  'contact.phone': {
    uz: 'Telefon',
    ru: 'Телефон',
    en: 'Phone'
  },
  'contact.telegram': {
    uz: 'Telegram',
    ru: 'Telegram',
    en: 'Telegram'
  },
  'contact.instagram': {
    uz: 'Instagram',
    ru: 'Instagram',
    en: 'Instagram'
  },
  'contact.email': {
    uz: 'Email',
    ru: 'Email',
    en: 'Email'
  },
  'contact.our_location': {
    uz: 'Bizning joylashuvimiz',
    ru: 'Наше местоположение',
    en: 'Our Location'
  },

  // Home translations
  'home.free_consultation': {
    uz: 'Bepul maslahat',
    ru: 'Бесплатная консультация',
    en: 'Free Consultation'
  },
  'home.specialists_help': {
    uz: 'Mutaxassislarimiz sizga kerakli eshikni tanlashda yordam beradi',
    ru: 'Наши специалисты помогут вам выбрать нужную дверь',
    en: 'Our specialists will help you choose the right door'
  },
  'home.contact_button': {
    uz: 'Bog\'lanish',
    ru: 'Связаться',
    en: 'Contact'
  },

  // Catalog translations
  'catalog.title': {
    uz: 'Katalog',
    ru: 'Каталог',
    en: 'Catalog'
  },
  'catalog.description': {
    uz: 'Bizning eshik modellari katalogi',
    ru: 'Каталог наших моделей дверей',
    en: 'Our door models catalog'
  },
  'catalog.group_by_material': {
    uz: 'Material bo\'yicha',
    ru: 'По материалу',
    en: 'By Material'
  },
  'catalog.group_by_size': {
    uz: 'O\'lcham bo\'yicha',
    ru: 'По размеру',
    en: 'By Size'
  },
  'catalog.material_metall_mdf': {
    uz: 'Metall + MDF',
    ru: 'Металл + МДФ',
    en: 'Metal + MDF'
  },
  'catalog.material_mdf_mdf': {
    uz: 'MDF + MDF',
    ru: 'МДФ + МДФ',
    en: 'MDF + MDF'
  },
  'catalog.material_metall_mdf_oyna': {
    uz: 'Metall + MDF + Oyna',
    ru: 'Металл + МДФ + Стекло',
    en: 'Metal + MDF + Glass'
  },
  'catalog.material_metall_metall': {
    uz: 'Metall + Metall',
    ru: 'Металл + Металл',
    en: 'Metal + Metal'
  },
  'catalog.material_metall_kompozit': {
    uz: 'Metall + Kompozit',
    ru: 'Металл + Композит',
    en: 'Metal + Composite'
  },
  'catalog.material_other': {
    uz: 'Boshqa materiallar',
    ru: 'Другие материалы',
    en: 'Other Materials'
  },
  'catalog.size_2050_series': {
    uz: '2050 seriyasi',
    ru: 'Серия 2050',
    en: '2050 Series'
  },
  'catalog.size_2100_series': {
    uz: '2100 seriyasi',
    ru: 'Серия 2100',
    en: '2100 Series'
  },
  'catalog.size_2300_series': {
    uz: '2300 seriyasi',
    ru: 'Серия 2300',
    en: '2300 Series'
  },
  'catalog.size_other': {
    uz: 'Boshqa o\'lchamlar',
    ru: 'Другие размеры',
    en: 'Other Sizes'
  },
  'catalog.view_details': {
    uz: 'Batafsil',
    ru: 'Подробнее',
    en: 'View Details'
  },
  'catalog.opening': {
    uz: 'Ochilmoqda...',
    ru: 'Открывается...',
    en: 'Opening...'
  },

  // About translations
  'about.title': {
    uz: 'Biz haqimizda',
    ru: 'О нас',
    en: 'About Us'
  },
  'about.description': {
    uz: 'Eurodoor - eshiklar sohasida 10 yildan ortiq tajribaga ega kompaniya',
    ru: 'Eurodoor - компания с более чем 10-летним опытом в области дверей',
    en: 'Eurodoor - a company with more than 10 years of experience in doors'
  },
  'about.experience': {
    uz: 'Yillik tajriba',
    ru: 'Лет опыта',
    en: 'Years of Experience'
  },
  'about.customers': {
    uz: 'Mamnun mijozlar',
    ru: 'Довольных клиентов',
    en: 'Satisfied Customers'
  },
  'about.models': {
    uz: 'Eshik modellari',
    ru: 'Моделей дверей',
    en: 'Door Models'
  },
  'about.mission': {
    uz: 'Bizning missiyamiz',
    ru: 'Наша миссия',
    en: 'Our Mission'
  },
  'about.mission_text': {
    uz: 'Har bir mijozga eng yaxshi eshik yechimini taqdim etish',
    ru: 'Предоставить каждому клиенту лучшее дверное решение',
    en: 'Provide every customer with the best door solution'
  },
  'about.doors_description': {
    uz: 'Bizning eshiklar yuqori sifatli materiallardan tayyorlanadi',
    ru: 'Наши двери изготавливаются из высококачественных материалов',
    en: 'Our doors are made from high-quality materials'
  },
  'about.customer_needs': {
    uz: 'Har bir mijozning ehtiyojlarini hisobga olgan holda',
    ru: 'Учитывая потребности каждого клиента',
    en: 'Taking into account the needs of each customer'
  },
  'about.security': {
    uz: 'Xavfsizlik',
    ru: 'Безопасность',
    en: 'Security'
  },
  'about.highest_security': {
    uz: 'Eng yuqori darajadagi xavfsizlik',
    ru: 'Высший уровень безопасности',
    en: 'Highest level of security'
  },
  'about.certificates_standards': {
    uz: 'Sertifikatlar va standartlar',
    ru: 'Сертификаты и стандарты',
    en: 'Certificates and Standards'
  },
  'about.international_standards': {
    uz: 'Xalqaro standartlar bo\'yicha sertifikatlangan',
    ru: 'Сертифицировано по международным стандартам',
    en: 'Certified to international standards'
  },
  'about.gost_cert': {
    uz: 'GOST sertifikati',
    ru: 'Сертификат ГОСТ',
    en: 'GOST Certificate'
  },
  'about.ce_mark': {
    uz: 'CE belgisi',
    ru: 'Маркировка CE',
    en: 'CE Mark'
  },
  'about.fire_cert': {
    uz: 'Yong\'in xavfsizligi sertifikati',
    ru: 'Сертификат пожарной безопасности',
    en: 'Fire Safety Certificate'
  },
  'about.partnership': {
    uz: 'Hamkorlik',
    ru: 'Партнерство',
    en: 'Partnership'
  },
  'about.partnership_desc': {
    uz: 'Biz bilan hamkorlik qiling va biznesingizni rivojlantiring',
    ru: 'Сотрудничайте с нами и развивайте свой бизнес',
    en: 'Partner with us and grow your business'
  },
  'about.contact_info': {
    uz: 'Bog\'lanish ma\'lumotlari',
    ru: 'Контактная информация',
    en: 'Contact Information'
  },

  // Contact additional translations
  'contact.our_services': {
    uz: 'Bizning xizmatlarimiz',
    ru: 'Наши услуги',
    en: 'Our Services'
  },
  'contact.services_desc': {
    uz: 'Biz sizga to\'liq xizmat ko\'rsatamiz',
    ru: 'Мы предоставляем вам полный спектр услуг',
    en: 'We provide you with a full range of services'
  },
  'contact.free_consultation': {
    uz: 'Bepul maslahat',
    ru: 'Бесплатная консультация',
    en: 'Free Consultation'
  },
  'contact.free_consultation_desc': {
    uz: 'Mutaxassislarimizdan bepul maslahat oling',
    ru: 'Получите бесплатную консультацию от наших специалистов',
    en: 'Get free consultation from our specialists'
  },
  'contact.free_measurement': {
    uz: 'Bepul o\'lchash',
    ru: 'Бесплатный замер',
    en: 'Free Measurement'
  },
  'contact.free_measurement_desc': {
    uz: 'Uyingizga bepul o\'lchash xizmati',
    ru: 'Бесплатная услуга замера на дому',
    en: 'Free home measurement service'
  },
  'contact.fast_installation': {
    uz: 'Tez o\'rnatish',
    ru: 'Быстрая установка',
    en: 'Fast Installation'
  },
  'contact.fast_installation_desc': {
    uz: 'Professional o\'rnatish xizmati',
    ru: 'Профессиональная услуга установки',
    en: 'Professional installation service'
  },
  'contact.address': {
    uz: 'Manzil',
    ru: 'Адрес',
    en: 'Address'
  },
  'contact.address_detail': {
    uz: 'Toshkent shahar, Chilonzor tumani',
    ru: 'Город Ташкент, Чиланзарский район',
    en: 'Tashkent city, Chilanzar district'
  },
  'contact.working_hours': {
    uz: 'Ish vaqti',
    ru: 'Время работы',
    en: 'Working Hours'
  },
  'contact.back_to_product': {
    uz: 'Mahsulotga qaytish',
    ru: 'Вернуться к товару',
    en: 'Back to Product'
  },
  'contact.cart_items': {
    uz: 'Korzinkadagi mahsulotlar',
    ru: 'Товары в корзине',
    en: 'Cart Items'
  },
  'contact.selected_product': {
    uz: 'Tanlangan mahsulot',
    ru: 'Выбранный товар',
    en: 'Selected Product'
  },
  'contact.dimensions': {
    uz: 'O\'lcham',
    ru: 'Размер',
    en: 'Dimensions'
  },
  'contact.color': {
    uz: 'Rang',
    ru: 'Цвет',
    en: 'Color'
  },
  'contact.quantity': {
    uz: 'Miqdor',
    ru: 'Количество',
    en: 'Quantity'
  },
  'contact.total': {
    uz: 'Jami',
    ru: 'Итого',
    en: 'Total'
  },
  'contact.material': {
    uz: 'Material',
    ru: 'Материал',
    en: 'Material'
  },
  'contact.security': {
    uz: 'Xavfsizlik',
    ru: 'Безопасность',
    en: 'Security'
  },
  'contact.price': {
    uz: 'Narx',
    ru: 'Цена',
    en: 'Price'
  },
  'contact.order_form': {
    uz: 'Buyurtma formasi',
    ru: 'Форма заказа',
    en: 'Order Form'
  },
  'contact.name_placeholder': {
    uz: 'Ismingiz',
    ru: 'Ваше имя',
    en: 'Your Name'
  },
  'contact.phone_placeholder': {
    uz: 'Telefon raqamingiz',
    ru: 'Ваш номер телефона',
    en: 'Your Phone Number'
  },
  'contact.email_placeholder': {
    uz: 'Email manzilingiz',
    ru: 'Ваш email адрес',
    en: 'Your Email Address'
  },
  'contact.delivery_address_placeholder': {
    uz: 'Yetkazib berish manzili',
    ru: 'Адрес доставки',
    en: 'Delivery Address'
  },
  'contact.sending': {
    uz: 'Yuborilmoqda...',
    ru: 'Отправка...',
    en: 'Sending...'
  },
  'contact.place_order': {
    uz: 'Buyurtma berish',
    ru: 'Разместить заказ',
    en: 'Place Order'
  },
  'contact.send_message': {
    uz: 'Xabar yuborish',
    ru: 'Отправить сообщение',
    en: 'Send Message'
  },
  'contact.address_street': {
    uz: 'Bunyodkor ko\'chasi, 1-uy',
    ru: 'Улица Бунёдкор, дом 1',
    en: 'Bunyodkor street, house 1'
  },
  'contact.working_hours_weekdays': {
    uz: 'Dushanba - Shanba: 9:00 - 19:00',
    ru: 'Понедельник - Суббота: 9:00 - 19:00',
    en: 'Monday - Saturday: 9:00 - 19:00'
  },
  'contact.working_hours_weekend': {
    uz: 'Yakshanba: 10:00 - 17:00',
    ru: 'Воскресенье: 10:00 - 17:00',
    en: 'Sunday: 10:00 - 17:00'
  },
  'contact.telegram_handle': {
    uz: '@eurodoor_uz',
    ru: '@eurodoor_uz',
    en: '@eurodoor_uz'
  },
  'contact.instagram_handle': {
    uz: '@eurodoor.uz',
    ru: '@eurodoor.uz',
    en: '@eurodoor.uz'
  },
  'contact.email_address': {
    uz: 'info@eurodoor.uz',
    ru: 'info@eurodoor.uz',
    en: 'info@eurodoor.uz'
  },
  'contact.product_placeholder': {
    uz: 'Mahsulot haqida qo\'shimcha ma\'lumot',
    ru: 'Дополнительная информация о продукте',
    en: 'Additional product information'
  },
  'contact.message_placeholder': {
    uz: 'Xabaringizni yozing...',
    ru: 'Напишите ваше сообщение...',
    en: 'Write your message...'
  },
  'contact.send_button': {
    uz: 'Xabar yuborish',
    ru: 'Отправить сообщение',
    en: 'Send Message'
  },

  // Product Detail Page
  'product.back_to_catalog': {
    uz: 'Katalogga qaytish',
    ru: 'Вернуться в каталог',
    en: 'Back to Catalog'
  },
  'product.price': {
    uz: 'Narx',
    ru: 'Цена',
    en: 'Price'
  },
  'product.ask_for_price': {
    uz: 'Narxni so\'rang',
    ru: 'Узнать цену',
    en: 'Ask for Price'
  },
  'product.contact_for_price': {
    uz: 'Narx uchun aloqa qiling',
    ru: 'Свяжитесь для цены',
    en: 'Contact for Price'
  },
  'product.technical_specs': {
    uz: 'Texnik xususiyatlar',
    ru: 'Технические характеристики',
    en: 'Technical Specifications'
  },
  'product.material': {
    uz: 'Material',
    ru: 'Материал',
    en: 'Material'
  },
  'product.security': {
    uz: 'Xavfsizlik',
    ru: 'Безопасность',
    en: 'Security'
  },
  'product.dimensions': {
    uz: 'O\'lchamlar',
    ru: 'Размеры',
    en: 'Dimensions'
  },
  'product.thickness': {
    uz: 'Qalinlik',
    ru: 'Толщина',
    en: 'Thickness'
  },
  'product.lock': {
    uz: 'Qulf',
    ru: 'Замок',
    en: 'Lock'
  },
  'product.features': {
    uz: 'Xususiyatlar',
    ru: 'Особенности',
    en: 'Features'
  },
  'product.galvanized_body': {
    uz: 'Galvanizlangan korpus',
    ru: 'Оцинкованный корпус',
    en: 'Galvanized Body'
  },
  'product.heat_sound_insulation': {
    uz: 'Issiqlik va tovush izolyatsiyasi',
    ru: 'Тепло- и звукоизоляция',
    en: 'Heat and Sound Insulation'
  },
  'product.uv_resistant_paint': {
    uz: 'UV chidamli bo\'yoq',
    ru: 'УФ-стойкая краска',
    en: 'UV Resistant Paint'
  },
  'product.add_to_cart': {
    uz: 'Korzinkaga qo\'shish',
    ru: 'Добавить в корзину',
    en: 'Add to Cart'
  },
  'product.quantity': {
    uz: 'Miqdor:',
    ru: 'Количество:',
    en: 'Quantity:'
  },
  'product.size': {
    uz: 'O\'lcham:',
    ru: 'Размер:',
    en: 'Size:'
  },
  'product.color': {
    uz: 'Rang:',
    ru: 'Цвет:',
    en: 'Color:'
  },
  'product.standard_size': {
    uz: 'Standart o\'lcham',
    ru: 'Стандартный размер',
    en: 'Standard size'
  },
  'product.standard_color': {
    uz: 'Standart rang',
    ru: 'Стандартный цвет',
    en: 'Standard color'
  },
  'product.custom_size': {
    uz: 'Boshqa o\'lcham',
    ru: 'Другой размер',
    en: 'Custom size'
  },
  'product.size_placeholder': {
    uz: 'Masalan: 1900x750',
    ru: 'Например: 1900x750',
    en: 'Example: 1900x750'
  },
  'product.color_white': {
    uz: 'Oq',
    ru: 'Белый',
    en: 'White'
  },
  'product.color_black': {
    uz: 'Qora',
    ru: 'Черный',
    en: 'Black'
  },
  'product.color_gray': {
    uz: 'Kulrang',
    ru: 'Серый',
    en: 'Gray'
  },
  'product.color_brown': {
    uz: 'Jigarrang',
    ru: 'Коричневый',
    en: 'Brown'
  },
  'home.why_eurodoor': {
    uz: 'Nima uchun Eurodoor?',
    ru: 'Почему Eurodoor?',
    en: 'Why Eurodoor?'
  },
  'home.experience_text': {
    uz: 'Bizning tajribamiz va sifatimiz bilan eshiklar olamida yangi standartlar o\'rnatamiz',
    ru: 'Мы устанавливаем новые стандарты в мире дверей с нашим опытом и качеством',
    en: 'We set new standards in the world of doors with our experience and quality'
  }
};

interface LanguageContextType {
  language: Language;
  t: (key: string) => string;
  changeLanguage: (newLanguage: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguage] = useState<Language>('uz');

  useEffect(() => {
    // localStorage dan tilni olish
    const savedLanguage = localStorage.getItem('selectedLanguage') as Language;
    if (savedLanguage && ['uz', 'ru', 'en'].includes(savedLanguage)) {
      setLanguage(savedLanguage);
    } else {
      // Default til
      setLanguage('uz');
    }
  }, []);

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  const changeLanguage = (newLanguage: Language) => {
    // Til o'zgarishi uchun localStorage ga saqlash
    localStorage.setItem('selectedLanguage', newLanguage);
    
    // Tilni darhol o'zgartirish
    setLanguage(newLanguage);
    
    // Sahifani qayta yuklash emas, faqat til o'zgaradi
    console.log('Language changed to:', newLanguage);
  };

  const value = {
    language,
    t,
    changeLanguage
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
