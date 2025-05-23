import React from 'react';
import { Handle, NodeResizer, Position } from 'reactflow';

export default function CyberRequire({ data, isConnectable, type }) {
  return (
    <>
      <NodeResizer />
      <div className={`${type}`}>
        <div className={`${type}-inner`}>
          <div style={{ color: 'white' }}>{data?.label}</div>
        </div>
        <Handle className="handle" type="target" position={Position.Top} isConnectable={isConnectable} />
        <Handle className="handle" type="range" position={Position.Bottom} isConnectable={isConnectable} />
      </div>
    </>
  );
}
