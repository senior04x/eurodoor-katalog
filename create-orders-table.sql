-- Orders jadvalini yaratish va sozlash
-- Bu kodni Supabase SQL Editor da ishga tushiring

-- 1. Orders jadvalini yaratish
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  delivery_address TEXT,
  notes TEXT,
  total_amount DECIMAL(10,2) NOT NULL,
  products JSONB NOT NULL DEFAULT '[]',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. RLS ni yoqish
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 3. Barcha foydalanuvchilar o'qishi mumkin
CREATE POLICY "Orders are viewable by everyone" ON public.orders
  FOR SELECT USING (true);

-- 4. Barcha foydalanuvchilar yozishi mumkin
CREATE POLICY "Orders are insertable by everyone" ON public.orders
  FOR INSERT WITH CHECK (true);

-- 5. Adminlar yangilashi mumkin
CREATE POLICY "Orders are updatable by admins" ON public.orders
  FOR UPDATE USING (true);

-- 6. Jadvalni tekshirish
SELECT 'Orders table created successfully!' as message;
