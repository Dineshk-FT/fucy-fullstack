/*eslint-disable*/
import React, { useState } from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';
import CustomHandle from './CustomHandle';
import ColorTheme from '../../store/ColorTheme';

export default function VotingGate(props) {
  const color = ColorTheme();
  const { setNodes } = useReactFlow();
  const [isHovered, setIsHovered] = useState(false);

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
      style={{ position: 'relative', width: '100px', height: '100px' }}
    >
      <CustomHandle type="target" position={Position.Top} style={{ top: '28px', opacity: 0 }} isConnectable={100} />
      <svg width="100px" height="100px" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
        <path
          fill="none"
          stroke={color?.stroke}
          strokeWidth="6"
          transform="rotate(-90 256 256)"
          d="M105 105v302h151c148 0 148-302 0-302H105z"
        />

        <path fill="none" stroke={color?.stroke} strokeWidth="6" d="M105 407 L350 165" />
      </svg>
      <Handle type="source" position={Position.Bottom} style={{ bottom: '20px', opacity: 0 }} isConnectable={true} />
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
