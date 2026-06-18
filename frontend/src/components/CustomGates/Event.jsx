/*eslint-disable*/
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Handle, Position, NodeResizer } from 'reactflow';
import useStore from '../../store/Zustand/store';
import { shallow } from 'zustand/shallow';
import { Box, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button, Typography } from '@mui/material';
import { RatingColor } from '../Table/constraints';
import { AttackIcon, CybersecurityIcon, CyberControlsIcon } from '../../assets/icons';

const selector = (state) => ({
  update: state.updateAttackNode,
  getAttackScenario: state.getAttackScenario,
  updateEnable: state.updateName$DescriptionforCybersecurity,
  model: state.model,
  attacks: state.attackScenarios['subs'][0],
  requirements: state.cybersecurity['subs'][1],
  controls: state.cybersecurity['subs'][2],
  addAttackScene: state.addAttackScene,
  setAttackNodes: state.setAttackNodes,
  nodes: state.attackNodes,
  edges: state.attackEdges
});

export default function Event(props) {
  const { update, model, addAttackScene, getAttackScenario, attacks, requirements, controls, setAttackNodes, nodes, edges } = useStore(
    selector,
    shallow
  );
  const inputValueFromProps = useMemo(() => {
    const matchingAttack = attacks?.scenes?.find((sub) => sub?.ID === props?.id || sub?.ID === props?.data?.nodeId);
    // console.log('matchingAttack', matchingAttack);
    return matchingAttack?.Name || props.data.label;
  }, [attacks, props?.id, props?.data]);

  const matchingControl = useMemo(() => {
    return controls?.scenes?.find((sub) => sub?.ID === props?.id || sub?.ID === props?.data?.nodeId);
  }, [controls, props?.id, props?.data]);

  const isEnabled = useMemo(() => matchingControl?.isEnabled || false, [matchingControl]);
  const isControl = useMemo(() => !!matchingControl, [matchingControl]);

  // console.log('controls', controls);
  const [inputValue, setInputValue] = useState(inputValueFromProps);

  const [openDialog, setOpenDialog] = useState(false);
  const [nodeDimensions, setNodeDimensions] = useState({
    width: props?.data?.style?.width ?? 150,
    height: props?.data?.style?.height ?? 60
  }); // Default node dimensions
  const [isHovered, setIsHovered] = useState(false);

  const handleDeleteFromCanvas = () => {
    setAttackNodes((nodes) => nodes.filter((node) => node.id !== props.id));
  };
  // console.log('nodes', nodes);
  const updateNodeRating = useCallback(() => {
    setAttackNodes((currentNodes) => {
      let hasChanges = false;

      // 1. Helper to traverse the graph and check for connected enabled controls
      const hasEnabledControlConnected = (startNodeId, visited = new Set()) => {
        const queue = [startNodeId];
        while (queue.length > 0) {
          const currentId = queue.shift();
          if (visited.has(currentId)) continue;
          visited.add(currentId);

          const outgoingEdges = edges.filter((edge) => edge.source === currentId);
          for (const edge of outgoingEdges) {
            const targetNode = currentNodes.find((n) => n.id === edge.target);
            if (!targetNode || visited.has(targetNode.id)) continue;

            // Check if the target is a control and if it is enabled (either locally or in the DB)
            const matchingControl = controls?.scenes?.find((sub) => sub?.ID === targetNode?.id || sub?.ID === targetNode?.data?.nodeId);
            const isTargetEnabled = targetNode.isEnabled || matchingControl?.isEnabled;

            if (targetNode.nodeType === 'cybersecurity_controls' && isTargetEnabled) {
              return true;
            }

            // Continue traversing through Gates
            if (targetNode.type?.toLowerCase()?.includes('gate')) {
              queue.push(targetNode.id);
            }
          }
        }
        return false;
      };

      // 2. Map over nodes and assign the correct rating
      const newNodes = currentNodes.map((node) => {
        const attack = attacks?.scenes?.find((sub) => sub?.ID === node?.id || sub?.ID === node?.data?.nodeId);

        if (attack) {
          const originalRating = attack['Attack Feasibilities Rating'];
          const isMitigated = hasEnabledControlConnected(node.id);

          // If a control is connected and enabled, force it to 'Low', else use the original rating
          const newRating = isMitigated ? 'Low' : originalRating;

          if (node.data?.rating !== newRating) {
            hasChanges = true;
            return {
              ...node,
              data: {
                ...node.data,
                rating: newRating
              }
            };
          }
          return node;
        } else {
          // If not an attack, ensure rating is removed cleanly
          if (node.data?.rating !== undefined) {
            hasChanges = true;
            const { rating, ...restData } = node.data;
            return {
              ...node,
              data: restData
            };
          }
          return node;
        }
      });

      // 3. Only trigger a state update if something actually changed to prevent infinite loops
      return hasChanges ? newNodes : currentNodes;
    });
  }, [attacks, controls, edges, setAttackNodes]); // Added controls & edges to dependencies

  // Call this function after rendering or whenever attacks data changes
  useEffect(() => {
    updateNodeRating();
  }, [updateNodeRating, edges]); // Added edges dependency

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
    // ✅ If it's a control and enabled → green
    if (isControl && isEnabled) {
      return 'green';
    }

    // ✅ Find the attack tree node from nodes array
    const attackTreeNode = nodes.find((n) => !n?.data?.nodeType && (n.id === props?.id || n.id === props?.data?.nodeId));

    // ✅ If it's an attack node (not control)
    const attackNode = attacks?.scenes?.find((sub) => sub?.ID === props?.id || sub?.ID === props?.data?.nodeId);
    // console.log('attackTreeNode', attackTreeNode);
    if (attackNode) {
      const rating = attackTreeNode?.data?.rating;

      // 🔹 If rating is Low → show green (means mitigated / controlled)
      if (rating?.toLowerCase() === 'low') {
        return 'lightgreen';
      }

      // 🔹 Otherwise use standard rating color
      return RatingColor(rating);
    }

    // Add a default return value
    return 'transparent'; // Replace with your default color
  }, [isControl, isEnabled, nodes, attacks?.scenes, props?.id, props?.data?.nodeId]);

  const bgColor = getBgColor();

  const inputPadding = 5; // Padding inside the input box

  return (
    <>
      <NodeResizer
        lineStyle={{ backgroundColor: bgColor === 'transparent' ? 'grey' : bgColor, borderWidth: '2px' }}
        minWidth={100}
        minHeight={50}
        onResize={(event, params) => {
          // const newSize = Math.max(10, (params.width + params.height) / 15); // Remove upper limit

          setNodeDimensions({ width: params.width, height: params.height });
          setAttackNodes((nodes) =>
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
      <Handle id="top" type="target" position={Position.Top} isConnectable={true} />
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

      <Handle id="bottom" type="source" position={Position.Bottom} isConnectable={true} />

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
