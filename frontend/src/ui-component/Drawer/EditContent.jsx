/*eslint-disable*/
import React, { useEffect, useState } from 'react';
import { Chip, InputLabel, Box, TextField, Autocomplete, Button, Checkbox, FormControlLabel, Typography } from '@mui/material';
import TabContext from '@mui/lab/TabContext';
import TabPanel from '@mui/lab/TabPanel';
import toast, { Toaster } from 'react-hot-toast';
import CancelTwoToneIcon from '@mui/icons-material/CancelTwoTone';
import { ClosePropertiesTab } from '../../store/slices/CanvasSlice';
import { useDispatch } from 'react-redux';
import { fontSize } from '../../store/constant';
import { makeStyles } from '@mui/styles';
import ColorTheme from '../../store/ColorTheme';

const Properties = ['Confidentiality', 'Integrity', 'Authenticity', 'Authorization', 'Non-repudiation', 'Availability'];
const notify = (message, status) => toast[status](message);

const useStyles = makeStyles(() => ({
  inputlabel: {
    fontSize: fontSize,
    fontFamily: 'Inter',
    fontWeight: 600
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

const EditContent = ({
  selectedElement,
  nodes,
  setNodes,
  edges,
  setEdges,
  setSelectedElement,
  details,
  setDetails,
  model,
  RefreshAPI,
  assets,
  update
}) => {
  const color = ColorTheme();
  const classes = useStyles();
  const [value, setValue] = useState('1');
  const dispatch = useDispatch();

  const handleUpdate = () => {
    const template = {
      nodes: nodes,
      edges: edges
    };
    const details = {
      assetId: assets?._id,
      'model-id': model?._id,
      template: JSON.stringify(template)
    };
    update(details)
      .then(() => {
        notify('Updated Successfully', 'success');
        RefreshAPI();
      })
      .catch(() => {
        notify('Something went wrong', 'error');
      });
  };

  const handleDelete = (valueToDelete) => () => {
    const updatedProperties = details.properties.filter((property) => property !== valueToDelete);

    // Update details with the filtered properties
    setDetails((prevDetails) => ({
      ...prevDetails,
      properties: updatedProperties
    }));

    // Update nodes and selectedElement to reflect the changes in `isAsset`
    const updatedNodes = nodes.map((node) =>
      node.id === selectedElement?.id ? { ...node, properties: updatedProperties, isAsset: updatedProperties.length > 0 } : node
    );
    const updatedSelected = updatedNodes.find((nd) => nd.id === selectedElement?.id);

    setNodes(updatedNodes);
    setSelectedElement(updatedSelected);
  };

  const handleChangeTab = (event, newValue) => {
    setValue(newValue);
  };

  // console.log('nodes', nodes);

  useEffect(() => {
    // Automatically update `isAsset` based on `details.properties`
    const updatedNodes = nodes.map((node) =>
      node.id === selectedElement?.id ? { ...node, isAsset: details?.properties?.length > 0 } : node
    );
    const updatedSelected = updatedNodes.find((nd) => nd.id === selectedElement?.id);

    setNodes(updatedNodes);
    setSelectedElement(updatedSelected);
  }, [details.properties]);

  const handleChecked = (event) => {
    const { checked } = event.target;

    // Manually update `isAsset` without overriding automatic logic
    const updatedNodes = nodes.map((node) => (node.id === selectedElement?.id ? { ...node, isAsset: checked } : node));
    const updatedSelected = updatedNodes.find((nd) => nd.id === selectedElement?.id);

    setNodes(updatedNodes);
    setSelectedElement(updatedSelected);
  };
  useEffect(() => {
    setDetails({
      ...details,
      name: selectedElement?.data?.label ?? '',
      properties: selectedElement?.properties ?? []
      // bgColor: selectedElement?.data?.style?.backgroundColor ? selectedElement?.data?.style?.backgroundColor : '#000000'
    });
  }, [selectedElement]);

  // console.log('details', details);
  // console.log('details', details);

  const handleChange = (event, newValue) => {
    setDetails({
      ...details,
      properties: newValue
    });

    const updatedNodes = nodes.map((node) => (node.id === selectedElement?.id ? { ...node, properties: newValue } : node));
    setNodes(updatedNodes);
  };

  const handleStyle = (e, name) => {
    const { value } = e.target;
    const nodeState = JSON.parse(JSON.stringify(nodes));
    const edgeState = [...edges];
    if (selectedElement.target) {
      const edge = edgeState?.find((nd) => nd?.id === selectedElement?.id);
      const Index = edgeState?.findIndex((nd) => nd?.id === selectedElement?.id);
      if (name === 'name') {
        setDetails({ ...details, name: value });
        edge.data.label = value;
      }
      setSelectedElement(edge);
      edgeState[Index] = edge;
      setEdges(edgeState);
    } else {
      const node = nodeState?.find((nd) => nd?.id === selectedElement?.id);
      const Index = nodeState?.findIndex((nd) => nd?.id === selectedElement?.id);
      setDetails({ ...details, name: value });
      node.data.label = value;

      setSelectedElement(node);
      nodeState[Index] = node;
      setNodes(nodeState);
    }
  };
  // console.log('nodes', nodes);

  // console.log('details', details);
  return (
    <Box className={classes.bottomPanel} sx={{ background: `${color?.sidebarBG} !important`, color: color?.sidebarContent }}>
      <Typography variant="h4" color="primary">
        Change the Properties
      </Typography>
      <Box sx={{ cursor: 'pointer', float: 'right' }} onClick={() => dispatch(ClosePropertiesTab())}>
        <CancelTwoToneIcon />
      </Box>
      <TabContext value={value}>
        {/* <Box sx={{ borderBottom: 1, borderColor: 'divider', width: '270px' }}>
          <TabList onChange={handleChangeTab} aria-label="lab API tabs example">
            <Tab label="Text" value="1" sx={{ minWidth: '90px' }} />
            <Tab label="Diagram" value="2" sx={{ minWidth: '90px' }} />
            <Tab label="Style" value="3" sx={{ minWidth: '90px' }} />
          </TabList>
        </Box> */}
        <TabPanel value="1" sx={{ p: 0 }}>
          <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', gap: 1, mt: 1 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
              <InputLabel className={classes.inputlabel}>Name :</InputLabel>
              <TextField
                id="outlined-basic"
                variant="outlined"
                value={details?.name}
                onChange={(e) => handleStyle(e, 'name')}
                sx={{
                  width: 'auto',
                  background: `${color?.sidebarBG} !important`,
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
            {!selectedElement?.target && (
              <FormControlLabel
                sx={{ fontSize: fontSize, color: color?.sidebarContent }}
                control={<Checkbox onChange={handleChecked} checked={Boolean(selectedElement?.isAsset)} />}
                label="Asset"
              />
            )}
            <Button variant="outlined" onClick={handleUpdate} sx={{ height: '50%', marginRight: 1 }}>
              Update
            </Button>
          </Box>
        </TabPanel>
      </TabContext>
      <Toaster position="top-right" reverseOrder={false} />
    </Box>
  );
};

export default EditContent;
