# Eurodoor Admin Panel - Sinxron Ishlash Konfiguratsiyasi

## 🎯 Maqsad
Asosiy sayt (`eurodoor`) va Admin Panel (`eurodoor-admin`) ni sinxron ishlatish.

## 📁 Papka Tuzilishi
```
C:\Marketing-wep\
├── eurodoor/          # Asosiy sayt (port 3001)
└── eurodoor-admin/    # Admin panel (port 3000)
```

## 🚀 Ishga Tushirish

### 1. Asosiy Sayt (eurodoor)
```bash
cd C:\Marketing-wep\eurodoor
npm run dev
# Port: http://localhost:3001
```

### 2. Admin Panel (eurodoor-admin)
```bash
cd C:\Marketing-wep\eurodoor-admin
npm run dev
# Port: http://localhost:3000
```

## 🔗 Bog'lanish

### Asosiy Saytdan Admin Panel ga:
- URL: `http://localhost:3001/admin` (redirect qiladi)
- Yoki to'g'ridan-to'g'ri: `http://localhost:3000`

### Admin Panel dan Asosiy Saytga:
- URL: `http://localhost:3001`

## 📊 Ma'lumotlar Bazasi
**Ikkala sayt ham bir xil Supabase database ishlatadi:**
- URL: `https://oathybjrmhtubbemjeyy.supabase.co`
- Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## 🔄 Sinxron Ishlash

### Real-time Yangilanishlar:
1. **Asosiy saytda** mahsulot qo'shilsa → Admin panel da ko'rinadi
2. **Admin panel da** mahsulot o'zgartirilsa → Asosiy saytda yangilanadi
3. **Buyurtma berilsa** → Admin panel da real-time ko'rinadi
4. **Mijoz ro'yxatdan o'tsa** → Admin panel da yangi mijoz ko'rinadi

### Ma'lumotlar Oqimi:
```
Asosiy Sayt (eurodoor) ←→ Supabase ←→ Admin Panel (eurodoor-admin)
```

## 🛠️ Texnik Tafsilotlar

### Asosiy Sayt (eurodoor):
- **Framework:** React + TypeScript + Vite
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Database:** Supabase
- **Port:** 3001

### Admin Panel (eurodoor-admin):
- **Framework:** React + TypeScript + Vite
- **Styling:** Tailwind CSS
- **Database:** Supabase (bir xil)
- **Port:** 3000

## 🔐 Xavfsizlik

### Admin Panel Kirish:
- **URL:** `http://localhost:3000`
- **Login:** `admin@eurodoor.uz`
- **Password:** `eurodoor2024`

### RLS Policies:
- Barcha jadvallar uchun RLS yoqilgan
- Admin panel to'liq ruxsatga ega
- Asosiy sayt faqat o'qish ruxsatiga ega

## 📱 PWA Xususiyatlari

### Asosiy Sayt:
- Manifest: `/site.webmanifest`
- Service Worker: Avtomatik
- Offline Support: ✅

### Admin Panel:
- Manifest: `/admin-manifest.webmanifest`
- Service Worker: Avtomatik
- Offline Support: ✅

## 🔧 Troubleshooting

### Agar Admin Panel ishlamasa:
1. Port 3000 band emasligini tekshiring
2. `npm install` qiling
3. `npm run dev` qiling

### Agar Ma'lumotlar Sinxron Emas:
1. Supabase connection tekshiring
2. RLS policies tekshiring
3. Real-time subscriptions tekshiring

## 📞 Qo'llab-quvvatlash

### Log Fayllar:
- Asosiy sayt: Browser Console
- Admin panel: Browser Console
- Supabase: Dashboard → Logs

### Tekshirish:
1. **Database:** Supabase Dashboard
2. **Real-time:** Supabase → Realtime
3. **Auth:** Supabase → Authentication

---

## ⚠️ MUHIM ESKATMA

**Ikkala sayt ham bir vaqtda ishga tushirilishi kerak:**
1. Terminal 1: `cd eurodoor && npm run dev`
2. Terminal 2: `cd eurodoor-admin && npm run dev`

**Endi ikkala sayt ham sinxron ishlaydi va bir-biriga ta'sir qilmaydi!** 🚀
