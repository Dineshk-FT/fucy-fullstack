/*eslint-disable*/
import React, { useCallback, useMemo } from 'react';
import {
  Autocomplete,
  Avatar,
  Box,
  Button,
  Chip,
  ClickAwayListener,
  InputLabel,
  Paper,
  Popper,
  TextField,
} from '@mui/material';
import { fontSize } from '../../themes/constant';
import { useSelector, batch } from 'react-redux';
import toast, { Toaster } from 'react-hot-toast';
import ColorTheme from '../../themes/ColorTheme';
import {
  ConfidentialityIcon,
  IntegrityIcon,
  AuthenticityIcon,
  AuthorizationIcon,
  Non_repudiationIcon,
  AvailabilityIcon,
} from '../../assets/icons';

const Properties = [
  { name: 'Confidentiality', image: ConfidentialityIcon },
  { name: 'Integrity', image: IntegrityIcon },
  { name: 'Authenticity', image: AuthenticityIcon },
  { name: 'Authorization', image: AuthorizationIcon },
  { name: 'Non-repudiation', image: Non_repudiationIcon },
  { name: 'Availability', image: AvailabilityIcon },
];

export default React.memo(function EditProperties({
  anchorEl,
  handleClosePopper,
  details,
  setDetails,
  dispatch,
  handleSaveEdit,
  setNodes,
  nodes,
  edges,
  setEdges,
}) {
  const color = ColorTheme();
  const { selectedBlock } = useSelector((state) => state?.canvas);

  const updateElement = useCallback(
    (updateFn) => {
      if (!selectedBlock?.id.includes('reactflow__edge')) {
        setNodes((prevNodes) =>
          prevNodes.map((node) => (node?.id === selectedBlock?.id ? updateFn(node) : node)),
        );
      } else {
        setEdges((prevEdges) =>
          prevEdges.map((edge) => (edge?.id === selectedBlock?.id ? updateFn(edge) : edge)),
        );
      }
    },
    [selectedBlock?.id, setNodes, setEdges],
  );

  const handleChange = useCallback(
    (event, newValue) => {
      const updatedProperties = newValue.map((prop) => prop.name);
      batch(() => {
        dispatch(setDetails({ ...details, properties: updatedProperties }));
        updateElement((element) => ({ ...element, properties: updatedProperties }));
      });
    },
    [details, dispatch, updateElement],
  );

  const handleSave = useCallback(() => {
    if (!details?.properties?.length) {
      toast.error('At least one property is required');
      return;
    }
    handleSaveEdit();
    toast.success('Properties updated successfully');
  }, [details, handleSaveEdit]);

  return (
    <>
      <Popper
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        placement="bottom-start"
        sx={{
          width: '300px',
          maxWidth: '90vw',
          zIndex: 1300,
          borderRadius: '8px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        }}
      >
        <ClickAwayListener onClickAway={handleClosePopper}>
          <Paper
            sx={{
              p: 2,
              bgcolor: color?.modalBg,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <InputLabel sx={{ fontSize: fontSize - 2, fontWeight: 600 }}>Properties :</InputLabel>
              <Autocomplete
                multiple
                options={Properties}
                getOptionLabel={(option) => option.name}
                value={
                  details?.properties?.map(
                    (prop) => Properties.find((p) => p.name === prop) || { name: prop },
                  ) || []
                }
                onChange={handleChange}
                isOptionEqualToValue={(option, value) => option?.name === value?.name}
                sx={{
                  bgcolor: color?.inputBg,
                  '& .MuiOutlinedInput-root': { p: '2px', borderRadius: '4px' },
                  '& .MuiInputBase-input': { fontSize: '14px' },
                }}
                renderOption={(props, option) => (
                  <Box
                    component="li"
                    {...props}
                    sx={{ display: 'flex', alignItems: 'center', gap: 1, p: '4px' }}
                  >
                    <Avatar src={option?.image} alt={option?.name} sx={{ width: 20, height: 20 }} />
                    {option?.name}
                  </Box>
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      key={option?.name}
                      avatar={
                        <Avatar
                          src={option?.image}
                          alt={option?.name}
                          sx={{ width: 16, height: 16 }}
                        />
                      }
                      variant="outlined"
                      label={option?.name}
                      {...getTagProps({ index })}
                      sx={{
                        fontSize: '12px',
                        height: '24px',
                        bgcolor: color?.inputBg,
                        borderColor: color?.border,
                      }}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    size="small"
                    placeholder="Select properties"
                    aria-label="Element properties"
                  />
                )}
              />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button
                variant="outlined"
                color="error"
                onClick={handleClosePopper}
                sx={{ textTransform: 'none', fontSize: '14px', px: 2, py: 0.5 }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSave}
                disabled={!details?.properties?.length}
                sx={{ textTransform: 'none', fontSize: '14px', px: 2, py: 0.5 }}
              >
                Update
              </Button>
            </Box>
          </Paper>
        </ClickAwayListener>
      </Popper>
      <Toaster position="top-right" reverseOrder={false} />
    </>
  );
});