import { registerSW } from 'virtual:pwa-register';

export function registerPWA() {
  const updateSW = registerSW({
    onNeedRefresh() {
      try {
        const ok = window.confirm('Доступна новая версия. Обновить сейчас?');
        if (ok) {
          console.log('updateSW: ', updateSW, typeof updateSW);
          if (typeof updateSW === 'function') {
            updateSW(true);
          } else {
            console.warn('updateSW не доступна — пробуем принудительно обновить через navigator.serviceWorker');
            navigator.serviceWorker?.getRegistration().then((reg) => {
              reg?.waiting?.postMessage({ type: 'SKIP_WAITING' });
              window.location.reload();
            });
          }
        } else {
          console.log('[INF]: Пользователь отклонил обновление — остаётся старая версия.');
        }
      } catch (e) {
        console.log('[ERR]: Ошибка при onNeedRefresh:', e);
      }
    },
    onOfflineReady() {
      console.log('[INF]: App ready for offline use');
    },
  });

  return updateSW;
}
