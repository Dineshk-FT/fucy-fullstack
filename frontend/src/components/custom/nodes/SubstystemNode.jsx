import React from 'react';
import { Handle, NodeResizer, Position } from 'reactflow';

const SubSystemNode = ({ data, isConnectable, type }) => {
  return (
    <>
      <NodeResizer />
      <div
        className={`my-custom-node ${type}`}
        style={{
          ...data?.style,
          backgroundColor: '#E5EAE5'
        }}
      >
        <Handle className="handle subsystem_handle" id="a" position={Position.Top} isConnectable={isConnectable} />
        <Handle className="handle subsystem_handle" id="b" position={Position.Left} isConnectable={isConnectable} />
        <div>{data?.label}</div>
        <Handle className="handle subsystem_handle" id="c" position={Position.Bottom} isConnectable={isConnectable} />
        <Handle className="handle subsystem_handle" id="d" position={Position.Right} isConnectable={isConnectable} />
      </div>
    </>
  );
};

export default SubSystemNode;
