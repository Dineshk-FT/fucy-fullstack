import React, { useEffect, useState } from 'react';
import { Chip, InputLabel, Box, TextField, Autocomplete, Button, Checkbox, FormControlLabel } from '@mui/material';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';

const Properties = ['Confidentiality', 'Integrity', 'Authenticity', 'Authorization', 'Non-repudiation', 'Availability'];

const EditContent = ({ selectedNode, nodes, setNodes, setSelectedNode, details, setDetails, modal, updateModal }) => {
  const [value, setValue] = useState('1');

  console.log('selectedNode', selectedNode);
  const handleUpdate = () => {
    const mod = { ...modal };
    const Nodestate = [...nodes];
    const selected = nodes?.find((nd) => nd?.id === selectedNode?.id);
    const index = nodes?.findIndex((nd) => nd?.id === selectedNode?.id);
    selected.data.label = details?.name;
    selected.properties = details?.properties;
    selected.isAsset = details?.isAsset;
    Nodestate[index] = selected;
    mod.template.nodes = Nodestate;
    // console.log('mod', mod);
    updateModal(mod);
    // .then((res) => {
    //   console.log('res', res);
    // })
    // .catch((err) => {
    //   console.log('err', err);
    // });
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
    // console.log('selectedNode', selectedNode);

    const Nodestate = [...nodes];
    const selected = nodes?.find((nd) => nd?.id === selectedNode?.id);
    const index = nodes?.findIndex((nd) => nd?.id === selectedNode?.id);
    selected.isAsset = event.target.checked;
    Nodestate[index] = selected;
    setNodes(Nodestate);
  };
  // console.log('nodes', nodes);
  useEffect(() => {
    setDetails({
      ...details,
      name: selectedNode?.data?.label ?? '',
      properties: selectedNode?.properties ?? []
      // bgColor: selectedNode?.data?.style?.backgroundColor ? selectedNode?.data?.style?.backgroundColor : '#000000'
    });
  }, [selectedNode]);

  // console.log('details', details)

  const handleChange = (event, newValue) => {
    setDetails({
      ...details,
      properties: newValue
    });
  };

  const handleStyle = (e, name) => {
    // console.log('name', name)
    // console.log('e', e.target.value)
    const list = [...nodes];
    const node = list?.find((nd) => nd?.id === selectedNode?.id);
    const Index = list?.findIndex((nd) => nd?.id === selectedNode?.id);
    // const {style} = node.data;
    if (name === 'name') {
      setDetails({ ...details, name: e.target.value });
      node.data.label = e.target.value;
    }
    // else {
    //     setDetails({ ...details, bgColor: e.target.value });
    //     style.backgroundColor = e.target.value;
    // }
    setSelectedNode(node);
    list[Index] = node;
    setNodes(list);
  };

  // console.log('details', details);
  return (
    <>
      <TabContext value={value}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', width: '230px' }}>
          <TabList onChange={handleChangeTab} aria-label="lab API tabs example">
            <Tab label="Text" value="1" sx={{ minWidth: '73px' }} />
            <Tab label="Diagram" value="2" sx={{ minWidth: '73px' }} />
            <Tab label="Style" value="3" sx={{ minWidth: '73px' }} />
          </TabList>
        </Box>
        <TabPanel value="1" sx={{ p: 0 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, pr: 1.5, mt: 1 }}>
            <InputLabel>Name :</InputLabel>
            <TextField
              id="outlined-basic"
              variant="outlined"
              value={details?.name}
              onChange={(e) => handleStyle(e, 'name')}
              sx={{
                width: 'auto',
                '& .MuiInputBase-input': {
                  height: '0.4rem'
                }
              }}
            />
            <InputLabel>Properties :</InputLabel>

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
                  <Chip key={option} variant="outlined" label={option} {...getTagProps({ index })} onDelete={handleDelete(option)} />
                ))
              }
              renderInput={(params) => <TextField {...params} variant="outlined" />}
            />
            <FormControlLabel control={<Checkbox onChange={handleChecked} checked={selectedNode?.isAsset} />} label="Asset" />
            <Button variant="outlined" onClick={handleUpdate}>
              Update
            </Button>
          </Box>
        </TabPanel>
        <TabPanel value="2">Diagram</TabPanel>
        <TabPanel value="3">Style</TabPanel>
      </TabContext>
    </>
  );
};

export default EditContent;
