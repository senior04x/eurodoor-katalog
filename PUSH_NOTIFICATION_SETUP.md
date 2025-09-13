# 🔔 Eurodoor Push Notification Setup Guide

## Overview
This guide explains how to set up push notifications for the Eurodoor e-commerce website that work on iOS Safari and all other browsers when the site is closed.

## Prerequisites
- Supabase project with Edge Functions enabled
- VAPID keys for push notifications
- Web Push library access

## 1. PWA Manifest Setup ✅

### Files Created:
- `public/manifest.json` - PWA manifest with proper icons and settings
- Updated `index.html` with iOS Safari meta tags

### Key Features:
- `display: "standalone"` for app-like experience
- Proper icon sizes for iOS Safari
- Apple-specific meta tags for PWA installation

## 2. Service Worker Enhancement ✅

### File: `public/sw.js`
- Enhanced push event handling with detailed logging
- Proper notification display with vibration and timestamp
- Notification click handling to open orders page
- Background sync support

### Key Features:
- Detailed console logging for debugging
- Error handling for push notifications
- Vibration patterns for mobile devices
- `requireInteraction: true` for persistent notifications

## 3. Push Subscription Management ✅

### File: `src/lib/notificationService.ts`
- VAPID key support for push subscriptions
- Automatic subscription creation and server storage
- Enhanced debugging and error handling
- Test push notification functionality

### Key Features:
- Automatic push subscription on Service Worker registration
- Subscription storage in Supabase `push_subscriptions` table
- Detailed logging for debugging
- Fallback mechanisms for unsupported browsers

## 4. Supabase Edge Functions ✅

### Files Created:
- `supabase/functions/send-push-notification/index.ts` - Main push notification sender
- `supabase/functions/test-push-notification/index.ts` - Test notification endpoint

### Key Features:
- Web Push library integration
- VAPID key authentication
- User subscription management
- Error handling and logging

## 5. Database Schema ✅

### Files Created:
- `create-push-subscriptions-table.sql` - Push subscriptions table
- `create-push-notification-trigger.sql` - Automatic notification trigger

### Key Features:
- User-specific push subscription storage
- Automatic notification on order status changes
- RLS policies for security
- Postgres trigger for real-time notifications

## 6. Testing Interface ✅

### File: `src/components/Header.tsx`
- Added "Test Push Notification" button in user menu
- Enhanced debugging with console logs
- Error handling and user feedback

## Setup Instructions

### Step 1: Deploy Supabase Edge Functions
```bash
# Deploy the push notification functions
supabase functions deploy send-push-notification
supabase functions deploy test-push-notification
```

### Step 2: Set Environment Variables
In your Supabase project settings, add:
```
VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
VAPID_SUBJECT=mailto:admin@eurodoor.uz
```

### Step 3: Run Database Migrations
```sql
-- Run the SQL files in your Supabase SQL editor
-- 1. create-push-subscriptions-table.sql
-- 2. create-push-notification-trigger.sql
```

### Step 4: Generate VAPID Keys
```bash
# Install web-push globally
npm install -g web-push

# Generate VAPID keys
web-push generate-vapid-keys
```

### Step 5: Update VAPID Keys
Replace the placeholder VAPID keys in:
- `src/lib/notificationService.ts` (public key)
- `supabase/functions/send-push-notification/index.ts` (both keys)

## Testing

### 1. PWA Installation (iOS Safari)
1. Open the website in iOS Safari
2. Tap the Share button
3. Select "Add to Home Screen"
4. The app will be installed as a PWA

### 2. Push Notification Testing
1. Click "Test Push Notification" in the user menu
2. Check console logs for debugging information
3. Verify notification appears even when site is closed

### 3. Real Order Testing
1. Create an order in the customer panel
2. Change order status in admin panel
3. Verify push notification is received

## Debugging

### Console Logs to Monitor:
```
✅ Service Worker registered
✅ Push API supported
✅ Push subscription created
✅ Subscription saved to server
🧪 Test push notification sent
📱 Push event received
✅ Push notification shown successfully
```

### Common Issues:

#### 1. iOS Safari Notifications Not Working
- Ensure site is installed as PWA (Add to Home Screen)
- Check that manifest.json is properly configured
- Verify Apple-specific meta tags are present

#### 2. Push Subscription Fails
- Check VAPID keys are correct
- Verify user is authenticated
- Check Supabase permissions

#### 3. Notifications Not Appearing
- Check browser notification permissions
- Verify Service Worker is active
- Check console for error messages

## Browser Compatibility

### Full Support:
- Chrome/Edge (Desktop & Mobile)
- Firefox (Desktop & Mobile)
- Safari (Desktop)

### Limited Support:
- iOS Safari (requires PWA installation)
- Some mobile browsers

## Security Considerations

1. **VAPID Keys**: Keep private key secure
2. **RLS Policies**: Users can only access their own subscriptions
3. **Authentication**: All functions require user authentication
4. **CORS**: Proper CORS headers for cross-origin requests

## Performance Optimizations

1. **Debounce**: Prevents duplicate notifications (1000ms)
2. **Global Subscription**: Single subscription for all orders
3. **Service Worker Caching**: Offline notification support
4. **Background Sync**: Periodic updates when app is closed

## Monitoring

### Key Metrics:
- Push subscription creation rate
- Notification delivery success rate
- User engagement with notifications
- Service Worker registration success

### Logging:
- All push notification attempts are logged
- Error messages include detailed debugging info
- Console logs available for troubleshooting

## Future Enhancements

1. **Rich Notifications**: Add images and action buttons
2. **Notification History**: Track delivery status
3. **User Preferences**: Customizable notification settings
4. **Analytics**: Detailed notification performance metrics
5. **Multi-channel**: Email/SMS integration

---

This implementation provides a complete, production-ready push notification system that works across all platforms, including iOS Safari when installed as a PWA.
