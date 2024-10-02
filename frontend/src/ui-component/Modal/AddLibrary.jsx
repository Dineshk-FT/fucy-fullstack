/*eslint-disable*/
import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { Button, Chip, FormControl, InputLabel, MenuItem, OutlinedInput, Select } from '@mui/material';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import useStore from '../../Zustand/store';
import { v4 as uid } from 'uuid';
import { useTheme } from '@mui/material/styles';

const selector = (state) => ({
  getTemplates: state.getTemplates
});

const names = ['Confidentiality', 'Integrity', 'Authenticity', 'Authorization', 'Non-repudiation', 'Availability'];

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

function getStyles(name, nodes, theme) {
  return {
    fontWeight: nodes.indexOf(name) === -1 ? theme.typography.fontWeightRegular : theme.typography.fontWeightMedium
  };
}

const AddLibrary = ({ open, handleClose, savedTemplate, setNodes, setEdges }) => {
  const theme = useTheme();
  const [templateDetails, setTemplateDetails] = useState({
    name: '',
    properties: []
  });
  const { getTemplates } = useStore(selector);

  const handleChange = (event) => {
    const {
      target: { value }
    } = event;
    setTemplateDetails({
      ...templateDetails,
      properties: typeof value === 'string' ? value.split(',') : value
    });
  };

  // For adding a new Template
  const handleSubmit = (e) => {
    e.preventDefault();
    const newTemplate = {
      id: uid(),
      name: templateDetails?.name,
      template: savedTemplate,
      properties: templateDetails?.properties
    };
    // console.log('newTemplate', newTemplate);
    setTimeout(() => {
      getTemplates();
    });
    handleClose();
    setNodes([]);
    setEdges([]);
  };

  return (
    <Dialog open={open} onClose={handleClose} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
      <DialogTitle id="alert-dialog-title">{'Add New '}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, my: 1 }}>
          <TextField
            id="outlined-basic"
            label="Name"
            variant="outlined"
            onChange={(e) => setTemplateDetails({ ...templateDetails, name: e.target.value })}
          />
          <FormControl sx={{ width: 350 }}>
            <InputLabel notched id="demo-multiple-chip-label">
              Properties
            </InputLabel>
            <Select
              labelId="demo-multiple-chip-label"
              id="demo-multiple-chip"
              multiple
              value={templateDetails.properties}
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
                <MenuItem key={name} value={name} style={getStyles(name, templateDetails.properties, theme)}>
                  {name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={handleSubmit} disabled={!templateDetails.name || !templateDetails.properties.length > 0}>
          Add Template
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddLibrary;
