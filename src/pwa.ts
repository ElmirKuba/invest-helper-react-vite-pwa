// src/pwa.ts
import { registerSW } from 'virtual:pwa-register';

/**
 * Тип для функции обновления Service Worker.
 * По документации registerSW возвращает функцию вида (reload?: boolean) => Promise<void>
 */
type UpdateSW = (reload?: boolean) => Promise<void>;

/**
 * Безопасная "заглушка" — гарантируем, что updateSW всегда будет функцией.
 * Это позволяет не получать ошибку "Object is possibly 'undefined'".
 */
let updateSW: UpdateSW = () => Promise.resolve();

/**
 * Регистрируем SW. registerSW обычно возвращает функцию обновления,
 * поэтому перезаписываем нашу переменную на реальную реализацию.
 */
updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    const agree = confirm('Доступна новая версия приложения. Обновить сейчас?');
    if (!agree) {
      console.log('Пользователь отказался обновиться — новая версия остаётся в статусе waiting.');
      return;
    }

    // Вызываем функцию обновления. Поскольку updateSW у нас гарантированно функция,
    // TypeScript проблем не выдаст.
    updateSW(true)
      .then(() => {
        // Небольшой запасной reload — повышает надёжность обновления в реальных условиях.
        setTimeout(() => {
          try {
            location.reload();
          } catch (e) {
            /* no-op */
          }
        }, 300);
      })
      .catch(() => {
        // В случае ошибки — всё равно пробуем перезагрузиться.
        try {
          location.reload();
        } catch (e) {
          /* no-op */
        }
      });
  },
  onOfflineReady() {
    console.log('Приложение готово работать оффлайн.');
  },
}) as unknown as UpdateSW;
