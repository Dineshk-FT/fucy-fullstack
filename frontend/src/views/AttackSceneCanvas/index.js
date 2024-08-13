import React, {
  // useState,
  useCallback,
  useLayoutEffect,
  useEffect
} from 'react';
import ReactFlow, {
  ReactFlowProvider,
  // MarkerType,
  Controls,
  MiniMap,
  Panel
} from 'reactflow';
import '../index.css';
import 'reactflow/dist/style.css';
// import { v4 as uid } from "uuid";
import CustomNode from '../../ui-component/custom/CustomNode';
import DefaultNode from '../../ui-component/custom/DefaultNode';
import InputNode from '../../ui-component/custom/InputNode';
import OutputNode from '../../ui-component/custom/OutputNode';
import CircularNode from '../../ui-component/custom/CircularNode';
import DiagonalNode from '../../ui-component/custom/DiagonalNode ';
import AttackTreeNode from '../../ui-component/CustomGates/AttackTreeNode';
import useStore from '../../Zustand/store';
import { shallow } from 'zustand/shallow';
// import { useSelector } from 'react-redux';
import ORGate from '../../ui-component/CustomGates/ORGate';
import ANDGate from '../../ui-component/CustomGates/ANDGate';
import TransferGate from '../../ui-component/CustomGates/TransferGate';
import VotingGate from '../../ui-component/CustomGates/VotingGate';
import { Button } from '@mui/material';
import { useParams } from 'react-router';
import { v4 as uid } from 'uuid';
import Event from '../../ui-component/CustomGates/Event';
import { useDispatch } from 'react-redux';
import { setAttackScene } from '../../store/slices/CurrentIdSlice';
import ELK from 'elkjs/lib/elk.bundled';

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

  // console.log('graph', graph);
  // console.log('elk', elk);
  return elk
    .layout(graph)
    .then((layoutedGraph) => {
      // console.log('layoutedGraph', layoutedGraph);
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
const selector = (state) => ({
  nodes: state.attackNodes,
  edges: state.attackEdges,
  onNodesChange: state.onAttackNodesChange,
  onEdgesChange: state.onAttackEdgesChange,
  onConnect: state.onAttackConnect,
  dragAdd: state.dragAdd,
  addAttackNode: state.addAttackNode,
  dragAddNode: state.dragAddNode,
  setNodes: state.setAttackNodes,
  setEdges: state.setAttackEdges,
  modal: state.modal,
  getModalById: state.getModalById,
  getModals: state.getModals,
  update: state.updateModal
});

//Edge line styling
const connectionLineStyle = { stroke: 'black' };
const edgeOptions = {
  type: 'straight',
  // markerEnd: {
  //   type: MarkerType.ArrowClosed,
  //   width: 20,
  //   height: 20,
  //   color: "black",
  // },
  // markerStart: {
  //   type: MarkerType.ArrowClosed,
  //   width: 20,
  //   height: 20,
  //   color: "#FF0072",
  // },
  animated: false,
  style: {
    stroke: 'gray'
  }
};

const nodetypes = {
  input: InputNode,
  output: OutputNode,
  default: DefaultNode,
  receiver: CustomNode,
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
// const flowKey = "example-flow";

export default function Home({ attackScene }) {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    // dragAdd,
    // dragAddNode,
    addAttackNode,
    setNodes,
    setEdges,
    getModalById,
    modal,
    update,
    getModals
  } = useStore(selector, shallow);
  const dispatch = useDispatch();
  const { id } = useParams();
  // console.log('attackScene', attackScene);
  // console.log('modal', modal);

  const onLayout = useCallback(
    ({ direction, useInitialNodes = false }) => {
      const opts = { 'elk.direction': direction, ...elkOptions };
      const ns = useInitialNodes ? nodes : nodes;
      const es = useInitialNodes ? nodes : edges;

      getLayoutedElements(ns, es, opts).then(({ nodes: layoutedNodes, edges: layoutedEdges }) => {
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);

        window.requestAnimationFrame(() => fitView());
      });
    },
    [nodes, edges]
  );

  useLayoutEffect(() => {
    onLayout({ direction: 'DOWN', useInitialNodes: true });
  }, []);

  useEffect(() => {
    getModalById(id);
    if (attackScene?.template) {
      setNodes(attackScene?.template?.nodes);
      setEdges(attackScene?.template?.edges);
    } else {
      const newNode = {
        id: attackScene?.id,
        type: 'attack_tree_node',
        position: {
          x: 100,
          y: 100
        },
        data: {
          label: attackScene?.name
        }
      };
      setTimeout(() => {
        addAttackNode(newNode);
      }, 500);
    }

    return () => {
      if (attackScene?.template) {
        setNodes(attackScene?.template?.nodes);
        setEdges(attackScene?.template?.edges);
      }
    };
  }, [attackScene]);
  // console.log('nodes', nodes);
  const handleSave = () => {
    const atScene = { ...attackScene };
    const mod = { ...modal };
    const selected = mod?.scenarios[3]?.subs[0]?.scenes?.find((ite) => ite.id === atScene?.id);
    // console.log('selected', selected);
    selected.template = {
      id: uid(),
      nodes: nodes,
      edges: edges
    };
    dispatch(setAttackScene(selected));
    update(mod)
      .then((res) => {
        if (res) {
          setTimeout(() => {
            alert('Added successfully');
            // window.location.reload();
            getModals();
          }, 500);
        }
      })
      .catch((err) => console.log('err', err));
  };

  return (
    <div style={{ height: '100%', background: 'white' }}>
      <ReactFlowProvider>
        {/* <div className="reactflow-wrapper" ref={reactFlowWrapper}> */}
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodetypes}
          connectionLineStyle={connectionLineStyle}
          defaultEdgeOptions={edgeOptions}
          // onInit={setReactFlowInstance}
          // onDrop={onDrop}
          // onDragOver={onDragOver}
          fitView
        >
          <Panel
            position="top-left"
            style={{
              display: 'flex',
              gap: 5,
              background: 'white'
              // marginLeft: "2rem",
              // marginTop: "2rem",
            }}
          >
            <Button variant="outlined" onClick={handleSave}>
              {attackScene?.template ? 'Update' : 'Add'}
            </Button>
          </Panel>
          <Panel position="top-right" style={{ display: 'flex', gap: '10px' }}>
            <Button variant="outlined" onClick={() => onLayout({ direction: 'DOWN' })}>
              vertical layout
            </Button>

            <Button variant="outlined" onClick={() => onLayout({ direction: 'RIGHT' })}>
              horizontal layout
            </Button>
          </Panel>
          <MiniMap />
          <Controls />
        </ReactFlow>
        {/* </div> */}
      </ReactFlowProvider>
    </div>
  );
}
