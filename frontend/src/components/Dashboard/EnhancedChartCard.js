import React from 'react';
import PropTypes from 'prop-types';
import { Paper, Box, Typography, CircularProgress, Fade } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import ColorTheme from '../../themes/ColorTheme'; 

const EnhancedChartCard = ({
  title,
  children,
  loading = false,
  height = 400,
  icon: Icon,
  sx = {}
}) => {
  const theme = useTheme();
  const colors = ColorTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        bgcolor: colors.paperBg || 'background.paper',
        border: `1px solid ${alpha(colors.borderColor || theme.palette.divider, 0.1)}`,
        transition: theme.transitions.create(['box-shadow', 'transform', 'border-color'], {
          duration: theme.transitions.duration.standard,
        }),
        '&:hover': {
          boxShadow: theme.shadows[8],
          transform: 'translateY(-2px)',
          borderColor: alpha(colors.primary || theme.palette.primary.main, 0.3),
        },
        ...sx,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        {Icon && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: '50%',
              bgcolor: alpha(colors.primary || theme.palette.primary.main, 0.1),
              mr: 1.5,
              '& svg': {
                color: colors.primary || theme.palette.primary.main,
                fontSize: 20,
              },
            }}
          >
            <Icon />
          </Box>
        )}
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 600,
            color: colors.textPrimary,
            flexGrow: 1,
          }}
        >


          {title}
        </Typography>
      </Box>
      <Box
        sx={{
          flexGrow: 1,
          position: 'relative',
          minHeight: height,
          '& .MuiChartsAxis-tickContainer .MuiChartsAxis-tickLabel': {
            fill: `${colors.textSecondary} !important`,
            fontSize: '0.7rem',
          },
          '& .MuiChartsAxis-line': {
            stroke: `${alpha(colors.borderColor || theme.palette.divider, 0.5)} !important`,
          },
          '& .MuiChartsAxis-tick': {
            stroke: `${alpha(colors.borderColor || theme.palette.divider, 0.3)} !important`,
          },
          '& .MuiChartsGrid-line': {
            stroke: `${alpha(colors.borderColor || theme.palette.divider, 0.1)} !important`,
            strokeDasharray: '3 3',
          },
        }}
      >
        {loading ? (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'background.paper',
              borderRadius: 2,
            }}
          >
            <CircularProgress size={40} thickness={2} />
          </Box>
        ) : (
          <Fade in={!loading} timeout={500}>
            <Box sx={{ width: '100%', height: '100%' }}>
              {children}
            </Box>
          </Fade>
        )}
      </Box>
    </Paper>
  );
};

EnhancedChartCard.defaultProps = {
  loading: false,
  height: 400,
  icon: null,
  sx: {}
};

EnhancedChartCard.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  loading: PropTypes.bool,
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  icon: PropTypes.elementType,
  sx: PropTypes.object
};

export default EnhancedChartCard;