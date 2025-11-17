import { createRoot } from 'react-dom/client';
import { isNil } from 'lodash';

import './index.css';

import { AppComponent } from './app/components/app.component.tsx';

/** Корневой элемент для монтирования приложения */
const rootHtmlElement = document.getElementById('root');

if (isNil(rootHtmlElement)) {
  throw new Error('Корневой элемент не найден!');
}

createRoot(rootHtmlElement).render(<AppComponent />);

/**
 * TODO:
 * 1. Кэшировать данные из поля version json файла "version.json".
 * 2. Проверять (делать запрос на корень сайта/version.json), если отличается значение с локальным закэшированным, обновлять приложение (перезагружать страницу скорее всего).
 *    2.1. Когда? в onNeedRefresh
 *    2.1. Когда фокус снова на приложении (отследить, что приложение снова в фокусе)
 */
