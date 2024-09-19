import React from 'react';
import { Handle, NodeResizer, Position } from 'reactflow';

const OutputNode = ({ data, isConnectable, type }) => {
  return (
    <>
      <NodeResizer />
      <div
        className={`my-custom-node ${type}`}
        style={{
          ...data?.style
        }}
      >
        <div>{data?.label}</div>
        <Handle className="handle" id="a" type="target" position={Position.Top} isConnectable={isConnectable} />
      </div>
    </>
  );
};

export default OutputNode;
