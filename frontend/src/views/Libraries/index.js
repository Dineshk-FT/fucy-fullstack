/*eslint-disable*/
import React, { useEffect } from 'react';
import Box from '@mui/material/Box';
import '../index.css';
import AddIcon from '@mui/icons-material/Add';
import useStore from '../../Zustand/store';
// import { useNavigate } from "react-router-dom";
import { shallow } from 'zustand/shallow';

const selector = (state) => ({
  template: state.template,
  fetchAPI: state.fetchAPI
});

export default function TemplateList() {
  const { template, fetchAPI } = useStore(selector, shallow);

  // console.log('template', template)
  //   const navigate = useNavigate();

  useEffect(() => {
    fetchAPI();
  }, []);

  const onDragStart = (event, item) => {
    const parseFile = JSON.stringify(item['template']);
    // console.log("parseFile",parseFile)
    event.dataTransfer.setData('application/template', parseFile);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <>
      <Box component="nav" aria-label="sidebar" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {template.map((text, index) => (
          <div key={index} className={`library ${text.name}`} onDragStart={(event) => onDragStart(event, text)} draggable>
            {text['name']}
          </div>
        ))}
        {/* <AddIcon sx={{ fontSize: 20, color: 'blue', cursor: 'pointer' }} onClick={() => window.location.reload()} /> */}
      </Box>
    </>
  );
}
