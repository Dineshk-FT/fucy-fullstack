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
  const [dimensions, setDimensions] = useState({
    width: data?.style?.width || 200,
    height: data?.style?.height || 200
  });

  const checkSelection = () => selectedBlock?.id === id;
  const isSelected = checkSelection();
  const bgColor = isSelected ? '#784be8' : '#A9A9A9';
  const [value, setValue] = useState(data?.label || '');

  const fontSize = Math.max(12, Math.min(dimensions.width / 10, 30));

  const throttledResize = useThrottle((newWidth, newHeight) => {
    setDimensions({ width: newWidth, height: newHeight });

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

  useEffect(() => {
    setValue(data?.label || '');
  }, [data?.label]);

  const handleChange = (e) => {
    const val = e.target.value;
    setValue(val);
    setNodes(nodes.map((node) => (node.id === id ? { ...node, data: { ...node.data, label: val } } : node)));
  };

  return (
    <div style={{ height: dimensions.height, width: dimensions.width }}>
      <input
        type="text"
        value={value}
        onChange={handleChange}
        style={{
          fontSize: `${fontSize}px`,
          fontWeight: 600,
          marginTop: '0.5rem',
          textAlign: 'center',
          border: 'none',
          background: 'transparent',
          outline: 'none',
          minWidth: 100,
          width: '100%'
        }}
      />

      <NodeResizer onResize={handleResize} />
      <Handle style={{ backgroundColor: bgColor }} id="a" position={Position.Top} isConnectable={isConnectable} />
      <Handle style={{ backgroundColor: bgColor }} id="b" position={Position.Left} isConnectable={isConnectable} />
      <Handle style={{ backgroundColor: bgColor }} id="c" position={Position.Bottom} isConnectable={isConnectable} />
      <Handle style={{ backgroundColor: bgColor }} id="d" position={Position.Right} isConnectable={isConnectable} />

      <div
        className="my-group-node"
        style={{
          position: 'relative'
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
