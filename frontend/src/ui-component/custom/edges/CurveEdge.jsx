/*eslint-disable*/
import React, { useState, useCallback } from 'react';
import { BaseEdge, EdgeLabelRenderer, useReactFlow } from 'reactflow';
import { line, curveBasis } from 'd3-shape';

import './buttonedge.css';

export default function CurveEdge({ id, sourceX, sourceY, targetX, targetY, style = {}, markerEnd, data }) {
  const { setEdges } = useReactFlow();

  // Initial control points stored in state
  const [controlPoints, setControlPoints] = useState([
    { x: (sourceX + targetX) / 4, y: sourceY - 50 }, // First control point
    { x: (sourceX + targetX) / 2, y: sourceY - 100 }, // Second control point
    { x: ((sourceX + targetX) * 3) / 4, y: targetY + 100 }, // Third control point
    { x: (sourceX + targetX) / 2, y: targetY + 50 } // Fourth control point
  ]);

  // Function to update a control point's position when dragged
  const onDrag = useCallback(
    (index, event) => {
      const updatedPoints = [...controlPoints];
      updatedPoints[index] = { x: event.clientX, y: event.clientY };
      setControlPoints(updatedPoints);
    },
    [controlPoints]
  );

  // Construct the path dynamically based on the control points
  const points = [
    [sourceX, sourceY],
    [controlPoints[0].x, controlPoints[0].y], // First control point
    [controlPoints[1].x, controlPoints[1].y], // Second control point
    [controlPoints[2].x, controlPoints[2].y], // Third control point
    [controlPoints[3].x, controlPoints[3].y], // Fourth control point
    [targetX, targetY]
  ];

  // Create a smooth curve path using d3
  const edgePath = line().curve(curveBasis)(points);

  const onEdgeClick = () => {
    setEdges((edges) => edges.filter((edge) => edge.id !== id));
  };

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${(sourceX + targetX) / 2}px, ${(sourceY + targetY) / 2}px)`,
            fontSize: 12,
            pointerEvents: 'all',
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#eee',
            height: 'auto',
            gap: 6,
            borderRadius: '20px',
            zIndex: 1
          }}
          className="nodrag nopan"
        >
          <p className="edge-label">{data.label?.length ? data?.label : 'edge1'}</p>
          <button className="edgebutton" onClick={onEdgeClick}>
            ×
          </button>
        </div>
      </EdgeLabelRenderer>

      {/* Render draggable control points */}
      {controlPoints.map((point, index) => (
        <div
          key={index}
          onMouseDown={(event) => {
            const moveHandler = (moveEvent) => onDrag(index, moveEvent);
            const upHandler = () => {
              window.removeEventListener('mousemove', moveHandler);
              window.removeEventListener('mouseup', upHandler);
            };
            window.addEventListener('mousemove', moveHandler);
            window.addEventListener('mouseup', upHandler);
          }}
          style={{
            position: 'absolute',
            left: point.x,
            top: point.y,
            width: '10px',
            height: '10px',
            backgroundColor: 'red',
            borderRadius: '50%',
            cursor: 'pointer',
            zIndex: 10
          }}
        />
      ))}
    </>
  );
}
