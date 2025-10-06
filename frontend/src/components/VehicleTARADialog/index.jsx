import React, { useCallback, useEffect, useState, useRef } from 'react';
import { Provider, useDispatch } from 'react-redux';
import { store } from '../../store';
import { setSelectedBlock } from '../../store/slices/CanvasSlice';
import { toast } from 'react-hot-toast';
import useStore from '../../store/Zustand/store';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
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
  CircularProgress
} from '@mui/material';
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
  Controls,
  Background,
//   MiniMap,
  applyNodeChanges
} from 'reactflow';
import 'reactflow/dist/style.css';
import { v4 as uuidv4 } from 'uuid';

// Helper function to get contrasting text color (black or white)
const getContrastColor = (hexColor) => {
  // Convert hex to RGB
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  
  // Calculate luminance (perceived brightness)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return black for light colors, white for dark colors
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
};

// Helper function to darken a color
const darkenColor = (hexColor, percent) => {
  // Convert hex to RGB
  let r = parseInt(hexColor.slice(1, 3), 16);
  let g = parseInt(hexColor.slice(3, 5), 16);
  let b = parseInt(hexColor.slice(5, 7), 16);
  
  // Darken each component
  r = Math.max(0, Math.floor(r * (100 - percent) / 100));
  g = Math.max(0, Math.floor(g * (100 - percent) / 100));
  b = Math.max(0, Math.floor(b * (100 - percent) / 100));
  
  // Convert back to hex
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};

// Wrapper component to provide React Flow context
const FlowWrapper = ({ onNodesChange, onEdgesChange, onConnect, nodes, edges, onNodeDragStop }) => {
  const dispatch = useDispatch();
  const reactFlowInstance = useReactFlow();
  const prevNodesLength = useRef(nodes?.length || 0);
  
  // Fit view when nodes are loaded or changed
  useEffect(() => {
    if (nodes.length > 0 && (nodes.length !== prevNodesLength.current || nodes.some(n => n.id.startsWith('car-')))) {
      // Use setTimeout to ensure the nodes are rendered before fitting the view
      const timer = setTimeout(() => {
        reactFlowInstance.fitView({
          padding: 0.2,
          includeHiddenNodes: false,
          duration: 300,
        });
      }, 100);
      
      prevNodesLength.current = nodes.length;
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
    <div style={{ width: '100%', height: '100%' }}>
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
        nodesConnectable={false}
        elementsSelectable={true}
        proOptions={{ hideAttribution: true }}
      >
        <Controls />
        {/* <MiniMap /> */}
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
    </div>
  );
};

// Import your custom node components
import CarImageNode from '../custom/nodes/CarImageNode';

// Pastel color palette
const pastelColors = [
  '#FFD1DC', // Pastel Pink
  '#FFECB8', // Pastel Yellow
  '#B5EAD7', // Pastel Green
  '#C7CEEA', // Pastel Blue
  '#E2F0CB', // Pastel Mint
  '#FFDAC1', // Pastel Orange
  '#D4A5A5', // Pastel Red
  '#B5E8E0', // Pastel Teal
  '#F8C8DC', // Pastel Pink 2
  '#C5E1A5', // Pastel Green 2
  '#B3E5FC', // Pastel Light Blue
  '#D1C4E9', // Pastel Purple
];

// Simple component for threat/vulnerability nodes
const ThreatNode = ({ data }) => {
  return (
    <Tooltip title={data.label || data.name || ''} arrow>
      <div style={{
        padding: '8px 12px',
        backgroundColor: data.bgColor || '#f5f5f5',
        color: data.textColor || '#333',
        borderRadius: '4px',
        border: `1px solid ${data.borderColor || '#ddd'}`,
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
        '&:hover': {
          transform: 'scale(1.05)',
          boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
        }
      }}>
        {data.shortName || data.label}
      </div>
    </Tooltip>
  );
};

// Define node types
const nodeTypes = {
  carImage: CarImageNode,
  threatNode: ThreatNode,
};

// Format library data to match our component structure
const formatLibraryData = (libraries) => {
  if (!Array.isArray(libraries)) return [];
  
  // Group libraries by category
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

  // Convert to array format
  return Object.entries(categorized).map(([name, items]) => ({
    id: name.toLowerCase().replace(/\s+/g, '-'),
    name,
    items
  }));
};

const STORAGE_KEY = 'vehicleTaraNodes';

const VehicleTARADialog = ({ open, onClose }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const [nodes, setNodes] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useNodesState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const { getLibraries } = useStore();
  
  // Track the car node's previous position
  const carNodeRef = useRef(null);
  
  // Update car node reference and save to localStorage when nodes change
  useEffect(() => {
    if (nodes.length > 0) {
      const carNode = nodes.find(node => node?.id?.startsWith('car-'));
      if (carNode) {
        carNodeRef.current = { ...carNode };
      }
      
      const timer = setTimeout(() => {
        try {
          if (nodes.some(n => n?.id?.startsWith('car-'))) {
            // Clone and strip read-only props before save
            const nodesToSave = nodes.map(node => ({
              ...node,
              // Force undefined to prevent persisting measurements
              width: undefined,
              height: undefined,
              // Strip transients
              positionAbsolute: undefined,
              selected: false,
              dragging: false
            }));
            
            localStorage.setItem(STORAGE_KEY, JSON.stringify(nodesToSave));
          }
        } catch (error) {
          console.error('Error saving nodes:', error);
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [nodes]);
  
  // Define handleAddCarImage first since it's used in the effect
  const handleAddCarImage = useCallback(() => {
    // Compute large sizes (90% of 90% = 81% viewport)
    const dialogWidth = Math.floor(window.innerWidth * 0.81);
    const dialogHeight = Math.floor(window.innerHeight * 0.81);
    
    // Cap to prevent overflow on large screens
    const cappedWidth = Math.min(dialogWidth, 1200);
    const cappedHeight = Math.min(dialogHeight, 800);
    
    const carNodeId = `car-${uuidv4()}`;
    const newNode = {
      id: carNodeId,
      type: 'carImage',
      position: { x: 50, y: 50 },
      data: { properties: [] },
      style: {
        width: `${cappedWidth}px`,  // String px for CSS
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

  // Load saved nodes from localStorage when component mounts or opens
  useEffect(() => {
    if (!open) {
      // Reset nodes when dialog is closed
      setNodes([]);
      return;
    }
    
    const loadSavedNodes = () => {
      try {
        const savedNodes = localStorage.getItem(STORAGE_KEY);
        
        if (savedNodes) {
          const parsedNodes = JSON.parse(savedNodes);
          
          if (Array.isArray(parsedNodes) && parsedNodes.length > 0) {
            const validNodes = parsedNodes.map(node => {
              // For car: Recompute style if needed
              if (node.id?.startsWith('car-')) {
                const dialogWidth = Math.floor(window.innerWidth * 0.81);
                const dialogHeight = Math.floor(window.innerHeight * 0.81);
                const cappedWidth = Math.min(dialogWidth, 1200);
                const cappedHeight = Math.min(dialogHeight, 800);
                
                node.style = {
                  ...node.style,
                  width: `${cappedWidth}px`,
                  height: `${cappedHeight}px`
                };
              }
              
              return {
                ...node,
                position: node.position && typeof node.position === 'object' 
                  ? { x: node.position.x || 0, y: node.position.y || 0 } 
                  : { x: 0, y: 0 },
                data: node.data || { properties: [] },
                style: node.style || {},
                // Force undefined – RF will re-measure large based on style
                width: undefined,
                height: undefined,
                draggable: node.draggable !== false,
                selectable: node.selectable !== false
              };
            });
            
            setNodes(validNodes);
            return;
          }
        }
        
        handleAddCarImage();
        
      } catch (error) {
        handleAddCarImage();
      }
    };
    
    // Use requestAnimationFrame to ensure React has finished any pending updates
    const timer = requestAnimationFrame(loadSavedNodes);
    
    // Cleanup function
    return () => {
      cancelAnimationFrame(timer);
      setNodes([]);
    };
  }, [open, setNodes, handleAddCarImage]);

  // Fetch libraries when component mounts or opens
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
          
          // Auto-expand first category if available
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

  // Save nodes to localStorage (now mostly handled by the auto-save effect)
  const handleSave = useCallback(() => {
    setIsSaving(true);
    try {
      const nodesToSave = nodes.map(node => ({
        ...node,
        width: undefined,
        height: undefined,
        positionAbsolute: undefined,
        selected: false,
        dragging: false
      }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nodesToSave));
      toast.success('Progress saved successfully');
    } catch (error) {
      console.error('Error saving nodes:', error);
      toast.error('Failed to save progress');
    } finally {
      setIsSaving(false);
    }
  }, [nodes]);

  // Clear all nodes and reset to default car
  const handleClear = useCallback(() => {
    if (window.confirm('Are you sure you want to clear all nodes? This action cannot be undone.')) {
      try {
        localStorage.removeItem(STORAGE_KEY);
        setNodes([]);
        setEdges([]);
        // Add a small delay to ensure nodes are cleared before adding new car
        setTimeout(() => {
          handleAddCarImage();
        }, 100);
        toast.success('Canvas cleared');
      } catch (error) {
        console.error('Error clearing nodes:', error);
        toast.error('Failed to clear canvas');
      }
    }
  }, [setNodes, setEdges, handleAddCarImage]);
  
  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };
  
  const handleDragStart = (e, item) => {
    e.dataTransfer.setData('application/reactflow', JSON.stringify({
      type: 'taraItem',
      data: item
    }));
    e.dataTransfer.effectAllowed = 'move';
  };

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );
  
  // Handle node drag stop to update relative positions
  const onNodeDragStop = useCallback((event, node) => {
    if (node.id.startsWith('threat-')) {
      const carNode = nodes.find(n => n.id.startsWith('car-'));
      if (carNode) {
        setNodes((nds) =>
          nds.map((n) => {
            if (n.id === node.id) {
              return {
                ...n,
                data: {
                  ...n.data,
                  // Update relative position to car node
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

  // Handle node changes (including drag)
  const onNodesChange = useCallback(
    (changes) => {
      setNodes((nds) => {
        // First apply the changes
        const nextNodes = applyNodeChanges(changes, nds);
        
        // Check if the car node is being dragged
        const carNodeChange = changes.find(change => 
          change.type === 'position' && change.id.startsWith('car-')
        );
        
        if (carNodeChange && carNodeRef.current) {
          const carNode = nextNodes.find(n => n.id === carNodeChange.id);
          if (carNode) {
            // Calculate the movement delta
            const dx = carNode.position.x - carNodeRef.current.position.x;
            const dy = carNode.position.y - carNodeRef.current.position.y;
            
            // Update all threat nodes' positions
            return nextNodes.map(node => {
              if (node.id.startsWith('threat-')) {
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
        
        // Update the car node reference if it was moved
        const movedCarNode = nextNodes.find(n => n.id.startsWith('car-'));
        if (movedCarNode) {
          carNodeRef.current = { ...movedCarNode };
        }
        
        return nextNodes;
      });
    },
    [setNodes]
  );

  // Handle dropping items onto the canvas
  const onDrop = useCallback((event) => {
    event.preventDefault();
    
    // Get the dropped item data
    const reactFlowBounds = event.currentTarget.getBoundingClientRect();
    const item = JSON.parse(event.dataTransfer.getData('application/reactflow'));
    
    // Only handle our custom drop type
    if (item.type !== 'taraItem') return;
    
    // Get the drop position relative to the React Flow container
    const position = {
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top
    };
    
    // Generate a short name (first letter of each word, up to 3 letters)
    const shortName = item.data.name
      .split(' ')
      .map(word => word[0]?.toUpperCase() || '')
      .join('')
      .substring(0, 3);
    
    // Generate random pastel color
    const bgColor = pastelColors[Math.floor(Math.random() * pastelColors.length)];
    
    // Create a new node
    const carNode = nodes.find(n => n.id.startsWith('car-'));
    const newNode = {
      id: `threat-${uuidv4()}`,
      type: 'threatNode',
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
        // Store relative position to car node
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
      // Clear previous nodes/edges when dialog opens
      setNodes([]);
      setEdges([]);
      // Small timeout to ensure the dialog is fully rendered
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
      <DialogTitle sx={{ m: 0, p: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Vehicle TARA Analysis</Typography>
          <Box>
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
      <DialogContent sx={{ p: 0, flex: 1, display: 'flex', flexDirection: 'row', overflow: 'hidden', position: 'relative' }}>
        {/* Main Content Area */}
        <Box sx={{ flex: 1, position: 'relative', minHeight: '60vh', borderRight: '1px solid #e0e0e0' }}>
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
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onConnect={onConnect}
                  onNodeDragStop={onNodeDragStop}
                />
              </div>
            </Provider>
          </ReactFlowProvider>
        </Box>
        
        {/* Panel Toggle Button */}
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
                backgroundColor: 'background.paper',
                borderRadius: '4px 0 0 4px',
                boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
                '&:hover': {
                  backgroundColor: 'action.hover'
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
            bgcolor: 'background.paper',
            transition: 'width 0.2s ease-in-out',
            borderLeft: isPanelOpen ? '1px solid #e0e0e0' : 'none'
          }}
        >
          <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', whiteSpace: 'nowrap' }}>
            <Typography variant="h6" component="div" noWrap>
              TARA Library
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
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
                        onDragStart={(e) => handleDragStart(e, item)}
                        sx={{
                          pl: 4,
                          py: 0.5,
                          '&:hover': {
                            backgroundColor: 'action.hover',
                          },
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
