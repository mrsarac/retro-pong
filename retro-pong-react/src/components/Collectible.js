import React from 'react';

const COLLECTIBLE_SIZE = 20;

const Collectible = ({ position, type }) => {
  if (!position) return null;

  let color = 'gold'; // Default color
  if (type === 'speedBoost') {
    color = 'cyan';
  } else if (type === 'paddleSize') {
    color = 'lightgreen';
  }

  return (
    <div
      style={{
        position: 'absolute',
        width: COLLECTIBLE_SIZE,
        height: COLLECTIBLE_SIZE,
        backgroundColor: color,
        borderRadius: '50%',
        left: position.x,
        top: position.y,
        boxShadow: `0 0 10px ${color}, 0 0 20px ${color}`, // Glowing effect
      }}
    />
  );
};

export default Collectible;
