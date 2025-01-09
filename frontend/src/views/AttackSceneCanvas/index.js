/*eslint-disable*/
import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import ReactFlow, { ReactFlowProvider, Controls, MiniMap, Panel, MarkerType, Background } from 'reactflow';
import '../index.css';
import 'reactflow/dist/style.css';
import useStore from '../../Zustand/store';
import { shallow } from 'zustand/shallow';
import { CustomNode, DefaultNode, InputNode, OutputNode, CircularNode, DiagonalNode, CustomEdge } from '../../ui-component/custom';
import { AttackTreeNode, ORGate, ANDGate, TransferGate, VotingGate, Event } from '../../ui-component/CustomGates';
import { Button } from '@mui/material';
import { v4 as uid } from 'uuid';
import { useDispatch, useSelector } from 'react-redux';
import { setAttackScene } from '../../store/slices/CurrentIdSlice';
import ELK from 'elkjs/lib/elk.bundled';
import toast, { Toaster } from 'react-hot-toast';
import AttackNode from '../../ui-component/custom/nodes/AttackNode';
import StepEdge from '../../ui-component/custom/edges/StepEdge';
import { style } from '../../utils/Constraints';
import SaveIcon from '@mui/icons-material/Save';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import { AttackIcon, CybersecurityIcon } from '../../assets/icons';

const elk = new ELK();

const elkOptions = {
  'elk.algorithm': 'layered',
  'elk.direction': 'DOWN',
  'elk.layered.spacing.nodeNodeBetweenLayers': '70', // More spacing between layers
  'elk.spacing.nodeNode': '10', // Spacing between nodes in the same layer
  'elk.layered.considerModelOrder': true, // Respect input order when arranging
  'elk.layered.mergeEdges': true // Merge edges where possible for clarity
};

const getLayoutedElements = async (nodes, edges, options = {}) => {
  const graph = {
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.spacing.nodeNode': 50,
      ...options
    },
    children: nodes.map((node) => ({
      id: node.id,
      width: node.width || 150,
      height: node.height || 50
    })),
    edges: edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target
    }))
  };

  try {
    // Perform the layout using ELK
    const layoutedGraph = await elk.layout(graph);

    // Align nodes if their positions are close enough in the x or y axis
    const alignNodes = (nodes) => {
      const threshold = 100; // Distance threshold for alignment
      const minSpacing = 50; // Minimum spacing to avoid overlap

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const node1 = nodes[i];
          const node2 = nodes[j];

          // Align on the x-axis if positions are close in x
          if (Math.abs(node1.position.x - node2.position.x) <= threshold) {
            const averageX = (node1.position.x + node2.position.x) / 2;
            node1.position.x = averageX - minSpacing / 2;
            node2.position.x = averageX + minSpacing / 2;
          }

          // Align on the y-axis if positions are close in y
          if (Math.abs(node1.position.y - node2.position.y) <= threshold) {
            const averageY = (node1.position.y + node2.position.y) / 2;
            node1.position.y = averageY - minSpacing / 2;
            node2.position.y = averageY + minSpacing / 2;
          }
        }
      }
    };

    // Map the layouted nodes with their updated positions
    const layoutedNodes = layoutedGraph.children.map((node) => {
      const originalNode = nodes.find((n) => n.id === node.id);

      return {
        ...originalNode,
        position: {
          x: originalNode.position.x,
          y: originalNode.position.y
        }
      };
    });

    // Align nodes based on proximity and avoid overlap
    alignNodes(layoutedNodes);

    // Map the layouted edges
    const layoutedEdges = layoutedGraph.edges.map((edge) => {
      const originalEdge = edges.find((e) => e.id === edge.id);
      return {
        ...originalEdge,
        points: edge.sections?.[0]?.bendPoints || []
      };
    });

    return { nodes: layoutedNodes, edges: layoutedEdges };
  } catch (error) {
    console.error('Error in getLayoutedElements:', error);
    return { nodes: [], edges: [] };
  }
};

// Define edge types outside and pass edges, setEdges as props
const edgeTypes = {
  custom: CustomEdge,
  step: StepEdge
};

const selector = (state) => ({
  nodes: state.nodes,
  edges: state.edges,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnectAttack,
  addNode: state.dragAdd,
  addEdge: state.addEdge,
  setNodes: state.setNodes,
  setEdges: state.setEdges,
  model: state.model,
  update: state.updateAttackScenario,
  getAttackScenario: state.getAttackScenario,
  getCyberSecurityScenario: state.getCyberSecurityScenario,
  addAttackScene: state.addAttackScene,
  addcybersecurityScene: state.addcybersecurityScene
});

// Edge line styling
const connectionLineStyle = { stroke: 'black' };
const edgeOptions = {
  type: 'step',
  markerEnd: {
    type: MarkerType.ArrowClosed,
    width: 20,
    height: 20,
    color: 'black'
  },
  markerStart: {
    type: MarkerType.ArrowClosed,
    width: 20,
    height: 20,
    color: '#FF0072'
  },
  animated: false,
  style: {
    stroke: 'gray'
  },
  data: {
    label: 'edge'
  }
};

const nodetypes = {
  input: InputNode,
  output: OutputNode,
  default: AttackNode,
  receiver: CustomNode,
  custom: CustomNode,
  signal: CustomNode,
  transmitter: CircularNode,
  transceiver: DiagonalNode,
  attack_tree_node: AttackTreeNode,
  Event: Event,
  [`OR Gate`]: ORGate,
  [`AND Gate`]: ANDGate,
  [`Transfer Gate`]: TransferGate,
  [`Voting Gate`]: VotingGate
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
    setNodes,
    setEdges,
    model,
    update,
    getAttackScenario,
    getCyberSecurityScenario,
    addAttackScene,
    addcybersecurityScene
  } = useStore(selector, shallow);
  const dispatch = useDispatch();
  const notify = (message, status) => toast[status](message);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [copiedNode, setCopiedNode] = useState([]);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0 });
  const [selectedNode, setSelectedNode] = useState({});
  // console.log('attackScene', attackScene);

  useEffect(() => {
    if (attackScene) {
      setTimeout(() => {
        setNodes(attackScene?.templates?.nodes ?? []);
        setEdges(attackScene?.templates?.edges ?? []);
      }, 300);
    }
  }, [attackScene]);

  useEffect(() => {
    if (reactFlowInstance) {
      reactFlowInstance.fitView({ padding: 0.2, includeHiddenNodes: true, minZoom: 0.5, maxZoom: 1.5, duration: 500 });
    }
  }, [reactFlowInstance, nodes?.length]);

  const handleNodeContextMenu = (event, node) => {
    if (node.type !== 'default') {
      event.preventDefault();
      setCopiedNode(node);
      setSelectedNode(node);
      setContextMenu({
        visible: true,
        x: event.clientX,
        y: event.clientY,
        options: node.type === 'Event' ? ['Copy', 'Paste', 'Convert to attack', 'convert to requirement'] : ['Copy', 'Paste'],
        node
      });
    }
  };

  const handleCanvasContextMenu = (event) => {
    event.preventDefault();
    // Check if there's a copied node
    // const copiedNodes = JSON.parse(localStorage.getItem("copiedNode"));
    // if (copiedNodes && copiedNodes.length > 0) {
    if (copiedNode && copiedNode.length > 0) {
      setContextMenu({
        visible: true,
        x: event.clientX,
        y: event.clientY,
        options: ['Copy', 'Paste']
      });
    } else {
      console.log('No copied node available');
    }
  };

  const handleMenuOptionClick = (option) => {
    const threatNode = nodes.find((node) => node.type === 'default' && node.threatId);
    const { threatId, key } = threatNode;
    switch (option) {
      case 'Copy':
        if (copiedNode) {
          const nodeToCopy = [copiedNode];
          setCopiedNode(nodeToCopy);
          notify('Node copied!', 'success');
        }
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
        break;
      case 'Convert to attack':
        const details = {
          modelId: model?._id,
          threatId: threatId,
          type: 'attack',
          attackId: selectedNode?.id,
          name: selectedNode?.data?.label
        };
        addAttackScene(details).then((res) => {
          // console.log('res', res);
          if (!res.error) {
            getAttackScenario(model?._id);
            notify(res.message ?? 'converted to Attack', 'success');
          } else {
            notify(res.error, 'error');
          }
        });
        break;
      case 'convert to requirement':
        const detail = {
          modelId: model?._id,
          threatId: threatId,
          threatKey: key,
          type: 'cybersecurity_requirements',
          id: selectedNode?.id,
          name: selectedNode?.data?.label
        };
        addcybersecurityScene(detail).then((res) => {
          // console.log('res', res);
          if (!res.error) {
            getCyberSecurityScenario(model?._id);
            notify(res.message ?? 'converted to Attack', 'success');
          } else {
            notify(res.error, 'error');
          }
        });
        break;
      default:
        break;
    }

    setContextMenu({ visible: false, x: 0, y: 0 });
  };

  useEffect(() => {
    const handleClickOutside = () => setContextMenu({ visible: false, x: 0, y: 0 });
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleConnection = (draggedNode) => {
    const { nodes, edges, setEdges, setNodes } = useStore.getState(); // Access Zustand state

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
      // Updated condition for default or Event type nodes
      let condition = true;
      if (overlappingNode.type === 'default' || overlappingNode.type === 'Event') {
        condition =
          (overlappingNode.type === 'default' && draggedNode.type.includes('Gate')) ||
          (overlappingNode.type.includes('Gate') && draggedNode.type.includes('Gate')) ||
          (overlappingNode.type === 'Event' && draggedNode.type.includes('Gate')) ||
          (overlappingNode.type.includes('Gate') && draggedNode.type === 'Event'); // Added this case
      }

      // Check if the draggedNode's type is already connected
      const hasDifferentGate =
        overlappingNode.data.connections?.some((connection) => connection.type.includes('Gate') && connection.type !== draggedNode.type) ||
        false;

      if (condition && !hasDifferentGate) {
        // Create a new edge
        const newEdge = {
          id: uid(),
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

        // Update edges in Zustand store
        setEdges([...edges, newEdge]);

        // Update overlappingNode's data with the new connection
        const updatedNodes = nodes.map((node) => {
          if (node.id === overlappingNode.id) {
            // Avoid duplication in connections
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

        // Update nodes in Zustand store
        setNodes(updatedNodes);
      }
    } else {
      // Remove edge if moved from some distance (150 in x or y)
      const connectedEdge = edges.find((edge) => edge.target === draggedNode.id);
      if (connectedEdge) {
        const sourceNode = nodes.find((node) => node.id === connectedEdge.source);
        if (sourceNode) {
          const distanceX = Math.abs(sourceNode.position.x - draggedNode.position.x);
          const distanceY = Math.abs(sourceNode.position.y - draggedNode.position.y);

          if (distanceX > 450 || distanceY > 450) {
            // Remove edge and connection
            const updatedEdges = edges.filter((edge) => edge.target !== draggedNode.id);
            setEdges(updatedEdges);

            const updatedNodes = nodes.map((node) => {
              if (node.data?.connections) {
                return {
                  ...node,
                  data: {
                    ...node.data,
                    connections: node.data.connections.filter((connection) => connection.id !== draggedNode.id)
                  }
                };
              }
              return node;
            });

            setNodes(updatedNodes);
          }
        }
      }
    }
  };

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const cyber = event.dataTransfer.getData('application/cyber');
      let parsedNode;

      if (cyber) {
        try {
          parsedNode = JSON.parse(cyber); // Ensure it's properly parsed
        } catch (err) {
          console.error('Failed to parse dropped data:', err);
        }
      }

      const filtered = nodes.filter((node) => node.type == 'default');
      if (filtered.length == 1 && parsedNode.type === 'default') {
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
          // width: 150,
          // height: 100,
          data: {
            label: parsedNode.label,
            nodeId: parsedNode.nodeId,
            style: {
              ...style,
              backgroundColor: 'transparent',
              color: 'black',
              width: 150,
              height: 100
            }
          }
        };
        addNode(newNode);
        handleConnection(newNode);
      }
    },
    [reactFlowInstance, nodes, addNode, addEdge]
  );

  const onLayout = useCallback(
    async ({ direction, useInitialNodes = false }) => {
      try {
        const opts = { 'elk.direction': direction, ...elkOptions };
        const currentNodes = useInitialNodes ? nodes : [...nodes]; // Ensure nodes are fresh
        const currentEdges = useInitialNodes ? edges : [...edges]; // Ensure edges are fresh

        const { nodes: layoutedNodes, edges: layoutedEdges } = await getLayoutedElements(currentNodes, currentEdges, opts);

        if (layoutedNodes && layoutedEdges) {
          setNodes(
            layoutedNodes.map((node) => ({
              ...node,
              position: { x: node.position.x, y: node.position.y }, // Ensure position is set
              data: { ...node.data } // Retain existing data
            }))
          );

          setEdges(layoutedEdges);
        }
      } catch (error) {
        console.error('Error during layout:', error);
      }
    },
    [nodes, edges, setNodes, setEdges]
  );

  useLayoutEffect(() => {
    onLayout({ direction: 'DOWN', useInitialNodes: true });
  }, []);

  const handleSave = () => {
    const template = {
      nodes: nodes,
      edges: edges
    };

    // Extract threatId from nodes with type: "default"
    const threatNode = nodes.find((node) => node.type === 'default' && node.threatId);
    const { threatId, damageId, key } = threatNode;

    const details = {
      modelId: model?._id,
      type: 'attack_trees',
      id: attackScene?.ID,
      templates: JSON.stringify(template),
      threatId: threatId,
      damageId: damageId,
      key: key
    };

    update(details)
      .then((res) => {
        if (res) {
          setTimeout(() => {
            notify('Saved Successfully', 'success');
            getAttackScenario(model?._id);
            getCyberSecurityScenario(model?._id);
          }, 500);
        }
      })
      .catch((err) => {
        if (err) {
          notify('Something Went Wrong', 'error');
        }
      });
  };

  const onNodeDrag = (event, draggedNode) => {
    // Check for overlapping nodes

    handleConnection(draggedNode);
  };

  const buttonStyle = {
    background: color?.canvasBG
  };
  // console.log('nodes', nodes);

  return (
    <div style={{ height: '100%', background: 'white' }} onContextMenu={handleCanvasContextMenu}>
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodetypes}
          connectionLineStyle={connectionLineStyle}
          defaultEdgeOptions={edgeOptions}
          onInit={setReactFlowInstance}
          edgeTypes={edgeTypes}
          onDrop={onDrop}
          onDragOver={(event) => {
            event.preventDefault();
            event.dataTransfer.dropEffect = 'move';
          }}
          onNodeDrag={onNodeDrag}
          // onNodeDragStop={onNodeDragStop}
          onNodeContextMenu={handleNodeContextMenu}
          fitView
        >
          <Panel position="top-left" style={{ display: 'flex', gap: 5, background: color.canvasBG }}>
            <Button variant="outlined" onClick={handleSave} startIcon={<SaveIcon />} sx={buttonStyle}>
              {'Save'}
            </Button>
            <Button onClick={() => onLayout({ direction: 'DOWN' })} variant="outlined" sx={buttonStyle}>
              auto-align
            </Button>
            {/* <Button onClick={() => onLayout({ direction: 'RIGHT' })} variant="outlined" sx={buttonStyle}>
              Horizontal
            </Button> */}
          </Panel>
          <MiniMap zoomable pannable style={{ background: color.canvasBG }} />
          <Controls />
          <Background variant="dots" gap={12} size={1} style={{ backgroundColor: color?.canvasBG }} />
        </ReactFlow>
      </ReactFlowProvider>
      {contextMenu.visible && (
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
          {contextMenu.options.map((option) => (
            <div
              key={option}
              style={{
                padding: '4px 8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                borderBottom: contextMenu.options.length > 1 ? '1px solid #eee' : 'none',
                transition: 'background-color 0.2s ease' // Smooth transition for hover effect
              }}
              onClick={() => handleMenuOptionClick(option)}
              onMouseEnter={(e) => (e.target.style.backgroundColor = '#f4f4f4')} // Hover effect
              onMouseLeave={(e) => (e.target.style.backgroundColor = 'transparent')} // Revert on mouse leave
            >
              <span style={{ marginRight: '8px' }}>
                {option === 'Copy' && <ContentCopyIcon />}
                {option === 'Paste' && <ContentPasteIcon />}
                {option.includes('attack') && <img src={AttackIcon} alt="attack" height="20px" width="20px" />}
                {option.includes('requirement') && <img src={CybersecurityIcon} alt="attack" height="20px" width="20px" />}
              </span>
              {option}
            </div>
          ))}
        </div>
      )}
      <Toaster position="top-right" reverseOrder={false} />
    </div>
  );
}
