-- RLS policy ni tuzatish - anonymous foydalanuvchilar ham insert qila olishi uchun

-- Eski policy larni o'chirish
DROP POLICY IF EXISTS "Products are insertable by authenticated users" ON products;
DROP POLICY IF EXISTS "Products are updatable by authenticated users" ON products;
DROP POLICY IF EXISTS "Products are deletable by authenticated users" ON products;

-- Yangi policy lar - anonymous foydalanuvchilar ham ishlatishi mumkin
CREATE POLICY "Products are insertable by everyone" ON products
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Products are updatable by everyone" ON products
  FOR UPDATE USING (true);

CREATE POLICY "Products are deletable by everyone" ON products
  FOR DELETE USING (true);

-- Yoki RLS ni butunlay o'chirish (agar kerak bo'lsa)
-- ALTER TABLE products DISABLE ROW LEVEL SECURITY;
