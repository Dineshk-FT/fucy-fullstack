/*eslint-disable*/
import React, { useRef, useState, useEffect } from 'react';
import { Handle, NodeResizer, Position, useReactFlow } from 'reactflow';
import { Box, ClickAwayListener, Dialog, DialogActions, DialogContent } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import EditIcon from '@mui/icons-material/Edit';
import { iconStyle } from '../../../themes/constant';
import { setAnchorEl, setSelectedBlock, setDetails } from '../../../store/slices/CanvasSlice';
import { shallow } from 'zustand/shallow';
import useStore from '../../../store/Zustand/store';
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
  const { selectedBlock } = useSelector((state) => state?.canvas);
  const { setNodes } = useReactFlow();
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isUnsavedDialogVisible, setIsUnsavedDialogVisible] = useState(false);
  const [width, setWidth] = useState(data?.style?.width ?? 120);
  const labelRef = useRef(null);
  const [height, setHeight] = useState(() => data?.style?.height ?? 40);
  const [isEditing, setIsEditing] = useState(false);
  const [labelValue, setLabelValue] = useState(data?.label || '');

  const checkSelection = () => selectedBlock?.id === id;
  const isSelected = checkSelection();

  // console.log('isSelected', isSelected);
  const bgColor = isSelected ? '#784be8' : '#A9A9A9';
  useEffect(() => {
    setLabelValue(data?.label || '');
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

  const handleLabelDoubleClick = () => {
    setIsEditing(true);
    dispatch(setSelectedBlock({ id, data }));
  };

  const handleLabelRightClick = (e) => {
    e.preventDefault();
    setIsEditing(true);
  };

  const handleLabelBlur = () => {
    setIsEditing(false);
    const newLabel = labelRef.current?.textContent || '';
    setLabelValue(newLabel);
    updateNodeLabel(newLabel);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleLabelBlur();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      if (labelRef.current) {
        labelRef.current.textContent = labelValue;
      }
    }
  };

  // useEffect(() => {
  //   const handleKeyPress = (e) => {
  //     if (e.key === 'F3' && isSelected) {
  //       setIsEditing(true);
  //     }
  //   };

  //   window.addEventListener('keydown', handleKeyPress);
  //   return () => {
  //     window.removeEventListener('keydown', handleKeyPress);
  //   };
  // }, [id, selectedBlock]);

  useEffect(() => {
    if (isEditing && labelRef.current) {
      labelRef.current.focus();
      const range = document.createRange();
      range.selectNodeContents(labelRef.current);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }, [isEditing]);

  const handleInfoClick = (e) => {
    setPropertiesOpen(false);
    const selectedNode = nodes.find((node) => node.id === id);
    const { isAsset, properties } = selectedNode;
    dispatch(setSelectedBlock({ id, data }));
    dispatch(setAnchorEl({ type: 'node', value: id }));
    setSelectedElement(selectedNode);
    dispatch(
      setDetails({
        name: data?.label ?? '',
        properties: properties ?? [],
        isAsset: isAsset ?? false
      })
    );
  };
  // console.log('setSelectedBlock', setSelectedBlock);

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
        properties: properties ?? [],
        isAsset: isAsset ?? false
      })
    );
  };

  const onNodeClick = () => {
    setNodes((nodes) => nodes?.filter((node) => node.id !== id));
    setIsVisible(false);
  };

  const handleDelete = () => {
    deleteNode({ assetId: assets?._id, nodeId: id })
      .then(() => getAssets(model?._id))
      .catch((err) => console.log('err', err));
    setIsUnsavedDialogVisible(false);
    setIsVisible(false);
  };

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
          className={`my-custom-node ${type}`}
          style={{
            ...data?.style,
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
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <Handle style={{ backgroundColor: bgColor }} className="handle" id="top" position={Position.Top} isConnectable={true} />
          <Handle style={{ backgroundColor: bgColor }} className="handle" id="left" position={Position.Left} isConnectable={true} />
          <Box
            ref={labelRef}
            contentEditable={isEditing}
            suppressContentEditableWarning
            onClick={handleLabelDoubleClick}
            onContextMenu={handleLabelRightClick}
            onBlur={handleLabelBlur}
            onKeyDown={handleKeyDown}
            style={{
              maxWidth: width - 10,
              textAlign: 'center',
              outline: 'none',
              cursor: 'text',

              ...(isEditing && {
                // backgroundColor: 'white',
                color: 'black',
                padding: '0 4px',
                borderRadius: '4px',
                minWidth: '60px',
                cursor: 'text'
              })
            }}
          >
            {labelValue}
          </Box>
          <Handle className="handle" style={{ backgroundColor: bgColor }} id="bottom" position={Position.Bottom} isConnectable={true} />
          <Handle className="handle" style={{ backgroundColor: bgColor }} id="right" position={Position.Right} isConnectable={true} />
          <div
            onClick={(e) => {
              e.stopPropagation();
              handleInfoClick();
            }}
            style={{ ...iconStyle, left: '-12px', opacity: isHovered ? 1 : 0 }}
          >
            <EditIcon sx={{ fontSize: '0.9rem', mb: 0.1 }} />
          </div>
          <div
            onClick={(e) => {
              e.stopPropagation();
              handleDetailClick();
            }}
            style={{ ...iconStyle, left: '12px', opacity: isHovered ? 1 : 0 }}
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
              fontSize: '0.8rem',
              opacity: isHovered ? 1 : 0
            }}
          >
            x
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
