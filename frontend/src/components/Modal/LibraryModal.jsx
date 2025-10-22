/*eslint-disable*/
import React, { useState, useEffect, useRef } from 'react';
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
  Tooltip,
  TextField
} from '@mui/material';
import { DragIndicator, ExpandMore as ExpandMoreIcon, ExpandLess as ExpandLessIcon, Close as CloseIcon } from '@mui/icons-material';
import useStore from '../../store/Zustand/store';
import { toast } from 'react-hot-toast';
import ColorTheme from '../../themes/ColorTheme';
import { setModelId } from '../../store/slices/PageSectionSlice';
import { closeAll } from '../../store/slices/CurrentIdSlice';
import { useNavigate } from 'react-router';
import { useDispatch } from 'react-redux';

export default function LibraryModal({ open, handleClose, anchorEl }) {
  const color = ColorTheme();
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLibrary, setSelectedLibrary] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);
  const [hasExistingData, setHasExistingData] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [showCreateNewTab, setShowCreateNewTab] = useState(false);
  const [newModelName, setNewModelName] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const draggedItemRef = useRef(null);

  const handleCloseErrorDialog = (e) => {
    e?.stopPropagation?.();
    setShowErrorDialog(false);
    setShowCreateNewTab(false);
    setNewModelName('');
  };

  useEffect(() => {
    const checkExistingData = () => {
      const { nodes, edges, model } = useStore.getState();
      const safeNodes = Array.isArray(nodes) ? nodes : [];
      const safeEdges = Array.isArray(edges) ? edges : [];
      return safeNodes.length > 0 || safeEdges.length > 0;
    };

    const loadLibraries = async () => {
      if (!open) return;

      setIsLoading(true);
      setCategories([]);
      setSelectedLibrary(null);
      setShowErrorDialog(false);

      const hasData = checkExistingData();
      setHasExistingData(hasData);

      try {
        const librariesData = await useStore.getState().getLibraries();

        if (Array.isArray(librariesData)) {
          const validLibraries = librariesData.filter((lib) => lib?._id && lib?.name);

          const categorized = validLibraries.reduce((acc, lib) => {
            const category = lib.category || 'Uncategorized';
            if (!acc[category]) acc[category] = [];
            acc[category].push(lib);
            return acc;
          }, {});

          const categoriesList = Object.entries(categorized)
            .map(([name, libraries]) => ({
              id: name.toLowerCase().replace(/\s+/g, '-'),
              name,
              libraries
            }))
            .sort((a, b) => a.name.localeCompare(b.name));

          const uncategorizedIndex = categoriesList.findIndex((cat) => cat.name === 'Uncategorized');
          if (uncategorizedIndex !== -1) {
            const uncategorized = categoriesList.splice(uncategorizedIndex, 1)[0];
            categoriesList.push(uncategorized);
          }

          setCategories(categoriesList);

          if (categoriesList.length > 0 && !Object.keys(expandedCategories).some((k) => expandedCategories[k])) {
            const firstCategoryWithLibraries = categoriesList.find((cat) => cat.libraries.length > 0);
            if (firstCategoryWithLibraries) setExpandedCategories({ [firstCategoryWithLibraries.id]: true });
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
    setExpandedCategories((prev) => ({ ...prev, [categoryId]: !prev[categoryId] }));
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
      draggedItemRef.current = library;
      setSelectedLibrary(library._id);
    } catch (error) {
      console.error('Error in handleDragStart:', error);
    }
  };

  const handleDragEnd = () => {
    if (!showErrorDialog) {
      setDraggedItem(null);
      draggedItemRef.current = null;
      document.activeElement?.blur();
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const library =
        draggedItem || (selectedLibrary && categories.flatMap((category) => category.libraries).find((lib) => lib._id === selectedLibrary));
      if (!library?._id) return;

      const currentModelId = useStore.getState().model?._id || window.location.pathname.split('/').pop();
      if (!currentModelId) throw new Error('No active model found to apply library to');

      const result = await useStore.getState().openLibrary(library._id, currentModelId);

      if (result.success) {
        handleClose(e);
        toast.success('Library data applied successfully!', {
          duration: 3000,
          position: 'top-right',
          style: { background: '#4caf50', color: '#fff' }
        });
      } else {
        throw new Error(result.error || 'Failed to apply library data');
      }
    } catch (error) {
      console.error('Error applying library data:', error);
      toast.error(error.message || 'Failed to apply library data', {
        duration: 3000,
        position: 'top-right',
        style: { background: '#f44336', color: '#fff' }
      });
    }
  };

  const handleOverwriteModel = async (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();

    try {
      const library =
        draggedItem ||
        draggedItemRef.current ||
        (selectedLibrary && categories.flatMap((cat) => cat.libraries).find((lib) => lib._id === selectedLibrary));

      if (!library?._id) {
        toast.error('No library selected');
        return;
      }

      const targetModelId = useStore.getState().model?._id || window.location.pathname.split('/').pop();
      if (!targetModelId) throw new Error('No active model found to overwrite');

      const result = await useStore.getState().openLibrary(library._id, targetModelId);

      if (result.success) {
        toast.success('Library data overwritten successfully!', {
          duration: 3000,
          position: 'top-right',
          style: { background: '#4caf50', color: '#fff' }
        });
        handleCloseErrorDialog(e);
        handleClose(e);
        useStore.getState().getModels();
        navigate(`/Models/${targetModelId}`);
      } else {
        throw new Error(result.error || 'Failed to overwrite library data');
      }
    } catch (error) {
      console.error('Error overwriting library data:', error);
      toast.error(error.message || 'Failed to overwrite library data', {
        duration: 3000,
        position: 'top-right',
        style: { background: '#f44336', color: '#fff' }
      });
    }
  };

  const handleOpenCreateNewTab = (e) => {
    e?.stopPropagation?.();
    setShowCreateNewTab(true);
  };

  const handleConfirmCreateNewModel = async (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();

    try {
      const library =
        draggedItem ||
        draggedItemRef.current ||
        (selectedLibrary && categories.flatMap((cat) => cat.libraries).find((lib) => lib._id === selectedLibrary));

      if (!library?._id) {
        toast.error('No library selected');
        return;
      }

      if (!newModelName || !newModelName.trim()) {
        toast.error('Please enter a valid model name');
        return;
      }

      const res = await useStore?.getState()?.createModel({ name: newModelName.trim() }, useStore.getState().userDetails?.username);

      if (res?.error) {
        toast.error(res.error ?? 'Something went wrong');
        return;
      }

      const newModelId = res?.model_id;
      if (!newModelId) {
        toast.error('Failed to create new model: no model_id returned');
        return;
      }

      const result = await useStore.getState().openLibrary(library._id, newModelId);

      if (result.success) {
        toast.success(`Created: ${newModelName} successfully`);
        handleCloseErrorDialog(e);
        handleClose(e);

        dispatch(setModelId(newModelId));
        dispatch(closeAll());
        useStore.getState().getModels();
        navigate(`/Models/${newModelId}`);
        setShowCreateNewTab(false);
        setNewModelName('');
      } else {
        throw new Error(result.error || 'Failed to apply library data');
      }
    } catch (error) {
      console.error('Error creating new model:', error);
      toast.error(error?.response?.data?.error || error?.message || 'Failed to create new model');
    }
  };

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

    const handleClickOutside = (event) => {
      if (showErrorDialog) return;

      const modalElement = document.querySelector('[role="tooltip"][data-popper-placement="bottom-end"]');
      const dialogElement = document.querySelector('[role="dialog"]');
      const isClickInsideModal = modalElement && modalElement.contains(event.target);
      const isClickInsideDialog = dialogElement && dialogElement.contains(event.target);
      const isAnchorEl = anchorEl && anchorEl.contains(event.target);

      if (!isClickInsideModal && !isClickInsideDialog && !isAnchorEl) handleClose(event);
    };

    document.addEventListener('dragover', handleDocumentDragOver);
    document.addEventListener('drop', handleDocumentDrop);
    document.addEventListener('mousedown', handleClickOutside, true);

    return () => {
      document.removeEventListener('dragover', handleDocumentDragOver);
      document.removeEventListener('drop', handleDocumentDrop);
      document.removeEventListener('mousedown', handleClickOutside, true);
    };
  }, [open, anchorEl, handleClose, draggedItem, selectedLibrary, hasExistingData, showErrorDialog]);

  if (!open) return null;

  return (
    <>
      <Popper
        open={open}
        anchorEl={anchorEl}
        placement="bottom-end"
        disablePortal={false}
        style={{ zIndex: 1500, ...(showErrorDialog ? { pointerEvents: 'none' } : {}) }}
        modifiers={[
          { name: 'preventOverflow', options: { boundariesElement: 'viewport' } },
          { name: 'flip', options: { enabled: true } }
        ]}
        onClick={(e) => e.stopPropagation()}
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
            border: `1px solid ${color?.borderColor || 'rgba(0, 0, 0, 0.12)'}`
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography sx={{ fontSize: 15, fontWeight: 600, color: color?.title }}>Select from Library</Typography>
            <Tooltip title="Close">
              <IconButton size="small" onClick={handleClose} sx={{ color: color?.textSecondary }}>
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
              '&::-webkit-scrollbar': { width: '6px' },
              '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(0, 0, 0, 0.2)', borderRadius: '3px' }
            }}
          >
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100px' }}>
                <CircularProgress size={24} />
              </Box>
            ) : categories.length === 0 ? (
              <Typography variant="body2" sx={{ p: 2, textAlign: 'center', color: color?.textSecondary, fontStyle: 'italic' }}>
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
                        '&:hover': { bgcolor: 'action.hover' }
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
                      {expandedCategories[category.id] ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
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
                                '&:hover': { bgcolor: 'primary.dark' }
                              },
                              '&:hover': {
                                bgcolor: 'action.hover',
                                cursor: 'grab',
                                '& .drag-handle': { opacity: 1, visibility: 'visible' }
                              },
                              '&:active': { cursor: 'grabbing' }
                            }}
                          >
                            <DragIndicator
                              className="drag-handle"
                              sx={{
                                mr: 1,
                                opacity: 0,
                                visibility: 'hidden',
                                transition: 'opacity 0.2s, visibility 0.2s',
                                color: 'inherit'
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
                                    textOverflow: 'ellipsis'
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
            <Typography variant="caption" sx={{ color: color?.textSecondary, fontSize: '0.75rem', display: 'block', mb: 1 }}>
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
                '&:hover': { borderColor: color?.primary, color: color?.primary, bgcolor: 'transparent' }
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
        sx={{ zIndex: 1600, '& .MuiDialog-paper': { minWidth: '300px', borderRadius: 2, bgcolor: color?.modalBg, color: color?.title } }}
      >
        <DialogTitle id="error-dialog-title" variant="h5" color="primary">
          Invalid Action
        </DialogTitle>
        <DialogContent>
          {!showCreateNewTab ? (
            <DialogContentText id="error-dialog-description" sx={{ color: color?.textSecondary }}>
              Current model already contains data. Do you want to overwrite it or create a new model?
            </DialogContentText>
          ) : (
            <TextField
              fullWidth
              size="small"
              placeholder="Enter new model name"
              value={newModelName}
              onChange={(e) => setNewModelName(e.target.value)}
              sx={{ mt: 1 }}
            />
          )}
        </DialogContent>
        <DialogActions>
          {!showCreateNewTab ? (
            <>
              <Button onClick={handleCloseErrorDialog} color="error" variant="outlined" sx={{ textTransform: 'none' }}>
                No
              </Button>
              <Button
                onClick={handleOverwriteModel}
                color="primary"
                variant="contained"
                sx={{ textTransform: 'none', bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }}
              >
                Yes
              </Button>
              <Button onClick={handleOpenCreateNewTab} color="primary" variant="outlined" sx={{ textTransform: 'none' }}>
                Create new
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={handleConfirmCreateNewModel}
                color="primary"
                variant="contained"
                sx={{ textTransform: 'none', bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }}
              >
                Confirm
              </Button>
              <Button onClick={() => setShowCreateNewTab(false)} color="error" variant="outlined" sx={{ textTransform: 'none' }}>
                Cancel
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
}
