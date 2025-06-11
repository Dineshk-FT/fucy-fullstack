import React, { useCallback, useState } from 'react';
import {
  Popper,
  Paper,
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  Button,
  CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { shallow } from 'zustand/shallow';
import useStore from '../../store/Zustand/store';
import { closeAll, setAttackScene, setTableOpen } from '../../store/slices/CurrentIdSlice';
import ColorTheme from '../../themes/ColorTheme';

const selector = (state) => ({
  attackScenarios: state.attackScenarios,
  getAttackScenario: state.getAttackScenario,
});

export default React.memo(function AttackTreeRibbonModal({ open, handleClose, isLoading, anchorEl }) {
  const color = ColorTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [selectedAttackTree, setSelectedAttackTree] = useState(null);
  const { modelId } = useSelector((state) => state?.pageName);
  const { attackScenarios } = useStore(selector, shallow);

  const attackTrees =
    attackScenarios?.subs?.flatMap((sub) => sub.scenes || []).filter((tree) => 'threat_id' in tree) || [];

  const handleAttackTreeClick = useCallback(
    (scene) => {
      if (scene) {
        dispatch(closeAll());
        dispatch(setTableOpen('Attack Trees Canvas'));
        dispatch(setAttackScene(scene));
        handleClose();
        navigate(`/Models/${modelId}`);
        setSelectedAttackTree(scene.ID);
      }
    },
    [dispatch, navigate, modelId, handleClose],
  );

  return (
    <Popper
      open={open}
      anchorEl={anchorEl}
      placement="bottom-end"
      disablePortal={false}
      sx={{ zIndex: 1500 }}
      modifiers={[{ name: 'offset', options: { offset: [0, 10] } }]}
    >
      <Paper
        sx={{
          width: 220,
          p: 1,
          borderRadius: 2,
          bgcolor: color?.modalBg,
          boxShadow: 1,
        }}
      >
        <Typography
          sx={{
            fontSize: 14,
            fontWeight: 600,
            color: color?.title,
            pb: 0.5,
            textAlign: 'center',
          }}
        >
          Select an Attack Tree
        </Typography>
        <Box
          sx={{
            maxHeight: '150px',
            overflowY: 'auto',
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: color?.inputBg,
            mb: 1,
          }}
        >
          {isLoading ? (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <CircularProgress size={20} />
            </Box>
          ) : !attackTrees.length ? (
            <Typography variant="body2" sx={{ p: 1, textAlign: 'center', color: color?.sidebarContent }}>
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
                    bgcolor: selectedAttackTree === tree.ID ? 'primary.main' : 'transparent',
                    color: selectedAttackTree === tree.ID ? 'white' : color?.sidebarContent,
                    '&:hover': { bgcolor: 'action.hover' },
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
              textTransform: 'none',
              fontSize: 12,
              minWidth: 60,
              py: 0.5,
            }}
          >
            Close
          </Button>
        </Box>
      </Paper>
    </Popper>
  );
});