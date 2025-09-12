-- Fix orders table schema to match application expectations
-- This script ensures the orders table has the correct columns

-- First, let's check if the orders table exists and create it if it doesn't
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id),
  customer_name VARCHAR(100) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  customer_email VARCHAR(100),
  delivery_address TEXT NOT NULL,
  notes TEXT,
  total_amount DECIMAL(10,2) NOT NULL,
  products JSONB NOT NULL DEFAULT '[]',
  status VARCHAR(50) DEFAULT 'pending',
  delivery_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies for orders table
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Allow everyone to insert orders (for customer orders)
CREATE POLICY IF NOT EXISTS "Orders are insertable by everyone" ON orders
  FOR INSERT WITH CHECK (true);

-- Allow everyone to select orders (for order tracking)
CREATE POLICY IF NOT EXISTS "Orders are selectable by everyone" ON orders
  FOR SELECT USING (true);

-- Allow everyone to update orders (for status updates)
CREATE POLICY IF NOT EXISTS "Orders are updatable by everyone" ON orders
  FOR UPDATE USING (true);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;

-- Create the trigger
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_orders_updated_at();

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
