/* eslint-disable */
import React, { useState } from 'react';
import {
  Autocomplete,
  Avatar,
  Box,
  Button,
  Checkbox,
  Chip,
  ClickAwayListener,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Popper,
  Select,
  Tab,
  Tabs,
  TextField
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useSelector } from 'react-redux';
import ColorTheme from '../../../store/ColorTheme';
import { fontSize } from '../../../store/constant';
import {
  ConfidentialityIcon,
  IntegrityIcon,
  AuthenticityIcon,
  AuthorizationIcon,
  Non_repudiationIcon,
  AvailabilityIcon
} from '../../../assets/icons';

const useStyles = makeStyles(() => ({
  inputlabel: {
    fontSize: fontSize - 2,
    fontFamily: 'Inter',
    fontWeight: 600
  }
}));

const EdgeStyleoptions = [
  { label: 'solid', value: '0' },
  { label: 'dashed', value: '4 4' },
  { label: 'dotted', value: '2 4' },
  { label: 'groove', value: '8 4 2 4' },
  { label: 'double line', value: '1 4' },
  { label: 'unindent', value: '2 4 8 4' }
];

const Properties = [
  { name: 'Confidentiality', image: ConfidentialityIcon },
  { name: 'Integrity', image: IntegrityIcon },
  { name: 'Authenticity', image: AuthenticityIcon },
  { name: 'Authorization', image: AuthorizationIcon },
  { name: 'Non-repudiation', image: Non_repudiationIcon },
  { name: 'Availability', image: AvailabilityIcon }
];
const EditEdge = ({ anchorEl, handleClosePopper, details, setDetails, handleSaveEdit, dispatch, edges, setEdges }) => {
  const color = ColorTheme();
  const classes = useStyles();
  const { selectedBlock } = useSelector((state) => state?.canvas);
  const [tabValue, setTabValue] = useState(0); // Managing tab state

  const updateElement = (updateFn) => {
    const updatedEdges = edges.map((edge) => (edge.id === selectedBlock?.id ? updateFn(edge) : edge));
    setEdges(updatedEdges);
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

  const onChange = (e, name) => {
    const value = name == 'strokeDasharray' ? e.value : e.target.value;
    if (name === 'startPoint' || name === 'endPoint') {
      dispatch(setDetails({ ...details, [name]: value }));
      updateElement((element) => ({
        ...element,
        [name === 'startPoint' ? 'markerStart' : 'markerEnd']: {
          ...element[name === 'startPoint' ? 'markerStart' : 'markerEnd'],
          color: value
        }
      }));
    } else {
      dispatch(setDetails({ ...details, style: { ...details.style, [name]: value } }));
      updateElement((element) => ({ ...element, style: { ...element.style, [name]: value } }));
    }
  };

  return (
    <Popper
      open={Boolean(anchorEl)}
      anchorEl={anchorEl}
      placement="top-start"
      modifiers={[{ name: 'offset', options: { offset: [0, 20] } }]}
      sx={{
        minWidth: 250,
        width: 300,
        // maxWidth: 400,
        boxShadow: '0px 0px 4px black',
        borderRadius: '8px',
        zIndex: 1100,
        background: 'white'
      }}
    >
      <ClickAwayListener onClickAway={handleClosePopper}>
        <Paper sx={{ padding: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
          {/* Tabs */}
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => setTabValue(newValue)}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
          >
            <Tab label="Details" />
            <Tab label="Style" />
          </Tabs>

          {/* Tab Content */}
          {tabValue === 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {/* Name & Asset Checkbox */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ flex: 1 }}>
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
                  control={<Checkbox onChange={handleChecked} checked={Boolean(details?.isAsset)} />}
                  label="Asset"
                /> */}
              </Box>

              {/* Properties */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <InputLabel className={classes.inputlabel}>Properties :</InputLabel>
                <Autocomplete
                  multiple
                  options={Properties}
                  getOptionLabel={(option) => option.name}
                  value={details?.properties?.map((prop) => Properties.find((p) => p.name === prop) || { name: prop }) || []}
                  onChange={handleChange}
                  isOptionEqualToValue={(option, value) => option?.name === value?.name}
                  sx={{ minWidth: '130px', maxWidth: '240px', '& .MuiOutlinedInput-root': { padding: '4px' } }}
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
            </Box>
          )}

          {tabValue === 1 && (
            <Grid container spacing={2} mb={2}>
              {/* Edge Thickness */}
              <Grid item xs={6}>
                <InputLabel className={classes.inputlabel}>Edge Thickness:</InputLabel>
                <TextField
                  type="number"
                  variant="outlined"
                  sx={{ width: '100px' }}
                  value={details?.style?.strokeWidth || ''}
                  onChange={(e) => onChange(e, 'strokeWidth')}
                />
              </Grid>

              {/* Color */}
              <Grid item xs={6}>
                <InputLabel className={classes.inputlabel}>Color:</InputLabel>
                <TextField
                  type="color"
                  variant="outlined"
                  sx={{ width: '50px', height: '35px' }}
                  value={details?.style?.stroke || '#000000'}
                  onChange={(e) => onChange(e, 'stroke')}
                />
              </Grid>

              {/* End-Point Color */}
              <Grid item xs={6} display="flex" gap={1}>
                <Box>
                  <InputLabel className={classes.inputlabel}>Start-Point:</InputLabel>
                  <TextField
                    type="color"
                    variant="outlined"
                    sx={{ width: '50px', height: '35px' }}
                    value={details?.startPoint || '#000000'}
                    onChange={(e) => onChange(e, 'startPoint')}
                  />
                </Box>
                <Box>
                  <InputLabel className={classes.inputlabel}>End-Point:</InputLabel>
                  <TextField
                    type="color"
                    variant="outlined"
                    sx={{ width: '50px', height: '35px' }}
                    value={details?.endPoint || '#000000'}
                    onChange={(e) => onChange(e, 'endPoint')}
                  />
                </Box>
              </Grid>

              {/* Line Style Autocomplete */}
              <Grid item xs={6}>
                <InputLabel className={classes.inputlabel}>Line Style:</InputLabel>
                <Autocomplete
                  options={EdgeStyleoptions}
                  value={EdgeStyleoptions.find((option) => option.value === details?.style?.strokeDasharray) || null}
                  onChange={(event, newValue) => onChange(newValue, 'strokeDasharray')}
                  renderInput={(params) => <TextField {...params} variant="outlined" />}
                  getOptionLabel={(option) => option.label}
                  sx={{ width: 'auto' }}
                />
              </Grid>
            </Grid>
          )}

          {/* Action Buttons */}
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

export default EditEdge;
