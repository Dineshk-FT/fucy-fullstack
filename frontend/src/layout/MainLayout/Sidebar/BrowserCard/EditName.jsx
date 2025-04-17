/* eslint-disable */
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Box, TextField, Typography } from '@mui/material';
import { useSelector } from 'react-redux';
import useStore from '../../../../Zustand/store';

const selector = (state) => ({
  nodes: state.nodes,
  edges: state.edges,
  setNodes: state.setNodes,
  setEdges: state.setEdges
});

const EditName = React.forwardRef(({ detail, index, onUpdate }, ref) => {
  const { nodes, edges, setNodes, setEdges } = useStore(selector);
  const { selectedBlock } = useSelector((state) => state?.canvas);
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(detail?.name);
  const inputRef = useRef(null);

  useEffect(() => {
    if (detail?.name !== value) {
      setValue(detail?.name);
    }
  }, [detail?.name]);

  const updateElement = useCallback(
    (updateFn) => {
      if (!selectedBlock?.id.includes('reactflow__edge')) {
        setNodes((prevNodes) => prevNodes.map((node) => (node.id === selectedBlock?.id ? updateFn(node) : node)));
      } else {
        setEdges((prevEdges) => prevEdges.map((edge) => (edge.id === selectedBlock?.id ? updateFn(edge) : edge)));
      }
    },
    [selectedBlock?.id, setNodes, setEdges]
  );

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleChange = (event) => {
    const newValue = event.target.value;
    setValue(newValue);
    updateElement((element) => ({
      ...element,
      data: { ...element.data, label: newValue }
    }));
  };

  const handleBlur = () => {
    setIsEditing(false);
    onUpdate();
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleBlur();
    }
  };

  return (
    <Box
      ref={ref}
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
          inputRef={inputRef}
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
});

export default EditName;
