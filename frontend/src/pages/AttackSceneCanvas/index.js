/*eslint-disable*/
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import ReactFlow, { ReactFlowProvider, Controls, MiniMap, Panel, MarkerType, Background } from 'reactflow';
import '../index.css';
import 'reactflow/dist/style.css';
import useStore from '../../store/Zustand/store';
import { shallow } from 'zustand/shallow';
import { CustomEdge } from '../../components/custom';
import { Button, Checkbox, IconButton } from '@mui/material';
import { v4 as uid } from 'uuid';
import { useSelector } from 'react-redux';
import ELK from 'elkjs/lib/elk.bundled';
import toast, { Toaster } from 'react-hot-toast';
import { pageNodeTypes, style } from '../../utils/Constraints';
import SaveIcon from '@mui/icons-material/Save';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import { AttackIcon, CybersecurityIcon } from '../../assets/icons';
import StepEdgeAttackTree from '../../components/custom/edges/StepEdgeAttackTree';
import RestoreIcon from '@mui/icons-material/Restore';
import Joyride from 'react-joyride';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import AutoSavePopper from '../../components/Poppers/AutoSavePopper';
import { attackCanvasSteps } from '../../utils/Steps';

const elk = new ELK();

const getLayoutedElements = async (nodes, edges) => {
  const nodeIds = new Set(nodes.map((n) => n.id));

  // Filter out invalid edges that reference non-existent nodes
  const validEdges = edges.filter((e) => nodeIds.has(e.source) && nodeIds.has(e.target));

  const graph = {
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.direction': 'DOWN',
      'elk.spacing.nodeNode': 80,
      'elk.spacing.nodeNodeBetweenLayers': 100,
      'elk.edgeRouting': 'ORTHOGONAL',
      'elk.layered.nodePlacement.strategy': 'NETWORK_SIMPLEX',
      'elk.layered.considerModelOrder': true,
      'elk.layered.mergeEdges': true
    },
    children: nodes.map((node) => ({
      id: node.id,
      width: node.width || 150,
      height: node.height || 50
    })),
    edges: validEdges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target
    }))
  };

  try {
    const elkGraph = await elk.layout(graph);

    let layoutedNodes = elkGraph.children.map((node) => {
      const originalNode = nodes.find((n) => n.id === node.id);
      return {
        ...originalNode,
        position: {
          x: node.x || 0,
          y: (node.y || 0) + 30
        }
      };
    });

    // Function to check if two nodes overlap
    const nodesOverlap = (nodeA, nodeB) => {
      return (
        Math.abs(nodeA.position.x - nodeB.position.x) < (nodeA.width + nodeB.width) / 2 + 20 &&
        Math.abs(nodeA.position.y - nodeB.position.y) < (nodeA.height + nodeB.height) / 2 + 20
      );
    };

    // Function to resolve overlaps with minimal displacement
    const resolveOverlap = (nodeA, nodeB) => {
      const xSpacing = (nodeA.width + nodeB.width) / 2 + 20;
      const ySpacing = (nodeA.height + nodeB.height) / 2 + 20;
      const xOverlap = xSpacing - Math.abs(nodeA.position.x - nodeB.position.x);
      const yOverlap = ySpacing - Math.abs(nodeA.position.y - nodeB.position.y);

      if (xOverlap > 0 && yOverlap > 0) {
        if (xOverlap < yOverlap) {
          if (nodeA.position.x < nodeB.position.x) {
            nodeA.position.x -= xOverlap / 2;
            nodeB.position.x += xOverlap / 2;
          } else {
            nodeA.position.x += xOverlap / 2;
            nodeB.position.x -= xOverlap / 2;
          }
        } else {
          if (nodeA.position.y < nodeB.position.y) {
            nodeA.position.y -= yOverlap / 2;
            nodeB.position.y += yOverlap / 2;
          } else {
            nodeA.position.y += yOverlap / 2;
            nodeB.position.y -= yOverlap / 2;
          }
        }
      }
    };

    // Iterate multiple times to resolve all overlaps
    let hasOverlaps = true;
    let maxIterations = 100;
    while (hasOverlaps && maxIterations > 0) {
      hasOverlaps = false;
      layoutedNodes.forEach((nodeA, indexA) => {
        layoutedNodes.slice(indexA + 1).forEach((nodeB) => {
          if (nodesOverlap(nodeA, nodeB)) {
            resolveOverlap(nodeA, nodeB);
            hasOverlaps = true;
          }
        });
      });
      maxIterations--;
    }

    const layoutedEdges = elkGraph.edges.map((edge) => ({
      ...edges.find((e) => e.id === edge.id),
      points: edge.sections?.flatMap((section) => section.bendPoints || []) || []
    }));

    return { nodes: layoutedNodes, edges: layoutedEdges };
  } catch (error) {
    console.error('Error in dynamic layout:', error);
    return { nodes, edges };
  }
};
// Define edge types outside and pass edges, setEdges as props
const edgeTypes = {
  custom: CustomEdge,
  step: StepEdgeAttackTree
};

const selector = (state) => ({
  nodes: state.attackNodes,
  edges: state.attackEdges,
  onNodesChange: state.onAttackNodesChange,
  onEdgesChange: state.onAttackEdgesChange,
  onConnect: state.onAttackConnect,
  addNode: state.addAttackNode,
  addEdge: state.addAttackEdge,
  dragAdd: state.dragAddAttackTemplate,
  setNodes: state.setAttackNodes,
  setEdges: state.setAttackEdges,
  model: state.model,
  update: state.updateAttackScenario,
  getAttackScenario: state.getAttackScenario,
  getCyberSecurityScenario: state.getCyberSecurityScenario,
  addAttackScene: state.addAttackScene,
  addcybersecurityScene: state.addcybersecurityScene,
  deleteCybersecurity: state.deleteCybersecurity,
  removeAttacks: state.removeAttacks,
  attacks: state.attackScenarios['subs'][0],
  requirements: state.cybersecurity['subs'][1],
  setIsChanged: state.setIsAttackChanged,
  isChanged: state.isAttackChanged,
  openSave: state.openSave,
  setOpenSave: state.setOpenSave
});

// Edge line styling
const connectionLineStyle = { stroke: '#808080' };
const edgeOptions = {
  type: 'step',
  markerEnd: {
    type: MarkerType.ArrowClosed,
    width: 20,
    height: 20,
    color: '#000000'
  },
  markerStart: {
    type: MarkerType.ArrowClosed,
    width: 20,
    height: 20,
    color: '#000000'
  },
  animated: false,
  style: {
    stroke: '#808080'
  },
  data: {
    label: ''
  }
};

export default function AttackBlock({ attackScene, color }) {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    addEdge,
    dragAdd,
    setNodes,
    setEdges,
    model,
    update,
    getAttackScenario,
    getCyberSecurityScenario,
    addAttackScene,
    addcybersecurityScene,
    deleteCybersecurity,
    removeAttacks,
    attacks,
    requirements,
    isChanged,
    setIsChanged,
    openSave,
    setOpenSave
  } = useStore(selector, shallow);
  const notify = (message, status) => toast[status](message);
  const [nodeTypes, setNodeTypes] = useState({});
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [copiedNode, setCopiedNode] = useState([]);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0 });
  const [selectedNode, setSelectedNode] = useState({});
  const [isReady, setIsReady] = useState(false);
  const { isDark } = useSelector((state) => state?.currentId);
  const isAttack = useMemo(() => attacks['scenes']?.some(check), [attacks, selectedNode]);
  const isRequirement = useMemo(() => requirements['scenes']?.some(check), [requirements, selectedNode]);
  const flowWrapper = useRef(null);
  const nodesRef = useRef(nodes);
  const edgesRef = useRef(edges);
  const anchorRef = useRef(null);
  const [runTour, setRunTour] = useState(false);

  const handleJoyrideCallback = (data) => {
    const { status } = data;
    if (['finished', 'skipped'].includes(status)) {
      setRunTour(false);
    }
  };

  // console.log('isChanged', isChanged);

  // console.log('attackScene', attackScene);
  // console.log('nodes', nodes);
  useEffect(() => {
    nodesRef.current = nodes;
    edgesRef.current = edges;
  }, [nodes, edges]);

  const getMatchingId = useCallback(() => {
    const matchingScene = attacks['scenes']?.find((scene) => scene?.ID === selectedNode?.id || scene?.ID === selectedNode?.data?.nodeId);
    return matchingScene ? matchingScene.ID : null;
  }, [attacks, selectedNode]);
  function check(scene) {
    return scene?.ID === selectedNode?.id || scene?.ID === selectedNode?.data?.nodeId;
  }

  const handleSave = () => {
    // console.log(`✅ Changes detected! Saving scene ${sceneId}...`);
    const template = {
      nodes: nodes,
      edges: edges
    };

    // Extract threatId from nodes with type: "default"
    const threatNode = nodes?.find((node) => node?.type === 'default' && node?.threatId) ?? {};
    // if (!threatNode) {
    //   notify('Threat scenario is missing', 'error');
    //   return;
    // }
    const { threatId = '', damageId = '', key = '' } = threatNode;

    const details = {
      modelId: model?._id,
      type: 'attack_trees',
      id: attackScene?.ID,
      templates: JSON.stringify(template),
      threatId: threatId ?? '',
      damageId: damageId ?? '',
      key: key ?? ''
    };

    update(details)
      .then((res) => {
        if (!res.error) {
          // console.log('res', res);
          setTimeout(() => {
            notify('Saved Successfully', 'success');
            getAttackScenario(model?._id);
            getCyberSecurityScenario(model?._id);
          }, 200);
          setIsChanged(false);
        } else {
          notify(res?.error ?? 'Something Went Wrong', 'error');
        }
      })
      .catch((err) => {
        if (err) {
          console.log('err', err);
          notify('Something Went Wrong', 'error');
        }
      });
  };

  // Save before switching attackScene
  useEffect(() => {
    setNodes(attackScene?.templates?.nodes || []);
    setEdges(attackScene?.templates?.edges || []);
    // prevAttackSceneRef.current = attackScene;
  }, [attackScene]);

  useEffect(() => {
    const newNodeTypes = pageNodeTypes?.attackcanvas || {};
    setNodeTypes(newNodeTypes);
    if (!isChanged) {
      setNodes([]);
      setEdges([]);
    }
    setTimeout(() => setIsReady(true), 0); // Defer rendering
  }, []);
  // Prevent rendering until ready

  const centerLayout = () => {
    if (reactFlowInstance) {
      setTimeout(() => {
        reactFlowInstance.fitView({ padding: 0.2, includeHiddenNodes: true, minZoom: 0.5, maxZoom: 1.5, duration: 500 });
      }, 300);
    }
  };

  const onLayout = useCallback(
    async ({ direction = 'DOWN' } = {}) => {
      try {
        const opts = { 'elk.direction': direction };
        const { nodes: layoutedNodes, edges: layoutedEdges } = await getLayoutedElements(nodes, edges, opts);
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
        centerLayout();
        if (
          JSON.stringify(nodes) !== JSON.stringify(attackScene?.templates?.nodes) ||
          JSON.stringify(edges) !== JSON.stringify(attackScene?.templates?.edges)
        ) {
          setIsChanged(true);
        }
      } catch (error) {
        console.error('Error during layout:', error);
      }
    },
    [nodes, edges, setNodes, setEdges, isChanged]
  );
  useEffect(() => {
    centerLayout();
  }, [reactFlowInstance, attackScene]);

  useLayoutEffect(() => {
    onLayout({ direction: 'DOWN', useInitialNodes: true });
  }, []);

  // console.log('nodes', nodes);
  const getRelativePosition = (event) => {
    const container = event.currentTarget.getBoundingClientRect();
    return {
      x: event.clientX - container.left,
      y: event.clientY - container.top
    };
  };

  const handleNodeContextMenu = (event, node) => {
    event.preventDefault();

    const flowWrapperRect = flowWrapper.current.getBoundingClientRect();
    const nodeElement = document.querySelector(`[data-id="${node.id}"]`);

    if (nodeElement) {
      const nodeRect = nodeElement.getBoundingClientRect();

      const relativeX = nodeRect.left - flowWrapperRect.left + 100;
      const relativeY = nodeRect.bottom - flowWrapperRect.top + 4; // Position just below

      setCopiedNode(node);
      setSelectedNode(node);
      setContextMenu({
        visible: true,
        x: relativeX,
        y: relativeY,
        options: node.type === 'Event' ? ['Copy', 'Paste', 'Attack', 'Requirement'] : ['Copy', 'Paste'],
        node
      });
    }
  };

  const handleCanvasContextMenu = (event) => {
    event.preventDefault();
    const pos = getRelativePosition(event);
    if (copiedNode && copiedNode.length > 0) {
      setContextMenu({
        visible: true,
        x: pos.x,
        y: pos.y,
        options: ['Copy', 'Paste']
      });
    } else {
      console.log('No copied node available');
    }
  };

  const handleCheckboxChange = (e, option, isChecked) => {
    e.stopPropagation();
    // console.log(`${option} checkbox is now ${isChecked ? 'checked' : 'unchecked'}`);
    const threatNode = nodes.find((node) => node.type === 'default' && node.threatId);
    const { threatId, key } = threatNode || {};

    if (isChecked) {
      if (option === 'Attack') {
        const details = {
          modelId: model?._id,
          threatId,
          type: 'attack',
          attackId: selectedNode?.id,
          name: selectedNode?.data?.label,
          attackSceneId: attackScene?.ID,
          attackSceneName: attackScene?.Name
        };
        addAttackScene(details).then((res) => {
          if (!res.error) {
            getAttackScenario(model?._id);
            notify(res.message ?? 'Converted to Attack', 'success');
          } else {
            notify(res.error, 'error');
          }
        });
      } else if (option === 'Requirement') {
        const detail = {
          modelId: model?._id,
          threatId,
          threatKey: key,
          type: 'cybersecurity_requirements',
          id: selectedNode?.id,
          name: selectedNode?.data?.label,
          attackSceneId: attackScene?.ID,
          attackSceneName: attackScene?.Name
        };
        addcybersecurityScene(detail).then((res) => {
          if (!res.error) {
            getCyberSecurityScenario(model?._id);
            notify(res.message ?? 'Converted to Requirement', 'success');
          } else {
            notify(res.error, 'error');
          }
        });
      }
    } else {
      // If the checkbox is unchecked
      if (option === 'Attack') {
        const matchingId = getMatchingId();
        const removeDetails = {
          id: attacks?._id,
          rowId: [matchingId]
        };
        removeAttacks(removeDetails).then((res) => {
          if (!res.error) {
            getAttackScenario(model?._id);
            notify(res.message ?? 'Removed Attack', 'success');
          } else {
            notify(res.error, 'error');
          }
        });
      } else if (option === 'Requirement') {
        const removeDetail = {
          id: requirements?._id,
          rowId: [selectedNode?.id]
        };
        deleteCybersecurity(removeDetail).then((res) => {
          if (!res.error) {
            getCyberSecurityScenario(model?._id);
            notify(res.message ?? 'Removed Requirement', 'success');
          } else {
            notify(res.error, 'error');
          }
        });
      }
    }
  };

  const handleMenuOptionClick = (e, option) => {
    e.stopPropagation();
    switch (option) {
      case 'Copy':
        if (copiedNode) {
          const nodeToCopy = [copiedNode];
          setCopiedNode(nodeToCopy);
          notify('Node copied!', 'success');
        }
        setContextMenu({ visible: false, x: 0, y: 0 }); // Close context menu
        break;

      case 'Paste':
        if (Array.isArray(copiedNode) && copiedNode.length > 0) {
          copiedNode.forEach((node) => {
            const newNode = {
              ...node,
              id: uid(),
              position: {
                x: contextMenu.x - 100,
                y: contextMenu.y - 50
              }
            };
            const nodetoPaste = [...nodes, newNode];
            setNodes(nodetoPaste);
          });
        } else {
          console.error('No valid copied node found');
        }
        setContextMenu({ visible: false, x: 0, y: 0 }); // Close context menu
        break;

      default:
        break;
    }
  };
  const handleClear = () => {
    setNodes([]);
    setEdges([]);
    // notify('Canvas cleared', 'success');
  };

  const onRestore = useCallback(
    (temp) => {
      if (temp) {
        setNodes(temp.nodes);
        setEdges(temp.edges);
      } else {
        handleClear();
      }
      setIsChanged(false);
    },
    [reactFlowInstance, attackScene, isChanged]
  );

  useEffect(() => {
    const handleClickOutside = () => setContextMenu({ visible: false, x: 0, y: 0 });
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleConnection = (draggedNode) => {
    const { attackNodes: nodes, attackEdges: edges, setAttackEdges: setEdges, setAttackNodes: setNodes } = useStore.getState(); // Access Zustand state

    const overlappingNode = nodes.find((node) => {
      if (node.id === draggedNode.id) return false; // Skip itself

      const nodeBounds = {
        xMin: node.position.x,
        xMax: node.position.x + (node.width || 150),
        yMin: node.position.y,
        yMax: node.position.y + (node.height || 50)
      };

      return (
        draggedNode.position.x > nodeBounds.xMin &&
        draggedNode.position.x < nodeBounds.xMax &&
        draggedNode.position.y > nodeBounds.yMin &&
        draggedNode.position.y < nodeBounds.yMax
      );
    });

    if (overlappingNode) {
      let condition = true;

      if (overlappingNode.type === 'default' || overlappingNode.type === 'Event') {
        condition =
          (overlappingNode.type === 'default' && draggedNode.type.includes('Gate')) ||
          (overlappingNode.type.includes('Gate') && draggedNode.type.includes('Gate')) ||
          (overlappingNode.type === 'Event' && draggedNode.type.includes('Gate')) ||
          (overlappingNode.type.includes('Gate') && draggedNode.type === 'Event');
      }

      const edgeExists = edges.some(
        (edge) =>
          (edge.source === overlappingNode.id && edge.target === draggedNode.id) ||
          (edge.source === draggedNode.id && edge.target === overlappingNode.id)
      );

      if (condition && !edgeExists) {
        const newEdge = {
          id: `${overlappingNode.id}-${draggedNode.id}`, // Use consistent ID to avoid duplicates
          source: overlappingNode.id,
          target: draggedNode.id,
          type: 'step',
          markerEnd: {
            type: 'arrowclosed',
            width: 20,
            height: 20,
            color: 'black'
          }
        };

        setEdges([...edges, newEdge]);

        const updatedNodes = nodes.map((node) => {
          if (node.id === overlappingNode.id) {
            const updatedConnections = node.data.connections || [];
            if (!updatedConnections.some((connection) => connection.id === draggedNode.id)) {
              updatedConnections.push({ id: draggedNode.id, type: draggedNode.type });
            }
            return {
              ...node,
              data: {
                ...node.data,
                connections: updatedConnections
              }
            };
          }
          return node;
        });

        setNodes(updatedNodes);
      }
    } else {
      const connectedEdge = edges.find((edge) => edge.target === draggedNode.id);
      if (connectedEdge) {
        const sourceNode = nodes.find((node) => node.id === connectedEdge.source);
        if (sourceNode) {
          // const distanceX = Math.abs(sourceNode.position.x - draggedNode.position.x);
          // const distanceY = Math.abs(sourceNode.position.y - draggedNode.position.y);
          // if (distanceX > 550 || distanceY > 550) {
          //   const updatedEdges = edges.filter((edge) => edge.target !== draggedNode.id);
          //   setEdges(updatedEdges);
          //   const updatedNodes = nodes.map((node) => {
          //     if (node.data?.connections) {
          //       return {
          //         ...node,
          //         data: {
          //           ...node.data,
          //           connections: node.data.connections.filter((connection) => connection.id !== draggedNode.id)
          //         }
          //       };
          //     }
          //     return node;
          //   });
          //   setNodes(updatedNodes);
          // }
        }
      }
    }
  };

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const cyber = event.dataTransfer.getData('application/cyber');
      const Library = event.dataTransfer.getData('application/Library');
      let parsedNode;
      let parsedTemplate;
      if (cyber) {
        try {
          parsedNode = JSON.parse(cyber); // Ensure it's properly parsed
        } catch (err) {
          console.error('Failed to parse dropped data:', err);
        }
      }
      if (Library) {
        try {
          parsedTemplate = JSON.parse(Library); // Ensure it's properly parsed
        } catch (err) {
          console.error('Failed to parse dropped data:', err);
        }
      }

      const filtered = nodes.filter((node) => node.type == 'default');
      if (filtered.length === 1 && parsedNode?.type === 'default') {
        notify('Must use single threat scene for an Attack tree', 'error');
        return;
      }

      if (parsedNode) {
        const newId = uid();
        const position = reactFlowInstance.screenToFlowPosition({
          x: event.clientX,
          y: event.clientY
        });

        const newNode = {
          id: newId,
          position,
          type: parsedNode.type || parsedNode.label,
          ...parsedNode,
          width: parsedNode?.width ?? 120,
          height: parsedNode?.height ?? 60,
          data: {
            label: parsedNode.label,
            nodeId: parsedNode.nodeId,
            style: {
              ...style,
              backgroundColor: 'transparent',
              color: 'black',
              width: parsedNode?.width ?? 120,
              height: parsedNode?.height ?? 60
            },
            nodeType: parsedNode?.nodeType
          }
        };
        addNode(newNode);
        handleConnection(newNode);
      }
      if (parsedTemplate) {
        let newNodes = [];
        let newEdges = [];
        const randomId = Math.floor(Math.random() * 1000);
        const randomPos = Math.floor(Math.random() * 500);

        parsedTemplate?.templates?.['nodes']?.map((node) => {
          newNodes.push({
            id: `${node.id + randomId}`,
            data: {
              ...node?.data,
              style: {
                backgroundColor: node.data['bgColor'],
                borderRadius: '8px',
                boxShadow: isDark == true ? '0 2px 6px rgba(0,0,0,0.4)' : '0 2px 6px rgba(0,0,0,0.1)',
                fontFamily: "'Poppins', sans-serif",
                fontSize: '14px',
                padding: '8px 12px',
                ...style
              }
            },
            type: node.type,
            isAsset: false,
            position: {
              x: node['position']['x'] + randomPos,
              y: node['position']['y'] + randomPos
            },
            properties: node.properties
            // parentId: node.parentId ? `${node.parentId + randomId}` : null,
            // extent: node?.extent ? node?.extent : null
          });
        });

        parsedTemplate?.templates?.['edges'].map((edge) =>
          newEdges.push({
            id: uid(),
            source: `${edge.source + randomId}`,
            target: `${edge.target + randomId}`,
            ...edgeOptions
          })
        );

        dragAdd(newNodes, newEdges);
      }
      centerLayout();
      setIsChanged(true);
    },
    [reactFlowInstance, nodes, addNode, addEdge, dragAdd]
  );

  const onNodeDrag = (event, draggedNode) => {
    // Check for overlapping nodes

    handleConnection(draggedNode);
  };

  const buttonStyle = {
    background: color?.canvasBG
  };

  const handleCloseSave = () => {
    setOpenSave(false);
    // onRestore(attackScene?.templates);
    setIsChanged(false);
  };
  // console.log('nodes', nodes);
  // console.log('edges', edges);
  if (!isReady) return null;

  return (
    <>
      <Joyride
        steps={attackCanvasSteps}
        run={runTour}
        continuous
        scrollToFirstStep
        showProgress
        showSkipButton
        callback={handleJoyrideCallback}
        styles={{
          options: {
            zIndex: 1300,
            beacon: {
              backgroundColor: '#1976d2',
              borderRadius: '50%',
              width: 20,
              height: 20,
              animation: 'pulse 1.5s infinite'
            }
          }
        }}
        disableOverlayClose
        disableScrolling
      />
      <div ref={flowWrapper} style={{ height: '100%', background: 'white' }} onContextMenu={handleCanvasContextMenu}>
        <ReactFlowProvider>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            onNodeDragStart={() => setIsChanged(true)}
            connectionLineStyle={connectionLineStyle}
            defaultEdgeOptions={edgeOptions}
            onInit={setReactFlowInstance}
            edgeTypes={edgeTypes}
            onDrop={onDrop}
            deleteKeyCode={['Delete', 'Backspace']}
            onDragOver={(event) => {
              event.preventDefault();
              event.dataTransfer.dropEffect = 'move';
            }}
            onNodeDrag={onNodeDrag}
            // onNodeDragStop={onNodeDragStop}
            onNodeContextMenu={handleNodeContextMenu}
            fitView
          >
            <Panel id="control-panel" position="top-left" style={{ display: 'flex', gap: 5, background: color.canvasBG }}>
              <Button
                ref={anchorRef}
                variant="outlined"
                onClick={handleSave}
                startIcon={<SaveIcon sx={{ color: isChanged ? '#FF3131' : '#32CD32' }} />}
                sx={{
                  ...buttonStyle,
                  color: isChanged ? '#FF3131' : '#32CD32',
                  borderColor: isChanged ? '#FF3131' : '#32CD32',
                  transition: 'color 1.5s'
                }}
              >
                {'Save'}
              </Button>
              <Button onClick={() => onLayout({ direction: 'DOWN' })} variant="outlined" sx={buttonStyle}>
                auto-align
              </Button>
              <Button
                variant="outlined"
                onClick={() => onRestore(attackScene?.templates)}
                startIcon={<RestoreIcon />}
                sx={{
                  ...buttonStyle
                }}
              >
                {'Restore'}
              </Button>
              {/* <Button onClick={() => onLayout({ direction: 'RIGHT' })} variant="outlined" sx={buttonStyle}>
              Horizontal
            </Button> */}
            </Panel>
            <Panel position="top-right">
              <IconButton onClick={() => setRunTour(true)} sx={{ color: '#1976d2', ml: 1 }} size="small">
                <HelpOutlineIcon fontSize="small" />
              </IconButton>
            </Panel>
            <MiniMap zoomable pannable style={{ background: color.canvasBG }} />
            <Controls id="controls" />
            <Background variant="dots" gap={12} size={1} style={{ backgroundColor: color?.canvasBG }} />
          </ReactFlow>
        </ReactFlowProvider>
        {contextMenu?.visible && (
          <div
            style={{
              position: 'absolute',
              top: contextMenu.y,
              left: contextMenu.x,
              background: 'white',
              border: '1px solid #ccc',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)', // Increased shadow for better contrast
              zIndex: 1000,
              width: 'fit-content', // Defined width for consistency
              padding: '8px 0',
              fontFamily: 'Arial, sans-serif',
              fontSize: '12px'
            }}
          >
            {contextMenu?.options.map((option) => (
              <div
                key={option}
                style={{
                  padding: '4px 8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between', // Space between text/icon and checkbox
                  borderBottom: contextMenu.options.length > 1 ? '1px solid #eee' : 'none',
                  transition: 'background-color 0.2s ease' // Smooth transition for hover effect
                }}
                onClick={(e) => handleMenuOptionClick(e, option)}
                onMouseEnter={(e) => (e.target.style.backgroundColor = '#f4f4f4')} // Hover effect
                onMouseLeave={(e) => (e.target.style.backgroundColor = 'transparent')} // Revert on mouse leave
              >
                <span style={{ display: 'flex', alignItems: 'center' }}>
                  {option === 'Copy' && <ContentCopyIcon />}
                  {option === 'Paste' && <ContentPasteIcon />}
                  {option.includes('Attack') && <img src={AttackIcon} alt="attack" height="20px" width="20px" />}
                  {option.includes('Requirement') && <img src={CybersecurityIcon} alt="requirement" height="20px" width="20px" />}
                  <span style={{ marginLeft: '8px' }}>{option}</span>
                </span>
                {/* Add MUI Checkbox for "Attack" and "Requirement" */}
                {['Attack', 'Requirement'].includes(option) && (
                  <Checkbox
                    checked={option === 'Attack' ? isAttack : option === 'Requirement' ? isRequirement : false}
                    onChange={(e) => handleCheckboxChange(e, option, e.target.checked)}
                    color="primary"
                    sx={{ marginLeft: 'auto', p: 0 }}
                  />
                )}
              </div>
            ))}
          </div>
        )}
        <Toaster position="top-right" reverseOrder={false} />
        <AutoSavePopper open={openSave} handleClose={handleCloseSave} anchorRef={anchorRef} handleSave={handleSave} />
      </div>
    </>
  );
}
