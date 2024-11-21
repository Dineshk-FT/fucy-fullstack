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
import ColorTheme from '../../../../store/ColorTheme';
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
    // Add your logout logic here
    dispatch(logout());
    setOpen(false);
    navigate('/login');
  };

  return (
    <>
      <Box display="flex" gap={2} alignItems="center" justifyContent="center" mt={1}>
        <Box onClick={handleChangeMode} sx={{ cursor: 'pointer' }}>
          {isDark ? <NightsStayIcon sx={{ color: 'white' }} /> : <LightModeIcon />}
        </Box>
        <Box onClick={handleLogoutClick} sx={{ cursor: 'pointer' }}>
          <PowerSettingsNewIcon sx={{ color: color?.iconColor }} />
        </Box>
        {/* <Box onClick={() => dispatch(navbarSlide())}>
          {!isNavbarClose ? <ArrowSquareUp size="20" color={color?.iconColor} /> : <ArrowSquareDown size="20" color={color?.iconColor} />}
        </Box> */}
      </Box>

      {/* Logout Confirmation Dialog */}
      <Dialog open={open} onClose={handleClose} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
        <DialogTitle id="alert-dialog-title">
          <Typography variant="h4">{'Confirm Logout'}</Typography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">Are you sure you want to logout?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleConfirmLogout} color="error" variant="contained" autoFocus>
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
