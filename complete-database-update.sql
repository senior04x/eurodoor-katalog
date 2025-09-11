-- Barcha kerakli ustunlarni qo'shish
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS dimensions_ru TEXT,
ADD COLUMN IF NOT EXISTS dimensions_en TEXT,
ADD COLUMN IF NOT EXISTS lock_stages TEXT,
ADD COLUMN IF NOT EXISTS lock_stages_ru TEXT,
ADD COLUMN IF NOT EXISTS lock_stages_en TEXT,
ADD COLUMN IF NOT EXISTS price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'USD';

-- Mavjud mahsulotlar uchun default qiymatlar
UPDATE products 
SET 
  dimensions_ru = COALESCE(dimensions_ru, dimensions),
  dimensions_en = COALESCE(dimensions_en, dimensions),
  price = COALESCE(price, NULL),
  currency = COALESCE(currency, 'USD')
WHERE 
  dimensions_ru IS NULL 
  OR dimensions_en IS NULL 
  OR currency IS NULL;
