import React from 'react';
import { Handle, NodeResizer, Position } from 'reactflow';

const InputNode = ({ data, isConnectable, type }) => {
  // console.log('style', data?.style)
  return (
    <>
      <NodeResizer style={{ borderColor: 'transparent' }} minWidth={140} minHeight={50} />
      <div
        className={`my-custom-node ${type}`}
        style={{
          ...data?.style
        }}
      >
        <Handle className="handle" id="a" type="source" position={Position.Bottom} isConnectable={isConnectable} />
        <div>{data?.label}</div>
      </div>
    </>
  );
};

export default InputNode;
