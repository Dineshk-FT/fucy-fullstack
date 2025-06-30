/*eslint-disable*/
import React, { useState, useEffect, useCallback } from 'react';
import { List, ListItemButton, ListItemText, Button, CircularProgress, Box, Typography, Popper, Paper } from '@mui/material';
import { useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { closeAll } from '../../store/slices/CurrentIdSlice';
import { setModelId } from '../../store/slices/PageSectionSlice';
import useStore from '../../store/Zustand/store';
import ColorTheme from '../../themes/ColorTheme';

export default function LibraryModal({ open, handleClose, anchorEl }) {
  const color = ColorTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [libraries, setLibraries] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLibrary, setSelectedLibrary] = useState(null);
  const { modelId } = useSelector((state) => state?.pageName);
  
  useEffect(() => {
    const loadLibraries = async () => {
      if (!open) return;
      
      setIsLoading(true);
      setLibraries([]);
      setSelectedLibrary(null);
      
      try {
        const librariesData = await useStore.getState().getLibraries();
        
        // Ensure we have an array of libraries
        if (Array.isArray(librariesData)) {
          const validLibraries = librariesData.filter(lib => lib?._id && lib?.name);
          console.log('Valid libraries:', validLibraries);
          
          setLibraries(validLibraries);
          
          // Auto-select the first library if available
          if (validLibraries.length > 0) {
            setSelectedLibrary(validLibraries[0]._id);
          }
        } else {
          setLibraries([]);
        }
      } catch (error) {
        console.error('Error loading libraries:', error);
        setLibraries([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadLibraries();
  }, [open]);
  
  const handleLibraryClick = (id) => setSelectedLibrary(id);
  
  const handleClick = (e) => {
    e?.stopPropagation?.();
    if (selectedLibrary && modelId !== selectedLibrary) {
      navigate(`/Models/${selectedLibrary}`);
      dispatch(setModelId(selectedLibrary));
      dispatch(closeAll());
    }
    handleClose(e);
  };

  // Handle click outside to close
  useEffect(() => {
    if (!open) return;
    
    const handleClickOutside = (event) => {
      const modalElement = document.querySelector('[role="tooltip"][data-popper-placement="bottom-end"]');
      const isClickInside = modalElement && modalElement.contains(event.target);
      const isAnchorEl = anchorEl && anchorEl.contains(event.target);
      
      if (!isClickInside && !isAnchorEl) {
        handleClose(event);
      }
    };

    // Use capture phase to catch the event before it bubbles up
    document.addEventListener('mousedown', handleClickOutside, true);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
    };
  }, [open, anchorEl, handleClose]);

  if (!open) return null;

  return (
    <Popper 
      open={open} 
      anchorEl={anchorEl} 
      placement="bottom-end" 
      disablePortal={false} 
      style={{ zIndex: 1500, top: 100, left: 680 }}
      onClick={(e) => e.stopPropagation()}
    >
      <Paper
        onClick={(e) => e.stopPropagation()}
        sx={{
          width: 220,
          padding: 1,
          borderRadius: 2,
          bgcolor: color?.modalBg,
          boxShadow: 1,
          zIndex: 1500
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
          Select from Library
        </Typography>

        <Box
          sx={{
            maxHeight: '150px',
            overflowY: 'auto',
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: color?.inputBg,
            boxShadow: 1,
            mb: 1
          }}
        >
          {isLoading ? (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <CircularProgress size={20} />
            </Box>
          ) : !libraries?.length ? (
            <Typography variant="body2" color="text.secondary" sx={{ p: 1, textAlign: 'center', color: color?.sidebarContent }}>
              No libraries available.
            </Typography>
          ) : (
            <List disablePadding>
              {libraries.map((library) => {
                if (!library?._id) return null; // Skip invalid entries
                const isSelected = selectedLibrary === library._id;
                return (
                  <ListItemButton
                    key={library?._id || Math.random().toString(36).substr(2, 9)}
                    selected={isSelected}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLibraryClick(library?._id);
                    }}
                    sx={{
                      py: 0.5,
                      px: 1,
                      borderRadius: 1,
                      bgcolor: isSelected ? 'primary.main' : 'transparent',
                      color: isSelected ? 'white' : color?.sidebarContent,
                      '&:hover': {
                        bgcolor: isSelected ? 'primary.dark' : 'action.hover'
                      },
                      '&.Mui-selected': {
                        bgcolor: 'primary.main',
                        '&:hover': {
                          bgcolor: 'primary.dark'
                        }
                      }
                    }}
                  >
                    <ListItemText 
                      primary={library?.name || 'Unnamed Library'}
                      primaryTypographyProps={{
                        noWrap: true,
                        title: library?.name || 'Unnamed Library',
                        sx: {
                          fontSize: '0.875rem',
                          fontWeight: isSelected ? 600 : 400
                        }
                      }}
                    />
                  </ListItemButton>
                );
              })}
            </List>
          )}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
          <Button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleClose(e);
            }}
            variant="outlined"
            color="error"
            sx={{
              fontWeight: 500,
              textTransform: 'none',
              fontSize: 10,
              padding: '4px 6px',
              minWidth: 60,
              '&:hover': {
                bgcolor: 'error.main',
                color: 'white'
              }
            }}
          >
            Close
          </Button>
          <Button
            onClick={handleClick}
            variant="contained"
            color="primary"
            disabled={!selectedLibrary}
            sx={{
              fontWeight: 500,
              textTransform: 'none',
              fontSize: 10,
              minWidth: 60,
              padding: '4px 6px'
            }}
          >
            Open
          </Button>
        </Box>
      </Paper>
    </Popper>
  );
}
