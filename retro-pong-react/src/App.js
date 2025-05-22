import React from 'react';
import Game from './components/Game';
import './App.css'; // You can remove this if not used, or keep for global app styles

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Retro Pong</h1>
      </header>
      <Game />
    </div>
  );
}

export default App;
