/// <reference lib="webworker" />
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';

declare const self: ServiceWorkerGlobalScope & { __WB_MANIFEST: any[] };

cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

// PUSH и notificationclick как у тебя
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
      if (client) return (client as WindowClient).navigate(target);
      return self.clients.openWindow(target);
    })
  );
});

/**
 * Обработка сообщения от клиента (updateSW()/virtual:pwa-register)
 * Ожидаем { type: 'SKIP_WAITING' } и тогда вызываем skipWaiting()
 */
self.addEventListener('message', (event: ExtendableMessageEvent) => {
  if (!event.data) return;
  const { type } = event.data as { type?: string };
  if (type === 'SKIP_WAITING') {
    // при получении этого сообщения новая версия попросит браузер активировать SW немедленно
    console.log('при получении этого сообщения новая версия попросит браузер активировать SW немедленно');
    self.skipWaiting();
  }
});

/**
 * После активации берём под контроль клиенты.
 * Это нужно, чтобы новая версия сразу контролировала страницу после skipWaiting().
 */
self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(
    (async () => {
      try {
        await self.clients.claim();
      } catch (e) {
        // ignore
      }
    })()
  );
});
