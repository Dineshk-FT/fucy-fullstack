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

const useStyles = makeStyles(() => ({
  inputlabel: {
    fontSize: fontSize,
    fontFamily: 'Inter',
    fontWeight: 600,
    color: '#000'
  },
  bottomPanel: {
    position: 'fixed',
    bottom: 0,
    right: 0,
    borderTop: '1px solid #ccc',
    zIndex: 1300,
    padding: '16px',
    boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.2)',
    maxHeight: '50vh',
    width: '65%',
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
  setIsPopperFocused,
  edges,
  setEdges,
  selectedElement
}) => {
  const color = ColorTheme();
  const classes = useStyles();
  const handleChange = (event, newValue) => {
    setDetails({
      ...details,
      properties: newValue
    });

    const updatedEdges = edges.map((node) => (node.id === selectedElement?.id ? { ...node, properties: newValue } : node));
    setEdges(updatedEdges);
  };
  const handleStyle = (e) => {
    const { value } = e.target;
    setDetails((state) => ({ ...state, name: value }));
    const updatedEdges = edges.map((edge) => (edge.id === selectedElement?.id ? { ...edge, data: { ...edge.data, label: value } } : edge));
    setEdges(updatedEdges);
  };

  const handleChecked = (event) => {
    const { checked } = event.target;
    // Manually update `isAsset` without overriding automatic logic
    setDetails((state) => ({ ...state, isAsset: checked }));
    const updatedEdges = edges.map((edge) => (edge.id === selectedElement?.id ? { ...edge, isAsset: checked } : edge));
    setEdges(updatedEdges);
  };

  const handleDelete = (valueToDelete) => () => {
    const updatedProperties = details.properties.filter((property) => property !== valueToDelete);
    // Update details with the filtered properties
    setDetails((prevDetails) => ({
      ...prevDetails,
      properties: updatedProperties
    }));
    // Update nodes and selectedElement to reflect the changes in `isAsset`
    const updatedEdges = edges.map((node) =>
      node.id === selectedElement?.id ? { ...node, properties: updatedProperties, isAsset: updatedProperties.length > 0 } : node
    );

    setEdges(updatedEdges);
  };

  return (
    <>
      <Popper
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        placement="bottom-start"
        modifiers={[
          {
            name: 'offset',
            options: {
              offset: [0, -10] // Adjusts the offset [skidding, distance]
            }
          },
          {
            name: 'preventOverflow',
            options: {
              boundary: 'viewport' // Ensures Popper stays within the viewport
            }
          }
        ]}
        sx={{
          minWidth: 320,
          width: 'auto',
          boxShadow: '0px 0px 6px black',
          borderRadius: '10px'
        }}
      >
        <ClickAwayListener onClickAway={handleClosePopper}>
          <Paper sx={{ padding: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
              <InputLabel className={classes.inputlabel}>Name :</InputLabel>
              <TextField
                id="outlined-basic"
                variant="outlined"
                value={details?.name}
                onChange={(e) => handleStyle(e, 'name')}
                sx={{
                  width: 'auto',
                  //   background: `${color?.sidebarBG} !important`,
                  color: color?.sidebarContent,
                  '& .MuiInputBase-input': {
                    height: '0.4rem',
                    fontSize: fontSize
                  }
                }}
              />
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
              <InputLabel className={classes.inputlabel}>Properties :</InputLabel>
              <Autocomplete
                multiple
                id="tags-filled"
                options={Properties}
                value={details.properties}
                onChange={handleChange}
                sx={{
                  minWidth: '150px',
                  maxWidth: '350px',
                  '& .MuiOutlinedInput-root': {
                    padding: '3px'
                  }
                }}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      sx={{ '& .MuiChip-label': { fontSize: 11 } }}
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
            <FormControlLabel
              sx={{ fontSize: fontSize, color: '#000' }}
              control={<Checkbox onChange={handleChecked} checked={Boolean(details?.isAsset)} />}
              label="Asset"
            />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button onClick={handleClosePopper}>Cancel</Button>
              <Button onClick={handleSaveEdit} color="primary" variant="contained">
                Update
              </Button>
            </div>
          </Paper>
        </ClickAwayListener>
      </Popper>
    </>
  );
};

export default EditProperties;
