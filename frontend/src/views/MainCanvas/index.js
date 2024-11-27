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
  MarkerType,
  useReactFlow,
  Panel
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
import { updatedModelState } from '../../utils/Constraints';
import { OpenPropertiesTab, setSelectedBlock } from '../../store/slices/CanvasSlice';
import StepEdge from '../../ui-component/custom/edges/StepEdge';
import CurveEdge from '../../ui-component/custom/edges/CurveEdge';
import { Button } from '@mui/material';
import RiskTreatmentTable from '../../ui-component/Table/RiskTreatmentTable';
import SaveIcon from '@mui/icons-material/Save';
import RestoreIcon from '@mui/icons-material/Restore';
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
  model: state.model,
  getModels: state.getModels,
  getModelById: state.getModelById,
  update: state.updateAssets,
  getAssets: state.getAssets,
  getGroupedNodes: state.getGroupedNodes,
  reactFlowInstance: state.reactFlowInstance,
  setReactFlowInstance: state.setReactFlowInstance,
  fitView: state.fitView,
  undo: state.undo,
  redo: state.redo,
  undoStack: state.undoStack,
  redoStack: state.redoStack,
  assets: state.assets
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
  markerStart: {
    type: MarkerType.ArrowClosed,
    orient: 'auto-start-reverse',
    width: 20,
    height: 20,
    color: 'black'
  },
  animated: false,
  style: {
    stroke: 'grey',
    start: false,
    end: true
  },
  data: {
    label: 'edge'
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

const CustomStepEdge = (props) => {
  return <StepEdge {...props} />;
};

const edgeTypes = {
  custom: CustomEdge,
  // step: CurveEdge
  step: CustomStepEdge
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
    getModelById,
    model,
    getModels,
    getGroupedNodes,
    reactFlowInstance,
    setReactFlowInstance,
    fitView,
    undo,
    redo,
    undoStack,
    redoStack,
    assets,
    update,
    getAssets
  } = useStore(selector, shallow);
  const { id } = useParams();
  const dispatch = useDispatch();
  // const { setTransform } = useReactFlow();
  const Color = ColorTheme();
  // const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [openTemplate, setOpenTemplate] = useState(false);
  const [savedTemplate, setSavedTemplate] = useState({});
  const [selectedElement, setSelectedElement] = useState({});
  const [open, setOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');
  const dragRef = useRef(null);
  const [groupList, setGroupList] = useState([]);
  const reactFlowWrapper = useRef(null);
  const { propertiesTabOpen, addNodeTabOpen } = useSelector((state) => state?.canvas);
  const {
    isDsTableOpen,
    isTsTableOpen,
    isAttackTreeOpen,
    isCyberBlockOpen,
    isCyberTableOpen,
    isRightDrawerOpen,
    isLeftDrawerOpen,
    isDerivationTableOpen,
    isAttackTableOpen,
    isRiskTableOpen
  } = useSelector((state) => state?.currentId);

  useEffect(() => {
    // console.log('initial');
    setNodes([]);
    setEdges([]);
  }, [!isAttackTreeOpen]);

  // console.log('redoStack', redoStack);
  // console.log('undoStack', undoStack);
  // console.log('isAttackTreeOpen', isAttackTreeOpen);
  // console.log('assets', assets);
  useEffect(() => {
    const template = assets?.template;
    setSavedTemplate(template);
    onSaveInitial(template);
    // setTimeout(() => {
    onRestore(template);

    // }, 100);
  }, [assets, !isAttackTreeOpen]);

  console.log('nodes', nodes);
  useEffect(() => {
    if (reactFlowInstance) {
      reactFlowInstance.fitView({ padding: 0.2, includeHiddenNodes: true, minZoom: 0.5, maxZoom: 1.5, duration: 500 });
    }
  }, [reactFlowInstance, nodes?.length]);

  const onInit = (rf) => {
    setReactFlowInstance(rf);
  };

  // Capture Ctrl + S for saving
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Check if Ctrl or Cmd key is pressed along with S
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault(); // Prevent the default save behavior
        handleSaveToModel(); // Trigger the save action
      }
    };

    // Add the event listener when the component mounts
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup the event listener when the component unmounts
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [nodes, edges]); // Re-run this effect if nodes or edges change

  // console.log('reactFlowInstance', reactFlowInstance);
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
    const [intersectingNodesMap, nodes] = getGroupedNodes();
    let values = Object.values(intersectingNodesMap).flat();
    // console.log('nodes in', nodes);

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
    getGroupedNodes();
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
      const group = event.dataTransfer.getData('application/group');
      const dragItem = event.dataTransfer.getData('application/dragItem');
      const parsedDragItem = dragItem ? JSON.parse(dragItem) : null;
      let parsedNode;
      let parsedTemplate;
      let parsedNodeItem;
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY
      });

      const dropType = parsedDragItem ? 'dragItem' : file ? 'file' : group ? 'group' : 'template';

      switch (dropType) {
        case 'dragItem':
          parsedNodeItem = parsedDragItem;
          break;
        case 'file':
          parsedNode = JSON.parse(file);
          break;
        case 'group':
          createGroup(position);
          break;
        case 'template':
          parsedTemplate = JSON.parse(template);
          break;
        default:
          console.error('Unsupported drop type');
      }

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
              backgroundColor: parsedNode?.data?.style?.backgroundColor ?? '#dadada',
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

      if (parsedNodeItem) {
        const newNode = {
          id: parsedNodeItem.id,
          type: parsedNodeItem.type,
          position,
          data: {
            label: parsedNodeItem.name,
            nodeId: parsedNodeItem.nodeId,
            style: {
              backgroundColor: parsedNodeItem?.data?.style?.backgroundColor ?? '#dadada',
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
          properties: parsedNodeItem.props || []
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
  // console.log('nodes', nodes);
  // console.log('edges', edges);

  const RefreshAPI = () => {
    getAssets(model?._id);
  };

  // console.log('model?._id', model?._id);

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
      // console.log('temp', temp);
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

  const handleSaveToModel = () => {
    // model - id,
    //   template
    const template = {
      nodes: nodes,
      edges: edges
    };
    const details = {
      'model-id': model?._id,
      template: JSON.stringify(template),
      assetId: assets?._id
    };

    update(details)
      .then((res) => {
        if (res) {
          // setTimeout(() => {
          setOpen(true);
          setMessage('Saved Successfully');
          setSuccess(true);
          handleClose();
          RefreshAPI();
          // }, 500);
        }
      })
      .catch((err) => {
        console.log('err', err);
        setOpen(true);
        setSuccess(false);
        setMessage('Something went wrong');
      });
  };

  // const toggleDrawerOpen = (tab) => dispatch(drawerOpen(tab));
  // const toggleDrawerClose = () => dispatch(drawerClose());
  // const toggleLeftDrawerOpen = () => dispatch(leftDrawerOpen());
  // const toggleLeftDrawerClose = () => dispatch(leftDrawerClose());
  const onLoad = (reactFlowInstance) => {
    // console.log('reactFlowInstance', reactFlowInstance);
    setReactFlowInstance(reactFlowInstance);
    fitView(nodes);
  };
  const handleSidebarOpen = (e, node) => {
    // console.log('e', e);
    // console.log('node', node);
    e.preventDefault();
    if (node.type !== 'group') {
      dispatch(OpenPropertiesTab());
      setSelectedElement(node);
      dispatch(setSelectedBlock(node));
      // toggleDrawerOpen('MainCanvasTab');
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
      setSelectedElement(node);
      dispatch(setSelectedBlock(node));
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
    if (!e.x) {
      e.preventDefault();
    }
    const newNode = {
      id: uid(),
      type: 'group',
      height: 300,
      width: 300,
      position: {
        x: e.x ?? e.clientX,
        y: e.y ?? e.clientY
      },
      data: {
        label: 'group',
        style: {
          height: 300,
          width: 300
        }
      }
    };
    dragAdd(newNode);
  };
  // console.log('isRightDrawerOpen', isRightDrawerOpen);

  // console.log('nodes', nodes);
  if (isDsTableOpen) return <DsTable />;
  if (isDerivationTableOpen) return <DsDerivationTable />;
  if (isTsTableOpen) return <Tstable />;
  if (isAttackTreeOpen) return <AttackTree model={model} />;
  if (isCyberBlockOpen) return <CyberSecurityBlock />;
  if (isCyberTableOpen) return <CyberSecurityTable />;
  if (isAttackTableOpen) return <AttackTreeTable />;
  if (isRiskTableOpen) return <RiskTreatmentTable />;

  return (
    <>
      <div style={{ width: '100%', height: '100%', boxShadow: '0px 0px 5px gray', background: 'white' }} ref={reactFlowWrapper}>
        {propertiesTabOpen && (
          <Header
            selectedElement={selectedElement}
            nodes={nodes}
            setNodes={setNodes}
            setSelectedElement={setSelectedElement}
            horizontal={() => onLayout({ direction: 'RIGHT' })}
            vertical={() => onLayout({ direction: 'DOWN' })}
            handleClear={handleClear}
            handleSave={handleSaveToModel}
            download={handleDownload}
            createGroup={createGroup}
          />
        )}
        <ReactFlowProvider fitView>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodetypes}
            edgeTypes={edgeTypes}
            onInit={onInit}
            onLoad={onLoad}
            onNodeDrag={onNodeDrag}
            onNodeDragStart={onNodeDragStart}
            onNodeDragStop={onNodeDragStop}
            connectionLineStyle={connectionLineStyle}
            defaultEdgeOptions={edgeOptions}
            onDrop={onDrop}
            onDragOver={onDragOver}
            fitView
            connectionMode="loose"
            onNodeDoubleClick={handleSidebarOpen}
            onNodeClick={handleSelectNode}
            defaultPosition={[0, 0]}
            defaultZoom={1}
            // onContextMenu={createGroup}
            // onNodeContextMenu={handleSidebarOpen}
            // onEdgeContextMenu={handleSidebarOpen}
          >
            <Panel position="left" style={{ display: 'flex', gap: 10 }}>
              <Button variant="outlined" onClick={() => onRestore(assets?.template)} startIcon={<RestoreIcon />}>
                Restore
              </Button>
              <Button variant="outlined" startIcon={<SaveIcon />} onClick={handleSaveToModel}>
                Save
              </Button>
              {/* <button onClick={undo} disabled={undoStack.length === 0}>
                Undo
              </button>
              <button onClick={redo} disabled={redoStack.length === 0}>
                Redo
              </button> */}
            </Panel>
            <Controls />
            <MiniMap zoomable pannable style={{ background: Color.canvasBG }} />
            <Background variant="dots" gap={12} size={1} style={{ backgroundColor: Color?.canvasBG }} />
            {/* <LeftDrawer state={isLeftDrawerOpen} drawerOpen={toggleLeftDrawerOpen} drawerClose={toggleLeftDrawerClose} /> */}
            {(propertiesTabOpen || addNodeTabOpen) && <RightDrawer />}
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
