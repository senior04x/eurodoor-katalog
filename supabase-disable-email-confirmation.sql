-- Supabase da email tasdiqlashni o'chirish uchun SQL kod
-- Bu kodni Supabase SQL Editor da ishga tushiring

-- 1. Email tasdiqlashni o'chirish
UPDATE auth.config 
SET raw_app_meta_data = jsonb_set(
  COALESCE(raw_app_meta_data, '{}'::jsonb), 
  '{email_confirm', 'false'::jsonb
);

-- 2. Mavjud foydalanuvchilarni tasdiqlangan qilish
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email_confirmed_at IS NULL;

-- 3. RLS policy ni yangilash (agar kerak bo'lsa)
-- Bu kod mavjud foydalanuvchilarni tasdiqlangan qiladi
