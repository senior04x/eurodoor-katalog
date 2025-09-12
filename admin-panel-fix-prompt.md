# Eurodoor Admin Panel - Muammolarni Hal Qilish Prompt

## 🎯 **MAQSAD**
`C:\Marketing-wep\eurodoor-admin` papkasidagi admin panel ni to'liq ishlaydigan holatga keltirish.

## 📊 **JORIY HOLAT**

### **✅ Ishlayotgan:**
- Admin panel port 5175 da ishga tushmoqda
- Asosiy sayt bilan sinxron (bir xil Supabase database)
- Alohida papkada joylashgan

### **❌ MUAMMOLAR:**

#### **1. Mahsulot Qo'shishda Xatolik:**
- Rasm yuklash ishlamaydi
- ImgBB API key muammosi
- File validation yo'q

#### **2. Ro'yxatdan O'tgan Mijozlar Ko'rinmaydi:**
- Default ma'lumotlar ko'rsatilmoqda
- Real Supabase data kelmaydi
- RLS policies muammosi

#### **3. Buyurtmalar Default:**
- Real buyurtmalar ko'rinmaydi
- Live data connection yo'q
- Real-time subscriptions ishlamaydi

#### **4. Analitika Default:**
- Static ma'lumotlar
- Real-time analytics yo'q
- Database connection muammosi

## 🔧 **HAL QILISH KERAK BO'LGAN:**

### **1. Supabase Connection:**
```javascript
// src/lib/supabase.ts
const supabaseUrl = 'https://oathybjrmhtubbemjeyy.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hdGh5YmpybWh0dWJiZW1qZXl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NzQ4NzQsImV4cCI6MjA1MDU1MDg3NH0.8QJ8QJ8QJ8QJ8QJ8QJ8QJ8QJ8QJ8QJ8QJ8QJ8QJ8'
```

### **2. ImgBB API Key:**
```javascript
// src/lib/imageUpload.ts
const IMGBB_API_KEY = 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6'
```

### **3. Database Schema:**
```sql
-- Customers
CREATE TABLE IF NOT EXISTS customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  image_url TEXT,
  category VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id),
  customer_name VARCHAR(100) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  customer_email VARCHAR(100),
  delivery_address TEXT NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order Items
CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  product_name VARCHAR(200) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  price DECIMAL(10,2) NOT NULL,
  custom_dimensions VARCHAR(100),
  color VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **4. RLS Policies:**
```sql
-- Enable RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Customers are viewable by everyone" ON customers FOR SELECT USING (true);
CREATE POLICY "Customers are insertable by everyone" ON customers FOR INSERT WITH CHECK (true);

CREATE POLICY "Products are viewable by everyone" ON products FOR SELECT USING (true);
CREATE POLICY "Products are insertable by everyone" ON products FOR INSERT WITH CHECK (true);

CREATE POLICY "Orders are viewable by everyone" ON orders FOR SELECT USING (true);
CREATE POLICY "Orders are insertable by everyone" ON orders FOR INSERT WITH CHECK (true);

CREATE POLICY "Order items are viewable by everyone" ON order_items FOR SELECT USING (true);
CREATE POLICY "Order items are insertable by everyone" ON order_items FOR INSERT WITH CHECK (true);
```

## 🚀 **QADAMLAR:**

### **1. Environment Variables:**
```bash
# .env file yaratish
VITE_SUPABASE_URL=https://oathybjrmhtubbemjeyy.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_IMGBB_API_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

### **2. Supabase Client:**
```javascript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)
```

### **3. Image Upload:**
```javascript
// src/lib/imageUpload.ts
const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY

export const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData()
  formData.append('image', file)
  formData.append('key', IMGBB_API_KEY)

  const response = await fetch('https://api.imgbb.com/1/upload', {
    method: 'POST',
    body: formData
  })

  const data = await response.json()
  return data.data.url
}
```

### **4. Real-time Subscriptions:**
```javascript
// Real-time data fetching
useEffect(() => {
  const fetchData = async () => {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error:', error)
      return
    }
    
    setCustomers(data || [])
  }

  fetchData()

  // Real-time subscription
  const subscription = supabase
    .channel('customers')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'customers' },
      () => fetchData()
    )
    .subscribe()

  return () => subscription.unsubscribe()
}, [])
```

### **5. Error Handling:**
```javascript
// Try-catch blocks qo'shish
try {
  const { data, error } = await supabase
    .from('products')
    .insert(productData)
  
  if (error) throw error
  
  showSuccess('Mahsulot muvaffaqiyatli qo\'shildi!')
} catch (error) {
  console.error('Error:', error)
  showError('Xatolik yuz berdi: ' + error.message)
}
```

## 🎯 **KUTILAYOTGAN NATIJA:**

### **Admin Panel da:**
- ✅ **Mahsulotlar:** Real Supabase dan keladi
- ✅ **Mijozlar:** Ro'yxatdan o'tgan foydalanuvchilar ko'rinadi
- ✅ **Buyurtmalar:** Real buyurtmalar live ko'rinadi
- ✅ **Analitika:** Real-time statistika
- ✅ **Rasm yuklash:** ImgBB orqali ishlaydi

### **Sinxron Ishlash:**
- ✅ Asosiy saytda mahsulot qo'shilsa → Admin panel da ko'rinadi
- ✅ Admin panel da mahsulot o'zgartirilsa → Asosiy saytda yangilanadi
- ✅ Buyurtma berilsa → Admin panel da real-time ko'rinadi
- ✅ Mijoz ro'yxatdan o'tsa → Admin panel da yangi mijoz ko'rinadi

## ⚠️ **MUHIM ESKATMA:**

**Asosiy saytga tegmaslik kerak!** Faqat admin panel ni tuzatish.

**URLs:**
- Asosiy sayt: `http://localhost:3001` (buzilmasin)
- Admin panel: `http://localhost:5175` (tuzatiladi)

**Endi admin panel ni to'liq ishlaydigan holatga keltiring!** 🚀
