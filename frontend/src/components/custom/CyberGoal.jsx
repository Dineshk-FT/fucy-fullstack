import React from 'react';
import { Handle, NodeResizer, Position } from 'reactflow';

export default function CyberGoal({ data, isConnectable, type }) {
  return (
    <>
      <NodeResizer />
      <div
        className={`${type}`}
        style={{
          backgroundColor: `${data['bgColor']}`
        }}
      >
        <Handle className="handle" id="a" type="target" position={Position.Top} isConnectable={isConnectable} />
        <div>{data?.label}</div>
        <Handle className="handle" id="b" type="range" position={Position.Bottom} isConnectable={isConnectable} />
      </div>
    </>
  );
}
