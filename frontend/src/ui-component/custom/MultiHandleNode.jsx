/* eslint-disable */
import React from 'react';
import { Handle, NodeResizer, Position } from 'reactflow';

const MultiHandleNode = ({ data, isConnectable, type }) => {
  // console.log('data', data);
  return (
    <>
      <NodeResizer />
      <div
        className={`my-custom-node ${type}`}
        style={{
          position: 'relative', // Ensure child handles can be positioned absolutely
          ...data?.style
        }}
      >
        {/* Edges */}
        <Handle className="handle" id="top" position={Position.Top} isConnectable={isConnectable} />
        <Handle className="handle" id="bottom" position={Position.Bottom} isConnectable={isConnectable} />
        <Handle className="handle" id="left" position={Position.Left} isConnectable={isConnectable} />
        <Handle className="handle" id="right" position={Position.Right} isConnectable={isConnectable} />

        <div>{data?.label}</div>
      </div>
    </>
  );
};

export default MultiHandleNode;
