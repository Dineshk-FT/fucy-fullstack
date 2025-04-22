/* eslint-disable */
import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import ReactFlow, { MiniMap, Background, ReactFlowProvider, getViewportForBounds, Panel, getNodesBounds } from 'reactflow';
import '../index.css';
import 'reactflow/dist/style.css';
import { v4 as uid } from 'uuid';
import useStore from '../../store/Zustand/store';
import { shallow } from 'zustand/shallow';
import { toPng } from 'html-to-image';
import { lazy, Suspense } from 'react';
const EditEdge = lazy(() => import('../../components/custom/edges/EditEdge'));
const EditProperties = lazy(() => import('../../components/Poppers/EditProperties'));
const AddLibrary = lazy(() => import('../../components/Modal/AddLibrary'));
import { useDispatch, useSelector } from 'react-redux';
import RightDrawer from '../../layouts/MainLayout/RightSidebar';
import ColorTheme from '../../themes/ColorTheme';
import { pageNodeTypes, style } from '../../utils/Constraints';
import {
  OpenPropertiesTab,
  setSelectedBlock,
  setDetails,
  setEdgeDetails,
  setAnchorEl,
  clearAnchorEl
} from '../../store/slices/CanvasSlice';
import toast, { Toaster } from 'react-hot-toast';
import EditNode from '../../components/Poppers/EditNode';
import useThrottle from '../../hooks/useThrottle';
import CanvasToolbar from './CanvasToolbar';
import ContextMenu from './ContextMenu';
import { ZoomControls } from './CanvasControls';
import { useEdgeConfig } from './EdgeConfig';
import { onDrop } from './OnDrop';

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
  const [openTemplate, setOpenTemplate] = useState(false);
  const [savedTemplate, setSavedTemplate] = useState({});
  const [nodeTypes, setNodeTypes] = useState({});
  const dragRef = useRef(null);
  const { connectionLineStyle, edgeOptions, edgeTypes } = useEdgeConfig();
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

  // const handleCheckForChange = () => {
  //   if (!_.isEqual(nodes, initialNodes) || !_.isEqual(edges, initialEdges)) {
  //     return true;
  //   }
  //   return false;
  // };
  // const isChanged = useMemo(() => handleCheckForChange(), [nodes, initialNodes, edges, initialEdges]);

  useEffect(() => {
    const newNodeTypes = pageNodeTypes['maincanvas'] || {};
    setNodeTypes(newNodeTypes);
    setNodes([]);
    setEdges([]);
    setTimeout(() => setIsReady(true), 0);
    // return () => {
    //   if (!_.isEqual(nodes, initialNodes) || !_.isEqual(edges, initialEdges)) {
    //     handleSaveToModel();
    //   }
    // };
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
    if (node.type !== 'group') return;

    const prevNode = nodesRefer.current.find((n) => n.id === node.id);
    if (!prevNode) return;

    const deltaX = node.position.x - prevNode.position.x;
    const deltaY = node.position.y - prevNode.position.y;

    if (deltaX === 0 && deltaY === 0) return;

    // Step 1: Prepare a lookup for children
    const childMap = new Map();
    nodesRefer.current.forEach((n) => {
      if (!childMap.has(n.parentId)) childMap.set(n.parentId, []);
      childMap.get(n.parentId).push(n);
    });

    // Step 2: Collect updated positions recursively
    const updatedPositions = new Map();

    const moveNodeAndChildren = (nodeId, dx, dy) => {
      const children = childMap.get(nodeId) || [];
      for (const child of children) {
        const newX = child.position.x + dx;
        const newY = child.position.y + dy;
        updatedPositions.set(child.id, { x: newX, y: newY });

        moveNodeAndChildren(child.id, dx, dy); // recurse
      }
    };

    // Start with the dragged group node itself
    updatedPositions.set(node.id, { x: node.position.x, y: node.position.y });
    moveNodeAndChildren(node.id, deltaX, deltaY);

    // Step 3: Apply updates
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
  }, 30);

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
        {/* <CanvasSpinner open={isDragging} isDark={isDark} isDragging={isDragging} /> */}

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
              e.stopPropagation();
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
              <ZoomControls isDark={isDark} zoomLevel={zoomLevel} setZoomLevel={setZoomLevel} reactFlowInstance={reactFlowInstance} />
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
