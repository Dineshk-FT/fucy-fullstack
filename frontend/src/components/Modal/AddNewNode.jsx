/* eslint-disable */
import React, { useCallback, useState } from 'react';
import {
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  MenuItem,
  Chip,
  Typography,
  CircularProgress,
  FormLabel,
} from '@mui/material';
import { shallow } from 'zustand/shallow';
import { v4 as uid } from 'uuid';
import { useTheme } from '@mui/material/styles';
import { useDispatch, useSelector } from 'react-redux';
import toast, { Toaster } from 'react-hot-toast';
import useStore from '../../store/Zustand/store';
import { getNodeDetails } from '../../utils/Constraints';
import { setSelectedNodeGroupId } from '../../store/slices/PageSectionSlice';
import { closeAddNodeTab } from '../../store/slices/CanvasSlice';
import ColorTheme from '../../themes/ColorTheme';
import CancelTwoToneIcon from '@mui/icons-material/CancelTwoTone';

const properties = [
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
      width: 'inherit',
    },
  },
};

const selector = (state) => ({
  createNode: state.createNode,
  setNodes: state.setNodes,
  nodes: state.nodes,
  getSidebarNode: state.getSidebarNode,
});

export default React.memo(function AddNewNode({ assets }) {
  const color = ColorTheme();
  const theme = useTheme();
  const dispatch = useDispatch();
  const { selectedNodeGroupId } = useSelector((state) => state?.pageName);
  const { createNode, setNodes, nodes, getSidebarNode } = useStore(selector, shallow);
  const [count, setCount] = useState(1);
  const [newNode, setNewNode] = useState({
    nodeName: `New Node ${count}`,
    type: '',
    properties: [properties[0]],
    bgColor: '#dadada',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    if (name === 'properties') {
      setNewNode((prev) => ({
        ...prev,
        properties: typeof value === 'string' ? value.split(',') : value,
      }));
    } else {
      setNewNode((prev) => ({ ...prev, [name]: value }));
    }
  }, []);

  const handleClose = useCallback(() => {
    dispatch(closeAddNodeTab());
    dispatch(setSelectedNodeGroupId(''));
    setNewNode({
      nodeName: `New Node ${count + 1}`,
      type: '',
      properties: [properties[0]],
      bgColor: '#dadada',
    });
  }, [dispatch, count]);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (!newNode.nodeName.trim() || !newNode.properties.length) {
        toast.error('Name and at least one property are required');
        return;
      }

      setLoading(true);
      if (!selectedNodeGroupId) {
        const nodeDetail = getNodeDetails('default', 'Node', count, {
          ...newNode,
          nodeName: newNode.nodeName.trim(),
        });
        setNodes([...nodes, nodeDetail]);
        toast.success('Node added successfully');
        setCount((prev) => prev + 1);
        setNewNode({
          nodeName: `New Node ${count + 1}`,
          type: '',
          properties: [properties[0]],
          bgColor: '#dadada',
        });
        handleClose();
      } else {
        const details = { id: selectedNodeGroupId, new_node: { ...newNode, id: uid() } };
        createNode(details)
          .then((res) => {
            if (res.data) {
              toast.success(res?.data?.message ?? 'Node added successfully');
              getSidebarNode();
              dispatch(setSelectedNodeGroupId(''));
              setCount((prev) => prev + 1);
              setNewNode({
                nodeName: `New Node ${count + 1}`,
                type: '',
                properties: [properties[0]],
                bgColor: '#dadada',
              });
              handleClose();
            }
          })
          .catch(() => {
            toast.error('Something went wrong');
          })
          .finally(() => {
            setLoading(false);
          });
      }
    },
    [
      newNode,
      selectedNodeGroupId,
      nodes,
      setNodes,
      createNode,
      getSidebarNode,
      dispatch,
      count,
      handleClose,
    ],
  );

  return (
    <>
      <Box
        sx={{
          background: color?.sidebarBG,
          color: color?.sidebarContent,
          p: 2,
          borderRadius: '8px',
          maxWidth: '475px',
        }}
      >
        <Box
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}
        >
          <Typography variant="h4" color="primary">
            Add New Node
          </Typography>
          <Button
            onClick={handleClose}
            sx={{ minWidth: 0, p: 0 }}
            aria-label="Close"
            disabled={loading}
          >
            <CancelTwoToneIcon sx={{ color: color?.iconColor }} />
          </Button>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box>
            <TextField
              label="Name"
              name="nodeName"
              value={newNode.nodeName}
              onChange={handleChange}
              variant="outlined"
              placeholder="Enter node name"
              size="small"
              fullWidth
              required
              aria-label="Node name"
              sx={{ bgcolor: color?.inputBg }}
            />
          </Box>
          <Box>
            <FormControl fullWidth size="small">
              <InputLabel id="properties-select-label">Properties</InputLabel>
              <Select
                labelId="properties-select-label"
                name="properties"
                multiple
                value={newNode.properties}
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
                {properties.map((name) => (
                  <MenuItem
                    key={name}
                    value={name}
                    sx={{
                      fontWeight:
                        newNode.properties.indexOf(name) === -1
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, gap: 1 }}>
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
            disabled={loading || !newNode.nodeName.trim() || !newNode.properties.length}
            sx={{ textTransform: 'none', minWidth: '80px' }}
            startIcon={loading && <CircularProgress size={16} />}
          >
            Add
          </Button>
        </Box>
      </Box>
      <Toaster position="top-right" reverseOrder={false} />
    </>
  );
});