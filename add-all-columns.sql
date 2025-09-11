-- Barcha kerakli ustunlarni qo'shish
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS lock_stages TEXT,
ADD COLUMN IF NOT EXISTS lock_stages_ru TEXT,
ADD COLUMN IF NOT EXISTS lock_stages_en TEXT,
ADD COLUMN IF NOT EXISTS price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'USD';

-- Mavjud mahsulotlar uchun default qiymatlar
UPDATE products 
SET price = NULL, currency = 'USD' 
WHERE price IS NULL OR currency IS NULL;
