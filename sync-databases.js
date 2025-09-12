// Ikkala loyihani sinxronlashtirish uchun script
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://oathybjrmhtubbemjeyy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hdGh5YmpybWh0dWJiZW1qZXl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0MjMzOTIsImV4cCI6MjA3Mjk5OTM5Mn0.GlKHHQj1nhDGwF78Fr7zlKytRxEwXwlyRTlgEX6d4io';

const supabase = createClient(supabaseUrl, supabaseKey);

async function syncDatabases() {
  console.log('🔄 Ikkala loyihani sinxronlashtirish...\n');

  try {
    // 1. Asosiy loyihadagi products jadvalini olish
    console.log('📦 Asosiy loyihadagi mahsulotlarni olish...');
    const { data: mainProducts, error: mainError } = await supabase
      .from('products')
      .select('*');

    if (mainError) {
      console.error('❌ Asosiy loyiha mahsulotlarini olishda xatolik:', mainError);
      return;
    }

    console.log(`✅ ${mainProducts.length} ta mahsulot topildi`);

    // 2. Admin panel uchun yangi mahsulotlar qo'shish
    console.log('\n🔄 Admin panel uchun yangi mahsulotlar qoshish...');
    
    for (const product of mainProducts) {
      // Admin panel schema ga mos keladigan format
      const adminProduct = {
        name: product.name || product.name_ru || 'Nomsiz mahsulot',
        description: `${product.material || ''} ${product.security || ''} ${product.dimensions || ''}`.trim(),
        price: product.price || 0,
        image_url: product.image || 'https://picsum.photos/300/200?random=1',
        category: 'Eshiklar',
        is_active: product.is_active !== false,
        thickness: product.thickness || '100'
      };

      // Admin panel da bunday mahsulot bor-yo'qligini tekshirish
      const { data: existingProduct } = await supabase
        .from('products')
        .select('id')
        .eq('name', adminProduct.name)
        .single();

      if (!existingProduct) {
        console.log(`➕ Yangi mahsulot qoshilyapti: ${adminProduct.name}`);
        
        const { error: insertError } = await supabase
          .from('products')
          .insert([adminProduct]);

        if (insertError) {
          console.error(`❌ ${adminProduct.name} qoshishda xatolik:`, insertError);
        } else {
          console.log(`✅ ${adminProduct.name} muvaffaqiyatli qoshildi`);
        }
      } else {
        console.log(`ℹ️ ${adminProduct.name} allaqachon mavjud`);
      }
    }

    // 3. Users jadvalini customers ga sinxronlashtirish
    console.log('\n👥 Users jadvalini customers ga sinxronlashtirish...');
    
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*');

    if (usersError) {
      console.error('❌ Users olishda xatolik:', usersError);
    } else {
      console.log(`✅ ${users.length} ta foydalanuvchi topildi`);

      for (const user of users) {
        const customer = {
          name: user.name || 'Nomsiz mijoz',
          email: user.email,
          phone: user.phone || '+998000000000'
        };

        // Customer bor-yo'qligini tekshirish
        const { data: existingCustomer } = await supabase
          .from('customers')
          .select('id')
          .eq('email', customer.email)
          .single();

        if (!existingCustomer && customer.email) {
          console.log(`➕ Yangi mijoz qoshilyapti: ${customer.name}`);
          
          const { error: insertError } = await supabase
            .from('customers')
            .insert([customer]);

          if (insertError) {
            console.error(`❌ ${customer.name} qoshishda xatolik:`, insertError);
          } else {
            console.log(`✅ ${customer.name} muvaffaqiyatli qoshildi`);
          }
        }
      }
    }

    // 4. Orders jadvalini sinxronlashtirish
    console.log('\n🛒 Orders jadvalini sinxronlashtirish...');
    
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*');

    if (ordersError) {
      console.error('❌ Orders olishda xatolik:', ordersError);
    } else {
      console.log(`✅ ${orders.length} ta buyurtma topildi`);
      console.log('ℹ️ Orders jadvali allaqachon sinxron (bir xil database)');
    }

    console.log('\n🎉 Sinxronlashtirish tugadi!');

  } catch (error) {
    console.error('❌ Umumiy xatolik:', error);
  }
}

// Script ni ishga tushirish
syncDatabases();
