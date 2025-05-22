import React, { useState, useEffect, useRef } from 'react';
import Ball from './Ball';
import Paddle from './Paddle';
import Collectible from './Collectible';
import Scoreboard from './Scoreboard';
import GameMessages from './GameMessages';
import StartScreen from './StartScreen'; // Import StartScreen
import GameOverScreen from './GameOverScreen'; // Import GameOverScreen
// import './Game.css';

const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const BASE_PADDLE_WIDTH = 20; // Renamed for clarity
const BASE_PADDLE_HEIGHT = 100; // Renamed for clarity
const BALL_SIZE = 15;
const COLLECTIBLE_SIZE = 20;


const Game = () => {
  const [ballPosition, setBallPosition] = useState({ x: GAME_WIDTH / 2 - BALL_SIZE / 2, y: GAME_HEIGHT / 2 - BALL_SIZE / 2 });
  const [ballVelocity, setBallVelocity] = useState({ x: 5, y: 5 });
  const [playerPosition, setPlayerPosition] = useState(GAME_HEIGHT / 2 - BASE_PADDLE_HEIGHT / 2);
  const [aiPosition, setAiPosition] = useState(GAME_HEIGHT / 2 - BASE_PADDLE_HEIGHT / 2);

  const [playerPaddleWidth, setPlayerPaddleWidth] = useState(BASE_PADDLE_WIDTH);
  const [playerPaddleHeight, setPlayerPaddleHeight] = useState(BASE_PADDLE_HEIGHT);
  const [playerPaddleColor, setPlayerPaddleColor] = useState('white');
  const [paddleSpeedMultiplier, setPaddleSpeedMultiplier] = useState(1);


  const [playerScore, setPlayerScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(3);
  // const [gameOver, setGameOver] = useState(false); // Replaced by gameState
  const [gameBriefMessage, setGameBriefMessage] = useState('');

  const [gameState, setGameState] = useState('startScreen'); // 'startScreen', 'playing', 'gameOver'

  // Difficulty Settings
  const difficultyModes = {
    Easy: { aiSpeed: 3, aiErrorMargin: 50, ballBaseSpeedX: 4, ballBaseSpeedY: 4, ballSpeedIncrement: 0.2 },
    Medium: { aiSpeed: 5, aiErrorMargin: 30, ballBaseSpeedX: 5, ballBaseSpeedY: 5, ballSpeedIncrement: 0.3 },
    Hard: { aiSpeed: 7, aiErrorMargin: 10, ballBaseSpeedX: 6, ballBaseSpeedY: 6, ballSpeedIncrement: 0.4 },
  };
  const [currentDifficulty, setCurrentDifficulty] = useState('Medium'); // Default difficulty
  const [aiTargetY, setAiTargetY] = useState(GAME_HEIGHT / 2 - BASE_PADDLE_HEIGHT / 2);

  const [collectible, setCollectible] = useState(null);
  const [activePowerUp, setActivePowerUp] = useState(null);
  // const [showControlsMessage, setShowControlsMessage] = useState(true); // Moved to StartScreen

  const gameAreaRef = useRef(null);
  const [gameAreaStyle, setGameAreaStyle] = useState({
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: 'black',
    position: 'relative',
    margin: 'auto', // Will be centered by App's flex container
    border: '1px solid white',
  });

  // Game Loop
  useEffect(() => {
    if (gameState !== 'playing') {
      return; // Don't run game loop if not in 'playing' state
    }

    const gameLoop = () => {
      if (gameState !== 'playing') return; // Double check, ensures loop stops if state changes mid-frame

      // Ball Movement
      setBallPosition(prev => ({
        x: prev.x + ballVelocity.x,
        y: prev.y + ballVelocity.y,
      }));

      // Ball Collision with Walls
      if (ballPosition.y <= 0 || ballPosition.y >= GAME_HEIGHT - BALL_SIZE) {
        setBallVelocity(prev => ({ ...prev, y: -prev.y }));
        console.log('Sound: Ball bounce (wall)');
      }

      // Ball Collision with Player Paddle
      if (
        ballPosition.x <= playerPaddleWidth &&
        ballPosition.x > 0 && // Prevents collision when ball is behind paddle
        ballPosition.y + BALL_SIZE >= playerPosition &&
        ballPosition.y <= playerPosition + playerPaddleHeight
      ) {
        const speedIncrement = difficultyModes[currentDifficulty].ballSpeedIncrement;
        setBallVelocity(prev => ({
          x: -prev.x * (1 + speedIncrement / 5), // Slightly increase speed on hit
          y: (prev.y + (Math.random() - 0.5) * 4) * (1 + speedIncrement / 10) // Add some y variation
        }));
        console.log('Sound: Ball bounce (player paddle)');
      }

      // Ball Collision with AI Paddle
      if (
        ballPosition.x >= GAME_WIDTH - BASE_PADDLE_WIDTH - BALL_SIZE &&
        ballPosition.x < GAME_WIDTH - BALL_SIZE &&
        ballPosition.y + BALL_SIZE >= aiPosition &&
        ballPosition.y <= aiPosition + BASE_PADDLE_HEIGHT
      ) {
        const speedIncrement = difficultyModes[currentDifficulty].ballSpeedIncrement;
        setBallVelocity(prev => ({ ...prev, x: -prev.x * (1 + speedIncrement / 10) }));
        console.log('Sound: Ball bounce (AI paddle)');
      }

      // Ball Collision with Collectible
      if (collectible &&
          ballPosition.x < collectible.x + COLLECTIBLE_SIZE &&
          ballPosition.x + BALL_SIZE > collectible.x &&
          ballPosition.y < collectible.y + COLLECTIBLE_SIZE &&
          ballPosition.y + BALL_SIZE > collectible.y
      ) {
        console.log(`Sound: Power-up (${collectible.type}) activated`);
        activatePowerUp(collectible.type);
        setCollectible(null); // Remove collectible
      }


      // Scoring
      if (ballPosition.x <= 0) { // AI scores
        setAiScore(prev => prev + 1);
        setLives(prev => prev - 1);
        console.log('Sound: AI Score Point / Player Lose Life');
        setGameAreaStyle(prev => ({ ...prev, borderColor: 'red' })); // Visual feedback for losing life
        setTimeout(() => setGameAreaStyle(prev => ({ ...prev, borderColor: 'white' })), 200);

        if (lives - 1 <= 0) {
          setGameState('gameOver'); // Change game state to gameOver
          console.log('Sound: Game Over');
        } else {
          resetBall();
        }
      }
      if (ballPosition.x >= GAME_WIDTH - BALL_SIZE) { // Player scores
        let pointsAwarded = 10;
        if (activePowerUp) {
          pointsAwarded += 5; // Bonus points for scoring with active power-up
        }
        setPlayerScore(prev => prev + pointsAwarded);
        console.log('Sound: Player Score Point');
        setGameAreaStyle(prev => ({ ...prev, backgroundColor: 'darkgreen' }));
        setTimeout(() => setGameAreaStyle(prev => ({ ...prev, backgroundColor: 'black' })), 200);

        if ((playerScore + pointsAwarded) >= level * 50 && currentDifficulty !== 'Hard') {
          setLevel(prev => prev + 1);
          setGameBriefMessage(`Level ${level + 1}`);
          setTimeout(() => setGameBriefMessage(''), 1500);
          spawnCollectible();
        } else if (Math.random() < (currentDifficulty === 'Easy' ? 0.3 : 0.15) && !collectible) {
          spawnCollectible();
        }
        resetBall();
      }

      // AI Paddle Movement Logic
      // Update AI target Y with delay and potential error
      if (ballVelocity.x > 0) { // Only update target if ball is moving towards AI
        const error = (Math.random() - 0.5) * difficultyModes[currentDifficulty].aiErrorMargin;
        const reactionDelay = currentDifficulty === 'Easy' ? 150 : (currentDifficulty === 'Medium' ? 75 : 30); // ms

        setTimeout(() => {
             // Target the center of the ball, plus error
            let target = ballPosition.y + BALL_SIZE / 2 - BASE_PADDLE_HEIGHT / 2 + error;
            target = Math.max(0, target);
            target = Math.min(GAME_HEIGHT - BASE_PADDLE_HEIGHT, target);
            setAiTargetY(target);
        }, reactionDelay);
      }
      
      // Move AI paddle towards aiTargetY
      const aiSpeed = difficultyModes[currentDifficulty].aiSpeed;
      if (aiPosition + BASE_PADDLE_HEIGHT / 2 < aiTargetY + BASE_PADDLE_HEIGHT / 2 - 5) { // Check center of paddle against target center
        setAiPosition(prev => Math.min(GAME_HEIGHT - BASE_PADDLE_HEIGHT, prev + aiSpeed));
      } else if (aiPosition + BASE_PADDLE_HEIGHT / 2 > aiTargetY + BASE_PADDLE_HEIGHT / 2 + 5) {
        setAiPosition(prev => Math.max(0, prev - aiSpeed));
      }


      requestAnimationFrame(gameLoop);
    };

    let animationFrameId;
    if (!gameOver) {
      animationFrameId = requestAnimationFrame(gameLoop);
    }
    return () => cancelAnimationFrame(animationFrameId);
  }, [ballPosition, ballVelocity, playerPosition, aiPosition, gameState, lives, playerScore, level, collectible, activePowerUp, playerPaddleHeight, playerPaddleWidth, currentDifficulty, aiTargetY]);


  const resetGameVariables = (difficulty) => {
    setPlayerScore(0);
    setAiScore(0);
    setLives(3);
    setLevel(1);
    setPlayerPaddleWidth(BASE_PADDLE_WIDTH);
    setPlayerPaddleColor('white');
    setActivePowerUp(null);
    setCollectible(null);
    setGameBriefMessage('');
    setCurrentDifficulty(difficulty); // Set difficulty chosen on start screen
    setBallPosition({ x: GAME_WIDTH / 2 - BALL_SIZE / 2, y: GAME_HEIGHT / 2 - BALL_SIZE / 2 });
    const { ballBaseSpeedX, ballBaseSpeedY } = difficultyModes[difficulty];
    setBallVelocity({
      x: Math.random() > 0.5 ? ballBaseSpeedX : -ballBaseSpeedX,
      y: Math.random() > 0.5 ? ballBaseSpeedY : -ballBaseSpeedY,
    });
  };

  const resetBall = () => { // Simplified reset for when a point is scored
    setBallPosition({ x: GAME_WIDTH / 2 - BALL_SIZE / 2, y: GAME_HEIGHT / 2 - BALL_SIZE / 2 });
    const { ballBaseSpeedX, ballBaseSpeedY } = difficultyModes[currentDifficulty];
    let newBallVelX = Math.random() > 0.5 ? ballBaseSpeedX : -ballBaseSpeedX;
    // Ensure ball goes towards the player who didn't score
    if (ballPosition.x <= 0) { // AI just scored, ball should go to AI (negative X)
        newBallVelX = -ballBaseSpeedX;
    } else { // Player just scored, ball should go to Player (positive X)
        newBallVelX = ballBaseSpeedX;
    }
    setBallVelocity({ x: newBallVelX, y: Math.random() > 0.5 ? ballBaseSpeedY : -ballBaseSpeedY });
  };


  const spawnCollectible = () => {
    const type = Math.random() > 0.5 ? 'paddleSize' : 'speedBoost';
    setCollectible({
      x: Math.random() * (GAME_WIDTH - 200) + 100,
      y: Math.random() * (GAME_HEIGHT - 100) + 50,
      type: type,
    });
    console.log(`Collectible spawned: ${type}`);
  };

  const activatePowerUp = (type) => {
    setActivePowerUp(type);
    setGameBriefMessage(`${type === 'paddleSize' ? 'Wider Paddle!' : 'Speed Boost!'}`);
    setPlayerPaddleColor(type === 'paddleSize' ? 'lightgreen' : 'cyan');

    if (type === 'paddleSize') {
      setPlayerPaddleWidth(BASE_PADDLE_WIDTH * 1.5);
      setTimeout(() => {
        setPlayerPaddleWidth(BASE_PADDLE_WIDTH);
        setActivePowerUp(null);
        setPlayerPaddleColor('white');
        setGameBriefMessage('');
      }, 5000);
    } else if (type === 'speedBoost') {
      setPaddleSpeedMultiplier(1.5);
      setTimeout(() => {
        setPaddleSpeedMultiplier(1);
        setActivePowerUp(null);
        setPlayerPaddleColor('white');
        setGameBriefMessage('');
      }, 5000);
    }
  };

  const startGame = () => {
    if (gameOver || gameMainMessage === 'Press Start Game Button!') {
        resetBall(true); 
    }
    setGameMainMessage(''); 
    setShowControlsMessage(false); 
    const { ballBaseSpeedX, ballBaseSpeedY } = difficultyModes[currentDifficulty];
    setBallVelocity({
        x: Math.random() > 0.5 ? ballBaseSpeedX : -ballBaseSpeedX,
        y: Math.random() > 0.5 ? ballBaseSpeedY : -ballBaseSpeedY,
    });
  }


  const PADDLE_SPEED = 10;
  const keysPressed = useRef({});

  // Player Paddle Movement - Mouse
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (gameAreaRef.current && gameState === 'playing' && Object.keys(keysPressed.current).length === 0) {
        const gameAreaRect = gameAreaRef.current.getBoundingClientRect();
        let newPlayerPos = e.clientY - gameAreaRect.top - playerPaddleHeight / 2;
        newPlayerPos = Math.max(0, newPlayerPos);
        newPlayerPos = Math.min(GAME_HEIGHT - playerPaddleHeight, newPlayerPos);
        setPlayerPosition(newPlayerPos);
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [gameState, playerPaddleHeight, paddleSpeedMultiplier]);


  // Player Paddle Movement - Keyboard
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameState === 'playing') {
        keysPressed.current[e.key.toLowerCase()] = true;
      }
    };
    const handleKeyUp = (e) => {
      delete keysPressed.current[e.key.toLowerCase()];
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState]);

  useEffect(() => {
    if (gameState !== 'playing') return;
    const updatePaddlePosition = () => {
      let currentPosition = playerPosition;
      if (keysPressed.current['w'] || keysPressed.current['arrowup']) {
        currentPosition -= PADDLE_SPEED * paddleSpeedMultiplier;
      }
      if (keysPressed.current['s'] || keysPressed.current['arrowdown']) {
        currentPosition += PADDLE_SPEED * paddleSpeedMultiplier;
      }
      currentPosition = Math.max(0, currentPosition);
      currentPosition = Math.min(GAME_HEIGHT - playerPaddleHeight, currentPosition);
      if (Object.keys(keysPressed.current).length > 0) {
        setPlayerPosition(currentPosition);
      }
    };
    const keyboardMoveInterval = setInterval(updatePaddlePosition, 30);
    return () => clearInterval(keyboardMoveInterval);
  }, [gameState, playerPaddleHeight, playerPosition, paddleSpeedMultiplier]);

  const handleStartGame = (selectedDifficulty) => {
    resetGameVariables(selectedDifficulty);
    setGameState('playing');
  };

  const handleRestart = () => {
    setGameState('startScreen');
    // Variables will be reset when StartScreen calls handleStartGame
  };
  
  const handleDifficultyChangeOnStartScreen = (newDifficulty) => {
    setCurrentDifficulty(newDifficulty); // Update difficulty if changed on StartScreen before starting
  };


  if (gameState === 'startScreen') {
    return <StartScreen 
              onStartGame={handleStartGame} 
              onDifficultyChange={handleDifficultyChangeOnStartScreen} 
              initialDifficulty={currentDifficulty} 
            />;
  }

  if (gameState === 'gameOver') {
    return <GameOverScreen 
              playerScore={playerScore} 
              level={level} 
              onRestart={handleRestart} 
            />;
  }

  return (
    <>
      <Scoreboard
        playerScore={playerScore}
        aiScore={aiScore}
        level={level}
        lives={lives}
        currentDifficulty={currentDifficulty}
      />
      <div
        ref={gameAreaRef}
        style={{...gameAreaStyle, marginTop: '80px', marginBottom: '50px' }} // Adjust margin for scoreboard and button
        className="game-area-dashed-line" 
        tabIndex={0}
      >
        <GameMessages
          mainMessage={gameMainMessage}
          briefMessage={gameBriefMessage}
          showControls={showControlsMessage && gameMainMessage === 'Press Start Game Button!'}
        />
        
         <button
            onClick={() => {
                if (gameMainMessage === 'Press Start Game Button!' || gameOver) {
                    startGame();
                } else { // Button acts as "Next Difficulty" during active gameplay
                    const modes = Object.keys(difficultyModes);
                    const currentIndex = modes.indexOf(currentDifficulty);
                    const nextIndex = (currentIndex + 1) % modes.length;
                    setCurrentDifficulty(modes[nextIndex]);
                    setGameMainMessage('Press Start Game Button!'); // Show start message for new difficulty
                    resetBall(true); 
                }
            }}
            style={{
              position: 'absolute',
              bottom: '-40px', // Position below game area
              left: '50%',
              transform: 'translateX(-50%)',
              padding: '8px 15px',
              fontSize: '14px',
              cursor: 'pointer',
              zIndex: 100,
            }}
          >
            {gameMainMessage === 'Press Start Game Button!' || gameOver 
                ? 'Start Game' 
                : `Change Difficulty: ${Object.keys(difficultyModes)[(Object.keys(difficultyModes).indexOf(currentDifficulty) + 1) % Object.keys(difficultyModes).length]}`}
          </button>

      {(gameMainMessage === '' && !gameOver) && <Ball size={BALL_SIZE} position={ballPosition} />}
      {!gameOver && <Paddle
        width={PADDLE_WIDTH}
        height={PADDLE_HEIGHT}
        position={{ x: 0, y: playerPosition }}
      />}
      {!gameOver && <Paddle
        width={PADDLE_WIDTH}
        height={PADDLE_HEIGHT}
        position={{ x: GAME_WIDTH - PADDLE_WIDTH, y: aiPosition }}
      />}
    </div>
  );
};

export default Game;
