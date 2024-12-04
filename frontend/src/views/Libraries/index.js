/*eslint-disable*/
import React from 'react';
import Box from '@mui/material/Box';
import '../index.css';
import AddIcon from '@mui/icons-material/Add';
import useStore from '../../Zustand/store';
// import { useNavigate } from "react-router-dom";
import { shallow } from 'zustand/shallow';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles(() => ({
  library: {
    zIndex: 1400,
    pointerEvents: 'auto',
    background: '#f5f5f5',
    borderRadius: '8px',
    padding: '8px',
    textAlign: 'center',
    fontSize: '12px',
    minWidth: '120px',
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
      cursor: 'grab'
    },
    maxHeight: '300px',
    overflowY: 'auto',
    '&::-webkit-scrollbar': {
      width: '4px'
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: 'rgba(0, 0, 0, 0.2)',
      borderRadius: '10px'
    },
    '&::-webkit-scrollbar-track': {
      background: 'rgba(0, 0, 0, 0.1)'
    }
  }
}));

const selector = (state) => ({
  template: state.template
});

export default function TemplateList() {
  const classes = useStyles();
  const { template } = useStore(selector, shallow);

  // console.log('template', template)
  //   const navigate = useNavigate();

  const onDragStart = (event, item) => {
    const parseFile = JSON.stringify(item['template']);
    // console.log("parseFile",parseFile)
    event.dataTransfer.setData('application/template', parseFile);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <Box
      // component="nav"
      aria-label="sidebar"
      sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 2 }}
    >
      {template.map((text, index) => (
        <div key={index} className={classes?.library} onDragStart={(event) => onDragStart(event, text)} draggable>
          {text['name']}
        </div>
      ))}
      {/* <AddIcon sx={{ fontSize: 20, color: 'blue', cursor: 'pointer' }} onClick={() => window.location.reload()} /> */}
    </Box>
  );
}
