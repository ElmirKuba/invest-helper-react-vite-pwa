/// <reference lib="webworker" />
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
// import { clientsClaim } from 'workbox-core';

declare const self: ServiceWorkerGlobalScope & { __WB_MANIFEST: any[] };

cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

// НЕ вызывайте здесь функцию skipWaiting(), если хотите, чтобы она работала быстрее;
// Функция skipWaiting() предназначена для типа регистрации с автоматическим обновлением.

// clientsClaim используется только в том случае, если вы хотите, чтобы SW управлял страницами после активации
// clientsClaim() // <-- не вызывайте, если вам нужно быстрое поведение

self.addEventListener('push', (event: PushEvent) => {
  const data = event.data?.json?.() ?? { title: 'Новое уведомление', body: '' };
  const title = data.title || 'Новое уведомление';
  const options: NotificationOptions = {
    body: data.body || '',
    icon: '/icons/192.png',
    data: data.url || '/',
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close();
  const target = event.notification.data || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      const client = clients.find((c) => (c as WindowClient).visibilityState === 'visible');
      if (client) {
        return (client as WindowClient).navigate(target);
      }
      return self.clients.openWindow(target);
    })
  );
});
