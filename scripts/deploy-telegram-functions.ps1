# Deploy Telegram notification functions to Supabase
Write-Host "🚀 Deploying Telegram notification functions to Supabase..." -ForegroundColor Green

# Check if Supabase CLI is installed
try {
    $null = Get-Command supabase -ErrorAction Stop
    Write-Host "✅ Supabase CLI found" -ForegroundColor Green
} catch {
    Write-Host "❌ Supabase CLI is not installed. Please install it first:" -ForegroundColor Red
    Write-Host "npm install -g supabase" -ForegroundColor Yellow
    exit 1
}

# Check if user is logged in
try {
    $null = supabase projects list 2>$null
    Write-Host "✅ Supabase CLI authenticated" -ForegroundColor Green
} catch {
    Write-Host "❌ Please login to Supabase first:" -ForegroundColor Red
    Write-Host "supabase login" -ForegroundColor Yellow
    exit 1
}

# Deploy send-telegram-notification function
Write-Host "📱 Deploying send-telegram-notification function..." -ForegroundColor Cyan
$result1 = supabase functions deploy send-telegram-notification

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ send-telegram-notification function deployed successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to deploy send-telegram-notification function" -ForegroundColor Red
    exit 1
}

# Deploy trigger-telegram-notification function
Write-Host "🔔 Deploying trigger-telegram-notification function..." -ForegroundColor Cyan
$result2 = supabase functions deploy trigger-telegram-notification

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ trigger-telegram-notification function deployed successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to deploy trigger-telegram-notification function" -ForegroundColor Red
    exit 1
}

# Deploy telegram-webhook function
Write-Host "🤖 Deploying telegram-webhook function..." -ForegroundColor Cyan
$result3 = supabase functions deploy telegram-webhook

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ telegram-webhook function deployed successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to deploy telegram-webhook function" -ForegroundColor Red
    exit 1
}

# Deploy admin-trigger-telegram function
Write-Host "👨‍💼 Deploying admin-trigger-telegram function..." -ForegroundColor Cyan
$result4 = supabase functions deploy admin-trigger-telegram

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ admin-trigger-telegram function deployed successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to deploy admin-trigger-telegram function" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🎉 All Telegram functions deployed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Yellow
Write-Host "1. Set TELEGRAM_BOT_TOKEN in Supabase dashboard:" -ForegroundColor White
Write-Host "   - Go to Project Settings > Edge Functions > Environment Variables" -ForegroundColor Gray
Write-Host "   - Add: TELEGRAM_BOT_TOKEN = 8297997191:AAEuIB8g0FH9Yk0waqmPsUgrFDXm5rL83OU" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Test the functions:" -ForegroundColor White
Write-Host "   - Go to Profile page in your app" -ForegroundColor Gray
Write-Host "   - Click 'Telegram Bot Test'" -ForegroundColor Gray
Write-Host "   - Enter a phone number and send test message" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Configure your Telegram bot:" -ForegroundColor White
Write-Host "   - Make sure your bot can receive messages" -ForegroundColor Gray
Write-Host "   - Set up webhook if needed" -ForegroundColor Gray
Write-Host ""
Write-Host "🔗 Function URLs:" -ForegroundColor Yellow
Write-Host "   - send-telegram-notification: https://your-project.supabase.co/functions/v1/send-telegram-notification" -ForegroundColor Gray
Write-Host "   - trigger-telegram-notification: https://your-project.supabase.co/functions/v1/trigger-telegram-notification" -ForegroundColor Gray
Write-Host "   - telegram-webhook: https://your-project.supabase.co/functions/v1/telegram-webhook" -ForegroundColor Gray
Write-Host "   - admin-trigger-telegram: https://your-project.supabase.co/functions/v1/admin-trigger-telegram" -ForegroundColor Gray
Write-Host ""
Write-Host "🤖 Bot Webhook Setup:" -ForegroundColor Yellow
Write-Host "   Set webhook URL in BotFather:" -ForegroundColor White
Write-Host "   https://api.telegram.org/bot8297997191:AAEuIB8g0FH9Yk0waqmPsUgrFDXm5rL83OU/setWebhook" -ForegroundColor Gray
Write-Host "   -d url=https://your-project.supabase.co/functions/v1/telegram-webhook" -ForegroundColor Gray
