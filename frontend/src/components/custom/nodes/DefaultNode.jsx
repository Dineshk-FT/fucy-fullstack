/*eslint-disable*/
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Handle, NodeResizer, Position, useReactFlow } from 'reactflow';
import { Box, ClickAwayListener, Dialog, DialogActions, DialogContent, TextField } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import EditIcon from '@mui/icons-material/Edit';
import { iconStyle } from '../../../themes/constant';
import { setAnchorEl, setSelectedBlock, setDetails } from '../../../store/slices/CanvasSlice';
import { shallow } from 'zustand/shallow';
import useStore from '../../../store/Zustand/store';
import CloseIcon from '@mui/icons-material/Close';
import DetailsIcon from '@mui/icons-material/Details';

const selector = (state) => ({
  nodes: state.nodes,
  model: state.model,
  deleteNode: state.deleteNode,
  getAssets: state.getAssets,
  assets: state.assets,
  originalNodes: state.originalNodes,
  selectedNodes: state.selectedNodes,
  setSelectedElement: state.setSelectedElement,
  setPropertiesOpen: state.setPropertiesOpen
});

export default React.memo(function DefaultNode({ id, data, type }) {
  const dispatch = useDispatch();
  const { isNodePasted, nodes, model, assets, getAssets, deleteNode, originalNodes, selectedNodes, setSelectedElement, setPropertiesOpen } =
    useStore(selector, shallow);
  const { selectedBlock, details } = useSelector((state) => state?.canvas);
  const { setNodes } = useReactFlow();
  const [isVisible, setIsVisible] = useState(false);
  const [isUnsavedDialogVisible, setIsUnsavedDialogVisible] = useState(false);
  const [width, setWidth] = useState(data?.style?.width ?? 120);
  const [height, setHeight] = useState(() => data?.style?.height ?? 40);
  const [isEditing, setIsEditing] = useState(false);
  const [labelValue, setLabelValue] = useState(data?.label || '');
  const [tempLabelValue, setTempLabelValue] = useState(data?.label || '');
  const textFieldRef = useRef(null);
  const inputRef = useRef(null);
  const isMounted = useRef(true);

  const [handles, setHandles] = useState(
    data?.handles || [
      // Named positions
      { id: 'top', position: Position.Top },
      { id: 'right', position: Position.Right },
      { id: 'bottom', position: Position.Bottom },
      { id: 'left', position: Position.Left },

      // Single-letter aliases (for edge compatibility)
      { id: 'a', position: Position.Top },
      { id: 'b', position: Position.Bottom },
      { id: 'c', position: Position.Left },
      { id: 'd', position: Position.Right },
      { id: 't', position: Position.Top },
      { id: 'r', position: Position.Right },
      { id: 'l', position: Position.Left },

      // Offset variants
      { id: 'top-right', position: Position.Top, offset: 20 },
      { id: 'top-left', position: Position.Top, offset: -20 },
      { id: 'bottom-right', position: Position.Bottom, offset: 20 },
      { id: 'bottom-left', position: Position.Bottom, offset: -20 },
      { id: 'right-top', position: Position.Right, offset: -20 },
      { id: 'right-bottom', position: Position.Right, offset: 20 },
      { id: 'left-top', position: Position.Left, offset: -20 },
      { id: 'left-bottom', position: Position.Left, offset: 20 }
    ]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const isSelected = selectedBlock?.id === id;
  const bgColor = isSelected ? '#784be8' : '#A9A9A9';

  useEffect(() => {
    setLabelValue(data?.label || '');
    setTempLabelValue(data?.label || '');
  }, [data?.label]);

  const handleResize = (_, { width: newWidth, height: newHeight }) => {
    requestAnimationFrame(() => {
      const updatedWidth = newWidth;
      const updatedHeight = newHeight;

      setWidth(updatedWidth);
      setHeight(updatedHeight);

      setNodes((nodes) =>
        nodes.map((node) =>
          node.id === id
            ? {
                ...node,
                data: {
                  ...node.data,
                  style: {
                    ...node.data.style,
                    height: updatedHeight,
                    width: updatedWidth
                  }
                }
              }
            : node
        )
      );
    });
  };

  const updateNodeLabel = (newLabel) => {
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === id
          ? {
              ...node,
              data: {
                ...node.data,
                label: newLabel
              }
            }
          : node
      )
    );
  };

  const handleLabelDoubleClick = (e) => {
    e.stopPropagation();
    setIsEditing(true);
    setTempLabelValue(labelValue);
    dispatch(setSelectedBlock({ id, data }));
  };

  const handleLabelRightClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsEditing(true);
    setTempLabelValue(labelValue);
  };

  const handleLabelSave = () => {
    setIsEditing(false);
    const newLabel = tempLabelValue.trim() || 'Node';
    setLabelValue(newLabel);
    updateNodeLabel(newLabel);
    dispatch(setDetails({ ...details, name: newLabel }));
  };

  const handleLabelCancel = () => {
    setIsEditing(false);
    setTempLabelValue(labelValue);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleLabelSave();
    } else if (e.key === 'Escape') {
      handleLabelCancel();
    }
  };

  // Prevent node dragging when interacting with TextField
  const handleTextFieldMouseDown = (e) => {
    e.stopPropagation();
  };

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      // Remove this line: inputRef.current.select();
    }
  }, [isEditing]);

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

  const onNodeClick = () => {
    setNodes((nodes) => nodes?.filter((node) => node.id !== id));
    setIsVisible(false);
  };

  const handleDelete = useCallback(() => {
    if (!assets?._id || !model?._id) {
      console.error('Missing assetId or modelId');
      return;
    }
    if (isMounted.current) {
      setIsUnsavedDialogVisible(false);
      setIsVisible(false);
    }
    deleteNode({ assetId: assets._id, nodeId: id })
      .then(() => {
        if (isMounted.current) {
          setNodes((nodes) => nodes.filter((node) => node.id !== id));
          getAssets(model._id);
        }
      })
      .catch((err) => {
        if (isMounted.current) {
          console.error('Delete node error:', err);
          alert('Failed to delete node. Please try again.');
        }
      })
      .finally(() => {
        if (isMounted.current) {
          setIsUnsavedDialogVisible(false);
          setIsVisible(false);
        }
      });
  }, [assets, model, id, deleteNode, getAssets, setNodes]);

  const handlePermanentDeleteClick = () => {
    if (nodes.length > originalNodes.length) {
      setIsUnsavedDialogVisible(true);
    } else {
      handleDelete();
    }
  };

  const handleUnsavedDialogClose = () => setIsUnsavedDialogVisible(false);
  const handleUnsavedDialogContinue = () => handleDelete();

  const copiedNodes = nodes?.filter((node) => node.isCopied === true);
  const isCopiedNode = copiedNodes.some((node) => node.id === id);

  // Function to calculate handle position with offset
  const getHandleStyle = (handle) => {
    const isAlias = ['a', 'b', 'c', 'd', 't', 'r', 'l'].includes(handle.id);
    const baseStyle = {
      backgroundColor: isAlias ? 'transparent' : bgColor,
      width: isAlias ? 6 : 8,
      height: isAlias ? 6 : 8,
      border: isAlias ? '1px solid transparent' : `2px solid white`,
      borderRadius: '50%'
    };

    if (handle.offset) {
      switch (handle.position) {
        case Position.Top:
          return { ...baseStyle, left: `calc(50% + ${handle.offset}px)` };
        case Position.Bottom:
          return { ...baseStyle, left: `calc(50% + ${handle.offset}px)` };
        case Position.Left:
          return { ...baseStyle, top: `calc(50% + ${handle.offset}px)` };
        case Position.Right:
          return { ...baseStyle, top: `calc(50% + ${handle.offset}px)` };
        default:
          return baseStyle;
      }
    }
    return baseStyle;
  };

  return (
    <>
      <NodeResizer
        minWidth={data?.label?.length <= 15 ? 50 : data?.label?.length >= 15 && data?.label?.length <= 35 ? 100 : 130}
        minHeight={data?.label?.length <= 15 ? 30 : data?.label?.length >= 15 && data?.label?.length <= 35 ? 50 : 80}
        onResize={handleResize}
        style={{
          pointerEvents: 'auto',
          zIndex: 10
        }}
      />
      <ClickAwayListener
        onClickAway={() => {
          setIsVisible(false);
          if (isEditing) handleLabelSave();
        }}
      >
        <div
          role="button"
          tabIndex={0}
          className={`my-custom-node ${type}`}
          style={{
            ...data?.style,
            backgroundColor: data?.style?.backgroundColor ?? '#d3cfcf',
            borderStyle: data?.style?.borderStyle ?? 'solid',
            borderColor: data?.style?.borderColor ?? '#323131',
            borderWidth: data?.style?.borderWidth ?? 1,
            position: 'relative',
            overflow: 'visible',
            boxShadow: selectedNodes.some((node) => node.id === id)
              ? '0px 0px 7px 3px #32ed0f'
              : isSelected
                ? '0px 0px 7px 3px violet'
                : 'none',
            width: width,
            height: height,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '5px',
            wordBreak: 'break-word',
            whiteSpace: 'pre-wrap'
          }}
        >
          {/* Dynamic Handles */}
          {handles.map((handle) => (
            <Handle
              key={handle.id}
              id={handle.id}
              position={handle.position}
              style={getHandleStyle(handle)}
              className="handle"
              isConnectable={true}
            />
          ))}

          {isEditing ? (
            <TextField
              ref={textFieldRef}
              inputRef={inputRef}
              value={tempLabelValue}
              onChange={(e) => setTempLabelValue(e.target.value)}
              onBlur={handleLabelSave}
              onKeyDown={handleKeyDown}
              onMouseDown={handleTextFieldMouseDown}
              onDragStart={(e) => e.stopPropagation()}
              variant="standard"
              size="small"
              sx={{
                '& .MuiInputBase-root': {
                  fontSize: '12px',
                  textAlign: 'center',
                  padding: '0 4px',
                  minWidth: '60px',
                  maxWidth: `${width - 20}px`,
                  pointerEvents: 'auto' // Ensure text field is interactive
                },
                '& .MuiInputBase-input': {
                  textAlign: 'center',
                  padding: '2px 4px',
                  cursor: 'text'
                },
                // Add these styles to remove the border-bottom
                '& .MuiInput-underline:before': {
                  borderBottom: 'none'
                },
                '& .MuiInput-underline:after': {
                  borderBottom: 'none'
                },
                // Optional: If you want to remove the hover effect underline as well
                '& .MuiInput-underline:hover:not(.Mui-disabled):before': {
                  borderBottom: 'none'
                }
              }}
              inputProps={{
                style: {
                  textAlign: 'center',
                  padding: '2px 4px'
                }
              }}
            />
          ) : (
            <Box
              onClick={handleLabelDoubleClick}
              onContextMenu={handleLabelRightClick}
              onMouseDown={(e) => e.stopPropagation()} // Prevent drag when clicking label
              sx={{
                maxWidth: width - 10,
                textAlign: 'center',
                cursor: 'text',
                padding: '0 4px',
                borderRadius: '4px',
                color: data?.style?.color ?? '#000000',
                '&:hover': {
                  backgroundColor: isSelected ? 'rgba(120, 75, 232, 0.1)' : 'rgba(169, 169, 169, 0.1)'
                }
              }}
            >
              {labelValue}
            </Box>
          )}

          <div
            onClick={(e) => {
              e.stopPropagation();
              handleInfoClick(false);
            }}
            onMouseDown={(e) => e.stopPropagation()}
            style={{ ...iconStyle, left: '-12px', display: isSelected ? 'flex' : 'none' }}
          >
            <EditIcon sx={{ fontSize: '0.9rem', mb: 0.1 }} />
          </div>
          <div
            onClick={(e) => {
              e.stopPropagation();
              handleInfoClick(true);
            }}
            onMouseDown={(e) => e.stopPropagation()}
            style={{ ...iconStyle, left: '12px', display: isSelected ? 'flex' : 'none' }}
          >
            <DetailsIcon sx={{ fontSize: '0.9rem', mb: 0.3 }} />
          </div>
          <div
            className="delete-icon"
            onClick={(e) => {
              e.stopPropagation();
              setIsVisible(true);
            }}
            onMouseDown={(e) => e.stopPropagation()}
            style={{
              ...iconStyle,
              right: '-12px',
              background: '#f83e3e',
              border: 'none',
              display: isSelected ? 'flex' : 'none'
            }}
          >
            <CloseIcon sx={{ fontSize: '1rem', mb: 0.1 }} />
          </div>
        </div>
      </ClickAwayListener>

      <Dialog open={isVisible} onClose={() => setIsVisible(false)}>
        <DialogContent style={{ paddingBottom: '5px' }}>
          <p style={{ margin: '0px' }}>Do you want to delete this node from the canvas or permanently?</p>
        </DialogContent>
        <DialogActions style={{ display: 'flex', justifyContent: 'space-around' }}>
          <button
            onClick={onNodeClick}
            style={{
              padding: '6px',
              fontSize: '0.8rem',
              border: '1px solid #007bff',
              background: '#007bff',
              color: '#fff',
              cursor: 'pointer'
            }}
          >
            Delete from Canvas
          </button>
          {!isCopiedNode && !isNodePasted && (
            <button
              onClick={handlePermanentDeleteClick}
              style={{
                padding: '6px',
                fontSize: '0.8rem',
                border: '1px solid #dc3545',
                background: '#dc3545',
                color: '#fff',
                cursor: 'pointer'
              }}
            >
              Delete Permanently
            </button>
          )}
        </DialogActions>
      </Dialog>

      <Dialog open={isUnsavedDialogVisible} onClose={handleUnsavedDialogClose}>
        <DialogContent>
          <p>You have unsaved changes. Are you sure you want to delete permanently?</p>
        </DialogContent>
        <DialogActions>
          <button
            onClick={handleUnsavedDialogClose}
            style={{
              padding: '6px',
              fontSize: '0.8rem',
              border: '1px solid #007bff',
              background: '#007bff',
              color: '#fff',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleUnsavedDialogContinue}
            style={{
              padding: '6px',
              fontSize: '0.8rem',
              border: '1px solid #dc3545',
              background: '#dc3545',
              color: '#fff',
              cursor: 'pointer'
            }}
          >
            Continue
          </button>
        </DialogActions>
      </Dialog>
    </>
  );
});
