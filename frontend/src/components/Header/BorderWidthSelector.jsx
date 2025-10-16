/* eslint-disable */
import React from 'react';
import { makeStyles } from '@mui/styles';
import { Box, Button, Select, MenuItem } from '@mui/material';
import { Remove, Add } from '@mui/icons-material';

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    alignItems: 'center',
    borderRadius: '8px',
    overflow: 'hidden',
    border: '1px solid',
    borderColor: 'divider',
    '&:hover': {
      borderColor: 'primary.main'
    }
  },
  button: {
    minWidth: '32px',
    width: '32px',
    height: '32px',
    borderRadius: 0,
    backgroundColor: 'background.paper',
    border: 'none',
    '&:hover': {
      backgroundColor: 'action.hover'
    },
    '&:active': {
      backgroundColor: 'action.selected'
    }
  },
  select: {
    height: '32px',
    borderRadius: 0,
    border: 'none',
    borderLeft: '1px solid',
    borderRight: '1px solid',
    borderColor: 'divider',
    '& .MuiSelect-select': {
      padding: '6px 12px',
      fontSize: '0.875rem'
    },
    '&:hover': {
      backgroundColor: 'action.hover'
    }
  }
}));

const BorderWidthSelector = ({ borderWidth, changeBorderWidth, handleBorderWidthChange }) => {
  const classes = useStyles();

  const range = () => Array.from({ length: 7 }, (_, i) => i);

  return (
    <Box className={classes.container}>
      <Button className={classes.button} onClick={() => changeBorderWidth('dec')} size="small">
        <Remove fontSize="small" />
      </Button>

      <Select
        className={classes.select}
        value={`${borderWidth}px`}
        onChange={handleBorderWidthChange}
        onClick={(e) => e.stopPropagation()}
        MenuProps={{
          PaperProps: {
            sx: {
              maxHeight: 200
            }
          }
        }}
      >
        {range().map((it) => (
          <MenuItem key={it} value={`${it}px`}>
            {it}px
          </MenuItem>
        ))}
      </Select>

      <Button className={classes.button} onClick={() => changeBorderWidth('inc')} size="small">
        <Add fontSize="small" />
      </Button>
    </Box>
  );
};

export default BorderWidthSelector;
