/* eslint-disable */
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath, useReactFlow } from 'reactflow';
import CloseIcon from '@mui/icons-material/Close';
import WestIcon from '@mui/icons-material/West';
import EastIcon from '@mui/icons-material/East';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import EditIcon from '@mui/icons-material/Edit';
import { Box, ClickAwayListener } from '@mui/material';
import ColorTheme from '../../../themes/ColorTheme';
import { useDispatch, useSelector } from 'react-redux';
import { setAnchorEl, setEdgeDetails, setSelectedBlock } from '../../../store/slices/CanvasSlice';
import './buttonedge.css';

const markerStates = [
  { start: true, end: true },
  { start: false, end: true },
  { start: true, end: false }
];

export default React.memo(function StepEdge({
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
  const dispatch = useDispatch();
  const { selectedBlock } = useSelector((state) => state?.canvas);
  const { getEdges, setEdges } = useReactFlow();
  const color = ColorTheme();
  const editableRef = useRef(null);
  const pathRef = useRef(null);
  const containerRef = useRef(null);

  const isMarkerVisible = {
    start: style?.start !== false,
    end: style?.end !== false
  };

  const [isEditing, setIsEditing] = useState(false);
  const [labelValue, setLabelValue] = useState(data?.label || '');
  const [currentPosition, setCurrentPosition] = useState({
    t: data?.t !== undefined ? data.t : 0.5,
    offset: data?.offset !== undefined ? data.offset : 0
  });

  const isSelected = selectedBlock?.id === id;

  const edges = getEdges();
  const currentEdge = edges.find((edge) => edge.id === id);

  // Real path calculation
  // In StepEdge.jsx, modify the getSmoothStepPath call:
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition: sourcePosition || Position.Bottom, // Add fallback
    targetX,
    targetY,
    targetPosition: targetPosition || Position.Right // Add fallback
  });
  // Update local position state when data changes
  // console.log('sourcePosition', sourcePosition);
  // console.log('targetPosition', targetPosition);
  useEffect(() => {
    setCurrentPosition({
      t: data?.t !== undefined ? data.t : 0.5,
      offset: data?.offset !== undefined ? data.offset : 0
    });
  }, [data?.t, data?.offset]);

  // --- Helper for sampling points along SVG path ---
  const getPointOnPath = useCallback(
    (tNorm, offsetPx) => {
      const el = pathRef.current;
      if (!el || typeof el.getTotalLength !== 'function') return { x: labelX, y: labelY };

      const total = el.getTotalLength();
      if (total === 0) return { x: labelX, y: labelY };

      const s = Math.max(0, Math.min(total, (tNorm ?? 0.5) * total));
      const p = el.getPointAtLength(s);
      const p2 = el.getPointAtLength(Math.min(total, s + 0.1));
      let tx = p2.x - p.x;
      let ty = p2.y - p.y;
      const mag = Math.hypot(tx, ty) || 1;
      tx /= mag;
      ty /= mag;

      const nx = -ty;
      const ny = tx;
      const off = offsetPx ?? 0;
      return { x: p.x + nx * off, y: p.y + ny * off };
    },
    [labelX, labelY]
  );

  // Use currentPosition state instead of reading directly from data
  const { x: finalX, y: finalY } = getPointOnPath(currentPosition.t, currentPosition.offset);

  useEffect(() => {
    setLabelValue(data?.label || '');
  }, [data?.label]);

  // --- Update edge helper ---
  const updateEdgeData = useCallback(
    (updates) => {
      setEdges((eds) => eds.map((edge) => (edge.id === id ? { ...edge, ...updates } : edge)));
    },
    [id, setEdges]
  );

  // --- Improved Drag along path ---
  const handleDragStart = useCallback(
    (e) => {
      if (isEditing) return;

      e.preventDefault();
      e.stopPropagation();

      const el = pathRef.current;
      if (!el || typeof el.getTotalLength !== 'function') return;

      const total = el.getTotalLength();
      if (total === 0) return;

      // Use current position values from state
      let s = currentPosition.t * total;
      let off = currentPosition.offset;

      let lastX = e.clientX;
      let lastY = e.clientY;

      // More generous margins for better dragging experience
      const leftMargin = 20;
      const rightMargin = 20;
      const minS = leftMargin;
      const maxS = Math.max(minS, total - rightMargin);
      const maxOffset = 25;

      const onMouseMove = (moveEvent) => {
        const dx = moveEvent.clientX - lastX;
        const dy = moveEvent.clientY - lastY;
        lastX = moveEvent.clientX;
        lastY = moveEvent.clientY;

        const p = el.getPointAtLength(Math.max(0, Math.min(total, s)));
        const p2 = el.getPointAtLength(Math.max(0, Math.min(total, s + 1)));
        let tx = p2.x - p.x;
        let ty = p2.y - p.y;
        const tlen = Math.hypot(tx, ty) || 1;
        tx /= tlen;
        ty /= tlen;

        const nx = -ty;
        const ny = tx;

        // Calculate movement along and perpendicular to the path
        const along = dx * tx + dy * ty;
        const perp = dx * nx + dy * ny;

        // Update position along path with constraints
        s = Math.max(minS, Math.min(maxS, s + along));
        off = Math.max(-maxOffset, Math.min(maxOffset, off + perp));

        // Apply constraints to prevent extreme values
        const constrainedT = Math.max(0.1, Math.min(0.9, s / total));
        const constrainedOffset = Math.max(-30, Math.min(30, off));

        // Update both edge data and local state
        const newPosition = {
          t: constrainedT,
          offset: constrainedOffset
        };

        setCurrentPosition(newPosition);
        updateEdgeData({
          data: {
            ...data,
            ...newPosition,
            label: labelValue
          }
        });
      };

      const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp, { once: true });
    },
    [data, isEditing, labelValue, updateEdgeData, currentPosition]
  );

  // --- Marker direction swap ---
  const handleSwap = useCallback(
    (e) => {
      e.stopPropagation();
      const currentIndex = markerStates.findIndex((state) => state.start === isMarkerVisible.start && state.end === isMarkerVisible.end);
      const nextIndex = (currentIndex + 1) % markerStates.length;
      const newState = markerStates[nextIndex];

      updateEdgeData({
        style: { ...style, ...newState }
      });
    },
    [isMarkerVisible, style, updateEdgeData]
  );

  const onEditEdge = useCallback(
    (e) => {
      e.stopPropagation();
      dispatch(setAnchorEl({ type: 'edge', value: `rf__edge-${id}` }));
      dispatch(
        setSelectedBlock({
          id,
          data: {
            ...data,
            ...currentPosition
          }
        })
      );
      dispatch(
        setEdgeDetails({
          name: data?.label ?? '',
          description: data?.description ?? '',
          properties: currentEdge?.properties ?? [],
          isAsset: currentEdge?.isAsset ?? false,
          style: style ?? {},
          startPoint: markerStart?.color ?? '#000000',
          endPoint: markerEnd?.color ?? '#000000'
        })
      );
    },
    [currentEdge, currentPosition, data, dispatch, id, markerEnd, markerStart, style]
  );

  const handleLabelDoubleClick = useCallback(
    (e) => {
      e.stopPropagation();
      setIsEditing(true);
      dispatch(
        setSelectedBlock({
          id,
          data: {
            ...data,
            ...currentPosition
          }
        })
      );
    },
    [data, dispatch, id, currentPosition]
  );

  const handleLabelRightClick = useCallback((e) => {
    e.preventDefault();
    setIsEditing(true);
  }, []);

  const handleLabelBlur = useCallback(() => {
    setIsEditing(false);
    const newLabel = editableRef.current?.textContent || '';
    setLabelValue(newLabel);

    // Preserve current position when updating label
    updateEdgeData({
      data: {
        ...data,
        ...currentPosition, // Keep current position
        label: newLabel
      }
    });
  }, [data, currentPosition, updateEdgeData]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleLabelBlur();
        dispatch(setSelectedBlock({}));
      } else if (e.key === 'Escape') {
        setIsEditing(false);
        if (editableRef.current) editableRef.current.textContent = labelValue;
      }
    },
    [dispatch, handleLabelBlur, labelValue]
  );

  useEffect(() => {
    if (isEditing && editableRef.current) {
      editableRef.current.focus();
      const range = document.createRange();
      range.selectNodeContents(editableRef.current);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }, [isEditing]);

  const renderButton = useMemo(() => {
    const { start, end } = isMarkerVisible;
    let Icon;
    if (start && end) Icon = EastIcon;
    else if (!start && end) Icon = WestIcon;
    else Icon = SwapHorizIcon;

    return (
      <button className="edgebutton">
        <Icon className="icons" sx={{ fontSize: 15 }} />
      </button>
    );
  }, [isMarkerVisible]);

  const edgeStyle = {
    ...style,
    filter: isSelected ? 'drop-shadow(0px 0px 8px #BF00FF)' : 'none'
  };

  const labelStyle = {
    outline: 'none',
    cursor: isEditing ? 'text' : 'move',
    color: labelValue ? (isSelected ? 'black' : color?.title) : color?.label,
    whiteSpace: 'nowrap',
    ...(isEditing && { color: 'black', borderRadius: '4px' })
  };

  // console.log('currentPosition', currentPosition);
  return (
    <>
      <BaseEdge
        path={edgePath}
        id={id}
        markerEnd={isMarkerVisible.end ? markerEnd : undefined}
        markerStart={isMarkerVisible.start ? markerStart : undefined}
        style={edgeStyle}
      />
      {/* Invisible path for calculations - ensure it's properly rendered */}
      <path
        d={edgePath}
        ref={pathRef}
        style={{
          fill: 'none',
          stroke: 'transparent',
          strokeWidth: 20,
          pointerEvents: 'none',
          opacity: 0
        }}
      />

      <EdgeLabelRenderer>
        <Box
          ref={containerRef}
          onMouseDown={handleDragStart}
          sx={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${finalX}px, ${finalY}px)`,
            pointerEvents: 'all',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            borderRadius: '20px',
            zIndex: 1,
            backgroundColor: isSelected ? 'wheat' : 'transparent',
            padding: '4px 8px',
            cursor: isEditing ? 'text' : 'move',
            userSelect: 'none',
            transition: isEditing ? 'none' : 'transform 0.1s ease',
            '&:hover': {
              backgroundColor: isSelected ? 'wheat' : 'rgba(255, 255, 255, 0.1)'
            }
          }}
          className="nodrag nopan edge-container"
        >
          <ClickAwayListener onClickAway={handleLabelBlur}>
            <Box
              ref={editableRef}
              contentEditable={isEditing}
              suppressContentEditableWarning
              onDoubleClick={handleLabelDoubleClick}
              onContextMenu={handleLabelRightClick}
              onBlur={handleLabelBlur}
              onKeyDown={handleKeyDown}
              onMouseDown={(e) => {
                if (!isEditing) {
                  e.stopPropagation();
                  handleDragStart(e);
                }
              }}
              sx={{ ...labelStyle, fontSize: style?.fontSize }}
            >
              {labelValue || 'connect'}
            </Box>
          </ClickAwayListener>

          <Box className="edge-buttons" display={isSelected ? 'flex' : 'none'} gap={0.5}>
            <Box onClick={handleSwap}>{renderButton}</Box>
            <Box className="edgebutton" onClick={onEditEdge}>
              <EditIcon sx={{ fontSize: '0.6rem', ml: 0.5, mt: 0.4 }} />
            </Box>
            <Box className="edgebutton" onClick={() => setEdges((eds) => eds.filter((edge) => edge.id !== id))}>
              <CloseIcon sx={{ fontSize: '0.8rem', ml: 0.33, mt: 0.3 }} />
            </Box>
          </Box>
        </Box>
      </EdgeLabelRenderer>
    </>
  );
});
