/* eslint-disable */
import React, { useState, useCallback } from 'react';
import { Box, Button, Checkbox, ClickAwayListener, List, ListItem, ListItemIcon, ListItemText, Paper, Popper } from '@mui/material';
import ColorTheme from '../../themes/ColorTheme';
import { CyberGoalIcon, CyberRequireIcon, CyberControlsIcon, CyberClaimsIcon } from '../../assets/icons';

const CYBERSECURITY_OPTIONS = [
  { name: 'Cybersecurity Goals', image: CyberGoalIcon },
  { name: 'Cybersecurity Requirements', image: CyberRequireIcon },
  { name: 'Cybersecurity Controls', image: CyberControlsIcon },
  { name: 'Cybersecurity Claims', image: CyberClaimsIcon }
];

const CybersecurityExport = ({ anchorEl, handleClosePopper, onExport }) => {
  const color = ColorTheme();

  const [selectedOptions, setSelectedOptions] = useState([]);

  const handleToggle = (optionName) => {
    setSelectedOptions((prev) => {
      if (prev.includes(optionName)) {
        return prev.filter((name) => name !== optionName);
      } else {
        return [...prev, optionName];
      }
    });
  };

  const handleExport = useCallback(() => {
    // Implement your export logic here
    console.log('Exporting:', selectedOptions);
    onExport?.(selectedOptions);
    handleClosePopper();
  }, [selectedOptions, onExport, handleClosePopper]);

  return (
    <Popper
      open={Boolean(anchorEl)}
      anchorEl={anchorEl}
      placement="bottom-start"
      sx={{
        width: '300px',
        maxWidth: '90vw',
        zIndex: 1300,
        borderRadius: 2,
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
      }}
    >
      <ClickAwayListener onClickAway={handleClosePopper}>
        <Paper
          sx={{
            p: 2,
            bgcolor: color.modalBg,
            display: 'flex',
            flexDirection: 'column',
            gap: 2
          }}
        >
          <List dense disablePadding>
            {CYBERSECURITY_OPTIONS.map((option) => (
              <ListItem
                key={option.name}
                dense
                onClick={() => handleToggle(option.name)}
                sx={{
                  '&:hover': {
                    backgroundColor: color.hoverBg
                  },
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center'
                  //   mb: 0.5
                }}
              >
                <ListItemIcon>
                  <Checkbox edge="start" size="small" checked={selectedOptions.includes(option.name)} tabIndex={-1} disableRipple />
                </ListItemIcon>
                <ListItemIcon sx={{ marginLeft: '-10px', cursor: 'pointer' }}>
                  <img src={option.image} alt={option.name} style={{ width: 21, height: 21 }} />
                </ListItemIcon>
                <ListItemText
                  sx={{ marginLeft: '-10px', cursor: 'pointer' }}
                  primary={option.name}
                  primaryTypographyProps={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: `${color?.title} !important`
                  }}
                />
              </ListItem>
            ))}
          </List>

          <Box display="flex" justifyContent="flex-end" gap={1}>
            <Button
              variant="outlined"
              color="error"
              onClick={handleClosePopper}
              sx={{ textTransform: 'none', fontSize: 13, px: 2, py: 0.5 }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleExport}
              disabled={selectedOptions.length === 0}
              sx={{ textTransform: 'none', fontSize: 13, px: 2, py: 0.5 }}
            >
              Export
            </Button>
          </Box>
        </Paper>
      </ClickAwayListener>
    </Popper>
  );
};

export default React.memo(CybersecurityExport);
