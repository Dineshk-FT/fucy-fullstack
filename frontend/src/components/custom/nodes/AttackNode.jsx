/*eslint-disable*/
import React, { useCallback, useState } from 'react';
import { Handle, NodeResizer, Position, useReactFlow } from 'reactflow';
import useStore from '../../../store/Zustand/store';
import { RatingColor } from '../../Table/constraints';
import { useSelector } from 'react-redux';
import { Box } from '@mui/material';
import { DerivedThreatIcon } from '../../../assets/icons';
import { shallow } from 'zustand/shallow';

const selector = (state) => ({
  nodes: state.attackNodes,
  updateOverallRating: state.updateOverallRating,
  attackId: state.attackScenarios.subs[1]['_id']
});
const AttackNode = ({ data, isConnectable, type, id, ...rst }) => {
  const [nodeDimensions, setNodeDimensions] = useState({ width: data?.style?.width ?? 250, height: data?.style?.height ?? 250 }); // Default dimensions
  const { nodes, updateOverallRating, attackId } = useStore(selector, shallow);
  const { setNodes } = useReactFlow();
  const { attackScene } = useSelector((state) => state?.currentId);

  const [isHovered, setIsHovered] = useState(false);
  // console.log('data.style', data.style);
  // Calculate font size dynamically based on node dimensions
  // console.log('nodes', nodes);
  const handleDeleteFromCanvas = () => {
    setNodes((nodes) => nodes.filter((node) => node.id !== id));
  };

  const getHighestRating = (nodes) => {
    const priorityOrder = {
      'Very Low': 1,
      Low: 2,
      Medium: 3,
      High: 4
    };

    // Extract all ratings and find the highest
    const ratings = nodes
      .map((node) => node?.data?.rating) // Get all ratings
      .filter(Boolean); // Remove undefined or null ratings

    const highestRating = ratings.reduce((highest, current) => {
      return priorityOrder[current] > priorityOrder[highest] ? current : highest;
    }, 'Very Low'); // Default to 'Very Low' if no ratings exist
    // handleupdate(highestRating);
    return highestRating;
  };

  const borderColor = RatingColor(getHighestRating(nodes));
  // console.log('borderColor', borderColor);
  const calculateFontSize = () => {
    const maxFontSize = 24; // Maximum font size
    const minFontSize = 8; // Minimum font size
    const sizeFactor = Math.min(nodeDimensions.width, nodeDimensions.height); // Factor based on the smaller dimension
    const calculatedFontSize = sizeFactor / 8; // Adjust divisor to tweak scaling
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
        // minWidth={180}
        // minHeight={150}
        onResize={(event, params) => {
          updateNodeDimensions(params.width, params.height);
        }}
      />
      <div
        className={`my-custom-node ${type}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          ...data?.style,
          fontSize: `${fontSize}px`,
          letterSpacing: `${letterSpacing}px`,
          lineHeight: `${lineHeight}px`,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          width: `${nodeDimensions.width}px`,
          height: `${nodeDimensions.height}px`,
          padding: '8px',
          boxSizing: 'border-box',
          border: `2px solid ${borderColor === 'transparent' ? '#ccc' : borderColor}`,
          borderRadius: '4px',
          backgroundColor: '#fff',
          overflow: 'hidden',
          position: 'relative' // Add this for proper positioning of children
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            overflowWrap: 'break-word',
            wordBreak: 'break-word',
            display: 'flex',
            flexDirection: 'row', // Change to row to place icon and label side by side
            alignItems: 'center', // Center vertically
            gap: '8px', // Add some space between icon and label
            paddingLeft: data?.nodeType === 'derived' ? '28px' : '0', // Add padding if icon exists
            color: 'gray',
            position: 'relative'
          }}
        >
          {data?.nodeType && data?.nodeType === 'derived' && (
            <img
              src={DerivedThreatIcon}
              alt="attack"
              style={{
                height: '20px',
                width: '20px',
                position: 'absolute',
                left: '8px', // Adjust as needed
                top: '50%',
                transform: 'translateY(-50%)'
              }}
            />
          )}
          {data?.label}
        </div>

        {/* Delete button and handles remain the same */}
        <div
          className="delete-icon"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleDeleteFromCanvas();
            }
          }}
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteFromCanvas();
          }}
          style={{
            position: 'absolute',
            width: '16px',
            height: '16px',
            top: '2px',
            right: '2px',
            background: '#f83e3e',
            borderRadius: '50%',
            fontSize: '0.8rem',
            color: 'white',
            cursor: 'pointer',
            opacity: isHovered ? 1 : 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            transition: 'opacity 0.2s ease-in-out'
          }}
        >
          x
        </div>
        <Handle className="handle" type="source" id="b" position={Position.Bottom} isConnectable={isConnectable} />
      </div>
    </>
  );
};

export default AttackNode;
