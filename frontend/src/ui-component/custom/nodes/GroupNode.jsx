/*eslint-disable*/
import React, { useCallback, useEffect, useState } from 'react';
import { Handle, NodeResizer, Position, useReactFlow } from 'reactflow';
import useStore from '../../../Zustand/store';
import { shallow } from 'zustand/shallow';
import useThrottle from '../../../hooks/useThrottle';
import { useSelector } from 'react-redux';

const selector = (state) => ({
  nodes: state.nodes
});

const CustomGroupNode = ({ data, id, isConnectable, ...rest }) => {
  const { nodes } = useStore(selector, shallow);
  const { setNodes } = useReactFlow();
  const { selectedBlock } = useSelector((state) => state?.canvas);
  const [dimesions, setDimensions] = useState({
    width: data?.style?.width || 200,
    height: data?.style?.height || 200
  });

  const checkSelection = () => selectedBlock?.id === id;
  const isSelected = checkSelection();
  const bgColor = isSelected ? '#784be8' : '#A9A9A9';
  // console.log('data', data);
  // console.log('nodes', nodes);
  // console.log('rest', data.label, rest);
  const [value, setValue] = useState(data?.label || '');

  const throttledResize = useThrottle((newWidth, newHeight) => {
    setDimensions({ width: newWidth, height: newHeight });

    // Update node dimensions in Zustand
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === id ? { ...node, data: { ...node.data, style: { ...node.data.style, width: newWidth, height: newHeight } } } : node
      )
    );
  }, 50);

  const handleResize = useCallback(
    (_, { width: newWidth, height: newHeight }) => {
      requestAnimationFrame(() => {
        throttledResize(newWidth, newHeight);
      });
    },
    [throttledResize]
  );

  // Sync value state with data.label when it changes
  useEffect(() => {
    setValue(data?.label || '');
  }, [data?.label]);

  const handleChange = (e) => {
    const val = e.target.value;
    setValue(val); // Update local state
    const updatedNodes = nodes.map((node) => (node.id === id ? { ...node, data: { ...node.data, label: val } } : node));
    // Update Zustand state
    setNodes(updatedNodes);
  };

  return (
    <div style={{ height: dimesions?.height, width: dimesions?.width }}>
      <input
        type="text"
        value={value}
        onChange={handleChange}
        style={{
          alignSelf: 'flex-start',
          fontSize: '25px',
          fontWeight: 600,
          marginTop: '0.5rem',
          textAlign: 'center',
          border: 'none',
          background: 'transparent',
          outline: 'none',
          minWidth: 100,
          // maxWidth: dimesions?.width - 10, // Give some padding so it doesn't stretch to edges
          width: '100%' // This allows it to be fully contained within the node
        }}
      />

      <NodeResizer onResize={handleResize} />
      <Handle style={{ backgroundColor: bgColor }} className="handle" id="a" position={Position.Top} isConnectable={isConnectable} />
      <Handle style={{ backgroundColor: bgColor }} className="handle" id="b" position={Position.Left} isConnectable={isConnectable} />
      <Handle style={{ backgroundColor: bgColor }} className="handle" id="c" position={Position.Bottom} isConnectable={isConnectable} />
      <Handle style={{ backgroundColor: bgColor }} className="handle" id="d" position={Position.Right} isConnectable={isConnectable} />

      <div
        className="my-group-node"
        style={{
          // ...data?.style,
          position: 'relative'
          // height: dimesions?.height,
          // width: dimesions?.width
        }}
      >
        <div
          style={{
            color: 'black',
            textShadow: 'none',
            fontWeight: 600,
            height: 'inherit',
            width: 'inherit'
          }}
        />
      </div>
    </div>
  );
};

export default CustomGroupNode;
