import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { Button } from '@mui/material';
// import TextField from "@mui/material/TextField";
import Box from '@mui/material/Box';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Chip from '@mui/material/Chip';
import { useTheme } from '@mui/material/styles';
import useStore from '../../Zustand/store';

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
  nodes: state?.attackNodes,
  setNodes: state?.setAttackNodes
});

function getStyles(name, nodes, theme) {
  return {
    fontWeight: nodes.indexOf(name) === -1 ? theme.typography.fontWeightRegular : theme.typography.fontWeightMedium
  };
}
export default function AddPropertiesGate({ open, handleClose, updateNode }) {
  const theme = useTheme();
  const [prop, setProp] = useState({
    properties: [],
    status: ''
  });
  const { nodes, setNodes } = useStore(selector);

  const handleChangeType = (event) => {
    setProp({
      ...prop,
      status: event.target.value
    });
  };

  const handleChange = (event) => {
    const {
      target: { value }
    } = event;
    setProp({
      ...prop,
      properties: typeof value === 'string' ? value.split(',') : value
    });
  };

  // For updating the node
  const handleSubmit = (e) => {
    const Nodes = [...nodes];
    e.preventDefault();
    const selectedNode = nodes?.find((nd) => nd?.id === updateNode?.id);
    // console.log('selectedNode', selectedNode)
    selectedNode.data.properties = prop?.properties;
    selectedNode.data.status = prop?.status;
    const Index = nodes?.findIndex((nd) => nd?.id === updateNode?.id);
    Nodes[Index] = selectedNode;
    // console.log('Nodes', Nodes)
    setNodes(Nodes);
    handleClose();
  };

  const CloseModel = () => {
    handleClose();
    setProp({
      status: '',
      properties: []
    });
  };
  return (
    <Dialog open={open} onClose={CloseModel} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
      <DialogTitle id="alert-dialog-title">{'Add Details'}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, my: 1 }}>
          <FormControl sx={{ width: 350 }}>
            <InputLabel id="demo-simple-select-label">Type</InputLabel>
            <Select labelId="demo-simple-select-label" id="demo-simple-select" value={prop.type} label="type" onChange={handleChangeType}>
              <MenuItem value="severe">Severe</MenuItem>
              <MenuItem value="moderate">Moderate</MenuItem>
              <MenuItem value="major">Major</MenuItem>
              <MenuItem value="negligible">Negligible</MenuItem>
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
              value={prop.properties}
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
                <MenuItem key={name} value={name} style={getStyles(name, prop.properties, theme)}>
                  {name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={CloseModel} variant="outlined" color="warning">
          cancel
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={!prop.status || !prop.properties.length > 0}>
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
}
