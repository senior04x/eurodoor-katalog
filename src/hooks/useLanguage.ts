import { useState, useEffect } from 'react';

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
  'home.experience_text': {
    uz: 'Ko\'p yillik tajriba va zamonaviy texnologiyalar asosida ishlab chiqarilgan eshiklar',
    ru: 'Двери, изготовленные на основе многолетнего опыта и современных технологий',
    en: 'Doors manufactured based on years of experience and modern technologies'
  },
  'home.free_consultation': {
    uz: 'Bepul maslahat va o\'lchash xizmati',
    ru: 'Бесплатная консультация и услуга измерения',
    en: 'Free consultation and measurement service'
  },
  'home.why_eurodoor': {
    uz: 'Nima uchun EURODOOR?',
    ru: 'Почему EURODOOR?',
    en: 'Why EURODOOR?'
  },
  'home.specialists_help': {
    uz: 'Mutaxassislarimiz sizga eng mos keluvchi eshikni tanlashda yordam beradi',
    ru: 'Наши специалисты помогут вам выбрать наиболее подходящую дверь',
    en: 'Our specialists will help you choose the most suitable door'
  },
  
  // Catalog
  'catalog.iron_doors': {
    uz: 'Temir eshiklar',
    ru: 'Железные двери',
    en: 'Iron doors'
  },
  'catalog.mdf_doors': {
    uz: 'MDF eshiklar',
    ru: 'MDF двери',
    en: 'MDF doors'
  },
  'catalog.material': {
    uz: 'Material',
    ru: 'Материал',
    en: 'Material'
  },
  'catalog.security': {
    uz: 'Xavfsizlik',
    ru: 'Безопасность',
    en: 'Security'
  },
  'catalog.dimensions': {
    uz: 'O\'lchamlar',
    ru: 'Размеры',
    en: 'Dimensions'
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
  
  // About
  'about.title': {
    uz: 'Biz haqimizda',
    ru: 'О нас',
    en: 'About Us'
  },
  'about.description': {
    uz: 'Eurodoor - Toshkentda temir va MDF eshiklar ishlab chiqarish va sotish bo\'yicha yetakchi kompaniya.',
    ru: 'Eurodoor - ведущая компания по производству и продаже железных и MDF дверей в Ташкенте.',
    en: 'Eurodoor - leading company in manufacturing and selling iron and MDF doors in Tashkent.'
  },
  'about.experience': {
    uz: 'Yillik tajriba',
    ru: 'Лет опыта',
    en: 'Years of experience'
  },
  'about.customers': {
    uz: 'Mamnun mijozlar',
    ru: 'Довольных клиентов',
    en: 'Satisfied customers'
  },
  'about.models': {
    uz: 'Eshik modellari',
    ru: 'Моделей дверей',
    en: 'Door models'
  },
  'about.quality': {
    uz: 'Sifat kafolati',
    ru: 'Гарантия качества',
    en: 'Quality guarantee'
  },
  'about.gost_cert': {
    uz: 'GOST sertifikati',
    ru: 'Сертификат ГОСТ',
    en: 'GOST certificate'
  },
  'about.ce_mark': {
    uz: 'CE belgisi',
    ru: 'Маркировка CE',
    en: 'CE marking'
  },
  'about.fire_cert': {
    uz: 'Yong\'indan himoya sertifikati',
    ru: 'Сертификат пожарной безопасности',
    en: 'Fire safety certificate'
  },
  'about.mission': {
    uz: 'Bizning missiyamiz',
    ru: 'Наша миссия',
    en: 'Our Mission'
  },
  'about.mission_text': {
    uz: 'EURODOOR kompaniyasi sifatida biz har bir uyning xavfsizligini ta\'minlash uchun eng zamonaviy texnologiyalar va yuqori sifatli materiallardan foydalanamiz.',
    ru: 'Как компания EURODOOR, мы используем самые современные технологии и высококачественные материалы для обеспечения безопасности каждого дома.',
    en: 'As EURODOOR company, we use the most modern technologies and high-quality materials to ensure the security of every home.'
  },
  'about.factory_alt': {
    uz: 'EURODOOR zavodi',
    ru: 'Завод EURODOOR',
    en: 'EURODOOR factory'
  },
  'about.doors_description': {
    uz: 'Bizning eshiklarimiz faqat ko\'cha tarafga mo\'ljallangan bo\'lib, xavfsizlik va estetik ko\'rinishni mukammal tarzda birlashtiradi. Har bir mahsulot alohida e\'tibor bilan tayyorlanadi va qat\'iy sifat nazoratidan o\'tadi.',
    ru: 'Наши двери предназначены только для уличной стороны, идеально сочетая безопасность и эстетический вид. Каждый продукт изготавливается с особым вниманием и проходит строгий контроль качества.',
    en: 'Our doors are designed only for the street side, perfectly combining security and aesthetic appearance. Each product is manufactured with special attention and undergoes strict quality control.'
  },
  'about.highest_security': {
    uz: 'Eng yuqori xavfsizlik standartlari',
    ru: 'Высшие стандарты безопасности',
    en: 'Highest security standards'
  },
  'about.international_standards': {
    uz: 'Bizning barcha mahsulotlarimiz xalqaro standartlarga javob beradi va tegishli sertifikatlarga ega',
    ru: 'Все наши продукты соответствуют международным стандартам и имеют соответствующие сертификаты',
    en: 'All our products meet international standards and have appropriate certificates'
  },
  'about.partnership': {
    uz: 'Biz bilan hamkorlik qiling',
    ru: 'Сотрудничайте с нами',
    en: 'Partner with us'
  },
  'about.partnership_desc': {
    uz: 'Professional maslahat va eng yaxshi eshiklarni tanlash uchun mutaxassislarimiz bilan bog\'laning',
    ru: 'Свяжитесь с нашими специалистами для профессиональной консультации и выбора лучших дверей',
    en: 'Contact our specialists for professional advice and selection of the best doors'
  },
  'about.customer_needs': {
    uz: 'Mijozlar ehtiyojlarini tushunish va ularga eng yaxshi yechimlarni taklif qilish bizning asosiy tamoyilimizdir.',
    ru: 'Понимание потребностей клиентов и предложение им лучших решений - наш основной принцип.',
    en: 'Understanding customer needs and offering them the best solutions is our main principle.'
  },
  'about.security': {
    uz: 'Xavfsizlik',
    ru: 'Безопасность',
    en: 'Security'
  },
  'about.certificates_standards': {
    uz: 'Sertifikatlar va standartlar',
    ru: 'Сертификаты и стандарты',
    en: 'Certificates and Standards'
  },
  'about.contact_info': {
    uz: 'Aloqa ma\'lumotlari',
    ru: 'Контактная информация',
    en: 'Contact Information'
  },
  
  // App
  'app.promotions': {
    uz: 'Chegirma Mahsulotlar',
    ru: 'Товары со скидкой',
    en: 'Promotional Products'
  },
  'app.coming_soon': {
    uz: 'Tez orada...',
    ru: 'Скоро...',
    en: 'Coming soon...'
  },
  
  // Catalog
  'catalog.title': {
    uz: 'Eshiklar katalogi',
    ru: 'Каталог дверей',
    en: 'Door Catalog'
  },
  'catalog.description': {
    uz: 'Yuqori sifatli Metall va MDF eshiklarimiz bilan tanishing. Har bir model maxsus texnologiya asosida ishlab chiqarilgan.',
    ru: 'Ознакомьтесь с нашими высококачественными металлическими и МДФ дверями. Каждая модель изготовлена на основе специальных технологий.',
    en: 'Get acquainted with our high-quality Metal and MDF doors. Each model is manufactured based on special technologies.'
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
  'catalog.material_metall_metall': {
    uz: 'Metall + Metall',
    ru: 'Металл + Металл',
    en: 'Metal + Metal'
  },
  'catalog.material_metall_mdf_oyna': {
    uz: 'Metall + MDF + Oyna',
    ru: 'Металл + МДФ + Стекло',
    en: 'Metal + MDF + Glass'
  },
  'catalog.material_metall_kompozit': {
    uz: 'Metall + Kompozit',
    ru: 'Металл + Композит',
    en: 'Metal + Composite'
  },
  'catalog.material_other': {
    uz: 'Boshqa',
    ru: 'Другое',
    en: 'Other'
  },
  'catalog.size_2050_series': {
    uz: '2050 mm seriya',
    ru: 'Серия 2050 мм',
    en: '2050 mm series'
  },
  'catalog.size_2300_series': {
    uz: '2300 mm seriya',
    ru: 'Серия 2300 мм',
    en: '2300 mm series'
  },
  'catalog.size_2100_series': {
    uz: '2100 mm seriya',
    ru: 'Серия 2100 мм',
    en: '2100 mm series'
  },
  'catalog.size_other': {
    uz: 'Boshqa o\'lcham',
    ru: 'Другой размер',
    en: 'Other size'
  },
  
  // Product Detail
  'product.back_to_catalog': {
    uz: 'Katalogga qaytish',
    ru: 'Вернуться в каталог',
    en: 'Back to catalog'
  },
  'product.technical_drawing': {
    uz: 'Texnik chizma',
    ru: 'Технический чертеж',
    en: 'Technical drawing'
  },
  'product.key_features': {
    uz: 'Asosiy xususiyatlar',
    ru: 'Основные характеристики',
    en: 'Key Features'
  },
  'product.technical_specs': {
    uz: 'Texnik xususiyatlar',
    ru: 'Технические характеристики',
    en: 'Technical Specifications'
  },
  'product.installation_tips': {
    uz: 'O\'rnatish bo\'yicha tavsiyalar',
    ru: 'Рекомендации по установке',
    en: 'Installation Recommendations'
  },
  'product.ask_price': {
    uz: 'Narx so\'rang',
    ru: 'Узнать цену',
    en: 'Ask for price'
  },
  'product.professional_installation': {
    uz: 'Professional o\'rnatish xizmati mavjud',
    ru: 'Доступна профессиональная услуга установки',
    en: 'Professional installation service available'
  },
  'product.installation_time': {
    uz: 'O\'rnatish 2-3 soat davom etadi',
    ru: 'Установка занимает 2-3 часа',
    en: 'Installation takes 2-3 hours'
  },
  'product.all_equipment': {
    uz: 'Barcha kerakli jihozlar ta\'minlanadi',
    ru: 'Предоставляется все необходимое оборудование',
    en: 'All necessary equipment is provided'
  },
  'product.installation_warranty': {
    uz: '1 yillik o\'rnatish kafolati',
    ru: '1 год гарантии на установку',
    en: '1 year installation warranty'
  },
  'product.order_button': {
    uz: 'Ushbu {productName} ga buyurtma berish',
    ru: 'Заказать {productName}',
    en: 'Order {productName}'
  },
  
  // Product Data Translations
  'product.modern_design': {
    uz: 'Zamonaviy dizaynli metall eshik, ichki qismi yuqori sifatli MDF qoplama bilan.',
    ru: 'Современная металлическая дверь с высококачественным МДФ покрытием внутренней части.',
    en: 'Modern metal door with high-quality MDF coating on the inner part.'
  },
  'product.galvanized_corpus': {
    uz: 'Galvanizatsiyalangan metall korpus',
    ru: 'Оцинкованный металлический корпус',
    en: 'Galvanized metal body'
  },
  'product.inner_mdf_panel': {
    uz: 'Ichki MDF panel',
    ru: 'Внутренняя МДФ панель',
    en: 'Inner MDF panel'
  },
  'product.three_point_lock': {
    uz: '3-nuqtali qulflash tizimi',
    ru: '3-точечная система запирания',
    en: '3-point locking system'
  },
  'product.heat_sound_insulation': {
    uz: 'Issiqlik va shovqin izolyatsiyasi',
    ru: 'Тепло- и звукоизоляция',
    en: 'Heat and sound insulation'
  },
  'product.uv_resistant_paint': {
    uz: 'UVga chidamli bo\'yoq',
    ru: 'УФ-стойкая краска',
    en: 'UV-resistant paint'
  },
  'product.material': {
    uz: 'Material',
    ru: 'Материал',
    en: 'Material'
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
  'product.hinges': {
    uz: 'Ilgaklar',
    ru: 'Петли',
    en: 'Hinges'
  },
  'product.insulation': {
    uz: 'Izolyatsiya',
    ru: 'Изоляция',
    en: 'Insulation'
  },
  'product.warranty': {
    uz: 'Kafolat',
    ru: 'Гарантия',
    en: 'Warranty'
  },
  'product.glass': {
    uz: 'Shisha',
    ru: 'Стекло',
    en: 'Glass'
  },
  'product.dimensions': {
    uz: 'O\'lchamlar',
    ru: 'Размеры',
    en: 'Dimensions'
  },
  'product.size': {
    uz: 'O\'lcham',
    ru: 'Размер',
    en: 'Size'
  },
  'product.metal_mdf_decor': {
    uz: 'Metall korpus, MDF va oyna dekor bilan uyg\'unlashgan model.',
    ru: 'Модель, сочетающая металлический корпус с МДФ и стеклянным декором.',
    en: 'Model combining metal body with MDF and glass decor.'
  },
  'product.mdf_glass_decor_panels': {
    uz: 'MDF + oyna dekor panellari',
    ru: 'МДФ + стеклянные декоративные панели',
    en: 'MDF + glass decor panels'
  },
  'product.improved_insulation': {
    uz: 'Yaxshilangan izolyatsiya',
    ru: 'Улучшенная изоляция',
    en: 'Improved insulation'
  },
  'product.scratch_resistant_coating': {
    uz: 'Chizilishga chidamli qoplama',
    ru: 'Стойкое к царапинам покрытие',
    en: 'Scratch-resistant coating'
  },
  'product.professional_installation_option': {
    uz: 'Professional montaj imkoniyati',
    ru: 'Возможность профессиональной установки',
    en: 'Professional installation option'
  },
  'product.tempered_glass': {
    uz: 'Temirlangan (tempered)',
    ru: 'Закаленное (tempered)',
    en: 'Tempered (tempered)'
  },
  'product.classic_style': {
    uz: 'Klassik uslubdagi metall eshik, oyna elementlari bilan bezatilgan.',
    ru: 'Металлическая дверь в классическом стиле, украшенная стеклянными элементами.',
    en: 'Classic style metal door decorated with glass elements.'
  },
  'product.classic_panel_design': {
    uz: 'Klassik panelli dizayn',
    ru: 'Классический панельный дизайн',
    en: 'Classic panel design'
  },
  'product.glass_decor': {
    uz: 'Oyna dekor',
    ru: 'Стеклянный декор',
    en: 'Glass decor'
  },
  'product.light_transmission': {
    uz: 'Yorug\'lik tushirish imkoniyati',
    ru: 'Возможность пропускания света',
    en: 'Light transmission capability'
  },
  'product.aesthetic_appearance': {
    uz: 'Estetik ko\'rinish',
    ru: 'Эстетический вид',
    en: 'Aesthetic appearance'
  },
  'product.tempered': {
    uz: 'Temirlangan',
    ru: 'Закаленное',
    en: 'Tempered'
  },
  'product.designer_style': {
    uz: 'Designer uslubidagi eshik, MDF dekor elementlari bilan.',
    ru: 'Дверь в дизайнерском стиле с МДФ декоративными элементами.',
    en: 'Designer style door with MDF decorative elements.'
  },
  'product.high_strength_metal_plate': {
    uz: 'Yuqori mustahkam metall plita',
    ru: 'Высокопрочная металлическая плита',
    en: 'High-strength metal plate'
  },
  'product.mdf_decor_panels': {
    uz: 'MDF dekor panellari',
    ru: 'МДФ декоративные панели',
    en: 'MDF decor panels'
  },
  'product.corrosion_resistant_coating': {
    uz: 'Korroziv muhitga chidamli qoplama',
    ru: 'Коррозионностойкое покрытие',
    en: 'Corrosion-resistant coating'
  },
  'product.highest_security_design': {
    uz: 'Eng yuqori darajadagi xavfsizlik va dizayn uyg\'unligi.',
    ru: 'Сочетание высочайшего уровня безопасности и дизайна.',
    en: 'Combination of highest level security and design.'
  },
  'product.thick_metal_layer': {
    uz: 'Qalin metall qatlam',
    ru: 'Толстый металлический слой',
    en: 'Thick metal layer'
  },
  'product.mdf_inner_coating': {
    uz: 'MDF ichki qoplama',
    ru: 'МДФ внутреннее покрытие',
    en: 'MDF inner coating'
  },
  'product.four_point_lock': {
    uz: '3–4 nuqtali qulflash tizimi',
    ru: '3–4 точечная система запирания',
    en: '3–4 point locking system'
  },
  'product.sound_absorbing_layer': {
    uz: 'Tovushni yutuvchi qatlam',
    ru: 'Звукопоглощающий слой',
    en: 'Sound absorbing layer'
  },
  'product.large_size_variant': {
    uz: 'Katta o\'lcham varianti',
    ru: 'Вариант большого размера',
    en: 'Large size variant'
  },
  'product.mineral_cotton_pu_filler': {
    uz: 'Mineral paxta/PU to\'ldiruvchi',
    ru: 'Минеральная вата/ПУ наполнитель',
    en: 'Mineral cotton/PU filler'
  },
  
  // Catalog Product Descriptions
  'catalog.product1_desc': {
    uz: 'Zamonaviy dizaynli Metall eshik ichki MDF qoplama bilan',
    ru: 'Современная металлическая дверь с внутренней отделкой МДФ',
    en: 'Modern design Metal door with internal MDF coating'
  },
  'catalog.product2_desc': {
    uz: 'Zamonaviy dizaynli Metall eshik ichki MDF + Oyna qoplama bilan',
    ru: 'Современная металлическая дверь с внутренней отделкой МДФ + Стекло',
    en: 'Modern design Metal door with internal MDF + Glass coating'
  },
  'catalog.product3_desc': {
    uz: 'Klassik uslubdagi Metall eshik Oyna elementlar bilan',
    ru: 'Металлическая дверь в классическом стиле со стеклянными элементами',
    en: 'Classic style Metal door with Glass elements'
  },
  'catalog.product4_desc': {
    uz: 'Designer uslubidagi eshik MDF dekor elementlari bilan',
    ru: 'Дверь в дизайнерском стиле с МДФ декоративными элементами',
    en: 'Designer style door with MDF decorative elements'
  },
  'catalog.product5_desc': {
    uz: 'Eng yuqori darajadagi xavfsizlik va dizayn',
    ru: 'Высочайший уровень безопасности и дизайна',
    en: 'Highest level of security and design'
  },
  'catalog.product6_desc': {
    uz: 'Hashamatli dizayn va MDF materiallar va Elektron quluf',
    ru: 'Элегантный дизайн и МДФ материалы с электронным замком',
    en: 'Elegant design and MDF materials with Electronic lock'
  },
  'catalog.product7_desc': {
    uz: 'Zamonaviy kompozit materiallar bilan ishlangan eshik',
    ru: 'Дверь, изготовленная из современных композитных материалов',
    en: 'Door made with modern composite materials'
  },
  'catalog.product8_desc': {
    uz: 'Elite darajadagi xavfsizlik va dizayn',
    ru: 'Элитный уровень безопасности и дизайна',
    en: 'Elite level of security and design'
  },
  'catalog.product9_desc': {
    uz: 'Klassik va zamonaviy elementlarni birlashtirgan eshik',
    ru: 'Дверь, сочетающая классические и современные элементы',
    en: 'Door combining classic and modern elements'
  },
  'catalog.product10_desc': {
    uz: 'Ijrochi darajadagi xavfsizlik va hashamat',
    ru: 'Исполнительский уровень безопасности и элегантности',
    en: 'Executive level of security and elegance'
  },
  'catalog.product11_desc': {
    uz: 'Eng yuqori darajadagi xavfsizlik va dizayn',
    ru: 'Высочайший уровень безопасности и дизайна',
    en: 'Highest level of security and design'
  },
  'catalog.opening': {
    uz: 'Ochilmoqda…',
    ru: 'Открывается…',
    en: 'Opening…'
  },
  'catalog.view_details': {
    uz: 'Batafsil ko\'rish',
    ru: 'Подробнее',
    en: 'View Details'
  },
  
  // Contact
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
  'contact.phone': {
    uz: 'Telefon',
    ru: 'Телефон',
    en: 'Phone'
  },
  'contact.address': {
    uz: 'Manzil',
    ru: 'Адрес',
    en: 'Address'
  },
  'contact.email': {
    uz: 'Email',
    ru: 'Email',
    en: 'Email'
  },
  'contact.working_hours': {
    uz: 'Ish vaqti',
    ru: 'Время работы',
    en: 'Working Hours'
  },
  'contact.form_name': {
    uz: 'Ism',
    ru: 'Имя',
    en: 'Name'
  },
  'contact.form_phone': {
    uz: 'Telefon raqami',
    ru: 'Номер телефона',
    en: 'Phone Number'
  },
  'contact.form_product': {
    uz: 'Mahsulot turi',
    ru: 'Тип продукта',
    en: 'Product Type'
  },
  'contact.form_message': {
    uz: 'Xabar',
    ru: 'Сообщение',
    en: 'Message'
  },
  'contact.form_submit': {
    uz: 'Yuborish',
    ru: 'Отправить',
    en: 'Submit'
  },
  'contact.form_success': {
    uz: 'Sizning so\'rovingiz qabul qilindi! Tez orada aloqaga chiqamiz.',
    ru: 'Ваш запрос принят! Мы свяжемся с вами в ближайшее время.',
    en: 'Your request has been received! We will contact you soon.'
  },
  'contact.contact_info': {
    uz: 'Bog\'lanish ma\'lumotlari',
    ru: 'Контактная информация',
    en: 'Contact Information'
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
  'contact.address_detail': {
    uz: 'Chilonzor tumani, Toshkent <br /> Tirsakobod mahalla fuqarolar yigʻini',
    ru: 'Чиланзарский район, Ташкент <br /> Махалля гражданского собрания Тирсакобод',
    en: 'Chilanzar district, Tashkent <br /> Tirsakobod neighborhood citizens assembly'
  },
  'contact.doors_tashkent': {
    uz: 'Eshiklar Toshkentda',
    ru: 'Двери в Ташкенте',
    en: 'Doors in Tashkent'
  },
  'contact.selected_product': {
    uz: 'Tanlangan mahsulot',
    ru: 'Выбранный продукт',
    en: 'Selected Product'
  },
  'contact.product_material': {
    uz: 'Material',
    ru: 'Материал',
    en: 'Material'
  },
  'contact.product_security': {
    uz: 'Xavfsizlik',
    ru: 'Безопасность',
    en: 'Security'
  },
  'contact.product_dimensions': {
    uz: 'O\'lchamlar',
    ru: 'Размеры',
    en: 'Dimensions'
  },
  'contact.product_price': {
    uz: 'Narx',
    ru: 'Цена',
    en: 'Price'
  },
  'contact.order_title': {
    uz: 'Buyurtma berish',
    ru: 'Оформить заказ',
    en: 'Place Order'
  },
  'contact.order_description': {
    uz: 'Tanlangan mahsulot uchun buyurtma berish uchun ma\'lumotlaringizni qoldiring',
    ru: 'Оставьте свои данные для заказа выбранного продукта',
    en: 'Leave your details to order the selected product'
  },
  'contact.order_form': {
    uz: 'Buyurtma formasi',
    ru: 'Форма заказа',
    en: 'Order Form'
  },
  'contact.contact_form': {
    uz: 'Aloqa formasi',
    ru: 'Форма связи',
    en: 'Contact Form'
  },
  'contact.order_button': {
    uz: 'Buyurtma berish',
    ru: 'Оформить заказ',
    en: 'Place Order'
  },
  'contact.send_button': {
    uz: 'Xabar yuborish',
    ru: 'Отправить сообщение',
    en: 'Send Message'
  },
  'contact.name_placeholder': {
    uz: '👤 Ismingizni kiriting',
    ru: '👤 Введите ваше имя',
    en: '👤 Enter your name'
  },
  'contact.phone_placeholder': {
    uz: '📱 Telefon raqamingizni kiriting',
    ru: '📱 Введите ваш номер телефона',
    en: '📱 Enter your phone number'
  },
  'contact.product_placeholder': {
    uz: '🏠 Qaysi mahsulot haqida so\'ramoqchisiz?',
    ru: '🏠 О каком продукте хотите узнать?',
    en: '🏠 Which product are you interested in?'
  },
  'contact.message_placeholder': {
    uz: '💬 Qo\'shimcha ma\'lumotlar yoki savollar...',
    ru: '💬 Дополнительная информация или вопросы...',
    en: '💬 Additional information or questions...'
  },
  'contact.back_to_product': {
    uz: 'Orqaga - mahsulotga qaytish',
    ru: 'Назад - к продукту',
    en: 'Back to product'
  },

  // Order Success Page
  'order.success_title': {
    uz: 'Zakaz muvaffaqiyatli berildi!',
    ru: 'Заказ успешно оформлен!',
    en: 'Order Successfully Placed!'
  },
  'order.success_message': {
    uz: 'Sizning zakazingiz qabul qilindi. Tez orada siz bilan bog\'lanamiz.',
    ru: 'Ваш заказ принят. Мы свяжемся с вами в ближайшее время.',
    en: 'Your order has been received. We will contact you soon.'
  },
  'order.order_info': {
    uz: 'Zakaz ma\'lumotlari',
    ru: 'Информация о заказе',
    en: 'Order Information'
  },
  'order.order_id': {
    uz: 'Zakaz raqami',
    ru: 'Номер заказа',
    en: 'Order ID'
  },
  'order.order_date': {
    uz: 'Zakaz sanasi',
    ru: 'Дата заказа',
    en: 'Order Date'
  },
  'order.status': {
    uz: 'Holat',
    ru: 'Статус',
    en: 'Status'
  },
  'order.status_new': {
    uz: 'Yangi',
    ru: 'Новый',
    en: 'New'
  },
  'order.customer_info': {
    uz: 'Mijoz ma\'lumotlari',
    ru: 'Информация о клиенте',
    en: 'Customer Information'
  },
  'order.customer_name': {
    uz: 'Ism',
    ru: 'Имя',
    en: 'Name'
  },
  'order.customer_phone': {
    uz: 'Telefon',
    ru: 'Телефон',
    en: 'Phone'
  },
  'order.customer_message': {
    uz: 'Xabar',
    ru: 'Сообщение',
    en: 'Message'
  },
  'order.product_info': {
    uz: 'Mahsulot ma\'lumotlari',
    ru: 'Информация о продукте',
    en: 'Product Information'
  },
  'order.product_name': {
    uz: 'Mahsulot nomi',
    ru: 'Название продукта',
    en: 'Product Name'
  },
  'order.product_material': {
    uz: 'Material',
    ru: 'Материал',
    en: 'Material'
  },
  'order.product_security': {
    uz: 'Xavfsizlik',
    ru: 'Безопасность',
    en: 'Security'
  },
  'order.product_dimensions': {
    uz: 'O\'lchamlar',
    ru: 'Размеры',
    en: 'Dimensions'
  },
  'order.product_price': {
    uz: 'Narx',
    ru: 'Цена',
    en: 'Price'
  },
  'order.thank_you': {
    uz: 'Rahmat! Sizning zakazingiz uchun minnatdormiz.',
    ru: 'Спасибо! Мы благодарны за ваш заказ.',
    en: 'Thank you! We appreciate your order.'
  },
  'order.contact_soon': {
    uz: 'Tez orada siz bilan bog\'lanamiz va batafsil ma\'lumot beramiz.',
    ru: 'Мы свяжемся с вами в ближайшее время и предоставим подробную информацию.',
    en: 'We will contact you soon and provide detailed information.'
  },
  'order.back_to_catalog': {
    uz: 'Katalogga qaytish',
    ru: 'Вернуться в каталог',
    en: 'Back to Catalog'
  },
  'order.back_to_home': {
    uz: 'Bosh sahifaga qaytish',
    ru: 'Вернуться на главную',
    en: 'Back to Home'
  },
  'contact.our_location': {
    uz: 'Bizning joylashuvimiz',
    ru: 'Наше местоположение',
    en: 'Our Location'
  },
  'contact.our_services': {
    uz: 'Bizning xizmatlarimiz',
    ru: 'Наши услуги',
    en: 'Our Services'
  },
  'contact.services_desc': {
    uz: 'Mahsulot tanlashdan tortib o\'rnatishgacha — barchasi bir joyda',
    ru: 'От выбора продукта до установки — все в одном месте',
    en: 'From product selection to installation — everything in one place'
  },
  'contact.free_consultation': {
    uz: 'Bepul maslahat',
    ru: 'Бесплатная консультация',
    en: 'Free Consultation'
  },
  'contact.free_consultation_desc': {
    uz: 'Mutaxassislarimiz sizga eng mos eshikni tanlashda yordam beradi',
    ru: 'Наши специалисты помогут вам выбрать наиболее подходящую дверь',
    en: 'Our specialists will help you choose the most suitable door'
  },
  'contact.free_measurement': {
    uz: 'Bepul o\'lchash',
    ru: 'Бесплатный замер',
    en: 'Free Measurement'
  },
  'contact.free_measurement_desc': {
    uz: 'Uyingizga borib, aniq o\'lchamlarni olamiz',
    ru: 'Приедем к вам домой и снимем точные размеры',
    en: 'We will come to your home and take accurate measurements'
  },
  'contact.fast_installation': {
    uz: 'Tez o\'rnatish',
    ru: 'Быстрая установка',
    en: 'Fast Installation'
  },
  'contact.fast_installation_desc': {
    uz: 'Professional jamoa tomonidan sifatli o\'rnatish',
    ru: 'Качественная установка профессиональной командой',
    en: 'Quality installation by professional team'
  },
  'home.contact_button': {
    uz: 'Aloqaga chiqish',
    ru: 'Связаться с нами',
    en: 'Contact Us'
  },
  
  // Loading states
  'loading.loading': {
    uz: 'Yuklanmoqda...',
    ru: 'Загрузка...',
    en: 'Loading...'
  },
  'loading.loading_products': {
    uz: 'Mahsulotlar yuklanmoqda...',
    ru: 'Загрузка продуктов...',
    en: 'Loading products...'
  },
  'loading.loading_product_details': {
    uz: 'Mahsulot ma\'lumotlari yuklanmoqda...',
    ru: 'Загрузка информации о продукте...',
    en: 'Loading product details...'
  },
  'loading.no_products': {
    uz: 'Mahsulotlar hali qo\'shilmagan',
    ru: 'Продукты еще не добавлены',
    en: 'No products added yet'
  },
  'loading.no_products_desc': {
    uz: 'Admin panel orqali yangi mahsulotlar qo\'shing va ular bu yerda ko\'rinadi',
    ru: 'Добавьте новые продукты через админ-панель, и они появятся здесь',
    en: 'Add new products through admin panel and they will appear here'
  },
  'loading.product_not_found': {
    uz: 'Mahsulot topilmadi',
    ru: 'Продукт не найден',
    en: 'Product not found'
  },
  'loading.product_not_found_desc': {
    uz: 'Bu mahsulot mavjud emas yoki o\'chirilgan bo\'lishi mumkin',
    ru: 'Этот продукт не существует или был удален',
    en: 'This product does not exist or has been deleted'
  }
};

export function useLanguage() {
  const [language, setLanguage] = useState<Language>('uz');

  useEffect(() => {
    // URL dan tilni olish
    const path = window.location.pathname;
    if (path.startsWith('/ru')) {
      setLanguage('ru');
    } else if (path.startsWith('/en')) {
      setLanguage('en');
    } else {
      setLanguage('uz');
    }
  }, []);

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  const changeLanguage = (newLanguage: Language) => {
    const currentPath = window.location.pathname;
    let newPath = '';
    
    // Joriy til prefiksini olib tashlash
    const pathWithoutLanguage = currentPath.replace(/^\/(ru|en)/, '') || '/';
    
    // Admin sahifasini saqlash
    if (pathWithoutLanguage === '/admin') {
      if (newLanguage === 'uz') {
        newPath = '/admin';
      } else {
        newPath = `/${newLanguage}/admin`;
      }
    } else {
      if (newLanguage === 'uz') {
        newPath = pathWithoutLanguage;
      } else {
        newPath = `/${newLanguage}${pathWithoutLanguage}`;
      }
    }
    
    // Til o'zgarishi uchun localStorage ga saqlash
    localStorage.setItem('selectedLanguage', newLanguage);
    
    // URL ni yangilash va sahifani qayta yuklash
    window.location.href = newPath;
  };

  return { language, t, changeLanguage };
}
