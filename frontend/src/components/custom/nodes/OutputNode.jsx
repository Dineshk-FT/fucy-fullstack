/*eslint-disable*/
import React, { useState } from 'react';
import { Handle, NodeResizer, NodeToolbar, Position, useReactFlow } from 'reactflow';
import useStore from '../../../store/Zustand/store';
import { ClickAwayListener, Dialog, DialogActions, DialogContent } from '@mui/material';
import { useDispatch } from 'react-redux';
import { OpenPropertiesTab, setSelectedBlock } from '../../../store/slices/CanvasSlice';
import { shallow } from 'zustand/shallow';

const selector = (state) => ({
  nodes: state.nodes,
  model: state.model,
  deleteNode: state.deleteNode,
  getAssets: state.getAssets,
  assets: state.assets
});

const OutputNode = ({ id, data, isConnectable, type }) => {
  const dispatch = useDispatch();
  const { nodes, model, assets, getAssets, deleteNode } = useStore(selector, shallow);
  const { setNodes } = useReactFlow();
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const isMounted = useRef(true);
  
    // Cleanup on unmount
    useEffect(() => {
      return () => {
        isMounted.current = false; // Set to false when component unmounts
      };
    }, []);

  const handleInfoClick = () => {
    // Open properties tab and set the selected node
    dispatch(OpenPropertiesTab());
    dispatch(setSelectedBlock({ id, data }));
  };

  const onNodeClick = () => {
    setNodes((nodes) => nodes.filter((node) => node.id !== id));
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
  

  const copiedNodes = nodes.filter((node) => node.isCopied === true);

  // Check if the current node is a copied node
  const isCopiedNode = copiedNodes.some((node) => node.id === id);

  return (
    <>
      <NodeResizer minWidth={150} minHeight={40} />
      <ClickAwayListener onClickAway={() => setIsVisible(false)}>
        <div
          role="button"
          tabIndex={0}
          className={`my-custom-node ${type}`}
          style={{
            ...data?.style,
            position: 'relative',
            overflow: 'visible'
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <Handle className="handle" id="a" position={Position.Top} isConnectable={isConnectable} />
          {/* <Handle className="handle" type="target" id="ab" style={{ left: 10 }} position={Position.Top} isConnectable={isConnectable} /> */}
          <Handle className="handle" id="b" position={Position.Left} isConnectable={isConnectable} />
          <div>{data?.label}</div>
          <Handle className="handle" id="c" position={Position.Bottom} isConnectable={isConnectable} />
          <Handle className="handle" id="d" position={Position.Right} isConnectable={isConnectable} />
          <div
            onClick={(e) => {
              e.stopPropagation();
              handleInfoClick();
            }}
            style={{
              position: 'absolute',
              top: '-12px',
              left: '-12px',
              background: '#007bff',
              borderRadius: '50%',
              width: '20px',
              height: '19px',
              fontSize: '0.7rem',
              color: 'white',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              cursor: 'pointer',
              opacity: isHovered ? 1 : 0,
              transition: 'opacity 0.2s ease-in-out'
            }}
          >
            i
          </div>
          <div
            className="delete-icon"
            onClick={(e) => {
              e.stopPropagation();
              setIsVisible(true);
            }}
            style={{
              position: 'absolute',
              width: '20px',
              height: '19px',
              top: '-12px',
              right: '-12px',
              background: '#f83e3e',
              border: 'none',
              borderRadius: '50%',
              fontSize: '0.8rem',
              color: 'white',
              cursor: 'pointer',
              opacity: isHovered ? 1 : 0,
              transition: 'opacity 0.2s ease-in-out'
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
          {!isCopiedNode && (
            <button
              onClick={handleDelete}
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
    </>
  );
};

export default OutputNode;
