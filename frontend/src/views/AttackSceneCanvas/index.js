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
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';

const elk = new ELK();

const elkOptions = {
  'elk.algorithm': 'layered',
  'elk.direction': 'DOWN',
  'elk.layered.spacing.nodeNodeBetweenLayers': '70', // More spacing between layers
  'elk.spacing.nodeNode': '10', // Spacing between nodes in the same layer
  'elk.layered.considerModelOrder': true, // Respect input order when arranging
  'elk.layered.mergeEdges': true, // Merge edges where possible for clarity
};

const getLayoutedElements = async (nodes, edges, options = {}) => {
  const isHorizontal = options?.['elk.direction'] === 'RIGHT';
  const graph = {
    id: 'root',
    layoutOptions: options,
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
    const layoutedGraph = await elk.layout(graph);

    // Map the layouted nodes
    const layoutedNodes = layoutedGraph.children.map((node) => ({
      ...nodes.find((n) => n.id === node.id), // Retain existing properties
      position: { x: node.x, y: node.y }
    }));

    // Adjust parent node positions
    layoutedNodes.forEach((node) => {
      const childrenEdges = edges.filter((edge) => edge.source === node.id); // Find edges where this node is a parent

      if (childrenEdges.length > 0) {
        const childNodes = layoutedNodes.filter((n) => childrenEdges.some((edge) => edge.target === n.id));

        if (childNodes.length > 0) {
          if (isHorizontal) {
            // Horizontal layout: Adjust vertically
            const minY = Math.min(...childNodes.map((child) => child.position.y));
            const maxY = Math.max(...childNodes.map((child) => child.position.y + (child.height || 50)));
            const centerY = (minY + maxY) / 2;

            node.position.y = centerY - (node.height || 50) / 2; // Center parent vertically
          } else {
            // Vertical layout: Adjust horizontally
            const minX = Math.min(...childNodes.map((child) => child.position.x));
            const maxX = Math.max(...childNodes.map((child) => child.position.x + (child.width || 150)));
            const centerX = (minX + maxX) / 2;

            node.position.x = centerX - (node.width || 150) / 2; // Center parent horizontally
          }
        }
      }
    });

    const layoutedEdges = layoutedGraph.edges.map((edge) => ({
      ...edges.find((e) => e.id === edge.id) // Retain existing edge properties
    }));

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
  getAttackScenario: state.getAttackScenario
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
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, addNode, addEdge, setNodes, setEdges, model, update, getAttackScenario } =
    useStore(selector, shallow);
  const dispatch = useDispatch();
  const notify = (message, status) => toast[status](message);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const { isAttackTreeOpen } = useSelector((state) => state?.currentId);
  const [copiedNode, setCopiedNode] = useState([]);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0 });

  // console.log('attackScene', attackScene);
  useEffect(() => {
    if (attackScene) {
      setTimeout(() => {
        setNodes(attackScene?.templates?.nodes ?? []);
        setEdges(attackScene?.templates?.edges ?? []);
      }, 300);
    }
  }, [attackScene, isAttackTreeOpen]);


  useEffect(() => {
    if (reactFlowInstance) {
      reactFlowInstance.fitView({ padding: 0.2, includeHiddenNodes: true, minZoom: 0.5, maxZoom: 1.5, duration: 500 });
    }
  }, [reactFlowInstance, nodes?.length]);

  const handleNodeContextMenu = (event, node) => {
    event.preventDefault();

    setCopiedNode(node);
  
    setContextMenu({
      visible: true,
      x: event.clientX,
      y: event.clientY,
      options: ['Copy', 'Paste'],
      node
    });
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
        options: ['Copy', 'Paste'],
      });
    } else {
      console.log("No copied node available");
    }
  };
  

  const handleMenuOptionClick = (option) => {
    if (option === 'Copy' && copiedNode) {
      const nodeToCopy = [copiedNode]; 
      // localStorage.removeItem('copiedNode'); // Clear any previous data
      // localStorage.setItem('copiedNode', JSON.stringify(nodeToCopy));
      setCopiedNode(nodeToCopy);
      notify('Node copied!', 'success');
    }

    if (option === 'Paste') {
      // const copiedNodes = JSON.parse(localStorage.getItem('copiedNode'));
  
      // Ensure copiedNodes is an array and contains data
      // if (Array.isArray(copiedNodes) && copiedNodes.length > 0) {
      //   copiedNodes.forEach((node) => {
      if (Array.isArray(copiedNode) && copiedNode.length > 0) {
        copiedNode.forEach((node) => {
          const newNode = {
            ...node,
            id: uid(),
            position: {
              x: contextMenu.x - 100,
              y: contextMenu.y - 50,
            },
          };
  
          const nodetoPaste = [...nodes, newNode]
          setNodes(nodetoPaste);
        });
  
        // localStorage.removeItem('copiedNode');
      } else {
        console.error('No valid copied node found');
      }
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
      // Flexible condition for default or Event type nodes
      let condition = true;
      if (overlappingNode.type === 'default' || overlappingNode.type === 'Event') {
        condition =
          (overlappingNode.type === 'default' && draggedNode.type.includes('Gate')) ||
          (overlappingNode.type.includes('Gate') && draggedNode.type.includes('Gate')) ||
          (overlappingNode.type.includes('Gate') && draggedNode.type === 'Event') ||
          (overlappingNode.type === 'Event' && draggedNode.type.includes('Gate'));
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
    }
  };

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const cyber = event.dataTransfer.getData('application/cyber');
      let parsedNode;
  
      if (cyber) {
        try {
          parsedNode = JSON.parse(cyber);  // Ensure it's properly parsed
        } catch (err) {
          console.error('Failed to parse dropped data:', err);
        }
      }
  
      if (parsedNode) {
        const newId = uid();
        const position = reactFlowInstance.screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });
  
        const newNode = {
          id: newId,
          position,
          type: parsedNode.type || parsedNode.label,
          ...parsedNode,
          width: 100,
          height: 70,
          data: {
            label: parsedNode.label,
            nodeId: parsedNode.nodeId,
            style: {
              ...style,
              backgroundColor: 'transparent',
              color: 'black',
            },
          },
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
    const details = {
      modelId: model?._id,
      type: 'attack_trees',
      id: attackScene?.ID,
      templates: JSON.stringify(template)
    };
    update(details)
      .then((res) => {
        if (res) {
          setTimeout(() => {
            notify(attackScene?.templates ? 'Updated Successfully' : 'Added Successfully', 'success');
            getAttackScenario(model?._id);
          }, 500);
        }
      })
      .catch((err) => {
        if (err) {
          notify('Something Went Wrong', 'error');
        }
      });
  };

  const onNodeDragStop = (event, draggedNode) => {
    // Check for overlapping nodes

    handleConnection(draggedNode);
  };

  const buttonStyle = {
    background: color?.canvasBG
  };

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
          onNodeDragStop={onNodeDragStop}
          onNodeContextMenu={handleNodeContextMenu} 
          fitView
        >
          <Panel position="top-left" style={{ display: 'flex', gap: 5, background: color.canvasBG }}>
            <Button variant="outlined" onClick={handleSave} sx={buttonStyle}>
              {attackScene?.templates?.nodes.length ? 'Update' : 'Add'}
            </Button>
            <Button onClick={() => onLayout({ direction: 'DOWN' })} variant="outlined" sx={buttonStyle}>
              vertical
            </Button>
            <Button onClick={() => onLayout({ direction: 'RIGHT' })} variant="outlined" sx={buttonStyle}>
              Horizontal
            </Button>
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
              width: '90px', // Defined width for consistency
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
