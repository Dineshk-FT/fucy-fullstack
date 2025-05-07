/* eslint-disable */
import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
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
import { CustomEdge } from '../../components/custom';
import useStore from '../../store/Zustand/store';
import { toPng } from 'html-to-image';
import AddLibrary from '../../components/Modal/AddLibrary';
import { useDispatch, useSelector } from 'react-redux';
import { pageNodeTypes, style } from '../../utils/Constraints';
import { setSelectedBlock, setDetails, setEdgeDetails, setAnchorEl, clearAnchorEl } from '../../store/slices/CanvasSlice';
import StepEdge from '../../components/custom/edges/StepEdge';
import { Tooltip, IconButton, Box, Zoom } from '@mui/material';
import toast, { Toaster } from 'react-hot-toast';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import EditNode from '../../components/Poppers/EditNode';
import EditEdge from '../../components/custom/edges/EditEdge';
import EditProperties from '../../components/Poppers/EditProperties';
import RightDrawer from '../../layouts/MainLayout/RightSidebar';
import ColorTheme from '../../themes/ColorTheme';
import { ZoomControls } from './CanvasControls';
import { onDrop } from './OnDrop';
import CanvasToolbar from './CanvasToolbar';
import { shallow } from 'zustand/shallow';
import { debounce } from 'lodash'; // Ensure lodash is installed: npm install lodash

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
  setCanvasImage: state.setCanvasImage,
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
    isPropertiesOpen,
    setPropertiesOpen,
    isDark,
    initialNodes,
    initialEdges,
    setCanvasImage,
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

  // Optimized: Debounced and dynamic canvas image capture
  useEffect(() => {
    // Debounced function to capture canvas image
    const debouncedCapture = debounce(async () => {
      try {
        if (!nodes.length || !reactFlowWrapper.current) return;
        const reactFlowViewport = reactFlowWrapper.current.querySelector('.react-flow__viewport');
        if (!reactFlowViewport) return;

        // Get bounding box of all nodes (diagram area)
        const nodesBounds = getRectOfNodes(nodes);
        // Add some padding
        const padding = 40;
        const SCALE = 3; // Use 3x for ultra-high-DPI clarity
        const baseWidth = nodesBounds.width + padding * 2;
        const baseHeight = nodesBounds.height + padding * 2;
        const imageWidth = Math.round(baseWidth * SCALE);
        const imageHeight = Math.round(baseHeight * SCALE);

        // Calculate transform to fit the diagram in the image (scale the translation by SCALE)
        const transform = getTransformForBounds(nodesBounds, imageWidth, imageHeight, 0.5, 2);

        const image = await toPng(reactFlowViewport, {
          backgroundColor: isDark ? '#1E1E1E' : '#F5F5F5',
          width: imageWidth,
          height: imageHeight,
          style: {
            width: `${baseWidth}px`, // CSS size stays unscaled
            height: `${baseHeight}px`,
            transform: `translate(${transform[0] * SCALE}px, ${transform[1] * SCALE}px) scale(${transform[2]})`,
            fontSmooth: 'always',
            WebkitFontSmoothing: 'antialiased',
          },
        });
        setCanvasImage(image);
      } catch (error) {
        console.error('Error capturing canvas image:', error);
      }
    }, 500); // 500ms debounce for better performance

    debouncedCapture();
    return () => {
      debouncedCapture.cancel();
    };
  }, [nodes, edges, isDark, reactFlowWrapper, setCanvasImage]);


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

  // useEffect(() => {

  // }, []);
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
    setTimeout(() => checkForNodes(), 0);
    dragRef.current = node;
  }, []);

  const onNodeDrag = useCallback((event, node) => {
    const prevNode = nodesRefer.current.find((n) => n.id === node.id);
    if (!prevNode) return;

    const deltaX = node.position.x - prevNode.position.x;
    const deltaY = node.position.y - prevNode.position.y;

    if (deltaX === 0 && deltaY === 0) return; // No movement, return early

    // Use a Map to track updated positions
    const updatedPositions = new Map();

    const moveChildren = (parentId, dx, dy) => {
      nodesRefer.current.forEach((child) => {
        if (child.parentId === parentId) {
          const newPos = {
            x: child.position.x + dx,
            y: child.position.y + dy
          };
          updatedPositions.set(child.id, newPos);
          moveChildren(child.id, dx, dy);
        }
      });
    };

    updatedPositions.set(node.id, { x: node.position.x, y: node.position.y });
    moveChildren(node.id, deltaX, deltaY);

    setNodes((prevNodes) => prevNodes.map((n) => (updatedPositions.has(n.id) ? { ...n, position: updatedPositions.get(n.id) } : n)));
  }, []);

  const onNodeDragStop = useCallback(() => {
    nodesRefer.current = [...nodes]; // Update ref after drag stops
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

      checkForNodes();
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
        onClick={() => setContextMenu({ visible: false, x: 0, y: 0 })}
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
            onDrop={(event) => onDrop(event, createGroup, reactFlowInstance, dragAdd, dragAddNode)}
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
              <CanvasToolbar
                isDark={isDark}
                Color={Color}
                // isChanged={isChanged}
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
            <Panel position="bottom-left" style={{ display: 'flex', gap: 4, padding: '4px' }}>
              <ZoomControls isDark={isDark} reactFlowInstance={reactFlowInstance} zoomLevel={zoomLevel} setZoomLevel={setZoomLevel} />
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
