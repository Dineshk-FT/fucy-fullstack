/* eslint-disable */
import React, { useCallback } from 'react';
import {
  Autocomplete,
  Avatar,
  Box,
  Button,
  Chip,
  ClickAwayListener,
  IconButton,
  InputLabel,
  Paper,
  Popper,
  TextField
} from '@mui/material';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import { makeStyles } from '@mui/styles';
import { useSelector } from 'react-redux';
import toast, { Toaster } from 'react-hot-toast';
import ColorTheme from '../../themes/ColorTheme';
import { fontSize } from '../../themes/constant';
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

export default React.memo(function EditNode({
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
}) {
  const color = ColorTheme();
  const classes = useStyles();
  const { selectedBlock } = useSelector((state) => state?.canvas);

  const updateElement = useCallback(
    (updateFn) => {
      const updatedNodes = nodes.map((node) => (node.id === selectedBlock?.id ? updateFn(node) : node));
      setNodes(updatedNodes);
    },
    [nodes, selectedBlock, setNodes]
  );

  const handleNameChange = useCallback(
    (e) => {
      e.stopPropagation();
      const value = e.target.value;
      dispatch(setDetails({ ...details, name: value }));
      updateElement((element) => ({
        ...element,
        data: { ...element.data, label: value }
      }));
    },
    [dispatch, details, updateElement]
  );

  const handlePropertiesChange = useCallback(
    (event, newValue) => {
      const updatedProperties = newValue.map((prop) => prop.name);
      dispatch(setDetails({ ...details, properties: updatedProperties }));
      updateElement((element) => ({
        ...element,
        properties: updatedProperties
      }));
    },
    [dispatch, details, updateElement]
  );

  const handleSave = useCallback(
    (e) => {
      if (!details?.name?.trim()) {
        toast.error('Node name is required');
        return;
      }
      handleSaveEdit(e);
    },
    [details, handleSaveEdit]
  );

  return (
    <>
      <Popper
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        placement="bottom-start"
        sx={{
          width: 'auto',
          maxWidth: '25.65rem',
          maxHeight: '30rem',
          overflow: 'visible',
          zIndex: 1300,
          borderRadius: '6px',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)'
        }}
      >
        {/* <ClickAwayListener onClickAway={handleClosePopper}> */}
        <Paper
          sx={{
            position: 'relative',
            p: 1.2,
            bgcolor: color?.modalBg,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            // maxHeight: '25rem',
            width: 'auto',
            maxWidth: '45vw',
            overflow: 'visible'
          }}
        >
          {/* Close icon */}
          <IconButton
            onClick={handleClosePopper}
            size="small"
            sx={{
              position: 'absolute',
              top: 0,
              right: 0,
              zIndex: 10,
              color: color?.sidebarContent,
              p: 0.3,
              '&:hover': { bgcolor: color?.hoverBg }
            }}
          >
            <HighlightOffIcon color="error" fontSize="small" />
          </IconButton>

          {/* Name input */}
          <Box>
            <InputLabel className={classes.inputlabel}>Name:</InputLabel>
            <TextField
              variant="outlined"
              size="small"
              value={details?.name || ''}
              onChange={handleNameChange}
              placeholder="Enter node name"
              fullWidth
              sx={{
                bgcolor: color?.inputBg,
                '& .MuiInputBase-input': { fontSize: '13px', p: '4px 6px' },
                '& .MuiOutlinedInput-notchedOutline': { borderRadius: '4px' }
              }}
            />
          </Box>

          {/* Properties */}
          {selectedBlock?.type === 'group' && (
            <Box>
              <InputLabel className={classes.inputlabel}>Properties:</InputLabel>
              <Autocomplete
                multiple
                options={Properties}
                getOptionLabel={(option) => option.name}
                value={details?.properties?.map((prop) => Properties.find((p) => p.name === prop) || { name: prop }) || []}
                onChange={handlePropertiesChange}
                isOptionEqualToValue={(option, value) => option?.name === value?.name}
                sx={{
                  bgcolor: color?.inputBg,
                  '& .MuiOutlinedInput-root': { p: '2px', borderRadius: '4px' },
                  '& .MuiInputBase-input': { fontSize: '13px' }
                }}
                renderOption={(props, option) => (
                  <Box
                    component="li"
                    {...props}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.8,
                      p: '2px 4px'
                    }}
                  >
                    <Avatar src={option?.image} alt={option?.name} sx={{ width: 18, height: 18 }} />
                    {option?.name}
                  </Box>
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      key={option?.name}
                      avatar={<Avatar src={option?.image} alt={option?.name} sx={{ width: 14, height: 14 }} />}
                      variant="outlined"
                      label={option?.name}
                      {...getTagProps({ index })}
                      sx={{
                        fontSize: '11px',
                        height: '22px',
                        bgcolor: color?.inputBg,
                        borderColor: color?.border
                      }}
                    />
                  ))
                }
                renderInput={(params) => <TextField {...params} variant="outlined" size="small" placeholder="Select" />}
              />
            </Box>
          )}

          {/* Style Section (Header Component) */}
          <Header selectedElement={selectedElement} setNodes={setNodes} setSelectedElement={setSelectedElement} />

          {/* Update Button */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 0.5 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSave}
              disabled={!details?.name?.trim()}
              sx={{ textTransform: 'none', fontSize: '13px', px: 1.5, py: 0.3 }}
            >
              Update
            </Button>
          </Box>
        </Paper>
        {/* </ClickAwayListener> */}
      </Popper>

      <Toaster position="top-right" reverseOrder={false} />
    </>
  );
});
