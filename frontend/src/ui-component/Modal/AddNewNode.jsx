/* eslint-disable */
import React, { useState } from 'react';
import { Button, TextField, Box, OutlinedInput, InputLabel, MenuItem, FormControl, Select, Chip, Typography, Grid } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useStore from '../../Zustand/store';
import { getNodeDetails, updatedModelState } from '../../utils/Constraints';
import { v4 as uid } from 'uuid';
import { CloseCircle } from 'iconsax-react';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedNodeGroupId } from '../../store/slices/PageSectionSlice';
import { closeAddNodeTab } from '../../store/slices/CanvasSlice';
import { fontSize } from '../../store/constant';
import toast, { Toaster } from 'react-hot-toast';
import ColorTheme from '../../store/ColorTheme';
import CancelTwoToneIcon from '@mui/icons-material/CancelTwoTone';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 'inherit'
    }
  },
  anchorOrigin: {
    vertical: 'top',
    horizontal: 'left'
  },
  transformOrigin: {
    vertical: 'bottom',
    horizontal: 'left'
  },
  getContentAnchorEl: null
};

const properties = ['Confidentiality', 'Integrity', 'Authenticity', 'Authorization', 'Non-repudiation', 'Availability'];

const selector = (state) => ({
  updateModel: state.updateModel,
  createNode: state.createNode,
  setNodes: state.setNodes,
  nodes: state.nodes,
  edges: state.edges,
  getSidebarNode: state.getSidebarNode,
  model: state.model,
  update: state.updateAssets
});

function getStyles(name, nodes, theme) {
  return {
    fontWeight: nodes.indexOf(name) === -1 ? theme.typography.fontWeightRegular : theme.typography.fontWeightMedium
  };
}

const AddNewNode = ({ assets }) => {
  const color = ColorTheme();
  const theme = useTheme();
  const dispatch = useDispatch();
  const notify = (message, status) => toast[status](message);
  const [count, setCount] = useState(1);
  const { selectedNodeGroupId } = useSelector((state) => state?.pageName);
  const [newNode, setNewNode] = useState({
    nodeName: `New Node ${count}`,
    type: '',
    properties: [properties[0]],
    bgColor: ''
  });

  const { createNode, updateModel, setNodes, nodes, edges, model, update, getSidebarNode } = useStore(selector);

  const handleChange = (event) => {
    const {
      target: { value, name }
    } = event;
    if (name) {
      setNewNode({
        ...newNode,
        [`${name}`]: value
      });
    }
  };

  const CloseModel = () => {
    dispatch(closeAddNodeTab());
    dispatch(setSelectedNodeGroupId(''));
    setNewNode({
      nodeName: `New Node 1`,
      type: '',
      properties: [properties[0]],
      bgColor: '#dadada'
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // const details = { id: selectedNodeGroupId, new_node: dataNode };

    if (!selectedNodeGroupId) {
      const nodeDetail = getNodeDetails('default', 'Node', count);
      const list = [...nodes, nodeDetail];
      setNodes(list);
    }
    // else {
    //   createNode(details)
    //     .then((res) => {
    //       if (res.data) {
    //         notify(res?.data?.message ?? 'Node added successfully', 'success');
    //         getSidebarNode();
    //         setSelectedNodeGroupId({});
    //       }
    //     })
    //     .catch((err) => {
    //       notify('Something went wrong', 'error');
    //     });
    // }

    // Reset only the nodeName, keeping properties intact
    setCount((prev) => prev + 1);
    setNewNode((prev) => ({
      ...prev,
      nodeName: `New Node ${count + 1}`,
      type: '',
      properties: [properties[0]],
      bgColor: '#dadada'
    }));
  };

  return (
    <Box sx={{ background: `${color?.sidebarBG} !important`, color: color?.sidebarContent, position: 'relative' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, my: 1, mx: 1, p: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4" color="primary">
            Add New Node
          </Typography>
          <Box sx={{ cursor: 'pointer', float: 'right' }} onClick={CloseModel}>
            <CancelTwoToneIcon />
          </Box>
        </Box>

        <TextField
          size="small"
          label="Name"
          name="nodeName"
          variant="outlined"
          onChange={handleChange}
          value={newNode.nodeName}
          sx={{
            fontSize: fontSize,
            background: `${color?.sidebarBG} !important`,
            color: color?.sidebarContent
          }}
        />

        <Grid container spacing={1} my={1}>
          <Grid item xs={12}>
            <FormControl size="small" fullWidth>
              <InputLabel notched id="demo-multiple-chip-label">
                Properties
              </InputLabel>
              <Select
                labelId="demo-multiple-chip-label"
                id="demo-multiple-chip"
                multiple
                name="properties"
                sx={{
                  fontSize: fontSize,
                  background: `${color?.sidebarBG} !important`,
                  color: color?.sidebarContent
                }}
                value={newNode.properties}
                onChange={handleChange}
                input={<OutlinedInput id="select-multiple-chip" label="Properties" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} sx={{ fontSize: fontSize }} />
                    ))}
                  </Box>
                )}
                MenuProps={MenuProps}
              >
                {properties?.map((name) => (
                  <MenuItem key={name} value={name} style={getStyles(name, newNode.properties, theme)}>
                    {name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Box display="flex" justifyContent="space-between" height="30px" sx={{ mt: 2 }}>
          <Button onClick={CloseModel} variant="outlined" color="warning">
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSubmit} disabled={!newNode.nodeName || newNode.properties.length === 0}>
            Add
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default AddNewNode;
