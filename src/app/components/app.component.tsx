import { StrictMode, useEffect, useState } from 'react';
import './app.component.css';
import { useReturnToTab } from '../hooks/use-return-to-tab.hook';

/** Основной компонент приложения */
export const AppComponent = () => {
  /**
   * Счётчик кликов.
   * @type {[number, React.Dispatch<React.SetStateAction<number>>]}
   */
  const [count, setCount] = useState<number>(0);
  const [usedCount, setUsedCount] = useState(0);
  const [lastUsedUnixTime, setLastUsedUnixTime] = useState(0);

  const reactivateSW = async () => {
    const serviceWorkers = await window.navigator.serviceWorker.getRegistrations();

    for (const sw of serviceWorkers) {
      const resultUpdate = await sw.update();

      console.log('resultUpdate::', resultUpdate);
    }
  };

  const activateSWForInitApp = async () => {
    (async () => {
      if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
        window.addEventListener('load', async () => {
          try {
            import('../../pwa').then(({ registerPWA }) => {
              registerPWA();

              const isStandalone =
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone === true;

              console.log('[LOG]: PWA registration attempted. Standalone mode:', isStandalone);
            });
          } catch (err) {
            console.log('[ERR]: Ошибка регистрации PWA:', err);
          }
        });
      }
    })();
  };

  useEffect(() => {
    console.log('AppComponent родился!');

    void activateSWForInitApp();
  }, []);

  useReturnToTab(
    () => {
      setUsedCount(usedCount + 1);
      setLastUsedUnixTime(Date.now);

      navigator.serviceWorker.getRegistration().then(async (reg: ServiceWorkerRegistration | undefined) => {
        console.log('reg getRegistration:::', reg);

        reactivateSW();
      });
    },
    { cooldownMs: 5_000, debounceMs: 150 }
  );

  return (
    <StrictMode>
      <div className="app">
        <div>Счетчик: {count} (текущее кол-во)</div>
        <br />
        <br />
        <div>С приложением взаимодействовали: {usedCount} раз</div>
        <div>unixtime последнего использования: {lastUsedUnixTime}</div>
        <br />
        <br />
        <div>Мы победили это долбанное PWA:D!!!</div>
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
      </div>
    </StrictMode>
  );
};
