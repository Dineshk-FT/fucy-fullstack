/*eslint-disable*/
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Handle, Position, NodeResizer, useReactFlow } from 'reactflow';
import useStore from '../../Zustand/store';
import { shallow } from 'zustand/shallow';
import { Box, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button, Typography } from '@mui/material';
import { RatingColor } from '../Table/constraints';
import { AttackIcon, CybersecurityIcon } from '../../assets/icons';
import { useDispatch } from 'react-redux';

const selector = (state) => ({
  update: state.updateAttackNode,
  getAttackScenario: state.getAttackScenario,
  model: state.model,
  attacks: state.attackScenarios['subs'][0],
  requirements: state.cybersecurity['subs'][1],
  addAttackScene: state.addAttackScene,
  nodes: state.nodes
});

export default function Event(props) {
  const dispatch = useDispatch();
  const { nodes, update, model, addAttackScene, getAttackScenario, attacks, requirements } = useStore(selector, shallow);
  const { setNodes } = useReactFlow();
  const inputValueFromProps = useMemo(() => {
    const matchingAttack = attacks?.scenes?.find((sub) => sub?.ID === props?.id || sub?.ID === props?.data?.nodeId);
    // console.log('matchingAttack', matchingAttack);
    return matchingAttack?.Name || props.data.label;
  }, [attacks, props?.id, props?.data]);

  const [inputValue, setInputValue] = useState(inputValueFromProps);

  const [openDialog, setOpenDialog] = useState(false);
  const [nodeDimensions, setNodeDimensions] = useState({
    width: props?.data?.style?.width ?? 150,
    height: props?.data?.style?.height ?? 60
  }); // Default node dimensions
  const [isHovered, setIsHovered] = useState(false);

  const handleDeleteFromCanvas = () => {
    setNodes((nodes) => nodes.filter((node) => node.id !== props.id));
  };
  // console.log('nodes', nodes);

  const updateNodeRating = useCallback(() => {
    setNodes((nodes) =>
      nodes.map((node) => {
        const attack = attacks?.scenes?.find((sub) => sub?.ID === node?.id || sub?.ID === node?.data?.nodeId);
        if (attack) {
          return {
            ...node,
            data: {
              ...node.data,
              rating: attack['Attack Feasibilities Rating'] // Update rating dynamically
            }
          };
        }
        return node;
      })
    );
  }, [attacks, setNodes]);

  // Call this function after rendering or whenever attacks data changes
  useEffect(() => {
    updateNodeRating();
  }, [updateNodeRating]);

  // Open the dialog on double-click
  const handleOpenDialog = (e) => {
    e.preventDefault();
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleClick = () => {
    const details = {
      modelId: model?._id,
      type: 'attack',
      attackId: props.id,
      name: inputValue
    };
    addAttackScene(details).then((res) => {
      if (res) {
        getAttackScenario(model?._id);
        setOpenDialog(false);
      }
    });
  };

  const isAttack = useMemo(() => attacks['scenes']?.some(check), [attacks]);
  const isRequirement = useMemo(() => requirements['scenes']?.some(check), [requirements]);
  function check(scene) {
    return scene.ID === props.id || scene.ID === props.data.nodeId;
  }

  const getBgColor = useCallback(() => {
    const color = attacks?.scenes?.find((sub) => sub?.ID === props?.id || sub?.ID === props?.data?.nodeId);
    if (color) {
      return RatingColor(color['Attack Feasibilities Rating']);
    } else {
      return 'grey';
    }
  }, [attacks, props?.id, props?.data?.nodeId]);

  const bgColor = getBgColor();

  // console.log('bgColor', bgColor);
  // console.log('props.data.style', props.data.style);
  // Calculate font size dynamically based on node dimensions
  // const calculateFontSize = () => {
  //   const baseFontSize = 14; // Base font size
  //   return Math.max(baseFontSize, (nodeDimensions.width + nodeDimensions.height) / 15);
  // };

  // const fontSize = calculateFontSize();
  const inputPadding = 5; // Padding inside the input box

  return (
    <>
      <NodeResizer
        lineStyle={{ backgroundColor: bgColor ?? 'gray', borderWidth: '2px' }}
        minWidth={120}
        minHeight={80}
        onResize={(event, params) => {
          // const newSize = Math.max(10, (params.width + params.height) / 15); // Remove upper limit

          setNodeDimensions({ width: params.width, height: params.height });
          setNodes((nodes) =>
            nodes.map((node) =>
              node.id === props?.id
                ? {
                    ...node,
                    data: {
                      ...node.data,
                      style: {
                        ...node.data.style,
                        width: params.width,
                        height: params.height
                      }
                    }
                  }
                : node
            )
          );
        }}
      />
      <Handle id="top" type="target" position={Position.Top} />
      <Box
        // onDoubleClick={handleOpenDialog}
        display="flex"
        alignItems="center"
        justifyContent="center"
        sx={{
          // ...props.data.style,
          p: 2,
          color: 'gray',
          position: 'relative',
          minWidth: `${nodeDimensions.width}px`,
          minHeight: `${nodeDimensions.height}px`,
          maxWidth: '100%',
          height: 'inherit',
          width: 'inherit',
          backgroundColor: '#f7f7f7'
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 4,
            left: 4
          }}
        >
          {isAttack && <img src={AttackIcon} alt="attack" height="20px" width="20px" />}
          {isRequirement && <img src={CybersecurityIcon} alt="attack" height="20px" width="20px" />}
        </Box>

        <textarea
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            update(props?.id, e.target.value);
          }}
          onInput={(e) => {
            e.target.style.height = 'auto'; // Reset height
            e.target.style.height = `${e.target.scrollHeight}px`; // Adjust height dynamically
          }}
          style={{
            height: inputValue.length > 20 ? nodeDimensions?.height : 'auto',
            marginRight: '10px',
            width: 'fit-content',
            backgroundColor: 'inherit',
            borderRadius: '4px',
            textAlign: 'center',
            outline: 'none',
            fontSize: `${props?.data?.style?.fontSize}px`,
            color: 'inherit',
            padding: `${inputPadding}px`,
            border: 'none',
            resize: 'none',
            overflowWrap: 'break-word',
            whiteSpace: 'pre-wrap',
            overflow: 'hidden',
            fontFamily: 'inherit',
            minHeight: '20px' // Prevents collapsing
          }}
          rows={1} // Start with a single row
        />

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
            top: '4px',
            right: '4px',
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
      </Box>

      <Handle id="bottom" type="source" position={Position.Bottom} />

      {/* Dialog for converting to Attack */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Convert to Attack</DialogTitle>
        <DialogContent>
          <Typography variant="body1">Are you sure you want to convert this node to an attack?</Typography>
          <TextField
            label="Attack Name"
            variant="outlined"
            fullWidth
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleClick} color="primary">
            Convert
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
  x;
}
