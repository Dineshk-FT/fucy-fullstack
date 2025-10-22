import PropTypes from 'prop-types';
import { forwardRef } from 'react';

// material-ui
import { useTheme, alpha } from '@mui/material/styles';
import { Card, CardContent, CardHeader, Divider, Typography, Box, keyframes } from '@mui/material';

// animations
const pulse = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(25, 118, 210, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(25, 118, 210, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(25, 118, 210, 0);
  }
`;

// constants
const headerSX = (theme) => ({
  padding: theme.spacing(2, 2.5, 2, 2.5),
  '& .MuiCardHeader-action': { 
    margin: 0,
    alignSelf: 'center' 
  },
  '& .MuiCardHeader-title': {
    fontSize: '1.125rem',
    fontWeight: 600,
    color: theme.palette.mode === 'dark' ? theme.palette.grey[50] : theme.palette.grey[800],
    lineHeight: 1.5,
    letterSpacing: '0.02em'
  }
});

// ==============================|| CUSTOM MAIN CARD ||============================== //

const MainCard = forwardRef(
  (
    {
      border = true,
      boxShadow = true,
      children,
      content = true,
      contentClass = '',
      contentSX = {},
      darkTitle = false,
      secondary,
      sx = {},
      title,
      elevation = 0,
      hoverEffect = true,
      ...others
    },
    ref
  ) => {
    const theme = useTheme();
    const isLight = theme.palette.mode === 'light';

    return (
      <Card
        ref={ref}
        elevation={elevation}
        {...others}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          border: border ? '1px solid' : 'none',
          borderColor: isLight 
            ? alpha(theme.palette.grey[500], 0.12) 
            : alpha(theme.palette.grey[700], 0.48),
          borderRadius: 2,
          background: isLight 
            ? theme.palette.background.paper 
            : alpha(theme.palette.background.paper, 0.9),
          backdropFilter: 'blur(8px)',
          overflow: 'hidden',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          ...(boxShadow && {
            boxShadow: isLight 
              ? '0 2px 12px 0 rgba(0, 0, 0, 0.06)' 
              : '0 2px 16px 0 rgba(0, 0, 0, 0.24)'
          }),
          ...(hoverEffect && {
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: isLight 
                ? '0 8px 32px 0 rgba(0, 0, 0, 0.12)'
                : '0 8px 32px 0 rgba(0, 0, 0, 0.36)',
              '&:after': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 3,
                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                animation: `${pulse} 2s infinite`,
              }
            },
            '&:active': {
              transform: 'translateY(-1px)',
              boxShadow: isLight 
                ? '0 4px 16px 0 rgba(0, 0, 0, 0.08)'
                : '0 4px 20px 0 rgba(0, 0, 0, 0.24)'
            }
          }),
          '&.Mui-focusVisible': {
            outline: 'none',
            boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.5)}`
          },
          ...sx
        }}
      >
        {/* card header and action */}
        {title && (
          <>
            <CardHeader 
              sx={headerSX(theme)} 
              title={
                darkTitle ? (
                  <Typography variant="h3" sx={{ 
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    display: 'inline-block'
                  }}>
                    {title}
                  </Typography>
                ) : (
                  title
                )
              } 
              action={secondary} 
            />
            <Divider sx={{ m: '0 !important' }} />
          </>
        )}

        {/* card content */}
        {content ? (
          <CardContent 
            sx={{
              p: 3,
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              '&:last-child': { pb: 3 },
              ...contentSX
            }} 
            className={contentClass}
          >
            {children}
          </CardContent>
        ) : (
          <Box sx={{ p: 0 }}>{children}</Box>
        )}
      </Card>
    );
  }
);

MainCard.propTypes = {
  /**
   * Show border around the card
   */
  border: PropTypes.bool,
  /**
   * Enable box shadow
   */
  boxShadow: PropTypes.bool,
  /**
   * Card content
   */
  children: PropTypes.node,
  /**
   * Show content padding
   */
  content: PropTypes.bool,
  /**
   * Additional class name for content
   */
  contentClass: PropTypes.string,
  /**
   * Additional styles for content
   */
  contentSX: PropTypes.object,
  /**
   * Use dark title style with gradient
   */
  darkTitle: PropTypes.bool,
  /**
   * Enable hover effect
   */
  hoverEffect: PropTypes.bool,
  /**
   * Card elevation (0-24)
   */
  elevation: PropTypes.number,
  /**
   * Header action component
   */
  secondary: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.string,
    PropTypes.object
  ]),
  /**
   * Custom shadow style
   */
  shadow: PropTypes.string,
  /**
   * Additional styles
   */
  sx: PropTypes.object,
  /**
   * Card title
   */
  title: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.string,
    PropTypes.object
  ])
};

export default MainCard;
