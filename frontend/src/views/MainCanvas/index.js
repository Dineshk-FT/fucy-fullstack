/* eslint-disable */
import React, { useState, useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  ReactFlowProvider,
  // Panel,
  getRectOfNodes,
  getTransformForBounds,
  MarkerType
} from 'reactflow';
import '../index.css';
import 'reactflow/dist/style.css';
import { v4 as uid } from 'uuid';
import {
  CustomNode,
  DefaultNode,
  InputNode,
  OutputNode,
  CircularNode,
  DiagonalNode,
  MicroController,
  CustomGroupNode,
  CustomEdge,
  MultiHandleNode
} from '../../ui-component/custom';
import useStore from '../../Zustand/store';
import { shallow } from 'zustand/shallow';
import { toPng } from 'html-to-image';
// import { Button } from '@mui/material';
import AddLibrary from '../../ui-component/Modal/AddLibrary';
import { useParams } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import DsTable from '../../ui-component/Table/DSTable';
import Tstable from '../../ui-component/Table/TSTable';
import AttackTree from '../AttackTree';
import CyberSecurityBlock from '../CyberSecurityBlock';
import CyberSecurityTable from '../../ui-component/Table/CybersecurityTable';
import ELK from 'elkjs/lib/elk.bundled';
import Memory from '../../ui-component/custom/Memory';
import RightDrawer from '../../layout/MainLayout/RightSidebar';
import { drawerClose, drawerOpen, leftDrawerClose, leftDrawerOpen } from '../../store/slices/CurrentIdSlice';
import AlertMessage from '../../ui-component/Alert';
import Header from '../../ui-component/Header';
import { setProperties } from '../../store/slices/PageSectionSlice';
import ColorTheme from '../../store/ColorTheme';
import DsDerivationTable from '../../ui-component/Table/DsDerivationTable';
import LeftDrawer from '../../layout/MainLayout/LeftDrawer';
import AttackTreeTable from '../../ui-component/Table/AttackTreeTable';

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
      // Adjust the target and source handle positions based on the layout
      // direction.
      targetPosition: isHorizontal ? 'left' : 'top',
      sourcePosition: isHorizontal ? 'right' : 'bottom',

      // Hardcode a width and height for elk to use when layouting.
      width: 150,
      height: 50
    })),
    edges: edges
  };

  return elk
    .layout(graph)
    .then((layoutedGraph) => ({
      nodes: layoutedGraph.children.map((node) => ({
        ...node,
        position: { x: node.x, y: node.y }
      })),

      edges: layoutedGraph.edges
    }))
    .catch(console.error);
};

const selector = (state) => ({
  nodes: state.nodes,
  edges: state.edges,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
  dragAdd: state.dragAdd,
  dragAddNode: state.dragAddNode,
  setNodes: state.setNodes,
  setEdges: state.setEdges,
  modal: state.modal,
  getModals: state.getModals,
  getModalById: state.getModalById,
  updateModal: state.updateModal,
  getIntersectingNodes: state.getIntersectingNodes,
  getGroupedNodes: state.getGroupedNodes
});

//Edge line styling
const connectionLineStyle = { stroke: 'grey' };
const edgeOptions = {
  type: 'step',
  markerEnd: {
    type: MarkerType.ArrowClosed,
    width: 20,
    height: 20,
    color: 'black'
  },
  animated: false,
  style: {
    stroke: 'grey'
  }
};

const nodetypes = {
  input: InputNode,
  output: OutputNode,
  default: DefaultNode,
  receiver: CustomNode,
  signal: CustomNode,
  custom: CustomNode,
  transmitter: CircularNode,
  transceiver: DiagonalNode,
  mcu: MicroController,
  memory: Memory,
  group: CustomGroupNode,
  multihandle: MultiHandleNode
};
const edgeTypes = {
  custom: CustomEdge
};
const flowKey = 'example-flow';

export default function MainCanvas() {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    dragAdd,
    dragAddNode,
    setNodes,
    setEdges,
    getModalById,
    modal,
    getModals,
    updateModal,
    getIntersectingNodes
  } = useStore(selector, shallow);
  const { id } = useParams();
  const dispatch = useDispatch();
  const Color = ColorTheme();
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [openTemplate, setOpenTemplate] = useState(false);
  const [savedTemplate, setSavedTemplate] = useState({});
  const [selectedNode, setSelectedNode] = useState({});
  const [open, setOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');
  const dragRef = useRef(null);
  const [groupList, setGroupList] = useState([]);

  // console.log('modal', modal);
  useEffect(() => {
    getModalById(id);
  }, [id]);

  useEffect(() => {
    const template = modal?.template;
    setSavedTemplate(template);
    onSaveInitial(template);
    setTimeout(() => {
      onRestore(template);
    }, 100);
  }, [modal]);

  const {
    isDsTableOpen,
    isTsTableOpen,
    isAttackTreeOpen,
    isCyberBlockOpen,
    isCyberTableOpen,
    isRightDrawerOpen,
    isLeftDrawerOpen,
    isDerivationTableOpen,
    isAttackTableOpen
  } = useSelector((state) => state?.currentId);

  const onLayout = useCallback(
    ({ direction, useInitialNodes = false }) => {
      const opts = { 'elk.direction': direction, ...elkOptions };
      const ns = useInitialNodes ? nodes : nodes;
      const es = useInitialNodes ? nodes : edges;
      //  console.log('nodes layout', nodes)
      getLayoutedElements(ns, es, opts).then(({ nodes: layoutedNodes, edges: layoutedEdges }) => {
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);

        // window.requestAnimationFrame(() => fitView());
      });
    },
    [nodes, edges]
  );

  const checkForNodes = () => {
    const [intersectingNodesMap, nodes] = getIntersectingNodes();
    let values = Object.values(intersectingNodesMap).flat();

    let updated = nodes.map((item1) => {
      const match = values.find((item2) => item2.id === item1.id);
      return match ? match : item1;
    });
    setNodes(updated);
  };

  useLayoutEffect(() => {
    onLayout({ direction: 'DOWN', useInitialNodes: true });
  }, []);

  const onNodeDragStart = useCallback((_, node) => {
    dragRef.current = node;
  }, []);

  const onNodeDragStop = useCallback(() => {
    // if(dragRef.current.type !== 'group'){
    checkForNodes();
    // }
  }, []);

  const onNodeDrag = (event, node) => {
    const updatedNodes = nodes.map((n) => {
      if (n.id === node.id) {
        const deltaX = node.position.x - n.position.x;
        const deltaY = node.position.y - n.position.y;

        const updatedChildNodes = nodes.filter((child) => child.parentId === node.id);
        updatedChildNodes.forEach((child) => {
          child.position = {
            x: child.position.x + deltaX,
            y: child.position.y + deltaY
          };
        });

        return {
          ...n,
          position: {
            x: node.position.x,
            y: node.position.y
          }
        };
      }
      return n;
    });

    setNodes(updatedNodes);
  };

  //for downloading the circuit and image
  function downloadImage(dataUrl) {
    const a = document.createElement('a');

    a.setAttribute('download', 'reactflow.png');
    a.setAttribute('href', dataUrl);
    a.click();
  }

  const imageWidth = 1024;
  const imageHeight = 768;

  const handleDownload = () => {
    const nodesBounds = getRectOfNodes(nodes);
    const transform = getTransformForBounds(nodesBounds, imageWidth, imageHeight, 0.5, 2);

    toPng(document.querySelector('.react-flow__viewport'), {
      backgroundColor: '#1a365d',
      width: imageWidth,
      height: imageHeight,
      style: {
        width: imageWidth,
        height: imageHeight,
        transform: `translate(${transform[0]}px, ${transform[1]}px) scale(${transform[2]})`
      }
    }).then(downloadImage);
  };

  //fn for Drag and drop
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const file = event.dataTransfer.getData('application/parseFile');
      const template = event.dataTransfer.getData('application/template');
      let parsedNode;
      let parsedTemplate;
      if (file) {
        parsedNode = JSON.parse(file);
      } else {
        parsedTemplate = JSON.parse(template);
      }
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY
      });
      if (parsedNode) {
        const newNode = {
          id: uid(),
          type: parsedNode.type,
          isAsset: false,
          position,
          properties: parsedNode.properties,
          width: parsedNode?.width,
          height: parsedNode?.height,
          data: {
            label: parsedNode.data['label'],
            style: {
              backgroundColor: parsedNode.data['bgColor'],
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
            }
          }
        };
        dragAdd(newNode);
      }

      if (parsedTemplate) {
        let newNodes = [];
        let newEdges = [];
        const randomId = Math.floor(Math.random() * 1000);
        const randomPos = Math.floor(Math.random() * 500);

        parsedTemplate['nodes'].map((node) => {
          newNodes.push({
            id: `${node.id + randomId}`,
            data: {
              ...node?.data,
              style: {
                backgroundColor: node.data['bgColor'],
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
              }
            },
            type: node.type,
            isAsset: false,
            position: {
              x: node['position']['x'] + randomPos,
              y: node['position']['y'] + randomPos
            },
            properties: node.properties,
            parentId: node.parentId ? `${node.parentId + randomId}` : null,
            extent: node?.extent ? node?.extent : null
          });
        });

        parsedTemplate['edges'].map((edge) =>
          newEdges.push({
            id: uid(),
            source: `${edge.source + randomId}`,
            target: `${edge.target + randomId}`,
            ...edgeOptions
          })
        );

        dragAddNode(newNodes, newEdges);
      }
      checkForNodes();
    },
    [reactFlowInstance]
  );

  const handleClose = () => {
    setOpenTemplate(false);
  };

  const onSaveInitial = useCallback((temp) => {
    localStorage.removeItem(flowKey);
    if (temp) {
      localStorage.setItem(flowKey, JSON.stringify(temp));
    }
  }, []);

  const onRestore = useCallback(
    (temp) => {
      if (temp) {
        setNodes(temp.nodes);
        setEdges(temp.edges);
      } else {
        handleClear();
      }
    },
    [reactFlowInstance]
  );

  const handleClear = () => {
    setNodes([]);
    setEdges([]);
  };

  const handleSaveToModal = () => {
    let mod = { ...modal };

    let Derivations = nodes
      ?.filter((nd) => nd?.type !== 'group')
      ?.map((node) => {
        return node?.properties.map((pr) => ({
          task: `Check for Damage Scenario for loss of ${pr} for ${node?.data?.label}`,
          name: `Damage Scenario for loss of ${pr} for ${node?.data?.label}`,
          loss: `loss of ${pr}`,
          assets: node?.assets,
          damageScene: []
        }));
      })
      .flat()
      .map((dr, i) => ({ ...dr, id: `DS00${i + 1}` }));

    let Details = nodes
      ?.filter((nd) => nd?.type !== 'group')
      ?.map((node) => ({
        id: uid(),
        name: node?.data?.label,
        props: node?.properties.map((pr) => ({ name: pr, id: uid() }))
      }));

    // const DamageDetails = nodes
    //   ?.filter((nd) => nd?.type !== 'group')
    //   ?.map((node) => ({
    //     id: uid(),
    //     name: node?.data?.label,
    //     props: node?.properties.map((pr) => ({
    //       name: pr,
    //       isChecked: false
    //     }))
    //   }));

    mod.template = { nodes, edges };
    mod.scenarios = [
      {
        id: uid(),
        name: 'Item Modal & Assets',
        icon: 'ItemIcon',
        Details: Details
      },
      {
        id: uid(),
        name: 'Damage Scenarios Identification and Impact Ratings',
        icon: 'DamageIcon',
        subs: [
          {
            id: uid(),
            name: 'Damage Scenarios Derivations',
            Details: Derivations
          },
          {
            id: uid(),
            name: 'Damage Scenarios - Collection & Impact Ratings',
            scenes: [],
            Details: Details
          }
        ]
      },
      {
        id: uid(),
        name: 'Threat Scenarios Identification',
        icon: 'ThreatIcon',
        subs: [
          {
            id: uid(),
            name: 'Threat Scenarios',
            Details: Details,
            losses: []
          },
          {
            id: uid(),
            name: 'Derived Threat Scenarios',
            scenes: []
          }
        ]
      },
      {
        id: uid(),
        name: 'Attack Path Analysis and Attack Feasability Rating',
        icon: 'AttackIcon',
        subs: [
          {
            id: uid(),
            name: 'Attack',
            scenes: []
          },
          {
            id: uid(),
            name: 'Attack Trees',
            scenes: []
          },
          {
            id: uid(),
            name: 'Vulnerability Analysis',
            scenes: []
          }
        ]
      },
      {
        id: uid(),
        name: 'CyberSecurity Goals, Claims and Requirements',
        icon: 'CybersecurityIcon',
        subs: [
          {
            id: uid(),
            name: 'CyberSecurity Goals and Requirements',
            subs: [
              {
                id: uid(),
                name: 'CyberSecurity Goals',
                scenes: []
              },
              {
                id: uid(),
                name: 'CyberSecurity Requirements',
                scenes: []
              }
            ]
          },
          {
            id: uid(),
            name: 'CyberSecurity Controls',
            scenes: []
          }
        ]
      },
      {
        id: uid(),
        name: 'System Design',
        icon: 'SystemIcon',
        subs: [
          {
            id: uid(),
            name: 'Hardware Models'
          },
          {
            id: uid(),
            name: 'Software Models'
          }
        ]
      },
      {
        id: uid(),
        name: 'Catalogs',
        icon: 'CatalogIcon',
        subs: [
          {
            name: 'UNICE R.155 Annex 5(WP.29)',
            scenes: []
          }
        ]
      },
      {
        id: uid(),
        name: 'Risk Determination and Risk Treatment Decision',
        icon: 'RiskIcon'
      },
      {
        id: uid(),
        name: 'Documents',
        icon: 'DocumentIcon'
      },
      {
        id: uid(),
        name: 'Reporting',
        icon: 'ReportIcon',
        scenes: []
      },
      {
        id: uid(),
        name: 'Layouts',
        icon: 'LayoutIcon',
        scenes: []
      }
    ];

    updateModal(mod)
      .then((res) => {
        if (res) {
          setTimeout(() => {
            setOpen(true);
            setMessage('Saved Successfully');
            setSuccess(true);
            handleClose();
            getModals();
          }, 500);
        }
      })
      .catch((err) => {
        console.log('err', err);
        setOpen(true);
        setSuccess(false);
        setMessage('Something went wrong');
      });
  };

  const toggleDrawerOpen = (tab) => dispatch(drawerOpen(tab));
  const toggleDrawerClose = () => dispatch(drawerClose());
  const toggleLeftDrawerOpen = () => dispatch(leftDrawerOpen());
  const toggleLeftDrawerClose = () => dispatch(leftDrawerClose());
  const onLoad = (reactFlowInstance) => reactFlowInstance.current;

  const handleSidebarOpen = (e, node) => {
    // console.log('e', e);
    // console.log('node', node);
    e.preventDefault();
    if (node.type !== 'group') {
      setSelectedNode(node);
      toggleDrawerOpen('MainCanvasTab');
      dispatch(setProperties(node?.properties));
    }
  };

  const handleSelectNode = (e, node) => {
    let grp = [...groupList];
    function addNodeToArray(node) {
      const existingNode = grp.find((obj) => obj.id === node.id);

      if (!existingNode) {
        grp.push(node);
      }
    }
    if (node.type !== 'group') {
      setSelectedNode(node);
      dispatch(setProperties(node?.properties));

      if (!grp.length) {
        grp.push(node);
      } else {
        addNodeToArray(node);
      }
      setGroupList(grp);
    }
  };

  const createGroup = (e) => {
    e.preventDefault();
    const newNode = {
      id: uid(),
      type: 'group',
      height: 280,
      width: 250,
      position: {
        x: e.clientX,
        y: e.clientY
      },
      data: {
        label: 'group'
      }
    };
    dragAdd(newNode);
  };

  // console.log('nodes', nodes);
  if (isDsTableOpen) return <DsTable />;
  if (isDerivationTableOpen) return <DsDerivationTable />;
  if (isTsTableOpen) return <Tstable />;
  if (isAttackTreeOpen) return <AttackTree modal={modal} />;
  if (isCyberBlockOpen) return <CyberSecurityBlock />;
  if (isCyberTableOpen) return <CyberSecurityTable />;
  if (isAttackTableOpen) return <AttackTreeTable />;

  return (
    <>
      <div style={{ width: '100%', height: '100%', boxShadow: '0px 0px 5px gray', background: 'white' }}>
        <Header
          selectedNode={selectedNode}
          nodes={nodes}
          setNodes={setNodes}
          setSelectedNode={setSelectedNode}
          horizontal={() => onLayout({ direction: 'RIGHT' })}
          vertical={() => onLayout({ direction: 'DOWN' })}
          handleClear={handleClear}
          handleSave={handleSaveToModal}
          download={handleDownload}
          createGroup={createGroup}
        />
        <ReactFlowProvider fitView>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodetypes}
            edgeTypes={edgeTypes}
            onLoad={onLoad}
            onNodeDrag={onNodeDrag}
            onNodeDragStart={onNodeDragStart}
            onNodeDragStop={onNodeDragStop}
            connectionLineStyle={connectionLineStyle}
            defaultEdgeOptions={edgeOptions}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            fitView
            // onNodeDoubleClick={handleSidebarOpen}
            onNodeClick={handleSelectNode}
            // onContextMenu={createGroup}
            onNodeContextMenu={handleSidebarOpen}
          >
            <Controls />
            <MiniMap zoomable pannable style={{ background: Color.canvasBG }} />
            <Background variant="dots" gap={12} size={1} style={{ backgroundColor: Color?.canvasBG }} />
            <LeftDrawer state={isLeftDrawerOpen} drawerOpen={toggleLeftDrawerOpen} drawerClose={toggleLeftDrawerClose} />
            <RightDrawer
              state={isRightDrawerOpen}
              drawerOpen={toggleDrawerOpen}
              drawerClose={toggleDrawerClose}
              selectedNode={selectedNode}
              setSelectedNode={setSelectedNode}
              nodes={nodes}
              setNodes={setNodes}
              modal={modal}
              updateModal={updateModal}
            />
          </ReactFlow>
        </ReactFlowProvider>
        {openTemplate && (
          <AddLibrary open={openTemplate} handleClose={handleClose} savedTemplate={savedTemplate} setNodes={setNodes} setEdges={setEdges} />
        )}
        <AlertMessage open={open} message={message} setOpen={setOpen} success={success} />
      </div>
    </>
  );
}
