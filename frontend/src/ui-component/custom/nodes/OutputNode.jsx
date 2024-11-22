/*eslint-disable*/
import React, { useState } from 'react';
import { Handle, NodeResizer, NodeToolbar, Position, useReactFlow } from 'reactflow';
import useStore from '../../../Zustand/store';
import { ClickAwayListener } from '@mui/material';

const selector = (state) => ({
  model: state.model,
  deleteNode: state.deleteNode,
  getAssets: state.getAssets,
  assets: state.assets
});

const OutputNode = ({ id, data, isConnectable, type }) => {
  const { model, assets, getAssets, deleteNode } = useStore(selector);
  const { setNodes } = useReactFlow();
  const [isVisible, setIsVisible] = useState(false);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      setIsVisible((prev) => !prev); // Toggle visibility on Enter or Space key
    }
  };

  const onNodeClick = () => {
    setNodes((nodes) => nodes.filter((node) => node.id !== id));
  };

  const handleDelete = () => {
    deleteNode({ assetId: assets?._id, nodeId: id })
      .then((res) => {
        console.log('res', res);
        getAssets(model?._id);
      })
      .catch((err) => {
        console.log('err', err);
      });
  };

  return (
    <>
      <NodeToolbar isVisible={isVisible} position={'top'}>
        <button onClick={onNodeClick}>Delete from canvas</button>
        <button onClick={handleDelete}>Delete Permanently</button>
      </NodeToolbar>
      <NodeResizer style={{ borderColor: 'transparent' }} minWidth={140} minHeight={50} />
      <ClickAwayListener onClickAway={() => setIsVisible(false)}>
        <div
          role="button" // Add button role to make the div accessible
          tabIndex={0} // Makes the div focusable via keyboard
          onClick={() => setIsVisible((state) => !state)} // Toggle visibility on click
          onKeyPress={handleKeyPress} // Toggle visibility on key press
          className={`my-custom-node ${type}`}
          style={{
            ...data?.style
          }}
        >
          <div>{data?.label}</div>
          <Handle className="handle" id="a" type="target" position={Position.Top} isConnectable={isConnectable} />
        </div>
      </ClickAwayListener>
    </>
  );
};

export default OutputNode;
