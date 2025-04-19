/* eslint-disable */
import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';

const LineHandle = ({ id, type = 'source', style = {}, position, width }) => {
  const [handles, setHandles] = useState([]);

  const handleClick = (event) => {
    const boundingRect = event.currentTarget.getBoundingClientRect();
    const clickX = ((event.clientX - boundingRect.left) / boundingRect.width) * 100;
    const newHandleId = `${id}-handle-${handles.length}`; // Ensure predictable IDs

    setHandles((prevHandles) => [...prevHandles, { id: newHandleId, left: clickX }]);
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: '-10px', // Adjust for better click area
        left: '50%',
        transform: 'translateX(-50%)',
        width: `${width}px`,
        height: '12px', // Ensure it has a height for clicking
        pointerEvents: 'auto'
      }}
      onClick={handleClick} // Click to add connection points
    >
      {/* Render dynamic handles */}
      {handles.map((handle) => (
        <Handle
          key={handle.id}
          type={type}
          position={Position.Top} // Ensure it's the correct position
          id={handle.id}
          style={{
            position: 'absolute',
            left: `${handle.left}%`,
            transform: 'translateX(-50%)',
            width: '10px',
            height: '10px',
            background: 'blue'
          }}
        />
      ))}

      {/* Line with dynamic width */}
      <svg width={width} height="12" viewBox={`0 0 ${width} 10`}>
        <line x1="0" y1="5" x2={width} y2="5" stroke="black" strokeWidth="3" />
      </svg>
    </div>
  );
};

export default LineHandle;
