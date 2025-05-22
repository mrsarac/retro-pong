import React, { useState } from 'react';
import './StartScreen.css';

const StartScreen = ({ onStartGame, onDifficultyChange, initialDifficulty }) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState(initialDifficulty);

  const handleDifficultyClick = (difficulty) => {
    setSelectedDifficulty(difficulty);
    onDifficultyChange(difficulty); // Inform Game.js immediately if needed, or just on Start
  };

  return (
    <div className="start-screen-overlay">
      <div className="start-screen-content">
        <h1 className="game-title">Retro React Pong</h1>
        
        <div className="difficulty-selection">
          <h2>Select Difficulty</h2>
          <div className="difficulty-buttons">
            {['Easy', 'Medium', 'Hard'].map((difficulty) => (
              <button
                key={difficulty}
                className={`difficulty-button ${selectedDifficulty === difficulty ? 'selected' : ''}`}
                onClick={() => handleDifficultyClick(difficulty)}
              >
                {difficulty}
              </button>
            ))}
          </div>
        </div>
        
        <button 
          className="start-game-button" 
          onClick={() => onStartGame(selectedDifficulty)}
        >
          Start Game
        </button>
        
        <div className="start-screen-controls-info">
          <p>Controls:</p>
          <p>W/S or Arrow Up/Down - Move Paddle</p>
          <p>Mouse - Move Paddle (when no keys pressed)</p>
        </div>
      </div>
    </div>
  );
};

export default StartScreen;
