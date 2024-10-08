/*eslint-disable*/
import React, { useState } from 'react';
import { Handle, NodeResizer, NodeToolbar, Position, useReactFlow } from 'reactflow';
import useStore from '../../../Zustand/store';
import { updatedModelState } from '../../../utils/Constraints';
import { useParams } from 'react-router';
import { ClickAwayListener } from '@mui/material';

const selector = (state) => ({
  model: state.model,
  nodes: state.nodes,
  edges: state.edges,
  updateModel: state.updateModel,
  getModelById: state.getModelById
});
export default function DiagonalNode({ id, data, isConnectable, type }) {
  const { id: mainId } = useParams();
  const { model, nodes, edges, updateModel, getModelById } = useStore(selector);
  // console.log('model', model);
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
    const mod = JSON.parse(JSON.stringify(model));
    const Nodestate = JSON.parse(JSON.stringify(nodes));
    const edgeState = JSON.parse(JSON.stringify(edges));
    const filteredNode = Nodestate.filter((node) => node.id !== id);
    const filteredEdge = edgeState.filter((edge) => edge.source !== id && edge.target !== id);
    updateModel(updatedModelState(mod, filteredNode, filteredEdge))
      .then((res) => {
        // console.log('res', res);
        getModelById(mainId);
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
      <NodeResizer />
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
          <Handle className="handle" id="a" position={Position.Top} isConnectable={isConnectable} />
          {/* <Handle className="handle" type="target" id="ab" style={{ left: 10 }} position={Position.Top} isConnectable={isConnectable} /> */}
          <Handle className="handle" id="b" position={Position.Left} isConnectable={isConnectable} />
          <div>{data?.label}</div>
          <Handle className="handle" id="c" position={Position.Bottom} isConnectable={isConnectable} />
          <Handle className="handle" id="d" position={Position.Right} isConnectable={isConnectable} />
        </div>
      </ClickAwayListener>
    </>
  );
}
