-- Supabase RLS Policies tekshirish
-- Bu script Supabase'da orders jadvali uchun RLS policies ni tekshiradi

-- 1. Orders jadvali mavjudligini tekshirish
SELECT table_name, table_schema 
FROM information_schema.tables 
WHERE table_name = 'orders' AND table_schema = 'public';

-- 2. RLS enabled yoki disabled ekanligini tekshirish
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'orders' AND schemaname = 'public';

-- 3. Mavjud policies ni ko'rish
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'orders' AND schemaname = 'public';

-- 4. Real-time publication tekshirish
SELECT * FROM pg_publication_tables WHERE tablename = 'orders';

-- 5. Real-time replication slots tekshirish
SELECT * FROM pg_replication_slots WHERE slot_name LIKE '%orders%';
