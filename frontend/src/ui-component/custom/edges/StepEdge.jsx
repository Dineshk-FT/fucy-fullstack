import React, { useState } from 'react';
import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath, useReactFlow } from 'reactflow';

import './buttonedge.css';

export default function StepEdge({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style = {}, markerEnd, data }) {
  const { setEdges } = useReactFlow();
  const [label, setLabel] = useState(data.label || 'edge'); // Initial label

  // console.log('rest', rest);
  // Use getSmoothStepPath instead of getBezierPath for step edges
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 0 // Set borderRadius to 0 for sharp steps (adjust for rounded corners)
  });

  const onEdgeClick = () => {
    setEdges((edges) => edges.filter((edge) => edge.id !== id));
  };

  const onLabelChange = (e) => {
    const newLabel = e.target.textContent;
    setLabel(newLabel);
    // Optionally, update the edge's label in React Flow if needed
    setEdges((edges) => edges.map((edge) => (edge.id === id ? { ...edge, data: { ...edge.data, label: newLabel } } : edge)));
  };

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
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
          <div
            className="edge-label"
            contentEditable
            suppressContentEditableWarning
            onBlur={onLabelChange} // Save changes on blur (when the user clicks out of the div)
            style={{
              outline: 'none', // Remove focus outline when editing
              padding: '2px 8px',
              cursor: 'text'
            }}
          >
            {label}
          </div>
          <button className="edgebutton" onClick={onEdgeClick}>
            ×
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
