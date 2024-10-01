/*eslint-disable*/
import React, { useState, useEffect } from 'react';
import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath, useReactFlow } from 'reactflow';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import { Box, ClickAwayListener } from '@mui/material';
import { ArrowSwapHorizontal } from 'iconsax-react';
import './buttonedge.css';

export default function StepEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  markerStart,
  data
}) {
  const { setEdges } = useReactFlow();
  const [label, setLabel] = useState(data.label || 'edge'); // Initial label
  const [isButtonVisible, setIsButtonVisible] = useState(false); // State to manage button visibility
  const [isMarkerVisible, setIsMarkerVisible] = useState({
    start: true,
    end: true
  });

  useEffect(() => {
    setIsMarkerVisible({
      start: style.start,
      end: style?.end
    });
  }, [style.start, style.end]);

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
    setEdges((edges) => edges.map((edge) => (edge.id === id ? { ...edge, data: { ...edge.data, label: newLabel } } : edge)));
  };

  const handleDivClick = () => {
    setIsButtonVisible((prev) => !prev); // Toggle button visibility
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleDivClick(); // Call click handler on Enter or Space key
    }
  };

  const handleSwap = () => {
    if (isMarkerVisible.start && isMarkerVisible.end) {
      setIsMarkerVisible({ start: false, end: true });
      setEdges((edges) => edges.map((edge) => (edge.id === id ? { ...edge, style: { ...edge.data, start: false, end: true } } : edge)));
    } else if (isMarkerVisible.end) {
      setIsMarkerVisible({ start: true, end: false });
      setEdges((edges) => edges.map((edge) => (edge.id === id ? { ...edge, style: { ...edge.data, start: true, end: false } } : edge)));
    } else if (isMarkerVisible.start || (!isMarkerVisible.start && !isMarkerVisible.end)) {
      setIsMarkerVisible({ start: true, end: true });
      setEdges((edges) => edges.map((edge) => (edge.id === id ? { ...edge, style: { ...edge.data, start: true, end: true } } : edge)));
    }
  };

  const renderButton = () => {
    if (isMarkerVisible.start && isMarkerVisible.end) {
      return (
        <button className="edgebutton">
          <ArrowRightAltIcon className="icons" />
        </button>
      );
    }
    if (isMarkerVisible.start) {
      return (
        <button className="edgebutton">
          <ArrowSwapHorizontal size="16" className="icons" />
        </button>
      );
    }
    if (isMarkerVisible.end) {
      return (
        <button className="edgebutton">
          <ArrowRightAltIcon className="icons" sx={{ transform: 'rotate(180deg)' }} />
        </button>
      );
    }
    if (!isMarkerVisible.end && !isMarkerVisible.start) {
      return (
        <button className="edgebutton">
          <ArrowSwapHorizontal size="16" className="icons" />
        </button>
      );
    }
  };

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={isMarkerVisible.end && markerEnd}
        markerStart={isMarkerVisible.start && markerStart}
        style={style}
      />
      <EdgeLabelRenderer>
        <ClickAwayListener onClickAway={() => setIsButtonVisible(false)}>
          <div
            role="button" // Add button role to make the div accessible
            tabIndex={0} // Makes the div focusable via keyboard
            style={{
              position: 'absolute',
              top: '-10px',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              fontSize: 12,
              pointerEvents: 'all',
              display: 'flex',
              alignItems: 'center',
              height: 'auto',
              gap: 3,
              borderRadius: '20px',
              zIndex: 1,
              cursor: 'pointer',
              outline: 'none'
            }}
            className="nodrag nopan"
          >
            <div
              className="edge-label"
              onClick={handleDivClick} // Toggle visibility on click
              onKeyPress={handleKeyPress} // Toggle visibility on key press
              contentEditable
              suppressContentEditableWarning
              onBlur={onLabelChange} // Save changes on blur (when the user clicks out of the div)
              style={{
                outline: 'none',
                cursor: 'text'
              }}
            >
              {label}
            </div>
            {isButtonVisible && (
              // Show button only if isButtonVisible is true
              <Box display="flex" gap={0.5}>
                {<Box onClick={handleSwap}>{renderButton()}</Box>}
                <button className="edgebutton" onClick={onEdgeClick}>
                  ×
                </button>
              </Box>
            )}
          </div>
        </ClickAwayListener>
      </EdgeLabelRenderer>
    </>
  );
}
