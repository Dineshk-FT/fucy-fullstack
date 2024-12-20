/*eslint-disable*/
import React, { useState, useEffect } from 'react';
import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath, useEdgesState, useReactFlow } from 'reactflow';
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
  // const [setEdges] = useEdgesState([]);
  const { getEdges, setEdges } = useReactFlow();
  const edges = getEdges();
  const [label, setLabel] = useState(data.label || 'edge');
  const [isButtonVisible, setIsButtonVisible] = useState(false);
  const [isMarkerVisible, setIsMarkerVisible] = useState({
    start: true,
    end: true
  });

  // console.log('edges', edges);
  // console.log('setEdges', setEdges);

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
    borderRadius: 0
  });

  const updateEdges = (updatedEdge) => {
    const edges = getEdges(); // Get current edges
    const newEdges = edges.map(
      (edge) => (edge.id === id ? updatedEdge : edge) // Modify the specific edge with the new data
    );
    setEdges(newEdges); // Update edges globally
  };

  const onEdgeClick = () => {
    const edges = getEdges(); // Get the current edges
    const updated = edges.filter((edge) => edge.id !== id); // Remove the clicked edge
    setEdges(updated); // Update the edges globally
  };

  const onLabelChange = (e) => {
    const newLabel = e.target.textContent;
    setLabel(newLabel); // Update label in state
    updateEdges({ ...getEdges().find((edge) => edge.id === id), data: { ...data, label: newLabel } }); // Update label in the edges
  };

  const handleDivClick = () => {
    setIsButtonVisible((prev) => !prev);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleDivClick();
    }
  };

  const handleSwap = () => {
    if (isMarkerVisible.start && isMarkerVisible.end) {
      setIsMarkerVisible({ start: false, end: true });
      updateEdges({
        ...getEdges().find((edge) => edge.id === id),
        style: { ...style, start: false, end: true }
      });
    } else if (isMarkerVisible.end) {
      setIsMarkerVisible({ start: true, end: false });
      updateEdges({
        ...getEdges().find((edge) => edge.id === id),
        style: { ...style, start: true, end: false }
      });
    } else if (isMarkerVisible.start || (!isMarkerVisible.start && !isMarkerVisible.end)) {
      setIsMarkerVisible({ start: true, end: true });
      updateEdges({
        ...getEdges().find((edge) => edge.id === id),
        style: { ...style, start: true, end: true }
      });
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
        markerEnd={isMarkerVisible.end ? markerEnd : undefined} 
        markerStart={isMarkerVisible.start ? markerStart : undefined}
        style={style}
      />
      <EdgeLabelRenderer>
        <ClickAwayListener onClickAway={() => setIsButtonVisible(false)}>
          <div
            role="button"
            tabIndex={0}
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
              onClick={handleDivClick}
              onKeyPress={handleKeyPress}
              contentEditable
              suppressContentEditableWarning
              onBlur={onLabelChange}
              style={{
                outline: 'none',
                cursor: 'text'
              }}
            >
              {label}
            </div>
            {isButtonVisible && (
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
