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
import DetailsIcon from '@mui/icons-material/Details';
import CloseIcon from '@mui/icons-material/Close';

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

export default function DataNode({ id, data, isConnectable, type }) {
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false; // Set to false when component unmounts
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

  const handleLabelBlur = () => {
    setIsEditing(false);
    const newLabel = tempLabelValue.trim(); // Use tempLabelValue instead of labelRef
    setLabelValue(newLabel);
    updateNodeLabel(newLabel);
    dispatch(setDetails({ ...details, name: newLabel }));
  };

  const handleLabelCancel = () => {
    setIsEditing(false);
    setTempLabelValue(labelValue); // Reset to the original label value
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleLabelBlur();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      if (labelRef.current) {
        handleLabelCancel();
      }
    }
  };

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'F3' && isSelected) {
        setIsEditing(true);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [id, selectedBlock]);

  const handleTextFieldMouseDown = (e) => {
    e.stopPropagation();
  };

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      // Remove this line: inputRef.current.select();
    }
  }, [isEditing]);

  const handleInfoClick = () => {
    setPropertiesOpen(false);
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

  const handleDetailClick = () => {
    setPropertiesOpen(true);
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
    // Close dialogs immediately
    if (isMounted.current) {
      setIsUnsavedDialogVisible(false);
      setIsVisible(false);
    }
    deleteNode({ assetId: assets._id, nodeId: id })
      .then(() => {
        if (isMounted.current) {
          // Remove node from canvas immediately
          setNodes((nodes) => nodes.filter((node) => node.id !== id));
          // Fetch updated assets (optional, depending on your app's needs)
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
          if (isEditing) handleLabelBlur();
        }}
      >
        <div
          role="button"
          tabIndex={0}
          className={`my-custom-node cylinder-node ${type}`}
          style={{
            ...data?.style,
            background: `linear-gradient(180deg, #ddd, ${data?.style?.backgroundColor})`,
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
          <Handle style={{ backgroundColor: bgColor }} className="handle" id="top" position={Position.Top} isConnectable={true} />
          <Handle style={{ backgroundColor: bgColor }} className="handle" id="left" position={Position.Left} isConnectable={true} />
          {isEditing ? (
            <TextField
              ref={textFieldRef}
              inputRef={inputRef}
              value={tempLabelValue}
              onChange={(e) => setTempLabelValue(e.target.value)}
              onBlur={handleLabelBlur}
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
                '&:hover': {
                  backgroundColor: isSelected ? 'rgba(120, 75, 232, 0.1)' : 'rgba(169, 169, 169, 0.1)'
                }
              }}
            >
              {labelValue}
            </Box>
          )}
          <Handle className="handle" style={{ backgroundColor: bgColor }} id="bottom" position={Position.Bottom} isConnectable={true} />
          <Handle className="handle" style={{ backgroundColor: bgColor }} id="right" position={Position.Right} isConnectable={true} />
          <div
            onClick={(e) => {
              e.stopPropagation();
              handleInfoClick();
            }}
            style={{ ...iconStyle, left: '-12px', display: isSelected ? 'flex' : 'none' }}
          >
            <EditIcon sx={{ fontSize: '0.9rem', mb: 0.1 }} />
          </div>
          <div
            onClick={(e) => {
              e.stopPropagation();
              handleDetailClick();
            }}
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
}
