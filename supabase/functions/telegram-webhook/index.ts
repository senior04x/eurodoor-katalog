// Telegram Bot Webhook Handler
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from: {
      id: number;
      is_bot: boolean;
      first_name: string;
      last_name?: string;
      username?: string;
      language_code?: string;
    };
    chat: {
      id: number;
      first_name?: string;
      last_name?: string;
      username?: string;
      type: string;
    };
    date: number;
    text?: string;
  };
  callback_query?: {
    id: string;
    from: {
      id: number;
      is_bot: boolean;
      first_name: string;
      last_name?: string;
      username?: string;
      language_code?: string;
    };
    message?: {
      message_id: number;
      chat: {
        id: number;
        type: string;
      };
    };
    data?: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const update: TelegramUpdate = await req.json()
    console.log('📱 Telegram webhook received:', JSON.stringify(update, null, 2))

    // Get bot token
    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN')
    if (!botToken) {
      console.error('❌ TELEGRAM_BOT_TOKEN not found')
      return new Response('Bot token not configured', { status: 500 })
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Handle message
    if (update.message) {
      await handleMessage(update.message, botToken, supabase)
    }

    // Handle callback query
    if (update.callback_query) {
      await handleCallbackQuery(update.callback_query, botToken, supabase)
    }

    return new Response('OK', { status: 200 })

  } catch (error) {
    console.error('❌ Telegram webhook error:', error)
    return new Response('Internal server error', { status: 500 })
  }
})

async function handleMessage(message: any, botToken: string, supabase: any) {
  const chatId = message.chat.id
  const text = message.text
  const user = message.from

  console.log(`📱 Message from ${user.first_name} (${chatId}): ${text}`)

  // Save user to database
  await saveUserToDatabase(user, chatId, supabase)

  // Handle commands
  if (text?.startsWith('/')) {
    await handleCommand(text, chatId, botToken, supabase)
  } else {
    // Handle regular messages
    await handleRegularMessage(text, chatId, botToken, supabase)
  }
}

async function handleCommand(command: string, chatId: number, botToken: string, supabase: any) {
  console.log(`🤖 Handling command: ${command}`)

  switch (command) {
    case '/start':
      await sendWelcomeMessage(chatId, botToken)
      break
    
    case '/language':
      await sendLanguageSelection(chatId, botToken)
      break
    
    case '/menu':
      await sendMainMenu(chatId, botToken)
      break
    
    case '/help':
      await sendHelpMessage(chatId, botToken)
      break
    
    default:
      await sendUnknownCommand(chatId, botToken)
  }
}

async function handleRegularMessage(text: string, chatId: number, botToken: string, supabase: any) {
  // Check if user is in language selection mode
  const userState = await getUserState(chatId, supabase)
  
  if (userState?.state === 'selecting_language') {
    await handleLanguageSelection(text, chatId, botToken, supabase)
  } else {
    // Default response
    await sendDefaultMessage(chatId, botToken)
  }
}

async function handleCallbackQuery(callbackQuery: any, botToken: string, supabase: any) {
  const chatId = callbackQuery.message?.chat?.id
  const data = callbackQuery.data
  const user = callbackQuery.from

  console.log(`🔘 Callback query from ${user.first_name}: ${data}`)

  if (!chatId) return

  // Answer callback query
  await answerCallbackQuery(callbackQuery.id, botToken)

  // Handle callback data
  switch (data) {
    case 'open_mini_app':
      await sendMiniAppButton(chatId, botToken)
      break
    
    case 'uzbek':
    case 'russian':
    case 'english':
      await handleLanguageSelection(data, chatId, botToken, supabase)
      break
    
    default:
      console.log(`Unknown callback data: ${data}`)
  }
}

async function sendWelcomeMessage(chatId: number, botToken: string) {
  const message = `
🏠 *Xush kelibsiz, Eurodoor botiga!*

Men sizga buyurtmalaringiz haqida ma'lumot beraman va yangi buyurtmalar berishga yordam beraman.

Avval tilni tanlang:
  `

  await sendMessage(chatId, message, botToken, {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "🇺🇿 O'zbek tili", callback_data: "uzbek" },
          { text: "🇷🇺 Русский", callback_data: "russian" }
        ],
        [
          { text: "🇺🇸 English", callback_data: "english" }
        ]
      ]
    }
  })
}

async function sendLanguageSelection(chatId: number, botToken: string) {
  const message = `🌐 *Tilni tanlang / Выберите язык / Choose language*`

  await sendMessage(chatId, message, botToken, {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "🇺🇿 O'zbek tili", callback_data: "uzbek" },
          { text: "🇷🇺 Русский", callback_data: "russian" }
        ],
        [
          { text: "🇺🇸 English", callback_data: "english" }
        ]
      ]
    }
  })
}

async function sendMainMenu(chatId: number, botToken: string) {
  const message = `
🏠 *Eurodoor - Asosiy menyu*

Quyidagi imkoniyatlardan foydalaning:
  `

  await sendMessage(chatId, message, botToken, {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "🛒 Yangi buyurtma", callback_data: "open_mini_app" }
        ],
        [
          { text: "📋 Buyurtmalarim", callback_data: "my_orders" },
          { text: "👤 Profilim", callback_data: "my_profile" }
        ],
        [
          { text: "🌐 Tilni o'zgartirish", callback_data: "change_language" },
          { text: "❓ Yordam", callback_data: "help" }
        ]
      ]
    }
  })
}

async function sendMiniAppButton(chatId: number, botToken: string) {
  const message = `
🛒 *Yangi buyurtma berish*

Buyurtma berish uchun quyidagi tugmani bosing:
  `

  await sendMessage(chatId, message, botToken, {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "🛒 Eurodoor - Buyurtma berish",
            web_app: { url: "https://eurodoor.uz" }
          }
        ],
        [
          { text: "🔙 Orqaga", callback_data: "back_to_menu" }
        ]
      ]
    }
  })
}

async function sendHelpMessage(chatId: number, botToken: string) {
  const message = `
❓ *Yordam*

*Buyruqlar:*
/start - Botni qayta ishga tushirish
/menu - Asosiy menyu
/language - Tilni o'zgartirish
/help - Yordam

*Imkoniyatlar:*
• Yangi buyurtma berish
• Buyurtmalar holatini kuzatish
• Profil ma'lumotlarini ko'rish
• Buyurtma holati o'zgarishlarini olish

*Aloqa:*
📞 +998 90 123 45 67
🌐 www.eurodoor.uz
  `

  await sendMessage(chatId, message, botToken)
}

async function sendDefaultMessage(chatId: number, botToken: string) {
  const message = `
🤖 *Noma'lum buyruq*

Foydalanish uchun /menu buyrug'ini yuboring yoki quyidagi tugmalardan birini bosing.
  `

  await sendMessage(chatId, message, botToken, {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "🏠 Asosiy menyu", callback_data: "main_menu" }
        ]
      ]
    }
  })
}

async function sendUnknownCommand(chatId: number, botToken: string) {
  const message = `
❓ *Noma'lum buyruq*

Foydalanish uchun /menu buyrug'ini yuboring.
  `

  await sendMessage(chatId, message, botToken)
}

async function handleLanguageSelection(language: string, chatId: number, botToken: string, supabase: any) {
  // Save language preference
  await saveUserLanguage(chatId, language, supabase)

  const messages = {
    uzbek: "🇺🇿 *O'zbek tili tanlandi!*\n\nEndi asosiy menyuga o'tamiz:",
    russian: "🇷🇺 *Выбран русский язык!*\n\nТеперь переходим в главное меню:",
    english: "🇺🇸 *English selected!*\n\nNow going to main menu:"
  }

  const message = messages[language as keyof typeof messages] || messages.uzbek

  await sendMessage(chatId, message, botToken, {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "🛒 Yangi buyurtma", callback_data: "open_mini_app" }
        ],
        [
          { text: "📋 Buyurtmalarim", callback_data: "my_orders" },
          { text: "👤 Profilim", callback_data: "my_profile" }
        ]
      ]
    }
  })
}

// Helper functions
async function sendMessage(chatId: number, text: string, botToken: string, options: any = {}) {
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: 'Markdown',
      ...options
    })
  })

  if (!response.ok) {
    console.error('❌ Failed to send message:', await response.text())
  }
}

async function answerCallbackQuery(callbackQueryId: string, botToken: string) {
  const url = `https://api.telegram.org/bot${botToken}/answerCallbackQuery`
  
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      callback_query_id: callbackQueryId
    })
  })
}

async function saveUserToDatabase(user: any, chatId: number, supabase: any) {
  try {
    const { error } = await supabase
      .from('telegram_users')
      .upsert({
        chat_id: chatId,
        user_id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username,
        language_code: user.language_code,
        is_bot: user.is_bot,
        updated_at: new Date().toISOString()
      })

    if (error) {
      console.error('❌ Failed to save user:', error)
    } else {
      console.log('✅ User saved to database')
    }
  } catch (error) {
    console.error('❌ Error saving user:', error)
  }
}

async function saveUserLanguage(chatId: number, language: string, supabase: any) {
  try {
    const { error } = await supabase
      .from('telegram_users')
      .update({
        language: language,
        updated_at: new Date().toISOString()
      })
      .eq('chat_id', chatId)

    if (error) {
      console.error('❌ Failed to save language:', error)
    } else {
      console.log('✅ Language saved:', language)
    }
  } catch (error) {
    console.error('❌ Error saving language:', error)
  }
}

async function getUserState(chatId: number, supabase: any) {
  try {
    const { data, error } = await supabase
      .from('telegram_users')
      .select('state')
      .eq('chat_id', chatId)
      .single()

    if (error) {
      console.error('❌ Failed to get user state:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('❌ Error getting user state:', error)
    return null
  }
}
