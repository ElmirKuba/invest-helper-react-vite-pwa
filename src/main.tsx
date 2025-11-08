import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { isNil } from 'lodash';
import { registerSW } from 'virtual:pwa-register';

import './index.css';

import App from './App.tsx';

/** Корневой элемент для монтирования приложения */
const rootHtmlElement = document.getElementById('root');

if (isNil(rootHtmlElement)) {
  throw new Error('Корневой элемент не найден!');
}

const updateSW = registerSW({
  // /** true - пытается немедленно активировать регистрацию */
  // immediate: true,
  onNeedRefresh() {
    // лучше — сохранить флаг в state и показать пользователю кнопку
    // Пример простого prompt:
    if (confirm('Доступна новая версия приложения. Обновить сейчас?')) {
      updateSW(true); // активируем новую версию
    }
  },
  onOfflineReady() {
    console.log('Приложение доступно оффлайн');
  },
});

createRoot(rootHtmlElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
