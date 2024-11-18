/* eslint-disable */
import React, { useState } from 'react';
import { Button, TextField, Box, OutlinedInput, InputLabel, MenuItem, FormControl, Select, Chip, Typography } from '@mui/material';
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

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 300
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

const AddNewNode = () => {
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
  const { createNode, updateModel, setNodes, nodes, edges, model, update } = useStore(selector);
  //Name & type for the new Node
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
    // dispatch(drawerClose());
    dispatch(closeAddNodeTab());
    dispatch(setSelectedNodeGroupId(''));
    setNewNode({
      nodeName: '',
      type: '',
      properties: [],
      bgColor: '#dadada'
    });
  };

  // console.log('nodes', nodes);

  // For Adding new Node
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
          borderStyle: 'solid'
        }
      },
      type: newNode.type,
      properties: newNode.properties,
      width: 120,
      height: 50,
      isAsset: false
    };
    const details = {
      id: selectedNodeGroupId,
      new_node: dataNode
    };
    // const selectedsection = nodeState?.find((nd) => nd.id === selectedItem?.id);
    // selectedsection?.nodes?.push(dataNode);
    // console.log('selectedsection', selectedsection);

    function updatePositionWithinRange(position, range) {
      const getRandomOffset = (range) => Math.random() * range * 2 - range;

      return {
        x: position.x + getRandomOffset(range),
        y: position.y + getRandomOffset(range)
      };
    }

    const position = { x: 495, y: 250 };
    const range = 50;

    const updatedPosition = updatePositionWithinRange(position, range);
    if (!selectedNodeGroupId) {
      const nodeDetail = {
        ...dataNode,
        position: updatedPosition
      };
      const list = [...nodes, nodeDetail];
      setNodes(list);
      const template = {
        nodes: list,
        edges: edges
      };
      const details = {
        'model-id': model?._id,
        template: JSON.stringify(template)
      };

      update(details)
        // updateModel(updatedModelState(mod, list, edges))
        .then((res) => {
          // console.log('res', res);
          if (res.data) {
            notify(res?.message, 'success');

            // setTimeout(() => {
            getSidebarNode();
            // }, []);
          }
        })
        .catch((err) => {
          console.log('err', err);
          notify('Something went wrong', 'error');
        });
    } else {
      createNode(details)
        .then((res) => {
          // console.log('res', res);
          if (res.data) {
            // setTimeout(() => {
            getSidebarNode();
            setSelectedNodeGroupId({});
            notify('Node created successfully', 'success');
            // }, []);
          }
        })
        .catch((err) => {
          console.log('err', err);
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

  // console.log('newNode', newNode);
  return (
    <>
      <Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, my: 1, mx: 3 }}>
          <Box display="flex" justifyContent="space-between" my={1} alignItems="center">
            <Typography variant="h4" color="primary">
              {'Add New '}
            </Typography>
            <CloseCircle size="20" color="#000" onClick={CloseModel} style={{ cursor: 'pointer' }} />
          </Box>
          <TextField
            size="small"
            id="outlined-basic"
            label="Name"
            name="nodeName"
            variant="outlined"
            onChange={handleChange}
            sx={{ '& .MuiFormLabel-root': { fontSize: fontSize } }}
          />
          <FormControl
            size="small"
            sx={{
              width: 'inherit',
              '& .MuiInputBase-input': {
                fontSize: fontSize
              }
            }}
          >
            <InputLabel id="demo-simple-select-label">Type</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={newNode.type}
              label="type"
              onChange={handleChange}
              name="type"
              sx={{
                '& .MuiSelect-select': {
                  fontSize: fontSize
                }
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
              {/* <MenuItem value="mcu">MicroController</MenuItem>
                <MenuItem value="memory">Memory</MenuItem> */}
              {/* <MenuItem value="multihandle">Multi-Handle</MenuItem> */}
            </Select>
          </FormControl>
          <FormControl
            sx={{
              width: 'inherit'
            }}
            size="small"
          >
            <InputLabel notched id="demo-multiple-chip-label">
              Properties
            </InputLabel>
            <Select
              labelId="demo-multiple-chip-label"
              id="demo-multiple-chip"
              multiple
              name="properties"
              value={newNode.properties}
              onChange={handleChange}
              input={<OutlinedInput id="select-multiple-chip" label="Properties" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip sx={{ '& .MuiChip-label': { fontSize: fontSize } }} key={value} label={value} />
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
          <Box display="flex" justifyContent="space-between">
            <Button onClick={CloseModel} variant="outlined" color="warning">
              cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={!newNode.nodeName || !newNode.type || !newNode.properties.length > 0}
            >
              Add
            </Button>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default AddNewNode;
