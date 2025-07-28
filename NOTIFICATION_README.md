# Notification System for Vidal Chat

## Overview

This notification system provides comprehensive browser notifications with sound and mobile support for the Vidal Chat application. It includes:

- Browser notifications with sound
- Mobile vibration support
- Settings icon visible on mobile devices
- Permission management
- Service worker for background notifications

## Features

### 1. Browser Notifications
- Chrome, Firefox, Safari, and Edge support
- Custom notification sounds using Web Audio API
- Permission request handling
- Auto-dismiss after 5 seconds

### 2. Mobile Support
- Vibration feedback on mobile devices
- Floating settings button always visible on mobile
- Responsive design for all screen sizes
- Touch-friendly interface

### 3. Settings Management
- Enable/disable notifications
- Toggle sound effects
- Browser notification controls
- Mobile vibration settings
- Test notification functionality

## Components

### NotificationManager (`lib/notificationUtils.ts`)
Singleton class that handles:
- Browser notification permissions
- Audio context and sound generation
- Settings persistence in localStorage
- Mobile device detection
- Service worker registration

### NotificationSettings (`components/chat/NotificationSettings.tsx`)
React component that provides:
- Settings dialog interface
- Permission status display
- Toggle controls for all settings
- Test notification button
- Mobile-responsive design

## Usage

### In Chat Interface
The notification system is automatically integrated into the ChatInterface component:

```tsx
import { notificationManager } from '@/lib/notificationUtils';
import NotificationSettings from './NotificationSettings';

// Settings icon appears in header and as floating button on mobile
<NotificationSettings className="h-8 w-8" />
```

### Manual Notification
```tsx
import { notificationManager } from '@/lib/notificationUtils';

// Send a chat notification
await notificationManager.sendChatNotification('Sender Name', 'Message content');

// Send a custom notification
await notificationManager.sendNotification('Title', {
  body: 'Message body',
  icon: '/icon.ico'
});
```

## Mobile Implementation

### Floating Settings Button
- Always visible on mobile devices (lg:hidden)
- Fixed position at bottom-right
- Blue background with white icon
- Shadow and hover effects
- Touch-friendly size (48px)

### CSS Styling
```css
.notification-settings-button {
  position: fixed !important;
  bottom: 1rem !important;
  right: 1rem !important;
  z-index: 1000 !important;
  width: 3rem !important;
  height: 3rem !important;
  border-radius: 50% !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
}
```

## Service Worker

The service worker (`public/sw.js`) provides:
- Background notification handling
- Offline caching
- Push notification support
- Click event handling

## Browser Compatibility

### Supported Features
- ✅ Chrome/Chromium (all features)
- ✅ Firefox (notifications + sound)
- ✅ Safari (notifications + sound)
- ✅ Edge (notifications + sound)
- ✅ Mobile browsers (notifications + vibration)

### Fallbacks
- Audio context not supported → Browser default sounds
- Notifications not supported → Silent mode
- Vibration not supported → Sound only

## Settings Persistence

All notification settings are stored in localStorage:
```javascript
{
  enabled: true,
  sound: true,
  browserNotifications: true,
  mobileNotifications: true
}
```

## Permission Handling

The system automatically:
1. Checks for notification support
2. Requests permission on first load
3. Shows permission status in settings
4. Provides guidance for denied permissions

## Testing

Use the "Test Notification" button in settings to:
- Verify notification permissions
- Test sound generation
- Check mobile vibration
- Confirm settings are working

## Troubleshooting

### Notifications not working?
1. Check browser permissions
2. Ensure notifications are enabled in settings
3. Try the test notification button
4. Check browser console for errors

### No sound on mobile?
1. Ensure device is not on silent mode
2. Check if sound is enabled in settings
3. Try increasing device volume
4. Some mobile browsers require user interaction for audio

### Settings button not visible?
1. Check if notifications are supported
2. Ensure you're on a mobile device
3. Check CSS is loading properly
4. Verify component is mounted

## Future Enhancements

- Push notification support
- Custom notification sounds
- Notification history
- Advanced mobile features
- Offline notification queuing 