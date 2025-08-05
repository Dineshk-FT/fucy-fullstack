/*eslint-disable*/
import React, { useState, useEffect } from 'react';
import { List, ListItemButton, ListItemText, CircularProgress, Box, Typography, Popper, Paper, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import { DragIndicator } from '@mui/icons-material';
import useStore from '../../store/Zustand/store';
import { toast } from 'react-hot-toast';
import ColorTheme from '../../themes/ColorTheme';

export default function LibraryModal({ open, handleClose, anchorEl }) {
  const color = ColorTheme();
  const [libraries, setLibraries] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLibrary, setSelectedLibrary] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);
  const [hasExistingData, setHasExistingData] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);

  useEffect(() => {
    const checkExistingData = () => {
      const { nodes, edges, model } = useStore.getState();
      // Ensure nodes and edges are arrays or empty arrays
      const safeNodes = Array.isArray(nodes) ? nodes : [];
      const safeEdges = Array.isArray(edges) ? edges : [];
      const hasData = safeNodes.length > 0 || safeEdges.length > 0;
      return hasData;
    };

    const loadLibraries = async () => {
      if (!open) return;

      setIsLoading(true);
      setLibraries([]);
      setSelectedLibrary(null);
      setShowErrorDialog(false); // Ensure dialog is not shown on open

      // Check if project has existing data
      const hasData = checkExistingData();
      setHasExistingData(hasData);

      try {
        const librariesData = await useStore.getState().getLibraries();

        // Ensure we have an array of libraries
        if (Array.isArray(librariesData)) {
          const validLibraries = librariesData.filter(lib => lib?._id && lib?.name);

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
    try {
      e.dataTransfer.setData('library-modal/json', JSON.stringify(library));
      e.dataTransfer.effectAllowed = 'move';
      setDraggedItem(library);

    } catch (error) {
      console.error('Error in handleDragStart:', error);
    }
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    document.activeElement?.blur(); // Remove focus to mitigate aria-hidden issue

  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const library = draggedItem || (selectedLibrary && libraries.find(lib => lib._id === selectedLibrary));
      if (!library?._id) {

        return;
      }

      // Get the current model ID from the store or URL
      const currentModelId = useStore.getState().model?._id || window.location.pathname.split('/').pop();
      if (!currentModelId) {
        throw new Error('No active model found to apply library to');
      }

      // Use the store's openLibrary method with both library ID and target model ID
      const result = await useStore.getState().openLibrary(library._id, currentModelId);

      if (result.success) {
        // Close the modal first
        handleClose(e);

        // Show success notification
        toast.success('Library data applied successfully!', {
          duration: 3000,
          position: 'top-right',
          style: {
            background: '#4caf50',
            color: '#fff',
          },
        });
      } else {
        throw new Error(result.error || 'Failed to apply library data');
      }
    } catch (error) {
      console.error('Error applying library data:', error);
      toast.error(error.message || 'Failed to apply library data', {
        duration: 3000,
        position: 'top-right',
        style: {
          background: '#f44336',
          color: '#fff',
        },
      });
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
      e.stopPropagation();
      const modalElement = document.querySelector('[role="tooltip"][data-popper-placement="bottom-end"]');
      const isInsideModal = modalElement && (modalElement.contains(e.target) || e.target === modalElement);


      if (!isInsideModal && draggedItem) {
        if (hasExistingData) {

          setShowErrorDialog(true);
          return;
        }
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
  }, [open, anchorEl, handleClose, draggedItem, selectedLibrary, hasExistingData]);

  const handleCloseErrorDialog = () => {
    setShowErrorDialog(false);

  };

  if (!open) return null;

  return (
    <>
      <Popper 
        open={open} 
        anchorEl={anchorEl} 
        placement="bottom-end" 
        disablePortal={false} 
        style={{ zIndex: 1500 }}
        modifiers={[
          {
            name: 'preventOverflow',
            options: {
              boundariesElement: 'viewport',
            },
          },
          {
            name: 'flip',
            options: {
              enabled: true,
            },
          },
        ]}
        onClick={(e) => e.stopPropagation()}
        {...(showErrorDialog ? { inert: '' } : {})}
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
                        handleLibraryClick(library._id);
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

      <Dialog
        open={showErrorDialog}
        onClose={handleCloseErrorDialog}
        aria-labelledby="error-dialog-title"
        aria-describedby="error-dialog-description"
        sx={{
          zIndex: 1600,
          '& .MuiDialog-paper': {
            minWidth: '300px',
            borderRadius: 2,
            bgcolor: color?.modalBg,
            color: color?.title,
          },
        }}
      >
        <DialogTitle id="error-dialog-title">Invalid Action</DialogTitle>
        <DialogContent>
          <DialogContentText 
            id="error-dialog-description"
            sx={{ color: color?.title }}
          >
            You can only import the library in a newly created project
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleCloseErrorDialog} 
            color="primary" 
            variant="contained"
            sx={{ 
              textTransform: 'none',
              bgcolor: 'primary.main',
              '&:hover': {
                bgcolor: 'primary.dark',
              },
            }}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}