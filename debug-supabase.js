// Supabase connection debug
const supabaseUrl = 'https://oathybjrmhtubbemjeyy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hdGh5YmpybWh0dWJiZW1qZXl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0MjMzOTIsImV4cCI6MjA3Mjk5OTM5Mn0.GlKHHQj1nhDGwF78Fr7zlKytRxEwXwlyRTlgEX6d4io';

async function testSupabase() {
  console.log('🔄 Testing Supabase connection...');
  
  try {
    // Test 1: Basic connection
    const response = await fetch(`${supabaseUrl}/rest/v1/products?select=*&limit=1`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ HTTP Error:', response.status, errorText);
      return;
    }
    
    const data = await response.json();
    console.log('✅ Supabase connection successful!');
    console.log('📊 Products count:', data.length);
    console.log('📊 Sample data:', data);
    
  } catch (error) {
    console.error('❌ Connection failed:', error);
    console.error('❌ Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
  }
}

// Run test
testSupabase();
