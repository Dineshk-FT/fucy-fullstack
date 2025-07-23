/*eslint-disable*/
import React, { useState, useEffect } from 'react';
import { List, ListItemButton, ListItemText, CircularProgress, Box, Typography, Popper, Paper, Button } from '@mui/material';
import { DragIndicator } from '@mui/icons-material';
import { useNavigate } from 'react-router';
import { useDispatch } from 'react-redux';
import { closeAll } from '../../store/slices/CurrentIdSlice';
import { setModelId } from '../../store/slices/PageSectionSlice';
import useStore from '../../store/Zustand/store';
import { toast } from 'react-hot-toast';
import ColorTheme from '../../themes/ColorTheme';

export default function LibraryModal({ open, handleClose, anchorEl }) {
  const color = ColorTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [libraries, setLibraries] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLibrary, setSelectedLibrary] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);
  
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

  const handleDragStart = (e, library) => {
    e.dataTransfer.setData('application/json', JSON.stringify(library));
    e.dataTransfer.effectAllowed = 'move';
    setDraggedItem(library);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    try {
      const library = draggedItem || (selectedLibrary && libraries.find(lib => lib._id === selectedLibrary));
      if (!library?._id) return;

      // Use the store's openLibrary method
      const result = await useStore.getState().openLibrary(library._id);
      
      if (result.success) {
        const newId = result.newId || library._id;
        
        // Update Redux state
        dispatch(setModelId(newId));
        dispatch(closeAll());
        
        // Close the modal first
        handleClose(e);
        
        // Show success notification
        toast.success('Library opened successfully!', {
          duration: 3000,
          position: 'top-right',
          style: {
            background: '#4caf50',
            color: '#fff',
          },
        });
        
        // Then navigate to the new model
        navigate(`/Models/${newId}`, { replace: true });
      } else {
        throw new Error(result.error || 'Failed to open library');
      }
    } catch (error) {
      console.error('Error opening library:', error);
      setError(error.message || 'Failed to open library');
    }
  };

  // Handle drag and drop outside the modal
  useEffect(() => {
    if (!open) return;

    const handleDocumentDragOver = (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    };

    const handleDocumentDrop = async (e) => {
      e.preventDefault();
      const modalElement = document.querySelector('[role="tooltip"][data-popper-placement="bottom-end"]');
      const isInsideModal = modalElement && (modalElement.contains(e.target) || e.target === modalElement);
      
      if (!isInsideModal) {
        await handleDrop(e);
      }
    };

    // Handle click outside to close
    const handleClickOutside = (event) => {
      const modalElement = document.querySelector('[role="tooltip"][data-popper-placement="bottom-end"]');
      const isClickInside = modalElement && modalElement.contains(event.target);
      const isAnchorEl = anchorEl && anchorEl.contains(event.target);
      
      if (!isClickInside && !isAnchorEl) {
        handleClose(event);
      }
    };

    document.addEventListener('dragover', handleDocumentDragOver);
    document.addEventListener('drop', handleDocumentDrop);
    document.addEventListener('mousedown', handleClickOutside, true);
    
    return () => {
      document.removeEventListener('dragover', handleDocumentDragOver);
      document.removeEventListener('drop', handleDocumentDrop);
      document.removeEventListener('mousedown', handleClickOutside, true);
    };
  }, [open, anchorEl, handleClose, draggedItem, selectedLibrary]);

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
                    draggable
                    onDragStart={(e) => handleDragStart(e, library)}
                    onDragEnd={handleDragEnd}
                    onDragOver={handleDragOver}
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
                        bgcolor: isSelected ? 'primary.dark' : 'action.hover',
                        cursor: 'grab',
                        '& .drag-handle': {
                          opacity: 1,
                          visibility: 'visible',
                        }
                      },
                      '&.Mui-selected': {
                        bgcolor: 'primary.main',
                        '&:hover': {
                          bgcolor: 'primary.dark'
                        }
                      },
                      position: 'relative',
                      '&:active': {
                        cursor: 'grabbing',
                      },
                    }}
                  >
                    <DragIndicator 
                      className="drag-handle" 
                      sx={{ 
                        mr: 1, 
                        opacity: 0,
                        visibility: 'hidden',
                        transition: 'opacity 0.2s, visibility 0.2s',
                        '&:hover': {
                          cursor: 'grab',
                        },
                        '&:active': {
                          cursor: 'grabbing',
                        },
                      }} 
                    />
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

        <Box sx={{ mt: 1, textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
            Drag and drop a library to open it
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
          <Button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleClose(e);
            }}
            variant="outlined"
            color="error"
            size="small"
            sx={{
              fontWeight: 500,
              textTransform: 'none',
              fontSize: 10,
              padding: '2px 8px',
              '&:hover': {
                bgcolor: 'error.main',
                color: 'white'
              }
            }}
          >
            Close
          </Button>
        </Box>
      </Paper>
    </Popper>
  );
}
