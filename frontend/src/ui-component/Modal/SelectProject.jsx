import React, { useState } from 'react';
import { List, ListItemButton, ListItemText, Button, CircularProgress, Box, Typography, Popper, Paper } from '@mui/material';
import { useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { closeAll } from '../../store/slices/CurrentIdSlice';
import { setModelId } from '../../store/slices/PageSectionSlice';

export default function SelectProject({ open, handleClose, Models, isLoading, anchorEl }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [selectedModel, setSelectedModel] = useState(null);
  const { modelId } = useSelector((state) => state?.pageName);
  const handleModelClick = (id) => setSelectedModel(id);
  const handleClick = () => {
    if (selectedModel && modelId !== selectedModel) {
      navigate(`/Models/${selectedModel}`);
      dispatch(setModelId(selectedModel));
      dispatch(closeAll());
      handleClose();
    } else {
      handleClose();
    }
  };

  return (
    <Popper open={open} anchorEl={anchorEl} placement="bottom-end" disablePortal={false} style={{ zIndex: 1500, top: 90, left: 90 }}>
      <Paper
        sx={{
          width: 220, // Reduced width further to 250px
          padding: 1, // Reduced padding
          borderRadius: 2,
          backgroundColor: 'background.paper',
          boxShadow: 1,
          zIndex: 1500 // Ensure it's above other elements
        }}
      >
        {/* Combined title and description into a single line */}
        <Typography
          sx={{
            fontSize: 14, // Reduced font size
            fontWeight: 600,
            color: 'primary.main',
            pb: 0.5, // Reduced bottom padding
            textAlign: 'center'
          }}
        >
          Select a Project to View
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
              <CircularProgress size={20} /> {/* Smaller CircularProgress */}
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
                  selected={selectedModel === model?._id}
                  onClick={() => handleModelClick(model?._id)}
                  sx={{
                    py: 0.5, // Reduced padding for list items
                    px: 1, // Reduced horizontal padding
                    borderRadius: 1,
                    backgroundColor: selectedModel === model?._id ? 'primary.main' : 'transparent',
                    color: selectedModel === model?._id ? 'white' : 'text.primary',
                    '&:hover': {
                      backgroundColor: 'action.hover'
                    }
                  }}
                >
                  <ListItemText primary={model?.name} />
                </ListItemButton>
              ))}
            </List>
          )}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
          <Button
            onClick={handleClose}
            variant="outlined"
            color="error"
            sx={{
              fontWeight: 500,
              textTransform: 'none',
              fontSize: 10, // Smaller font size for the button
              padding: '4px 6px', // Smaller padding
              minWidth: 60 // Smaller button width
            }}
          >
            Close
          </Button>
          <Button
            onClick={handleClick}
            variant="contained"
            color="primary"
            disabled={!selectedModel}
            sx={{
              fontWeight: 500,
              textTransform: 'none',
              fontSize: 10, // Smaller font size for the button
              minWidth: 60, // Smaller button width
              padding: '4px 6px' // Reduced padding
            }}
          >
            Open
          </Button>
        </Box>
      </Paper>
    </Popper>
  );
}
