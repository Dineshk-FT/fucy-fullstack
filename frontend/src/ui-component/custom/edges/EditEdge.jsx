import React, { useState } from 'react';
import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Chip,
  ClickAwayListener,
  FormControlLabel,
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
import ColorTheme from '../../../store/ColorTheme';
import { fontSize } from '../../../store/constant';

const useStyles = makeStyles(() => ({
  inputlabel: {
    fontSize: fontSize - 2,
    fontFamily: 'Inter',
    fontWeight: 600
  }
}));

const Properties = ['Confidentiality', 'Integrity', 'Authenticity', 'Authorization', 'Non-repudiation', 'Availability'];

const EditEdge = ({ anchorEl, handleClosePopper, details, setDetails, handleSaveEdit, dispatch, edges, setEdges }) => {
  const color = ColorTheme();
  const classes = useStyles();
  const { selectedBlock } = useSelector((state) => state?.canvas);
  const [tabValue, setTabValue] = useState(0); // Managing tab state

  //   console.log('edges', edges);
  //   console.log('selectedBlock', selectedBlock);
  const updateElement = (updateFn) => {
    const updatedEdges = edges.map((edge) => (edge.id === selectedBlock?.id ? updateFn(edge) : edge));
    // console.log('updatedEdges', updatedEdges);
    setEdges(updatedEdges);
  };

  const handleChange = (event, newValue) => {
    dispatch(setDetails({ ...details, properties: newValue }));
    updateElement((element) => ({ ...element, properties: newValue }));
  };

  const handleStyle = (e) => {
    const { value } = e.target;
    dispatch(setDetails((state) => ({ ...state, name: value })));
    updateElement((element) => ({
      ...element,
      data: { ...element.data, label: value }
    }));
  };

  const handleChecked = (event) => {
    const { checked } = event.target;
    dispatch(setDetails((state) => ({ ...state, isAsset: checked })));
    updateElement((element) => ({ ...element, isAsset: checked }));
  };

  const handleDelete = (valueToDelete) => () => {
    const updatedProperties = details?.properties.filter((property) => property !== valueToDelete);
    dispatch(
      setDetails((prevDetails) => ({
        ...prevDetails,
        properties: updatedProperties
      }))
    );
    updateElement((element) => ({
      ...element,
      properties: updatedProperties,
      isAsset: updatedProperties.length > 0
    }));
  };

  return (
    <Popper
      open={Boolean(anchorEl)}
      anchorEl={anchorEl}
      placement="top-start"
      modifiers={[{ name: 'offset', options: { offset: [0, 20] } }]}
      sx={{
        minWidth: 250,
        width: 'auto',
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
                    onChange={(e) => handleStyle(e, 'name')}
                    sx={{
                      background: `${color?.sidebarBG} !important`,
                      color: color?.sidebarContent,
                      '& .MuiInputBase-input': { fontSize: fontSize - 2, padding: '6px 8px' },
                      width: '150px'
                    }}
                  />
                </Box>
                <FormControlLabel
                  sx={{ fontSize: fontSize - 2, color: color?.sidebarContent, position: 'relative', top: '10px' }}
                  control={<Checkbox onChange={handleChecked} checked={Boolean(details?.isAsset)} />}
                  label="Asset"
                />
              </Box>

              {/* Properties */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <InputLabel className={classes.inputlabel}>Properties :</InputLabel>
                <Autocomplete
                  multiple
                  id="tags-filled"
                  options={Properties}
                  value={details?.properties}
                  onChange={handleChange}
                  sx={{ minWidth: '130px', maxWidth: '240px', '& .MuiOutlinedInput-root': { padding: '4px' } }}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        sx={{ '& .MuiChip-label': { fontSize: 10 } }}
                        key={option}
                        variant="outlined"
                        label={option}
                        {...getTagProps({ index })}
                        onDelete={handleDelete(option)}
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
                  value={details?.thickness || ''}
                  onChange={(e) => dispatch(setDetails({ ...details, thickness: e.target.value }))}
                />
              </Grid>

              {/* Color */}
              <Grid item xs={6}>
                <InputLabel className={classes.inputlabel}>Color:</InputLabel>
                <TextField
                  type="color"
                  variant="outlined"
                  sx={{ width: '50px', height: '35px' }}
                  value={details?.color || '#000000'}
                  onChange={(e) => dispatch(setDetails({ ...details, color: e.target.value }))}
                />
              </Grid>

              {/* Another Color Input */}
              <Grid item xs={12}>
                <InputLabel className={classes.inputlabel}>End-point Color:</InputLabel>
                <TextField
                  type="color"
                  variant="outlined"
                  sx={{ width: '50px', height: '35px' }}
                  value={details?.color || '#000000'}
                  onChange={(e) => dispatch(setDetails({ ...details, color: e.target.value }))}
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
