/*eslint-disable*/
import {
  Autocomplete,
  Avatar,
  Box,
  Button,
  Checkbox,
  Chip,
  ClickAwayListener,
  FormControlLabel,
  InputLabel,
  Paper,
  Popper,
  Tab,
  Tabs,
  TextField
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import React, { useState } from 'react';
import ColorTheme from '../../themes/ColorTheme';
import { fontSize } from '../../themes/constant';
import { useSelector } from 'react-redux';
import Header from '../Header';
import {
  ConfidentialityIcon,
  IntegrityIcon,
  AuthenticityIcon,
  AuthorizationIcon,
  Non_repudiationIcon,
  AvailabilityIcon
} from '../../assets/icons';

const useStyles = makeStyles(() => ({
  inputlabel: {
    fontSize: fontSize - 2,
    fontFamily: 'Inter',
    fontWeight: 600
  }
}));

const Properties = [
  { name: 'Confidentiality', image: ConfidentialityIcon },
  { name: 'Integrity', image: IntegrityIcon },
  { name: 'Authenticity', image: AuthenticityIcon },
  { name: 'Authorization', image: AuthorizationIcon },
  { name: 'Non-repudiation', image: Non_repudiationIcon },
  { name: 'Availability', image: AvailabilityIcon }
];
const EditNode = ({
  anchorEl,
  handleClosePopper,
  details,
  setDetails,
  handleSaveEdit,
  dispatch,
  nodes,
  setNodes,
  setSelectedElement,
  selectedElement
}) => {
  const color = ColorTheme();
  const classes = useStyles();
  const { selectedBlock } = useSelector((state) => state?.canvas);
  const [tabIndex, setTabIndex] = useState(0);
  // console.log('selectedElement', selectedElement);
  const updateElement = (updateFn) => {
    const updatedNodes = nodes.map((node) => (node.id === selectedBlock?.id ? updateFn(node) : node));
    setNodes(updatedNodes);
  };

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const handleChange = (event, newValue) => {
    const updatedProperties = newValue.map((prop) => prop.name);
    // console.log('updatedProperties', updatedProperties);
    dispatch(setDetails({ ...details, properties: updatedProperties }));
    updateElement((element) => ({ ...element, properties: updatedProperties }));
  };

  const handleStyle = (e) => {
    const { value } = e.target;
    dispatch(setDetails((state) => ({ ...state, name: value })));
    updateElement((element) => ({
      ...element,
      data: { ...element.data, label: value }
    }));
  };

  return (
    <Popper
      open={Boolean(anchorEl)}
      anchorEl={anchorEl}
      placement="bottom-start"
      sx={{ minWidth: 250, width: 300, boxShadow: '0px 0px 4px black', borderRadius: '8px' }}
    >
      <ClickAwayListener onClickAway={handleClosePopper}>
        <Paper sx={{ padding: 1, display: 'flex', flexDirection: 'column', gap: 1, alignContent: 'center' }}>
          <Tabs value={tabIndex} onChange={handleTabChange} variant="fullWidth">
            <Tab label="General" />
            <Tab label="Style" />
          </Tabs>

          {tabIndex === 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 1 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, flex: 1 }}>
                <InputLabel className={classes.inputlabel}>Name :</InputLabel>
                <TextField
                  variant="outlined"
                  value={details?.name}
                  onChange={handleStyle}
                  sx={{
                    background: `${color?.sidebarBG} !important`,
                    color: color?.sidebarContent,
                    '& .MuiInputBase-input': { fontSize: fontSize - 2, padding: '6px 8px', borderRadius: '0px' },
                    '& .MuiOutlinedInput-notchedOutline': { borderRadius: '5px' }, // Remove border radius
                    width: '240px'
                  }}
                />
              </Box>

              {/* <FormControlLabel
                sx={{ fontSize: fontSize - 2, color: color?.sidebarContent, position: 'relative', top: '10px' }}
                control={
                  <Checkbox
                    onChange={(e) => dispatch(setDetails((state) => ({ ...state, isAsset: e.target.checked })))}
                    checked={Boolean(details?.isAsset)}
                  />
                }
                label="Asset"
              /> */}
              {selectedBlock?.type === 'group' && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <InputLabel className={classes.inputlabel}>Properties :</InputLabel>
                  <Autocomplete
                    multiple
                    options={Properties}
                    getOptionLabel={(option) => option.name}
                    value={details?.properties?.map((prop) => Properties.find((p) => p.name === prop) || { name: prop }) || []}
                    onChange={handleChange}
                    isOptionEqualToValue={(option, value) => option?.name === value?.name}
                    sx={{ minWidth: '180px', maxWidth: '240px', '& .MuiOutlinedInput-root': { padding: '4px' } }}
                    renderOption={(props, option) => (
                      <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', gap: 1, padding: '4px' }}>
                        <Avatar src={option?.image} alt={option?.name} sx={{ width: 24, height: 24 }} />
                        {option?.name}
                      </Box>
                    )}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip
                          key={option?.name}
                          avatar={<Avatar src={option?.image} alt={option?.name} sx={{ width: 20, height: 20 }} />}
                          variant="outlined"
                          label={option?.name}
                          {...getTagProps({ index })}
                          sx={{ '& .MuiChip-label': { fontSize: 10 } }}
                        />
                      ))
                    }
                    renderInput={(params) => <TextField {...params} variant="outlined" />}
                  />
                </Box>
              )}
            </Box>
          )}

          {tabIndex === 1 && (
            <Header selectedElement={selectedElement} nodes={nodes} setNodes={setNodes} setSelectedElement={setSelectedElement} />
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button variant="outlined" color="error" onClick={handleClosePopper} sx={{ fontSize: fontSize - 2, padding: '4px 8px' }}>
              Close
            </Button>
            <Button onClick={handleSaveEdit} color="primary" variant="contained" sx={{ fontSize: fontSize - 2, padding: '4px 8px' }}>
              Update
            </Button>
          </div>
        </Paper>
      </ClickAwayListener>
    </Popper>
  );
};

export default EditNode;
