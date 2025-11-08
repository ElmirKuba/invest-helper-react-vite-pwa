import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { isNil } from 'lodash';

import './index.css';

import App from './App.tsx';

/** Корневой элемент для монтирования приложения */
const rootHtmlElement = document.getElementById('root');

if (isNil(rootHtmlElement)) {
  throw new Error('Корневой элемент не найден!');
}

// Оборачиваем регистрацию PWA — если что-то пойдёт не так,
// мы просто логируем и продолжаем рендер приложения.
(async () => {
  window.addEventListener('error', (ev) => {
    // предотвратить всплытие в консоли как фатальную ошибку (DevTools всё равно покажет),
    // но в проде можно сюда отправлять небольшие логи.
    // eslint-disable-next-line no-console
    console.debug('Captured window.error:', ev.message, ev.filename, ev.lineno);
  });

  window.addEventListener('unhandledrejection', (ev) => {
    // eslint-disable-next-line no-console
    console.debug('Captured unhandledrejection:', ev.reason);
  });

  try {
    if (typeof window !== 'undefined') {
      await import('./pwa'); // динамический импорт — безопасно
    }
  } catch (err) {
    // Не бросаем — логируем и идём дальше.
    // В проде можно заменить console.warn на лог в ваш сервер/сервис логирования.
    // eslint-disable-next-line no-console
    console.warn('PWA registration failed (ignored):', err);
  }

  createRoot(rootHtmlElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
})();
