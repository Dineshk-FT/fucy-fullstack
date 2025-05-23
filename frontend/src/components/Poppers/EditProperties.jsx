/* eslint-disable */
import React, { useCallback, useMemo } from 'react';
import { Autocomplete, Avatar, Box, Button, Chip, ClickAwayListener, InputLabel, Paper, Popper, TextField } from '@mui/material';
import { useSelector, batch } from 'react-redux';
import toast from 'react-hot-toast';
import ColorTheme from '../../themes/ColorTheme';
import { fontSize } from '../../themes/constant';
import {
  ConfidentialityIcon,
  IntegrityIcon,
  AuthenticityIcon,
  AuthorizationIcon,
  Non_repudiationIcon,
  AvailabilityIcon
} from '../../assets/icons';

const PROPERTY_OPTIONS = [
  { name: 'Confidentiality', image: ConfidentialityIcon },
  { name: 'Integrity', image: IntegrityIcon },
  { name: 'Authenticity', image: AuthenticityIcon },
  { name: 'Authorization', image: AuthorizationIcon },
  { name: 'Non-repudiation', image: Non_repudiationIcon },
  { name: 'Availability', image: AvailabilityIcon }
];

const EditProperties = ({ anchorEl, handleClosePopper, details, setDetails, dispatch, handleSaveEdit, setNodes, setEdges }) => {
  const color = ColorTheme();
  const { selectedBlock } = useSelector((state) => state.canvas);

  const updateElement = useCallback(
    (updateFn) => {
      const updater = selectedBlock?.id.includes('reactflow__edge') ? setEdges : setNodes;
      updater((prev) => prev.map((item) => (item?.id === selectedBlock?.id ? updateFn(item) : item)));
    },
    [selectedBlock?.id, setNodes, setEdges]
  );

  const selectedValues = useMemo(
    () => details?.properties?.map((prop) => PROPERTY_OPTIONS.find((p) => p.name === prop) || { name: prop }) || [],
    [details?.properties]
  );

  const handleChange = useCallback(
    (event, newValue) => {
      event.stopPropagation();
      const updatedProps = newValue.map((prop) => prop.name);
      batch(() => {
        dispatch(setDetails({ ...details, properties: updatedProps }));
        updateElement((el) => ({ ...el, properties: updatedProps }));
      });
    },
    [details, dispatch, updateElement, setNodes]
  );

  const handleSave = useCallback(
    (e) => {
      if (!details?.properties?.length) {
        toast.error('At least one property is required');
        return;
      }
      handleSaveEdit(e);
    },
    [details?.properties, handleSaveEdit]
  );

  const renderOption = (props, option) => (
    <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', gap: 1, p: '4px' }}>
      <Avatar src={option?.image} alt={option?.name} sx={{ width: 20, height: 20 }} />
      {option?.name}
    </Box>
  );

  const renderTags = (value, getTagProps) =>
    value.map((option, index) => (
      <Chip
        key={option?.name}
        avatar={<Avatar src={option?.image} alt={option?.name} sx={{ width: 16, height: 16 }} />}
        variant="outlined"
        label={option?.name}
        {...getTagProps({ index })}
        sx={{
          fontSize: '12px',
          height: '24px',
          bgcolor: color.inputBg,
          borderColor: color.border
        }}
      />
    ));

  return (
    <Popper
      open={Boolean(anchorEl)}
      anchorEl={anchorEl}
      placement="bottom-start"
      sx={{
        width: '300px',
        maxWidth: '90vw',
        zIndex: 1300,
        borderRadius: 2,
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
      }}
    >
      <ClickAwayListener onClickAway={handleClosePopper}>
        <Paper
          sx={{
            p: 2,
            bgcolor: color.modalBg,
            display: 'flex',
            flexDirection: 'column',
            gap: 2
          }}
        >
          <Box display="flex" flexDirection="column" gap={1}>
            <InputLabel sx={{ fontSize: fontSize - 2, fontWeight: 600 }}>Properties :</InputLabel>
            <Autocomplete
              multiple
              options={PROPERTY_OPTIONS}
              getOptionLabel={(option) => option.name}
              value={selectedValues}
              onChange={handleChange}
              isOptionEqualToValue={(option, value) => option.name === value.name}
              renderOption={renderOption}
              renderTags={renderTags}
              sx={{
                bgcolor: color.inputBg,
                '& .MuiOutlinedInput-root': { p: '2px', borderRadius: '4px' },
                '& .MuiInputBase-input': { fontSize: '14px' }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  onClick={(e) => e.stopPropagation()}
                  variant="outlined"
                  size="small"
                  placeholder="Select properties"
                  aria-label="Element properties"
                />
              )}
            />
          </Box>

          <Box display="flex" justifyContent="flex-end" gap={1}>
            <Button
              variant="outlined"
              color="error"
              onClick={handleClosePopper}
              sx={{ textTransform: 'none', fontSize: 14, px: 2, py: 0.5 }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSave}
              disabled={!details?.properties?.length}
              sx={{ textTransform: 'none', fontSize: 14, px: 2, py: 0.5 }}
            >
              Update
            </Button>
          </Box>
        </Paper>
      </ClickAwayListener>
    </Popper>
  );
};

export default React.memo(EditProperties);
