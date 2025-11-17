import { registerSW } from 'virtual:pwa-register';

export function registerPWA() {
  const updateSW = registerSW({
    onNeedRefresh() {
      try {
        const ok = window.confirm('Доступна новая версия. Обновить сейчас?');
        if (ok) {
          console.log('updateSW: ', updateSW, typeof updateSW);
          if (typeof updateSW === 'function') {
            // Обычно работает: updateSW(true) -> попытается применить обновление и перезагрузить
            updateSW(true).catch((e) => {
              console.log('updateSW() rejected', e);
              // запасной путь ниже
              forceSkipWaitingAndReload();
            });
          } else {
            // запасной вариант
            forceSkipWaitingAndReload();
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

  return { updateSW };
}

export async function forceSkipWaitingAndReload() {
  try {
    const reg = await navigator.serviceWorker.getRegistration();
    if (reg?.waiting) {
      // посылаем сообщение, как ожидает наш sw.ts
      reg.waiting.postMessage({ type: 'SKIP_WAITING' });
      // после активации нужно перезагрузить страницу, чтобы загрузить новые ресурсы контролируемые SW
      // даём немного времени на активацию
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } else {
      // если нет waiting — просто перезагрузим
      window.location.reload();
    }
  } catch (err) {
    console.log('forceSkipWaitingAndReload err', err);
    window.location.reload();
  }
}
