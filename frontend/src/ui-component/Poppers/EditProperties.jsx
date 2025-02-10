/*eslint-disable*/
import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Chip,
  ClickAwayListener,
  FormControlLabel,
  InputLabel,
  Paper,
  Popper,
  TextField
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import React from 'react';
import ColorTheme from '../../store/ColorTheme';
import { fontSize } from '../../store/constant';
import { useSelector } from 'react-redux';

const useStyles = makeStyles(() => ({
  inputlabel: {
    fontSize: fontSize - 2, // Slightly reduced font size for more compact labels
    fontFamily: 'Inter',
    fontWeight: 600
  },
  bottomPanel: {
    position: 'fixed',
    bottom: 0,
    right: 0,
    borderTop: '1px solid #ccc',
    zIndex: 1300,
    padding: '8px',
    boxShadow: '0 -2px 6px rgba(0, 0, 0, 0.2)',
    maxHeight: '45vh',
    width: '45%',
    overflowY: 'auto'
  }
}));

const Properties = ['Confidentiality', 'Integrity', 'Authenticity', 'Authorization', 'Non-repudiation', 'Availability'];

const EditProperties = ({
  anchorEl,
  handleClosePopper,
  details,
  setDetails,
  handleSaveEdit,
  dispatch,
  setIsPopperFocused,
  edges,
  setEdges,
  nodes,
  setNodes,
  selectedElement
}) => {
  const color = ColorTheme();
  const classes = useStyles();
  const { selectedBlock } = useSelector((state) => state?.canvas);

  // Helper function to update nodes or edges
  const updateElement = (updateFn) => {
    // console.log('Selected Element:', selectedBlock); // Debugging

    if (!selectedBlock.target) {
      // Update nodes if target is not present
      const updatedNodes = nodes.map((node) => (node.id === selectedBlock?.id ? updateFn(node) : node));
      setNodes(updatedNodes);
      // console.log('Updated Nodes:', updatedNodes); // Debugging
    } else {
      // Update edges if target is present
      const updatedEdges = edges.map((edge) => (edge.id === selectedBlock?.id ? updateFn(edge) : edge));
      setEdges(updatedEdges);
      // console.log('Updated Edges:', updatedEdges); // Debugging
    }
  };

  // Example handlers
  const handleChange = (event, newValue) => {
    dispatch(
      setDetails({
        ...details,
        properties: newValue
      })
    );
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
      placement="bottom-start"
      modifiers={[
        {
          name: 'offset',
          options: {
            offset: [0, 5] // Reduced offset for a tighter fit
          }
        },
        {
          name: 'preventOverflow',
          options: {
            boundary: 'viewport'
          }
        }
      ]}
      sx={{
        minWidth: 250, // Slightly smaller minimum width for compact design
        width: 'auto',
        boxShadow: '0px 0px 4px black',
        borderRadius: '8px'
      }}
    >
      <ClickAwayListener onClickAway={handleClosePopper}>
        <Paper sx={{ padding: 1, display: 'flex', flexDirection: 'column', gap: 1, alignContent: 'center' }}>
          {/* Name and Asset checkbox in same line */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, flex: 1 }}>
              <InputLabel className={classes.inputlabel}>Name :</InputLabel>
              <TextField
                id="outlined-basic"
                variant="outlined"
                value={details?.name}
                onChange={(e) => handleStyle(e, 'name')}
                sx={{
                  background: `${color?.sidebarBG} !important`,
                  color: color?.sidebarContent,
                  '& .MuiInputBase-input': {
                    fontSize: fontSize - 2, // Slightly reduced font size for input
                    borderRadius: 0,
                    padding: '6px 8px' // Standard padding for input fields
                  },
                  width: '150px' // Reduced width for the input field
                }}
              />
            </Box>

            <FormControlLabel
              sx={{ fontSize: fontSize - 2, color: color?.sidebarContent, position: 'relative', top: '10px' }} // Reduced font size for the label
              control={<Checkbox onChange={handleChecked} checked={Boolean(details?.isAsset)} />}
              label="Asset"
            />
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <InputLabel className={classes.inputlabel}>Properties :</InputLabel>
            <Autocomplete
              multiple
              id="tags-filled"
              options={Properties}
              value={details?.properties}
              onChange={handleChange}
              sx={{
                minWidth: '130px', // Reduced minimum width
                maxWidth: '240px', // Reduced max-width for more compact autocomplete input
                '& .MuiOutlinedInput-root': {
                  padding: '4px' // Reduced padding for the input field
                }
              }}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    sx={{ '& .MuiChip-label': { fontSize: 10 } }} // Slightly smaller font size for chips
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

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button variant="outlined" color="error" onClick={handleClosePopper} sx={{ fontSize: fontSize - 2, padding: '4px 8px' }}>
              Close
            </Button>
            {/* Adjusted padding for compact buttons */}
            <Button onClick={handleSaveEdit} color="primary" variant="contained" sx={{ fontSize: fontSize - 2, padding: '4px 8px' }}>
              Update
            </Button>
            {/* Adjusted padding for compact buttons */}
          </div>
        </Paper>
      </ClickAwayListener>
    </Popper>
  );
};

export default EditProperties;
