/*eslint-disable*/
import React, { useState, useEffect } from 'react';
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
  // const [setEdges] = useEdgesState([]);
  const dispatch = useDispatch();
  const { selectedBlock } = useSelector((state) => state?.canvas);
  const { getEdges, setEdges } = useReactFlow();
  const edges = getEdges();
  const color = ColorTheme();
  const [isMarkerVisible, setIsMarkerVisible] = useState({
    start: true,
    end: true
  });

  // console.log('edges', edges);
  // console.log('setEdges', setEdges);
  // console.log('rest', rest);

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
    const newEdges = edges.map(
      (edge) => (edge.id === id ? updatedEdge : edge) // Modify the specific edge with the new data
    );
    setEdges(newEdges); // Update edges globally
  };

  const onEdgeClick = () => {
    // Get the current edges
    const updated = edges?.filter((edge) => edge.id !== id); // Remove the clicked edge
    setEdges(updated); // Update the edges globally
  };
  // console.log('edges', edges);

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
    // console.log('selectedEdge', selectedEdge);
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
  const renderButton = () => {
    const { start, end } = isMarkerVisible;

    let Icon = ArrowSwapHorizontal;
    let iconProps = { className: 'icons' };
    // If not, use `size` prop
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
        style={{ ...style }}
      />
      <EdgeLabelRenderer>
        {/* <ClickAwayListener onClickAway={() => setIsButtonVisible(false)}> */}
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
            gap: 5,
            borderRadius: '20px',
            zIndex: 1,
            cursor: 'pointer',
            outline: 'none',
            backgroundColor: selectedBlock?.id === id ? 'wheat' : 'transparent',
            padding: '4px 8px'
          }}
          className="nodrag nopan edge-container"
        >
          {/* Edge Label */}
          <div
            className="edge-label"
            style={{
              outline: 'none',
              cursor: 'text',
              color: data?.label?.length && selectedBlock?.id === id ? 'black' : data?.label?.length ? color?.title : color?.label
            }}
          >
            {data?.label?.length ? data?.label : 'Enter name'}
          </div>
          {/* Buttons as a prefix, hidden by default */}
          <Box className="edge-buttons" display="flex" gap={0.5}>
            <Box onClick={handleSwap}>{renderButton()}</Box>
            <Box className="edgebutton" onClick={onEditEdge}>
              <EditIcon sx={{ fontSize: '0.6rem', ml: 0.5, mt: 0.4 }} />
            </Box>
            <button className="edgebutton" onClick={onEdgeClick}>
              X
            </button>
          </Box>

          {/* Popper for Editing */}
        </div>

        {/* </ClickAwayListener> */}
      </EdgeLabelRenderer>
    </>
  );
}
