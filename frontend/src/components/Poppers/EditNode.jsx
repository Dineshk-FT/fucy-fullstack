import React, { useCallback, useState } from 'react';
import {
  Autocomplete,
  Avatar,
  Box,
  Button,
  // Checkbox,
  Chip,
  ClickAwayListener,
  InputLabel,
  Paper,
  Popper,
  Tab,
  Tabs,
  TextField,
} from '@mui/material';
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
  AvailabilityIcon,
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
  { name: 'Availability', image: AvailabilityIcon },
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
  selectedElement,
}) {
  const color = ColorTheme();
  const classes = useStyles();
  const { selectedBlock } = useSelector((state) => state?.canvas);
  const [tabIndex, setTabIndex] = useState(0);

  const updateElement = useCallback(
    (updateFn) => {
      const updatedNodes = nodes.map((node) =>
        node.id === selectedBlock?.id ? updateFn(node) : node,
      );
      setNodes(updatedNodes);
    },
    [nodes, selectedBlock, setNodes],
  );

  const handleTabChange = useCallback((event, newValue) => {
    setTabIndex(newValue);
  }, []);

  const handleNameChange = useCallback(
    (e) => {
      const value = e.target.value;
      dispatch(setDetails({ ...details, name: value }));
      updateElement((element) => ({
        ...element,
        data: { ...element.data, label: value },
      }));
    },
    [dispatch, details, updateElement],
  );

  const handlePropertiesChange = useCallback(
    (event, newValue) => {
      const updatedProperties = newValue.map((prop) => prop.name);
      dispatch(setDetails({ ...details, properties: updatedProperties }));
      updateElement((element) => ({ ...element, properties: updatedProperties }));
    },
    [dispatch, details, updateElement],
  );

  // const handleIsAssetChange = useCallback(
  //   (e) => {
  //     const isChecked = e.target.checked;
  //     dispatch(setDetails({ ...details, isAsset: isChecked }));
  //     updateElement((element) => ({ ...element, isAsset: isChecked }));
  //   },
  //   [dispatch, details, updateElement],
  // );

  const handleSave = useCallback(() => {
    if (!details?.name?.trim()) {
      toast.error('Node name is required');
      return;
    }
    handleSaveEdit();
    toast.success('Node updated successfully');
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
            <Tabs
              value={tabIndex}
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{
                '& .MuiTab-root': { fontSize: '14px', textTransform: 'none' },
                '& .MuiTabs-indicator': { bgcolor: color?.primary },
              }}
              aria-label="Node edit tabs"
            >
              <Tab label="General" />
              <Tab label="Style" />
            </Tabs>

            {tabIndex === 0 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                <InputLabel className={classes.inputlabel}>Name :</InputLabel>
                  <TextField
                    variant="outlined"
                    size="small"
                    value={details?.name || ''}
                    onChange={handleNameChange}
                    placeholder="Enter node name"
                    fullWidth
                    aria-label="Node name"
                    sx={{
                      bgcolor: color?.inputBg,
                      '& .MuiInputBase-input': { fontSize: '14px', p: '6px 8px' },
                      '& .MuiOutlinedInput-notchedOutline': { borderRadius: '4px' },
                    }}
                  />
                </Box>

                {/* <FormControlLabel
                  sx={{
                    '& .MuiTypography-root': {
                      fontSize: '14px',
                      color: color?.sidebarContent,
                    },
                  }}
                  control={
                    <Checkbox
                      size="small"
                      checked={Boolean(details?.isAsset)}
                      onChange={handleIsAssetChange}
                      aria-label="Mark as asset"
                    />
                  }
                  label="Asset"
                /> */}

                {selectedBlock?.type === 'group' && (
                  <Box>
                    <InputLabel className={classes.inputlabel}>Properties :</InputLabel>
                    <Autocomplete
                      multiple
                      options={Properties}
                      getOptionLabel={(option) => option.name}
                      value={
                        details?.properties?.map(
                          (prop) => Properties.find((p) => p.name === prop) || { name: prop },
                        ) || []
                      }
                      onChange={handlePropertiesChange}
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
                          <Avatar
                            src={option?.image}
                            alt={option?.name}
                            sx={{ width: 20, height: 20 }}
                          />
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
                          aria-label="Node properties"
                        />
                      )}
                    />
                  </Box>
                )}
              </Box>
            )}

            {tabIndex === 1 && (
              <Header
                selectedElement={selectedElement}
                nodes={nodes}
                setNodes={setNodes}
                setSelectedElement={setSelectedElement}
              />
            )}

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button
                variant="outlined"
                color="error"
                onClick={handleClosePopper}
                sx={{ textTransform: 'none', fontSize: '14px', px: 2, py: 0.5 }}
              >
                Close
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSave}
                disabled={!details?.name?.trim()}
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