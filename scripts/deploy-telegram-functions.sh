#!/bin/bash

# Deploy Telegram notification functions to Supabase
echo "🚀 Deploying Telegram notification functions to Supabase..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed. Please install it first:"
    echo "npm install -g supabase"
    exit 1
fi

# Check if user is logged in
if ! supabase projects list &> /dev/null; then
    echo "❌ Please login to Supabase first:"
    echo "supabase login"
    exit 1
fi

# Deploy send-telegram-notification function
echo "📱 Deploying send-telegram-notification function..."
supabase functions deploy send-telegram-notification

if [ $? -eq 0 ]; then
    echo "✅ send-telegram-notification function deployed successfully"
else
    echo "❌ Failed to deploy send-telegram-notification function"
    exit 1
fi

# Deploy trigger-telegram-notification function
echo "🔔 Deploying trigger-telegram-notification function..."
supabase functions deploy trigger-telegram-notification

if [ $? -eq 0 ]; then
    echo "✅ trigger-telegram-notification function deployed successfully"
else
    echo "❌ Failed to deploy trigger-telegram-notification function"
    exit 1
fi

echo ""
echo "🎉 All Telegram functions deployed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Set TELEGRAM_BOT_TOKEN in Supabase dashboard:"
echo "   - Go to Project Settings > Edge Functions > Environment Variables"
echo "   - Add: TELEGRAM_BOT_TOKEN = 8297997191:AAEuIB8g0FH9Yk0waqmPsUgrFDXm5rL83OU"
echo ""
echo "2. Test the functions:"
echo "   - Go to Profile page in your app"
echo "   - Click 'Telegram Bot Test'"
echo "   - Enter a phone number and send test message"
echo ""
echo "3. Configure your Telegram bot:"
echo "   - Make sure your bot can receive messages"
echo "   - Set up webhook if needed"
echo ""
echo "🔗 Function URLs:"
echo "   - send-telegram-notification: https://your-project.supabase.co/functions/v1/send-telegram-notification"
echo "   - trigger-telegram-notification: https://your-project.supabase.co/functions/v1/trigger-telegram-notification"
