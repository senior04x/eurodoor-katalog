# Eurodoor Admin Panel - To'liq Prompt

## 🎯 Asosiy Maqsad
Eurodoor asosiy sayti bilan to'liq sinxron ishlaydigan admin panel yaratish.

## 📊 Database Schema (Supabase)

### 1. Customers Table
```sql
CREATE TABLE IF NOT EXISTS customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. Products Table
```sql
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  image_url TEXT,
  category VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. Orders Table
```sql
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4. Order Items Table
```sql
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

## 🔑 API Keys

### Supabase
```javascript
const supabaseUrl = 'https://oathybjrmhtubbemjeyy.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hdGh5YmpybWh0dWJiZW1qZXl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NzQ4NzQsImV4cCI6MjA1MDU1MDg3NH0.8QJ8QJ8QJ8QJ8QJ8QJ8QJ8QJ8QJ8QJ8QJ8QJ8QJ8'
```

### ImgBB (Rasm yuklash uchun)
```javascript
const IMGBB_API_KEY = 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6'
```

## 🚀 Admin Panel Funksionalligi

### 1. Authentication
- Login: admin@eurodoor.uz / password123
- JWT token bilan himoyalangan
- Auto-logout 24 soatdan keyin

### 2. Dashboard
- Umumiy statistika (buyurtmalar, mijozlar, daromad)
- Real-time yangilanishlar
- Grafiklar va diagrammalar

### 3. Mijozlar Boshqaruvi
- Barcha ro'yxatdan o'tgan mijozlar ro'yxati
- Mijoz ma'lumotlarini tahrirlash
- Mijoz buyurtmalari tarixi
- Qidiruv va filtrlash

### 4. Mahsulotlar Boshqaruvi
- Mahsulot qo'shish/tahrirlash/o'chirish
- Rasm yuklash (ImgBB orqali)
- Kategoriya boshqaruvi
- Narx va tavsif tahrirlash

### 5. Buyurtmalar Boshqaruvi
- Barcha buyurtmalar ro'yxati
- Buyurtma holatini o'zgartirish
- Buyurtma tafsilotlari
- Mijoz bilan bog'lanish

### 6. Analitika
- Kunlik/haftalik/oylik hisobotlar
- Eng ko'p sotilgan mahsulotlar
- Mijozlar statistikasi
- Daromad tahlili

## 🔧 Texnik Talablar

### Frontend
- React + TypeScript
- Tailwind CSS
- Framer Motion (animatsiyalar)
- React Query (data fetching)
- React Hook Form (formlar)

### Backend Integration
- Supabase client
- Real-time subscriptions
- Image upload (ImgBB)
- File validation

### Responsive Design
- Mobile-first approach
- Tablet va desktop optimizatsiya
- Touch-friendly interface

## 📱 UI/UX Dizayn

### Color Scheme
- Primary: #3B82F6 (Blue)
- Secondary: #8B5CF6 (Purple)
- Success: #10B981 (Green)
- Warning: #F59E0B (Orange)
- Error: #EF4444 (Red)
- Background: #1F2937 (Dark Gray)

### Components
- Glassmorphism design
- Smooth animations
- Loading states
- Error handling
- Toast notifications

## 🔐 Xavfsizlik

### RLS Policies
```sql
-- Customers
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Customers are viewable by everyone" ON customers FOR SELECT USING (true);
CREATE POLICY "Customers are insertable by everyone" ON customers FOR INSERT WITH CHECK (true);

-- Products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Products are viewable by everyone" ON products FOR SELECT USING (true);
CREATE POLICY "Products are insertable by everyone" ON products FOR INSERT WITH CHECK (true);

-- Orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Orders are viewable by everyone" ON orders FOR SELECT USING (true);
CREATE POLICY "Orders are insertable by everyone" ON orders FOR INSERT WITH CHECK (true);

-- Order Items
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Order items are viewable by everyone" ON order_items FOR SELECT USING (true);
CREATE POLICY "Order items are insertable by everyone" ON order_items FOR INSERT WITH CHECK (true);
```

## 🎨 Admin Panel Layout

### Header
- Logo va navigation
- User profile dropdown
- Notifications
- Search bar

### Sidebar
- Dashboard
- Mijozlar
- Mahsulotlar
- Buyurtmalar
- Analitika
- Sozlamalar

### Main Content
- Dynamic content area
- Breadcrumbs
- Action buttons
- Data tables
- Forms

## 📊 Real-time Features

### Live Updates
- Yangi buyurtmalar
- Mijoz ro'yxatdan o'tish
- Mahsulot o'zgarishlari
- Status yangilanishlari

### Notifications
- Browser notifications
- Toast messages
- Sound alerts
- Email notifications

## 🔄 Data Synchronization

### Auto-sync
- 30 soniyada bir marta
- Real-time subscriptions
- Conflict resolution
- Offline support

### Manual Refresh
- Refresh button
- Pull-to-refresh
- Keyboard shortcuts

## 📈 Performance

### Optimization
- Lazy loading
- Virtual scrolling
- Image optimization
- Caching strategies

### Monitoring
- Error tracking
- Performance metrics
- User analytics
- System health

## 🚀 Deployment

### Production
- Vercel/Netlify
- Environment variables
- SSL certificate
- CDN optimization

### Development
- Hot reload
- Debug tools
- Error boundaries
- Development server

## 📝 Testing

### Unit Tests
- Component testing
- Function testing
- Integration testing
- E2E testing

### Quality Assurance
- Code review
- Performance testing
- Security testing
- User acceptance testing

## 🔧 Maintenance

### Updates
- Regular updates
- Bug fixes
- Feature additions
- Security patches

### Backup
- Database backup
- File backup
- Configuration backup
- Recovery procedures

---

## ⚠️ MUHIM ESKATMA

Bu admin panel Eurodoor asosiy sayti bilan to'liq sinxron ishlashi kerak. Barcha ma'lumotlar bir xil Supabase database dan kelishi va real-time yangilanishi kerak.

### Asosiy Muammolar:
1. **Mahsulot qo'shishda xatolik** - ImgBB API key tekshirish
2. **Ro'yxatdan o'tgan mijozlar ko'rinmaydi** - RLS policies tekshirish
3. **Default ma'lumotlar** - Real data fetch qilish
4. **Analitika default** - Real-time data connection

### Yechim:
- Supabase client to'g'ri sozlash
- RLS policies qo'shish
- Real-time subscriptions
- Error handling qo'shish
