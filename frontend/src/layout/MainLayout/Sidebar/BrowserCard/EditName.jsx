/*eslint-disable*/
import { useEffect, useState } from 'react';
import { Box, TextField, Typography } from '@mui/material';
import { useSelector } from 'react-redux';
import useStore from '../../../../Zustand/store';

const selector = (state) => ({
  nodes: state.nodes,
  edges: state.edges,
  setNodes: state.setNodes,
  setEdges: state.setEdges
});
const EditName = ({ detail, index, onUpdate }) => {
  const { nodes, edges, setNodes, setEdges } = useStore(selector);
  const { selectedBlock } = useSelector((state) => state?.canvas);
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(detail?.name);

  useEffect(() => {
    setValue(detail?.name); // Sync state when detail updates
  }, [detail?.name]);

  const updateElement = (updateFn) => {
    if (!selectedBlock?.id.includes('reactflow__edge')) {
      const updatedNodes = nodes?.map((node) => (node?.id === selectedBlock?.id ? updateFn(node) : node));
      setNodes(updatedNodes);
    } else {
      const updatedEdges = edges?.map((edge) => (edge?.id === selectedBlock?.id ? updateFn(edge) : edge));
      setEdges(updatedEdges);
    }
  };

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleChange = (event) => {
    const { value } = event.target;
    setValue(value);
    //   dispatch(setDetails((state) => ({ ...state, name: value })));
    updateElement((element) => ({
      ...element,
      data: { ...element.data, label: value }
    }));
  };

  const handleBlur = () => {
    setIsEditing(false);
    onUpdate(); // Call parent function to update data
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleBlur();
    }
  };

  return (
    <Box
      sx={{
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        maxWidth: 'fit-content'
      }}
      onDoubleClick={handleDoubleClick}
    >
      {index + 1}.{' '}
      {isEditing ? (
        <TextField
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoFocus
          size="small"
          variant="standard"
        />
      ) : (
        <Typography component="span" noWrap>
          {value}
        </Typography>
      )}
    </Box>
  );
};

export default EditName;
