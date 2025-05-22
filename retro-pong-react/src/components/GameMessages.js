import React from 'react';
import './GameMessages.css'; // We'll create this CSS file next

const GameMessages = ({ mainMessage, briefMessage, showControls }) => {
  return (
    <div className="game-messages-overlay">
      {mainMessage && (
        <div className="message main-message">
          {mainMessage}
        </div>
      )}
      {briefMessage && (
        <div className="message brief-message">
          {briefMessage}
        </div>
      )}
      {showControls && (
        <div className="message controls-message">
          Controls: <br />
          W/S or Arrow Up/Down - Move Paddle <br />
          Mouse - Move Paddle (when no keys pressed) <br />
          Change Difficulty - Button Below
        </div>
      )}
    </div>
  );
};

export default GameMessages;
