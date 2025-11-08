import { useState } from 'react';
import './App.css';

/** Основной компонент приложения */
function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="App">
      <div>Счетчик: {count} (сколько раз нажали)</div>
      <br />
      <br />
      <div>азаз лол кек 17:37 пишу правку</div>
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
  );
}

export default App;
