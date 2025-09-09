# Supabase Setup Guide

## 1. Supabase Project Yaratish

1. [Supabase.com](https://supabase.com) ga kiring
2. "Start your project" tugmasini bosing
3. GitHub bilan login qiling
4. "New Project" tugmasini bosing
5. Project nomini kiriting: `eurodoor-orders`
6. Database parolini tanlang
7. Region: `Central Asia (Singapore)` tanlang
8. "Create new project" tugmasini bosing

## 2. Database Table Yaratish

### Orders Table:
```sql
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  timestamp TEXT NOT NULL,
  customer JSONB NOT NULL,
  product JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index qo'shish
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_status ON orders(status);
```

## 3. API Keys Olish

1. Supabase dashboard da "Settings" > "API" ga o'ting
2. Quyidagi ma'lumotlarni nusxalang:
   - Project URL
   - anon public key

## 4. Code da Konfiguratsiya

`src/lib/supabase.ts` faylida quyidagi ma'lumotlarni yangilang:

```typescript
const supabaseUrl = 'https://your-project-id.supabase.co'
const supabaseKey = 'your-anon-key'
```

## 5. Row Level Security (RLS)

Orders table uchun RLS yoqish:

```sql
-- RLS yoqish
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Barcha zakazlarni o'qish uchun policy
CREATE POLICY "Allow read access to all orders" ON orders
FOR SELECT USING (true);

-- Yangi zakaz qo'shish uchun policy
CREATE POLICY "Allow insert access to all orders" ON orders
FOR INSERT WITH CHECK (true);

-- Zakazni o'chirish uchun policy
CREATE POLICY "Allow delete access to all orders" ON orders
FOR DELETE USING (true);

-- Zakazni yangilash uchun policy
CREATE POLICY "Allow update access to all orders" ON orders
FOR UPDATE USING (true);
```

## 6. Test Qilish

1. Supabase dashboard da "Table Editor" ga o'ting
2. Orders table ni ko'ring
3. Yangi zakaz qo'shing
4. Admin panel da zakazlarni ko'ring

## 7. Real-time Updates (Ixtiyoriy)

Real-time updates uchun:

```sql
-- Real-time yoqish
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
```

## 8. Backup (Muhim)

1. Supabase dashboard da "Settings" > "Database" ga o'ting
2. "Backups" bo'limida backup sozlamalarini tekshiring
3. Avtomatik backup yoqilganligini tekshiring

## 9. Monitoring

1. Supabase dashboard da "Logs" bo'limini tekshiring
2. "API" bo'limida request larni kuzating
3. "Database" bo'limida performance ni tekshiring

## 10. Troubleshooting

### Xatoliklar:
- **401 Unauthorized**: API key noto'g'ri
- **404 Not Found**: Table mavjud emas
- **500 Internal Server Error**: Database xatoligi

### Yechimlar:
1. API key larni tekshiring
2. Table nomini tekshiring
3. RLS policy larni tekshiring
4. Supabase status ni tekshiring

## 11. Production uchun

1. Environment variables ishlatish:
```typescript
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY
```

2. `.env` fayl yaratish:
```
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

3. `.env` faylini `.gitignore` ga qo'shish
