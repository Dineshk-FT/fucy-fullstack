/*eslint-disable*/
import React, { useState } from 'react';
import { Handle, NodeResizer, NodeToolbar, Position, useReactFlow } from 'reactflow';
import useStore from '../../../Zustand/store';
import { ClickAwayListener, Dialog, DialogActions, DialogContent } from '@mui/material';

const selector = (state) => ({
  model: state.model,
  deleteNode: state.deleteNode,
  getAssets: state.getAssets,
  assets: state.assets
});
export default function DefaultNode({ id, data, isConnectable, type }) {
  const { model, assets, getAssets, deleteNode } = useStore(selector);
  const { setNodes } = useReactFlow();
  const [isVisible, setIsVisible] = useState(false);
  const [isCrossVisible, setIsCrossVisible] = useState(false);

  const onNodeClick = () => {
    setNodes((nodes) => nodes.filter((node) => node.id !== id));
    setIsVisible(false);
  };

  const handleDelete = () => {
    deleteNode({ assetId: assets?._id, nodeId: id })
      .then((res) => {
        // console.log('res', res);
        getAssets(model?._id);
      })
      .catch((err) => {
        console.log('err', err);
      });
  };

  return (
    <>
      <NodeResizer />
      <ClickAwayListener onClickAway={() => setIsCrossVisible(false)}>
        <div
          role="button"
          tabIndex={0}
          className={`my-custom-node ${type}`}
          style={data?.style}
          onMouseEnter={() => setIsCrossVisible(true)}
          onMouseLeave={() => setIsCrossVisible(false)}
        >
          <Handle className="handle" id="a" position={Position.Top} isConnectable={isConnectable} />
          {/* <Handle className="handle" type="target" id="ab" style={{ left: 10 }} position={Position.Top} isConnectable={isConnectable} /> */}
          <Handle className="handle" id="b" position={Position.Left} isConnectable={isConnectable} />
          <div>{data?.label}</div>
          <Handle className="handle" id="c" position={Position.Bottom} isConnectable={isConnectable} />
          <Handle className="handle" id="d" position={Position.Right} isConnectable={isConnectable} />

          {isCrossVisible && (
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
                cursor: 'pointer'
              }}
            >
              x
            </div>
          )}
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
        </DialogActions>
      </Dialog>
    </>
  );
}
