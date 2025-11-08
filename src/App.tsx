import { useState } from 'react';
import './App.css';

/** Основной компонент приложения */
function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="App">
      <div>Текст: {count}</div>
      <button
        onClick={() => {
          setCount(count + 1);
        }}
      >
        Кнопка
      </button>
    </div>
  );
}

export default App;
