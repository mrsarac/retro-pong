import React from 'react';

const Paddle = ({ width, height, position, color = 'white' }) => { // Added color prop with default
  return (
    <div
      style={{
        position: 'absolute',
        width: width,
        height: height,
        backgroundColor: color, // Use the color prop
        left: position.x,
        top: position.y,
        boxShadow: `0 0 8px ${color}`, // Optional: add a glow effect based on color
      }}
    />
  );
};

export default Paddle;
