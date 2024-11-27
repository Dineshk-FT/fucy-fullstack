/*eslint-disable*/
import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import ReactFlow, { ReactFlowProvider, Controls, MiniMap, Panel, MarkerType } from 'reactflow';
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

const elk = new ELK();

const elkOptions = {
  'elk.algorithm': 'layered',
  'elk.layered.spacing.nodeNodeBetweenLayers': '100',
  'elk.spacing.nodeNode': '80'
};

const getLayoutedElements = (nodes, edges, options = {}) => {
  const isHorizontal = options?.['elk.direction'] === 'RIGHT';
  const graph = {
    id: 'root',
    layoutOptions: options,
    children: nodes.map((node) => ({
      ...node,
      targetPosition: isHorizontal ? 'left' : 'top',
      sourcePosition: isHorizontal ? 'right' : 'bottom',
      width: 150,
      height: 50
    })),
    edges: edges
  };

  return elk
    .layout(graph)
    .then((layoutedGraph) => {
      return {
        nodes: layoutedGraph.children.map((node) => ({
          ...node,
          position: { x: node.x, y: node.y }
        })),
        edges: layoutedGraph.edges
      };
    })
    .catch((error) => {
      console.log('error', error);
    });
};

// Define CustomStepEdge outside the component
// function CustomStepEdge({ edges, setEdges, ...props }) {
//   return <StepEdge {...props} edges={edges} setEdges={setEdges} />;
// }

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
  onConnect: state.onConnect,
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

export default function AttackBlock({ attackScene }) {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, addNode, addEdge, setNodes, setEdges, model, update, getAttackScenario } =
    useStore(selector, shallow);

  // console.log('nodes', nodes);
  // console.log('edges', edges);
  const dispatch = useDispatch();
  const notify = (message, status) => toast[status](message);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  useEffect(() => {
    setNodes([]);
    setEdges([]);
  }, []);

  useEffect(() => {
    if (attackScene) {
      setTimeout(() => {
        setNodes(attackScene?.templates?.nodes ?? []);
        setEdges(attackScene?.templates?.edges ?? []);
      }, 10);
    }
  }, [attackScene]);

  useEffect(() => {
    if (reactFlowInstance) {
      reactFlowInstance.fitView({ padding: 0.2, includeHiddenNodes: true, minZoom: 0.5, maxZoom: 1.5, duration: 500 });
    }
  }, [reactFlowInstance, nodes?.length]);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const cyber = event.dataTransfer.getData('application/cyber');
      let parsedNode;

      if (cyber) {
        parsedNode = JSON.parse(cyber);
      }

      const newId = uid();
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY
      });

      if (parsedNode) {
        const newNode = {
          id: newId,
          position,
          type: parsedNode?.type || parsedNode?.label,
          ...parsedNode,
          width: 100,
          height: 70,
          data: {
            label: parsedNode?.label,
            nodeId: parsedNode?.nodeId,
            style: {
              color: 'black',
              backgroundColor: 'transparent',
              fontSize: '16px',
              fontFamily: 'Inter',
              fontStyle: 'normal',
              fontWeight: 500,
              textAlign: 'center',
              borderColor: 'black',
              borderWidth: '2px',
              borderStyle: 'solid'
            }
          }
        };

        const targetNode = nodes.find((node) => {
          const nodeBounds = {
            xMin: node.position.x,
            xMax: node.position.x + (node.width || 150),
            yMin: node.position.y,
            yMax: node.position.y + (node.height || 50)
          };

          return (
            position.x > nodeBounds.xMin && position.x < nodeBounds.xMax && position.y > nodeBounds.yMin && position.y < nodeBounds.yMax
          );
        });

        addNode(newNode);

        if (targetNode) {
          const newEdge = {
            id: uid(),
            source: targetNode.id,
            target: newId,
            type: 'step',
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 20,
              height: 20,
              color: 'black'
            }
          };

          addEdge(newEdge);
        }
      }
    },
    [reactFlowInstance, nodes, addNode, addEdge]
  );

  // console.log('nodes', nodes);
  // console.log('edges', edges);

  const onLayout = useCallback(
    ({ direction, useInitialNodes = false }) => {
      const opts = { 'elk.direction': direction, ...elkOptions };
      const ns = useInitialNodes ? nodes : nodes;
      const es = useInitialNodes ? edges : edges;

      getLayoutedElements(ns, es, opts).then(({ nodes: layoutedNodes, edges: layoutedEdges }) => {
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);

        // window.requestAnimationFrame(() => fitView());
      });
    },
    [nodes, edges]
  );

  useLayoutEffect(() => {
    onLayout({ direction: 'DOWN' });
  }, []);
  // console.log('model', model);
  // console.log('nodes', nodes);

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
    // dispatch(setAttackScene(selected));
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
    const { nodes, edges, setEdges } = useStore.getState(); // Access Zustand state

    // Check for overlapping nodes
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
    }
  };

  return (
    <div style={{ height: '100%', background: 'white' }}>
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
          fitView
        >
          <Panel position="top-left" style={{ display: 'flex', gap: 5, background: 'white' }}>
            <Button variant="outlined" onClick={handleSave}>
              {attackScene?.templates?.nodes.length ? 'Update' : 'Add'}
            </Button>
            {/* <Button onClick={() => onLayout({ direction: 'RIGHT' })} variant="outlined">
              Align
            </Button> */}
          </Panel>
          <MiniMap />
          <Controls />
        </ReactFlow>
      </ReactFlowProvider>
      <Toaster position="top-right" reverseOrder={false} />
    </div>
  );
}
