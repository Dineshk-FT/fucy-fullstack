/*eslint-disable*/
import React, { useCallback, useEffect, useState, useRef } from 'react';
import { Provider, useDispatch } from 'react-redux';
import EditProperties from '../Poppers/EditProperties';
import EditNode from '../Poppers/EditNode';
import { store } from '../../store';
import { setSelectedBlock } from '../../store/slices/CanvasSlice';
import { toast } from 'react-hot-toast';
import useStore from '../../store/Zustand/store';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import ColorTheme from '../../themes/ColorTheme';
import { fetchTaraModel, updateTaraModel, storeTaraModel } from '../../services/api';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  useTheme,
  useMediaQuery,
  List,
  ListItemButton,
  ListItemText,
  Typography,
  Divider,
  Collapse,
  Tooltip,
  CircularProgress,
  Select,
  MenuItem,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SettingsIcon from '@mui/icons-material/Settings';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ReactFlow, {
  ReactFlowProvider,
  useReactFlow,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  MarkerType,
  Handle,
  Position
} from 'reactflow';
import 'reactflow/dist/style.css';
import { v4 as uuidv4 } from 'uuid';

// Helper function to get contrasting text color (black or white)
const getContrastColor = (hexColor) => {
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
};

// Helper function to darken a color
const darkenColor = (hexColor, percent) => {
  let r = parseInt(hexColor.slice(1, 3), 16);
  let g = parseInt(hexColor.slice(3, 5), 16);
  let b = parseInt(hexColor.slice(5, 7), 16);
  r = Math.max(0, Math.floor(r * (100 - percent) / 100));
  g = Math.max(0, Math.floor(g * (100 - percent) / 100));
  b = Math.max(0, Math.floor(b * (100 - percent) / 100));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};

// Wrapper component to provide React Flow context
const FlowWrapper = ({ onNodesChange, onEdgesChange, onConnect, nodes, edges, onNodeDragStop }) => {
  const dispatch = useDispatch();
  const colors = ColorTheme();
  const reactFlowInstance = useReactFlow();
  const hasFittedView = useRef(false);

  useEffect(() => {
    if (nodes.length > 0 && !hasFittedView.current) {
      const timer = setTimeout(() => {
        reactFlowInstance.fitView({
          padding: 0.2,
          includeHiddenNodes: false,
          duration: 300,
        });
        hasFittedView.current = true;
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [nodes, reactFlowInstance]);

  const onNodeClick = useCallback((event, node) => {
    if (node) {
      dispatch(setSelectedBlock({ 
        id: node.id, 
        type: node.type, 
        data: node.data 
      }));
    }
  }, [dispatch]);

  return (
    <div style={{ width: '100%', height: '100%', backgroundColor: colors.canvasBG }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        fitView
        defaultViewport={{ x: 0, y: 0, zoom: 0.7 }}
        nodesDraggable={true}
        nodesConnectable={true}
        elementsSelectable={true}
        connectionLineStyle={{ 
          stroke: colors.borderColor, 
          strokeWidth: 2 
        }}
        connectionLineType="smoothstep"
        proOptions={{ 
          hideAttribution: true 
        }}
      >
        <Controls 
          style={{
            backgroundColor: colors.paperBg,
            borderRadius: '4px',
            border: `1px solid ${colors.borderColor}`,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        />
        <Background 
          variant="dots" 
          gap={12} 
          size={1} 
          color={colors.borderColor}
          style={{
            backgroundColor: colors.canvasBG
          }}
        />
      </ReactFlow>
    </div>
  );
};

// Import your custom node components
import CarImageNode from '../custom/nodes/CarImageNode';

// Memoized Edge Direction Select component
const EdgeDirectionSelect = React.memo(({ value, onChange, colors }) => (
  <Select
    value={value}
    onChange={onChange}
    size="small"
    sx={{
      color: colors.textPrimary,
      bgcolor: colors.paperBg,
      '.MuiSelect-select': {
        py: 0.5,
      },
      minWidth: '120px'
    }}
  >
    <MenuItem value="bidirectional">Bidirectional</MenuItem>
    <MenuItem value="leftToRight">Left to Right</MenuItem>
    <MenuItem value="rightToLeft">Right to Left</MenuItem>
  </Select>
));

EdgeDirectionSelect.displayName = 'EdgeDirectionSelect';

// Pastel color palette
const pastelColors = [
  '#FFD1DC', '#FFECB8', '#B5EAD7', '#C7CEEA', '#E2F0CB',
  '#FFDAC1', '#D4A5A5', '#B5E8E0', '#F8C8DC', '#C5E1A5',
  '#B3E5FC', '#D1C4E9',
];

// Simple component for threat/vulnerability/model nodes
const CustomNode = React.memo(({ id, data }) => {
  const colors = ColorTheme();
  const reactFlowInstance = useReactFlow();
  const [anchorEl, setAnchorEl] = useState(null);
  const [editAnchorEl, setEditAnchorEl] = useState(null);
  const dispatch = useDispatch();

  const handleEditClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setEditAnchorEl(event.currentTarget);
  };

  const handleCloseEdit = () => {
    setEditAnchorEl(null);
  };

  const onDelete = (event) => {
    event.preventDefault();
    event.stopPropagation();
    reactFlowInstance.setNodes((nodes) => nodes.filter((node) => node.id !== id));
    reactFlowInstance.setEdges((edges) => 
      edges.filter(edge => edge.source !== id && edge.target !== id)
    );
  };

  const handlePropertiesClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleCloseProperties = () => {
    setAnchorEl(null);
  };

  // Merge styles from data and style props
  const nodeStyle = {  
    position: 'relative',
    padding: '8px 25px 8px 30px',
    backgroundColor: data.bgColor || colors.paperBg,
    color: data.textColor || colors.textPrimary,
    borderRadius: '4px',
    border: `1px solid ${data.borderColor || colors.borderColor}`,
    fontSize: '12px',
    fontWeight: 'bold',
    whiteSpace: 'nowrap',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    cursor: 'move',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '60px',
    height: '30px',
    userSelect: 'none',
    transition: 'all 0.2s ease',
    ...data.style, // Apply any styles from data.style
    '&:hover': {
      transform: 'scale(1.05)',
      boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
    }
  };

  return (
    <Tooltip title={data.label || data.name || ''} arrow>
      <div style={nodeStyle}>
        {/* Left handle - both source and target */}
        <Handle
          type="source"
          position={Position.Left}
          style={{ top: '50%', transform: 'translateY(-50%)', background: '#555' }}
        />
        <Handle
          type="target"
          position={Position.Left}
          style={{ top: '50%', transform: 'translateY(-50%)', background: '#555' }}
        />
        
        {/* Top handle - both source and target */}
        <Handle
          type="source"
          position={Position.Top}
          style={{ left: '50%', transform: 'translateX(-50%)', background: '#555' }}
        />
        <Handle
          type="target"
          position={Position.Top}
          style={{ left: '50%', transform: 'translateX(-50%)', background: '#555' }}
        />
        
        {data.shortName || data.label}
        
        {/* Right handle - both source and target */}
        <Handle
          type="source"
          position={Position.Right}
          style={{ top: '50%', transform: 'translateY(-50%)', background: '#555' }}
        />
        <Handle
          type="target"
          position={Position.Right}
          style={{ top: '50%', transform: 'translateY(-50%)', background: '#555' }}
        />
        
        {/* Bottom handle - both source and target */}
        <Handle
          type="source"
          position={Position.Bottom}
          style={{ left: '50%', transform: 'translateX(-50%)', background: '#555' }}
        />
        <Handle
          type="target"
          position={Position.Bottom}
          style={{ left: '50%', transform: 'translateX(-50%)', background: '#555' }}
        />
        <IconButton
          onClick={onDelete}
          size="small"
          sx={{
            position: 'absolute',
            right: -8,
            top: -8,
            width: 18,
            height: 18,
            minHeight: 18,
            color: 'error.main',
            backgroundColor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            opacity: 0,
            visibility: 'hidden',
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: 'error.main',
              color: 'error.contrastText',
              opacity: 1,
              transform: 'scale(1.1)'
            },
            '.react-flow__node:hover &': {
              opacity: 0.9,
              visibility: 'visible'
            }
          }}
        >
          <DeleteOutlineIcon sx={{ fontSize: 12 }} />
        </IconButton>
        <IconButton
          onClick={handleEditClick}
          size="small"
          sx={{
            position: 'absolute',
            left: -8,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 18,
            height: 18,
            minHeight: 18,
            color: 'info.main',
            backgroundColor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            opacity: 0,
            visibility: 'hidden',
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: 'info.main',
              color: 'info.contrastText',
              opacity: 1,
              transform: 'translateY(-50%) scale(1.1)'
            },
            '.react-flow__node:hover &': {
              opacity: 0.9,
              visibility: 'visible'
            }
          }}
        >
          <EditIcon sx={{ fontSize: 12 }} />
        </IconButton>
        <IconButton
          onClick={handlePropertiesClick}
          size="small"
          sx={{
            position: 'absolute',
            right: -8,
            bottom: -8,
            width: 18,
            height: 18,
            minHeight: 18,
            color: 'primary.main',
            backgroundColor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            opacity: 0,
            visibility: 'hidden',
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: 'primary.main',
              color: 'primary.contrastText',
              opacity: 1,
              transform: 'scale(1.1)'
            },
            '.react-flow__node:hover &': {
              opacity: 0.9,
              visibility: 'visible'
            }
          }}
        >
          <SettingsIcon sx={{ fontSize: 12 }} />
        </IconButton>
      </div>
      {editAnchorEl && (  // Conditional render
        <EditNode
          anchorEl={editAnchorEl}
          handleClosePopper={handleCloseEdit}
          details={data}
          setDetails={(newData) => {
            reactFlowInstance.setNodes((nds) =>
              nds.map((node) =>
                node.id === id ? { ...node, data: { ...node.data, ...newData } } : node
              )
            );
          }}
          dispatch={dispatch}
          handleSaveEdit={handleCloseEdit}
          nodes={reactFlowInstance.getNodes()}
          setNodes={reactFlowInstance.setNodes}
          setEdges={reactFlowInstance.setEdges}
          selectedElement={data}
          setSelectedElement={(element) => {
            reactFlowInstance.setNodes((nds) =>
              nds.map((node) =>
                node.id === id ? { 
                  ...node, 
                  data: { 
                    ...node.data,
                    ...element,
                    ...(element?.style ? { style: element.style } : {})
                  }
                } : node
              )
            );
          }}
        />
      )}
      {anchorEl && (  // Conditional render
        <EditProperties
          anchorEl={anchorEl}
          handleClosePopper={handleCloseProperties}
          details={data}
          setDetails={(newData) => {
            reactFlowInstance.setNodes((nds) =>
              nds.map((node) =>
                node.id === id ? { ...node, data: { ...node.data, ...newData } } : node
              )
            );
          }}
          dispatch={dispatch}
          handleSaveEdit={() => {}}
          setNodes={reactFlowInstance.setNodes}
          setEdges={reactFlowInstance.setEdges}
        />
      )}
    </Tooltip>
  );
});

// Define node types
const nodeTypes = {
  carImage: CarImageNode,
  threatNode: CustomNode,
  modelNode: CustomNode,
};

// Format library data to match our component structure
const formatLibraryData = (libraries) => {
  if (!Array.isArray(libraries)) return [];
  const categorized = libraries.reduce((acc, lib) => {
    if (!lib?.category || !lib?.name) return acc;
    const category = lib.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push({
      id: lib._id || lib.name.toLowerCase().replace(/\s+/g, '-'),
      name: lib.name,
      ...lib
    });
    return acc;
  }, {});
  return Object.entries(categorized).map(([name, items]) => ({
    id: name.toLowerCase().replace(/\s+/g, '-'),
    name,
    items
  }));
};

const STORAGE_KEY_NODES = 'vehicleTaraNodes';
const STORAGE_KEY_EDGES = 'vehicleTaraEdges';
const STORAGE_KEY_VIEWPORT = 'vehicleTaraViewport';

const VehicleTARADialog = ({ open, onClose }) => {
  const theme = useTheme();
  const colors = ColorTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);
  const [models, setModels] = useState([]);
  const [isModelsLoading, setIsModelsLoading] = useState(false);
  const { getLibraries, getModels: fetchModels } = useStore();
  const [viewport, setViewport] = useState({ x: 0, y: 0, zoom: 0.7 });
  const [edgeDirection, setEdgeDirection] = useState('bidirectional');
  
  // Memoized edge direction change handler
  const handleEdgeDirectionChange = useCallback((e) => {
    setEdgeDirection(e.target.value);
  }, []);
  const reactFlowInstance = useReactFlow();
  const carNodeRef = useRef(null);
  const dragRef = useRef(null);

  useEffect(() => {
    const loadModels = async () => {
      try {
        setIsModelsLoading(true);
        await fetchModels();
        const { Models } = useStore.getState();
        setModels(Models || []);
      } catch (error) {
        console.error('Error loading models:', error);
      } finally {
        setIsModelsLoading(false);
      }
    };

    if (open) {
      loadModels();
    }
  }, [open, fetchModels]);

  const onMove = useCallback((event, viewport) => {
    setViewport(viewport);
  }, []);

  const saveViewport = useCallback((vp) => {
    setViewport(vp);
  }, []);

  useEffect(() => {
    if (nodes.length > 0) {
      const carNode = nodes.find(node => node?.id?.startsWith('car-'));
      if (carNode) {
        carNodeRef.current = { ...carNode };
      }
    }
  }, [nodes]);

  const handleAddCarImage = useCallback(() => {
    const dialogWidth = Math.floor(window.innerWidth * 0.81);
    const dialogHeight = Math.floor(window.innerHeight * 0.81);
    const cappedWidth = Math.min(dialogWidth, 1200);
    const cappedHeight = Math.min(dialogHeight, 800);
    const carNodeId = `car-${uuidv4()}`;
    const newNode = {
      id: carNodeId,
      type: 'carImage',
      position: { x: 50, y: 50 },
      data: { properties: [] },
      style: {
        width: `${cappedWidth}px`,
        height: `${cappedHeight}px`,
        maxWidth: '100%',
        maxHeight: '100%',
        objectFit: 'contain'
      },
      draggable: true,
      selectable: true,
      isParent: true
    };
    setNodes(nds => {
      const otherNodes = nds.filter(n => !n.id.startsWith('car-'));
      return [...otherNodes, newNode];
    });
    return newNode;
  }, [setNodes]);

  const modelId = useStore(state => state.model?._id) || window.location.pathname.split('/').pop();

  const fetchTaraModelData = useCallback(async () => {
    if (!open || !modelId) {
      console.error('No model ID available for fetching TARA model');
      return;
    }
    setIsLoading(true);
    try {
      const data = await fetchTaraModel(modelId);
      if (data.vehicleTaraNodes && data.vehicleTaraEdges) {
        const parsedNodes = Array.isArray(data.vehicleTaraNodes) 
          ? data.vehicleTaraNodes 
          : JSON.parse(data.vehicleTaraNodes);
        const parsedEdges = Array.isArray(data.vehicleTaraEdges)
          ? data.vehicleTaraEdges
          : JSON.parse(data.vehicleTaraEdges);
        const processedNodes = parsedNodes.map(node => ({
          ...node,
          position: node.position || { x: 0, y: 0 },
          data: node.data || { properties: [] },
          style: node.style || {},
          draggable: node.draggable !== false,
          selectable: node.selectable !== false,
          width: undefined,
          height: undefined,
          selected: false,
          dragging: false,
          positionAbsolute: undefined
        }));
        setNodes(processedNodes);
        setEdges(parsedEdges);
        if (data.vehicleTaraViewport) {
          const viewport = typeof data.vehicleTaraViewport === 'string' 
            ? JSON.parse(data.vehicleTaraViewport)
            : data.vehicleTaraViewport;
          reactFlowInstance.setViewport(viewport);
        }
      } else {
        handleAddCarImage();
      }
    } catch (error) {
      console.error('Error fetching TARA model:', error);
      handleAddCarImage();
    } finally {
      setIsLoading(false);
    }
  }, [open, reactFlowInstance, handleAddCarImage]);

  useEffect(() => {
    if (!open) {
      setNodes([]);
      setEdges([]);
      return;
    }
    setNodes([]);
    setEdges([]);
    fetchTaraModelData();
    return () => {
      setNodes([]);
      setEdges([]);
    };
  }, [open, modelId, setNodes, setEdges, fetchTaraModelData]);

  useEffect(() => {
    const fetchLibraries = async () => {
      if (!open) return;
      setIsLoading(true);
      setError(null);
      try {
        const librariesData = await getLibraries();
        if (Array.isArray(librariesData)) {
          const formattedCategories = formatLibraryData(librariesData);
          setCategories(formattedCategories);
          if (formattedCategories.length > 0) {
            setExpandedCategories(prev => ({
              ...prev,
              [formattedCategories[0].id]: true
            }));
          }
        }
      } catch (err) {
        console.error('Error fetching libraries:', err);
        setError('Failed to load libraries');
        toast.error('Failed to load libraries');
      } finally {
        setIsLoading(false);
      }
    };
    fetchLibraries();
  }, [open, getLibraries]);

  const handleUpdateTaraModel = useCallback(async (nodesToUpdate, edgesToUpdate, viewport) => {
    if (!modelId) {
      console.error('No model ID available for updating TARA model');
      throw new Error('No model ID available');
    }
    try {
      return await updateTaraModel(modelId, nodesToUpdate, edgesToUpdate, viewport);
    } catch (error) {
      console.error('Error updating TARA model:', error);
      throw error;
    }
  }, [modelId]);

  const hasExistingData = useRef(false);

  useEffect(() => {
    if (nodes.length > 0 || edges.length > 0) {
      hasExistingData.current = true;
    }
  }, [nodes, edges]);

  const handleSave = useCallback(async () => {
    if (!modelId) {
      toast.error('No model ID available. Please ensure you have an active model.');
      return;
    }
    setIsSaving(true);
    try {
      const nodesToSave = nodes.map(node => ({
        ...node,
        position: { ...node.position },
        selected: false,
        dragging: false,
        width: undefined,
        height: undefined,
        positionAbsolute: undefined
      }));
      const viewport = reactFlowInstance.getViewport();
      if (hasExistingData.current) {
        await updateTaraModel(modelId, nodesToSave, edges, viewport);
        toast.success('TARA model updated successfully');
      } else {
        await storeTaraModel(modelId, nodesToSave, edges, viewport);
        hasExistingData.current = true;
        toast.success('TARA model saved successfully');
      }
    } catch (error) {
      console.error('Error saving TARA model:', error);
      toast.error(`Failed to save TARA model: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  }, [nodes, edges, reactFlowInstance, modelId]);

  const handleClear = useCallback(async () => {
    if (!window.confirm('Are you sure you want to clear all nodes and edges? This action cannot be undone.')) {
      return;
    }
    try {
      setNodes([]);
      setEdges([]);
      if (reactFlowInstance) {
        reactFlowInstance.setViewport({ x: 0, y: 0, zoom: 1 });
      }
      hasExistingData.current = false;
      await new Promise(resolve => setTimeout(resolve, 100));
      await handleAddCarImage();
      toast.success('Canvas cleared and reset to default');
    } catch (error) {
      console.error('Error clearing canvas:', error);
      toast.error('Failed to clear canvas');
    }
  }, [setNodes, setEdges, handleAddCarImage, reactFlowInstance]);

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const handleDragStart = (e, item, type) => {
    // Create a custom drag image
    const dragImage = document.createElement('div');
    dragImage.innerText = item.name;
    dragImage.style.padding = '8px';
    dragImage.style.background = colors.paperBg;
    dragImage.style.border = `1px solid ${colors.borderColor}`;
    dragImage.style.borderRadius = '4px';
    dragImage.style.opacity = '0.8';
    dragImage.style.fontSize = '12px';
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 0, 0);
    
    // Store item data
    e.dataTransfer.setData('application/reactflow', JSON.stringify({
      type,
      data: item
    }));
    e.dataTransfer.effectAllowed = 'move';
    
    // Clean up drag image after drag ends
    setTimeout(() => {
      document.body.removeChild(dragImage);
    }, 0);
    
    // Add visual feedback
    e.currentTarget.style.opacity = '0.6';
  };

  const handleDragEnd = (e) => {
    // Reset opacity after drag ends
    e.currentTarget.style.opacity = '1';
  };

  const onNodeDragStop = useCallback((event, node) => {
    if (node.id.startsWith('threat-') || node.id.startsWith('model-')) {
      const carNode = nodes.find(n => n.id.startsWith('car-'));
      if (carNode) {
        setNodes((nds) =>
          nds.map((n) => {
            if (n.id === node.id) {
              return {
                ...n,
                data: {
                  ...n.data,
                  relativePosition: {
                    x: node.position.x - carNode.position.x,
                    y: node.position.y - carNode.position.y
                  }
                }
              };
            }
            return n;
          })
        );
      }
    }
  }, [nodes, setNodes]);

  const handleNodesChange = useCallback(
    (changes) => {
      setNodes((nds) => {
        const nextNodes = applyNodeChanges(changes, nds);
        const carNodeChange = changes.find(change => 
          change.type === 'position' && change.id.startsWith('car-')
        );
        if (carNodeChange && carNodeRef.current) {
          const carNode = nextNodes.find(n => n.id === carNodeChange.id);
          if (carNode) {
            const dx = carNode.position.x - carNodeRef.current.position.x;
            const dy = carNode.position.y - carNodeRef.current.position.y;
            return nextNodes.map(node => {
              if (node.id.startsWith('threat-') || node.id.startsWith('model-')) {
                return {
                  ...node,
                  position: {
                    x: node.position.x + dx,
                    y: node.position.y + dy
                  }
                };
              }
              return node;
            });
          }
        }
        const movedCarNode = nextNodes.find(n => n.id.startsWith('car-'));
        if (movedCarNode) {
          carNodeRef.current = { ...movedCarNode };
        }
        return nextNodes;
      });
    },
    [setNodes]
  );

  const handleEdgesChange = useCallback(
    (changes) => onEdgesChange(changes),
    [onEdgesChange]
  );

  const onConnect = useCallback(
    (connection) => {
      setEdges((eds) => {
        let newEdge = {
          ...connection,
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#555', strokeWidth: 2 },
        };

        if (edgeDirection === 'bidirectional') {
          newEdge.markerStart = { type: MarkerType.ArrowClosed, color: '#555', width: 20, height: 20 };
          newEdge.markerEnd = { type: MarkerType.ArrowClosed, color: '#555', width: 20, height: 20 };
        } else if (edgeDirection === 'leftToRight') {
          newEdge.markerEnd = { type: MarkerType.ArrowClosed, color: '#555', width: 20, height: 20 };
        } else if (edgeDirection === 'rightToLeft') {
          newEdge.markerStart = { type: MarkerType.ArrowClosed, color: '#555', width: 20, height: 20 };
        }

        return addEdge(newEdge, eds);
      });
    },
    [setEdges, edgeDirection]
  );

  const onDrop = useCallback((event) => {
    event.preventDefault();
    const reactFlowBounds = event.currentTarget.getBoundingClientRect();
    const item = JSON.parse(event.dataTransfer.getData('application/reactflow'));
    if (item.type !== 'taraItem' && item.type !== 'modelItem') return;
    const position = {
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top
    };
    const shortName = item.data.name
      .split(' ')
      .map(word => word[0]?.toUpperCase() || '')
      .join('')
      .substring(0, 3);
    const bgColor = pastelColors[Math.floor(Math.random() * pastelColors.length)];
    const carNode = nodes.find(n => n.id.startsWith('car-'));
    const newNode = {
      id: `${item.type === 'taraItem' ? 'threat' : 'model'}-${uuidv4()}`,
      type: item.type === 'taraItem' ? 'threatNode' : 'modelNode',
      position: carNode ? {
        x: position.x - carNode.position.x,
        y: position.y - carNode.position.y
      } : position,
      data: { 
        label: item.data.name,
        shortName,
        bgColor,
        textColor: getContrastColor(bgColor),
        borderColor: darkenColor(bgColor, 20),
        ...item.data,
        relativePosition: carNode ? {
          x: position.x - carNode.position.x,
          y: position.y - carNode.position.y
        } : position
      },
      draggable: true,
      selectable: true
    };
    setNodes((nds) => [...nds, newNode]);
  }, [setNodes]);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  React.useEffect(() => {
    if (open) {
      setNodes([]);
      setEdges([]);
      const timer = setTimeout(() => {
        handleAddCarImage();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [open, handleAddCarImage, setNodes, setEdges]);

  return (
    <Dialog
      fullScreen={fullScreen}
      maxWidth="lg"
      fullWidth
      open={open}
      onClose={onClose}
      aria-labelledby="vehicle-tara-dialog"
      PaperProps={{
        style: {
          height: '90vh',
          maxHeight: '90vh',
          margin: '5vh auto',
          width: '90%',
          maxWidth: '90%',
          borderRadius: '12px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }
      }}
    >
      <DialogTitle sx={{ 
        m: 0, 
        p: 2,
        backgroundColor: colors.sidebarBG,
        color: colors.textPrimary,
        borderBottom: `1px solid ${colors.borderColor}`
      }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" sx={{ color: colors.textPrimary }}>Vehicle TARA Analysis</Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <Tooltip title="Select edge direction">
              <EdgeDirectionSelect 
                value={edgeDirection} 
                onChange={handleEdgeDirectionChange}
                colors={colors}
              />
            </Tooltip>
            <Tooltip title="Save progress">
              <IconButton 
                onClick={handleSave} 
                disabled={isSaving || nodes.length === 0}
                color="primary"
              >
                {isSaving ? <CircularProgress size={24} /> : <SaveIcon />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Clear canvas">
              <IconButton 
                onClick={handleClear} 
                disabled={nodes.length === 0}
                color="error"
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ 
        p: 0, 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'row', 
        overflow: 'hidden', 
        position: 'relative',
        backgroundColor: colors.canvasBG,
        color: colors.textPrimary
      }}>
        {/* Left Panel - Models */}
        <Box 
          sx={{ 
            width: isLeftPanelOpen ? '250px' : 0,
            height: '100%',
            overflowY: 'auto',
            backgroundColor: colors.paperBg,
            color: colors.textPrimary,
            borderRight: `1px solid ${colors.borderColor}`,
            transition: 'width 0.2s ease-in-out',
            position: 'relative',
            zIndex: 5
          }}
        >
          <Box sx={{ 
            p: 2, 
            borderBottom: `1px solid ${colors.borderColor}`, 
            whiteSpace: 'nowrap',
            backgroundColor: colors.sidebarBG,
            position: 'sticky',
            top: 0,
            zIndex: 1
          }}>
            <Typography 
              variant="h6" 
              component="div" 
              noWrap
              sx={{ color: colors.textPrimary }}
            >
              Vehicle Models
            </Typography>
            <Typography 
              variant="body2" 
              noWrap
              sx={{ color: colors.textSecondary }}
            >
              Drag items to the canvas
            </Typography>
          </Box>
          
          {isModelsLoading ? (
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
              <CircularProgress size={24} />
            </Box>
          ) : models.length === 0 ? (
            <Box sx={{ p: 2, color: 'text.secondary' }}>
              <Typography variant="body2">No models found</Typography>
            </Box>
          ) : (
            <List disablePadding>
              {models.map((model) => (
                <ListItemButton
                  key={model.id || model._id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, model, 'modelItem')}
                  onDragEnd={handleDragEnd}
                  sx={{
                    py: 1,
                    px: 2,
                    '&:hover': { 
                      backgroundColor: 'action.hover',
                    },
                    '&.Mui-selected': {
                      backgroundColor: 'action.selected',
                    },
                    transition: 'opacity 0.2s ease',
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography 
                        variant="body2"
                        sx={{
                          fontWeight: 500,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {model.name || model.model_name || 'Unnamed Model'}
                      </Typography>
                    }
                    secondary={
                      <Typography 
                        variant="caption" 
                        sx={{
                          color: 'text.secondary',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {model.description || 'No description'}
                      </Typography>
                    }
                  />
                </ListItemButton>
              ))}
            </List>
          )}
        </Box>

        {/* Left Panel Toggle Button */}
        <Box 
          sx={{ 
            position: 'absolute',
            left: isLeftPanelOpen ? '250px' : 0,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 10,
            transition: 'left 0.2s ease-in-out'
          }}
        >
          <Tooltip title={isLeftPanelOpen ? 'Hide models' : 'Show models'}>
            <IconButton 
              onClick={() => setIsLeftPanelOpen(!isLeftPanelOpen)}
              sx={{
                backgroundColor: colors.paperBg,
                color: colors.textPrimary,
                borderRadius: '0 4px 4px 0',
                border: `1px solid ${colors.borderColor}`,
                borderLeft: 'none',
                '&:hover': {
                  backgroundColor: colors.buttonHoverBg
                }
              }}
            >
              {isLeftPanelOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
            </IconButton>
          </Tooltip>
        </Box>

        {/* Main Content Area */}
        <Box sx={{ 
          flex: 1, 
          position: 'relative', 
          minHeight: '60vh', 
          borderRight: `1px solid ${colors.borderColor}`,
          backgroundColor: colors.canvasBG,
          marginLeft: isLeftPanelOpen ? 0 : '-1px',
          transition: 'margin-left 0.2s ease-in-out'
        }}>
          <ReactFlowProvider>
            <Provider store={store}>
              <div 
                style={{ width: '100%', height: '100%' }}
                onDrop={onDrop}
                onDragOver={onDragOver}
              >
                <FlowWrapper
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={handleNodesChange}
                  onEdgesChange={handleEdgesChange}
                  onConnect={onConnect}
                  onNodeDragStop={onNodeDragStop}
                />
              </div>
            </Provider>
          </ReactFlowProvider>
        </Box>
        
        {/* Right Panel Toggle Button */}
        <Box 
          sx={{ 
            position: 'absolute',
            right: isPanelOpen ? '300px' : 0,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 10,
            transition: 'right 0.2s ease-in-out'
          }}
        >
          <Tooltip title={isPanelOpen ? 'Collapse panel' : 'Expand panel'}>
            <IconButton 
              onClick={() => setIsPanelOpen(!isPanelOpen)}
              sx={{
                backgroundColor: colors.paperBg,
                color: colors.textPrimary,
                borderRadius: '4px 0 0 4px',
                border: `1px solid ${colors.borderColor}`,
                borderRight: 'none',
                '&:hover': {
                  backgroundColor: colors.buttonHoverBg
                }
              }}
            >
              {isPanelOpen ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </IconButton>
          </Tooltip>
        </Box>

        {/* Right Panel - Libraries */}
        <Box 
          sx={{ 
            width: isPanelOpen ? '300px' : 0,
            height: '100%',
            overflow: 'hidden',
            backgroundColor: colors.paperBg,
            color: colors.textPrimary,
            borderLeft: `1px solid ${colors.borderColor}`,
            transition: 'width 0.2s ease-in-out',
            borderLeft: isPanelOpen ? '1px solid #e0e0e0' : 'none'
          }}
        >
          <Box sx={{ 
            p: 2, 
            borderBottom: `1px solid ${colors.borderColor}`, 
            whiteSpace: 'nowrap',
            backgroundColor: colors.sidebarBG
          }}>
            <Typography 
              variant="h6" 
              component="div" 
              noWrap
              sx={{ color: colors.textPrimary }}
            >
              TARA Library
            </Typography>
            <Typography 
              variant="body2" 
              noWrap
              sx={{ color: colors.textSecondary }}
            >
              Drag items to the canvas
            </Typography>
          </Box>
          
          {isLoading ? (
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
              <CircularProgress size={24} />
            </Box>
          ) : error ? (
            <Box sx={{ p: 2, color: 'error.main' }}>
              <Typography variant="body2">{error}</Typography>
            </Box>
          ) : categories.length === 0 ? (
            <Box sx={{ p: 2, color: 'text.secondary' }}>
              <Typography variant="body2">No categories found</Typography>
            </Box>
          ) : (
            <List disablePadding>
              {categories.map((category) => (
              <div key={category.id}>
                <ListItemButton
                  onClick={() => toggleCategory(category.id)}
                  sx={{
                    py: 0.5,
                    '&:hover': { 
                      backgroundColor: 'action.hover',
                    },
                    '&.Mui-selected': {
                      backgroundColor: 'action.selected',
                    },
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {category.name}
                      </Typography>
                    }
                  />
                  {expandedCategories[category.id] ? (
                    <ExpandLessIcon fontSize="small" />
                  ) : (
                    <ExpandMoreIcon fontSize="small" />
                  )}
                </ListItemButton>
                
                <Collapse in={expandedCategories[category.id]} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {category.items.map((item) => (
                      <ListItemButton
                        key={item.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, item, 'taraItem')}
                        onDragEnd={handleDragEnd}
                        sx={{
                          pl: 4,
                          py: 0.5,
                          '&:hover': {
                            backgroundColor: 'action.hover',
                          },
                          transition: 'opacity 0.2s ease',
                        }}
                      >
                        <ListItemText
                          primary={
                            <Typography 
                              variant="body2"
                              sx={{
                                color: 'text.secondary',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {item.name}
                            </Typography>
                          }
                        />
                      </ListItemButton>
                    ))}
                  </List>
                </Collapse>
                <Divider />
              </div>
              ))}
            </List>
          )}
        </Box>
        
      </DialogContent>
    </Dialog>
  );
};

export default VehicleTARADialog;