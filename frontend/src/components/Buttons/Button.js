/*eslint-disable*/
import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { Button as MuiButton, CircularProgress, Box, Tooltip, Fade } from '@mui/material';
import { styled, keyframes, alpha } from '@mui/material/styles';

// Animation for the ripple effect
const ripple = keyframes`
  0% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  100% {
    transform: scale(4);
    opacity: 0;
  }
`;

// Styled button with custom animations and states
const StyledButton = styled(MuiButton, {
  shouldForwardProp: (prop) => !['isLoading', 'fullWidth', 'pulse', 'shrinkOnClick'].includes(prop),
})(({ theme, variant, color = 'primary', size = 'medium', isLoading, pulse, shrinkOnClick }) => {
  const isLight = theme.palette.mode === 'light';
  const colors = {
    primary: theme.palette.primary,
    secondary: theme.palette.secondary,
    success: theme.palette.success,
    error: theme.palette.error,
    warning: theme.palette.warning,
    info: theme.palette.info,
  }[color] || theme.palette.primary;

  const getBackgroundColor = (opacity = 1) => {
    if (variant === 'contained') return colors.main;
    if (variant === 'outlined' || variant === 'text') return 'transparent';
    return colors.main;
  };

  const getTextColor = () => {
    if (variant === 'contained') return colors.contrastText;
    return colors.main;
  };

  const getHoverBackground = () => {
    if (variant === 'contained') return colors.dark;
    return theme.palette.action.hover;
  };

  const getBorder = () => {
    if (variant === 'outlined') return `1px solid ${colors.main}`;
    return 'none';
  };

  const getPadding = () => {
    switch (size) {
      case 'small': return '4px 12px';
      case 'large': return '10px 22px';
      default: return '8px 16px';
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'small': return '0.8125rem';
      case 'large': return '1rem';
      default: return '0.9375rem';
    }
  };

  return {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 8,
    padding: getPadding(),
    minWidth: size === 'small' ? 64 : 100,
    height: size === 'small' ? 32 : size === 'large' ? 48 : 40,
    fontSize: getFontSize(),
    fontWeight: 600,
    textTransform: 'none',
    letterSpacing: '0.02em',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: variant === 'contained' ? 
      `0 2px 4px ${alpha(colors.main, 0.2)}` : 'none',
    color: getTextColor(),
    backgroundColor: getBackgroundColor(),
    border: getBorder(),
    '&:hover': {
      backgroundColor: getHoverBackground(),
      boxShadow: variant === 'contained' ? 
        `0 4px 12px ${alpha(colors.main, 0.3)}` : 'none',
      transform: 'translateY(-1px)',
    },
    '&:active': {
      transform: shrinkOnClick ? 'scale(0.98)' : 'translateY(0)',
      boxShadow: variant === 'contained' ? 
        `0 2px 8px ${alpha(colors.main, 0.2)}` : 'none',
    },
    '&:disabled': {
      backgroundColor: theme.palette.action.disabledBackground,
      color: theme.palette.text.disabled,
      border: 'none',
      boxShadow: 'none',
    },
    '& .MuiTouchRipple-root': {
      '& .MuiTouchRipple-ripple': {
        backgroundColor: variant === 'contained' ? 
          alpha(colors.contrastText, 0.3) : 
          alpha(colors.main, 0.2),
      },
    },
    ...(pulse && !isLoading && {
      position: 'relative',
      '&:after': {
        content: '""',
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: '100%',
        height: '100%',
        background: `radial-gradient(circle, ${alpha(colors.main, 0.4)} 0%, transparent 70%)`,
        transform: 'translate(-50%, -50%) scale(1)',
        borderRadius: '50%',
        animation: `${ripple} 2s infinite`,
        pointerEvents: 'none',
      },
    }),
    ...(isLoading && {
      '& .MuiButton-startIcon, & .MuiButton-endIcon': {
        opacity: 0,
      },
    }),
  };
});

// Loading spinner component
const LoadingSpinner = styled(CircularProgress)(({ size, color }) => ({
  position: 'absolute',
  left: '50%',
  top: '50%',
  marginTop: -10,
  marginLeft: -10,
  color: color === 'inherit' ? 'currentColor' : undefined,
  width: size === 'small' ? 16 : 20,
  height: size === 'small' ? 16 : 20,
}));

/**
 * Enhanced Button component with loading states, tooltips, and animations
 */
const Button = forwardRef(({
  children,
  loading = false,
  tooltip = '',
  startIcon: StartIcon,
  endIcon: EndIcon,
  icon,
  pulse = false,
  shrinkOnClick = true,
  disabled,
  ...props
}, ref) => {
  const { size = 'medium', variant = 'contained', color = 'primary' } = props;
  const isIconOnly = !children && (!!icon || (!!StartIcon && !EndIcon && !children) || (!!EndIcon && !StartIcon && !children));
  const iconNode = icon || StartIcon || EndIcon;
  const iconProps = {
    startIcon: StartIcon && !isIconOnly ? StartIcon : undefined,
    endIcon: EndIcon && !isIconOnly ? EndIcon : undefined,
  };

  const buttonContent = (
    <StyledButton
      ref={ref}
      {...props}
      {...iconProps}
      disabled={disabled || loading}
      isLoading={loading}
      pulse={pulse && !loading}
      shrinkOnClick={shrinkOnClick}
      sx={{
        ...(isIconOnly && {
          minWidth: size === 'small' ? 32 : size === 'large' ? 56 : 40,
          width: size === 'small' ? 32 : size === 'large' ? 56 : 40,
          padding: 0,
          '& .MuiButton-startIcon, & .MuiButton-endIcon': {
            margin: 0,
          },
        }),
        ...props.sx,
      }}
    >
      <Fade in={!loading} unmountOnExit>
        <Box
          component="span"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            opacity: loading ? 0 : 1,
            transition: 'opacity 0.2s',
            ...(isIconOnly && {
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
              height: '100%',
            }),
          }}
        >
          {children}
        </Box>
      </Fade>
      {loading && (
        <LoadingSpinner 
          size={size} 
          color={variant === 'contained' && color !== 'inherit' ? 'inherit' : color}
        />
      )}
    </StyledButton>
  );

  return tooltip ? (
    <Tooltip title={tooltip} arrow>
      <span>{buttonContent}</span>
    </Tooltip>
  ) : (
    buttonContent
  );
});

Button.propTypes = {
  /**
   * The content of the button
   */
  children: PropTypes.node,
  /**
   * If `true`, the button will show a loading indicator
   */
  loading: PropTypes.bool,
  /**
   * Tooltip text to display on hover
   */
  tooltip: PropTypes.string,
  /**
   * Element placed before the children
   */
  startIcon: PropTypes.elementType,
  /**
   * Element placed after the children
   */
  endIcon: PropTypes.elementType,
  /**
   * Icon to display when there's no text content
   */
  icon: PropTypes.elementType,
  /**
   * If `true`, adds a pulsing animation to the button
   */
  pulse: PropTypes.bool,
  /**
   * If `true`, the button will shrink slightly when clicked
   */
  shrinkOnClick: PropTypes.bool,
  /**
   * The variant to use
   * @default 'contained'
   */
  variant: PropTypes.oneOf(['contained', 'outlined', 'text']),
  /**
   * The color of the component
   * @default 'primary'
   */
  color: PropTypes.oneOf([
    'primary',
    'secondary',
    'success',
    'error',
    'warning',
    'info',
    'inherit'
  ]),
  /**
   * The size of the component
   * @default 'medium'
   */
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  /**
   * If `true`, the button will take up the full width of its container
   */
  fullWidth: PropTypes.bool,
  /**
   * If `true`, the button will be disabled
   */
  disabled: PropTypes.bool,
  /**
   * Override or extend the styles applied to the component
   */
  sx: PropTypes.object,
};

export default Button;
