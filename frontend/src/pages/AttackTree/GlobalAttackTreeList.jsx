/*eslint-disable*/
import { TreeItem, TreeView } from '@mui/x-tree-view';
import React, { useState } from 'react';
import DraggableTreeItem from '../../layouts/MainLayout/Sidebar/BrowserCard/DraggableItem';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DeleteIcon from '@mui/icons-material/Delete';
import { Box, IconButton } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

const GlobalAttackTreeList = ({ globalAttackTrees, onDelete, onAdd }) => {
  const [hoveredId, setHoveredId] = useState(null);

  const onDragStart = (event, item) => {
    const parseFile = JSON.stringify(item);
    event.dataTransfer.setData('application/Library', parseFile);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <>
      <TreeView
        id="global-tree"
        aria-label="file system navigator"
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpandIcon={<ChevronRightIcon />}
        defaultExpanded={['Global Attack Trees']}
      >
        <TreeItem
          nodeId="Global Attack Trees"
          label={
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                fontWeight: 'bold',
                fontSize: '1rem'
              }}
            >
              <span>Global Attack Trees</span>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onAdd?.();
                }}
                sx={{ ml: 1 }}
              >
                <AddCircleOutlineIcon fontSize="small" />
              </IconButton>
            </Box>
          }
          sx={{ marginTop: 2 }}
        >
          {globalAttackTrees?.map((item) => (
            <DraggableTreeItem
              key={item.id}
              nodeId={item.id}
              draggable={true}
              onDragStart={(e) => onDragStart(e, item)}
              onMouseEnter={() => setHoveredId(item.id)}
              onMouseLeave={() => setHoveredId(null)}
              sx={{
                mt: 1,
                '& .MuiTreeItem-iconContainer': { display: 'none' },
                '& .MuiTreeItem-label': {
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  paddingLeft: '1.2rem', // for bullet
                  position: 'relative',
                  '&::before': {
                    content: '"•"',
                    position: 'absolute',
                    left: 0,
                    color: '#666',
                    fontSize: '1.2rem'
                  }
                }
              }}
              label={
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%'
                  }}
                >
                  <span>{item.attackTreeName}</span>
                  {hoveredId === item.id && (
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete?.(item.id);
                      }}
                    >
                      <DeleteIcon fontSize="small" color="error" />
                    </IconButton>
                  )}
                </Box>
              }
            />
          ))}
        </TreeItem>
      </TreeView>
    </>
  );
};

export default GlobalAttackTreeList;
