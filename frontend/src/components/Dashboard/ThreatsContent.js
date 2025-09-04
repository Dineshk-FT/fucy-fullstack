/*eslint-disable*/
import React from 'react';
import PropTypes from 'prop-types';
import { Grid, Paper, Typography, Box } from '@mui/material';
import { BarChart, LineChart } from '@mui/x-charts';
import { useTheme } from '@mui/material/styles';
import ColorTheme from '../../themes/ColorTheme';

const ThreatsContent = ({ threatTypes, timelineData, threatRef }) => {
  const theme = useTheme();
  const colors = ColorTheme();

  const chartOptions = {
    sx: {
      '.MuiChartsAxis-tick': { stroke: colors.chartText },
      '.MuiChartsAxis-line': { stroke: colors.chartGrid },
      '.MuiChartsAxis-label': { fill: colors.chartText },
      '.MuiChartsLegend-root': { fill: colors.chartText },
      backgroundColor: colors.chartBackground,
    },
    slotProps: {
      legend: {
        labelStyle: { fill: colors.chartText },
      },
    },
  };

  const threatCategories = [
    { key: 'derived', label: 'Derived' },
    { key: 'userDefined', label: 'User-Defined' },
  ];

  const hasThreatData = threatCategories.some(
    ({ key }) => threatTypes?.[key] > 0
  );

  const threatBarData = {
    series: [
      {
        data: threatCategories.map(({ key }) => threatTypes?.[key] || 0),
        label: 'Counts',
        color: colors.chartColors[0],
      },
    ],
    xAxis: [
      { 
        scaleType: 'band', 
        data: threatCategories.map(({ label }) => label),
      },
    ],
  };

  const hasTimelineData = timelineData?.series?.[0]?.data?.some((v) => v > 0) || false;

  return (
    <Grid container spacing={2} sx={{ mt: 1 }}>
      <Grid item xs={12} md={6}>
        <Paper elevation={1} sx={{ p: 1, borderRadius: 1, bgcolor: colors.paperBg }}>
          <Typography variant="subtitle2" sx={{ color: colors.title, mb: 1 }}>
            Threat Types
          </Typography>
          <Box ref={threatRef} sx={{ height: 300, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {hasThreatData ? (
              <BarChart
                {...threatBarData}
                height={300}
                margin={{ top: 20, right: 30, left: 40, bottom: 70 }}
                {...chartOptions}
                yAxis={[{
                  label: 'Count',
                  labelStyle: { 
                    fill: colors.chartText,
                    fontSize: '0.75rem',
                  },
                  tickLabelStyle: {
                    fill: colors.chartText,
                    fontSize: '0.7rem',
                  },
                }]}
                xAxis={[{
                  ...threatBarData.xAxis[0],
                  label: 'Threat Categories',
                  labelStyle: { 
                    fill: colors.chartText,
                    fontSize: '0.75rem',
                  },
                  tickLabelStyle: {
                    fill: colors.chartText,
                    fontSize: '0.7rem',
                  },
                }]}
              />
            ) : (
              <Box sx={{ textAlign: 'center', p: 3 }}>
                <Typography variant="body2" color="textSecondary">
                  No threat type data available
                </Typography>
              </Box>
            )}
          </Box>
        </Paper>
      </Grid>
      <Grid item xs={12} md={6}>
        <Paper elevation={1} sx={{ p: 1, borderRadius: 1, bgcolor: colors.paperBg }}>
          <Typography variant="subtitle2" sx={{ color: colors.title, mb: 1 }}>
            Threats Timeline
          </Typography>
          <Box sx={{ height: 300, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {hasTimelineData ? (
              <LineChart
                {...timelineData}
                height={300}
                margin={{ top: 20, right: 30, left: 40, bottom: 70 }}
                {...chartOptions}
                yAxis={[{
                  label: 'Count',
                  labelStyle: { 
                    fill: colors.chartText,
                    fontSize: '0.75rem',
                  },
                  tickLabelStyle: {
                    fill: colors.chartText,
                    fontSize: '0.7rem',
                  },
                }]}
                xAxis={[{
                  ...timelineData.xAxis?.[0],
                  label: 'Timeline',
                  labelStyle: { 
                    fill: colors.chartText,
                    fontSize: '0.75rem',
                  },
                  tickLabelStyle: {
                    fill: colors.chartText,
                    fontSize: '0.7rem',
                  },
                }]}
              />
            ) : (
              <Box sx={{ textAlign: 'center', p: 3 }}>
                <Typography variant="body2" color="textSecondary">
                  No timeline data available
                </Typography>
              </Box>
            )}
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};

ThreatsContent.propTypes = {
  threatTypes: PropTypes.object.isRequired,
  timelineData: PropTypes.object.isRequired,
  threatRef: PropTypes.object.isRequired
};

export default ThreatsContent;