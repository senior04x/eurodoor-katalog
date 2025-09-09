// Cross-browser test uchun script
// Har bir browser da ishlatish uchun

console.log('🔍 Cross-browser test script');

// 1. localStorage ni tekshirish
const orders = JSON.parse(localStorage.getItem('orders') || '[]');
console.log('📱 Current browser localStorage orders:', orders.length);

// 2. Test zakaz yaratish
const testOrder = {
  id: 'cross-browser-test-' + Date.now(),
  timestamp: new Date().toISOString(),
  customer: {
    name: 'Cross Browser Test',
    phone: '+998901234567',
    message: 'Bu test zakaz - cross-browser test uchun'
  },
  product: {
    name: 'Test Product',
    material: 'Metal',
    security: 'High',
    dimensions: '200x80',
    price: '1000000'
  },
  status: 'new'
};

// 3. localStorage ga qo'shish
orders.push(testOrder);
localStorage.setItem('orders', JSON.stringify(orders));

console.log('✅ Test zakaz qo\'shildi:', testOrder.id);
console.log('📱 Jami zakazlar:', orders.length);

// 4. Browser ma'lumotlari
console.log('🌐 Browser info:', {
  userAgent: navigator.userAgent,
  browser: navigator.userAgent.includes('Chrome') ? 'Chrome' : 
           navigator.userAgent.includes('Firefox') ? 'Firefox' : 
           navigator.userAgent.includes('Safari') ? 'Safari' : 
           navigator.userAgent.includes('Yandex') ? 'Yandex' : 'Unknown'
});

// 5. Zakazlarni ko'rish
console.log('📋 Barcha zakazlar:', orders);

// 6. localStorage ni tozalash (ixtiyoriy)
// localStorage.removeItem('orders');
// console.log('🗑️ localStorage tozalandi');
