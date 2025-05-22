import React from 'react';

const Ball = ({ size, position }) => {
  return (
    <div
      style={{
        position: 'absolute',
        width: size,
        height: size,
        backgroundColor: 'white',
        borderRadius: '50%', // Make it round
        left: position.x,
        top: position.y,
      }}
    />
  );
};

export default Ball;
