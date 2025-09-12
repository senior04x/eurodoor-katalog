-- Faqat foydalanuvchilarni tasdiqlangan qilish
-- Bu kodni Supabase SQL Editor da ishga tushiring

UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email_confirmed_at IS NULL;
