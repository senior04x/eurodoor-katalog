-- Eurodoor Orders Database Setup
-- Bu script ni Supabase SQL Editor da ishlatish uchun

-- 1. Orders table yaratish
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  timestamp TEXT NOT NULL,
  customer JSONB NOT NULL,
  product JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Index qo'shish (performance uchun)
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON orders USING GIN ((customer->>'phone'));

-- 3. Row Level Security (RLS) yoqish
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policy larni yaratish
-- Barcha foydalanuvchilar zakazlarni o'qishi mumkin
CREATE POLICY "Allow read access to all orders" ON orders
FOR SELECT USING (true);

-- Barcha foydalanuvchilar yangi zakaz qo'shishi mumkin
CREATE POLICY "Allow insert access to all orders" ON orders
FOR INSERT WITH CHECK (true);

-- Barcha foydalanuvchilar zakazni o'chirishi mumkin
CREATE POLICY "Allow delete access to all orders" ON orders
FOR DELETE USING (true);

-- Barcha foydalanuvchilar zakazni yangilashi mumkin
CREATE POLICY "Allow update access to all orders" ON orders
FOR UPDATE USING (true);

-- 5. Real-time updates uchun
ALTER PUBLICATION supabase_realtime ADD TABLE orders;

-- 6. Test ma'lumot qo'shish (ixtiyoriy)
INSERT INTO orders (id, timestamp, customer, product, status) VALUES 
(
  'test-order-1',
  '2024-01-20T10:00:00.000Z',
  '{"name": "Test Customer", "phone": "+998901234567", "message": "Test order"}',
  '{"name": "Test Product", "material": "Metal", "security": "High", "dimensions": "200x80", "price": "1000000"}',
  'new'
) ON CONFLICT (id) DO NOTHING;

-- 7. Ma'lumotlarni ko'rish
SELECT * FROM orders ORDER BY created_at DESC;
