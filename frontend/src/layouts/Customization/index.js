/*eslint-disable*/
import React, { useState, useRef } from 'react';
import Draggable from 'react-draggable';

// material-ui
import { useTheme } from '@mui/material/styles';
import { Tooltip, Fab, Box, Popper, Paper, Typography, TextField, IconButton, Chip } from '@mui/material';

import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import { ChatbotIcon } from '../../assets/icons';
import { Send2 } from 'iconsax-react';

// ==============================|| LIVE CUSTOMIZATION ||============================== //

const Customization = () => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const buttonRef = useRef(null);

  const handleToggle = (e) => {
    e?.stopPropagation();
    setOpen((prev) => !prev);
  };

  const handleClosePopper = (e) => {
    e?.stopPropagation();
    setOpen(false);
  };

  const handleOptionClick = (e, option) => {
    e?.stopPropagation();
    console.log(`Selected: ${option}`);
    setOpen(false);
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      console.log(`Message sent: ${message}`);
      setMessage('');
    }
  };

  return (
    <Draggable cancel="input,textarea,button" onStop={() => document.activeElement?.blur()}>
      <Box
        ref={buttonRef}
        sx={{
          position: 'fixed',
          bottom: '5mm',
          right: 10,
          zIndex: 1200,
          cursor: 'grab'
        }}
      >
        <Tooltip title="Ask Us">
          <Fab
            component="div"
            onClick={handleToggle}
            size="small"
            color="warning"
            sx={{
              borderRadius: 0,
              borderTopLeftRadius: '50%',
              borderBottomLeftRadius: '50%',
              borderTopRightRadius: '50%',
              borderBottomRightRadius: '4px'
            }}
          >
            <Box component="img" src={ChatbotIcon} alt="chatbot" height="30px" width="30px" />
          </Fab>
        </Tooltip>

        {/* Popper for chatbot */}
        <Popper open={open} anchorEl={buttonRef.current} placement="left-start" sx={{ zIndex: 1300 }}>
          <Paper
            sx={{
              p: 2,
              width: 260,
              bgcolor: theme.palette.background.paper,
              boxShadow: 4,
              borderRadius: 2
            }}
          >
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="body1" sx={{ fontWeight: 'bold', flexGrow: 1 }}>
                How can I help?
              </Typography>
              <IconButton size="small" onClick={handleClosePopper}>
                <HighlightOffIcon fontSize="small" color="error" />
              </IconButton>
            </Box>

            {/* Options */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {['Create a Model', 'What should I do?'].map((option, index) => (
                <Chip key={index} label={option} onClick={(e) => handleOptionClick(e, option)} clickable size="small" />
              ))}
            </Box>

            {/* Message input */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                height: 42,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                px: 1
              }}
            >
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                sx={{
                  mr: 1,
                  '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                  '& .MuiInputBase-input': { py: 0.5 }
                }}
              />
              <IconButton onClick={handleSendMessage} color="primary">
                <Send2 size="26" />
              </IconButton>
            </Box>
          </Paper>
        </Popper>
      </Box>
    </Draggable>
  );
};

export default React.memo(Customization);
