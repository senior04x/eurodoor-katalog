# Telegram Bot Integratsiyasi - To'liq Sozlash Yo'riqnomasi

## 🎯 Nima qo'shildi

Telegram bot orqali mijozlarga buyurtma holati o'zgarishlarini avtomatik yuborish tizimi qo'shildi.

## 🔄 Bot'ning To'liq Ishlash Jarayoni

1. **Mijoz bot'ga kirganda** - `/start` buyrug'i
2. **Til so'raladi** - O'zbek/Rus/Ingliz tili tanlash
3. **Mini app tugmasi** - "Yangi buyurtma" tugmasi
4. **Mini app ochiladi** - Eurodoor saytida buyurtma berish
5. **Admin buyurtma holatini o'zgartiradi** - Admin panelda
6. **Avtomatik xabar yuboriladi** - Mijozning tanlagan tilida

## 📁 Yangi fayllar

### Supabase Functions
- `supabase/functions/send-telegram-notification/index.ts` - Telegram xabarlarini yuborish
- `supabase/functions/trigger-telegram-notification/index.ts` - Admin paneldan trigger qilish
- `supabase/functions/telegram-webhook/index.ts` - Bot webhook handler
- `supabase/functions/admin-trigger-telegram/index.ts` - Admin panel integratsiyasi

### Database
- `supabase/migrations/001_telegram_users.sql` - Telegram foydalanuvchilari jadvali

### Frontend Components
- `src/lib/telegramNotificationService.ts` - Telegram notification service
- `src/lib/adminTelegramService.ts` - Admin panel uchun Telegram service
- `src/components/TelegramTest.tsx` - Test komponenti
- `src/components/TelegramIntegration.tsx` - Admin panel integratsiyasi

### Scripts
- `scripts/deploy-telegram-functions.ps1` - PowerShell deployment script
- `scripts/deploy-telegram-functions.sh` - Bash deployment script

## 🚀 Deployment Qadamlar

### 1. Supabase Functions Deploy

```powershell
# Windows PowerShell
.\scripts\deploy-telegram-functions.ps1

# Yoki manual
supabase functions deploy send-telegram-notification
supabase functions deploy trigger-telegram-notification
```

### 2. Environment Variables Sozlash

Supabase Dashboard'da:
1. Project Settings > Edge Functions > Environment Variables
2. Quyidagi o'zgaruvchini qo'shing:

```
TELEGRAM_BOT_TOKEN = 8297997191:AAEuIB8g0FH9Yk0waqmPsUgrFDXm5rL83OU
```

### 3. Database Migration

```sql
-- Run the migration
supabase db push
```

### 4. Telegram Bot Sozlash

1. **Bot Father** orqali bot yaratilgan (token: `8297997191:AAEuIB8g0FH9Yk0waqmPsUgrFDXm5rL83OU`)
2. **Webhook sozlash** (deployment'dan keyin):
   ```bash
   curl -X POST "https://api.telegram.org/bot8297997191:AAEuIB8g0FH9Yk0waqmPsUgrFDXm5rL83OU/setWebhook" \
     -d "url=https://your-project.supabase.co/functions/v1/telegram-webhook"
   ```
3. Bot'ga `/start` buyrug'ini yuborish mumkin
4. Bot'ni guruhga qo'shish mumkin

## 🧪 Test Qilish

### 1. Frontend Test
1. Ilovani ishga tushiring
2. Profile sahifasiga o'ting
3. "Telegram Bot Test" tugmasini bosing
4. Telefon raqamini kiriting (masalan: `998901234567`)
5. "Test xabari yuborish" tugmasini bosing

### 2. Manual Test
```bash
curl -X POST "https://your-project.supabase.co/functions/v1/send-telegram-notification" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "chat_id": "998901234567",
    "order_number": "TEST-001",
    "customer_name": "Test Mijoz",
    "customer_phone": "+998 90 123 45 67",
    "status": "confirmed",
    "title": "Test xabari",
    "message": "Bu test xabari",
    "total_amount": 100000
  }'
```

## 🔄 Qanday Ishlaydi

### 1. Buyurtma Holati O'zgarishi
1. Admin panelda buyurtma holati o'zgaradi
2. Real-time subscription trigger bo'ladi
3. `OrderTracking` komponenti o'zgarishni qabul qiladi
4. Telegram notification yuboriladi

### 2. Telegram Xabar Formati
```
✅ Buyurtma tasdiqlandi

👤 Mijoz: John Doe
📞 Telefon: +998 90 123 45 67
📋 Buyurtma raqami: ORD-001
💰 Jami summa: 1,000,000 so'm
📍 Manzil: Toshkent shahar

📊 Holat: ✅ Tasdiqlandi

Hurmatli mijoz, ORD-001 raqamli buyurtmangiz tasdiqlandi va tayyorlash jarayoni boshlandi.

---
🏠 Eurodoor
📞 +998 90 123 45 67
🌐 www.eurodoor.uz
```

### 3. Inline Keyboard
Har bir xabarda quyidagi tugmalar bo'ladi:
- "📋 Buyurtmalarimni ko'rish" - orders sahifasiga yo'naltiradi
- "🏠 Bosh sahifa" - home sahifasiga yo'naltiradi

## 🛠️ Sozlash

### Chat ID Format
Hozircha telefon raqamni chat ID sifatida ishlatamiz:
```javascript
const chatId = user.phone.replace(/\D/g, ''); // Faqat raqamlarni olish
```

### Status Mapping
```javascript
const statusMap = {
  'pending': '⏳ Kutilmoqda',
  'confirmed': '✅ Tasdiqlandi',
  'processing': '🔄 Tayyorlanmoqda',
  'ready': '📦 Tayyor',
  'shipped': '🚚 Yuborildi',
  'delivered': '🎉 Yetkazib berildi',
  'cancelled': '❌ Bekor qilindi'
};
```

## 🔧 Troubleshooting

### 1. Xabar Yuborilmayapti
- Bot token'ni tekshiring
- Chat ID'ni to'g'ri formatda kiriting
- Supabase function log'larini tekshiring

### 2. Bot Javob Bermayapti
- Bot'ga `/start` buyrug'ini yuboring
- Bot'ni block qilmaganligingizni tekshiring
- Bot'ning admin huquqlarini tekshiring

### 3. Function Error
```bash
# Log'larni ko'rish
supabase functions logs send-telegram-notification
supabase functions logs trigger-telegram-notification
```

## 📊 Monitoring

### 1. Success Rate
Console'da quyidagi log'lar ko'rinadi:
- `✅ Telegram notification sent successfully`
- `❌ Telegram notification error: [error]`

### 2. Database Tracking
`order_notifications` jadvalida:
- `telegram_sent: true/false`
- `telegram_message_id: [message_id]`

## 🚀 Keyingi Qadamlar

1. **Webhook Setup** - Bot'ga webhook qo'shish
2. **Chat ID Database** - Chat ID'larni database'da saqlash
3. **Message Templates** - Xabar shablonlarini kengaytirish
4. **Analytics** - Xabar yuborish statistikasi
5. **Error Handling** - Xatoliklarni yaxshiroq boshqarish

## 📞 Yordam

Agar muammo bo'lsa:
1. Console log'larini tekshiring
2. Supabase function log'larini ko'ring
3. Telegram bot'ni test qiling
4. Network tab'da API so'rovlarini tekshiring
