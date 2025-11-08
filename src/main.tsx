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

registerSW({
  // /** true - пытается немедленно активировать регистрацию */
  immediate: true,
  // onNeedRefresh() {
  //   // показать пользователю UI — "Доступна новая версия"
  //   // например, сохранить функцию в state и показать кнопку "Обновить"
  //   // при клике вызвать updateSW(true)
  //   console.log('New SW available — prompt user to update');
  // },
  // onOfflineReady() {
  //   // опционально — показать "Приложение доступно оффлайн"
  //   console.log('App ready to work offline');
  // },
});

createRoot(rootHtmlElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
