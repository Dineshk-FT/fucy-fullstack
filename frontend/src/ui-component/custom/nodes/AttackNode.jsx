/*eslint-disable*/
import React, { useState } from 'react';
import { Handle, NodeResizer, Position } from 'reactflow';

const AttackNode = ({ data, isConnectable, type }) => {
  const [nodeDimensions, setNodeDimensions] = useState({ width: 250, height: 250 }); // Default dimensions

  // Calculate font size dynamically based on node dimensions
  const calculateFontSize = () => {
    const baseFontSize = 14; // Base font size
    const maxFontSize = 24; // Maximum font size
    const minFontSize = 8; // Minimum font size
    const sizeFactor = Math.min(nodeDimensions.width, nodeDimensions.height); // Factor based on the smaller dimension
    const calculatedFontSize = sizeFactor / 6; // Adjust divisor to tweak scaling
    return Math.min(maxFontSize, Math.max(minFontSize, calculatedFontSize));
  };

  const fontSize = calculateFontSize();

  // Determine alignment based on node size
  const isSmallNode = nodeDimensions.width < 150 || nodeDimensions.height < 100;

  return (
    <>
    {console.log('nodeDimensions.width', nodeDimensions.width)}
      <NodeResizer
        minWidth={100}
        minHeight={60}
        onResize={(event, params) => {
          setNodeDimensions({ width: params.width, height: params.height });
        }}
      />
      <div
        className={`my-custom-node ${type}`}
        style={{
          ...data?.style,
          fontSize: `${fontSize}px`, // Dynamically set font size
          display: 'flex',
          justifyContent: 'center', 
          alignItems: 'center',
          textAlign: 'center',
          width: `${nodeDimensions.width}px`,
          height: `${nodeDimensions.height}px`,
          padding: '8px', 
          boxSizing: 'border-box', 
          border: '1px solid #ccc', 
          borderRadius: '4px',
          backgroundColor: data?.style?.backgroundColor || '#fff',
          overflow: 'hidden', 
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            overflowWrap: 'break-word', // Wrap text to prevent overflow
            wordBreak: 'break-word', // Handles long words gracefully
            display: 'flex',
            flexDirection: 'column',
            justifyContent: isSmallNode ? 'flex-start' : 'center',
            alignItems: 'flex-start',
          }}
        >
          {data?.label}
        </div>
        <Handle
          className="handle"
          type="source"
          id="b"
          position={Position.Bottom}
          isConnectable={isConnectable}
        />
      </div>
    </>
  );
};

export default AttackNode;
