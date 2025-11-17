import { useCallback, useEffect, useRef } from 'react';

type Opts = {
  /**
   * минимальный интервал между вызовами обработчика (ms)
   */
  cooldownMs?: number;
  /**
   * задержка debounce перед вызовом (ms)
   */
  debounceMs?: number;
  /**
   * слушать ли события (default true)
   */
  enabled?: boolean;
};

export function useReturnToTab(onReturn: () => void | Promise<void>, opts: Opts = {}) {
  const { cooldownMs = 60_000, debounceMs = 150, enabled = true } = opts;
  const lastCalledRef = useRef(0);
  const timerRef = useRef<number | null>(null);
  const mountedRef = useRef(true);

  const invoke = useCallback(() => {
    if (!enabled) return;
    const now = Date.now();
    if (now - (lastCalledRef.current || 0) < cooldownMs) return;
    lastCalledRef.current = now;

    // вызов обработчика в microtask, ловим ошибки
    Promise.resolve()
      .then(() => onReturn())
      .catch((e) => {
        console.error('useReturnToTab onReturn error', e);
      });
  }, [onReturn, cooldownMs, enabled]);

  const schedule = useCallback(
    (delay = debounceMs) => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      timerRef.current = window.setTimeout(() => {
        timerRef.current = null;
        if (!mountedRef.current) return;
        // дополнительно проверяем, действительно ли вкладка видима/в фокусе
        try {
          if (typeof document !== 'undefined' && document.visibilityState !== 'visible') {
            return;
          }
          if (typeof document !== 'undefined' && !document.hasFocus()) {
            // в некоторых случаях focus не требуется, но проверку можно оставить
            // если не хочется strict-check — замените условие на true
            return;
          }
        } catch (e) {
          // ignore
        }
        invoke();
      }, delay);
    },
    [debounceMs, invoke]
  );

  useEffect(() => {
    mountedRef.current = true;

    function onVisibilityChange() {
      if (document.visibilityState === 'visible') schedule();
    }
    function onFocus() {
      schedule(100);
    }
    function onPageshow(_e: PageTransitionEvent) {
      // pageshow.persisted true — восстановление из bfcache, но проверим в любом случае
      schedule(100);
    }
    function onOnline() {
      schedule(0);
    }

    if (enabled) {
      document.addEventListener('visibilitychange', onVisibilityChange, { passive: true });
      window.addEventListener('focus', onFocus, { passive: true });
      window.addEventListener('pageshow', onPageshow, { passive: true });
      window.addEventListener('online', onOnline, { passive: true });

      // если при монтировании уже видим и в фокусе — запустим один раз
      if (typeof document !== 'undefined' && document.visibilityState === 'visible' && document.hasFocus()) {
        schedule(0);
      }
    }

    return () => {
      mountedRef.current = false;
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('pageshow', onPageshow);
      window.removeEventListener('online', onOnline);
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [enabled, schedule]);

  // Возвращать ничего не нужно — hook только инициирует callback по событию
}
