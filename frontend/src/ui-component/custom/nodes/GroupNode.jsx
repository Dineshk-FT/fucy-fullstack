import React, { useEffect, useState } from 'react';
import { NodeResizer } from 'reactflow';
import useStore from '../../../Zustand/store';
import { shallow } from 'zustand/shallow';

const selector = (state) => ({
  nodes: state.nodes,
  setNodes: state.setNodes
});

const CustomGroupNode = ({ data, id }) => {
  const { nodes, setNodes } = useStore(selector, shallow);
  const [value, setValue] = useState(data?.label || '');

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
    <div>
      <input
        type="text"
        value={value}
        onChange={handleChange}
        style={{
          alignSelf: 'flex-start',
          fontSize: '25px',
          fontWeight: 600,
          marginTop: '1rem',
          textAlign: 'center',
          border: 'none',
          background: 'transparent',
          outline: 'none'
        }}
      />

      <NodeResizer />
      <div className="group_node" style={{ ...data?.style }}>
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
