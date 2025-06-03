import React, { useEffect } from 'react';
import useStore from '../../Zustand/store';
import { TreeItem, TreeView } from '@mui/x-tree-view';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Typography, Box } from '@mui/material';
import { shallow } from 'zustand/shallow';
import { useDispatch } from 'react-redux';
import { setSelectedBlock } from '../../store/slices/CanvasSlice';

const selector = (state) => ({
  sidebarNodes: state.sidebarNodes,
  getSidebarNode: state.getSidebarNode,
  selectedElement: state.selectedElement,
  edges: state.edges,
  nodes: state.nodes
});
const NodeList = ({ setSelected }) => {
  const { 
    sidebarNodes, 
    getSidebarNode, 
    selectedElement,
    edges,
    nodes
  } = useStore(selector, shallow);
  const dispatch = useDispatch();

  const handleSelect = (node) => {
    setSelected(node);
    dispatch(setSelectedBlock(node));
  };

  // Handle edge selection
  const handleSelectEdge = (edge) => {
    const edgeData = edges.find(e => e.id === edge.id);
    if (edgeData) {
      setSelected(edgeData);
      dispatch(setSelectedBlock(edgeData));
    }
  };

  // Check if an edge is selected
  const isEdgeSelected = (edge) => {
    return selectedElement?.id === edge.id;
  };

  // Get source and target node labels for edge display
  const getEdgeLabel = (edge) => {
    const sourceNode = nodes.find(n => n.id === edge.source);
    const targetNode = nodes.find(n => n.id === edge.target);
    const sourceLabel = sourceNode?.data?.label || 'Unknown';
    const targetLabel = targetNode?.data?.label || 'Unknown';
    return `${sourceLabel} → ${targetLabel}`;
  };
  //   console.log('sidebarNodes', sidebarNodes);
  useEffect(() => {
    getSidebarNode();
  }, []);
  return (
    <Box sx={{ overflowY: 'auto', height: '100%' }}>
      <TreeView
        sx={{ 
          color: 'black',
          '& .MuiTreeItem-label': {
            fontSize: '0.9rem',
            padding: '4px 0',
            '&.Mui-selected': {
              backgroundColor: 'rgba(25, 118, 210, 0.08)',
              '&:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.12)'
              }
            }
          }
        }}
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpandIcon={<ChevronRightIcon />}
      >
        {/* Nodes Section */}
        {sidebarNodes?.map((item) => (
          <TreeItem 
            key={`node-group-${item?._id}`} 
            nodeId={`node-group-${item?._id}`} 
            label={<Typography variant="h6">{item?.name}</Typography>}
          >
            {item?.nodes?.map((node) => (
              <TreeItem 
                key={`node-${node?.id}`} 
                nodeId={`node-${node?.id}`} 
                label={node?.data.label}
                onClick={() => handleSelect(node)}
                selected={selectedElement?.id === node?.id}
              />
            ))}
          </TreeItem>
        ))}

        {/* Edges Section */}
        {edges?.length > 0 && (
          <TreeItem 
            nodeId="edges-group" 
            label={<Typography variant="h6">Connections</Typography>}
          >
            {edges.map((edge) => (
              <TreeItem
                key={`edge-${edge.id}`}
                nodeId={`edge-${edge.id}`}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box 
                      sx={{
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        backgroundColor: isEdgeSelected(edge) ? '#1976d2' : 'transparent',
                        border: '2px solid #1976d2',
                        marginRight: 1
                      }}
                    />
                    {getEdgeLabel(edge)}
                  </Box>
                }
                onClick={() => handleSelectEdge(edge)}
                selected={isEdgeSelected(edge)}
              />
            ))}
          </TreeItem>
        )}
      </TreeView>
    </Box>
  );
};

export default NodeList;
