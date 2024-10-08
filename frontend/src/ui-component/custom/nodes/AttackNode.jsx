import React from 'react';
import { Handle, NodeResizer, Position } from 'reactflow';

const AttackNode = ({ data, isConnectable, type }) => {
  return (
    <>
      <NodeResizer />
      <div
        className={`my-custom-node ${type}`}
        style={{
          ...data?.style
        }}
      >
        {/* <Handle className="handle" type="target" id="a" position={Position.Top} isConnectable={isConnectable} /> */}
        <div>{data?.label}</div>
        <Handle className="handle" type="source" id="b" position={Position.Bottom} isConnectable={isConnectable} />
      </div>
    </>
  );
};

export default AttackNode;
