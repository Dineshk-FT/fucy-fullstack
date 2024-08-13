import React from 'react';
import { Handle, NodeResizer, Position } from 'reactflow';

const CustomNode = ({ data, isConnectable, type }) => {
  return (
    <>
      <NodeResizer />
      <div
        className={`my-custom-node ${type}`}
        style={{
          ...data?.style
        }}
      >
        <Handle className="handle" type="target" id="a" position={Position.Top} isConnectable={isConnectable} />
        {/* <Handle className="handle" type="target" id="ab" style={{ left: 10 }} position={Position.Top} isConnectable={isConnectable} /> */}
        <Handle className="handle" type="target" id="b" position={Position.Left} isConnectable={isConnectable} />
        <div>{data?.label}</div>
        <Handle className="handle" type="range" id="c" position={Position.Bottom} isConnectable={isConnectable} />
        <Handle className="handle" type="range" id="d" position={Position.Right} isConnectable={isConnectable} />
      </div>
    </>
  );
};

export default CustomNode;
