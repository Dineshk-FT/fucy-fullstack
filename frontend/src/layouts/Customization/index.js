/*eslint-disable*/
import { useState, useRef } from 'react';
import Draggable from 'react-draggable';

// material-ui
import { useTheme } from '@mui/material/styles';
import { Tooltip, Fab, Box, Popper, Paper, Typography, TextField, IconButton, Chip, ClickAwayListener } from '@mui/material';
import { ChatbotIcon } from '../../assets/icons'; // Assuming you have a SendIcon
import { Send2 } from 'iconsax-react';

// ==============================|| LIVE CUSTOMIZATION ||============================== //

const Customization = () => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState(''); // State to manage the message input
  const buttonRef = useRef(null); // Reference for Popper positioning

  const handleToggle = (e) => {
    // e.stopProgation();
    setOpen((prev) => !prev);
  };

  const handleOptionClick = (option) => {
    console.log(`Selected: ${option}`); // Replace with actual functionality
    setOpen(false); // Close popper after selection
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      console.log(`Message sent: ${message}`); // Replace with actual functionality
      setMessage(''); // Clear the input after sending
    }
  };

  return (
    <Draggable cancel="input,textarea,button" onStop={() => document.activeElement?.blur()}>
      <Box
        ref={buttonRef}
        sx={{
          position: 'fixed',
          bottom: '2%',
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
            variant="circular"
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

        {/* Popper for chatbot messages */}
        <Popper open={open} anchorEl={buttonRef.current} placement="left-start" sx={{ zIndex: 1300 }}>
          <ClickAwayListener onClickAway={() => setOpen(false)}>
            <Paper sx={{ p: 2, width: 250, bgcolor: theme.palette.background.paper, boxShadow: 3, borderRadius: 2 }}>
              <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
                How can I help?
              </Typography>

              {/* Options as Chips */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {['Create a Model', 'What should I do?'].map((option, index) => (
                  <Chip key={index} label={option} onClick={() => handleOptionClick(option)} clickable />
                ))}
              </Box>

              {/* Text field for messaging */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  height: 40,
                  border: '1px solid', // Add border to the Box
                  borderColor: 'divider', // Use theme's divider color or specify a custom color
                  borderRadius: 2, // Add border radius for rounded corners
                  p: 1 // Add padding inside the Box
                }}
              >
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Type a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSendMessage();
                    }
                  }}
                  sx={{
                    mr: 1,
                    '& .MuiOutlinedInput-notchedOutline': {
                      border: 'none' // Remove border from TextField
                    },
                    '& .MuiInputBase-input': {
                      padding: 0.5
                    }
                  }}
                />
                <IconButton onClick={handleSendMessage} color="primary">
                  <Send2 size="32" color="aqua" />
                </IconButton>
              </Box>
            </Paper>
          </ClickAwayListener>
        </Popper>
      </Box>
    </Draggable>
  );
};

export default Customization;
