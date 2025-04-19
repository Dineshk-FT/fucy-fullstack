/* eslint-disable */
import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { ArrowSquareDown, ArrowSquareUp } from 'iconsax-react';
import ColorTheme from '../../../../themes/ColorTheme';
import { useDispatch, useSelector } from 'react-redux';
import LightModeIcon from '@mui/icons-material/LightMode';
import NightsStayIcon from '@mui/icons-material/NightsStay';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import { changeMode, navbarSlide } from '../../../../store/slices/CurrentIdSlice';
import { Typography } from '@mui/material';
import { logout } from '../../../../store/slices/UserDetailsSlice';
import { useNavigate } from 'react-router';
import { NavLink } from 'react-router-dom';

export default function RightSection() {
  const [open, setOpen] = useState(false);
  const color = ColorTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isDark, isNavbarClose } = useSelector((state) => state?.currentId);

  const handleChangeMode = () => {
    dispatch(changeMode());
  };

  const handleLogoutClick = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleConfirmLogout = () => {
    dispatch(logout());
    setOpen(false);
    navigate('/login');
  };

  return (
    <>
      <Box
        display="flex"
        gap={1.5} // Reduced gap for compactness
        alignItems="center"
        justifyContent="flex-end" // Ensure alignment to the right
        mr={2} // Add right margin for spacing from the edge
      >
        <Box
          onClick={handleChangeMode}
          sx={{
            cursor: 'pointer',
            padding: '6px',
            borderRadius: '6px',
            background: isDark == true
              ? 'rgba(255,255,255,0.03)'
              : 'rgba(0,0,0,0.03)',
            transition: 'all 0.3s ease',
            '&:hover': {
              background: isDark == true
                ? 'linear-gradient(90deg, rgba(100,181,246,0.15) 0%, rgba(100,181,246,0.03) 100%)'
                : 'linear-gradient(90deg, rgba(33,150,243,0.08) 0%, rgba(33,150,243,0.02) 100%)',
              transform: 'scale(1.1)',
              boxShadow: isDark == true
                ? '0 2px 6px rgba(0,0,0,0.4)'
                : '0 2px 6px rgba(0,0,0,0.1)',
              filter: isDark == true
                ? 'drop-shadow(0 0 6px rgba(100,181,246,0.25))'
                : 'drop-shadow(0 0 6px rgba(33,150,243,0.15))',
            },
          }}
        >
          {isDark ? (
            <NightsStayIcon
              sx={{ color: isDark == true ? '#64b5f6' : '#2196f3', fontSize: 20 }}
            />
          ) : (
            <LightModeIcon
              sx={{ color: isDark == true ? '#64b5f6' : '#2196f3', fontSize: 20 }}
            />
          )}
        </Box>
        <Box
          onClick={handleLogoutClick}
          sx={{
            cursor: 'pointer',
            padding: '6px',
            borderRadius: '6px',
            background: isDark == true
              ? 'rgba(255,255,255,0.03)'
              : 'rgba(0,0,0,0.03)',
            transition: 'all 0.3s ease',
            '&:hover': {
              background: isDark == true
                ? 'linear-gradient(90deg, rgba(100,181,246,0.15) 0%, rgba(100,181,246,0.03) 100%)'
                : 'linear-gradient(90deg, rgba(33,150,243,0.08) 0%, rgba(33,150,243,0.02) 100%)',
              transform: 'scale(1.1)',
              boxShadow: isDark == true
                ? '0 2px 6px rgba(0,0,0,0.4)'
                : '0 2px 6px rgba(0,0,0,0.1)',
              filter: isDark == true
                ? 'drop-shadow(0 0 6px rgba(100,181,246,0.25))'
                : 'drop-shadow(0 0 6px rgba(33,150,243,0.15))',
            },
          }}
        >
          <PowerSettingsNewIcon
            sx={{ color: isDark == true ? '#64b5f6' : '#2196f3', fontSize: 20 }}
          />
        </Box>
        {/* Uncomment if you want to include the navbar slide toggle */}
        <Box
          onClick={() => dispatch(navbarSlide())}
          sx={{
            cursor: 'pointer',
            padding: '6px',
            borderRadius: '6px',
            background: isDark == true
              ? 'rgba(255,255,255,0.03)'
              : 'rgba(0,0,0,0.03)',
            transition: 'all 0.3s ease',
            '&:hover': {
              background: isDark == true
                ? 'linear-gradient(90deg, rgba(100,181,246,0.15) 0%, rgba(100,181,246,0.03) 100%)'
                : 'linear-gradient(90deg, rgba(33,150,243,0.08) 0%, rgba(33,150,243,0.02) 100%)',
              transform: 'scale(1.1)',
              boxShadow: isDark == true
                ? '0 2px 6px rgba(0,0,0,0.4)'
                : '0 2px 6px rgba(0,0,0,0.1)',
              filter: isDark == true
                ? 'drop-shadow(0 0 6px rgba(100,181,246,0.25))'
                : 'drop-shadow(0 0 6px rgba(33,150,243,0.15))',
            },
          }}
        >
          {!isNavbarClose ? (
            <ArrowSquareUp size="20" color={isDark == true ? '#64b5f6' : '#2196f3'} />
          ) : (
            <ArrowSquareDown size="20" color={isDark == true ? '#64b5f6' : '#2196f3'} />
          )}
        </Box>
      </Box>

      {/* Logout Confirmation Dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          <Typography
            variant="h4"
            sx={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600 }}
          >
            Confirm Logout
          </Typography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText
            id="alert-dialog-description"
            sx={{ fontFamily: "'Poppins', sans-serif" }}
          >
            Are you sure you want to logout?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleClose}
            variant="outlined"
            sx={{ fontFamily: "'Poppins', sans-serif" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmLogout}
            color="error"
            variant="contained"
            autoFocus
            sx={{ fontFamily: "'Poppins', sans-serif" }}
          >
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
