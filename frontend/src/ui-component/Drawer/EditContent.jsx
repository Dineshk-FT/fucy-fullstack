/*eslint-disable*/
import React, { useEffect, useState } from 'react';
import { Chip, InputLabel, Box, TextField, Autocomplete, Button, Checkbox, FormControlLabel } from '@mui/material';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import toast, { Toaster } from 'react-hot-toast';
import CancelTwoToneIcon from '@mui/icons-material/CancelTwoTone';
import { ClosePropertiesTab } from '../../store/slices/CanvasSlice';
import { useDispatch } from 'react-redux';
import { fontSize } from '../../store/constant';
import { makeStyles } from '@mui/styles';

const Properties = ['Confidentiality', 'Integrity', 'Authenticity', 'Authorization', 'Non-repudiation', 'Availability'];
const notify = (message, status) => toast[status](message);

const useStyles = makeStyles(() => ({
  inputlabel: {
    fontSize: fontSize,
    fontFamily: 'Inter',
    fontWeight: 600,
    color: '#000'
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
  updateModel,
  RefreshAPI
}) => {
  const classes = useStyles();
  const [value, setValue] = useState('1');
  const dispatch = useDispatch();
  // console.log('details', details);

  // console.log('selectedElement', selectedElement);
  const handleUpdate = () => {
    const mod = JSON.parse(JSON.stringify(model));
    const Nodestate = JSON.parse(JSON.stringify(nodes));
    const edgeState = JSON.parse(JSON.stringify(edges));

    if (selectedElement.target) {
      const index = edges?.findIndex((nd) => nd?.id === selectedElement?.id);
      if (index !== -1) {
        // Create a shallow copy of the selected edge object
        const selected = { ...edges[index], data: { ...edges[index].data } };
        selected.data.label = details?.name;
        selected.properties = details?.properties;

        // Update edgeState with the new selected edge
        edgeState[index] = selected;
        mod.template.edges = edgeState;
      }
    } else {
      const index = nodes?.findIndex((nd) => nd?.id === selectedElement?.id);
      if (index !== -1) {
        // Create a shallow copy of the selected node object
        const selected = { ...nodes[index], data: { ...nodes[index].data } };
        selected.data.label = details?.name;
        selected.properties = details?.properties;
        selected.isAsset = details?.isAsset;

        // Update Nodestate with the new selected node
        Nodestate[index] = selected;
        mod.template.nodes = Nodestate;
      }
    }

    updateModel(mod)
      .then((res) => {
        notify('Updated Successfully', 'success');
        RefreshAPI();
      })
      .catch((err) => {
        console.log('err', err);
        notify('Something went wrong', 'error');
      });
  };

  const handleDelete = (valueToDelete) => () => {
    setDetails((prevDetails) => ({
      ...prevDetails,
      properties: prevDetails.properties.filter((property) => property !== valueToDelete)
    }));
  };

  const handleChangeTab = (event, newValue) => {
    setValue(newValue);
  };

  const handleChecked = (event) => {
    const { checked } = event.target;
    const mod = JSON.parse(JSON.stringify(model));
    const Nodestate = JSON.parse(JSON.stringify(nodes));
    const selected = nodes?.find((nd) => nd?.id === selectedElement?.id);
    const index = nodes?.findIndex((nd) => nd?.id === selectedElement?.id);
    // console.log('checked', checked);
    selected.isAsset = checked;
    Nodestate[index] = selected;
    mod.template.nodes = Nodestate;
    setSelectedElement(selected);
    // console.log('mod', mod);
    updateModel(mod);
  };

  // console.log('selectedElement', selectedElement);
  // console.log('nodes', nodes);
  useEffect(() => {
    setDetails({
      ...details,
      name: selectedElement?.data?.label ?? '',
      properties: selectedElement?.properties ?? []
      // bgColor: selectedElement?.data?.style?.backgroundColor ? selectedElement?.data?.style?.backgroundColor : '#000000'
    });
  }, [selectedElement]);

  // console.log('details', details);
  // console.log('details', details)

  const handleChange = (event, newValue) => {
    setDetails({
      ...details,
      properties: newValue
    });
  };

  const handleStyle = (e, name) => {
    const { value } = e.target;
    // const list = [...nodes];
    const list = JSON.parse(JSON.stringify(nodes));
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
      const node = list?.find((nd) => nd?.id === selectedElement?.id);
      const Index = list?.findIndex((nd) => nd?.id === selectedElement?.id);
      setDetails({ ...details, name: value });
      node.data.label = value;

      setSelectedElement(node);
      list[Index] = node;
      setNodes(list);
    }
  };
  // console.log('nodes', nodes);

  // console.log('details', details);
  return (
    <>
      <Box sx={{ cursor: 'pointer', float: 'right', mt: 1.5 }} onClick={() => dispatch(ClosePropertiesTab())}>
        <CancelTwoToneIcon />
      </Box>
      <TabContext value={value}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', width: '270px' }}>
          <TabList onChange={handleChangeTab} aria-label="lab API tabs example">
            <Tab label="Text" value="1" sx={{ minWidth: '90px' }} />
            <Tab label="Diagram" value="2" sx={{ minWidth: '90px' }} />
            <Tab label="Style" value="3" sx={{ minWidth: '90px' }} />
          </TabList>
        </Box>
        <TabPanel value="1" sx={{ p: 0 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
            <InputLabel className={classes.inputlabel}>Name :</InputLabel>
            <TextField
              id="outlined-basic"
              variant="outlined"
              value={details?.name}
              onChange={(e) => handleStyle(e, 'name')}
              sx={{
                width: 'auto',
                '& .MuiInputBase-input': {
                  height: '0.4rem',
                  fontSize: fontSize
                }
              }}
            />
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
            {!selectedElement?.target && (
              <FormControlLabel
                sx={{ fontSize: fontSize, color: '#000' }}
                control={<Checkbox onChange={handleChecked} checked={Boolean(selectedElement?.isAsset)} />}
                label="Asset"
              />
            )}
            <Button variant="outlined" onClick={handleUpdate}>
              Update
            </Button>
          </Box>
        </TabPanel>
        <TabPanel value="2">Diagram</TabPanel>
        <TabPanel value="3">Style</TabPanel>
      </TabContext>
      <Toaster position="top-right" reverseOrder={false} />
    </>
  );
};

export default EditContent;
