-- Admin security setup for Eurodoor
-- Run this in your Supabase SQL editor

-- Create admin users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admin sessions table
CREATE TABLE IF NOT EXISTS admin_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES admin_users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ip_address INET,
  user_agent TEXT,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(token);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_admin_id ON admin_sessions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires_at ON admin_sessions(expires_at);

-- Create function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM admin_sessions 
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON admin_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin user (change password in production!)
-- Password: admin123 (change this!)
INSERT INTO admin_users (email, password_hash, name) 
VALUES (
  'admin@eurodoor.uz', 
  'admin123', -- In production, use proper password hashing
  'Admin User'
) ON CONFLICT (email) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for admin_users
CREATE POLICY "Admin users are viewable by authenticated users" ON admin_users
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admin users are insertable by service role" ON admin_users
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Admin users are updatable by service role" ON admin_users
  FOR UPDATE USING (auth.role() = 'service_role');

-- Create policies for admin_sessions
CREATE POLICY "Admin sessions are viewable by service role" ON admin_sessions
  FOR SELECT USING (auth.role() = 'service_role');

CREATE POLICY "Admin sessions are insertable by service role" ON admin_sessions
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Admin sessions are updatable by service role" ON admin_sessions
  FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "Admin sessions are deletable by service role" ON admin_sessions
  FOR DELETE USING (auth.role() = 'service_role');

-- Create function to clean up expired sessions (run periodically)
-- You can set up a cron job to run this function every hour
-- SELECT cleanup_expired_sessions();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON admin_users TO service_role;
GRANT ALL ON admin_sessions TO service_role;
