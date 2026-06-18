/* eslint-disable */
import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import ReactFlow, {
  MiniMap,
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
import { IconButton, Zoom } from '@mui/material';
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
import { debounce } from 'lodash';
import AutoSavePopper from '../../components/Poppers/AutoSavePopper';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { canvasSteps } from '../../utils/Steps';
import { setAttackScene } from '../../store/slices/CurrentIdSlice';
import AutoGuidePopper from '../../components/Poppers/AutoGuidePopper';
import generateDiagramSVG from '../../utils/generateDiagramSVG';

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
  setCanvasImage: state.setCanvasImage,
  isChanged: state.isChanged,
  setIsChanged: state.setIsChanged,
  openSave: state.openSave,
  setOpenSave: state.setOpenSave,
  // Add the new helper functions:
  clearUndoRedo: state.clearUndoRedo,
  addToUndoStack: state.addToUndoStack,
  resetChangedState: state.resetChangedState,
  safeRestore: state.safeRestore, // Add this
  flushPendingChanges: state.flushPendingChanges
});

// Enhanced connection line styling for better visual feedback
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
      fontFamily: "'Poppins', Arial, sans-serif",
      fontSize: '12px',
      color: '#000000',
      fontWeight: '500'
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
    setCanvasImage,
    isChanged,
    setIsChanged,
    openSave,
    setOpenSave,
    // Add the new helper functions:
    clearUndoRedo,
    addToUndoStack,
    resetChangedState,
    safeRestore,
    flushPendingChanges
  } = useStore(selector, shallow);

  const dispatch = useDispatch();
  const Color = ColorTheme();
  const [openTemplate, setOpenTemplate] = useState(false);
  const [savedTemplate, setSavedTemplate] = useState({});
  const [nodeTypes, setNodeTypes] = useState({});
  const [saveLoading, setSaveLoading] = useState(false);
  const dragRef = useRef(null);
  const reactFlowWrapper = useRef(null);
  const { propertiesTabOpen, addNodeTabOpen, addDataNodeTab, details, edgeDetails, anchorEl, isHeaderOpen, selectedBlock } = useSelector(
    (state) => state?.canvas
  );
  const { getViewport } = useReactFlow();
  const anchorElNodeId = useMemo(() => document.querySelector(`[data-id="${anchorEl?.node}"]`) || null, [anchorEl?.node]);
  const anchorElEdgeId = useMemo(() => document.querySelector(`[data-testid="${anchorEl?.edge}"]`) || null, [anchorEl?.edge]);
  const [copiedNode, setCopiedNode] = useState([]);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0 });
  const [isReady, setIsReady] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const latestNodesRef = useRef(nodes);
  const anchorRef = useRef(null);
  const [runTour, setRunTour] = useState(false);
  // Ref to always hold the latest reactFlowInstance — prevents stale closures
  const reactFlowInstanceRef = useRef(reactFlowInstance);
  // Ref to hold the pending restore template so beforeunload can't race it
  const pendingRestoreRef = useRef(null);

  const notify = (message, status) => toast[status](message);

  const handleClear = () => {
    setNodes([]);
    setEdges([]);
  };

  const debouncedFitViewRef = useRef(
    debounce(() => {
      const rf = reactFlowInstanceRef.current;
      if (!rf) return;
      rf.fitView({
        padding: 0.2,
        includeHiddenNodes: true,
        minZoom: 0.2,
        maxZoom: 2,
        duration: 500
      });
      setZoomLevel(rf.getZoom());
    }, 150)
  );
  const debouncedFitView = debouncedFitViewRef.current;
  // console.log('nodes', nodes);

  const handleSaveToModel = async (e) => {
    e.stopPropagation();
    setSaveLoading(true);
    flushPendingChanges();

    const nodesBounds = getRectOfNodes(nodes);
    const transform = getTransformForBounds(
      nodesBounds,
      imageWidth,
      imageHeight,
      0.5, // your padding or zoom factor
      2 // max zoom
    );

    const reactFlowViewport = reactFlowWrapper.current.querySelector('.react-flow__viewport');

    if (!reactFlowViewport) {
      notify('Viewport not found', 'error');
      return;
    }

    try {
      const dataUrl = await toPng(reactFlowViewport, {
        backgroundColor: isDark ? '#1E1E1E' : '#F5F5F5',
        width: imageWidth,
        height: imageHeight,
        style: {
          width: imageWidth,
          height: imageHeight,
          transform: `translate(${transform[0]}px, ${transform[1]}px) scale(${transform[2]})`
        }
      });

      const response = await fetch(dataUrl);
      const blob = await response.blob();
      // Build your JSON template object
      const template = {
        nodes,
        edges
      };
      nodes.forEach((node) => {
        if (node.isCopied) {
          node.isCopied = false;
        }
      });
      setIsNodePasted(false);

      // Use FormData to send both the JSON and the image
      const details = {
        'model-id': model?._id,
        template: JSON.stringify(template),
        assetId: assets?._id,
        image: blob
      };

      update(details) // You’d need to adapt your `update` call to accept FormData
        .then((res) => {
          if (!res.error) {
            notify('Saved Successfully', 'success');
            handleClose();
            RefreshAPI();
            debouncedFitView();
            // Clear undo/redo stacks after successful save
            clearUndoRedo();
            resetChangedState();
          } else {
            notify(res.error ?? 'Something went wrong', 'error');
          }
        })
        .catch((err) => {
          notify('Something went wrong', 'error');
        });
      setSaveLoading(false);
    } catch (error) {
      console.error('Error capturing viewport:', error);
      notify('Failed to capture image', 'error');
    }
  };

  // Add a separate useEffect to handle initial load
  useEffect(() => {
    const newNodeTypes = pageNodeTypes['maincanvas'] || {};
    setNodeTypes(newNodeTypes);
    dispatch(setAttackScene({}));

    // 👉 ADD THESE 3 LINES: Clear all lingering selection states on mount
    dispatch(clearAnchorEl());
    dispatch(setSelectedBlock({}));
    setSelectedElement({});

    // Only clear if we don't have changes and no assets template
    if (!isChanged && (!assets?.template || !assets.template.nodes || assets.template.nodes.length === 0)) {
      setNodes([]);
      setEdges([]);
    }

    setTimeout(() => setIsReady(true), 0);
  }, []);

  useEffect(() => {
    return () => {
      // On unmount: cancel any pending restore and do NOT flush pending changes —
      // flushing here would overwrite the store with the outgoing model's stale nodes/edges,
      // which would then corrupt the restore when the new model's assets arrive.
      pendingRestoreRef.current = null;
    };
  }, []);
  // console.log('nodes', nodes);

  // Auto-fit canvas view on mount and when nodes/edges change
  // When ReactFlow re-initialises (e.g. after a model switch causes a remount),
  // re-apply any pending restore so beforeunload can't corrupt the new canvas.
  const onInit = (rf) => {
    setReactFlowInstance(rf);
    reactFlowInstanceRef.current = rf;

    if (pendingRestoreRef.current !== null) {
      console.log('Re-applying pending restore on onInit');
      const template = pendingRestoreRef.current;
      if (template && template.nodes && template.edges) {
        safeRestore(template);
        clearUndoRedo();
        resetChangedState();
      } else {
        handleClear();
        clearUndoRedo();
        resetChangedState();
      }
      setTimeout(() => {
        if (reactFlowInstanceRef.current) {
          debouncedFitView();
        }
      }, 100);
    }
  };

  const checkForNodes = useCallback(() => {
    const [intersectingNodesMap, nodes] = getGroupedNodes();
    const values = Object.values(intersectingNodesMap).flat();
    const updated = nodes.map((item1) => {
      const match = values.find((item2) => item2.id === item1.id);
      return match ? match : item1;
    });
    setNodes(updated);
  }, [getGroupedNodes, setNodes]);

  const onNodeDragStart = useCallback(
    (_, node) => {
      setIsChanged(true);
      setTimeout(() => checkForNodes(), 0);
      dragRef.current = node;
      latestNodesRef.current = [...nodes]; // Ensures ref is always synced before drag starts
    },
    [nodes, checkForNodes]
  );

  const onNodeDrag = useCallback((event, node) => {
    const currentNodes = latestNodesRef.current;
    const prevNode = currentNodes.find((n) => n.id === node.id);
    if (!prevNode) return;

    const deltaX = node.position.x - prevNode.position.x;
    const deltaY = node.position.y - prevNode.position.y;
    if (deltaX === 0 && deltaY === 0) return;

    const updatedPositions = new Map();

    // Traverse all descendants recursively
    const moveDescendants = (parentId, dx, dy) => {
      currentNodes.forEach((child) => {
        if (child.parentId === parentId) {
          const prev = updatedPositions.get(child.id) || child.position;
          const newPos = { x: prev.x + dx, y: prev.y + dy };
          updatedPositions.set(child.id, newPos);

          moveDescendants(child.id, dx, dy); // recursive
        }
      });
    };

    // Move the dragged group itself
    updatedPositions.set(node.id, { x: node.position.x, y: node.position.y });

    // Now move its children recursively
    moveDescendants(node.id, deltaX, deltaY);

    // Apply all changes
    setNodes((prevNodes) => prevNodes.map((n) => (updatedPositions.has(n.id) ? { ...n, position: updatedPositions.get(n.id) } : n)));

    // Update ref for all moved nodes to prevent delta drift on the next frame
    latestNodesRef.current = latestNodesRef.current.map((n) =>
      updatedPositions.has(n.id) ? { ...n, position: updatedPositions.get(n.id) } : n
    );
  }, []);

  const onNodeDragStop = useCallback(() => {
    latestNodesRef.current = [...nodes];
    checkForNodes(); // ✅ re-evaluate group-child relationships
  }, [nodes, checkForNodes]);

  const imageWidth = 1920;
  const imageHeight = 1080;

  const handleDownload = (e) => {
    e.stopPropagation();

    // 1. Deep clone nodes and edges to prevent `generateDiagramSVG`
    // from accidentally mutating your active Zustand state.
    const clonedNodes = JSON.parse(JSON.stringify(nodes));
    const clonedEdges = JSON.parse(JSON.stringify(edges));

    const svgString = generateDiagramSVG(clonedNodes, clonedEdges, getRectOfNodes, getTransformForBounds, 1920);
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'final-diagram.svg';

    // 2. Prevent the native programmatic click from bubbling up
    // to document.body and triggering React Flow's global click/deselect listeners.
    a.addEventListener('click', (ev) => ev.stopPropagation());

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
    setIsChanged(false);
  };

  const handleClose = () => {
    setOpenTemplate(false);
    setIsChanged(false);
  };

  const onSaveInitial = useCallback((temp) => {
    localStorage.removeItem(flowKey);
    if (temp) {
      localStorage.setItem(flowKey, JSON.stringify(temp));
    }
  }, []);

  // Add keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey || event.metaKey) {
        if (event.key === 'z' && !event.shiftKey) {
          event.preventDefault();
          undo();
        } else if ((event.key === 'z' && event.shiftKey) || event.key === 'y') {
          event.preventDefault();
          redo();
        } else if (event.key === 's') {
          event.preventDefault();
          handleSaveToModel(event);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, handleSaveToModel]);

  const onRestore = useCallback(
    (temp) => {
      if (temp && temp.nodes && temp.edges) {
        // Use safeRestore which doesn't trigger undo stack
        safeRestore(temp);
        clearUndoRedo();
        resetChangedState();

        setTimeout(() => {
          if (reactFlowInstanceRef.current) {
            debouncedFitView();
          }
        }, 50);
      } else {
        // Handle empty template or no template - clear everything
        console.log('Clearing canvas - empty template or no template');
        handleClear();
        clearUndoRedo();
        resetChangedState();

        setTimeout(() => {
          if (reactFlowInstanceRef.current) {
            debouncedFitView();
          }
        }, 50);
      }
    },
    // No reactFlowInstance dependency — we use the ref instead
    [clearUndoRedo, resetChangedState, safeRestore]
  );

  // Update the assets useEffect to be less aggressive
  useEffect(() => {
    const template = assets?.template;
    setSavedTemplate(template);
    onSaveInitial(template);

    // Record the desired state in the ref FIRST.
    // If beforeunload fires after this point and flushPendingChanges writes stale
    // nodes back into the Zustand store, onInit will re-apply from this ref.
    pendingRestoreRef.current = template ?? null;

    if (template) {
      console.log('Restoring from template (assets changed)');
      onRestore(template);
    } else {
      console.log('No template found - clearing canvas');
      onRestore(null);
    }
  }, [assets]); // Remove isChanged dependency to ensure proper model switching

  const onLoad = (rf) => {
    setReactFlowInstance(rf);
    reactFlowInstanceRef.current = rf;
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
          descripion: node?.data?.description ?? '',
          properties: node?.properties ?? [],
          isAsset: node.isAsset ?? false
        })
      );
    }
  };
  const handleCloseSave = (e) => {
    // Set isChanged to false BEFORE restoring to prevent the restore from triggering changes
    e.stopPropagation();
    resetChangedState();

    // Use setTimeout to ensure the state is updated before restore
    setTimeout(() => {
      onRestore(assets?.template);
      setOpenSave(false);
    }, 10);
  };

  const handleSelectNodeSingleClick = (e, node) => {
    e.stopPropagation(); // Prevent bubbling up

    if (e.shiftKey) {
      setSelectedNodes((prevSelectedNodes) => {
        const isAlreadySelected = prevSelectedNodes.some((snode) => snode.id === node.id);
        return isAlreadySelected ? prevSelectedNodes.filter((snode) => snode.id !== node.id) : [...prevSelectedNodes, node];
      });
    }

    dispatch(setSelectedBlock(node));
    setSelectedElement(node);
  };

  const handleSelectEdgeSingleClick = (e, edge) => {
    e.stopPropagation();
    // Set anchor element to ensure sidebar knows which edge is selected
    dispatch(setAnchorEl({ type: 'edge', value: `edge-${edge.id}` }));
    dispatch(setSelectedBlock(edge));
    setSelectedElement(edge);
    // Update edge details in the store
    dispatch(
      setEdgeDetails({
        ...details,
        name: edge?.data?.label ?? '',
        descripion: edge?.data?.description ?? '',
        properties: edge?.properties ?? [],
        isAsset: edge.isAsset ?? false,
        style: edge.data.style ?? {},
        startPoint: edge.markerStart?.color ?? '#64B5F6',
        endPoint: edge.markerEnd?.color ?? '#64B6F6'
      })
    );
  };

  // console.log('isPropertiesOpen', isPropertiesOpen);
  const handleClosePopper = (e) => {
    // console.log('close popper');
    e.stopPropagation();
    setPropertiesOpen(false);
    dispatch(clearAnchorEl());
    setSelectedBlock({});
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
        descripion: edge?.data?.description ?? '',
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
    e.preventDefault();
    const template = {
      nodes: nodes,
      edges: edges
    };
    // console.log('nodes', nodes);
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
      setContextMenu({
        visible: true,
        x: event.clientX,
        y: event.clientY,
        options: copiedNode && copiedNode.length > 0 ? ['Copy', 'Paste'] : ['Copy'],
        targetGroup: node
      });
    } else {
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
    }
    // else {
    //   notify('No copied node available', 'error');
    // }
  };

  const handleMenuOptionClick = (option) => {
    if (option === 'Copy' && contextMenu.node && contextMenu.node.type !== 'group') {
      setCopiedNode([contextMenu.node]);
      notify('Node copied!', 'success');
    }

    if (option === 'Paste') {
      setIsChanged(true);
      addToUndoStack();
      if (!Array.isArray(copiedNode) || copiedNode.length === 0) {
        notify('No valid copied node found', 'error');
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
          console.log('escape');
          dispatch(setSelectedBlock({}));
        }
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

  const popperComponent = useMemo(() => {
    if (anchorElNodeId) {
      return isPropertiesOpen ? (
        <EditProperties
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
          selectedBlock={selectedBlock}
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
  }, [
    selectedElement,
    anchorElNodeId,
    anchorElEdgeId,
    handleSaveEdit,
    nodes,
    selectedBlock,
    details,
    setDetails,
    edgeDetails,
    setSelectedElement
  ]);

  if (!isReady) return null;

  return (
    <>
      <AutoGuidePopper steps={canvasSteps} runTour={runTour} setRunTour={setRunTour} />
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
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setContextMenu({ visible: false, x: 0, y: 0 });
              if (!isPropertiesOpen && !anchorElNodeId && !anchorElEdgeId) {
                dispatch(setSelectedBlock({}));
              }
            }}
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
            onNodeContextMenu={handleNodeContextMenu}
            minZoom={0.2}
            maxZoom={2}
            defaultZoom={1}
            defaultZoomPosition={{ x: 0, y: 0 }}
          >
            <Panel
              id="control-panel"
              position="top-left"
              style={{ display: 'flex', gap: 4, padding: '4px' }}
              onClick={(e) => e.stopPropagation()}
            >
              <span ref={anchorRef}>
                <CanvasToolbar
                  isDark={isDark}
                  loading={saveLoading}
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
              </span>
            </Panel>
            <Panel position="top-right" onClick={(e) => e.stopPropagation()}>
              <IconButton onClick={() => setRunTour(true)} sx={{ color: '#1976d2', ml: 1 }} size="small">
                <HelpOutlineIcon fontSize="small" />
              </IconButton>
            </Panel>
            <Panel
              id="controls"
              position="bottom-left"
              style={{ display: 'flex', gap: 4, padding: '4px' }}
              onClick={(e) => e.stopPropagation()}
            >
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
        <>{popperComponent}</>;
        {openTemplate && (
          <AddLibrary open={openTemplate} handleClose={handleClose} savedTemplate={savedTemplate} setNodes={setNodes} setEdges={setEdges} />
        )}
      </div>
      <AutoSavePopper open={openSave} handleClose={handleCloseSave} anchorRef={anchorRef} handleSave={handleSaveToModel} />
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
    </>
  );
}
