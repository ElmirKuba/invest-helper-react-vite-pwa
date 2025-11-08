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

// регистрация PWA (выполнится сразу при импорте)
if (typeof window !== 'undefined') {
  // динамический импорт не обязателен для SPA, но безопасен для SSR-проекта
  import('./pwa');
}

createRoot(rootHtmlElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
