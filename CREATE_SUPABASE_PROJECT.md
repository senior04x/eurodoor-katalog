# 🚀 Real Supabase Project Yaratish - Step by Step

## 🎯 **MAQSAD:**
Haqiqiy web saytlar kabi backend dan ma'lumotlar olish

## 📋 **QADAMLAR:**

### **1. Supabase.com ga kiring**
1. [https://supabase.com](https://supabase.com) ga o'ting
2. "Start your project" tugmasini bosing
3. GitHub bilan login qiling

### **2. New Project yarating**
1. "New Project" tugmasini bosing
2. **Project Name:** `eurodoor-orders`
3. **Database Password:** Kuchli parol tanlang (eslab qoling!)
4. **Region:** `Central Asia (Singapore)`
5. "Create new project" tugmasini bosing
6. 2-3 daqiqa kutish

### **3. API Keys olish**
1. Supabase dashboard da **"Settings"** > **"API"** ga o'ting
2. Quyidagi ma'lumotlarni nusxalang:

```
Project URL: https://[project-id].supabase.co
anon public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### **4. Database Table yaratish**
1. Supabase dashboard da **"SQL Editor"** ga o'ting
2. **"New query"** tugmasini bosing
3. Quyidagi SQL kodni yopishtiring:

```sql
-- Eurodoor Orders Database
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  timestamp TEXT NOT NULL,
  customer JSONB NOT NULL,
  product JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index qo'shish (tezlik uchun)
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- Row Level Security (RLS) yoqish
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- RLS Policy larni yaratish
CREATE POLICY "Allow read access to all orders" ON orders
FOR SELECT USING (true);

CREATE POLICY "Allow insert access to all orders" ON orders
FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow delete access to all orders" ON orders
FOR DELETE USING (true);

CREATE POLICY "Allow update access to all orders" ON orders
FOR UPDATE USING (true);

-- Real-time updates uchun
ALTER PUBLICATION supabase_realtime ADD TABLE orders;

-- Test ma'lumot qo'shish
INSERT INTO orders (id, timestamp, customer, product, status) VALUES 
(
  'test-order-1',
  '2024-01-20T10:00:00.000Z',
  '{"name": "Test Customer", "phone": "+998901234567", "message": "Test order"}',
  '{"name": "Test Product", "material": "Metal", "security": "High", "dimensions": "200x80", "price": "1000000"}',
  'new'
) ON CONFLICT (id) DO NOTHING;
```

4. **"Run"** tugmasini bosing

### **5. Code da yangilash**
1. `src/lib/supabase.ts` faylini oching
2. Quyidagi ma'lumotlarni yangilang:

```typescript
// Real ma'lumotlar bilan almashtiring
const supabaseUrl = 'https://[your-project-id].supabase.co'
const supabaseKey = 'your-real-anon-key'
```

### **6. Test qilish**
1. Saytga kiring: `https://eurodoor.uz`
2. Zakaz bering
3. Admin panel da ko'ring (Ctrl+Shift+A)
4. Console da log larni tekshiring

### **7. Muammo hal qilish**

#### **A) Agar zakazlar ko'rinmasa:**
```bash
# 1. Browser console da xatolarni tekshiring
# 2. Network tab da API request larni ko'ring
# 3. Supabase dashboard da "Logs" ga o'ting
```

#### **B) RLS Policy xatolari:**
```sql
-- Test uchun RLS ni o'chirish
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
```

#### **C) Real-time ishlamasa:**
```sql
-- Real-time yoqish
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
```

### **8. Monitoring**

#### **A) Supabase Dashboard:**
- **"Table Editor"** - ma'lumotlarni ko'rish
- **"Logs"** - xatolarni tekshirish
- **"API"** - request larni kuzatish

#### **B) Browser Console:**
- F12 > Console
- Network tab da API request larni tekshiring

### **9. Production uchun**

#### **A) Environment variables:**
```typescript
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY
```

#### **B) .env fayl:**
```
REACT_APP_SUPABASE_URL=https://[project-id].supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

### **10. Backup**

#### **A) Avtomatik backup:**
- Supabase avtomatik backup qiladi
- **"Settings"** > **"Database"** > **"Backups"** da sozlamalar

#### **B) Manual backup:**
```sql
-- Ma'lumotlarni export qilish
COPY orders TO '/tmp/orders_backup.csv' WITH CSV HEADER;
```

## ✅ **NATIJA:**
- ✅ Haqiqiy backend database
- ✅ Cross-browser zakazlar
- ✅ Real-time yangilanishlar
- ✅ Professional web sayt

## 🚀 **KEYINGI QADAMLAR:**
1. Supabase project yarating
2. API keys ni oling
3. Database table yarating
4. Code da yangilang
5. Test qiling
