# 🚀 Supabase Quick Setup Guide

## 1. Supabase Project Yaratish

### A) Supabase.com ga kiring:
1. [https://supabase.com](https://supabase.com) ga o'ting
2. "Start your project" tugmasini bosing
3. GitHub bilan login qiling
4. "New Project" tugmasini bosing

### B) Project sozlamalari:
```
Project Name: eurodoor-orders
Database Password: [Kuchli parol tanlang]
Region: Central Asia (Singapore)
```

### C) Project yaratish:
- "Create new project" tugmasini bosing
- 2-3 daqiqa kutish (database yaratilmoqda)

## 2. API Keys Olish

### A) Settings > API ga o'ting:
1. Supabase dashboard da "Settings" > "API" ga o'ting
2. Quyidagi ma'lumotlarni nusxalang:

```
Project URL: https://[project-id].supabase.co
anon public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 3. Database Table Yaratish

### A) SQL Editor ga o'ting:
1. Supabase dashboard da "SQL Editor" ga o'ting
2. "New query" tugmasini bosing

### B) SQL script ni ishlatish:
1. `supabase-setup.sql` faylini oching
2. Barcha kodni nusxalang
3. SQL Editor ga yopishtiring
4. "Run" tugmasini bosing

## 4. Code da Konfiguratsiya

### A) src/lib/supabase.ts faylini yangilang:
```typescript
const supabaseUrl = 'https://[your-project-id].supabase.co'
const supabaseKey = 'your-real-anon-key'
```

### B) Test qilish:
1. Saytga kiring
2. Zakaz bering
3. Admin panel da ko'ring

## 5. Troubleshooting

### A) Agar zakazlar ko'rinmasa:
1. Browser console da xatolarni tekshiring
2. Supabase dashboard da "Logs" ga o'ting
3. Network tab da API request larni tekshiring

### B) RLS Policy xatolari:
```sql
-- RLS ni o'chirish (test uchun)
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
```

### C) Real-time ishlamasa:
```sql
-- Real-time yoqish
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
```

## 6. Production uchun

### A) Environment variables:
```typescript
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY
```

### B) .env fayl:
```
REACT_APP_SUPABASE_URL=https://[project-id].supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

## 7. Test Ma'lumotlari

### A) Test zakaz yaratish:
```sql
INSERT INTO orders (id, timestamp, customer, product, status) VALUES 
(
  'test-' || extract(epoch from now()),
  now()::text,
  '{"name": "Test User", "phone": "+998901234567", "message": "Test order"}',
  '{"name": "Test Product", "material": "Metal", "security": "High"}',
  'new'
);
```

### B) Zakazlarni ko'rish:
```sql
SELECT * FROM orders ORDER BY created_at DESC LIMIT 10;
```

## 8. Monitoring

### A) Supabase Dashboard:
- "Table Editor" - ma'lumotlarni ko'rish
- "Logs" - xatolarni tekshirish
- "API" - request larni kuzatish

### B) Browser Console:
- F12 > Console
- Network tab da API request larni tekshiring

## 9. Backup

### A) Avtomatik backup:
- Supabase avtomatik backup qiladi
- "Settings" > "Database" > "Backups" da sozlamalar

### B) Manual backup:
```sql
-- Ma'lumotlarni export qilish
COPY orders TO '/tmp/orders_backup.csv' WITH CSV HEADER;
```

## 10. Support

### A) Xatoliklar:
- Browser console da xatolarni tekshiring
- Supabase dashboard da "Logs" ga o'ting
- Network tab da API request larni tekshiring

### B) Yordam:
- [Supabase Docs](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)
- [GitHub Issues](https://github.com/supabase/supabase/issues)
