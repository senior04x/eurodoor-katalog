-- Esik qalinligi uchun ustun qo'shish
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS thickness VARCHAR(10);

-- Mavjud mahsulotlar uchun default qiymat
UPDATE products 
SET thickness = '100' 
WHERE thickness IS NULL;
