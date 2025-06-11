/* eslint-disable */
import React, { useState, useCallback } from 'react';
import {
  Box,
  Button,
  Checkbox,
  ClickAwayListener,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Popper
} from '@mui/material';
import ColorTheme from '../../themes/ColorTheme';
import { CyberGoalIcon, CyberRequireIcon, CyberControlsIcon, CyberClaimsIcon } from '../../assets/icons';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import useStore from '../../store/Zustand/store';

const CYBERSECURITY_OPTIONS = [
  { id: 'cybersceurity_goals', name: 'Cybersecurity Goals', image: CyberGoalIcon },
  { id: 'cybersceurity_requirements', name: 'Cybersecurity Requirements', image: CyberRequireIcon },
  { id: 'cybersceurity_controls', name: 'Cybersecurity Controls', image: CyberControlsIcon },
  { id: 'cybersceurity_cliams', name: 'Cybersecurity Claims', image: CyberClaimsIcon }
];

const selector = (state) => ({
  exportCybersecurity: state.exportCybersecurity,
  model: state.model
});

const CybersecurityExport = ({ anchorEl, handleClosePopper, onExport }) => {
  const color = ColorTheme();
  const { exportCybersecurity, model } = useStore(selector);
  const [selectedOptions, setSelectedOptions] = useState([]);

  const handleToggle = (e, optionId) => {
    e.stopPropagation();
    setSelectedOptions((prev) => {
      if (prev.includes(optionId)) {
        return prev.filter((id) => id !== optionId);
      } else {
        return [...prev, optionId];
      }
    });
  };

  const handleExport = useCallback(
    (e) => {
      e.stopPropagation();
      // Implement your export logic here
      // console.log('Exporting:', selectedOptions);
      const details = {
        modelId: model?._id,
        types: selectedOptions
      };
      exportCybersecurity(details).then((res) => {
        // console.log('res', res);
        if (res.export.url) {
          const link = document.createElement('a');
          link.href = res?.export?.url;
          link.download = res.export.fileName; // optional: you can specify a filename here, like 'cybersecurity-export.zip'
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      });

      // handleClosePopper();
    },
    [selectedOptions, onExport, handleClosePopper]
  );

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
          <IconButton
            onClick={handleClosePopper}
            color="error"
            sx={{
              position: 'absolute',
              top: -4,
              right: -4
            }}
          >
            <HighlightOffIcon />
          </IconButton>

          <List dense disablePadding>
            {CYBERSECURITY_OPTIONS.map((option) => (
              <ListItem
                key={option.id}
                dense
                onClick={(e) => handleToggle(e, option.id)}
                sx={{
                  '&:hover': {
                    backgroundColor: color.hoverBg
                  },
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <ListItemIcon>
                  <Checkbox edge="start" size="small" checked={selectedOptions.includes(option.id)} tabIndex={-1} disableRipple />
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
              variant="contained"
              color="primary"
              onClick={handleExport}
              disabled={selectedOptions.length === 0}
              sx={{ textTransform: 'none', fontSize: 13, px: 2, py: 0.5 }}
            >
              Export in ReqIF
            </Button>
          </Box>
        </Paper>
      </ClickAwayListener>
    </Popper>
  );
};

export default React.memo(CybersecurityExport);
