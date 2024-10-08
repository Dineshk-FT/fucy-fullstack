import React, { useState, useEffect } from 'react';
import { getBezierPath } from 'react-flow-renderer';

const CustomEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  arrowHeadType,
  markerEndId
  // data,
}) => {
  const [edgePath, setEdgePath] = useState('');

  useEffect(() => {
    const newPath = getBezierPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition
    });
    setEdgePath(newPath);
  }, [sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition]);

  const handleDrag = (event) => {
    // console.log('event', event);
    // Logic to update edge path during drag
    const newPath = getBezierPath({
      sourceX,
      sourceY,
      targetX: event.clientX,
      targetY: event.clientY,
      sourcePosition,
      targetPosition
    });
    setEdgePath(newPath);
  };

  return (
    <>
      <path
        id={id}
        style={style}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEndId}
        onMouseDown={(event) => {
          event.stopPropagation();
          document.addEventListener('mousemove', handleDrag);
          document.addEventListener(
            'mouseup',
            () => {
              document.removeEventListener('mousemove', handleDrag);
            },
            { once: true }
          );
        }}
      />
      {arrowHeadType && (
        <marker id={markerEndId} markerWidth="15" markerHeight="15" refX="0" refY="3" orient="auto" markerUnits="strokeWidth">
          <path d="M0,0 L0,6 L6,3 z" fill="#b1b1b7" />
        </marker>
      )}
    </>
  );
};

export default CustomEdge;
