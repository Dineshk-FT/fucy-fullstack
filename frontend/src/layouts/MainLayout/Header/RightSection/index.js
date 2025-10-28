/*eslint-disable*/
import React, { useCallback, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  LightMode as LightModeIcon,
  NightsStay as NightsStayIcon,
  PowerSettingsNew as PowerSettingsNewIcon,
  Key as KeyIcon,
  Logout as LogoutIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import { useDispatch, useSelector } from 'react-redux';
import { changeMode, navbarSlide } from '../../../../store/slices/CurrentIdSlice';
import { logout } from '../../../../store/slices/UserDetailsSlice';
import { useNavigate } from 'react-router';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import HelpPopper from '../../../../components/Poppers/HelpPopper';
import pdfFile from '../../../../assets/PDF/FucyTech-Doc.pdf';
import ResetPassword from '../../../../Website/pages/authentication/auth-forms/ResetPassword';

function RightSection() {
  const [openLogoutDialog, setOpenLogoutDialog] = useState(false);
  const [openResetPasswordDialog, setOpenResetPasswordDialog] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [helpAnchorEl, setHelpAnchorEl] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isDark, isNavbarClose } = useSelector((state) => state?.currentId);

  const handleMenuClick = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleHelpClick = (event) => {
    setHelpAnchorEl((prev) => (prev ? null : event.currentTarget));
  };

  const handleHelpClose = () => {
    setHelpAnchorEl(null);
  };

  const handleDocumentationClick = useCallback(() => {
    window.open(pdfFile, '_blank', 'noopener,noreferrer');
  }, []);

  const isHelpOpen = Boolean(helpAnchorEl);
  const isMenuOpen = Boolean(menuAnchorEl);

  const handleChangeMode = useCallback(
    (e) => {
      e.stopPropagation();
      dispatch(changeMode());
    },
    [dispatch]
  );

  const handleResetPasswordClick = () => {
    handleMenuClose();
    setOpenResetPasswordDialog(true);
  };

  const handleLogoutClick = () => {
    handleMenuClose();
    setOpenLogoutDialog(true);
  };

  const handleConfirmLogout = useCallback(() => {
    dispatch(logout());
    setOpenLogoutDialog(false);
    navigate('/login');
  }, [dispatch, navigate]);

  const handleResetPasswordClose = () => {
    setOpenResetPasswordDialog(false);
  };

  const toggleNavbar = useCallback(
    (e) => {
      e.stopPropagation();
      dispatch(navbarSlide());
    },
    [dispatch]
  );

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

        {/* Menu Button */}
        <IconButton
          onClick={handleMenuClick}
          sx={{
            ...iconButtonStyles,
            '&:hover': {
              ...iconButtonStyles['&:hover'],
              transform: 'scale(1.1)'
            }
          }}
        >
          <MoreVertIcon sx={{ color: iconColor, fontSize: 20 }} />
        </IconButton>
      </Box>

      {/* Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={isMenuOpen}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 3,
          sx: {
            mt: 1.5,
            minWidth: 180,
            borderRadius: '8px',
            background: isDark ? 'linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%)' : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)'
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleResetPasswordClick}>
          <ListItemIcon>
            <KeyIcon fontSize="small" sx={{ color: iconColor }} />
          </ListItemIcon>
          <ListItemText>
            <Typography variant="body2" sx={{ fontFamily: "'Poppins', sans-serif" }}>
              Reset Password
            </Typography>
          </ListItemText>
        </MenuItem>

        <Divider sx={{ my: 0.5, opacity: 0.5 }} />

        <MenuItem onClick={handleLogoutClick}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" sx={{ color: '#f44336' }} />
          </ListItemIcon>
          <ListItemText>
            <Typography variant="body2" sx={{ fontFamily: "'Poppins', sans-serif", color: '#f44336' }}>
              Logout
            </Typography>
          </ListItemText>
        </MenuItem>
      </Menu>

      {/* Logout Confirmation Dialog */}
      <Dialog
        open={openLogoutDialog}
        onClose={() => setOpenLogoutDialog(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          <Typography variant="h6" sx={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600 }}>
            Confirm Logout
          </Typography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description" sx={{ fontFamily: "'Poppins', sans-serif" }}>
            Are you sure you want to logout?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenLogoutDialog(false)} variant="outlined" sx={{ fontFamily: "'Poppins', sans-serif" }}>
            Cancel
          </Button>
          <Button onClick={handleConfirmLogout} color="error" variant="contained" autoFocus sx={{ fontFamily: "'Poppins', sans-serif" }}>
            Logout
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog
        open={openResetPasswordDialog}
        onClose={handleResetPasswordClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '12px'
          }
        }}
      >
        <DialogTitle sx={{ pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" color="primary" sx={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600 }}>
            Reset Password
          </Typography>
          <IconButton
            onClick={handleResetPasswordClose}
            sx={{
              color: 'text.secondary',
              '&:hover': {
                color: 'error.main',
                backgroundColor: 'rgba(244, 67, 54, 0.04)'
              }
            }}
          >
            <HighlightOffIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <ResetPassword onClose={handleResetPasswordClose} />
        </DialogContent>
      </Dialog>

      <HelpPopper open={isHelpOpen} anchorEl={helpAnchorEl} onClose={handleHelpClose} onDocumentationClick={handleDocumentationClick} />
    </>
  );
}

export default React.memo(RightSection);
