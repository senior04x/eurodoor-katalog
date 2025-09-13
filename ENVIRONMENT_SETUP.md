# Environment Variables Setup

## Frontend (.env.local)
```bash
VITE_VAPID_PUBLIC_KEY=your_vapid_public_key_here
```

## Supabase Edge Functions
Set these in your Supabase project settings:

```bash
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
```

## VAPID Keys Generation
Generate VAPID keys using:
```bash
npx web-push generate-vapid-keys
```

## Health Checks
After deployment, verify:
1. `https://yourdomain.com/sw.js` - NOT 404
2. `https://yourdomain.com/manifest.json` - Valid JSON
3. `https://yourdomain.com/icons/icon-192.png` - Real PNG file
4. `https://yourdomain.com/icons/icon-512.png` - Real PNG file

## iOS PWA Testing
1. Install PWA via "Add to Home Screen"
2. Enable Notifications in iOS Settings → Eurodoor (PWA app)
3. Test push notifications

## cURL Test
```bash
curl -X POST "https://your-project-id.functions.supabase.co/send-push-notification" \
-H "Content-Type: application/json" \
-H "Authorization: Bearer your-service-role-key" \
-d '{"user_id":"user-uuid","title":"Eurodoor","body":"Test","tag":"test","icon":"/favicon.ico","url":"/en/orders.html"}'
```
