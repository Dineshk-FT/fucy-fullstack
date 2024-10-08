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
  const [value, setValue] = useState('');

  useEffect(() => {
    setValue(data?.label);
  }, [data]);
  const handlechange = (e) => {
    const nod = [...nodes];
    const val = e.target.value;
    setValue(val);
    const node = nodes?.find((nd) => nd?.id === id);
    const Index = nodes?.findIndex((nd) => nd?.id === id);
    node.data.label = e.target.value;
    nod[Index] = node;
    setNodes(nod);
  };
  return (
    <div>
      <input
        type="text"
        value={value}
        onChange={handlechange}
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
      <div
        className="group_node"
        style={{
          ...data?.style
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
        >
          {/* {data?.label} */}
        </div>
      </div>
    </div>
  );
};

export default CustomGroupNode;
