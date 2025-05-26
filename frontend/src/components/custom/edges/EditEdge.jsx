/* eslint-disable */
import React, { useState } from 'react';
import {
  Autocomplete,
  Avatar,
  Box,
  Button,
  Chip,
  ClickAwayListener,
  Grid,
  InputLabel,
  Paper,
  Popper,
  Tab,
  Tabs,
  TextField
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useSelector } from 'react-redux';
import ColorTheme from '../../../themes/ColorTheme';
import { fontSize } from '../../../themes/constant';
import {
  ConfidentialityIcon,
  IntegrityIcon,
  AuthenticityIcon,
  AuthorizationIcon,
  Non_repudiationIcon,
  AvailabilityIcon
} from '../../../assets/icons';
import { MarkerType } from 'reactflow';

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
  const [tabValue, setTabValue] = useState(0);

  // console.log('selectedBlock', selectedBlock);
  // Improved update function using functional update
  const updateEdge = (updates) => {
    setEdges((prevEdges) => prevEdges.map((edge) => (edge.id === selectedBlock?.id ? { ...edge, ...updates } : edge)));
  };

  const handleChange = (event, newValue) => {
    const updatedProperties = newValue.map((prop) => prop.name);
    const updatedDetails = { ...details, properties: updatedProperties };

    dispatch(setDetails(updatedDetails));
    updateEdge({ properties: updatedProperties });
  };

  const handleStyle = (e) => {
    const { value } = e.target;
    const updatedDetails = { ...details, name: value };

    dispatch(setDetails(updatedDetails));
    updateEdge({ data: { ...selectedBlock?.data, label: value } });
  };

  const onChange = (e, name) => {
    const value = name === 'strokeDasharray' ? e?.value : e.target.value;
    let updates = {};

    if (name === 'startPoint' || name === 'endPoint') {
      const markerType = name === 'startPoint' ? 'markerStart' : 'markerEnd';
      const defaultMarker = { type: MarkerType.ArrowClosed, color: '#000000' }; // Ensure type is defined

      updates = {
        [markerType]: {
          ...defaultMarker,
          ...selectedBlock?.[markerType],
          color: value
        }
      };
      dispatch(setDetails({ ...details, [name]: value }));
    } else {
      updates = {
        style: {
          ...selectedBlock?.style,
          [name]: value
        }
      };
      dispatch(
        setDetails({
          ...details,
          style: { ...details.style, [name]: value }
        })
      );
    }

    updateEdge(updates);
  };

  return (
    <Popper
      open={Boolean(anchorEl)}
      anchorEl={anchorEl}
      placement="top-start"
      modifiers={[{ options: { offset: [0, 20] }, name: 'flip', enabled: false }]}
      sx={{
        minWidth: 250,
        width: 300,
        boxShadow: '0px 0px 4px black',
        borderRadius: '8px',
        zIndex: 1100,
        background: 'white'
      }}
    >
      <ClickAwayListener onClickAway={handleClosePopper}>
        <Paper sx={{ padding: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
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

          {tabValue === 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ flex: 1 }}>
                  <InputLabel className={classes.inputlabel}>Name :</InputLabel>
                  <TextField
                    variant="outlined"
                    value={details?.name || ''}
                    onChange={handleStyle}
                    sx={{
                      background: `${color?.sidebarBG} !important`,
                      color: color?.sidebarContent,
                      '& .MuiInputBase-input': { fontSize: fontSize - 2, padding: '6px 8px', borderRadius: '0px' },
                      '& .MuiOutlinedInput-notchedOutline': { borderRadius: '5px' },
                      width: '240px'
                    }}
                  />
                </Box>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <InputLabel className={classes.inputlabel}>Properties :</InputLabel>
                <Autocomplete
                  multiple
                  disablePortal
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

export default React.memo(EditEdge);
