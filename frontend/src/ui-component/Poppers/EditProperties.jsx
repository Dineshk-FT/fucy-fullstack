/*eslint-disable*/
import React from 'react';
import { Autocomplete, Chip, InputLabel, TextField, Box, Popper, Paper, ClickAwayListener, Button, Avatar } from '@mui/material';
import { fontSize } from '../../store/constant';
import { useSelector } from 'react-redux';
import {
  ConfidentialityIcon,
  IntegrityIcon,
  AuthenticityIcon,
  AuthorizationIcon,
  Non_repudiationIcon,
  AvailabilityIcon
} from '../../assets/icons';

const Properties = [
  { name: 'Confidentiality', image: ConfidentialityIcon },
  { name: 'Integrity', image: IntegrityIcon },
  { name: 'Authenticity', image: AuthenticityIcon },
  { name: 'Authorization', image: AuthorizationIcon },
  { name: 'Non-repudiation', image: Non_repudiationIcon },
  { name: 'Availability', image: AvailabilityIcon }
];

const EditProperties = ({
  anchorEl,
  handleClosePopper,
  details,
  setDetails,
  dispatch,
  handleSaveEdit,
  setNodes,
  nodes,
  edges,
  setEdges
}) => {
  const { selectedBlock } = useSelector((state) => state?.canvas);
  // console.log('opened');
  const updateElement = (updateFn) => {
    if (!selectedBlock?.id.includes('reactflow__edge')) {
      const updatedNodes = nodes?.map((node) => (node?.id === selectedBlock?.id ? updateFn(node) : node));
      setNodes(updatedNodes);
    } else {
      const updatedEdges = edges?.map((edge) => (edge?.id === selectedBlock?.id ? updateFn(edge) : edge));
      setEdges(updatedEdges);
    }
  };

  // console.log('edges', edges);

  const handleChange = (event, newValue) => {
    const updatedProperties = newValue.map((prop) => prop.name);
    // console.log('updatedProperties', updatedProperties);
    dispatch(setDetails({ ...details, properties: updatedProperties }));
    updateElement((element) => ({ ...element, properties: updatedProperties }));
  };

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

export default EditProperties;
