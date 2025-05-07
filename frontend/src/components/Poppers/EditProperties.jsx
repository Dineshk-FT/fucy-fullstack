/*eslint-disable*/
import React, { useCallback, useMemo } from 'react';
import { Autocomplete, Chip, InputLabel, TextField, Box, Popper, Paper, ClickAwayListener, Button, Avatar } from '@mui/material';
import { fontSize } from '../../themes/constant';
import { useSelector, batch } from 'react-redux';
import {
  ConfidentialityIcon,
  IntegrityIcon,
  AuthenticityIcon,
  AuthorizationIcon,
  Non_repudiationIcon,
  AvailabilityIcon
} from '../../assets/icons';

const EditProperties = ({ anchorEl, handleClosePopper, details, setDetails, dispatch, handleSaveEdit, setNodes, setEdges }) => {
  const { selectedBlock } = useSelector((state) => state?.canvas);
  const Properties = useMemo(
    () => [
      { name: 'Confidentiality', image: ConfidentialityIcon },
      { name: 'Integrity', image: IntegrityIcon },
      { name: 'Authenticity', image: AuthenticityIcon },
      { name: 'Authorization', image: AuthorizationIcon },
      { name: 'Non-repudiation', image: Non_repudiationIcon },
      { name: 'Availability', image: AvailabilityIcon }
    ],
    []
  );
  const updateElement = useCallback(
    (updateFn) => {
      if (!selectedBlock?.id.includes('reactflow__edge')) {
        setNodes((prevNodes) => prevNodes.map((node) => (node?.id === selectedBlock?.id ? updateFn(node) : node)));
      } else {
        setEdges((prevEdges) => prevEdges.map((edge) => (edge?.id === selectedBlock?.id ? updateFn(edge) : edge)));
      }
    },
    [selectedBlock?.id]
  );

  // console.log('edges', edges);

  const handleChange = useCallback(
    (event, newValue) => {
      const updatedProperties = newValue.map((prop) => prop.name);

      // Only update if properties actually changed
      if (JSON.stringify(details.properties) !== JSON.stringify(updatedProperties)) {
        batch(() => {
          dispatch(setDetails({ ...details, properties: updatedProperties }));
          updateElement((element) => ({ ...element, properties: updatedProperties }));
        });
      }
    },
    [details, dispatch, updateElement]
  );
  // Memoize the Autocomplete component's value
  const autocompleteValue = useMemo(() => {
    return details?.properties?.map((prop) => Properties.find((p) => p.name === prop) || { name: prop }) || [];
  }, [details?.properties]);

  return (
    <Popper
      open={Boolean(anchorEl)}
      anchorEl={anchorEl}
      placement="bottom-start"
      sx={{ width: 250, boxShadow: '0px 0px 4px black', borderRadius: '8px', zIndex: 1200 }}
    >
      <ClickAwayListener onClickAway={handleClosePopper}>
        <Paper sx={{ padding: 1, display: 'flex', flexDirection: 'column', gap: 1, alignContent: 'center' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <InputLabel sx={{ fontSize: fontSize - 2, fontWeight: 600 }}>Properties :</InputLabel>
            <Autocomplete
              multiple
              options={Properties}
              getOptionLabel={(option) => option.name}
              value={autocompleteValue}
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

          <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: 1 }}>
            <Button variant="outlined" color="error" onClick={handleClosePopper} sx={{ fontSize: fontSize - 2, padding: '4px 8px' }}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} color="primary" variant="contained" sx={{ fontSize: fontSize - 2, padding: '4px 8px' }}>
              Update
            </Button>
          </Box>
        </Paper>
      </ClickAwayListener>
    </Popper>
  );
};

export default React.memo(EditProperties);
