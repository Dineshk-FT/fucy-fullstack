import React, { useCallback, useState } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  OutlinedInput,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  CircularProgress,
  FormLabel,
} from '@mui/material';
import { shallow } from 'zustand/shallow';
import { useTheme } from '@mui/material/styles';
import toast, { Toaster } from 'react-hot-toast';
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
  nodes: state?.nodes,
  setNodes: state?.setNodes,
});

export default React.memo(function AddPropertiesGate({ open, handleClose, updateNode }) {
  const theme = useTheme();
  const color = ColorTheme();
  const { nodes, setNodes } = useStore(selector, shallow);
  const [prop, setProp] = useState({
    properties: [],
    status: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    if (name === 'properties') {
      setProp((prev) => ({
        ...prev,
        properties: typeof value === 'string' ? value.split(',') : value,
      }));
    } else {
      setProp((prev) => ({ ...prev, [name]: value }));
    }
  }, []);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (!prop.status || !prop.properties.length) {
        toast.error('Status and at least one property are required');
        return;
      }

      setLoading(true);
      const updatedNodes = [...nodes];
      const selectedNode = updatedNodes.find((nd) => nd?.id === updateNode?.id);
      if (selectedNode) {
        selectedNode.data.properties = prop.properties;
        selectedNode.data.status = prop.status;
        const index = updatedNodes.findIndex((nd) => nd?.id === updateNode?.id);
        updatedNodes[index] = selectedNode;
        setNodes(updatedNodes);
        toast.success('Node updated successfully');
        setProp({ properties: [], status: '' });
        handleClose();
      } else {
        toast.error('Node not found');
      }
      setLoading(false);
    },
    [prop, nodes, setNodes, updateNode, handleClose],
  );

  const handleCloseModal = useCallback(() => {
    setProp({ properties: [], status: '' });
    handleClose();
  }, [handleClose]);

  return (
    <>
      <Dialog
        open={open}
        onClose={handleCloseModal}
        aria-labelledby="add-properties-gate-dialog-title"
        aria-describedby="add-properties-gate-dialog-description"
        maxWidth="sm"
        sx={{
          '& .MuiPaper-root': {
            background: color?.modalBg,
            width: '475px',
            borderRadius: '8px',
          },
        }}
      >
        <DialogTitle sx={{ fontSize: 18, fontFamily: 'Inter' }}>
          Add Node Details
        </DialogTitle>
        <DialogContent sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <FormLabel sx={{ fontWeight: 600, color: color?.title, mb: 1 }} required>
                Type
              </FormLabel>
              <FormControl fullWidth size="small">
                <InputLabel id="type-select-label">Type</InputLabel>
                <Select
                  labelId="type-select-label"
                  name="status"
                  value={prop.status}
                  onChange={handleChange}
                  label="Type"
                  sx={{ bgcolor: color?.inputBg }}
                >
                  <MenuItem value="severe">Severe</MenuItem>
                  <MenuItem value="moderate">Moderate</MenuItem>
                  <MenuItem value="major">Major</MenuItem>
                  <MenuItem value="negligible">Negligible</MenuItem>
                </Select>
              </FormControl>
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
                  value={prop.properties}
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
                          prop.properties.indexOf(name) === -1
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
            onClick={handleCloseModal}
            disabled={loading}
            sx={{ textTransform: 'none', minWidth: '80px' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={loading || !prop.status || !prop.properties.length}
            sx={{ textTransform: 'none', minWidth: '80px' }}
            startIcon={loading && <CircularProgress size={16} />}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
      <Toaster position="top-right" reverseOrder={false} />
    </>
  );
});