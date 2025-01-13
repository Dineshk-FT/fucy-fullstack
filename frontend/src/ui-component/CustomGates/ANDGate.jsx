import React, { useState } from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';

import ColorTheme from '../../store/ColorTheme';
import { NodeResizer } from 'reactflow';
import CustomHandle from './CustomHandle';

export default function ANDGate(props) {
  const color = ColorTheme();
  const { setNodes } = useReactFlow();
  const [isHovered, setIsHovered] = useState(false);
  const [nodeDimensions, setNodeDimensions] = useState({ width: 80, height: 80 });

  const handleDeleteFromCanvas = () => {
    setNodes((nodes) => nodes.filter((node) => node.id !== props.id));
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleDeleteFromCanvas();
        }
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'relative',
        width: `${nodeDimensions.width}px`,
        height: `${nodeDimensions.height}px`
      }}
    >
      <NodeResizer
        lineStyle={{ backgroundColor: color?.stroke ?? 'gray', borderWidth: '2px' }}
        minWidth={60}
        minHeight={60}
        onResize={(event, params) => {
          setNodeDimensions({ width: params.width, height: params.height });
        }}
      />
      <CustomHandle type="target" position={Position.Left} style={{ opacity: 0 }} isConnectable={1} />
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={`${nodeDimensions.width}px`}
        height={`${nodeDimensions.height}px`}
        viewBox="0 0 512 512"
      >
        <path
          fill={color?.stroke}
          d="M105 105v302h151c148 0 148-302 0-302H105zm-89 46v18h71v-18H16zm368.8 96c.2 6 .2 12 0 18H496v-18H384.8zM16 343v18h71v-18H16z"
        />
      </svg>
      <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />
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
          width: '20px',
          height: '19px',
          top: '12px',
          right: '0px',
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
    </div>
  );
}
