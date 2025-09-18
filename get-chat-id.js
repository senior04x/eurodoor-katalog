// Chat ID'ni olish uchun script
const https = require('https');

const BOT_TOKEN = '8297997191:AAEuIB8g0FH9Yk0waqmPsUgrFDXm5rL83OU';

function getUpdates() {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/getUpdates`;
  
  https.get(url, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log('📱 Telegram Updates:');
        console.log(JSON.stringify(response, null, 2));
        
        if (response.result && response.result.length > 0) {
          console.log('\n🔍 Chat ID\'lar:');
          response.result.forEach((update, index) => {
            if (update.message) {
              console.log(`${index + 1}. Chat ID: ${update.message.chat.id}`);
              console.log(`   Username: ${update.message.from.username || 'N/A'}`);
              console.log(`   First Name: ${update.message.from.first_name || 'N/A'}`);
              console.log(`   Text: ${update.message.text || 'N/A'}`);
              console.log('---');
            }
          });
        } else {
          console.log('❌ Hech qanday xabar topilmadi. Bot\'ga /start yuboring!');
        }
      } catch (error) {
        console.error('❌ Xatolik:', error.message);
      }
    });
  }).on('error', (error) => {
    console.error('❌ Xatolik:', error.message);
  });
}

console.log('🔄 Telegram bot updates olinmoqda...');
getUpdates();
