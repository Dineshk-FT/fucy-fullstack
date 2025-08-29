/*eslint-disable*/
import React, { useState, useEffect } from 'react';
import { 
  List, 
  ListItemButton, 
  ListItemText, 
  CircularProgress, 
  Box, 
  Typography, 
  Popper, 
  Paper, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogContentText, 
  DialogActions,
  Collapse,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  DragIndicator,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import useStore from '../../store/Zustand/store';
import { toast } from 'react-hot-toast';
import ColorTheme from '../../themes/ColorTheme';

export default function LibraryModal({ open, handleClose, anchorEl }) {
  const color = ColorTheme();
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLibrary, setSelectedLibrary] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);
  const [hasExistingData, setHasExistingData] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({});

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
      setCategories([]);
      setSelectedLibrary(null);
      setShowErrorDialog(false);

      // Check if project has existing data
      const hasData = checkExistingData();
      setHasExistingData(hasData);

      try {
        const librariesData = await useStore.getState().getLibraries();

        if (Array.isArray(librariesData)) {
          // Filter valid libraries and group by category
          const validLibraries = librariesData.filter(lib => lib?._id && lib?.name);
          
          // Group libraries by category
          const categorized = validLibraries.reduce((acc, lib) => {
            const category = lib.category || 'Uncategorized';
            if (!acc[category]) {
              acc[category] = [];
            }
            acc[category].push(lib);
            return acc;
          }, {});

          // Convert to array format and sort categories
          const categoriesList = Object.entries(categorized).map(([name, libraries]) => ({
            id: name.toLowerCase().replace(/\s+/g, '-'),
            name,
            libraries
          })).sort((a, b) => a.name.localeCompare(b.name));

          // Move 'Uncategorized' to the end if it exists
          const uncategorizedIndex = categoriesList.findIndex(cat => cat.name === 'Uncategorized');
          if (uncategorizedIndex !== -1) {
            const uncategorized = categoriesList.splice(uncategorizedIndex, 1)[0];
            categoriesList.push(uncategorized);
          }

          setCategories(categoriesList);

          // Auto-expand first non-empty category if none are expanded
          if (categoriesList.length > 0 && !Object.keys(expandedCategories).some(k => expandedCategories[k])) {
            const firstCategoryWithLibraries = categoriesList.find(cat => cat.libraries.length > 0);
            if (firstCategoryWithLibraries) {
              setExpandedCategories({ [firstCategoryWithLibraries.id]: true });
            }
          }
        } else {
          setCategories([]);
        }
      } catch (error) {
        console.error('Error loading libraries:', error);
        setCategories([]);
        toast.error('Failed to load libraries');
      } finally {
        setIsLoading(false);
      }
    };

    loadLibraries();
  }, [open]);

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const handleLibraryClick = (id, e) => {
    e?.stopPropagation?.();
    setSelectedLibrary(id);
  };

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
      const library = draggedItem || (selectedLibrary && categories.flatMap(category => category.libraries).find(lib => lib._id === selectedLibrary));
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
            width: 280,
            padding: 1.5,
            borderRadius: 2,
            bgcolor: color?.modalBg,
            boxShadow: 2,
            zIndex: 1500,
            border: `1px solid ${color?.borderColor || 'rgba(0, 0, 0, 0.12)'}`,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography
              sx={{
                fontSize: 15,
                fontWeight: 600,
                color: color?.title,
              }}
            >
              Select from Library
            </Typography>
            <Tooltip title="Close">
              <IconButton 
                size="small" 
                onClick={handleClose}
                sx={{ color: color?.textSecondary }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>

          <Box
            sx={{
              maxHeight: '300px',
              overflowY: 'auto',
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: color?.inputBg,
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)',
              mb: 1.5,
              '&::-webkit-scrollbar': {
                width: '6px',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                borderRadius: '3px',
              },
            }}
          >
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100px' }}>
                <CircularProgress size={24} />
              </Box>
            ) : categories.length === 0 ? (
              <Typography 
                variant="body2" 
                sx={{ 
                  p: 2, 
                  textAlign: 'center', 
                  color: color?.textSecondary,
                  fontStyle: 'italic'
                }}
              >
                No libraries available. Create a library first.
              </Typography>
            ) : (
              <List disablePadding>
                {categories.map((category) => (
                  <div key={category.id}>
                    <ListItemButton
                      onClick={() => toggleCategory(category.id)}
                      sx={{
                        py: 0.5,
                        px: 1.5,
                        borderBottom: `1px solid ${color?.borderColor || 'rgba(0, 0, 0, 0.12)'}`,
                        bgcolor: expandedCategories[category.id] ? 'action.hover' : 'transparent',
                        '&:hover': {
                          bgcolor: 'action.hover',
                        },
                      }}
                    >
                      <ListItemText
                        primary={
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {category.name}
                            <Typography component="span" variant="caption" sx={{ ml: 1, opacity: 0.7 }}>
                              ({category.libraries.length})
                            </Typography>
                          </Typography>
                        }
                      />
                      {expandedCategories[category.id] ? (
                        <ExpandLessIcon fontSize="small" />
                      ) : (
                        <ExpandMoreIcon fontSize="small" />
                      )}
                    </ListItemButton>
                    <Collapse in={expandedCategories[category.id]} timeout="auto" unmountOnExit>
                      <List component="div" disablePadding>
                        {category.libraries.map((library) => (
                          <ListItemButton
                            key={library._id}
                            selected={selectedLibrary === library._id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, library)}
                            onDragEnd={handleDragEnd}
                            onDragOver={handleDragOver}
                            onClick={(e) => handleLibraryClick(library._id, e)}
                            sx={{
                              pl: 3,
                              pr: 1,
                              py: 0.75,
                              '&.Mui-selected': {
                                bgcolor: 'primary.main',
                                color: 'primary.contrastText',
                                '&:hover': {
                                  bgcolor: 'primary.dark',
                                },
                              },
                              '&:hover': {
                                bgcolor: 'action.hover',
                                cursor: 'grab',
                                '& .drag-handle': {
                                  opacity: 1,
                                  visibility: 'visible',
                                },
                              },
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
                                color: 'inherit',
                              }}
                            />
                            <ListItemText
                              primary={
                                <Typography 
                                  variant="body2"
                                  sx={{
                                    fontWeight: selectedLibrary === library._id ? 600 : 400,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                  }}
                                  title={library.name}
                                >
                                  {library.name || 'Unnamed Library'}
                                </Typography>
                              }
                            />
                          </ListItemButton>
                        ))}
                      </List>
                    </Collapse>
                  </div>
                ))}
              </List>
            )}
          </Box>

          <Box sx={{ mt: 1, textAlign: 'center' }}>
            <Typography 
              variant="caption" 
              sx={{ 
                color: color?.textSecondary, 
                fontSize: '0.75rem',
                display: 'block',
                mb: 1,
              }}
            >
              Drag and drop a library to open it
            </Typography>
            <Button
              onClick={handleClose}
              variant="outlined"
              size="small"
              fullWidth
              sx={{
                textTransform: 'none',
                fontSize: '0.75rem',
                fontWeight: 500,
                color: color?.textPrimary,
                borderColor: color?.borderColor,
                '&:hover': {
                  borderColor: color?.primary,
                  color: color?.primary,
                  bgcolor: 'transparent',
                },
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