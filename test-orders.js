// Test zakazlar yaratish uchun script
// Browser console da ishlatish uchun

// Test zakaz yaratish
const testOrder = {
  id: 'test-' + Date.now(),
  timestamp: new Date().toISOString(),
  customer: {
    name: 'Test Customer',
    phone: '+998901234567',
    message: 'Test zakaz - bu test uchun yaratilgan'
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

// localStorage ga qo'shish
const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
existingOrders.push(testOrder);
localStorage.setItem('orders', JSON.stringify(existingOrders));

console.log('✅ Test zakaz qo\'shildi:', testOrder);
console.log('📱 Jami zakazlar:', existingOrders.length);

// Zakazlarni ko'rish
console.log('📋 Barcha zakazlar:', existingOrders);

// localStorage ni tozalash (ixtiyoriy)
// localStorage.removeItem('orders');
