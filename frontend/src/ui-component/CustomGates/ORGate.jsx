/*eslint-disable*/
import React, { useState } from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';
import CustomHandle from './CustomHandle';
import { colorPickerTab } from './colorPicker';
import AddPropertiesGate from '../Modal/AddPropertiesGate';
import useStore from '../../Zustand/store';

const selector = (state) => ({
  nodes: state.nodes
});

export default function ORGate(props) {
  const [open, setOpen] = useState(false);
  const { nodes } = useStore(selector);
  const { setNodes } = useReactFlow();
  const [isHovered, setIsHovered] = useState(false);

  const handleDeleteFromCanvas = () => {
    setNodes((nodes) => nodes.filter((node) => node.id !== props.id));
  };

  const handleopenModal = (e) => {
    e.preventDefault();
    // console.log('props', props)
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleDeleteFromCanvas();
          }
        }}
        // onContextMenu={handleopenModal}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ position: 'relative', width: '100px', height: '100px' }}
      >
        <CustomHandle type="target" position={Position.Top} style={{ top: '25px', opacity: 0 }} isConnectable={1} />
        <svg width="100px" height="100px" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
          <path
            fill="none"
            stroke={colorPickerTab(props?.data?.status)}
            //eslint-disable-next-line
            strokeWidth="6"
            transform="rotate(-90 256 256)"
            d="M116.6 407c40-45.9 60.4-98.4 60.4-151 0-52.6-20.4-105.1-60.4-151H192c34.1 0 81.9 34 119.3 71.4 18.7 18.6 35.1 37.9 46.6 53.3 5.8 7.6 10.4 14.4 13.4 19.4 1.4 2.5 2.5 4.7 3.2 6.1.1.4.2.5.2.8 0 .3-.1.5-.2.9-.6 1.4-1.7 3.5-3.2 6-3 5.1-7.5 11.8-13.2 19.5-11.3 15.4-27.5 34.6-46.1 53.2C274.8 373 227.1 407 192 407zM1"
          />
        </svg>
        <Handle type="source" position={Position.Bottom} style={{ bottom: '40px', opacity: 0 }} />
        {open && <AddPropertiesGate open={open} handleClose={handleClose} updateNode={props} />}
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
    </>
  );
}
