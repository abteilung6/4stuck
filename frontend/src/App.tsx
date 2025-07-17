import React from 'react';
import './App.css';
import './components/design-system/DesignSystem.css';
import './components/design-system/Animations.css';
import Lobby from './components/Lobby';

function App() {
  return (
    <div className="App game-container">
      <div className="animate-fade-in">
        <Lobby />
      </div>
    </div>
  );
}

export default App;
