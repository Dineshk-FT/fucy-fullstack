/* eslint-disable */
import React, { useEffect, useState, useCallback, useRef } from 'react';
import debounce from 'lodash.debounce';
import { Box, TextField, Typography } from '@mui/material';
import { useSelector } from 'react-redux';
import useStore from '../../../../store/Zustand/store';
import { shallow } from 'zustand/shallow';

const selector = (state) => ({
  setNodes: state.setNodes,
  setEdges: state.setEdges
});

const EditName = React.forwardRef(({ detail, index, onUpdate }, ref) => {
  const { setNodes, setEdges } = useStore(selector, shallow);
  const { selectedBlock } = useSelector((state) => state?.canvas);
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(detail?.name);
  const inputRef = useRef(null);
  // console.log('edit name rendered');
  // Debounced updater to avoid excessive store writes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedUpdateElement = useCallback(
    debounce((updateFn) => {
      if (!selectedBlock?.id.includes('reactflow__edge')) {
        setNodes((prevNodes) => prevNodes.map((node) => (node.id === selectedBlock?.id ? updateFn(node) : node)));
      } else {
        setEdges((prevEdges) => prevEdges.map((edge) => (edge.id === selectedBlock?.id ? updateFn(edge) : edge)));
      }
    }, 250),
    [selectedBlock?.id, setNodes, setEdges]
  );

  useEffect(() => {
    if (detail?.name !== value) {
      setValue(detail?.name);
    }
  }, [detail?.name]);

  // Focus input only when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleDoubleClick = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleChange = useCallback(
    (event) => {
      const newValue = event.target.value;
      setValue(newValue);
      debouncedUpdateElement((element) => ({
        ...element,
        data: { ...element.data, label: newValue }
      }));
    },
    [debouncedUpdateElement]
  );

  const handleBlur = useCallback(() => {
    setIsEditing(false);
    onUpdate();
  }, [onUpdate]);

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === 'Enter') {
        handleBlur();
      }
    },
    [handleBlur]
  );

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
      tabIndex={0}
      aria-label={`Edit name for item ${index + 1}`}
      role="textbox"
      onKeyDown={handleKeyDown}
    >
      {index + 1}.{' '}
      {isEditing ? (
        <TextField
          inputRef={inputRef}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          size="small"
          variant="standard"
          inputProps={{
            'aria-label': `Edit name for item ${index + 1}`
          }}
        />
      ) : (
        <Typography component="span" noWrap>
          {value}
        </Typography>
      )}
    </Box>
  );
});

// Memoized export to prevent unnecessary rerenders
export default React.memo(EditName);
