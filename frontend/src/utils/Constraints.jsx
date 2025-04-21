import { v4 as uid } from 'uuid';
import {
  CircularNode,
  CustomGroupNode,
  CustomNode,
  DefaultNode,
  DiagonalNode,
  InputNode,
  Memory,
  MicroController,
  MultiHandleNode,
  OutputNode
} from '../components/custom';
import AttackNode from '../components/custom/nodes/AttackNode';
import { ANDGate, AttackTreeNode, Event, ORGate, TransferGate, VotingGate } from '../components/CustomGates';
import DataNode from '../components/custom/nodes/DataNode';

export const updatedModelState = (mod, nodes, edges) => {
  // console.log('mod', mod);
  let Derivations = nodes
    ?.filter((nd) => nd?.type !== 'group')
    ?.map((node) => {
      return node?.properties.map((pr) => ({
        task: `Check for Damage Scenario for loss of ${pr} for ${node?.data?.label}`,
        name: `Damage Scenario for loss of ${pr} for ${node?.data?.label}`,
        loss: `loss of ${pr}`,
        asset: node?.isAsset,
        damageScene: []
      }));
    })
    .flat()
    .map((dr, i) => ({ ...dr, id: `DS00${i + 1}` }));

  let Details = nodes
    ?.filter((nd) => nd?.type !== 'group')
    ?.map((node) => ({
      id: uid(),
      nodeId: node?.id,
      name: node?.data?.label,
      props: node?.properties.map((pr) => ({ name: pr, id: uid() }))
    }));

  mod.template = { nodes, edges };
  mod.scenarios[0].Details = Details;
  mod.scenarios[1].subs[0].Details = Derivations;
  // mod.scenarios[1].subs[0].losses = [];
  mod.scenarios[1].subs[1].Details = Details;
  mod.scenarios[2].Details = Details;

  return mod;
};
export const style = {
  fontSize: '16px',
  fontFamily: 'Inter',
  fontStyle: 'normal',
  fontWeight: 500,
  textAlign: 'center',
  color: 'white',
  textDecoration: 'none',
  borderColor: 'black',
  borderWidth: '2px',
  borderStyle: 'solid'
};

export const pageNodeTypes = {
  maincanvas: {
    input: InputNode,
    output: OutputNode,
    default: DefaultNode,
    data: DataNode,
    receiver: CustomNode,
    signal: CustomNode,
    custom: CustomNode,
    transmitter: CircularNode,
    transceiver: DiagonalNode,
    mcu: MicroController,
    memory: Memory,
    group: CustomGroupNode,
    multihandle: MultiHandleNode
  },
  attackcanvas: {
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
  }
};

export const getNodeDetails = (type, name, count, newNode) => {
  const dataNode = {
    id: uid(),
    data: {
      label: newNode?.nodeName ?? `New ${name} ${count}`,
      style: {
        backgroundColor: '#dadada',
        fontSize: '12px',
        fontFamily: 'Inter',
        fontStyle: 'normal',
        textAlign: 'center',
        color: 'black',
        fontWeight: 500,
        textDecoration: 'none',
        borderColor: 'gray',
        borderWidth: '2px',
        borderStyle: 'solid',
        width: 150,
        height: 50
      }
    },
    type: type,
    properties: newNode?.properties ?? ['Confidentiality'],
    width: 150,
    height: 50,
    isAsset: false
  };
  const updatePositionWithinRange = (position, range) => {
    const getRandomOffset = (range) => Math.random() * range * 2 - range;
    return { x: position.x + getRandomOffset(range), y: position.y + getRandomOffset(range) };
  };
  const position = { x: 495, y: 250 };
  const range = 50;
  const updatedPosition = updatePositionWithinRange(position, range);
  return { ...dataNode, position: updatedPosition };
};
