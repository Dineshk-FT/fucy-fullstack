import { Box } from '@mui/material';
import React from 'react';
import { Handle, Position, NodeResizer } from 'reactflow';

const AttackTreeNode = ({ data, isConnectable, type, id }) => {
  return (
    <>
      <NodeResizer />
      <div
        className={`my-custom-node ${type}`}
        style={{
          ...data?.style
        }}
      >
        <Handle className="handle" type="target" position={Position.Top} isConnectable={isConnectable} />
        <div>{data?.label}</div>
        <Box
          my={1}
          sx={{
            width: 100,
            height: 100,
            borderRadius: 50,
            border: '1px solid black',
            // bgcolor: bgColor,
            color: 'black',
            alignContent: 'center',
            textAlign: 'center'
          }}
        >
          {id?.slice(0, 5)}
        </Box>
        <Handle className="handle" type="range" position={Position.Bottom} isConnectable={isConnectable} />
      </div>
    </>
  );
};

export default AttackTreeNode;
