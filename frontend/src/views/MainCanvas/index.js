/* eslint-disable */
import React, { useState, useCallback, useEffect, useRef } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  ReactFlowProvider,
  getRectOfNodes,
  getTransformForBounds,
  MarkerType,
  Panel,
  useReactFlow
} from 'reactflow';
import '../index.css';
import 'reactflow/dist/style.css';
import { v4 as uid } from 'uuid';
import { CustomEdge } from '../../ui-component/custom';
import useStore from '../../Zustand/store';
import { shallow } from 'zustand/shallow';
import { toPng } from 'html-to-image';
import AddLibrary from '../../ui-component/Modal/AddLibrary';
import { useDispatch, useSelector } from 'react-redux';
import RightDrawer from '../../layout/MainLayout/RightSidebar';
import AlertMessage from '../../ui-component/Alert';
import Header from '../../ui-component/Header';
import { setProperties } from '../../store/slices/PageSectionSlice';
import ColorTheme from '../../store/ColorTheme';
import { pageNodeTypes, style } from '../../utils/Constraints';
import { OpenPropertiesTab, setSelectedBlock, setDetails, setAnchorEl } from '../../store/slices/CanvasSlice';
import StepEdge from '../../ui-component/custom/edges/StepEdge';
import { Button, Tooltip, Typography } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import RestoreIcon from '@mui/icons-material/Restore';
import toast, { Toaster } from 'react-hot-toast';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import EditProperties from '../../ui-component/Poppers/EditProperties';
import GridOnIcon from '@mui/icons-material/GridOn';

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
  setInitialNodes: state.setInitialNodes,
  setInitialEdges: state.setInitialEdges,
  selectedNodes: state.selectedNodes,
  setSelectedNodes: state.setSelectedNodes,
  model: state.model,
  update: state.updateAssets,
  getAssets: state.getAssets,
  getDamageScenarios: state.getDamageScenarios,
  getGroupedNodes: state.getGroupedNodes,
  reactFlowInstance: state.reactFlowInstance,
  setReactFlowInstance: state.setReactFlowInstance,
  fitView: state.fitView,
  undo: state.undo,
  redo: state.redo,
  undoStack: state.undoStack,
  redoStack: state.redoStack,
  assets: state.assets,
  isNodePasted: state.isNodePasted,
  setIsNodePasted: state.setIsNodePasted
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
    strokeWidth: 2,
    stroke: 'grey',
    start: false,
    end: true
  },
  data: {
    label: 'edge'
  }
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
    setInitialNodes,
    setInitialEdges,
    selectedNodes,
    setSelectedNodes,
    model,
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
    getAssets,
    getDamageScenarios,
    isNodePasted,
    setIsNodePasted
  } = useStore(selector, shallow);
  const dispatch = useDispatch();
  // const { setTransform } = useReactFlow();

  const Color = ColorTheme();
  // const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [openTemplate, setOpenTemplate] = useState(false);
  const [savedTemplate, setSavedTemplate] = useState({});
  const [nodeTypes, setNodeTypes] = useState({});
  const [selectedElement, setSelectedElement] = useState({});
  const [open, setOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');
  const dragRef = useRef(null);
  const [groupList, setGroupList] = useState([]);
  const reactFlowWrapper = useRef(null);
  const { propertiesTabOpen, addNodeTabOpen, details, anchorEl, isHeaderOpen } = useSelector((state) => state?.canvas);
  const anchorElId = anchorEl?.includes('reactflow__edge')
    ? document.querySelector(`[data-testid="${anchorEl}"]`)
    : document.querySelector(`[data-id="${anchorEl}"]`) || null;
  const [copiedNode, setCopiedNode] = useState([]);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0 });
  const notify = (message, status) => toast[status](message);
  const [isReady, setIsReady] = useState(false);
  // const [anchorEl, setAnchorEl] = useState(null);
  const [isPopperFocused, setIsPopperFocused] = useState(false);
  // const [details, setDetails] = useState({
  //   name: '',
  //   properties: [],
  //   isAsset: false
  // });

  const handleClear = () => {
    setNodes([]);
    setEdges([]);
  };

  useEffect(() => {
    const newNodeTypes = pageNodeTypes['maincanvas'] || {};
    setNodeTypes(newNodeTypes);
    setNodes([]);
    setEdges([]);
    setTimeout(() => setIsReady(true), 0);
  }, []);

  useEffect(() => {
    const template = assets?.template;
    setSavedTemplate(template);
    onSaveInitial(template);
    onRestore(template);
  }, [assets]);

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

  const checkForNodes = () => {
    const [intersectingNodesMap, nodes] = getGroupedNodes();
    let values = Object.values(intersectingNodesMap).flat();
    let updated = nodes.map((item1) => {
      const match = values.find((item2) => item2.id === item1.id);
      return match ? match : item1;
    });
    setNodes(updated);
  };

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
              ...style
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
              ...style
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
                ...style
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

  const RefreshAPI = () => {
    getAssets(model?._id);
    getDamageScenarios(model?._id);
  };

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
        setInitialNodes(temp.nodes);
        setInitialEdges(temp.edges);
      } else {
        handleClear();
      }
    },
    [reactFlowInstance, assets]
  );

  const handleSaveToModel = () => {
    // model - id,
    //   template
    const template = {
      nodes: nodes,
      edges: edges
    };
    nodes.forEach((node) => {
      if (node.isCopied == true) {
        node.isCopied = false;
      }
    });
    setIsNodePasted(false);
    const details = {
      'model-id': model?._id,
      template: JSON.stringify(template),
      assetId: assets?._id
    };

    update(details)
      .then((res) => {
        if (res) {
          // setTimeout(() => {
          notify('Saved Successfully', 'success');
          handleClose();
          RefreshAPI();
          // }, 500);
        }
      })
      .catch((err) => {
        notify('Something went wrong', 'error');
      });
  };

  const onLoad = (reactFlowInstance) => {
    setReactFlowInstance(reactFlowInstance);
    fitView(nodes);
  };

  // console.log('selectedNodes', selectedNodes);
  const handleSelectNode = (e, node) => {
    e.stopPropagation(); // Prevent event bubbling

    let newSelectedNodes;

    if (e.shiftKey) {
      // Add to selection or remove if already selected
      newSelectedNodes = selectedNodes.includes(node.id)
        ? selectedNodes.filter((id) => id !== node.id) // Deselect if already selected
        : [...selectedNodes, node.id]; // Add to selection
    } else {
      // Select only this node (deselect others)
      newSelectedNodes = selectedNodes.includes(node.id) ? [] : [node.id];
    }

    setSelectedNodes(newSelectedNodes); // Update state
    // console.log('Updated Selection:', newSelectedNodes); // Debugging if needed
    // Update node details if not a group
    if (node.type !== 'group') {
      dispatch(setSelectedBlock(node));
      setSelectedElement(node);
      dispatch(
        setDetails({
          ...details,
          name: node?.data?.label ?? '',
          properties: node?.properties ?? [],
          isAsset: node.isAsset ?? false
        })
      );
    }
  };

  // console.log('nodes', nodes);

  const handleClosePopper = () => {
    if (!isPopperFocused) {
      // setAnchorEl(null);
      dispatch(setAnchorEl(null));
    }
  };

  const handleSelectEdge = (e, edge) => {
    e.stopPropagation();
    e.preventDefault();
    // setAnchorEl(e.currentTarget);
    // console.log('e.currentTarget', e.currentTarget);
    dispatch(setAnchorEl(e.currentTarget.getAttribute('data-testid')));
    dispatch(setSelectedBlock(edge));
    setSelectedElement(edge);
    dispatch(
      setDetails({
        ...details,
        name: edge?.data?.label ?? '',
        properties: edge?.properties ?? [],
        isAsset: edge.isAsset ?? false
      })
    );
  };

  const handleSaveEdit = (e) => {
    e.stopPropagation();
    const template = {
      nodes: nodes,
      edges: edges
    };
    const details = {
      assetId: assets?._id,
      'model-id': model?._id,
      template: JSON.stringify(template)
    };
    update(details)
      .then(() => {
        notify('Updated Successfully', 'success');
        RefreshAPI();
      })
      .catch(() => {
        notify('Something went wrong', 'error');
      });
  };
  // console.log('selectedElement', selectedElement);
  // console.log('nodes', nodes);
  const createGroup = (e) => {
    if (!e.x) {
      e.preventDefault();
    }
    const newNode = {
      id: uid(),
      type: 'group',
      position: {
        x: e.x ?? e.clientX,
        y: e.y ?? e.clientY
      },
      data: {
        label: 'group',
        style: {
          height: '200px',
          width: '200px'
        }
      },
      height: 200,
      width: 200
    };
    dragAdd(newNode);
  };

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
    // const copiedNodes = JSON.parse(localStorage.getItem('copiedNode'));
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
      if (Array.isArray(copiedNode) && copiedNode.length > 0) {
        copiedNode.forEach((node) => {
          const newNode = {
            ...node,
            id: uid(),
            isCopied: true,
            position: {
              x: contextMenu.x - 100,
              y: contextMenu.y - 50
            },
            selected: false
          };

          const nodetoPaste = [...nodes, newNode];
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

  const handleGroupDrag = (event) => {
    const parseFile = JSON.stringify('');
    event.dataTransfer.setData('application/group', parseFile);
    event.dataTransfer.effectAllowed = 'move';
  };

  const onSelectionClick = useCallback((e, selectedNodes) => {
    if (!selectedNodes || selectedNodes.length === 0) return;

    // Calculate the bounding box of selected nodes
    const minX = Math.min(...selectedNodes.map((n) => n.position.x));
    const minY = Math.min(...selectedNodes.map((n) => n.position.y));
    const maxX = Math.max(...selectedNodes.map((n) => n.position.x + n.width));
    const maxY = Math.max(...selectedNodes.map((n) => n.position.y + n.height));

    const groupWidth = maxX - minX;
    const groupHeight = maxY - minY;
    const additionalWidth = 50;
    const additionalHeight = 70;

    const newNode = {
      id: uid(),
      type: 'group',
      width: groupWidth + additionalWidth,
      height: groupHeight + additionalHeight,
      position: {
        x: minX - additionalWidth / 2, // Shift left by half of additionalValue
        y: minY - additionalHeight + 20 / 2 // Shift up by half of additionalValue
      },
      data: {
        label: 'group',
        style: {
          width: groupWidth + additionalWidth,
          height: groupHeight + additionalHeight
        }
      },
      children: selectedNodes.map((node) => node.id) // Optionally track children nodes
    };

    dragAdd(newNode);
    checkForNodes();
  }, []);
  // console.log('edges', edges);

  if (!isReady) return null;

  return (
    <>
      <div
        style={{ width: '100%', height: '100%', boxShadow: '0px 0px 5px gray', background: 'white' }}
        ref={reactFlowWrapper}
        onContextMenu={handleCanvasContextMenu}
        // onClick={() => dispatch(setSelectedBlock({}))}
      >
        {/* {isHeaderOpen && ( */}
        <Header
          selectedElement={selectedElement}
          nodes={nodes}
          setNodes={setNodes}
          setSelectedElement={setSelectedElement}
          // horizontal={() => onLayout({ direction: 'RIGHT' })}
          // vertical={() => onLayout({ direction: 'DOWN' })}
          handleClear={handleClear}
          handleSave={handleSaveToModel}
          download={handleDownload}
          createGroup={createGroup}
          dispatch={dispatch}
        />
        {/* )} */}
        <ReactFlowProvider fitView>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
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
            onClick={() => dispatch(setSelectedBlock({}))}
            fitView
            connectionMode="loose"
            selectionMode="partial"
            multiSelectionKeyCode="Shift"
            onSelectionContextMenu={onSelectionClick}
            // onPaneClick={onSelectionChange}
            // onNodeDoubleClick={handleSelectNode}
            onNodeClick={handleSelectNode}
            onEdgeContextMenu={handleSelectEdge}
            // onEdgeClick={handleSelectEdge}
            defaultposition={[0, 0]}
            defaultzoom={1}
            onNodeContextMenu={handleNodeContextMenu}
          >
            <Panel position="left" style={{ display: 'flex', gap: 10 }}>
              <Button variant="outlined" onClick={() => onRestore(assets?.template)} startIcon={<RestoreIcon />}>
                Restore
              </Button>
              <Button variant="outlined" startIcon={<SaveIcon />} onClick={handleSaveToModel}>
                Save
              </Button>
              <React.Fragment>
                <Tooltip title="Grouping">
                  <Typography
                    sx={{ color: Color?.iconColor, alignSelf: 'end' }}
                    // onClick={item?.onclick()}
                    onDragStart={(e) => handleGroupDrag(e)}
                    draggable={true}
                  >
                    <GridOnIcon />
                  </Typography>
                </Tooltip>
              </React.Fragment>
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
            {/* <LeftDrawer state={isLeftDrawerOpen} draweropen={toggleLeftDrawerOpen} drawerClose={toggleLeftDrawerClose} /> */}
            {(propertiesTabOpen || addNodeTabOpen) && <RightDrawer />}
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
        {anchorEl && (
          <EditProperties
            anchorEl={anchorElId}
            handleSaveEdit={handleSaveEdit}
            handleClosePopper={handleClosePopper}
            setDetails={setDetails}
            details={details}
            dispatch={dispatch}
            setIsPopperFocused={setIsPopperFocused}
            edges={edges}
            setEdges={setEdges}
            nodes={nodes}
            setNodes={setNodes}
            selectedElement={selectedElement}
          />
        )}
        {openTemplate && (
          <AddLibrary open={openTemplate} handleClose={handleClose} savedTemplate={savedTemplate} setNodes={setNodes} setEdges={setEdges} />
        )}

        <AlertMessage open={open} message={message} setOpen={setOpen} success={success} />
      </div>
    </>
  );
}
