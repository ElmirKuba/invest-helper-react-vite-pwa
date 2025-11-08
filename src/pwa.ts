// src/pwa.ts
// Регистрация PWA + периодические проверки на новую версию (каждые 5 минут)
// + безопасный flow активации новой версии по подтверждению пользователя.
//
// Внимание: принудительное unregister() / register() — небезопасно и отключено (см. ниже).

import { registerSW } from 'virtual:pwa-register';
import { compareVersions, cacheVersionOnStartup } from './version-check';

// const CHECK_INTERVAL_MS = 5 * 60 * 1000; // 5 минут
const CHECK_INTERVAL_MS = 30 * 1000; // 30sec (для продакшна поставьте 5*60*1000)
const PROMPT_THROTTLE_MS = 10 * 60 * 1000; // не показывать prompt чаще чем раз в 10 минут
const CONTROLLER_CHANGE_TIMEOUT = 3500; // ms — ждём controllerchange (iOS может блокировать)

// локальная переменная-замыкание от registerSW
// let updateSW: ((reloadPage?: boolean) => Promise<void>) | undefined;
let lastPromptAt = 0;

// Вспомогательная функция — аккуратно запускает flow обновления при наличии waiting registration
async function attemptActivateWaiting(reg: ServiceWorkerRegistration | undefined) {
  if (!reg) return;

  // Если нет waiting - ничего не делаем
  if (!reg.waiting) return;

  const now = Date.now();
  if (now - lastPromptAt < PROMPT_THROTTLE_MS) {
    // Защита от частых prompt'ов
    console.log('[pwa] skipped prompt — throttled');
    return;
  }

  lastPromptAt = now;

  // Покажем простой confirm (можно заменить на кастомный UI)
  const ok = confirm('Доступна новая версия приложения. Обновить сейчас?');
  if (!ok) {
    console.log('[pwa] user declined update (keeps waiting SW)');
    // оставляем waiting как есть (контролируемое обновление)
    return;
  }

  try {
    // Попросим waiting SW вызвать skipWaiting
    reg.waiting.postMessage?.({ type: 'SKIP_WAITING' });

    // Ждём controllerchange (новый SW возьмёт управление)
    await new Promise<void>((resolve, reject) => {
      let handled = false;

      const onControllerChange = () => {
        if (handled) return;
        handled = true;
        navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
        // немного подождать перед reload чтобы контроллер точно применился
        setTimeout(() => resolve(), 200);
      };

      navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);

      // таймаут — если controllerchange не наступил, reject
      setTimeout(() => {
        if (!handled) {
          navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
          reject(new Error('controllerchange timeout'));
        }
      }, CONTROLLER_CHANGE_TIMEOUT);
    });

    // Если дошли сюда — контроллер сменился, делаем перезагрузку чтобы загрузить новые ассеты
    location.reload();
  } catch (err) {
    console.log('[pwa] activation fallback — controllerchange not fired or failed', err);
    // Обычно это iOS Home Screen: показать пользовательскую инструкцию
    alert(
      'Обновление не удалось автоматически. ' +
        'На некоторых устройствах (iOS) требуется полностью закрыть приложение (смахнуть вверх в переключателе задач) и открыть снова, чтобы применить обновление.'
    );
    // В этом случае reg.waiting остаётся в waiting — повторные периодические проверки предложат обновление снова
  }
}

// Главная логика регистрации
registerSW({
  immediate: true,
  onNeedRefresh() {
    // этот callback срабатывает, когда vite-plugin-pwa увидел новую версию
    // делаем стандартный prompt/flow (переиспользуем attemptActivateWaiting)
    (async () => {
      try {
        const reg = await navigator.serviceWorker.getRegistration();
        await attemptActivateWaiting(reg ?? undefined);
      } catch (e) {
        console.log('[pwa] onNeedRefresh error', e);
      }
    })();
  },
  onOfflineReady() {
    console.log('[pwa] offline ready');
  },
});

// Периодическая проверка: вызывает registration.update() и, если есть waiting — показывает prompt
async function periodicCheckLoop() {
  console.log('Я выполнился (periodicCheckLoop)');
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;

  try {
    // убедимся, что при первом заходе мы закешировали server copy в runtime-cache
    try {
      await cacheVersionOnStartup();
    } catch (e) {
      console.debug('[pwa] cacheVersionOnStartup error', e);
    }

    try {
      const { cachedVersion, remoteVersion, isDifferent } = await compareVersions();
      console.log('я сравниваю версии', { cachedVersion, remoteVersion, isDifferent });
      if (isDifferent) {
        // throttle prompt внутри attemptActivateWaiting, но тут — показываем сначала prompt о новой версии
        const ok = confirm(
          `Доступна новая версия приложения.\n` +
            `Установленная версия: ${cachedVersion}\n` +
            `Серверная версия: ${remoteVersion}\n\n` +
            `Обновить сейчас?`
        );

        if (ok) {
          const reg = await navigator.serviceWorker.getRegistration();
          // попробуем стандартный flow: если есть waiting — активируем; если нет — вызвать reg.update()
          if (reg?.waiting) {
            await attemptActivateWaiting(reg);
          } else {
            try {
              await reg?.update();
              if (reg?.waiting) {
                await attemptActivateWaiting(reg);
              } else {
                // fallback — перезагрузить страницу (возможно новые ассеты не применятся без SW, но попробуем)
                location.reload();
              }
            } catch {
              location.reload();
            }
          }
        } else {
          // пользователь отклонил — ничего не делаем (throttle защитит от спама)
        }
      }
    } catch (e) {
      // ignore version check errors
      console.debug('[pwa] version check failed', e);
    }

    const reg = await navigator.serviceWorker.getRegistration();
    console.log('getRegistration', reg);
    if (reg) {
      try {
        await reg.update();
      } catch (e) {}

      if (reg.waiting) {
        attemptActivateWaiting(reg);
      }
    }
  } catch (e) {
    console.log('[pwa] periodicCheckLoop failed', e);
  } finally {
    // следующая проверка через CHECK_INTERVAL_MS
    setTimeout(periodicCheckLoop, CHECK_INTERVAL_MS);
  }
}

// Запустить цикл (не дожидаясь рендера)
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  // Небольшая задержка чтобы регистрация успела, а затем стартуем цикл
  setTimeout(() => {
    periodicCheckLoop();
  }, 1500);
}

/* ========== ВНИМАНИЕ: "экспериментальная / опасная" функция ========== 
   Ниже — пример того, как можно пробовать делать unregister() + последующую регистрацию скриптом.
   Это **не рекомендуется** в проде: может привести к временному отсутствию контролирующего SW,
   потерям кэшированных данных, странному поведению на iOS/Android. Оставил как закомментированный
   инструмент для экспериментов. Если захотите включить — убедитесь, что понимаете риски.
*/

// async function bruteForceReinstall() {
//   if (!('serviceWorker' in navigator)) return;
//   try {
//     const reg = await navigator.serviceWorker.getRegistration();
//     if (reg) {
//       // попытка удалить SW
//       await reg.unregister();
//       console.log('[pwa] unregistered');
//     }
//     // затем пробуем снова зарегистрировать (virtual:pwa-register уже инициировал регистрацию в начале файла)
//     // но можно явно вызвать updateSW
//     await updateSW?.(false);
//     console.log('[pwa] re-register attempt done');
//   } catch (e) {
//     console.log('[pwa] bruteForceReinstall failed', e);
//   }
// }

// export { bruteForceReinstall };

export {};
