import { StrictMode, useEffect, useState } from 'react';
import './app.component.css';
import { useReturnToTab } from '../hooks/use-return-to-tab.hook';

/** Основной компонент приложения */
export const AppComponent = () => {
  const [count, setCount] = useState(0);
  const [usedCount, setUsedCount] = useState(0);
  const [lastUsedUnixTime, setLastUsedUnixTime] = useState(0);

  useEffect(() => {
    console.log('AppComponent родился!');
  }, []);

  useReturnToTab(
    () => {
      setUsedCount(usedCount + 1);
      setLastUsedUnixTime(Date.now);

      navigator.serviceWorker.getRegistration().then(async (reg: ServiceWorkerRegistration | undefined) => {
        console.log('reg getRegistration:::', reg);
      });
    },
    { cooldownMs: 5_000, debounceMs: 150 }
  );

  const activeSWForButton = async () => {
    (async () => {
      if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
        window.addEventListener('load', async () => {
          try {
            const { registerPWA } = await import('./../../pwa');
            registerPWA();

            const isStandalone =
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone === true;

            console.log('[LOG]: PWA registration attempted. Standalone mode:', isStandalone);
          } catch (err) {
            console.log('[ERR]: Ошибка регистрации PWA:', err);
          }
        });
      }
    })();
  };

  return (
    <StrictMode>
      <div className="app">
        <div>Счетчик: {count} (текущее кол-во)</div>
        <br />
        <br />
        <div>С приложением взаимодействовали: {usedCount} раз</div>
        <div>unixtime последнего использования: {lastUsedUnixTime}</div>
        <div>Произошло обновление функционала: 3</div>
        <br />
        <br />
        <button
          onClick={() => {
            setCount(count + 1);
          }}
        >
          Нажать для инкримента
        </button>
        <button
          onClick={() => {
            setCount(count - 1);
          }}
        >
          Нажать для декремента
        </button>
        <br />
        <button onClick={activeSWForButton}>Активировать SW</button>
      </div>
    </StrictMode>
  );
};
