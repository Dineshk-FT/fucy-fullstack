/*eslint-disable*/
import React, { useEffect, useRef, useState } from 'react';
import { Handle, NodeResizer, Position, useReactFlow } from 'reactflow';
import useStore from '../../../Zustand/store';
import { Box, ClickAwayListener, Dialog, DialogActions, DialogContent } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { OpenPropertiesTab, setAnchorEl, setSelectedBlock, setDetails, openHeader } from '../../../store/slices/CanvasSlice';
import EditIcon from '@mui/icons-material/Edit';
import { iconStyle } from '../../../store/constant';

const selector = (state) => ({
  nodes: state.nodes,
  model: state.model,
  deleteNode: state.deleteNode,
  getAssets: state.getAssets,
  assets: state.assets,
  originalNodes: state.originalNodes
});

export default function DefaultNode({ id, data, isConnectable, type }) {
  const dispatch = useDispatch();
  const { selectedBlock } = useSelector((state) => state?.canvas);

  const { isNodePasted, nodes, model, assets, getAssets, deleteNode, originalNodes } = useStore(selector);
  const { setNodes } = useReactFlow();
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isUnsavedDialogVisible, setIsUnsavedDialogVisible] = useState(false);
  const [width, setWidth] = useState(data?.style?.width ?? 100);
  const textRef = useRef(null);
  const [height, setHeight] = useState(() => data?.style?.height ?? 40);

  const handleResize = (_, { width: newWidth, height: newHeight }) => {
    requestAnimationFrame(() => {
      const updatedWidth = newWidth;
      const updatedHeight = newHeight;

      // Update state
      setWidth(updatedWidth);
      setHeight(updatedHeight);
    });
  };

  const handleInfoClick = () => {
    const selectedNode = nodes.find((node) => node.id === id);
    const { isAsset, properties } = selectedNode;
    dispatch(setSelectedBlock({ id, data }));
    dispatch(setAnchorEl(id));
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

  // console.log('nodes', nodes);
  const copiedNodes = nodes?.filter((node) => node.isCopied === true);
  const isCopiedNode = copiedNodes.some((node) => node.id === id);

  return (
    <>
      <NodeResizer
        minWidth={data?.label?.length <= 15 ? 50 : data?.label?.length >= 15 && data?.label?.length <= 35 ? 100 : 150}
        minHeight={data?.label?.length <= 15 ? 30 : data?.label?.length >= 15 && data?.label?.length <= 35 ? 50 : 80}
        onResize={handleResize}
      />
      <ClickAwayListener onClickAway={() => setIsVisible(false)}>
        <div
          role="button"
          tabIndex={0}
          className={`my-custom-node ${type}`}
          style={{
            ...data?.style,
            position: 'relative',
            overflow: 'visible',
            boxShadow: selectedBlock?.id === id ? '0px 0px 7px 3px violet' : 'none',
            width: width,
            height: height, // Apply dynamic height
            // minHeight: height ,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '5px',
            wordBreak: 'break-word',
            whiteSpace: 'pre-wrap' // Allow text to wrap properly
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <Handle className="handle" id="a" position={Position.Top} isConnectable={isConnectable} />
          <Handle className="handle" id="b" position={Position.Left} isConnectable={isConnectable} />
          <div ref={textRef} style={{ maxWidth: width - 10, textAlign: 'center' }}>
            {data?.label}
          </div>
          <Handle className="handle" id="c" position={Position.Bottom} isConnectable={isConnectable} />
          <Handle className="handle" id="d" position={Position.Right} isConnectable={isConnectable} />
          <div
            onClick={(e) => {
              e.stopPropagation();
              handleInfoClick();
            }}
            style={{ ...iconStyle, left: '-12px', opacity: isHovered ? 1 : 0 }}
          >
            i
          </div>
          <Box
            sx={{
              ...iconStyle,
              left: '20px',
              opacity: isHovered ? 1 : 0
            }}
            onClick={() => dispatch(openHeader())}
          >
            <EditIcon sx={{ fontSize: '1rem' }} />
          </Box>
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
}
