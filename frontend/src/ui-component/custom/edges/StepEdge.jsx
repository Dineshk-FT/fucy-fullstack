/*eslint-disable*/
import React, { useState, useEffect, useRef } from 'react';
import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath, useEdgesState, useReactFlow } from 'reactflow';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import { Box, ClickAwayListener } from '@mui/material';
import { ArrowSwapHorizontal } from 'iconsax-react';
import './buttonedge.css';
import ColorTheme from '../../../store/ColorTheme';
import { useDispatch, useSelector } from 'react-redux';
import EditIcon from '@mui/icons-material/Edit';
import { setAnchorEl, setEdgeDetails, setSelectedBlock } from '../../../store/slices/CanvasSlice';

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
  const edges = getEdges();
  const color = ColorTheme();
  const [isMarkerVisible, setIsMarkerVisible] = useState({
    start: true,
    end: true
  });
  const [isEditing, setIsEditing] = useState(false);
  const [labelValue, setLabelValue] = useState(data?.label || '');
  const editableRef = useRef(null);

  useEffect(() => {
    setIsMarkerVisible({
      start: style.start,
      end: style?.end
    });
  }, [style.start, style.end]);

  useEffect(() => {
    setLabelValue(data?.label || '');
  }, [data?.label]);

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
    const newEdges = edges.map((edge) => (edge.id === id ? updatedEdge : edge));
    setEdges(newEdges);
  };

  const onEdgeClick = () => {
    const updated = edges?.filter((edge) => edge.id !== id);
    setEdges(updated);
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

  const onEditEdge = (e) => {
    const selectedEdge = edges.find((edge) => edge.id === id);
    const { isAsset, properties, markerStart, markerEnd } = selectedEdge;
    dispatch(setAnchorEl({ type: 'edge', value: `rf__edge-${id}` }));
    dispatch(setSelectedBlock({ id, data }));
    dispatch(
      setEdgeDetails({
        name: data?.label ?? '',
        properties: properties ?? [],
        isAsset: isAsset ?? false,
        style: style ?? {},
        startPoint: markerStart.color ?? '#000000',
        endPoint: markerEnd?.color ?? '#000000'
      })
    );
  };

  const handleLabelDoubleClick = () => {
    setIsEditing(true);
  };

  const handleLabelRightClick = (e) => {
    e.preventDefault();
    setIsEditing(true);
  };

  const handleLabelBlur = () => {
    setIsEditing(false);
    const newLabel = editableRef.current?.textContent || '';
    setLabelValue(newLabel);
    updateEdges({
      ...getEdges().find((edge) => edge.id === id),
      data: { ...data, label: newLabel }
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleLabelBlur();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      if (editableRef.current) {
        editableRef.current.textContent = labelValue;
      }
    }
  };

  useEffect(() => {
    if (isEditing && editableRef.current) {
      editableRef.current.focus();
      // Select all text when editing starts
      const range = document.createRange();
      range.selectNodeContents(editableRef.current);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }, [isEditing]);

  const renderButton = () => {
    const { start, end } = isMarkerVisible;

    let Icon = ArrowSwapHorizontal;
    let iconProps = { className: 'icons' };
    iconProps.size = 15;

    if (start && end) {
      Icon = ArrowRightAltIcon;
    } else if (end) {
      Icon = ArrowRightAltIcon;
      if (Icon.muiName) {
        iconProps.sx = { ...iconProps.sx, transform: 'rotate(180deg)' };
      }
    }

    return (
      <button className="edgebutton">
        <Icon {...iconProps} />
      </button>
    );
  };

  return (
    <>
      <BaseEdge
        path={edgePath}
        id={id}
        markerEnd={isMarkerVisible.end ? markerEnd : undefined}
        markerStart={isMarkerVisible.start ? markerStart : undefined}
        style={{ ...style, filter: selectedBlock?.id === id ? 'drop-shadow(0px 0px 8px #BF00FF' : 'none' }}
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
            backgroundColor: selectedBlock?.id === id ? 'wheat' : 'transparent',
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
              sx={{
                outline: 'none',
                cursor: 'text',
                color: data?.label?.length && selectedBlock?.id === id ? 'black' : data?.label?.length ? color?.title : color?.label,
                // minWidth: '60px',
                whiteSpace: 'nowrap',
                ...(isEditing && {
                  // backgroundColor: 'white',
                  color: 'black',
                  // padding: '0 4px',
                  borderRadius: '4px'
                })
              }}
            >
              {labelValue || 'Enter name'}
            </Box>
          </ClickAwayListener>
          <Box className="edge-buttons" display="flex" gap={0.5}>
            <Box onClick={handleSwap}>{renderButton()}</Box>
            <Box className="edgebutton" onClick={onEditEdge}>
              <EditIcon sx={{ fontSize: '0.6rem', ml: 0.5, mt: 0.4 }} />
            </Box>
            <button className="edgebutton" onClick={onEdgeClick}>
              X
            </button>
          </Box>
        </Box>
      </EdgeLabelRenderer>
    </>
  );
}
