/*eslint-disable*/
import React, { useEffect, useState } from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';
import useStore from '../../store/Zustand/store';
// import Levels from '../../views/Home/Levels';
import {
  useDispatch
  // , useSelector
} from 'react-redux';
import { levelOpen } from '../../store/slices/CurrentIdSlice';
import CustomHandle from './CustomHandle';
import AddPropertiesGate from '../Modal/AddPropertiesGate';
import { colorPickerTab } from './colorPicker';
import ColorTheme from '../../themes/ColorTheme';

const selector = (state) => ({
  update: state.updateAttackNode,
  nodes: state.nodes
});
export default function TransferGate(props) {
  const dispatch = useDispatch();
  const color = ColorTheme();

  const [inputValue, setInputValue] = useState('');
  const { nodes, update } = useStore(selector);
  const [open, setOpen] = useState(false);
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

  useEffect(() => {
    if (props.data.label) {
      setInputValue(props?.data?.label);
    }
  }, [props.data]);

  const handleDoubleClick = () => {
    const dts = {
      label: props.data.label,
      id: id
    };
    dispatch(levelOpen(dts));
  };

  const handleChange = (e) => {
    const { value } = e.target;
    setInputValue(value);
    update(props?.id, value);
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
        onDoubleClick={handleDoubleClick}
        // onContextMenu={handleopenModal}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ position: 'relative', width: '100px', height: '100px' }}
      >
        <CustomHandle type="target" position={Position.Top} style={{ top: '0px', opacity: 0 }} isConnectable={100} />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <input
            type="text"
            style={{
              width: '100px',
              color: color?.stroke,
              textAlign: 'center',
              background: 'transparent',
              border: `1px solid ${color?.stroke}`
            }}
            onChange={handleChange}
            value={inputValue}
          />
          <svg width="100px" height="100px" viewBox="0 100 512 512" xmlns="http://www.w3.org/2000/svg">
            <path
              fill="none"
              stroke={color?.stroke}
              //eslint-disable-next-line
              strokeWidth="6"
              transform="rotate(-90 256 256)"
              d="M 105,111.3 V 400.7 L 365.5,256 Z M 16,247"
            />
          </svg>
        </div>
        <Handle type="source" position={Position.Bottom} style={{ bottom: '20px', opacity: 0 }} isConnectable={true} />
      </div>
      {/* {isLevelOpen && <Levels label={data?.label} id={id}/>} */}
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
    </>
  );
}
