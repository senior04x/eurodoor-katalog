# Database Setup Instructions

## Supabase'da Notifications Table Yaratish

### 1. Supabase Dashboard'ga o'ting
- Link: https://supabase.com/dashboard/project/oathybjrmhtubbemjeyy
- Yoki: https://supabase.com/dashboard → loyihangizni tanlang

### 2. SQL Editor'ga o'ting
- Chap menudan "SQL Editor" ni tanlang
- "New query" tugmasini bosing

### 3. SQL Script'ni qo'ying
Quyidagi SQL kodini nusxalab, SQL Editor'ga qo'ying:

```sql
-- Notifications table for Eurodoor customer website
-- This table stores all notifications sent to customers

CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  order_number TEXT,
  type TEXT NOT NULL DEFAULT 'order_update', -- 'order_update', 'system_alert', 'promotion'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- RLS (Row Level Security) policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own notifications
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Admin can insert notifications for any user
CREATE POLICY "Admin can insert notifications" ON notifications
  FOR INSERT WITH CHECK (true);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER trigger_update_notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_notifications_updated_at();

-- Function to get unread notification count for a user
CREATE OR REPLACE FUNCTION get_unread_notification_count(user_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM notifications
    WHERE user_id = user_uuid AND is_read = FALSE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 4. Script'ni ishga tushiring
- "Run" tugmasini bosing
- Agar muvaffaqiyatli bo'lsa, "Success" xabari ko'rinadi

### 5. Tekshirish
- Chap menudan "Table Editor" ni tanlang
- "notifications" table'ini ko'ring
- Agar ko'rinsa, database tayyor!

## Test Qilish

### 1. Admin Panel'da test
- Admin panel'ga o'ting
- Orders sahifasida buyurtma holatini o'zgartiring
- Console'da notification saqlanganini ko'ring

### 2. Customer Website'da test
- Eurodoor saytiga o'ting
- Ro'yxatdan o'ting
- Header'da bell icon'ni ko'ring
- Admin panelda buyurtma holatini o'zgartiring
- Bell icon'da qizil nuqta ko'rinishini kuzating

## Xatoliklar

Agar xatolik bo'lsa:
1. Console'da xatolik xabarini ko'ring
2. Supabase Dashboard'da "Logs" bo'limini tekshiring
3. RLS policies to'g'ri o'rnatilganini tekshiring

## Foydali Linklar

- Supabase Dashboard: https://supabase.com/dashboard/project/oathybjrmhtubbemjeyy
- SQL Editor: https://supabase.com/dashboard/project/oathybjrmhtubbemjeyy/sql
- Table Editor: https://supabase.com/dashboard/project/oathybjrmhtubbemjeyy/editor
