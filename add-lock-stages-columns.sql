-- Qulf bosqichlari uchun ustunlar qo'shish
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS lock_stages TEXT,
ADD COLUMN IF NOT EXISTS lock_stages_ru TEXT,
ADD COLUMN IF NOT EXISTS lock_stages_en TEXT;

-- Eski description ustunlarini o'chirish (agar kerak bo'lsa)
-- ALTER TABLE products DROP COLUMN IF EXISTS description;
-- ALTER TABLE products DROP COLUMN IF EXISTS description_ru;
-- ALTER TABLE products DROP COLUMN IF EXISTS description_en;
