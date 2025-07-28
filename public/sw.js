// Service Worker for Vidal Chat Notifications
const CACHE_NAME = 'vidal-chat-v1';

// Install event - cache important resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll([
          '/',
          '/icon.ico',
          '/notification-sound.mp3'
        ]);
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request);
      })
  );
});

// Push notification event
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New message received',
    icon: '/icon.ico',
    badge: '/icon.ico',
    tag: 'chat-notification',
    requireInteraction: false,
    actions: [
      {
        action: 'open',
        title: 'Open Chat'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Vidal Chat', options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow('/chat')
    );
  }
});

// Background sync for offline support
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Handle background sync
      console.log('Background sync triggered')
    );
  }
}); 