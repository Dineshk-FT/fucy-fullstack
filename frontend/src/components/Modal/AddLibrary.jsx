/*eslint-disable*/
import React, { useCallback, useState } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  CircularProgress,
  FormLabel,
} from '@mui/material';
import { shallow } from 'zustand/shallow';
import { v4 as uid } from 'uuid';
import { useTheme } from '@mui/material/styles';
import useStore from '../../store/Zustand/store';
import ColorTheme from '../../themes/ColorTheme';

const names = [
  'Confidentiality',
  'Integrity',
  'Authenticity',
  'Authorization',
  'Non-repudiation',
  'Availability',
];

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 300,
    },
  },
};

const selector = (state) => ({
  getTemplates: state.getTemplates,
});

export default React.memo(function AddLibrary({
  open,
  handleClose,
  savedTemplate,
  setNodes,
  setEdges,
}) {
  const theme = useTheme();
  const color = ColorTheme();
  const { getTemplates } = useStore(selector, shallow);
  const [templateDetails, setTemplateDetails] = useState({
    name: '',
    properties: [],
  });
  const [loading, setLoading] = useState(false);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    if (name === 'properties') {
      setTemplateDetails((prev) => ({
        ...prev,
        properties: typeof value === 'string' ? value.split(',') : value,
      }));
    } else {
      setTemplateDetails((prev) => ({ ...prev, [name]: value }));
    }
  }, []);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (!templateDetails.name.trim() || !templateDetails.properties.length) {
        toast.error('Name and at least one property are required');
        return;
      }

      setLoading(true);
      const newTemplate = {
        id: uid(),
        name: templateDetails.name.trim(),
        template: savedTemplate,
        properties: templateDetails.properties,
      };

      getTemplates();
      setNodes([]);
      setEdges([]);
      setTemplateDetails({ name: '', properties: [] });
      handleClose();
      setLoading(false);
    },
    [getTemplates, setNodes, setEdges, savedTemplate, templateDetails, handleClose],
  );

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="add-library-dialog-title"
        aria-describedby="add-library-dialog-description"
        maxWidth="sm"
        sx={{
          '& .MuiPaper-root': {
            background: color?.modalBg,
            width: '475px',
            borderRadius: '8px',
          },
        }}
      >
        <DialogTitle
          id="add-library-dialog-title"
          sx={{ fontSize: 18, fontFamily: 'Inter' }}
        >
          Add New Template
        </DialogTitle>
        <DialogContent sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <FormLabel sx={{ fontWeight: 600, color: color?.title, mb: 1 }} required>
                Name
              </FormLabel>
              <TextField
                name="name"
                value={templateDetails.name}
                onChange={handleChange}
                variant="outlined"
                placeholder="Enter template name"
                size="small"
                fullWidth
                required
                aria-label="Template name"
                sx={{ bgcolor: color?.inputBg }}
              />
            </Box>
            <Box>
              <FormLabel sx={{ fontWeight: 600, color: color?.title, mb: 1 }} required>
                Properties
              </FormLabel>
              <FormControl fullWidth size="small">
                <InputLabel id="properties-select-label">Properties</InputLabel>
                <Select
                  labelId="properties-select-label"
                  name="properties"
                  multiple
                  value={templateDetails.properties}
                  onChange={handleChange}
                  input={<OutlinedInput label="Properties" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} />
                      ))}
                    </Box>
                  )}
                  MenuProps={MenuProps}
                  sx={{ bgcolor: color?.inputBg }}
                >
                  {names.map((name) => (
                    <MenuItem
                      key={name}
                      value={name}
                      sx={{
                        fontWeight:
                          templateDetails.properties.indexOf(name) === -1
                            ? theme.typography.fontWeightRegular
                            : theme.typography.fontWeightMedium,
                      }}
                    >
                      {name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            variant="outlined"
            color="error"
            onClick={handleClose}
            disabled={loading}
            sx={{ textTransform: 'none', minWidth: '80px' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={
              loading ||
              !templateDetails.name.trim() ||
              !templateDetails.properties.length
            }
            sx={{ textTransform: 'none', minWidth: '80px' }}
            startIcon={loading && <CircularProgress size={16} />}
          >
            Add Template
          </Button>
        </DialogActions>
      </Dialog>
      <Toaster position="top-right" reverseOrder={false} />
    </>
  );
});