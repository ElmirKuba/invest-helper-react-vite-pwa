import { useState } from 'react';
import './App.css';

/** Основной компонент приложения */
function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="App">
      <div>Счетчик: {count} (сколько раз нажали)</div>
      <div>Привет, новая запись</div>
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
  );
}

export default App;
