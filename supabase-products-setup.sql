-- Supabase da mahsulotlar jadvalini yaratish
-- Bu faylni Supabase SQL Editor da ishga tushiring

-- Mahsulotlar jadvalini yaratish
CREATE TABLE IF NOT EXISTS products (
  id VARCHAR PRIMARY KEY,
  name VARCHAR NOT NULL,
  name_ru VARCHAR,
  name_en VARCHAR,
  image VARCHAR,
  material VARCHAR NOT NULL,
  material_ru VARCHAR,
  material_en VARCHAR,
  security VARCHAR NOT NULL,
  security_ru VARCHAR,
  security_en VARCHAR,
  dimensions VARCHAR NOT NULL,
  description TEXT,
  description_ru TEXT,
  description_en TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index yaratish (tez qidiruv uchun)
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_material ON products(material);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);

-- RLS (Row Level Security) yoqish
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Barcha foydalanuvchilar o'qishi mumkin (public read)
CREATE POLICY "Products are viewable by everyone" ON products
  FOR SELECT USING (true);

-- Faqat authenticated foydalanuvchilar yozishi mumkin (admin uchun)
CREATE POLICY "Products are insertable by authenticated users" ON products
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Faqat authenticated foydalanuvchilar yangilashi mumkin
CREATE POLICY "Products are updatable by authenticated users" ON products
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Faqat authenticated foydalanuvchilar o'chirishi mumkin
CREATE POLICY "Products are deletable by authenticated users" ON products
  FOR DELETE USING (auth.role() = 'authenticated');

-- updated_at avtomatik yangilanishi uchun trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at 
  BEFORE UPDATE ON products 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Test ma'lumotlari (ixtiyoriy)
INSERT INTO products (
  id, 
  name, 
  name_ru, 
  name_en, 
  image, 
  material, 
  material_ru, 
  material_en, 
  security, 
  security_ru, 
  security_en, 
  dimensions, 
  description, 
  description_ru, 
  description_en
) VALUES (
  'euro-model-test',
  'EURO Model Test',
  'EURO Модель Тест',
  'EURO Model Test',
  'https://iili.io/KqcGK21.jpg',
  'Metall + MDF',
  'Металл + МДФ',
  'Metal + MDF',
  'A+ sinf',
  'Класс A+',
  'Class A+',
  '2050x860mm + 2050x960mm + 100mm',
  'Test mahsulot tavsifi',
  'Описание тестового продукта',
  'Test product description'
) ON CONFLICT (id) DO NOTHING;

-- Jadval ma'lumotlarini ko'rish
SELECT * FROM products ORDER BY created_at DESC;
