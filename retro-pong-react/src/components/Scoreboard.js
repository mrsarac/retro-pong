import React from 'react';
import './Scoreboard.css'; // We'll create this CSS file next

const Scoreboard = ({ playerScore, aiScore, level, lives, currentDifficulty }) => {
  return (
    <div className="scoreboard">
      <div className="scoreboard-section">
        <div className="scoreboard-label">PLAYER 1</div>
        <div className="scoreboard-value">{playerScore}</div>
      </div>
      <div className="scoreboard-section">
        <div className="scoreboard-label">LEVEL</div>
        <div className="scoreboard-value">{level}</div>
      </div>
      <div className="scoreboard-section">
        <div className="scoreboard-label">LIVES</div>
        <div className="scoreboard-value">{lives}</div>
      </div>
      <div className="scoreboard-section">
        <div className="scoreboard-label">AI</div>
        <div className="scoreboard-value">{aiScore}</div>
      </div>
      <div className="scoreboard-difficulty">
        DIFFICULTY: {currentDifficulty.toUpperCase()}
      </div>
    </div>
  );
};

export default Scoreboard;
