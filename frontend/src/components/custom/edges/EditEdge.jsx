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
  IconButton,
  InputLabel,
  Paper,
  Popper,
  Tab,
  Tabs,
  TextField,
  Typography
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
import FontSizeSelector from '../../Header/FontResizer';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';

const useStyles = makeStyles((theme) => ({
  inputlabel: {
    fontFamily: 'Inter',
    fontWeight: 600,
    color: 'text.primary',
    marginBottom: '4px'
  },
  popper: {
    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.15)',
    borderRadius: '12px',
    border: '1px solid',
    borderColor: 'divider',
    overflow: 'hidden'
  },
  tab: {
    minHeight: '40px',
    fontSize: fontSize - 1,
    fontWeight: 500
  },
  section: {
    padding: '8px 0'
  }
}));

const EdgeStyleoptions = [
  { label: 'Solid', value: '0' },
  { label: 'Dashed', value: '4 4' },
  { label: 'Dotted', value: '2 4' },
  { label: 'Groove', value: '8 4 2 4' },
  { label: 'Double Line', value: '1 4' },
  { label: 'Unindent', value: '2 4 8 4' }
];

const Properties = [
  { name: 'Confidentiality', image: ConfidentialityIcon },
  { name: 'Integrity', image: IntegrityIcon },
  { name: 'Authenticity', image: AuthenticityIcon },
  { name: 'Authorization', image: AuthorizationIcon },
  { name: 'Non-repudiation', image: Non_repudiationIcon },
  { name: 'Availability', image: AvailabilityIcon }
];

// Enhanced FontResizer component with better styling
const EnhancedFontResizer = ({ fontSize, changeFontSize, handleFontSizeChange }) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <Typography variant="body2" sx={{ fontWeight: 500, minWidth: '60px' }}>
        Font Size:
      </Typography>
      <FontSizeSelector fontSize={fontSize} changeFontSize={changeFontSize} handleFontSizeChange={handleFontSizeChange} />
    </Box>
  );
};

const EditEdge = ({ anchorEl, handleClosePopper, details, setDetails, handleSaveEdit, dispatch, setEdges }) => {
  const color = ColorTheme();
  const classes = useStyles();
  const { selectedBlock } = useSelector((state) => state?.canvas);
  const [tabValue, setTabValue] = useState(0);

  // Initialize labelFontSize from the style object or default to 14
  const [labelFontSize, setLabelFontSize] = useState(parseInt(details?.style?.fontSize) || 14);

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
    updateEdge({
      data: {
        ...selectedBlock?.data,
        label: value
      }
    });
  };

  const handleFontSizeChange = (e) => {
    const newSize = parseInt(e.target.value);
    setLabelFontSize(newSize);

    // Update font size in style object
    const prevStyle = details?.style || {};
    const updatedStyle = {
      ...prevStyle,
      fontSize: `${newSize}px`
    };

    const updatedDetails = {
      ...details,
      style: updatedStyle
    };

    dispatch(setDetails(updatedDetails));
    updateEdge({
      style: updatedStyle,
      data: {
        ...selectedBlock?.data,
        labelStyle: {
          ...selectedBlock?.data?.labelStyle,
          fontSize: `${newSize}px`
        }
      }
    });
  };

  const changeFontSize = (e, type) => {
    e.stopPropagation();
    const newSize = type === 'inc' ? labelFontSize + 2 : Math.max(12, labelFontSize - 2);
    setLabelFontSize(newSize);

    // Update font size in style object
    const prevStyle = details?.style || {};
    const updatedStyle = {
      ...prevStyle,
      fontSize: `${newSize}px`
    };

    const updatedDetails = {
      ...details,
      style: updatedStyle
    };

    dispatch(setDetails(updatedDetails));
    updateEdge({
      style: updatedStyle,
      data: {
        ...selectedBlock?.data,
        labelStyle: {
          ...selectedBlock?.data?.labelStyle,
          fontSize: `${newSize}px`
        }
      }
    });
  };

  const onChange = (e, name) => {
    const value = name === 'strokeDasharray' ? e?.value : e.target.value;
    let updates = {};

    if (name === 'startPoint' || name === 'endPoint') {
      const markerType = name === 'startPoint' ? 'markerStart' : 'markerEnd';
      const defaultMarker = { type: MarkerType.ArrowClosed, color: '#000000' };

      updates = {
        [markerType]: {
          ...defaultMarker,
          ...selectedBlock?.[markerType],
          color: value
        }
      };

      dispatch(setDetails({ ...details, [name]: value }));
    } else {
      const prevStyle = details?.style || {};

      const updatedStyle = {
        ...prevStyle,
        [name]: value
      };

      updates = {
        style: updatedStyle
      };

      dispatch(
        setDetails({
          ...details,
          style: updatedStyle
        })
      );
    }

    updateEdge(updates);
  };

  return (
    <Popper
      open={Boolean(anchorEl)}
      anchorEl={anchorEl}
      placement="auto"
      modifiers={[{ options: { offset: [0, 20] }, name: 'flip', enabled: false }]}
      sx={{
        minWidth: 280,
        width: 320,
        zIndex: 1300
      }}
      className={classes.popper}
    >
      <ClickAwayListener onClickAway={handleClosePopper}>
        <Paper sx={{ padding: 2, display: 'flex', flexDirection: 'column', position: 'relative' }}>
          {/* Close icon */}
          <IconButton
            onClick={handleClosePopper}
            size="small"
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              zIndex: 10,
              color: color?.sidebarContent,
              p: 0.5,
              '&:hover': { bgcolor: color?.hoverBg }
            }}
          >
            <HighlightOffIcon color="error" fontSize="small" />
          </IconButton>

          <Tabs
            value={tabValue}
            onChange={(e, newValue) => setTabValue(newValue)}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
            sx={{ minHeight: '48px' }}
          >
            <Tab label="Details" className={classes.tab} />
            <Tab label="Style" className={classes.tab} />
          </Tabs>

          {tabValue === 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Box className={classes.section}>
                <InputLabel className={classes.inputlabel}>Edge Name</InputLabel>
                <TextField
                  variant="outlined"
                  value={details?.name || ''}
                  onChange={handleStyle}
                  fullWidth
                  size="small"
                  sx={{
                    '& .MuiInputBase-input': {
                      fontSize: fontSize - 1,
                      padding: '8px 12px'
                    },
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px'
                    }
                  }}
                />
              </Box>

              <Box className={classes.section}>
                <EnhancedFontResizer fontSize={labelFontSize} changeFontSize={changeFontSize} handleFontSizeChange={handleFontSizeChange} />
              </Box>

              <Box className={classes.section}>
                <InputLabel className={classes.inputlabel}>Properties</InputLabel>
                <Autocomplete
                  multiple
                  options={Properties}
                  getOptionLabel={(option) => option.name}
                  value={details?.properties?.map((prop) => Properties.find((p) => p.name === prop) || { name: prop }) || []}
                  onChange={handleChange}
                  isOptionEqualToValue={(option, value) => option?.name === value?.name}
                  size="small"
                  renderOption={(props, option) => (
                    <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1 }}>
                      <Avatar src={option?.image} alt={option?.name} sx={{ width: 28, height: 28, bgcolor: 'action.hover' }} />
                      <Typography variant="body2">{option?.name}</Typography>
                    </Box>
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        key={option?.name}
                        avatar={<Avatar src={option?.image} alt={option?.name} sx={{ width: 20, height: 20 }} />}
                        variant="outlined"
                        label={option?.name}
                        size="small"
                        {...getTagProps({ index })}
                        sx={{
                          '& .MuiChip-label': { fontSize: 11 },
                          mb: 0.5
                        }}
                      />
                    ))
                  }
                  renderInput={(params) => <TextField {...params} variant="outlined" placeholder="Select properties..." size="small" />}
                />
              </Box>
              <Box className={classes.section}>
                <InputLabel className={classes.inputlabel}>Description</InputLabel>
                <TextField
                  multiline
                  minRows={3}
                  value={details?.description || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    dispatch(setDetails({ ...details, description: value }));
                    setEdges((prevEdges) =>
                      prevEdges.map((edge) =>
                        edge.id === selectedBlock?.id ? { ...edge, data: { ...edge.data, description: value } } : edge
                      )
                    );
                  }}
                  placeholder="Enter edge description..."
                  variant="outlined"
                  fullWidth
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                      backgroundColor: color.inputBg,
                      '& fieldset': { borderColor: color.border },
                      '&:hover fieldset': { borderColor: color.primary },
                      '&.Mui-focused fieldset': { borderColor: color.primary }
                    },
                    '& .MuiInputBase-input': {
                      fontSize: '14px',
                      lineHeight: 1.5
                    }
                  }}
                />
              </Box>
            </Box>
          )}

          {tabValue === 1 && (
            <Grid container spacing={1} className={classes.section}>
              <Grid item xs={12}>
                <InputLabel className={classes.inputlabel}>Edge Thickness</InputLabel>
                <TextField
                  type="number"
                  variant="outlined"
                  size="small"
                  value={details?.style?.strokeWidth || 2}
                  onChange={(e) => onChange(e, 'strokeWidth')}
                  inputProps={{ min: 1, max: 10 }}
                  sx={{ width: '100%' }}
                />
              </Grid>

              <Grid item xs={12}>
                <InputLabel className={classes.inputlabel}>Edge Color</InputLabel>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <TextField
                    type="color"
                    variant="outlined"
                    value={details?.style?.stroke || '#000000'}
                    onChange={(e) => onChange(e, 'stroke')}
                    sx={{
                      width: '60px',
                      height: '40px',
                      '& .MuiInputBase-input': {
                        padding: '8px 12px',
                        cursor: 'pointer'
                      }
                    }}
                  />
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {details?.style?.stroke || '#000000'}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <InputLabel className={classes.inputlabel}>Start Point</InputLabel>
                    <TextField
                      type="color"
                      variant="outlined"
                      value={details?.startPoint || '#000000'}
                      onChange={(e) => onChange(e, 'startPoint')}
                      sx={{
                        width: '100%',
                        height: '40px',
                        '& .MuiInputBase-input': {
                          padding: '8px 12px'
                        }
                      }}
                    />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <InputLabel className={classes.inputlabel}>End Point</InputLabel>
                    <TextField
                      type="color"
                      variant="outlined"
                      value={details?.endPoint || '#000000'}
                      onChange={(e) => onChange(e, 'endPoint')}
                      sx={{
                        width: '100%',
                        height: '40px',
                        '& .MuiInputBase-input': {
                          padding: '8px 12px'
                        }
                      }}
                    />
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <InputLabel className={classes.inputlabel}>Line Style</InputLabel>
                <Autocomplete
                  options={EdgeStyleoptions}
                  value={EdgeStyleoptions.find((option) => option.value === details?.style?.strokeDasharray) || null}
                  onChange={(event, newValue) => onChange(newValue, 'strokeDasharray')}
                  getOptionLabel={(option) => option.label}
                  size="small"
                  renderInput={(params) => <TextField {...params} variant="outlined" placeholder="Select line style..." />}
                  sx={{ width: '100%' }}
                />
              </Grid>
            </Grid>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
            <Button
              onClick={handleSaveEdit}
              color="primary"
              variant="contained"
              size="small"
              sx={{
                borderRadius: '6px',
                textTransform: 'none',
                fontWeight: 500,
                minWidth: '100px'
              }}
            >
              Update
            </Button>
          </Box>
        </Paper>
      </ClickAwayListener>
    </Popper>
  );
};

export default React.memo(EditEdge);
