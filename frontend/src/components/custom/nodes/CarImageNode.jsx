/* eslint-disable */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Handle, NodeResizer, Position, useReactFlow, useUpdateNodeInternals } from 'reactflow';
import { shallow } from 'zustand/shallow';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';
import useThrottle from '../../../hooks/useThrottle';
import useStore from '../../../store/Zustand/store';
import { setAnchorEl, setDetails, setSelectedBlock } from '../../../store/slices/CanvasSlice';

const selector = (state) => ({
  nodes: state.nodes,
  setSelectedElement: state.setSelectedElement,
  setPropertiesOpen: state.setPropertiesOpen,
  deleteNode: state.deleteNode,
  getAssets: state.getAssets,
  assets: state.assets,
  model: state.model
});

const CarImageNode = ({ id, data, isConnectable }) => {
  const dispatch = useDispatch();
  const { nodes, setSelectedElement, setPropertiesOpen } = useStore(selector, shallow);
  const { setNodes } = useReactFlow();
  const updateNodeInternals = useUpdateNodeInternals(); // For forcing re-measure
  const { selectedBlock } = useSelector((state) => state?.canvas);

  const [isHovered, setIsHovered] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const isSelected = selectedBlock?.id === id;
  const bgColor = isSelected ? '#784be8' : '#A9A9A9';
  const [value, setValue] = useState(data?.label || '');
  const imgRef = useRef(null); // Ref for image

  const [dimensions, setDimensions] = useState({
    width: data?.style?.width || 1000,
    height: data?.style?.height || 750
  });

  // Update dimensions when data changes
  useEffect(() => {
    if (data?.style?.width && data.style.width !== dimensions.width) {
      setDimensions((prev) => ({ ...prev, width: data.style.width }));
    }
    if (data?.style?.height && data.style.height !== dimensions.height) {
      setDimensions((prev) => ({ ...prev, height: data.style.height }));
    }
  }, [data?.style?.width, data?.style?.height]);

  const throttledResize = useThrottle((newWidth, newHeight) => {
    // Update local dimensions
    setDimensions({ width: newWidth, height: newHeight });

    // Update node data
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === id
          ? {
              ...node,
              data: {
                ...node.data,
                style: {
                  ...node.data.style,
                  width: newWidth,
                  height: newHeight
                }
              },
              style: {
                ...node.style,
                width: newWidth,
                height: newHeight
              }
            }
          : node
      )
    );
  }, 16);

  const handleResize = useCallback(
    (_, { width: newWidth, height: newHeight }) => {
      requestAnimationFrame(() => {
        throttledResize(newWidth, newHeight);
        updateNodeInternals(id); // Force RF re-measure after resize
      });
    },
    [throttledResize, updateNodeInternals]
  );

  useEffect(() => {
    setValue(data?.label || '');
  }, [data?.label]);

  // Trigger re-measure on image load
  useEffect(() => {
    const img = imgRef.current;
    if (img) {
      const handleLoad = () => {
        updateNodeInternals(id); // Force RF to re-measure node
      };
      img.addEventListener('load', handleLoad);
      return () => img.removeEventListener('load', handleLoad);
    }
  }, [updateNodeInternals]);

  const handleInfoClick = (open) => {
    setPropertiesOpen(open);
    const selectedNode = nodes.find((node) => node.id === id);
    const { isAsset, properties } = selectedNode;
    dispatch(setSelectedBlock({ id, data }));
    dispatch(setAnchorEl({ type: 'node', value: id }));
    setSelectedElement(selectedNode);
    dispatch(
      setDetails({
        name: data?.label ?? '',
        description: data?.description ?? '',
        properties: properties ?? [],
        isAsset: isAsset ?? false
      })
    );
  };

  const handleClick = (e) => {
    e.stopPropagation();
    setOpenDialog(true);
  };

  const handleDialogClose = (e) => {
    if (e) {
      e.stopPropagation();
    }
    setOpenDialog(false);
  };

  const handleConfirm = () => {
    dispatch(
      setSelectedBlock({
        id,
        type: 'carImage',
        data: {
          ...data,
          style: {
            ...data.style,
            width: dimensions.width,
            height: dimensions.height
          }
        }
      })
    );
    handleInfoClick(true);
    setOpenDialog(false);
  };

  // Import the car blueprint image
  const carImage = require('../../../assets/images/others/CarBluePrint.png');

  return (
    <div
      className="car-image-node"
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        width: '100%', // Fill RF wrapper
        height: '100%',
        border: `2px solid ${isSelected ? '#784be8' : 'transparent'}`,
        borderRadius: '5px',
        backgroundColor: 'transparent',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        position: 'relative',
        boxSizing: 'border-box',
        padding: '10px'
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick(e)}
    >
      <NodeResizer
        minWidth={200}
        minHeight={150}
        isVisible={isSelected}
        onResize={handleResize}
        onResizeEnd={() => updateNodeInternals(id)} // Re-measure on end
        color="#ff0071"
        handleStyle={{
          width: '10px',
          height: '10px',
          border: '2px solid #ff0071',
          borderRadius: '50%',
          backgroundColor: 'white',
          transform: 'translate(-50%, -50%)',
          zIndex: 10
        }}
        lineStyle={{
          border: '1px dashed #ff0071'
        }}
      />

      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundClip: 'padding-box',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.2s ease-in-out',
          backgroundColor: 'transparent'
        }}
      >
        <img
          ref={imgRef}
          src={carImage}
          alt="Car Blueprint"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            display: 'block'
          }}
          onError={() => console.error('Car image load failed')}
        />
        {value && (
          <div
            style={{
              position: 'absolute',
              bottom: '5px',
              left: 0,
              right: 0,
              textAlign: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              padding: '2px 0',
              fontSize: '12px',
              fontWeight: 'bold',
              color: '#333'
            }}
          >
            {value}
          </div>
        )}
      </div>

      <Handle
        type="target"
        position={Position.Top}
        id="top"
        style={{
          background: bgColor,
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          border: '2px solid white'
        }}
        isConnectable={isConnectable}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        style={{
          background: bgColor,
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          border: '2px solid white'
        }}
        isConnectable={isConnectable}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        style={{
          background: bgColor,
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          border: '2px solid white'
        }}
        isConnectable={isConnectable}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        style={{
          background: bgColor,
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          border: '2px solid white'
        }}
        isConnectable={isConnectable}
      />

      <Dialog
        open={openDialog}
        onClose={handleDialogClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Open Subset Model</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Do you want to open the subset model for node: <strong>{value || 'Untitled Node'}</strong>?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleDialogClose();
            }}
            color="primary"
          >
            Cancel
          </Button>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleConfirm();
            }}
            color="primary"
            autoFocus
          >
            Open
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default CarImageNode;
