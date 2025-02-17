/* eslint-disable */
import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import useStore from '../../Zustand/store';
import { shallow } from 'zustand/shallow';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles(() => ({
  library: {
    zIndex: 1400,
    pointerEvents: 'auto',
    background: '#f5f5f5',
    borderRadius: '8px',
    padding: '6px',
    textAlign: 'center',
    fontSize: '13px',
    minWidth: '100px',
    marginBottom: '8px', // Space between items
    transition: 'background-color 0.2s ease',
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
      cursor: 'grab',
    },
    maxHeight: '250px',
    overflowY: 'auto',
    '&::-webkit-scrollbar': {
      width: '4px',
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: 'rgba(0, 0, 0, 0.2)',
      borderRadius: '10px',
    },
    '&::-webkit-scrollbar-track': {
      background: 'rgba(0, 0, 0, 0.1)',
    },
  },
}));

const selector = (state) => ({
  template: state.template,
});

// Modify TemplateList to accept props for dialog visibility
export default function TemplateList({ openDialog, setOpenDialog }) {
  const classes = useStyles();
  const { template } = useStore(selector, shallow);

  // Function to handle closing the dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const onDragStart = (event, item) => {
    const parseFile = JSON.stringify(item['template']);
    event.dataTransfer.setData('application/template', parseFile);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <Box>
      {/* Dialog Box with reduced width */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        sx={{
          maxWidth: '400px',  // Reduced width
          width: 'auto',      // Adjusts based on content
          margin: 'auto',     // Centers the dialog
        }}
      >
        <DialogTitle sx={{ paddingBottom: '8px', fontSize: '14px' }}>Template List</DialogTitle>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1.5, // Reduced gap between elements
            maxHeight: '250px',
            overflowY: 'auto',
            padding: '8px',
          }}
        >
          {template.map((text, index) => (
            <div
              key={index}
              className={classes.library}
              onDragStart={(event) => onDragStart(event, text)}
              draggable
            >
              {text['name']}
            </div>
          ))}
        </Box>

        {/* Dialog Actions */}
        <DialogActions sx={{ padding: '8px' }}>
          <Button onClick={handleCloseDialog} color="primary" size="small">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
