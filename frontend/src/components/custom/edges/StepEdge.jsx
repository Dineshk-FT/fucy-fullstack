/*eslint-disable*/
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath, useReactFlow } from 'reactflow';
import CloseIcon from '@mui/icons-material/Close';
import WestIcon from '@mui/icons-material/West';
import EastIcon from '@mui/icons-material/East';
import { Box, ClickAwayListener } from '@mui/material';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import './buttonedge.css';
import ColorTheme from '../../../themes/ColorTheme';
import { useDispatch, useSelector } from 'react-redux';
import EditIcon from '@mui/icons-material/Edit';
import { setAnchorEl, setEdgeDetails, setSelectedBlock } from '../../../store/slices/CanvasSlice';

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

  // NEW: ref to a hidden path so we can sample points/tangents along the real edge
  const pathRef = useRef(null);

  // Marker visibility
  const isMarkerVisible = {
    start: style?.start !== false,
    end: style?.end !== false
  };

  const [isEditing, setIsEditing] = useState(false);
  const [labelValue, setLabelValue] = useState(data?.label || '');

  const edges = getEdges();
  const currentEdge = edges.find((edge) => edge.id === id);

  // Keep old fields (not used for sticking logic but preserved to avoid breaking anything)
  const cx = data?.controlX;
  const cy = data?.controlY;

  // Real smooth-step path (React Flow)
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition
  });

  // Helper to compute the label point from t (0..1 along path) and perpendicular offset
  const getPointOnPath = useCallback(
    (tNorm, offsetPx) => {
      const el = pathRef.current;
      if (!el || typeof el.getTotalLength !== 'function') {
        // Fallback to RF's midpoint if path isn't ready yet
        return { x: cx ?? labelX, y: cy ?? labelY };
      }
      const total = el.getTotalLength();
      if (total === 0) return { x: labelX, y: labelY };

      const s = Math.max(0, Math.min(total, (tNorm ?? 0.5) * total));
      const p = el.getPointAtLength(s);
      // small step to get tangent direction
      const p2 = el.getPointAtLength(Math.min(total, s + 0.1));
      let tx = p2.x - p.x;
      let ty = p2.y - p.y;
      const mag = Math.hypot(tx, ty) || 1;
      tx /= mag;
      ty /= mag;
      const nx = -ty; // normal
      const ny = tx;

      const off = offsetPx ?? 0;
      return { x: p.x + nx * off, y: p.y + ny * off };
    },
    [labelX, labelY, cx, cy]
  );

  // Use t/offset if present, else fall back to default midpoint
  const tNorm = data?.t ?? 0.5;
  const offsetPx = data?.offset ?? 0;
  const { x: finalX, y: finalY } = getPointOnPath(tNorm, offsetPx);

  useEffect(() => {
    setLabelValue(data?.label || '');
  }, [data?.label]);

  const updateEdge = useCallback(
    (updates) => {
      setEdges((eds) => eds.map((edge) => (edge.id === id ? { ...edge, ...updates } : edge)));
    },
    [id, setEdges]
  );

  // --- Dragging: move along the actual path (tangent) and perpendicular (normal) ---
  const handleDragStart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const el = pathRef.current;
    if (!el || typeof el.getTotalLength !== 'function') return;

    let total = el.getTotalLength();
    if (total === 0) return;

    let s = (data?.t ?? 0.5) * total;
    let off = data?.offset ?? 0;

    let lastX = e.clientX;
    let lastY = e.clientY;

    // 🔥 margins so it doesn't go beyond the line ends
    const shiftRight = 8; // constant right bias
    const leftShift = 12; // extra block from moving left
    const leftMargin = 6 + leftShift;
    const rightMargin = 12;
    const minS = leftMargin;
    const maxS = Math.max(minS, total - rightMargin);

    const maxOffset = 18;

    const onMouseMove = (moveEvent) => {
      const dx = moveEvent.clientX - lastX;
      const dy = moveEvent.clientY - lastY;
      lastX = moveEvent.clientX;
      lastY = moveEvent.clientY;

      const p = el.getPointAtLength(Math.max(0, Math.min(total, s)));
      const p2 = el.getPointAtLength(Math.max(0, Math.min(total, s + 0.1)));
      let tx = p2.x - p.x;
      let ty = p2.y - p.y;
      const tlen = Math.hypot(tx, ty) || 1;
      tx /= tlen;
      ty /= tlen;

      const nx = -ty;
      const ny = tx;

      const along = dx * tx + dy * ty;
      const perp = dx * nx + dy * ny;

      s = Math.max(minS, Math.min(maxS, s + along));
      off = Math.max(-maxOffset, Math.min(maxOffset, off + perp));

      // 🔥 apply shiftRight only when updating offset
      const shiftedOffset = off + shiftRight;

      updateEdge({
        data: {
          ...data,
          t: total > 0 ? s / total : 0.5,
          offset: shiftedOffset,
          label: labelValue
        }
      });
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener(
      'mouseup',
      () => {
        window.removeEventListener('mousemove', onMouseMove);
      },
      { once: true }
    );
  };

  const handleSwap = useCallback(
    (e) => {
      e.stopPropagation();
      const currentIndex = markerStates.findIndex((state) => state.start === isMarkerVisible.start && state.end === isMarkerVisible.end);
      const nextIndex = (currentIndex + 1) % markerStates.length;
      const newState = markerStates[nextIndex];

      updateEdge({
        style: { ...style, ...newState }
      });
    },
    [isMarkerVisible, style, updateEdge]
  );

  const onEditEdge = useCallback(
    (e) => {
      e.stopPropagation();
      dispatch(setAnchorEl({ type: 'edge', value: `rf__edge-${id}` }));
      dispatch(setSelectedBlock({ id, data }));
      dispatch(
        setEdgeDetails({
          name: data?.label ?? '',
          properties: currentEdge?.properties ?? [],
          isAsset: currentEdge?.isAsset ?? false,
          style: style ?? {},
          startPoint: markerStart?.color ?? '#000000',
          endPoint: markerEnd?.color ?? '#000000'
        })
      );
    },
    [currentEdge, data, dispatch, id, markerEnd, markerStart, style]
  );

  const handleLabelDoubleClick = useCallback(() => {
    setIsEditing(true);
    dispatch(setSelectedBlock({ id, data }));
  }, [data, dispatch, id]);

  const handleLabelRightClick = useCallback((e) => {
    e.preventDefault();
    setIsEditing(true);
  }, []);

  const handleLabelBlur = useCallback(() => {
    setIsEditing(false);
    const newLabel = editableRef.current?.textContent || '';
    setLabelValue(newLabel);
    updateEdge({
      // keep old controlX/Y for backwards compat; main positioning uses t/offset
      data: { ...data, label: newLabel, controlX: cx, controlY: cy }
    });
  }, [data, updateEdge, cx, cy]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleLabelBlur();
        dispatch(setSelectedBlock({}));
      } else if (e.key === 'Escape') {
        setIsEditing(false);
        if (editableRef.current) {
          editableRef.current.textContent = labelValue;
        }
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

    if (start && end) {
      Icon = EastIcon;
    } else if (!start && end) {
      Icon = WestIcon;
    } else {
      Icon = SwapHorizIcon;
    }

    return (
      <button className="edgebutton">
        <Icon className="icons" sx={{ fontSize: 15 }} />
      </button>
    );
  }, [isMarkerVisible]);

  const isSelected = selectedBlock?.id === id;
  const edgeStyle = {
    ...style,
    filter: isSelected ? 'drop-shadow(0px 0px 8px #BF00FF)' : 'none'
  };

  const labelStyle = {
    outline: 'none',
    cursor: 'text',
    color: labelValue && isSelected ? 'black' : labelValue ? color?.title : color?.label,
    whiteSpace: 'nowrap',
    ...(isEditing && {
      color: 'black',
      borderRadius: '4px'
    })
  };

  return (
    <>
      <BaseEdge
        path={edgePath}
        id={id}
        markerEnd={isMarkerVisible.end ? markerEnd : undefined}
        markerStart={isMarkerVisible.start ? markerStart : undefined}
        style={edgeStyle}
      />
      {/* Hidden geometry path used for sampling points/tangents (fully transparent, no pointer events) */}
      <path d={edgePath} ref={pathRef} style={{ fill: 'none', stroke: 'transparent', pointerEvents: 'none' }} />

      <EdgeLabelRenderer>
        <Box
          role="button"
          tabIndex={0}
          onMouseDown={handleDragStart}
          sx={{
            position: 'absolute',
            top: '-10px',
            transform: `translate(-50%, -50%) translate(${finalX}px, ${finalY}px)`,
            fontSize: 12,
            pointerEvents: 'all',
            display: 'flex',
            alignItems: 'center',
            height: 'auto',
            gap: 1,
            borderRadius: '20px',
            zIndex: 1,
            cursor: 'move',
            outline: 'none',
            backgroundColor: isSelected ? 'wheat' : 'transparent',
            padding: '4px 8px'
          }}
          className="nodrag nopan edge-container"
        >
          <ClickAwayListener onClickAway={handleLabelBlur}>
            <Box
              ref={editableRef}
              contentEditable={isEditing}
              suppressContentEditableWarning
              onClick={handleLabelDoubleClick}
              onContextMenu={handleLabelRightClick}
              onBlur={handleLabelBlur}
              onKeyDown={handleKeyDown}
              sx={labelStyle}
            >
              {labelValue || 'connect'}
            </Box>
          </ClickAwayListener>

          <Box className="edge-buttons" display="flex" gap={0.5} sx={{ opacity: !isSelected ? 0 : 1 }}>
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
