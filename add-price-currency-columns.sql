-- Narx va valyuta uchun ustunlar qo'shish
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'USD';

-- Mavjud mahsulotlar uchun default qiymatlar
UPDATE products 
SET price = NULL, currency = 'USD' 
WHERE price IS NULL OR currency IS NULL;
