import React from 'react';
import './GameOverScreen.css';

const GameOverScreen = ({ playerScore, level, onRestart }) => {
  return (
    <div className="game-over-overlay">
      <div className="game-over-content">
        <h1 className="game-over-title">Game Over!</h1>
        
        <div className="final-score-info">
          <p>Final Score: {playerScore}</p>
          <p>Level Reached: {level}</p>
        </div>
        
        <button 
          className="restart-game-button" 
          onClick={onRestart}
        >
          Play Again
        </button>
      </div>
    </div>
  );
};

export default GameOverScreen;
