import React, { useCallback, useState } from 'react';
import { Popper, Paper, Box, Typography, List, ListItemButton, ListItemText, Button, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router';
import { useDispatch } from 'react-redux';
import toast, { Toaster } from 'react-hot-toast';
import { setModelId } from '../../store/slices/PageSectionSlice';
import { closeAll } from '../../store/slices/CurrentIdSlice';
import ColorTheme from '../../themes/ColorTheme';

export default React.memo(function DeleteProject({ open, handleClose, Models, deleteModels, isLoading, getModels, model, anchorEl }) {
  const color = ColorTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [selectedModels, setSelectedModels] = useState([]);
  const userId = sessionStorage.getItem('user-id');

  const handleModelClick = useCallback((e, id) => {
    e.stopPropagation();
    setSelectedModels((prev) => (prev.includes(id) ? prev.filter((modelId) => modelId !== id) : [...prev, id]));
  }, []);

  const handleDelete = useCallback(() => {
    if (!selectedModels.length) {
      toast.error('Select at least one project');
      return;
    }

    deleteModels({ 'model-ids': selectedModels, 'user-id': userId })
      .then((res) => {
        if (!res.error) {
          toast.success(res.message ?? 'Projects deleted successfully');
          if (selectedModels.includes(model?._id)) {
            navigate(`/Models/${res?.next_model_id}`);
            dispatch(setModelId(res?.next_model_id));
            dispatch(closeAll());
          }
          getModels();
          setSelectedModels([]);
          handleClose();
        } else {
          toast.error(res.error ?? 'Something went wrong');
        }
      })
      .catch(() => {
        toast.error('Something went wrong');
      });
  }, [deleteModels, userId, selectedModels, model?._id, navigate, dispatch, getModels, handleClose]);

  return (
    <>
      <Popper open={open} anchorEl={anchorEl} placement="bottom-end" disablePortal={false} sx={{ zIndex: 1500, top: 100, left: 940 }}>
        <Paper
          sx={{
            width: 220,
            p: 1,
            borderRadius: 2,
            bgcolor: color?.modalBg,
            boxShadow: 1
          }}
        >
          <Typography
            sx={{
              fontSize: 14,
              fontWeight: 600,
              color: color?.title,
              pb: 0.5,
              textAlign: 'center'
            }}
          >
            Select Projects to Delete
          </Typography>
          <Box
            sx={{
              maxHeight: '150px',
              overflowY: 'auto',
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: color?.inputBg,
              mb: 1
            }}
          >
            {isLoading ? (
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <CircularProgress size={20} />
              </Box>
            ) : !Models?.length ? (
              <Typography variant="body2" sx={{ p: 1, textAlign: 'center', color: color?.sidebarContent }}>
                No projects available
              </Typography>
            ) : (
              <List disablePadding>
                {Models.map((model) => (
                  <ListItemButton
                    key={model?._id}
                    selected={selectedModels.includes(model?._id)}
                    onClick={(e) => handleModelClick(e, model?._id)}
                    sx={{
                      py: 0.5,
                      px: 1,
                      borderRadius: 1,
                      bgcolor: selectedModels.includes(model?._id) ? 'error.main' : 'transparent',
                      color: selectedModels.includes(model?._id) ? 'white' : color?.sidebarContent,
                      '&:hover': {
                        bgcolor: selectedModels.includes(model?._id) ? 'error.dark' : 'action.hover'
                      }
                    }}
                  >
                    <ListItemText primary={model?.name} />
                  </ListItemButton>
                ))}
              </List>
            )}
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5, gap: 1 }}>
            <Button
              onClick={handleClose}
              variant="outlined"
              color="error"
              sx={{
                textTransform: 'none',
                fontSize: 12,
                minWidth: 60,
                py: 0.5
              }}
            >
              Close
            </Button>
            <Button
              onClick={handleDelete}
              variant="contained"
              color="error"
              disabled={isLoading || !selectedModels.length}
              sx={{
                textTransform: 'none',
                fontSize: 12,
                minWidth: 60,
                py: 0.5
              }}
              startIcon={isLoading && <CircularProgress size={16} />}
            >
              Delete
            </Button>
          </Box>
        </Paper>
      </Popper>
      <Toaster position="top-right" reverseOrder={false} />
    </>
  );
});
