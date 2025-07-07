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
  setOpenSave: state.setOpenSave
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
      fontFamily: "'Poppins', Arial, sans-serif",
      fontSize: '12px',
      color: '#000000', // Higher contrast for clarity
      fontWeight: '500' // Slightly bolder for better legibility
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
    setOpenSave
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
  const anchorElNodeId = document.querySelector(`[data-id="${anchorEl?.node}"]`) || null;
  const anchorElEdgeId = document.querySelector(`[data-testid="${anchorEl?.edge}"]`) || null;
  const [copiedNode, setCopiedNode] = useState([]);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0 });
  const [isReady, setIsReady] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const latestNodesRef = useRef(nodes);
  const anchorRef = useRef(null);
  const [runTour, setRunTour] = useState(false);

  const notify = (message, status) => toast[status](message);

  const handleClear = () => {
    setNodes([]);
    setEdges([]);
  };

  const debouncedFitView = debounce(() => {
    reactFlowInstance.fitView({
      padding: 0.2,
      includeHiddenNodes: true,
      minZoom: 0.2,
      maxZoom: 2,
      duration: 500
    });
    setZoomLevel(reactFlowInstance.getZoom());
  });

  const handleSaveToModel = async (e) => {
    e.stopPropagation();
    setSaveLoading(true);

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

  useEffect(() => {
    const newNodeTypes = pageNodeTypes['maincanvas'] || {};
    setNodeTypes(newNodeTypes);
    dispatch(setAttackScene({}));
    if (!isChanged) {
      setNodes([]);
      setEdges([]);
    }
    setTimeout(() => setIsReady(true), 0);
  }, []);
  // console.log('nodes', nodes);

  useEffect(() => {
    const template = assets?.template;
    setSavedTemplate(template);
    onSaveInitial(template);
    if (!isChanged) {
      setTimeout(() => {
        onRestore(template);
      }, 200);
    }
  }, [assets, isChanged, copiedNode]);

  // Auto-fit canvas view on mount and when nodes/edges change
  // useEffect(() => {
  //   if (reactFlowInstance && nodes.length > 0) {
  //     const debouncedFitView = debounce(() => {
  //       reactFlowInstance.fitView({
  //         padding: 0.2,
  //         includeHiddenNodes: true,
  //         minZoom: 0.2,
  //         maxZoom: 2,
  //         duration: 500,
  //       });
  //       setZoomLevel(reactFlowInstance.getZoom());
  //     }, 5000);

  //     debouncedFitView();

  //     return () => {
  //       debouncedFitView.cancel();
  //     };
  //   }
  // }, [reactFlowInstance, nodes, edges, setZoomLevel]);

  const onInit = (rf) => {
    setReactFlowInstance(rf);
  };

  // useEffect(() => {
  //   console.log('useEffect 4');
  //   const handleKeyDown = (event) => {
  //     if ((event.ctrlKey || event.metaKey) && event.key === 's') {
  //       event.preventDefault();
  //       handleSaveToModel();
  //     }
  //   };
  //   window.addEventListener('keydown', handleKeyDown);
  //   return () => window.removeEventListener('keydown', handleKeyDown);
  // }, [nodes, edges]);

  const checkForNodes = () => {
    const [intersectingNodesMap, nodes] = getGroupedNodes();
    let values = Object.values(intersectingNodesMap).flat();
    let updated = nodes.map((item1) => {
      const match = values.find((item2) => item2.id === item1.id);
      return match ? match : item1;
    });
    setNodes(updated);
  };

  const onNodeDragStart = useCallback(
    (_, node) => {
      setIsChanged(true);
      setTimeout(() => checkForNodes(), 0);
      dragRef.current = node;
      latestNodesRef.current = [...nodes]; // Ensures ref is always synced before drag starts
    },
    [nodes]
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

    // Update refs for all moved nodes to prevent delta drift on next frame
    // nodesRef.current = currentNodes.map((n) => (updatedPositions.has(n.id) ? { ...n, position: updatedPositions.get(n.id) } : n));
  }, []);

  const onNodeDragStop = useCallback(() => {
    latestNodesRef.current = [...nodes]; // Update ref after drag stops
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
    const imageWidth = 1920;
    const imageHeight = 1080;

    const [tx, ty, zoom] = getTransformForBounds(getRectOfNodes(nodes), imageWidth, imageHeight, 0.5, 2);

    const startOffset = 20;
    const endOffset = 20;

    const handleMap = { a: 'top', b: 'left', c: 'bottom', d: 'right' };

    const resolveHandle = (h) => handleMap[h] || h;

    const escapeXML = (str) =>
      String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

    const getAbsolutePosition = (node) => {
      let x = node.position.x;
      let y = node.position.y;

      if (node.parentNode) {
        const parent = nodes.find((n) => n.id === node.parentNode);
        if (parent) {
          const [px, py] = getAbsolutePosition(parent);
          x += px;
          y += py;
        }
      }

      return [x, y];
    };

    const getHandlePoint = (node, handle) => {
      let [x, y] = getAbsolutePosition(node);
      const w = node.width;
      const h = node.height;

      switch (resolveHandle(handle)) {
        case 'top':
          return [x + w / 2, y];
        case 'bottom':
          return [x + w / 2, y + h];
        case 'left':
          return [x, y + h / 2];
        case 'right':
          return [x + w, y + h / 2];
        default:
          return [x + w / 2, y + h / 2];
      }
    };
    const getDistance = (x1, y1, x2, y2) => {
      const dx = x2 - x1;
      const dy = y2 - y1;
      return Math.sqrt(dx * dx + dy * dy);
    };

    const getStepPath = ({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, edge }) => {
      sourcePosition = resolveHandle(sourcePosition);
      targetPosition = resolveHandle(targetPosition);

      const distance = getDistance(sourceX, sourceY, targetX, targetY);

      let dynamicOffset = 40;
      if (distance > 150) dynamicOffset = 20;

      const maxXOffset = Math.abs(targetX - sourceX) / 2;
      const maxYOffset = Math.abs(targetY - sourceY) / 2;

      let offsetX = Math.min(dynamicOffset, maxXOffset);
      let offsetY = Math.min(dynamicOffset, maxYOffset);

      let p1x = sourceX;
      let p1y = sourceY;

      if (sourcePosition === 'top') p1y -= offsetY;
      if (sourcePosition === 'bottom') p1y += offsetY;
      if (sourcePosition === 'left') p1x -= offsetX;
      if (sourcePosition === 'right') p1x += offsetX;

      let p4x = targetX;
      let p4y = targetY;

      if (targetPosition === 'top') p4y -= offsetY;
      if (targetPosition === 'bottom') p4y += offsetY;
      if (targetPosition === 'left') p4x -= offsetX;
      if (targetPosition === 'right') p4x += offsetX;

      // ✅ Same-side HORIZONTAL adjustment
      if ((sourcePosition === 'left' && targetPosition === 'left') || (sourcePosition === 'right' && targetPosition === 'right')) {
        const sourceNode = nodes.find((n) => n.id === edge.source);
        const targetNode = nodes.find((n) => n.id === edge.target);
        const sourceWidth = sourceNode?.width || 0;
        const targetWidth = targetNode?.width || 0;

        const gapX = Math.abs(targetX - sourceX);
        const widthAvg = (sourceWidth + targetWidth) / 2;

        const pushExtra = Math.min(55, Math.max(35, gapX / 2, widthAvg / 3));

        if (sourcePosition === 'right' && targetX > sourceX) {
          p1x += pushExtra;
        }
        if (sourcePosition === 'left' && targetX < sourceX) {
          p1x -= pushExtra;
        }
      }

      // ✅ Same-side VERTICAL adjustment
      if ((sourcePosition === 'top' && targetPosition === 'top') || (sourcePosition === 'bottom' && targetPosition === 'bottom')) {
        const sourceNode = nodes.find((n) => n.id === edge.source);
        const targetNode = nodes.find((n) => n.id === edge.target);
        const sourceHeight = sourceNode?.height || 0;
        const targetHeight = targetNode?.height || 0;

        const gapY = Math.abs(targetY - sourceY);
        const heightAvg = (sourceHeight + targetHeight) / 2;

        const pushExtra = Math.min(55, Math.max(35, gapY / 2, heightAvg / 3));

        if (sourcePosition === 'bottom' && targetY > sourceY) {
          p1y += pushExtra;
        }
        if (sourcePosition === 'top' && targetY < sourceY) {
          p1y -= pushExtra;
        }
      }

      const horizontal = ['left', 'right'].includes(sourcePosition);
      const vertical = ['top', 'bottom'].includes(sourcePosition);

      const points = [`M ${sourceX} ${sourceY}`];

      if (horizontal) {
        const midY = p4y;
        points.push(`L ${p1x} ${sourceY}`);
        points.push(`L ${p1x} ${midY}`);
        points.push(`L ${p4x} ${midY}`);
        points.push(`L ${targetX} ${targetY}`);
      } else if (vertical) {
        const midX = p4x;
        points.push(`L ${sourceX} ${p1y}`);
        points.push(`L ${midX} ${p1y}`);
        points.push(`L ${midX} ${p4y}`);
        points.push(`L ${targetX} ${targetY}`);
      } else {
        points.push(`L ${targetX} ${targetY}`);
      }

      return points.join(' ');
    };

    const getLabelPosition = (path) => {
      const commands = path.split(/[A-Z]/).filter((cmd) => cmd.trim());
      const segments = [];
      for (let i = 1; i < commands.length; i++) {
        const prev = commands[i - 1].trim().split(/[ ,]/).filter(Number);
        const curr = commands[i].trim().split(/[ ,]/).filter(Number);
        if (prev.length >= 2 && curr.length >= 2) {
          segments.push({
            x1: parseFloat(prev[0]),
            y1: parseFloat(prev[1]),
            x2: parseFloat(curr[0]),
            y2: parseFloat(curr[1]),
            length: Math.hypot(curr[0] - prev[0], curr[1] - prev[1])
          });
        }
      }
      if (segments.length === 0) return { x: 0, y: 0 };
      const longestSegment = segments.reduce((max, seg) => (seg.length > max.length ? seg : max));
      return {
        x: (longestSegment.x1 + longestSegment.x2) / 2,
        y: (longestSegment.y1 + longestSegment.y2) / 2
      };
    };

    const markerMap = new Map();
    edges.forEach((edge) => {
      if (edge.style?.start && edge.markerStart?.color) {
        markerMap.set(`start-${edge.id}`, edge.markerStart.color);
      }
      if (edge.style?.end && edge.markerEnd?.color) {
        markerMap.set(`end-${edge.id}`, edge.markerEnd.color);
      }
    });

    const getMarkerDefs = () => {
      let defs = '';
      for (const [id, color] of markerMap.entries()) {
        const [markerType, ...rest] = id.split('-');
        const edgeId = rest.join('-');
        const edge = edges.find((e) => e.id === edgeId);
        if (!edge) continue;

        const markerSize = 6;
        const arrowSize = markerSize / 2;

        const handle = markerType === 'start' ? edge.sourceHandle : edge.targetHandle;
        const resolved = resolveHandle(handle);

        let path, refX, refY, orient;

        switch (resolved) {
          case 'right':
            path = `M0,${arrowSize} L${markerSize},${markerSize} L${markerSize},0 Z`;
            refX = 0;
            refY = arrowSize;
            orient = '0'; // Points right
            break;
          case 'left':
            path = `M0,0 L${markerSize},${arrowSize} L0,${markerSize} Z`;
            refX = markerSize;
            refY = arrowSize;
            orient = '0'; // Points left
            break;
          case 'top':
            path = `M0,0 L${arrowSize},${markerSize} L${markerSize},0 Z`;
            refX = arrowSize;
            refY = markerSize;
            orient = '0'; // Points up
            break;
          case 'bottom':
            path = `M0,${markerSize} L${arrowSize},0 L${markerSize},${markerSize} Z`;
            refX = arrowSize;
            refY = 0;
            orient = '0'; // Points down
            break;
          default:
            path = `M0,0 L${markerSize},${arrowSize} L0,${markerSize} Z`;
            refX = 0;
            refY = arrowSize;
            orient = 'auto';
        }

        defs += `<marker id="${id}" markerWidth="${markerSize}" markerHeight="${markerSize}" refX="${refX}" refY="${refY}" orient="${orient}">
      <path d="${path}" fill="${color}"/></marker>`;
      }
      return defs;
    };

    const svgParts = [];
    svgParts.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${imageWidth}" height="${imageHeight}" style="background: #F5F5F5">`);
    svgParts.push(`<defs>${getMarkerDefs()}</defs>`);
    svgParts.push(`<g transform="translate(${tx} ${ty}) scale(${zoom})">`);

    nodes
      .filter((n) => n.type === 'group')
      .forEach((group) => {
        const { x, y } = group.position;
        const { width, height } = group.style || group;
        const bg = group.data?.style?.background || 'rgba(33,150,243,0.05)';
        svgParts.push(
          `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${bg}" stroke="#555" stroke-dasharray="4" rx="8" ry="8"/>`
        );
        svgParts.push(
          `<text x="${x + width / 2}" y="${
            y + 20
          }" font-family="Inter" font-size="16" text-anchor="middle" text-rendering="optimizeLegibility">${escapeXML(
            group.data?.label || 'Group'
          )}</text>`
        );
      });

    edges.forEach((edge) => {
      const s = nodes.find((n) => n.id === edge.source);
      const t = nodes.find((n) => n.id === edge.target);
      if (!s || !t) return;

      const validHandles = ['top', 'left', 'bottom', 'right'];
      const sourceHandleOk = !edge.sourceHandle || validHandles.includes(resolveHandle(edge.sourceHandle));
      const targetHandleOk = !edge.targetHandle || validHandles.includes(resolveHandle(edge.targetHandle));
      if (!sourceHandleOk || !targetHandleOk) return;

      const [sx, sy] = getHandlePoint(s, edge.sourceHandle);
      const [tx2, ty2] = getHandlePoint(t, edge.targetHandle);

      const path = getStepPath({
        sourceX: sx,
        sourceY: sy,
        targetX: tx2,
        targetY: ty2,
        sourcePosition: edge.sourceHandle,
        targetPosition: edge.targetHandle,
        edge: edge
      });

      const stroke = edge.style?.stroke || '#000000';
      const markerStart = edge.style?.start && edge.markerStart?.color ? `url(#start-${edge.id})` : '';
      const markerEnd = edge.style?.end && edge.markerEnd?.color ? `url(#end-${edge.id})` : '';
      const label = edge.data?.label || '';
      const safeLabel = escapeXML(label);
      const labelPos = getLabelPosition(path);

      svgParts.push(
        `<path d="${path}" stroke="${stroke}" stroke-width="2" fill="none"
      ${markerStart ? `marker-start="${markerStart}"` : ''}
      ${markerEnd ? `marker-end="${markerEnd}"` : ''} />`
      );

      if (label) {
        svgParts.push(
          `<rect x="${labelPos.x - label.length * 3}" y="${labelPos.y - 8}" width="${
            label.length * 6
          }" height="16" rx="3" ry="3" fill="white" fill-opacity="0.85" stroke="none"/>`
        );
        svgParts.push(
          `<text x="${labelPos.x}" y="${labelPos.y}" font-family="Inter" font-size="10" fill="#333" text-anchor="middle" dominant-baseline="middle">${safeLabel}</text>`
        );
      }
    });

    nodes
      .filter((n) => n.type !== 'group')
      .forEach((node) => {
        const { x, y } = node.position;
        const { width, height } = node;
        const s = node.data?.style || {};
        const {
          backgroundColor = '#dadada',
          borderColor = 'gray',
          borderWidth = 2,
          color = 'black',
          fontFamily = 'Inter',
          fontSize = '12px'
        } = s;

        const fontSizeNum = parseInt(fontSize) || 12;

        const rx = node.type === 'data' ? height / 2 : 3;

        svgParts.push(
          `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${rx}" ry="${rx}" fill="${backgroundColor}" stroke="${borderColor}" stroke-width="${borderWidth}" />`
        );

        // === WRAP LABEL ===
        const label = node.data?.label || '';
        const safeLabel = escapeXML(label);

        const approxCharWidth = fontSizeNum * 0.55; // font dependent
        const maxCharsPerLine = Math.floor(width / approxCharWidth);

        const words = safeLabel.split(' ');
        const lines = [];
        let line = '';

        words.forEach((word) => {
          if ((line + ' ' + word).trim().length <= maxCharsPerLine) {
            line += (line ? ' ' : '') + word;
          } else {
            if (line) lines.push(line);
            line = word;
          }
        });
        if (line) lines.push(line);

        const totalTextHeight = lines.length * fontSizeNum;
        const startY = y + height / 2 - totalTextHeight / 2 + fontSizeNum * 0.8;

        svgParts.push(
          `<text x="${
            x + width / 2
          }" y="${startY}" font-family="${fontFamily}" font-size="${fontSizeNum}" fill="${color}" text-anchor="middle">`
        );

        lines.forEach((line, idx) => {
          svgParts.push(`<tspan x="${x + width / 2}" dy="${idx === 0 ? 0 : fontSizeNum}">${escapeXML(line)}</tspan>`);
        });

        svgParts.push(`</text>`);
      });

    svgParts.push(`</g></svg>`);

    const blob = new Blob([svgParts.join('')], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'final-diagram.svg';
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

  const onRestore = useCallback(
    (temp) => {
      if (temp) {
        setNodes(temp.nodes);
        setEdges(temp.edges);
        debouncedFitView();
      } else {
        handleClear();
      }
      setIsChanged(false);
    },
    [reactFlowInstance, assets, isChanged, debouncedFitView, copiedNode]
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
  const handleCloseSave = () => {
    setOpenSave(false);
    onRestore(assets?.template);
    setIsChanged(false);
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
        properties: edge?.properties ?? [],
        isAsset: edge.isAsset ?? false,
        style: edge.data.style ?? {},
        startPoint: edge.markerStart?.color ?? '#64B5F6',
        endPoint: edge.markerEnd?.color ?? '#64B6F6'
      })
    );
  };

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
    } else {
      notify('No copied node available', 'error');
    }
  };

  const handleMenuOptionClick = (option) => {
    if (option === 'Copy' && contextMenu.node && contextMenu.node.type !== 'group') {
      setCopiedNode([contextMenu.node]);
      notify('Node copied!', 'success');
    }

    if (option === 'Paste') {
      setIsChanged(true);
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
    // console.log('nodes', nodes);
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
            <Panel id="control-panel" position="top-left" style={{ display: 'flex', gap: 4, padding: '4px' }}>
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
            <Panel position="top-right">
              <IconButton onClick={() => setRunTour(true)} sx={{ color: '#1976d2', ml: 1 }} size="small">
                <HelpOutlineIcon fontSize="small" />
              </IconButton>
            </Panel>
            <Panel id="controls" position="bottom-left" style={{ display: 'flex', gap: 4, padding: '4px' }}>
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
