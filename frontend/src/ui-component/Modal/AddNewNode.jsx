/* eslint-disable */
import React, { useState } from 'react';
import { Button, TextField, Box, OutlinedInput, InputLabel, MenuItem, FormControl, Select, Chip, Typography, Grid } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useStore from '../../Zustand/store';
import { updatedModelState } from '../../utils/Constraints';
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
  }
};

const names = ['Confidentiality', 'Integrity', 'Authenticity', 'Authorization', 'Non-repudiation', 'Availability'];

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
  const { selectedNodeGroupId } = useSelector((state) => state?.pageName);
  const [newNode, setNewNode] = useState({
    nodeName: '',
    type: '',
    properties: [],
    bgColor: ''
  });

  // console.log('selectedNodeGroupId', selectedNodeGroupId);

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
      nodeName: '',
      type: '',
      properties: [],
      bgColor: '#dadada'
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataNode = {
      id: uid(),
      data: {
        label: newNode.nodeName,
        style: {
          backgroundColor: '#dadada',
          fontSize: '12px',
          fontFamily: 'Inter',
          fontStyle: 'normal',
          textAlign: 'center',
          color: 'black',
          fontWeight: 500,
          textDecoration: 'none',
          borderColor: 'gray',
          borderWidth: '2px',
          borderStyle: 'solid',
          width: 120,
          height: 50
        }
      },
      type: 'default',
      properties: newNode.properties,
      width: 120,
      height: 50,
      isAsset: false
    };

    const details = { id: selectedNodeGroupId, new_node: dataNode };

    const updatePositionWithinRange = (position, range) => {
      const getRandomOffset = (range) => Math.random() * range * 2 - range;
      return { x: position.x + getRandomOffset(range), y: position.y + getRandomOffset(range) };
    };

    const position = { x: 495, y: 250 };
    const range = 50;
    const updatedPosition = updatePositionWithinRange(position, range);

    if (!selectedNodeGroupId) {
      const nodeDetail = { ...dataNode, position: updatedPosition };
      const list = [...nodes, nodeDetail];
      setNodes(list);
      const template = { nodes: list, edges: edges };
      const details = {
        'model-id': model?._id,
        template: JSON.stringify(template),
        ...(assets && { assetId: assets?._id }) // Conditional property
      };

      update(details)
        .then((res) => {
          if (res.data) {
            notify(res?.message ?? 'Node added successfully', 'success');
            getSidebarNode();
          }
        })
        .catch((err) => {
          // console.log('err', err);
          notify('Something went wrong', 'error');
        });
    } else {
      createNode(details)
        .then((res) => {
          // console.log('res', res);
          if (res.data) {
            notify(res?.data?.message ?? 'Node added successfully', 'success');
            getSidebarNode();
            setSelectedNodeGroupId({});
          }
        })
        .catch((err) => {
          // console.log('err', err);
          notify('Something went wrong', 'error');
        });
    }

    setNewNode({
      nodeName: '',
      type: '',
      properties: [],
      bgColor: '#dadada'
    });
  };

  return (
    <Box sx={{ background: `${color?.sidebarBG} !important`, color: color?.sidebarContent }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, my: 1, mx: 1, p: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4" color="primary">
            Add New Node
          </Typography>
          {/* <CloseCircle size="20" color="#000" onClick={CloseModel} style={{ cursor: 'pointer', background: `${color?.sidebarBG } !important`, color: color?.sidebarConten }} /> */}
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
          sx={{
            fontSize: fontSize,
            background: `${color?.sidebarBG} !important`,
            color: color?.sidebarContent
            // '& .MuiOutlinedInput-notchedOutline': {
            //   borderColor: color?.sidebarContent,
            //   backgroundColor: color?.sidebarBG,
            // }
          }}
        />

        <Grid container spacing={1} my={1}>
          {/* <Grid item xs={6}>
            <FormControl size="small" fullWidth>
              <InputLabel id="demo-simple-select-label">Type</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={newNode.type}
                label="Type"
                onChange={handleChange}
                name="type"
                sx={{
                  fontSize: fontSize,
                  background: `${color?.sidebarBG} !important`,
                  color: color?.sidebarContent
                  // '& .MuiOutlinedInput-notchedOutline': {
                  //   borderColor: color?.sidebarContent,
                  //   backgroundColor: color?.sidebarBG,
                  // },
                }}
              >
                <MenuItem value="input">Input</MenuItem>
                <MenuItem value="default">Default</MenuItem>
                <MenuItem value="custom">Custom</MenuItem>
                <MenuItem value="signal">Signal</MenuItem>
                <MenuItem value="receiver">Receiver</MenuItem>
                <MenuItem value="output">Output</MenuItem>
                <MenuItem value="transceiver">Transceiver</MenuItem>
                <MenuItem value="transmitter">Transmitter</MenuItem>
              </Select>
            </FormControl>
          </Grid> */}

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
                  // '& .MuiOutlinedInput-notchedOutline': {
                  //   borderColor: color?.sidebarContent,
                  //   backgroundColor: color?.sidebarBG,
                  // }
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
                {names.map((name) => (
                  <MenuItem key={name} value={name} style={getStyles(name, newNode.properties, theme)}>
                    {name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Box display="flex" justifyContent="space-between" height="30px">
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
