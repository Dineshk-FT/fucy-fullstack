/*eslint-disable*/
import React, { useCallback, useEffect, useState } from 'react';
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
  getModelById: state.getModelById,
  getModels: state.getModels,
  update: state.updateModel
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
    getModels,
    getModelById
  } = useStore(selector, shallow);

  // console.log('edges', edges);
  const dispatch = useDispatch();
  const notify = (message, status) => toast[status](message);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const { isAttackTreeOpen } = useSelector((state) => state?.currentId);

  // useEffect(() => {
  //   setNodes([]);
  //   setEdges([]);
  // }, []);

  useEffect(() => {
    if (attackScene) {
      setTimeout(() => {
        setNodes(attackScene?.template?.nodes ?? []);
        setEdges(attackScene?.template?.edges ?? []);
      }, 10);
    }
  }, [attackScene]);

  // useEffect(() => {
  //   if (reactFlowInstance) {
  //     reactFlowInstance.fitView({ padding: 0.1, duration: 800 });
  //   }
  // }, [reactFlowInstance]);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const cyber = event.dataTransfer.getData('application/cyber');
      // console.log('cyber', cyber);
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
        // console.log('parsedNode', parsedNode);
        const newNode = {
          id: newId,
          position,
          type: parsedNode?.type ? parsedNode?.type : parsedNode?.label,

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

        const sourceNode = nodes.find((node) => {
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

        if (sourceNode) {
          const newEdge = {
            id: uid(),
            source: sourceNode.id,
            target: newId,
            type: 'step',
            markerEnd: { type: MarkerType.Arrow }
          };

          addEdge(newEdge);
        }

        addNode(newNode);
      }
    },
    [reactFlowInstance, nodes, addNode, addEdge]
  );

  // console.log('nodes', nodes);
  // console.log('edges', edges);

  const onLayout = useCallback(
    ({ direction, useInitialNodes = false }) => {
      const opts = { 'elk.direction': direction, ...elkOptions };
      const ns = useInitialNodes ? attackScene?.template?.nodes : nodes;
      const es = useInitialNodes ? attackScene?.template?.edges : edges;

      getLayoutedElements(ns, es, opts).then(({ nodes: layoutedNodes, edges: layoutedEdges }) => {
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);

        window.requestAnimationFrame(() => fitView());
      });
    },
    [nodes, edges]
  );

  // console.log('model', model);

  const handleSave = () => {
    const atScene = JSON.parse(JSON.stringify(attackScene));
    const mod = JSON.parse(JSON.stringify(model));
    const selected = mod?.scenarios[3]?.subs[1]?.scenes?.find((ite) => ite.id === atScene?.id);
    const selectedIndex = mod?.scenarios[3]?.subs[1]?.scenes?.findIndex((ite) => ite.id === atScene?.id);

    selected.template = {
      id: uid(),
      nodes: nodes,
      edges: edges
    };
    mod.scenarios[3].subs[1].scenes.push[selectedIndex] = selected;
    // console.log('mod', mod);
    // console.log('selected', selected);
    dispatch(setAttackScene(selected));
    update(mod)
      .then((res) => {
        if (res) {
          setTimeout(() => {
            notify(attackScene?.template ? 'Updated Successfully' : 'Added Successfully', 'success');
            getModels();
            getModelById(model?.id);
          }, 500);
        }
      })
      .catch((err) => {
        if (err) {
          notify('Something Went Wrong', 'error');
        }
      });
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
          fitView
        >
          <Panel position="top-left" style={{ display: 'flex', gap: 5, background: 'white' }}>
            <Button variant="outlined" onClick={handleSave}>
              {attackScene?.template ? 'Update' : 'Add'}
            </Button>
          </Panel>
          <MiniMap />
          <Controls />
        </ReactFlow>
      </ReactFlowProvider>
      <Toaster position="top-right" reverseOrder={false} />
    </div>
  );
}
