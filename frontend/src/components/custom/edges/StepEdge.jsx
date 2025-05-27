/*eslint-disable*/
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath, useReactFlow } from 'reactflow';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import { Box, ClickAwayListener } from '@mui/material';
import { ArrowSwapHorizontal } from 'iconsax-react';
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
  const dispatch = useDispatch();
  const { selectedBlock } = useSelector((state) => state?.canvas);
  const { getEdges, setEdges } = useReactFlow();
  const color = ColorTheme();
  const editableRef = useRef(null);

  // Derive marker visibility from props instead of local state
  const isMarkerVisible = {
    start: style?.start !== false,
    end: style?.end !== false
  };

  const [isEditing, setIsEditing] = useState(false);
  const [labelValue, setLabelValue] = useState(data?.label || '');

  const edges = getEdges();
  const currentEdge = edges.find((edge) => edge.id === id);

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 0
  });

  useEffect(() => {
    setLabelValue(data?.label || '');
  }, [data?.label]);

  const updateEdge = useCallback(
    (updates) => {
      setEdges((eds) => eds.map((edge) => (edge.id === id ? { ...edge, ...updates } : edge)));
    },
    [id, setEdges]
  );

  const handleSwap = useCallback(() => {
    const currentIndex = markerStates.findIndex((state) => state.start === isMarkerVisible.start && state.end === isMarkerVisible.end);
    const nextIndex = (currentIndex + 1) % markerStates.length;
    const newState = markerStates[nextIndex];

    updateEdge({
      style: { ...style, ...newState }
    });
  }, [isMarkerVisible, style, updateEdge]);

  const onEditEdge = useCallback(() => {
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
  }, [currentEdge, data, dispatch, id, markerEnd, markerStart, style]);

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
      data: { ...data, label: newLabel }
    });
  }, [data, updateEdge]);

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
    let Icon = start && end ? ArrowRightAltIcon : ArrowSwapHorizontal;
    const iconProps = { className: 'icons', size: 15 };

    if (!start && end) {
      if (Icon.muiName) {
        iconProps.sx = { ...iconProps.sx, transform: 'rotate(180deg)' };
      }
    }

    return (
      <button className="edgebutton">
        <Icon {...iconProps} />
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
      <EdgeLabelRenderer>
        <Box
          role="button"
          tabIndex={0}
          sx={{
            position: 'absolute',
            top: '-10px',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            fontSize: 12,
            pointerEvents: 'all',
            display: 'flex',
            alignItems: 'center',
            height: 'auto',
            gap: 1,
            borderRadius: '20px',
            zIndex: 1,
            cursor: 'pointer',
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
          <Box className="edge-buttons" display="flex" gap={0.5}>
            <Box onClick={handleSwap}>{renderButton}</Box>
            <Box className="edgebutton" onClick={onEditEdge}>
              <EditIcon sx={{ fontSize: '0.6rem', ml: 0.5, mt: 0.4 }} />
            </Box>
            <button className="edgebutton" onClick={() => setEdges((eds) => eds.filter((edge) => edge.id !== id))}>
              X
            </button>
          </Box>
        </Box>
      </EdgeLabelRenderer>
    </>
  );
}
