// HelpPopper.js
import React from 'react';
import { Popper, Paper, Typography, List, ListItem, ListItemText, ClickAwayListener } from '@mui/material';

const HelpPopper = ({ open, anchorEl, onClose }) => {
  return (
    <Popper open={open} anchorEl={anchorEl} placement="bottom-end" disablePortal>
      <ClickAwayListener onClickAway={onClose}>
        <Paper sx={{ p: 2, maxWidth: 300, borderRadius: 2, boxShadow: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Need Help?
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText primary="Q: How do I change the theme?" secondary="Click the moon/sun icon." />
            </ListItem>
            <ListItem>
              <ListItemText primary="Q: How to logout?" secondary="Click the power icon." />
            </ListItem>
            <ListItem>
              <ListItemText primary="Q: How to collapse the navbar?" secondary="Click the arrow icon." />
            </ListItem>
          </List>
        </Paper>
      </ClickAwayListener>
    </Popper>
  );
};

export default HelpPopper;
