/* eslint-disable */
import React, { useState, useRef } from 'react';
import Joyride from 'react-joyride';
import {
  Button,
  TextField,
  Box,
  OutlinedInput,
  InputLabel,
  MenuItem,
  FormControl,
  Select,
  Chip,
  Typography,
  Grid,
  IconButton
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useStore from '../../store/Zustand/store';
import { getNodeDetails } from '../../utils/Constraints';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedNodeGroupId } from '../../store/slices/PageSectionSlice';
import { closeAddDataNodeTab } from '../../store/slices/CanvasSlice';
import { fontSize } from '../../themes/constant';
import ColorTheme from '../../themes/ColorTheme';
import CancelTwoToneIcon from '@mui/icons-material/CancelTwoTone';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { shallow } from 'zustand/shallow';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 'inherit'
    }
  },
  anchorOrigin: {
    vertical: 'top',
    horizontal: 'left'
  },
  transformOrigin: {
    vertical: 'bottom',
    horizontal: 'left'
  },
  getContentAnchorEl: null
};

const properties = ['Confidentiality', 'Integrity', 'Authenticity', 'Authorization', 'Non-repudiation', 'Availability'];

const selector = (state) => ({
  setNodes: state.setNodes,
  nodes: state.nodes
});

function getStyles(name, nodes, theme) {
  return {
    fontWeight: nodes.indexOf(name) === -1 ? theme.typography.fontWeightRegular : theme.typography.fontWeightMedium
  };
}

const steps = [
  {
    target: '#data-node-name-input',
    content: 'Enter a name for your new data node here.',
    disableBeacon: true
  },
  {
    target: '#data-node-properties-select',
    content: 'Select one or more security properties for this data node from the dropdown.'
  },
  {
    target: '#add-data-node-btn',
    content: 'Click here to create the data node with the specified properties.'
  },
  {
    target: '#cancel-data-node-btn',
    content: 'Click here to cancel data node creation and close the form.'
  }
];

const AddDataNode = ({ assets }) => {
  const color = ColorTheme();
  const theme = useTheme();
  const dispatch = useDispatch();
  const { selectedNodeGroupId } = useSelector((state) => state?.pageName);
  const [count, setCount] = useState(1);
  const [newNode, setNewNode] = useState({
    nodeName: `New Data ${count}`,
    type: '',
    properties: [properties[0]],
    bgColor: ''
  });

  const [runTour, setRunTour] = useState(false);
  const nameInputRef = useRef(null);
  const hasTriggeredTour = useRef(false);

  const { setNodes, nodes } = useStore(selector, shallow);

  React.useEffect(() => {
    if (!hasTriggeredTour.current) {
      hasTriggeredTour.current = true;

      // Focus the name input field
      const focusTimer = setTimeout(() => {
        if (nameInputRef.current) {
          nameInputRef.current.focus();
        }
      }, 300);

      return () => {
        clearTimeout(focusTimer);
      };
    }
  }, []);

  const handleJoyrideCallback = (data) => {
    const { status } = data;

    if (['finished', 'skipped'].includes(status)) {
      setRunTour(false);
    }
  };

  const handleTourStart = () => {
    setRunTour(true);
  };

  const handleChange = (event) => {
    const {
      target: { value, name }
    } = event;
    if (name) {
      setNewNode({
        ...newNode,
        [`${name}`]: value
      });
    }
  };

  const CloseModel = () => {
    dispatch(closeAddDataNodeTab());
    dispatch(setSelectedNodeGroupId(''));
    setNewNode({
      nodeName: 'New Data',
      type: '',
      properties: [properties[0]],
      bgColor: '#dadada'
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedNodeGroupId) {
      const nodeDetail = getNodeDetails('data', 'Data', count, newNode);
      const list = [...nodes, nodeDetail];
      setNodes(list);
    }

    setCount((prev) => prev + 1);
    setNewNode((prev) => ({
      ...prev,
      nodeName: `New Data ${count + 1}`,
      type: '',
      properties: [properties[0]],
      bgColor: '#dadada'
    }));
  };

  return (
    <Box sx={{ background: `${color?.sidebarBG} !important`, color: color?.sidebarContent, position: 'relative' }}>
      <Joyride
        steps={steps}
        run={runTour}
        continuous
        scrollToFirstStep
        showProgress
        showSkipButton
        callback={handleJoyrideCallback}
        styles={{
          options: {
            zIndex: 1300,
            beacon: {
              backgroundColor: '#1976d2',
              borderRadius: '50%',
              width: 20,
              height: 20,
              animation: 'pulse 1.5s infinite'
            }
          }
        }}
        disableOverlayClose
        disableScrolling
        floaterProps={{
          styles: {
            arrow: {
              color: '#1976d2'
            }
          }
        }}
      />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, my: 1, mx: 1, p: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4" color="primary">
            Add New Data Node
          </Typography>
          <Box display="flex" alignItems="center">
            <IconButton
              onClick={handleTourStart}
              sx={{
                color: '#1976d2',
                '&:hover': {
                  backgroundColor: 'rgba(25, 118, 210, 0.1)'
                },
                mr: 1,
                mb: 1
              }}
            >
              <HelpOutlineIcon />
            </IconButton>
            <Box sx={{ cursor: 'pointer' }} onClick={CloseModel}>
              <CancelTwoToneIcon />
            </Box>
          </Box>
        </Box>

        <TextField
          inputRef={nameInputRef}
          id="data-node-name-input"
          size="small"
          label="Name"
          name="nodeName"
          variant="outlined"
          onChange={handleChange}
          value={newNode.nodeName}
          sx={{
            fontSize: fontSize,
            background: `${color?.sidebarBG} !important`,
            color: color?.sidebarContent
          }}
        />

        <Grid container spacing={1} my={1}>
          <Grid item xs={12}>
            <FormControl size="small" fullWidth>
              <InputLabel notched id="demo-multiple-chip-label">
                Properties
              </InputLabel>
              <Select
                id="data-node-properties-select"
                labelId="demo-multiple-chip-label"
                multiple
                name="properties"
                sx={{
                  fontSize: fontSize,
                  background: `${color?.sidebarBG} !important`,
                  color: color?.sidebarContent
                }}
                value={newNode.properties}
                onChange={handleChange}
                input={<OutlinedInput id="select-multiple-chip" label="Properties" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} sx={{ fontSize: fontSize }} />
                    ))}
                  </Box>
                )}
                MenuProps={MenuProps}
              >
                {properties?.map((name) => (
                  <MenuItem key={name} value={name} style={getStyles(name, newNode.properties, theme)}>
                    {name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Box display="flex" justifyContent="space-between" height="30px" sx={{ mt: 2 }}>
          <Button id="cancel-data-node-btn" onClick={CloseModel} variant="outlined" color="error">
            Cancel
          </Button>
          <Button
            id="add-data-node-btn"
            variant="contained"
            onClick={handleSubmit}
            disabled={!newNode.nodeName || newNode.properties.length === 0}
          >
            Add
          </Button>
        </Box>
      </Box>

      <style>
        {`
          @keyframes pulse {
            0% {
              transform: scale(1);
              opacity: 1;
            }
            50% {
              transform: scale(1.3);
              opacity: 0.7;
            }
            100% {
              transform: scale(1);
              opacity: 1;
            }
          }
        `}
      </style>
    </Box>
  );
};

export default AddDataNode;
