import { StrictMode, useState } from 'react';
import './App.css';

/** Основной компонент приложения */
function App() {
  const [count, setCount] = useState(0);

  return (
    <StrictMode>
      <div className="App">
        <div>Счетчик: {count} (сколько раз нажали)</div>
        <br />
        <br />
        <div>Произошло обновление функционала: 1</div>
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
}

export default App;
