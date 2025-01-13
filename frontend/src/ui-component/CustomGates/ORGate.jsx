import React, { useState } from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';
import CustomHandle from './CustomHandle';
import ColorTheme from '../../store/ColorTheme';
import { NodeResizer } from 'reactflow';

export default function ORGate(props) {
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
          d="M116.6 407c40-45.9 60.4-98.4 60.4-151 0-52.6-20.4-105.1-60.4-151H192c34.1 0 81.9 34 119.3 71.4 18.7 18.6 35.1 37.9 46.6 53.3 5.8 7.6 10.4 14.4 13.4 19.4 1.4 2.5 2.5 4.7 3.2 6.1.1.4.2.5.2.8 0 .3-.1.5-.2.9-.6 1.4-1.7 3.5-3.2 6-3 5.1-7.5 11.8-13.2 19.5-11.3 15.4-27.5 34.6-46.1 53.2C274.8 373 227.1 407 192 407zM16 361v-18h122.2c-3 6.1-6.3 12.1-9.9 18zm374.5-96c.2-.3.4-.7.5-1 1.1-2.4 2-4.4 2-8 0-3.6-1-5.6-2-8-.1-.3-.3-.7-.5-1H496v18zM16 169v-18h112.3c3.6 5.9 6.9 11.9 9.9 18z"
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
