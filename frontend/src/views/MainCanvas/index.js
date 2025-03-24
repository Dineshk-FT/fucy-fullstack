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
import ColorTheme from '../../store/ColorTheme';
import { pageNodeTypes, style } from '../../utils/Constraints';
import {
  OpenPropertiesTab,
  setSelectedBlock,
  setDetails,
  setEdgeDetails,
  setAnchorEl,
  clearAnchorEl
} from '../../store/slices/CanvasSlice';
import StepEdge from '../../ui-component/custom/edges/StepEdge';
import { Button, Tooltip, Typography, IconButton, Box, Zoom } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import RestoreIcon from '@mui/icons-material/Restore';
import toast, { Toaster } from 'react-hot-toast';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import EditNode from '../../ui-component/Poppers/EditNode';
import GridOnIcon from '@mui/icons-material/GridOn';
import EditEdge from '../../ui-component/custom/edges/EditEdge';
import EditProperties from '../../ui-component/Poppers/EditProperties';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import FitScreenIcon from '@mui/icons-material/FitScreen';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import DownloadIcon from '@mui/icons-material/Download';

// Define the selector function for Zustand
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
  setIsNodePasted: state.setIsNodePasted,
  selectedElement: state.selectedElement,
  setSelectedElement: state.setSelectedElement,
  setSaveModal: state.setSaveModal,
  isPropertiesOpen: state.isPropertiesOpen,
  setPropertiesOpen: state.setPropertiesOpen
});

// Edge line styling
const connectionLineStyle = {
  stroke: '#64B5F6',
  strokeWidth: 2,
  strokeDasharray: '5,5'
};

const edgeOptions = {
  type: 'step',
  markerEnd: {
    type: MarkerType.ArrowClosed,
    width: 18,
    height: 18,
    color: '#64B5F6'
  },
  markerStart: {
    type: MarkerType.ArrowClosed,
    orient: 'auto-start-reverse',
    width: 18,
    height: 18,
    color: '#64B5F6'
  },
  animated: true,
  style: {
    strokeWidth: 2,
    stroke: '#808080',
    start: false,
    end: true,
    strokeDasharray: '0'
  },
  data: {
    label: 'edge',
    style: {
      background: 'rgba(255, 255, 255, 0.8)',
      borderRadius: '4px',
      padding: '2px 4px',
      fontFamily: "'Poppins', sans-serif",
      fontSize: '12px',
      color: '#333333'
    }
  }
};

const CustomStepEdge = (props) => {
  return <StepEdge {...props} />;
};

const edgeTypes = {
  custom: CustomEdge,
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
    setIsNodePasted,
    selectedElement,
    setSelectedElement,
    setSaveModal,
    isPropertiesOpen,
    setPropertiesOpen,
    isDark
  } = useStore(selector, shallow);

  const dispatch = useDispatch();
  const Color = ColorTheme();
  // const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [openTemplate, setOpenTemplate] = useState(false);
  const [savedTemplate, setSavedTemplate] = useState({});
  const [nodeTypes, setNodeTypes] = useState({});
  // const [selectedElement, setSelectedElement] = useState({});
  const dragRef = useRef(null);
  const reactFlowWrapper = useRef(null);
  const { propertiesTabOpen, addNodeTabOpen, details, edgeDetails, anchorEl, isHeaderOpen, selectedBlock } = useSelector(
    (state) => state?.canvas
  );
  const anchorElNodeId = document.querySelector(`[data-id="${anchorEl?.node}"]`) || null;
  const anchorElEdgeId = document.querySelector(`[data-testid="${anchorEl?.edge}"]`) || null;

  // console.log('anchorEl', anchorEl);
  const [copiedNode, setCopiedNode] = useState([]);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0 });
  const [isReady, setIsReady] = useState(false);
  const [isPopperFocused, setIsPopperFocused] = useState(false);
  const nodesRef = useRef(nodes);
  const edgesRef = useRef(edges);
  const { zoomIn, zoomOut, fitView: fitCanvasView } = useReactFlow();
  const [zoomLevel, setZoomLevel] = useState(1);

  useEffect(() => {
    nodesRef.current = nodes;
    edgesRef.current = edges;
  }, [nodes, edges]);

  const handleClear = () => {
    setNodes([]);
    setEdges([]);
    notify('Canvas cleared', 'success');
  };

  const handleSaveToModel = () => {
    const template = {
      nodes: nodesRef.current,
      edges: edgesRef.current
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
        if (!res.error) {
          notify('Saved Successfully', 'success');
          handleClose();
          RefreshAPI();
        } else {
          notify(res.error ?? 'Something went wrong', 'error');
        }
      })
      .catch((err) => {
        notify('Something went wrong', 'error');
      });
  };

  useEffect(() => {
    return () => {
      handleSaveToModel();
    };
  }, []);

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
      reactFlowInstance.fitView({ padding: 0.2, includeHiddenNodes: true, minZoom: 0.5, maxZoom: 2, duration: 500 });
      setZoomLevel(reactFlowInstance.getZoom());
    }
  }, [reactFlowInstance, nodes?.length]);

  const onInit = (rf) => {
    setReactFlowInstance(rf);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        handleSaveToModel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nodes, edges]);

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
    checkForNodes();
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

  function downloadImage(dataUrl) {
    const a = document.createElement('a');
    a.setAttribute('download', 'canvas-diagram.png');
    a.setAttribute('href', dataUrl);
    a.click();
  }

  const imageWidth = 1920;
  const imageHeight = 1080;

  const handleDownload = () => {
    const nodesBounds = getRectOfNodes(nodes);
    const transform = getTransformForBounds(nodesBounds, imageWidth, imageHeight, 0.5, 2);

    toPng(document.querySelector('.react-flow__viewport'), {
      backgroundColor: isDark == true ? '#1E1E1E' : '#F5F5F5',
      width: imageWidth,
      height: imageHeight,
      style: {
        width: imageWidth,
        height: imageHeight,
        transform: `translate(${transform[0]}px, ${transform[1]}px) scale(${transform[2]})`
      }
    }).then(downloadImage);
  };

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
              borderRadius: '8px',
              boxShadow: isDark == true ? '0 2px 6px rgba(0,0,0,0.4)' : '0 2px 6px rgba(0,0,0,0.1)',
              fontFamily: "'Poppins', sans-serif",
              fontSize: '14px',
              padding: '8px 12px',
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
              borderRadius: '8px',
              boxShadow: isDark == true ? '0 2px 6px rgba(0,0,0,0.4)' : '0 2px 6px rgba(0,0,0,0.1)',
              fontFamily: "'Poppins', sans-serif",
              fontSize: '14px',
              padding: '8px 12px',
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
                borderRadius: '8px',
                boxShadow: isDark == true ? '0 2px 6px rgba(0,0,0,0.4)' : '0 2px 6px rgba(0,0,0,0.1)',
                fontFamily: "'Poppins', sans-serif",
                fontSize: '14px',
                padding: '8px 12px',
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
    setSaveModal(false);
    getAssets(model?._id).catch((err) => {
      notify('Failed to fetch assets: ' + err.message, 'error');
    });
    getDamageScenarios(model?._id).catch((err) => {
      notify('Failed to fetch damage scenarios: ' + err.message, 'error');
    });
  };

  const handleCloseSave = () => {
    setSaveModal(false);
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

  const onLoad = (reactFlowInstance) => {
    setReactFlowInstance(reactFlowInstance);
    fitView(nodes);
  };

  const handleSelectNode = (e, node) => {
    e.stopPropagation();
    if (node.type !== 'group') {
      dispatch(setAnchorEl({ type: 'node', value: node?.id }));
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

  const handleSelectNodeSingleClick = (e, node) => {
    e.stopPropagation();
    if (e.shiftKey) {
      setSelectedNodes((prevSelectedNodes) => {
        const isAlreadySelected = prevSelectedNodes.some((snode) => snode.id === node.id);
        return isAlreadySelected ? prevSelectedNodes.filter((snode) => snode.id !== node.id) : [...prevSelectedNodes, node];
      });
    }
    if (node.type !== 'group') {
      dispatch(setSelectedBlock(node));
      setSelectedElement(node);
    }
  };

  const handleSelectEdgeSingleClick = (e, edge) => {
    e.stopPropagation(); // Prevent event bubbling
    dispatch(setSelectedBlock(edge));
    setSelectedElement(edge);
  };
  // console.log('nodes', nodes);
  // console.log('selectedNodes', selectedNodes);
  const handleClosePopper = () => {
    if (!isPopperFocused) {
      dispatch(clearAnchorEl());
    }
  };

  const handleSelectEdge = (e, edge) => {
    e.stopPropagation();
    e.preventDefault();
    dispatch(setAnchorEl({ type: 'edge', value: e.currentTarget.getAttribute('data-testid') }));
    dispatch(setSelectedBlock(edge));
    setSelectedElement(edge);
    dispatch(
      setEdgeDetails({
        ...details,
        name: edge?.data?.label ?? '',
        properties: edge?.properties ?? [],
        isAsset: edge.isAsset ?? false,
        style: edge.data.style ?? {},
        startPoint: edge.markerStart.color ?? '#64B5F6',
        endPoint: edge.markerEnd?.color ?? '#64B5F6'
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
        label: 'Group',
        style: {
          height: 200,
          width: 200,
          background: isDark == true ? 'rgba(100,181,246,0.1)' : 'rgba(33,150,243,0.05)',
          border: `1px dashed ${isDark == true ? '#64B5F6' : '#2196F3'}`,
          borderRadius: '8px',
          boxShadow: isDark == true ? '0 2px 6px rgba(0,0,0,0.4)' : '0 2px 6px rgba(0,0,0,0.1)'
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
      setCopiedNode(nodeToCopy);
      notify('Node copied!', 'success');
    }

    if (option === 'Paste') {
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
      } else {
        console.error('No valid copied node found');
      }
    }

    setContextMenu({ visible: false, x: 0, y: 0 });
  };

  // const removeSelectedBlock = () => {
  //   // console.log('selectedBlock', selectedBlock);
  //   if (!selectedBlock?.id) return;

  //   if (nodes.some((node) => node.id === selectedBlock.id)) {
  //     setNodes((prevNodes) => prevNodes.filter((node) => node.id !== selectedBlock.id));
  //   } else if (edges.some((edge) => edge.id === selectedBlock.id)) {
  //     setEdges((prevEdges) => prevEdges.filter((edge) => edge.id !== selectedBlock.id));
  //   }
  // };
  useEffect(() => {
    const handleGlobalEvents = (event) => {
      if (event.type === 'click') {
        setContextMenu({ visible: false, x: 0, y: 0 });
      } else if (event.type === 'keydown') {
        if (event.key === 'Escape') {
          dispatch(setSelectedBlock({})); // Deselect selected block
        }
        // else if (['Delete', 'Backspace'].includes(event.key)) {
        //   removeSelectedBlock(); // Remove selected block
        // }
      }
    };

    document.addEventListener('click', handleGlobalEvents);
    document.addEventListener('keydown', handleGlobalEvents);

    return () => {
      document.removeEventListener('click', handleGlobalEvents);
      document.removeEventListener('keydown', handleGlobalEvents);
    };
  }, []);

  const handleGroupDrag = (event) => {
    const parseFile = JSON.stringify('');
    event.dataTransfer.setData('application/group', parseFile);
    event.dataTransfer.effectAllowed = 'move';
  };

  const onSelectionClick = useCallback((e, selectedNodes) => {
    if (!selectedNodes || selectedNodes.length === 0) return;

    const minX = Math.min(...selectedNodes.map((n) => n.position.x));
    const minY = Math.min(...selectedNodes.map((n) => n.position.y));
    const maxX = Math.max(...selectedNodes.map((n) => n.position.x + (n.width || 100)));
    const maxY = Math.max(...selectedNodes.map((n) => n.position.y + (n.height || 100)));

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
        x: minX - additionalWidth / 2,
        y: minY - additionalHeight + 20 / 2
      },
      data: {
        label: 'Group',
        style: {
          width: groupWidth + additionalWidth,
          height: groupHeight + additionalHeight,
          background: isDark == true ? 'rgba(100,181,246,0.1)' : 'rgba(33,150,243,0.05)',
          border: `1px dashed ${isDark == true ? '#64B5F6' : '#2196F3'}`,
          borderRadius: '8px',
          boxShadow: isDark == true ? '0 2px 6px rgba(0,0,0,0.4)' : '0 2px 6px rgba(0,0,0,0.1)'
        }
      },
      children: selectedNodes.map((node) => node.id)
    };

    dragAdd(newNode);
    checkForNodes();
    setSelectedNodes([]);
  }, []);

  // console.log('anchorElNodeId', anchorElNodeId);
  const renderPopper = () => {
    if (anchorElNodeId) {
      return isPropertiesOpen ? (
        <EditProperties
          anchorEl={anchorElNodeId}
          handleSaveEdit={handleSaveEdit}
          handleClosePopper={() => {
            handleClosePopper();
            setPropertiesOpen(false);
          }}
          setDetails={setDetails}
          details={details}
          dispatch={dispatch}
          nodes={nodes}
          setNodes={setNodes}
          selectedElement={selectedElement}
          setSelectedElement={setSelectedElement}
        />
      ) : (
        <EditNode
          anchorEl={anchorElNodeId}
          handleSaveEdit={handleSaveEdit}
          handleClosePopper={handleClosePopper}
          setDetails={setDetails}
          details={details}
          dispatch={dispatch}
          nodes={nodes}
          setNodes={setNodes}
          selectedElement={selectedElement}
          setSelectedElement={setSelectedElement}
        />
      );
    }

    if (anchorElEdgeId) {
      return (
        <EditEdge
          anchorEl={anchorElEdgeId}
          handleSaveEdit={handleSaveEdit}
          handleClosePopper={handleClosePopper}
          setDetails={setEdgeDetails}
          details={edgeDetails}
          dispatch={dispatch}
          edges={edges}
          setEdges={setEdges}
        />
      );
    }

    return null;
  };

  const handleZoomIn = () => {
    zoomIn({ duration: 300 });
    setTimeout(() => setZoomLevel(reactFlowInstance.getZoom()), 300);
  };

  const handleZoomOut = () => {
    zoomOut({ duration: 300 });
    setTimeout(() => setZoomLevel(reactFlowInstance.getZoom()), 300);
  };

  const handleFitView = () => {
    fitCanvasView({ padding: 0.2, includeHiddenNodes: true, minZoom: 0.5, maxZoom: 2, duration: 500 });
    setTimeout(() => setZoomLevel(reactFlowInstance.getZoom()), 500);
  };

  const notify = (message, status) => toast[status](message);

  if (!isReady) return null;

  return (
    <>
      <div
        style={{
          width: '100%',
          height: '100%',
          background:
            isDark == true ? 'linear-gradient(145deg, #1E1E1E 0%, #121212 100%)' : 'linear-gradient(145deg, #F5F5F5 0%, #E0E0E0 100%)',
          boxShadow: isDark == true ? '0 4px 16px rgba(0,0,0,0.5)' : '0 4px 16px rgba(0,0,0,0.15)',
          borderRadius: '12px',
          overflow: 'hidden'
        }}
        ref={reactFlowWrapper}
        onContextMenu={handleCanvasContextMenu}
      >
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
            fitView
            connectionMode="loose"
            selectionMode="partial"
            multiSelectionKeyCode="Shift"
            onSelectionContextMenu={onSelectionClick}
            deleteKeyCode={['Delete', 'Backspace']}
            onNodeDoubleClick={handleSelectNode}
            onNodeClick={handleSelectNodeSingleClick}
            onEdgeClick={handleSelectEdgeSingleClick}
            onEdgeContextMenu={handleSelectEdge}
            defaultPosition={[0, 0]}
            defaultZoom={1}
            onNodeContextMenu={handleNodeContextMenu}
            minZoom={0.2}
            maxZoom={2}
          >
            <Panel position="top-left" style={{ display: 'flex', gap: 4, padding: '4px' }}>
              <Box
                sx={{
                  display: 'flex',
                  gap: 0.5,
                  background: Color.tabBorder,
                  backdropFilter: 'blur(4px)',
                  borderRadius: '6px',
                  padding: '2px 4px',
                  boxShadow: isDark == true ? '0 2px 6px rgba(0,0,0,0.4)' : '0 2px 6px rgba(0,0,0,0.1)'
                }}
              >
                <Tooltip title="Restore">
                  <IconButton
                    onClick={() => onRestore(assets?.template)}
                    sx={{
                      color: isDark == true ? '#64B5F6' : '#2196F3',
                      padding: '4px',
                      '&:hover': {
                        background:
                          isDark == true
                            ? 'linear-gradient(90deg, rgba(100,181,246,0.15) 0%, rgba(100,181,246,0.03) 100%)'
                            : 'linear-gradient(90deg, rgba(33,150,243,0.08) 0%, rgba(33,150,243,0.02) 100%)',
                        transform: 'scale(1.1)',
                        boxShadow: isDark == true ? '0 2px 6px rgba(0,0,0,0.4)' : '0 2px 6px rgba(0,0,0,0.1)',
                        filter:
                          isDark == true ? 'drop-shadow(0 0 6px rgba(100,181,246,0.25))' : 'drop-shadow(0 0 6px rgba(33,150,243,0.15))'
                      },
                      '&:focus': {
                        outline: `2px solid ${isDark == true ? '#64B5F6' : '#2196F3'}`,
                        outlineOffset: '2px'
                      }
                    }}
                    tabIndex={0}
                    aria-label="Restore canvas"
                  >
                    <RestoreIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Save">
                  <IconButton
                    onClick={handleSaveToModel}
                    sx={{
                      color: isDark == true ? '#64B5F6' : '#2196F3',
                      padding: '4px',
                      '&:hover': {
                        background:
                          isDark == true
                            ? 'linear-gradient(90deg, rgba(100,181,246,0.15) 0%, rgba(100,181,246,0.03) 100%)'
                            : 'linear-gradient(90deg, rgba(33,150,243,0.08) 0%, rgba(33,150,243,0.02) 100%)',
                        transform: 'scale(1.1)',
                        boxShadow: isDark == true ? '0 2px 6px rgba(0,0,0,0.4)' : '0 2px 6px rgba(0,0,0,0.1)',
                        filter:
                          isDark == true ? 'drop-shadow(0 0 6px rgba(100,181,246,0.25))' : 'drop-shadow(0 0 6px rgba(33,150,243,0.15))'
                      },
                      '&:focus': {
                        outline: `2px solid ${isDark == true ? '#64B5F6' : '#2196F3'}`,
                        outlineOffset: '2px'
                      }
                    }}
                    tabIndex={0}
                    aria-label="Save canvas"
                  >
                    <SaveIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Group Selected Nodes">
                  <IconButton
                    onClick={(e) => onSelectionClick(e, selectedNodes)}
                    onDragStart={(e) => handleGroupDrag(e)}
                    draggable={true}
                    sx={{
                      color: isDark == true ? '#64B5F6' : '#2196F3',
                      padding: '4px',
                      '&:hover': {
                        background:
                          isDark == true
                            ? 'linear-gradient(90deg, rgba(100,181,246,0.15) 0%, rgba(100,181,246,0.03) 100%)'
                            : 'linear-gradient(90deg, rgba(33,150,243,0.08) 0%, rgba(33,150,243,0.02) 100%)',
                        transform: 'scale(1.1)',
                        boxShadow: isDark == true ? '0 2px 6px rgba(0,0,0,0.4)' : '0 2px 6px rgba(0,0,0,0.1)',
                        filter:
                          isDark == true ? 'drop-shadow(0 0 6px rgba(100,181,246,0.25))' : 'drop-shadow(0 0 6px rgba(33,150,243,0.15))'
                      },
                      '&:focus': {
                        outline: `2px solid ${isDark == true ? '#64B5F6' : '#2196F3'}`,
                        outlineOffset: '2px'
                      }
                    }}
                    tabIndex={0}
                    aria-label="Group selected nodes"
                  >
                    <GridOnIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Undo">
                  <IconButton
                    onClick={undo}
                    disabled={undoStack.length === 0}
                    sx={{
                      color: undoStack.length === 0 ? (isDark == true ? '#616161' : '#B0BEC5') : isDark == true ? '#64B5F6' : '#2196F3',
                      padding: '4px',
                      '&:hover': {
                        background:
                          undoStack.length === 0
                            ? 'transparent'
                            : isDark == true
                            ? 'linear-gradient(90deg, rgba(100,181,246,0.15) 0%, rgba(100,181,246,0.03) 100%)'
                            : 'linear-gradient(90deg, rgba(33,150,243,0.08) 0%, rgba(33,150,243,0.02) 100%)',
                        transform: undoStack.length === 0 ? 'none' : 'scale(1.1)',
                        boxShadow:
                          undoStack.length === 0 ? 'none' : isDark == true ? '0 2px 6px rgba(0,0,0,0.4)' : '0 2px 6px rgba(0,0,0,0.1)',
                        filter:
                          undoStack.length === 0
                            ? 'none'
                            : isDark == true
                            ? 'drop-shadow(0 0 6px rgba(100,181,246,0.25))'
                            : 'drop-shadow(0 0 6px rgba(33,150,243,0.15))'
                      },
                      '&:focus': {
                        outline: undoStack.length === 0 ? 'none' : `2px solid ${isDark == true ? '#64B5F6' : '#2196F3'}`,
                        outlineOffset: '2px'
                      }
                    }}
                    tabIndex={0}
                    aria-label="Undo action"
                  >
                    <UndoIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Redo">
                  <IconButton
                    onClick={redo}
                    disabled={redoStack.length === 0}
                    sx={{
                      color: redoStack.length === 0 ? (isDark == true ? '#616161' : '#B0BEC5') : isDark == true ? '#64B5F6' : '#2196F3',
                      padding: '4px',
                      '&:hover': {
                        background:
                          redoStack.length === 0
                            ? 'transparent'
                            : isDark == true
                            ? 'linear-gradient(90deg, rgba(100,181,246,0.15) 0%, rgba(100,181,246,0.03) 100%)'
                            : 'linear-gradient(90deg, rgba(33,150,243,0.08) 0%, rgba(33,150,243,0.02) 100%)',
                        transform: redoStack.length === 0 ? 'none' : 'scale(1.1)',
                        boxShadow:
                          redoStack.length === 0 ? 'none' : isDark == true ? '0 2px 6px rgba(0,0,0,0.4)' : '0 2px 6px rgba(0,0,0,0.1)',
                        filter:
                          redoStack.length === 0
                            ? 'none'
                            : isDark == true
                            ? 'drop-shadow(0 0 6px rgba(100,181,246,0.25))'
                            : 'drop-shadow(0 0 6px rgba(33,150,243,0.15))'
                      },
                      '&:focus': {
                        outline: redoStack.length === 0 ? 'none' : `2px solid ${isDark == true ? '#64B5F6' : '#2196F3'}`,
                        outlineOffset: '2px'
                      }
                    }}
                    tabIndex={0}
                    aria-label="Redo action"
                  >
                    <RedoIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Download as PNG">
                  <IconButton
                    onClick={handleDownload}
                    sx={{
                      color: isDark == true ? '#64B5F6' : '#2196F3',
                      padding: '4px',
                      '&:hover': {
                        background:
                          isDark == true
                            ? 'linear-gradient(90deg, rgba(100,181,246,0.15) 0%, rgba(100,181,246,0.03) 100%)'
                            : 'linear-gradient(90deg, rgba(33,150,243,0.08) 0%, rgba(33,150,243,0.02) 100%)',
                        transform: 'scale(1.1)',
                        boxShadow: isDark == true ? '0 2px 6px rgba(0,0,0,0.4)' : '0 2px 6px rgba(0,0,0,0.1)',
                        filter:
                          isDark == true ? 'drop-shadow(0 0 6px rgba(100,181,246,0.25))' : 'drop-shadow(0 0 6px rgba(33,150,243,0.15))'
                      },
                      '&:focus': {
                        outline: `2px solid ${isDark == true ? '#64B5F6' : '#2196F3'}`,
                        outlineOffset: '2px'
                      }
                    }}
                    tabIndex={0}
                    aria-label="Download canvas as PNG"
                  >
                    <DownloadIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Panel>
            <Panel position="bottom-right" style={{ display: 'flex', gap: 4, padding: '4px' }}>
              <Box
                sx={{
                  display: 'flex',
                  gap: 0.5,
                  background: Color.tabBorder,
                  backdropFilter: 'blur(4px)',
                  borderRadius: '6px',
                  padding: '2px 4px',
                  boxShadow: isDark == true ? '0 2px 6px rgba(0,0,0,0.4)' : '0 2px 6px rgba(0,0,0,0.1)',
                  alignItems: 'center'
                }}
              >
                <Tooltip title="Zoom In">
                  <IconButton
                    onClick={handleZoomIn}
                    sx={{
                      color: isDark == true ? '#64B5F6' : '#2196F3',
                      padding: '4px',
                      '&:hover': {
                        background:
                          isDark == true
                            ? 'linear-gradient(90deg, rgba(100,181,246,0.15) 0%, rgba(100,181,246,0.03) 100%)'
                            : 'linear-gradient(90deg, rgba(33,150,243,0.08) 0%, rgba(33,150,243,0.02) 100%)',
                        transform: 'scale(1.1)',
                        boxShadow: isDark == true ? '0 2px 6px rgba(0,0,0,0.4)' : '0 2px 6px rgba(0,0,0,0.1)',
                        filter:
                          isDark == true ? 'drop-shadow(0 0 6px rgba(100,181,246,0.25))' : 'drop-shadow(0 0 6px rgba(33,150,243,0.15))'
                      },
                      '&:focus': {
                        outline: `2px solid ${isDark == true ? '#64B5F6' : '#2196F3'}`,
                        outlineOffset: '2px'
                      }
                    }}
                    tabIndex={0}
                    aria-label="Zoom in"
                  >
                    <ZoomInIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Zoom Out">
                  <IconButton
                    onClick={handleZoomOut}
                    sx={{
                      color: isDark == true ? '#64B5F6' : '#2196F3',
                      padding: '4px',
                      '&:hover': {
                        background:
                          isDark == true
                            ? 'linear-gradient(90deg, rgba(100,181,246,0.15) 0%, rgba(100,181,246,0.03) 100%)'
                            : 'linear-gradient(90deg, rgba(33,150,243,0.08) 0%, rgba(33,150,243,0.02) 100%)',
                        transform: 'scale(1.1)',
                        boxShadow: isDark == true ? '0 2px 6px rgba(0,0,0,0.4)' : '0 2px 6px rgba(0,0,0,0.1)',
                        filter:
                          isDark == true ? 'drop-shadow(0 0 6px rgba(100,181,246,0.25))' : 'drop-shadow(0 0 6px rgba(33,150,243,0.15))'
                      },
                      '&:focus': {
                        outline: `2px solid ${isDark == true ? '#64B5F6' : '#2196F3'}`,
                        outlineOffset: '2px'
                      }
                    }}
                    tabIndex={0}
                    aria-label="Zoom out"
                  >
                    <ZoomOutIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Fit View">
                  <IconButton
                    onClick={handleFitView}
                    sx={{
                      color: isDark == true ? '#64B5F6' : '#2196F3',
                      padding: '4px',
                      '&:hover': {
                        background:
                          isDark == true
                            ? 'linear-gradient(90deg, rgba(100,181,246,0.15) 0%, rgba(100,181,246,0.03) 100%)'
                            : 'linear-gradient(90deg, rgba(33,150,243,0.08) 0%, rgba(33,150,243,0.02) 100%)',
                        transform: 'scale(1.1)',
                        boxShadow: isDark == true ? '0 2px 6px rgba(0,0,0,0.4)' : '0 2px 6px rgba(0,0,0,0.1)',
                        filter:
                          isDark == true ? 'drop-shadow(0 0 6px rgba(100,181,246,0.25))' : 'drop-shadow(0 0 6px rgba(33,150,243,0.15))'
                      },
                      '&:focus': {
                        outline: `2px solid ${isDark == true ? '#64B5F6' : '#2196F3'}`,
                        outlineOffset: '2px'
                      }
                    }}
                    tabIndex={0}
                    aria-label="Fit view"
                  >
                    <FitScreenIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
                <Typography
                  sx={{
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: '11px',
                    fontWeight: 500,
                    color: isDark == true ? '#E0E0E0' : '#333333',
                    alignSelf: 'center',
                    padding: '0 6px'
                  }}
                >
                  {Math.round(zoomLevel * 100)}%
                </Typography>
              </Box>
            </Panel>
            <MiniMap
              zoomable
              pannable
              style={{
                width: 150,
                height: 100,
                background: Color.tabBorder,
                borderRadius: '6px',
                boxShadow: isDark == true ? '0 2px 6px rgba(0,0,0,0.4)' : '0 2px 6px rgba(0,0,0,0.1)',
                border: `1px solid ${isDark == true ? '#64B5F6' : '#2196F3'}`
              }}
              nodeColor={(node) => {
                switch (node.type) {
                  case 'group':
                    return isDark == true ? 'rgba(100,181,246,0.3)' : 'rgba(33,150,243,0.2)';
                  default:
                    return isDark == true ? '#64B5F6' : '#2196F3';
                }
              }}
            />
            <Background
              variant="dots"
              gap={16}
              size={1}
              style={{
                backgroundColor: Color?.canvasBG
              }}
              color={isDark == true ? '#424242' : '#B0BEC5'}
            />
            {(propertiesTabOpen || addNodeTabOpen) && <RightDrawer />}
          </ReactFlow>
        </ReactFlowProvider>
        {contextMenu.visible && (
          <Zoom in={contextMenu.visible}>
            <div
              style={{
                position: 'absolute',
                top: contextMenu.y,
                left: contextMenu.x,
                background: isDark == true ? 'rgba(30,30,30,0.95)' : 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(4px)',
                border: 'none',
                borderRadius: '6px',
                boxShadow: isDark == true ? '0 3px 10px rgba(0,0,0,0.5)' : '0 3px 10px rgba(0,0,0,0.15)',
                zIndex: 1000,
                width: '120px',
                padding: '6px 0',
                fontFamily: "'Poppins', sans-serif",
                fontSize: '13px',
                color: isDark == true ? '#E0E0E0' : '#333333'
              }}
            >
              {contextMenu.options.map((option) => (
                <div
                  key={option}
                  style={{
                    padding: '6px 12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    borderBottom:
                      contextMenu.options.length > 1
                        ? `1px solid ${isDark == true ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`
                        : 'none',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background:
                        isDark == true
                          ? 'linear-gradient(90deg, rgba(100,181,246,0.15) 0%, rgba(100,181,246,0.03) 100%)'
                          : 'linear-gradient(90deg, rgba(33,150,243,0.08) 0%, rgba(33,150,243,0.02) 100%)',
                      transform: 'scale(1.02)',
                      boxShadow: isDark == true ? '0 2px 6px rgba(0,0,0,0.4)' : '0 2px 6px rgba(0,0,0,0.1)'
                    }
                  }}
                  onClick={() => handleMenuOptionClick(option)}
                  onMouseEnter={(e) =>
                    (e.target.style.backgroundColor = isDark == true ? 'rgba(100,181,246,0.15)' : 'rgba(33,150,243,0.08)')
                  }
                  onMouseLeave={(e) => (e.target.style.backgroundColor = 'transparent')}
                >
                  <span style={{ marginRight: '8px', color: isDark == true ? '#64B5F6' : '#2196F3' }}>
                    {option === 'Copy' && <ContentCopyIcon sx={{ fontSize: 16 }} />}
                    {option === 'Paste' && <ContentPasteIcon sx={{ fontSize: 16 }} />}
                  </span>
                  {option}
                </div>
              ))}
            </div>
          </Zoom>
        )}
        <>{renderPopper()}</>;
        {openTemplate && (
          <AddLibrary open={openTemplate} handleClose={handleClose} savedTemplate={savedTemplate} setNodes={setNodes} setEdges={setEdges} />
        )}
      </div>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
    </>
  );
}
