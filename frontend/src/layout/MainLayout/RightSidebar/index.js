import React, { useState } from 'react';
import { Button, TextField, Box, OutlinedInput, InputLabel, MenuItem, FormControl, Select, Chip, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

import { v4 as uid } from 'uuid';
import useStore from '../../../Zustand/store';
import AlertMessage from '../../../ui-component/Alert';
import { updatedModelState } from '../../../utils/Constraints';
import { CloseCircle } from 'iconsax-react';
import { useDispatch, useSelector } from 'react-redux';
import { drawerClose } from '../../../store/slices/CurrentIdSlice';
import { setSelectedItem } from '../../../store/slices/CanvasSlice';

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
  model: state.model
});

function getStyles(name, nodes, theme) {
  return {
    fontWeight: nodes.indexOf(name) === -1 ? theme.typography.fontWeightRegular : theme.typography.fontWeightMedium
  };
}
export default function RightDrawer({ stateOpen }) {
  const theme = useTheme();
  const dispatch = useDispatch();
  const [newNode, setNewNode] = useState({
    nodeName: '',
    type: '',
    properties: [],
    bgColor: ''
  });
  const [openMsg, setOpenMsg] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');
  const { createNode, updateModel, setNodes, nodes, edges, model, getSidebarNode } = useStore(selector);
  const { selectedItem } = useSelector((state) => state?.canvas);
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

  // console.log('selectedItem', selectedItem);
  // console.log('nodes', nodes);

  // For Adding new Node

  const CloseModel = () => {
    dispatch(drawerClose());
    setNewNode({
      nodeName: '',
      type: '',
      properties: [],
      bgColor: '#dadada'
    });
    dispatch(setSelectedItem({}));
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
      id: selectedItem?._id,
      new_node: dataNode
    };
    // const selectedsection = nodeState?.find((nd) => nd.id === selectedItem?.id);
    // selectedsection?.nodes?.push(dataNode);
    // console.log('selectedsection', selectedsection);
    if (!Object.keys(selectedItem).length) {
      const Details = {
        ...dataNode,
        position: { x: 495, y: 250 }
      };
      const list = [...nodes, Details];
      setNodes(list);
      const mod = { ...model };
      updateModel(updatedModelState(mod, list, edges))
        .then((res) => {
          // console.log('res', res);
          if (res.data) {
            setTimeout(() => {
              setOpenMsg(true);
              setMessage('Node created Successfully');
              setSuccess(true);
              getSidebarNode();
            }, []);
          }
        })
        .catch((err) => {
          console.log('err', err);
          setOpenMsg(true);
          setSuccess(false);
          setMessage('Something went wrong');
        });
    } else {
      // console.log('details', details);
      createNode(details)
        // updateNode(selectedsection)
        .then((res) => {
          // console.log('res', res);
          if (res.data) {
            setTimeout(() => {
              setOpenMsg(true);
              setMessage('Node created Successfully');
              setSuccess(true);
              getSidebarNode();
            }, []);
          }
        })
        .catch((err) => {
          console.log('err', err);
          setOpenMsg(true);
          setSuccess(false);
          setMessage('Something went wrong');
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
    <React.Fragment>
      <Box
        sx={{
          backgroundColor: '#e3e3e3',
          position: 'sticky',
          float: 'right',
          // left: '50rem',
          transition: 'width 0.8s',
          width: stateOpen ? 'fit-content' : '0px',
          height: 'fit-content',
          zIndex: 1000,
          display: 'flex'
          // pr:1
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, my: 1, mx: 3 }}>
          <Box display="flex" justifyContent="space-between" my={1} alignItems="center">
            <Typography variant="h4" color="primary">
              {'Add New'}
            </Typography>
            <CloseCircle size="24" color="#000" onClick={CloseModel} style={{ cursor: 'pointer' }} />
          </Box>
          <TextField id="outlined-basic" label="Name" name="nodeName" variant="outlined" onChange={handleChange} />
          <FormControl sx={{ width: 350 }}>
            <InputLabel id="demo-simple-select-label">Type</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={newNode.type}
              label="type"
              onChange={handleChange}
              name="type"
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
          <FormControl sx={{ width: 350 }}>
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
                    <Chip key={value} label={value} />
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

        <AlertMessage open={openMsg} message={message} setOpen={setOpenMsg} success={success} />
      </Box>
    </React.Fragment>
  );
}
