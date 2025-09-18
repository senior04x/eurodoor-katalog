-- Create telegram_users table
CREATE TABLE IF NOT EXISTS telegram_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id BIGINT UNIQUE NOT NULL,
  user_id TEXT NOT NULL, -- Telefon raqam yoki user ID
  first_name TEXT,
  last_name TEXT,
  username TEXT,
  language_code TEXT,
  language TEXT DEFAULT 'uzbek',
  phone_number TEXT, -- Telefon raqam alohida saqlash
  is_bot BOOLEAN DEFAULT FALSE,
  state TEXT DEFAULT 'idle',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_telegram_users_chat_id ON telegram_users(chat_id);
CREATE INDEX IF NOT EXISTS idx_telegram_users_user_id ON telegram_users(user_id);

-- Add RLS policies
ALTER TABLE telegram_users ENABLE ROW LEVEL SECURITY;

-- Allow service role to manage all records
CREATE POLICY "Service role can manage telegram_users" ON telegram_users
  FOR ALL USING (auth.role() = 'service_role');

-- Allow authenticated users to read their own records
CREATE POLICY "Users can read own telegram_users" ON telegram_users
  FOR SELECT USING (auth.uid()::text = user_id::text);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_telegram_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER trigger_update_telegram_users_updated_at
  BEFORE UPDATE ON telegram_users
  FOR EACH ROW
  EXECUTE FUNCTION update_telegram_users_updated_at();
