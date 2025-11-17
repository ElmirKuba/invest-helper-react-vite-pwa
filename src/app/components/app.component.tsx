import { StrictMode, useState } from 'react';
import './app.component.css';

/** Основной компонент приложения */
export const AppComponent = () => {
  const [count, setCount] = useState(0);

  return (
    <StrictMode>
      <div className="app">
        <div>Счетчик: {count} (текущее кол-во)</div>
        <br />
        <br />
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
      </div>
    </StrictMode>
  );
};
