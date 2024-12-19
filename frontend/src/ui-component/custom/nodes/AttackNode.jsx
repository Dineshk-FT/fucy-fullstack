/*eslint-disable*/
import React, { useState } from 'react';
import { Handle, NodeResizer, Position, useReactFlow } from 'reactflow';

const AttackNode = ({ data, isConnectable, type, id }) => {
  const [nodeDimensions, setNodeDimensions] = useState({ width: data?.style?.width ?? 250, height: data?.style?.height ?? 250 }); // Default dimensions
  const { setNodes } = useReactFlow();
  // console.log('data.style', data.style);
  // Calculate font size dynamically based on node dimensions
  const calculateFontSize = () => {
    const baseFontSize = 14; // Base font size
    const maxFontSize = 24; // Maximum font size
    const minFontSize = 8; // Minimum font size
    const sizeFactor = Math.min(nodeDimensions.width, nodeDimensions.height); // Factor based on the smaller dimension
    const calculatedFontSize = sizeFactor / 9; // Adjust divisor to tweak scaling
    return Math.min(maxFontSize, Math.max(minFontSize, calculatedFontSize));
  };

  const fontSize = calculateFontSize();

  // Calculate letter spacing based on node size (optional)
  const calculateLetterSpacing = () => {
    const minSpacing = 0.5; // Minimum letter spacing
    const maxSpacing = 2; // Maximum letter spacing
    const sizeFactor = Math.min(nodeDimensions.width, nodeDimensions.height); // Use the smaller dimension
    const calculatedSpacing = (sizeFactor / 250) * maxSpacing; // Adjust divisor for scaling
    return Math.min(maxSpacing, Math.max(minSpacing, calculatedSpacing));
  };

  // Calculate line height based on font size (optional)
  const calculateLineHeight = () => {
    return fontSize * 1.4; // Line height is 1.4 times the font size
  };

  const letterSpacing = calculateLetterSpacing();
  const lineHeight = calculateLineHeight();

  // Determine alignment based on node size
  const isSmallNode = nodeDimensions.width < 150 || nodeDimensions.height < 100;

  const updateNodeDimensions = (newWidth, newHeight) => {
    // Update the local dimensions state
    setNodeDimensions({ width: newWidth, height: newHeight });

    // Update the node's style in the React Flow state
    setNodes((prevNodes) =>
      prevNodes.map((node) =>
        node.id === id
          ? {
              ...node,
              data: {
                ...node.data,
                style: {
                  ...node.data.style,
                  width: newWidth,
                  height: newHeight
                }
              }
            }
          : node
      )
    );
  };

  return (
    <>
      <NodeResizer
        minWidth={180}
        minHeight={150}
        onResize={(event, params) => {
          updateNodeDimensions(params.width, params.height);
        }}
      />
      <div
        className={`my-custom-node ${type}`}
        style={{
          ...data?.style,
          fontSize: `${fontSize}px`, // Dynamically set font size
          letterSpacing: `${letterSpacing}px`, // Dynamically set letter spacing
          lineHeight: `${lineHeight}px`, // Dynamically set line height
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
          backgroundColor: '#fff',
          overflow: 'hidden'
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
            alignItems: 'flex-start'
          }}
        >
          {data?.label}
        </div>
        <Handle className="handle" type="source" id="b" position={Position.Bottom} isConnectable={isConnectable} />
      </div>
    </>
  );
};

export default AttackNode;
