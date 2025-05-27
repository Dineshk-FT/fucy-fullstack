import React, {
  // useState,
  //  useCallback,
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
import CustomNode from '../../components/custom/nodes/CustomNode';
import DefaultNode from '../../components/custom/nodes/DefaultNode';
import InputNode from '../../components/custom/nodes/InputNode';
import OutputNode from '../../components/custom/nodes/OutputNode';
import CircularNode from '../../components/custom/nodes/CircularNode';
import DiagonalNode from '../../components/custom/nodes/DiagonalNode ';
import AttackTreeNode from '../../components/CustomGates/AttackTreeNode';
import useStore from '../../store/Zustand/store';
import { shallow } from 'zustand/shallow';
import ORGate from '../../components/CustomGates/ORGate';
import ANDGate from '../../components/CustomGates/ANDGate';
import TransferGate from '../../components/CustomGates/TransferGate';
import VotingGate from '../../components/CustomGates/VotingGate';
import LevelNode from '../../components/CustomGates/LevelNode';
import KeyboardBackspaceRoundedIcon from '@mui/icons-material/KeyboardBackspaceRounded';
import { closeAll } from '../../store/slices/CurrentIdSlice';
import { useDispatch, useSelector } from 'react-redux';

const selector = (state) => ({
  nodes: state.attackNodes,
  edges: state.attackedges,
  onNodesChange: state.onAttackNodesChange,
  onEdgesChange: state.onAttackEdgesChange,
  onConnect: state.onAttackConnect,
  dragAdd: state.dragAdd,
  addAttackNode: state.addAttackNode,
  dragAddNode: state.dragAddNode,
  setNodes: state.setAttackNodes,
  setEdges: state.setAttackEdges,
  model: state.model,
  getModelById: state.getModelById,
  updateModel: state.updateModel
});

//Edge line styling
const connectionLineStyle = { stroke: 'black' };
const edgeOptions = {
  type: 'step',
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
  level_node: LevelNode,
  [`OR Gate`]: ORGate,
  [`AND Gate`]: ANDGate,
  [`Transfer Gate`]: TransferGate,
  [`Voting Gate`]: VotingGate
};

export default function Levels() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, addAttackNode, setNodes, setEdges } = useStore(selector, shallow);
  const dispatch = useDispatch();
  const { levelDts } = useSelector((state) => state?.currentId);
  // console.log('levelDts', levelDts);
  useEffect(() => {
    setNodes([]);
    setEdges([]);
    const newNode = {
      id: levelDts?.id,
      type: 'level_node',
      position: {
        x: 100,
        y: 50
      },
      data: {
        label: levelDts?.label
      }
    };
    setTimeout(() => {
      addAttackNode(newNode);
    }, 500);
  }, [levelDts]);
  // console.log('nodes', nodes);
  const handleBack = () => dispatch(closeAll());

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
              //   border:'2px solid black',
              background: 'white'
              //   marginLeft: "2rem",
              //   marginTop: "2rem",
            }}
          >
            <KeyboardBackspaceRoundedIcon sx={{ float: 'left', cursor: 'pointer', ml: 1 }} onClick={handleBack} />
          </Panel>
          <MiniMap />
          <Controls />
        </ReactFlow>
        {/* </div> */}
      </ReactFlowProvider>
    </div>
  );
}
