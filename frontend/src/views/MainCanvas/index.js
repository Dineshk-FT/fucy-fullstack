/* eslint-disable */
import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  ReactFlowProvider,
  getViewportForBounds,
  MarkerType,
  Panel,
  useReactFlow,
  getNodesBounds
} from 'reactflow';
import '../index.css';
import 'reactflow/dist/style.css';
import { v4 as uid } from 'uuid';
import { CustomEdge } from '../../ui-component/custom';
import useStore from '../../Zustand/store';
import { shallow } from 'zustand/shallow';
import { toPng } from 'html-to-image';
import { lazy, Suspense } from 'react';
const EditEdge = lazy(() => import('../../ui-component/custom/edges/EditEdge'));
const EditProperties = lazy(() => import('../../ui-component/Poppers/EditProperties'));
const AddLibrary = lazy(() => import('../../ui-component/Modal/AddLibrary'));
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
import { Button, Tooltip, Typography, IconButton, Box, Zoom, CircularProgress } from '@mui/material';
import toast, { Toaster } from 'react-hot-toast';
import EditNode from '../../ui-component/Poppers/EditNode';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import FitScreenIcon from '@mui/icons-material/FitScreen';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import DownloadIcon from '@mui/icons-material/Download';
import useThrottle from '../../hooks/useThrottle';
import CanvasToolbar from './CanvasToolbar';
import ContextMenu from './ContextMenu';
import CanvasSpinner from './CanvasSpinner';

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
  isPropertiesOpen: state.isPropertiesOpen,
  setPropertiesOpen: state.setPropertiesOpen,
  initialNodes: state.initialNodes,
  initialEdges: state.initialEdges,
  setCanvasRef: state.setCanvasRef
});

const flowKey = 'example-flow';

export default function MainCanvas() {
  // Edge line styling (now inside component)
  const connectionLineStyle = useMemo(
    () => ({
      stroke: '#64B5F6',
      strokeWidth: 2,
      strokeDasharray: '5,5'
    }),
    []
  );

  const edgeOptions = useMemo(
    () => ({
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
      properties: ['Confidentiality'],
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
    }),
    []
  );

  const CustomStepEdge = useCallback((props) => {
    return <StepEdge {...props} />;
  }, []);

  const edgeTypes = useMemo(
    () => ({
      custom: CustomEdge,
      step: CustomStepEdge
    }),
    [CustomEdge, CustomStepEdge]
  );

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
    isPropertiesOpen,
    setPropertiesOpen,
    isDark,
    initialNodes,
    initialEdges,
    setCanvasRef
  } = useStore(selector, shallow);

  const dispatch = useDispatch();
  const Color = ColorTheme();
  // const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [openTemplate, setOpenTemplate] = useState(false);
  const [savedTemplate, setSavedTemplate] = useState({});
  const [nodeTypes, setNodeTypes] = useState({});
  // const [selectedElement, setSelectedElement] = useState({});
  const dragRef = useRef(null);
  const draggedNodesRef = useRef([]); // Track dragged node and children
  const pendingDragUpdate = useRef(null); // Store pending drag update
  const animationFrameRef = useRef(null); // Animation frame id
  const dragDirtyRef = useRef(false); // Prevent redundant rAF
  const reactFlowWrapper = useRef(null);

  // Spinner overlay during drag
  const [isDragging, setIsDragging] = useState(false);
  const { propertiesTabOpen, addNodeTabOpen, addDataNodeTab, details, edgeDetails, anchorEl, isHeaderOpen, selectedBlock } = useSelector(
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
  const nodesRefer = useRef(nodes);
  const edgesRef = useRef(edges);
  const { zoomIn, zoomOut, fitView: fitCanvasView } = useReactFlow();
  const [zoomLevel, setZoomLevel] = useState(1);

  const canvasRef = useRef(null);

  useEffect(() => {
    setCanvasRef(canvasRef);

    // Capture image before unmounting
    return () => {
      if (canvasRef.current) {
        const reactFlowViewport = canvasRef.current.querySelector('.react-flow__viewport');
        if (reactFlowViewport && nodes.length > 0) {
          const imageWidth = 1920;
          const imageHeight = 1080;
          const nodesBounds = getNodesBounds(nodes);
          const transform = getViewportForBounds(nodesBounds, imageWidth, imageHeight, 0.5, 2);

          toPng(reactFlowViewport, {
            backgroundColor: isDark ? '#1E1E1E' : '#F5F5F5',
            width: imageWidth,
            height: imageHeight,
            style: {
              width: `${imageWidth}px`,
              height: `${imageHeight}px`,
              transform: `translate(${transform[0]}px, ${transform[1]}px) scale(${transform[2]})`
            },
            ignoreElements: (el) => el.tagName === 'style', // Ignore style elements
            skipFonts: true // Skip font embedding
          })
            .then((dataUrl) => {
              useStore.getState().setCanvasImage(dataUrl); // Store the image
            })
            .catch((err) => console.error('Failed to capture image on unmount:', err));
        }
      }
    };
  }, [nodes, canvasRef, setCanvasRef, isDark]);

  useEffect(() => {
    nodesRef.current = nodes;
    edgesRef.current = edges;
  }, [nodes, edges]);

  const handleClear = () => {
    setNodes([]);
    setEdges([]);
    // notify('Canvas cleared', 'success');
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

  const handleCheckForChange = () => {
    if (!_.isEqual(nodes, initialNodes) || !_.isEqual(edges, initialEdges)) {
      return true;
    }
    return false;
  };
  const isChanged = useMemo(() => handleCheckForChange(), [nodes, initialNodes, edges, initialEdges]);

  useEffect(() => {
    const newNodeTypes = pageNodeTypes['maincanvas'] || {};
    setNodeTypes(newNodeTypes);
    setNodes([]);
    setEdges([]);
    setTimeout(() => setIsReady(true), 0);
    return () => {
      if (!_.isEqual(nodes, initialNodes) || !_.isEqual(edges, initialEdges)) {
        handleSaveToModel();
      }
    };
  }, []);

  useEffect(() => {
    const template = assets?.template;
    setSavedTemplate(template);
    onSaveInitial(template);
    onRestore(template);
  }, [assets]);

  useEffect(() => {
    if (reactFlowInstance) {
      reactFlowInstance?.fitView({ padding: 0.2, includeHiddenNodes: true, minZoom: 0.5, maxZoom: 2, duration: 500 });
      setZoomLevel(reactFlowInstance?.getZoom());
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

  // On drag start, cache the dragged node and all its children (flattened)
  const onNodeDragStart = useCallback((_, node) => {
    // Promise.resolve().then(() => setIsDragging(true));
    dragRef.current = node;
    if (node.type === 'group') {
      // Only call once and store the result
      const [intersectingNodesMap, nodes] = getGroupedNodes();

      // Do the merging directly here
      const values = Object.values(intersectingNodesMap).flat();
      const updated = nodes.map((item1) => {
        const match = values.find((item2) => item2.id === item1.id);
        return match ? match : item1;
      });

      setNodes(updated);
    }
  }, []);

  const throttledOnNodeDrag = useThrottle((event, node) => {
    const prevNode = nodesRefer.current.find((n) => n.id === node.id);
    if (!prevNode) return;

    const deltaX = node.position.x - prevNode.position.x;
    const deltaY = node.position.y - prevNode.position.y;

    if (deltaX === 0 && deltaY === 0) return;

    const updatedPositions = new Map();

    const moveChildren = (parentId, dx, dy) => {
      nodesRefer.current.forEach((child) => {
        if (child.parentId === parentId) {
          nodesList.push(child);
          collectChildren(child.id, nodesList);
        }
      });
    };

    updatedPositions.set(node.id, { x: node.position.x, y: node.position.y });
    moveChildren(node.id, deltaX, deltaY);

    // 🔥 Apply the change check here
    setNodes((prevNodes) => {
      let changed = false;
      const updated = prevNodes.map((n) => {
        if (updatedPositions.has(n.id)) {
          const newPos = updatedPositions.get(n.id);
          if (n.position.x !== newPos.x || n.position.y !== newPos.y) {
            changed = true;
            return { ...n, position: newPos };
          }
        }
        return n;
      });

      return changed ? updated : prevNodes;
    });
  }, 30); // Or tweak to 16ms if you want it super smooth

  const onNodeDrag = useCallback(
    (event, node) => {
      throttledOnNodeDrag(event, node);
    },
    [throttledOnNodeDrag]
  );

  // On drag stop, flush any pending updates, update refs, and clear cache
  const onNodeDragStop = useCallback(() => {
    nodesRefer.current = [...nodes]; // Update ref after drag stops
    // Promise.resolve().then(() => setIsDragging(false));
  }, [nodes]);

  function downloadImage(dataUrl) {
    const a = document.createElement('a');
    a.setAttribute('download', 'canvas-diagram.png');
    a.setAttribute('href', dataUrl);
    a.click();
  }

  const imageWidth = 1920;
  const imageHeight = 1080;

  const handleDownload = () => {
    const nodesBounds = getNodesBounds(nodes);
    const transform = getViewportForBounds(nodesBounds, imageWidth, imageHeight, 0.5, 2);

    toPng(document.querySelector('.react-flow__viewport'), {
      backgroundColor: isDark === true ? '#1E1E1E' : '#F5F5F5',
      width: imageWidth,
      height: imageHeight,
      style: {
        transform: `translate(${transform[0]}px, ${transform[1]}px) scale(${transform[2]})`
      },
      ignoreElements: (el) => el.tagName === 'style' || el.tagName === 'link',
      skipFonts: true,
      filter: (node) => node.tagName !== 'style' && node.tagName !== 'link'
    })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = 'Item-Defination.png';
        link.href = dataUrl;
        link.click();
      })
      .catch((error) => {
        console.error('Error downloading image:', error);
      });
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
    },
    [reactFlowInstance]
  );

  const RefreshAPI = () => {
    getAssets(model?._id).catch((err) => {
      notify('Failed to fetch assets: ' + err.message, 'error');
    });
    getDamageScenarios(model?._id).catch((err) => {
      notify('Failed to fetch damage scenarios: ' + err.message, 'error');
    });
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
    // console.log('Clicked Node:', node);
    e.stopPropagation(); // Prevent bubbling up

    if (e.shiftKey) {
      setSelectedNodes((prevSelectedNodes) => {
        const isAlreadySelected = prevSelectedNodes.some((snode) => snode.id === node.id);
        return isAlreadySelected ? prevSelectedNodes.filter((snode) => snode.id !== node.id) : [...prevSelectedNodes, node];
      });
    }

    // if (node.type === 'group') {
    // Ensure nested group selection
    dispatch(setSelectedBlock(node));
    setSelectedElement(node);
    // }
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
    if (node.type === 'group') {
      // If it's a group, don’t set it as the copied node; prepare for pasting inside
      setContextMenu({
        visible: true,
        x: event.clientX,
        y: event.clientY,
        options: copiedNode && copiedNode.length > 0 ? ['Copy', 'Paste'] : ['Copy'],
        targetGroup: node // Pass the group as the target for pasting
      });
    } else {
      // Regular node: set it as the copied node
      setCopiedNode([node]);
      setContextMenu({
        visible: true,
        x: event.clientX,
        y: event.clientY,
        options: ['Copy', 'Paste'],
        node
      });
    }
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
    if (option === 'Copy' && contextMenu.node && contextMenu.node.type !== 'group') {
      setCopiedNode([contextMenu.node]);
      notify('Node copied!', 'success');
    }

    if (option === 'Paste') {
      if (!Array.isArray(copiedNode) || copiedNode.length === 0) {
        console.error('No valid copied node found');
        return;
      }

      const pastePosition = reactFlowInstance.screenToFlowPosition({
        x: contextMenu.x,
        y: contextMenu.y
      });

      const targetGroup =
        contextMenu.targetGroup ||
        nodes.find((node) => {
          if (node.type !== 'group') return false;
          const groupX = contextMenu.x;
          const groupY = contextMenu.y;
          const groupWidth = node.width || 200;
          const groupHeight = node.height || 200;
          return (
            pastePosition.x >= groupX &&
            pastePosition.x <= groupX + groupWidth &&
            pastePosition.y >= groupY &&
            pastePosition.y <= groupY + groupHeight
          );
        });

      copiedNode.forEach((node) => {
        const newNode = {
          ...node,
          id: uid(),
          isCopied: true,
          position: targetGroup
            ? {
                x: pastePosition.x - (targetGroup.positionAbsolute?.x ?? targetGroup.position.x),
                y: pastePosition.y - (targetGroup.positionAbsolute?.y ?? targetGroup.position.y)
              }
            : {
                x: pastePosition.x,
                y: pastePosition.y
              },
          parentId: targetGroup ? targetGroup.id : undefined,
          extent: targetGroup ? 'parent' : undefined,
          selected: false
        };

        setNodes((nds) => [...nds, newNode]);
      });
    }

    setContextMenu({ visible: false, x: 0, y: 0, targetGroup: null, node: null });
  };

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
    setSelectedNodes([]);
  }, []);

  // console.log('anchorElNodeId', anchorElNodeId);
  const renderPopper = () => {
    if (anchorElNodeId) {
      return (
        <Suspense fallback={null}>
          {isPropertiesOpen ? (
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
          )}
        </Suspense>
      );
    }

    if (anchorElEdgeId) {
      return (
        <Suspense fallback={null}>
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
        </Suspense>
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
          overflow: 'hidden',
          position: 'relative'
        }}
        ref={reactFlowWrapper}
        onContextMenu={handleCanvasContextMenu}
        onClick={() => setContextMenu({ visible: false, x: 0, y: 0 })}
      >
        {/* Spinner overlay during drag */}
        <CanvasSpinner open={isDragging} isDark={isDark} isDragging={isDragging} />

        <ReactFlowProvider fitView>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={(changes) => {
              onNodesChange(changes);
              // Failsafe: if no drag is happening, ensure spinner is hidden
              if (!dragRef.current && isDragging) setIsDragging(false);
            }}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onClick={(e) => {
              e.preventDefault();
              // e.stopPropagation();
              dispatch(setSelectedBlock({}));
            }}
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
            position={[0, 0]}
            zoom={1}
            onNodeContextMenu={handleNodeContextMenu}
            minZoom={0.2}
            maxZoom={2}
            ref={canvasRef}
          >
            <Panel position="top-left">
              <CanvasToolbar
                isDark={isDark}
                Color={Color}
                isChanged={isChanged}
                onRestore={onRestore}
                handleSaveToModel={handleSaveToModel}
                onSelectionClick={onSelectionClick}
                selectedNodes={selectedNodes}
                handleGroupDrag={handleGroupDrag}
                undo={undo}
                redo={redo}
                undoStack={undoStack}
                redoStack={redoStack}
                handleDownload={handleDownload}
                assets={assets}
              />
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
            {(propertiesTabOpen || addNodeTabOpen || addDataNodeTab) && <RightDrawer />}
          </ReactFlow>
        </ReactFlowProvider>
        <Suspense fallback={null}>
          <ContextMenu
            visible={contextMenu.visible}
            x={contextMenu.x}
            y={contextMenu.y}
            options={contextMenu.options}
            isDark={isDark}
            handleMenuOptionClick={handleMenuOptionClick}
          />
        </Suspense>
        <>{renderPopper()}</>
        <Suspense fallback={null}>
          {openTemplate && (
            <AddLibrary
              open={openTemplate}
              handleClose={handleClose}
              savedTemplate={savedTemplate}
              setNodes={setNodes}
              setEdges={setEdges}
            />
          )}
        </Suspense>
      </div>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
    </>
  );
}
