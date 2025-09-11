-- O'lchamlar uchun ustunlar qo'shish
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS dimensions_ru TEXT,
ADD COLUMN IF NOT EXISTS dimensions_en TEXT;

-- Mavjud ma'lumotlarni yangilash (agar kerak bo'lsa)
UPDATE products 
SET dimensions_ru = dimensions, 
    dimensions_en = dimensions 
WHERE dimensions_ru IS NULL OR dimensions_en IS NULL;
