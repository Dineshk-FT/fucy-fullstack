/*eslint-disable*/
import React, { useCallback, useMemo, useState } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, Typography } from '@mui/material';
import { ArrowSquareDown, ArrowSquareUp } from 'iconsax-react';
import { LightMode as LightModeIcon, NightsStay as NightsStayIcon, PowerSettingsNew as PowerSettingsNewIcon } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { changeMode, navbarSlide } from '../../../../store/slices/CurrentIdSlice';
import { logout } from '../../../../store/slices/UserDetailsSlice';
import { useNavigate } from 'react-router';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import HelpPopper from '../../../../components/Poppers/HelpPopper';

function RightSection() {
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isDark, isNavbarClose } = useSelector((state) => state?.currentId);
  const [helpAnchorEl, setHelpAnchorEl] = useState(null);
  const handleHelpClick = (event) => {
    setHelpAnchorEl((prev) => (prev ? null : event.currentTarget));
  };
  const handleHelpClose = () => {
    setHelpAnchorEl(null);
  };
  const isHelpOpen = Boolean(helpAnchorEl);

  const handleChangeMode = useCallback(() => {
    dispatch(changeMode());
  }, [dispatch]);

  const toggleLogoutDialog = useCallback(
    (open) => () => {
      setOpen(open);
    },
    []
  );

  const handleConfirmLogout = useCallback(() => {
    dispatch(logout());
    setOpen(false);
    navigate('/login');
  }, [dispatch, navigate]);

  const toggleNavbar = useCallback(() => {
    dispatch(navbarSlide());
  }, [dispatch]);

  const iconButtonStyles = useMemo(
    () => ({
      cursor: 'pointer',
      padding: '6px',
      borderRadius: '6px',
      background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
      transition: 'all 0.3s ease',
      '&:hover': {
        background: isDark
          ? 'linear-gradient(90deg, rgba(100,181,246,0.15) 0%, rgba(100,181,246,0.03) 100%)'
          : 'linear-gradient(90deg, rgba(33,150,243,0.08) 0%, rgba(33,150,243,0.02) 100%)',
        transform: 'scale(1.1)',
        boxShadow: isDark ? '0 2px 6px rgba(0,0,0,0.4)' : '0 2px 6px rgba(0,0,0,0.1)',
        filter: isDark ? 'drop-shadow(0 0 6px rgba(100,181,246,0.25))' : 'drop-shadow(0 0 6px rgba(33,150,243,0.15))'
      }
    }),
    [isDark]
  );

  const iconColor = useMemo(() => (isDark ? '#64b5f6' : '#2196f3'), [isDark]);

  return (
    <>
      <Box display="flex" gap={1.5} alignItems="center" justifyContent="flex-end" mr={2}>
        <IconButton sx={{ color: '#1976d2', ml: 1 }} onClick={handleHelpClick} size="small">
          <HelpOutlineIcon fontSize="small" />
        </IconButton>
        <Box onClick={handleChangeMode} sx={iconButtonStyles}>
          {isDark ? <NightsStayIcon sx={{ color: iconColor, fontSize: 20 }} /> : <LightModeIcon sx={{ color: iconColor, fontSize: 20 }} />}
        </Box>

        <Box onClick={toggleLogoutDialog(true)} sx={iconButtonStyles}>
          <PowerSettingsNewIcon sx={{ color: iconColor, fontSize: 20 }} />
        </Box>

        <Box onClick={toggleNavbar} sx={iconButtonStyles}>
          {isNavbarClose ? <ArrowSquareDown size="20" color={iconColor} /> : <ArrowSquareUp size="20" color={iconColor} />}
        </Box>
      </Box>

      <Dialog
        open={open}
        onClose={toggleLogoutDialog(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          <Typography variant="h4" sx={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600 }}>
            Confirm Logout
          </Typography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description" sx={{ fontFamily: "'Poppins', sans-serif" }}>
            Are you sure you want to logout?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={toggleLogoutDialog(false)} variant="outlined" sx={{ fontFamily: "'Poppins', sans-serif" }}>
            Cancel
          </Button>
          <Button onClick={handleConfirmLogout} color="error" variant="contained" autoFocus sx={{ fontFamily: "'Poppins', sans-serif" }}>
            Logout
          </Button>
        </DialogActions>
      </Dialog>
      <HelpPopper open={isHelpOpen} anchorEl={helpAnchorEl} onClose={handleHelpClose} />
    </>
  );
}

export default React.memo(RightSection);
