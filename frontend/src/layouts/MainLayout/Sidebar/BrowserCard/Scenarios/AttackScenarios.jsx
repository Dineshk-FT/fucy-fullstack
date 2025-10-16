import React from 'react';
import DraggableTreeItem from '../DraggableItem';
import { Box, Tooltip } from '@mui/material';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { TreeItem } from '@mui/x-tree-view';

const AttackScenarios = ({ sub, at_scene, i, hovered, setHovered, handleOpenDeleteModal, onDragStart, handleOpenAttackTree, getLabel }) => {
  const Details = { label: at_scene.Name, nodeId: at_scene.ID, type: 'Event', dragged: true };

  const renderLabel = (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      onMouseEnter={() => setHovered((state) => ({ ...state, id: at_scene?.ID }))}
      onMouseLeave={() => setHovered((state) => ({ ...state, id: '' }))}
    >
      {/* ✅ Tooltip wraps name */}
      <Tooltip title={at_scene?.Name || ''} placement="top" disableInteractive>
        <Box
          sx={{
            maxWidth: 240, // adjust width as needed
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            display: 'inline-block',
            cursor: 'default'
          }}
        >
          {getLabel('DangerousIcon', at_scene.Name, i + 1, at_scene.ID)}
        </Box>
      </Tooltip>

      {/* delete icon on hover */}
      {hovered.id === at_scene?.ID && (
        <Box
          onClick={(e) => {
            e.stopPropagation();
            handleOpenDeleteModal(sub?.type, at_scene);
          }}
        >
          <DeleteForeverIcon color="error" sx={{ fontSize: 19 }} />
        </Box>
      )}
    </Box>
  );

  return sub.name === 'Attack' ? (
    <DraggableTreeItem
      key={at_scene.ID}
      nodeId={at_scene.ID}
      label={renderLabel}
      draggable
      onDragStart={(e) => onDragStart(e, Details)}
      onClick={(e) => e.stopPropagation()}
    />
  ) : (
    <TreeItem key={at_scene.ID} nodeId={at_scene.ID} label={renderLabel} onClick={(e) => handleOpenAttackTree(e, at_scene, sub.name)} />
  );
};

export default React.memo(AttackScenarios);
