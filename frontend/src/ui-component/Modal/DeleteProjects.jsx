/*eslint-disable*/
import React, { useState, useRef } from 'react';
import { List, ListItemButton, ListItemText, Button, CircularProgress, Box, Typography, Popper, Paper } from '@mui/material';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router';
import { useDispatch } from 'react-redux';
import { setModelId } from '../../store/slices/PageSectionSlice';
import { closeAll } from '../../store/slices/CurrentIdSlice';

export default function DeleteProject({ open, handleClose, Models, deleteModels, isLoading, getModels, model }) {
  const userId = sessionStorage.getItem('user-id');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [selectedModels, setSelectedModels] = useState([]);
  const notify = (message, status) => toast[status](message);

  const anchorRef = useRef(null); // Used to anchor the popper below this element

  const handleModelClick = (id) => {
    setSelectedModels((prevSelected) =>
      prevSelected.includes(id) ? prevSelected.filter((modelId) => modelId !== id) : [...prevSelected, id]
    );
  };

  const handleDelete = () => {
    deleteModels({ 'model-ids': selectedModels, 'user-id': userId })
      .then((res) => {
        // console.log('res', res);
        if (!res.error) {
          notify(res.message ?? 'Models deleted successfully', 'success');
          if (selectedModels.includes(model?._id)) {
            navigate(`/Models/${res?.next_model_id}`);
            dispatch(setModelId(res?.next_model_id));
            dispatch(closeAll());
          }
          getModels();
          handleClose();
        } else {
          notify(res.error ?? 'Something Went Wrong', 'error');
        }
      })
      .catch((err) => {
        console.log('err', err);
        notify('Something Went Wrong', 'error');
        handleClose();
      });
  };

  return (
    <>
      <Popper
        open={open}
        anchorEl={anchorRef.current}
        placement="bottom-end"
        disablePortal={false}
        style={{ zIndex: 1500, top: 100, left: 940 }}
      >
        <Paper
          sx={{
            width: 220, // Reduced width
            padding: 1, // Reduced padding
            borderRadius: 2,
            backgroundColor: 'background.paper',
            boxShadow: 1,
            zIndex: 1500 // Ensure it's above other elements
          }}
        >
          <Typography
            sx={{
              fontSize: 14, // Reduced font size
              fontWeight: 600,
              color: 'primary.main',
              pb: 0.5, // Reduced bottom padding
              textAlign: 'center'
            }}
          >
            Select Projects to Delete
          </Typography>

          <Box
            sx={{
              maxHeight: '150px', // Reduced height of the dropdown list
              overflowY: 'auto',
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'divider',
              backgroundColor: '#fafafa',
              boxShadow: 1,
              mb: 1 // Reduced bottom margin
            }}
          >
            {isLoading ? (
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <CircularProgress size={20} />
              </Box>
            ) : Models?.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ p: 1, textAlign: 'center' }}>
                No projects available.
              </Typography>
            ) : (
              <List disablePadding>
                {Models?.map((model) => (
                  <ListItemButton
                    key={model?._id}
                    selected={selectedModels.includes(model?._id)}
                    onClick={() => handleModelClick(model?._id)}
                    sx={{
                      py: 0.5,
                      px: 1,
                      borderRadius: 1,
                      backgroundColor: selectedModels.includes(model?._id) ? '#fd5c63' : 'transparent',
                      color: selectedModels.includes(model?._id) ? 'white' : 'text.primary',
                      '&:hover': {
                        backgroundColor: selectedModels.includes(model?._id) ? 'darkred' : 'action.hover'
                      }
                    }}
                  >
                    <ListItemText sx={{ '& .MuiTypography-root': { color: 'inherit' } }} primary={model?.name} />
                  </ListItemButton>
                ))}
              </List>
            )}
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
            <Button
              onClick={handleClose}
              variant="outlined"
              color="warning"
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
            <Button
              onClick={handleDelete}
              variant="contained"
              color="error"
              disabled={selectedModels.length === 0}
              sx={{
                fontWeight: 500,
                textTransform: 'none',
                fontSize: 10,
                minWidth: 60,
                padding: '4px 6px'
              }}
            >
              Delete
            </Button>
          </Box>
        </Paper>
      </Popper>
    </>
  );
}
