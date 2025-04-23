/*eslint-disable*/ import React, { useState, useEffect } from 'react';
import { List, ListItemButton, ListItemText, Button, CircularProgress, Box, Typography, Popper, Paper } from '@mui/material';
import { useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { closeAll, setAttackScene } from '../../store/slices/CurrentIdSlice';
import { setTableOpen } from '../../store/slices/CurrentIdSlice';
import useStore from '../../store/Zustand/store';
import { shallow } from 'zustand/shallow';

const selector = (state) => ({
  attackScenarios: state.attackScenarios,
  getAttackScenario: state.getAttackScenario
});

export default function AttackTreeRibbonModal({ open, handleClose, isLoading, anchorEl }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [selectedAttackTree, setSelectedAttackTree] = useState(null);
  const { modelId } = useSelector((state) => state?.pageName);
  const { attackScenarios } = useStore(selector, shallow);
  const currentTable = useSelector((state) => state.currentId.tableOpen); // Debug current table state

  // Get all attack trees with full scene data
  const attackTrees = attackScenarios?.subs?.flatMap((sub) => sub.scenes || []).filter((tree) => 'threat_id' in tree) || [];

  const handleAttackTreeClick = (scene) => {
    if (scene) {
      console.log(scene);
      // Dispatch actions synchronously
      dispatch(closeAll()); // Close other views first
      dispatch(setTableOpen('Attack Trees Canvas')); // Set the specific canvas
      dispatch(setAttackScene(scene)); // Set the scene data

      handleClose(); // Close the modal
      navigate(`/Models/${modelId}`); // Navigate to attacks route

      // Force a re-check after navigation (workaround for timing issues)
      setTimeout(() => {
        dispatch(setTableOpen('Attack Trees Canvas'));
      }, 100);

      setSelectedAttackTree(scene.ID); // Update visual feedback
    }
  };

  return (
    <Popper
      open={open}
      anchorEl={anchorEl}
      placement="bottom-end"
      disablePortal={false}
      style={{ zIndex: 1500 }}
      modifiers={[
        {
          name: 'offset',
          options: {
            offset: [0, 10]
          }
        }
      ]}
    >
      <Paper
        sx={{
          width: 220,
          padding: 1,
          borderRadius: 2,
          backgroundColor: 'background.paper',
          boxShadow: 1,
          zIndex: 1500
        }}
      >
        <Typography
          sx={{
            fontSize: 14,
            fontWeight: 600,
            color: 'primary.main',
            pb: 0.5,
            textAlign: 'center'
          }}
        >
          Select an Attack Tree to View
        </Typography>

        <Box
          sx={{
            maxHeight: '150px',
            overflowY: 'auto',
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'divider',
            backgroundColor: '#fafafa',
            boxShadow: 1,
            mb: 1
          }}
        >
          {isLoading ? (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <CircularProgress size={20} />
            </Box>
          ) : !attackTrees.length ? (
            <Typography variant="body2" color="text.secondary" sx={{ p: 1, textAlign: 'center' }}>
              No attack trees available
            </Typography>
          ) : (
            <List disablePadding>
              {attackTrees.map((tree) => (
                <ListItemButton
                  key={tree.ID}
                  selected={selectedAttackTree === tree.ID}
                  onClick={() => handleAttackTreeClick(tree)}
                  sx={{
                    py: 0.5,
                    px: 1,
                    borderRadius: 1,
                    backgroundColor: selectedAttackTree === tree.ID ? 'primary.main' : 'transparent',
                    color: selectedAttackTree === tree.ID ? 'white' : 'text.primary',
                    '&:hover': {
                      backgroundColor: 'action.hover'
                    }
                  }}
                >
                  <ListItemText primary={tree.Name} />
                </ListItemButton>
              ))}
            </List>
          )}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 0.5 }}>
          <Button
            onClick={handleClose}
            variant="outlined"
            color="error"
            sx={{
              fontWeight: 500,
              textTransform: 'none',
              fontSize: 10,
              padding: '4px 6px',
              minWidth: 60
            }}
          >
            Close
          </Button>
        </Box>
      </Paper>
    </Popper>
  );
}
