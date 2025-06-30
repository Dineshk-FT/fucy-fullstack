// HelpPopper.js
import React from 'react';
import { 
  Popper, 
  Paper, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  ClickAwayListener,
  Button,
  Divider
} from '@mui/material';
import HelpIcon from '@mui/icons-material/Help';
import DescriptionIcon from '@mui/icons-material/Description';

const HelpPopper = ({ open, anchorEl, onClose, onDocumentationClick }) => {
  const handleDocumentationClick = (e) => {
    e.stopPropagation();
    onDocumentationClick();
    onClose();
  };

  return (
    <Popper 
      open={open} 
      anchorEl={anchorEl} 
      placement="bottom-end" 
      disablePortal
      style={{ zIndex: 1500 }}
    >
      <ClickAwayListener onClickAway={onClose}>
        <Paper sx={{ p: 2, width: 300, borderRadius: 2, boxShadow: 3 }}>
          <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <HelpIcon color="primary" />
            Need Help?
          </Typography>
          
          <List dense>
            <ListItem>
              <ListItemText 
                primary="Q: How do I change the theme?" 
                secondary="Click the moon/sun icon in the top right corner." 
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Q: How to logout?" 
                secondary="Click the power icon in the top right corner." 
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Q: How to collapse the navbar?" 
                secondary="Click the arrow icon in the top left corner." 
              />
            </ListItem>
          </List>
          
          <Divider sx={{ my: 1 }} />
          
          <Button
            fullWidth
            variant="outlined"
            startIcon={<DescriptionIcon />}
            onClick={handleDocumentationClick}
            sx={{ mt: 1 }}
          >
            Open Documentation
          </Button>
        </Paper>
      </ClickAwayListener>
    </Popper>
  );
};

export default HelpPopper;
