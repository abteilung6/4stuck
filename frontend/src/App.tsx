import React from 'react';
import './App.css';
import GameSessionDemo from './GameSessionDemo';
import Lobby from './components/Lobby';

function App() {
  return (
    <div className="App">
      <Lobby />
      <GameSessionDemo />
    </div>
  );
}

export default App;
