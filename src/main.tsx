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
  immediate: true,
});

createRoot(rootHtmlElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
