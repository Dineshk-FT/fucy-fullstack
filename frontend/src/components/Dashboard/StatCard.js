import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Fade, Paper, Box, Typography, CircularProgress } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import ColorTheme from '../../themes/ColorTheme';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

const StatCard = ({ title, value, color, icon: Icon, loading = false, trend, trendValue }) => {
  const theme = useTheme();
  const colors = ColorTheme();
  const [elevation, setElevation] = useState(1);
  const [isHovered, setIsHovered] = useState(false);
  const cardColor = color || theme.palette.primary.main;

  const getTrendStyles = () => {
    if (!trend) return null;
    const isPositive = trend === 'up';
    return {
      display: 'flex',
      alignItems: 'center',
      mt: 0.2,
      color: isPositive ? theme.palette.success.main : theme.palette.error.main,
      '& svg': {
        fontSize: '0.8rem',
        ml: 0.2,
      },
    };
  };

  return (
    <Fade in={!loading} timeout={400}>
      <Paper
        elevation={elevation}
        onMouseEnter={() => {
          setElevation(4);
          setIsHovered(true);
        }}
        onMouseLeave={() => {
          setElevation(1);
          setIsHovered(false);
        }}
        sx={{
          p: 1,
          minHeight: 70,
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 2,
          bgcolor: colors.paperBg || 'background.paper',
          border: `1px solid ${alpha(colors.borderColor || theme.palette.divider, 0.15)}`,
          minWidth: 100,
          transition: theme.transitions.create(
            ['transform', 'box-shadow', 'border-color'],
            {
              duration: theme.transitions.duration.short,
              easing: theme.transitions.easing.easeOut,
            }
          ),
          '&:hover': {
            transform: 'translateY(-3px)',
            boxShadow: `0 6px 12px ${alpha(cardColor, 0.15)}`,
            borderColor: alpha(cardColor, 0.5),
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 2,
            background: `linear-gradient(90deg, ${cardColor} 0%, ${alpha(cardColor, 0.6)} 100%)`,
            opacity: 0.9,
            transition: 'height 0.2s ease-in-out, opacity 0.2s ease-in-out',
          },
          '&:hover::before': {
            height: 3,
            opacity: 1,
          },
        }}
      >
        {loading ? (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            minHeight: 70,
            p: 0.5,
            gap: 0.3
          }}>
            <CircularProgress 
              size={20} 
              thickness={4} 
              sx={{ 
                color: alpha(cardColor, 0.7),
                mb: 0.3,
                '& .MuiCircularProgress-circle': {
                  strokeLinecap: 'round',
                },
              }} 
            />
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'text.secondary',
                fontSize: '0.6rem',
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.3px',
                opacity: 0.7
              }}
            >
              Loading
            </Typography>
          </Box>
        ) : (
          <Box sx={{ width: '100%' }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 0.5,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: theme.palette.text.secondary,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.3px',
                  fontSize: '0.6rem',
                  opacity: 0.85,
                }}
              >
                {title}
              </Typography>
              {Icon && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    bgcolor: alpha(cardColor, 0.15),
                    '& svg': {
                      color: cardColor,
                      fontSize: 14,
                      transition: theme.transitions.create('transform', {
                        duration: theme.transitions.duration.short,
                      }),
                    },
                  }}
                >
                  <Icon />
                </Box>
              )}
            </Box>
            
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                fontSize: '1.2rem',
                lineHeight: 1.1,
                mb: 0.3,
                background: `linear-gradient(135deg, ${cardColor} 0%, ${alpha(cardColor, 0.9)} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                transition: 'all 0.2s ease-in-out',
                transform: isHovered ? 'scale(1.03)' : 'scale(1)',
              }}
            >
              {value}
            </Typography>
            
            {trend && (
              <Box sx={getTrendStyles()}>
                {trend === 'up' ? (
                  <TrendingUpIcon fontSize="inherit" />
                ) : (
                  <TrendingDownIcon fontSize="inherit" />
                )}
                <Typography variant="caption" sx={{ ml: 0.2, fontWeight: 600, fontSize: '0.55rem' }}>
                  {trendValue}%
                </Typography>
              </Box>
            )}
            
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: 1,
                background: `linear-gradient(90deg, ${cardColor} 0%, ${alpha(cardColor, 0.2)} 100%)`,
                opacity: isHovered ? 0.9 : 0.5,
                transition: 'opacity 0.2s ease-in-out',
              }}
            />
          </Box>
        )}
      </Paper>
    </Fade>
  );
};

StatCard.defaultProps = {
  loading: false,
  trend: null,
  trendValue: null,
  color: null,
  icon: null
};

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  color: PropTypes.string,
  icon: PropTypes.elementType,
  loading: PropTypes.bool,
  trend: PropTypes.oneOf(['up', 'down']),
  trendValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};

export default StatCard;