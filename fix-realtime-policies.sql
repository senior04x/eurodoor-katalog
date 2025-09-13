-- Real-time uchun RLS policies ni to'g'rilash
-- Bu script Supabase'da real-time ishlashi uchun kerakli policies ni yaratadi

-- 1. Orders jadvali uchun real-time publication
-- Avval mavjud publication'ni o'chirish
DROP PUBLICATION IF EXISTS supabase_realtime;

-- Yangi publication yaratish
CREATE PUBLICATION supabase_realtime FOR TABLE orders;

-- 2. Orders jadvali uchun RLS policies
-- Avval mavjud policies'ni o'chirish
DROP POLICY IF EXISTS "Orders are viewable by everyone" ON orders;
DROP POLICY IF EXISTS "Orders are insertable by everyone" ON orders;
DROP POLICY IF EXISTS "Orders are updatable by everyone" ON orders;

-- Yangi policies yaratish
CREATE POLICY "Orders are viewable by everyone" ON orders
  FOR SELECT USING (true);

CREATE POLICY "Orders are insertable by everyone" ON orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Orders are updatable by everyone" ON orders
  FOR UPDATE USING (true);

-- 3. RLS ni yoqish (agar yoqilmagan bo'lsa)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- 4. Real-time replication uchun kerakli sozlamalar
-- Bu sozlamalar Supabase dashboard'da ham qo'shilishi mumkin
-- Settings > Database > Replication

-- 5. Test uchun orders jadvali mavjudligini tekshirish
SELECT 
  schemaname, 
  tablename, 
  rowsecurity,
  hasindexes,
  hasrules,
  hastriggers
FROM pg_tables 
WHERE tablename = 'orders' AND schemaname = 'public';

-- 6. Real-time publication status'ni tekshirish
SELECT * FROM pg_publication_tables WHERE tablename = 'orders';

-- 7. RLS policies'ni tekshirish
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'orders' AND schemaname = 'public';
