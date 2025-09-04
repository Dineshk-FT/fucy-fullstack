/*eslint-disable*/
import React from 'react';
import PropTypes from 'prop-types';
import { Grid, Typography, Box, useMediaQuery } from '@mui/material';
import { BarChart, LineChart } from '@mui/x-charts';
import { useTheme, alpha } from '@mui/material/styles';
import ColorTheme from '../../themes/ColorTheme';
import EnhancedChartCard from './EnhancedChartCard';

const ThreatsContent = ({ threatTypes, timelineData, threatRef, timelineRef }) => {
  const theme = useTheme();
  const colors = ColorTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const chartOptions = {
    sx: {
      '& .MuiChartsAxis-tick': { 
        stroke: colors.chartText,
        '& text': {
          fill: colors.chartText,
          fontSize: isMobile ? '0.6rem' : '0.75rem',
        },
      },
      '& .MuiChartsAxis-line': { 
        stroke: colors.chartGrid,
        strokeWidth: 1,
      },
      '& .MuiChartsAxis-label': { 
        fill: colors.chartText,
        fontSize: isMobile ? '0.7rem' : '0.85rem',
      },
      '& .MuiChartsLegend-root': { 
        '& text': {
          fill: colors.chartText,
          fontSize: isMobile ? '0.65rem' : '0.75rem',
        },
      },
      '& .MuiBarElement-root, & .MuiLineElement-root': {
        strokeWidth: 2,
      },
      '& .MuiMarkElement-root': {
        fill: colors.chartColors[0],
        stroke: colors.paperBg,
        strokeWidth: 2,
      },
      backgroundColor: colors.chartBackground,
      borderRadius: 1,
    },
    slotProps: {
      legend: {
        direction: isMobile ? 'row' : 'column',
        position: { vertical: 'bottom', horizontal: 'middle' },
        itemMarkWidth: 10,
        itemMarkHeight: 10,
        markGap: 8,
        itemGap: isMobile ? 16 : 8,
        padding: { top: 20, bottom: 10, left: 10, right: 10 },
        labelStyle: { 
          fill: colors.chartText,
          fontSize: isMobile ? '0.7rem' : '0.75rem',
        },
      },
    },
    margin: { 
      top: 20, 
      right: 20, 
      bottom: isMobile ? 120 : 90,  // Increased bottom margin for legend
      left: 40,
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
    <Grid container spacing={2} sx={{ mt: 0.5 }}>
      <Grid item xs={12} md={6}>
        <EnhancedChartCard 
          title="Threat Types" 
          titleTooltip="Distribution of threat types"
          chartRef={threatRef}
          noData={!hasThreatData}
          noDataText="No threat type data available"
        >
          <BarChart
            {...threatBarData}
            height={300}
            {...chartOptions}
            yAxis={[{
              label: 'Count',
              labelStyle: { 
                fill: colors.chartText,
                fontSize: isMobile ? '0.7rem' : '0.75rem',
              },
              tickLabelStyle: {
                fill: colors.chartText,
                fontSize: isMobile ? '0.6rem' : '0.65rem',
              },
            }]}
            xAxis={[{
              ...threatBarData.xAxis[0],
              label: 'Threat Categories',
              labelStyle: { 
                fill: colors.chartText,
                fontSize: isMobile ? '0.7rem' : '0.75rem',
              },
              tickLabelStyle: {
                fill: colors.chartText,
                fontSize: isMobile ? '0.6rem' : '0.65rem',
              },
            }]}
            colors={[colors.chartColors[0]]}
          />
        </EnhancedChartCard>
      </Grid>
      <Grid item xs={12} md={6}>
        <EnhancedChartCard 
          title="Threat Timeline" 
          titleTooltip="Threat activity over time"
          chartRef={timelineRef}
          noData={!hasTimelineData}
          noDataText="No timeline data available"
        >
          <LineChart
            {...timelineData}
            height={300}
            {...chartOptions}
            yAxis={[{
              label: 'Count',
              labelStyle: { 
                fill: colors.chartText,
                fontSize: isMobile ? '0.7rem' : '0.75rem',
              },
              tickLabelStyle: {
                fill: colors.chartText,
                fontSize: isMobile ? '0.6rem' : '0.65rem',
              },
            }]}
            xAxis={[{
              ...timelineData.xAxis[0],
              label: 'Timeline',
              labelStyle: { 
                fill: colors.chartText,
                fontSize: isMobile ? '0.7rem' : '0.75rem',
              },
              tickLabelStyle: {
                fill: colors.chartText,
                fontSize: isMobile ? '0.6rem' : '0.65rem',
              },
            }]}
            colors={timelineData.series?.map((_, index) => 
              colors.chartColors[index % colors.chartColors.length]
            )}
          />
        </EnhancedChartCard>
      </Grid>
    </Grid>
  );
};

ThreatsContent.propTypes = {
  threatTypes: PropTypes.shape({
    derived: PropTypes.number,
    userDefined: PropTypes.number,
  }).isRequired,
  timelineData: PropTypes.shape({
    series: PropTypes.arrayOf(
      PropTypes.shape({
        data: PropTypes.arrayOf(PropTypes.number).isRequired,
        label: PropTypes.string,
      })
    ).isRequired,
    xAxis: PropTypes.arrayOf(
      PropTypes.shape({
        data: PropTypes.array,
        scaleType: PropTypes.string,
        valueFormatter: PropTypes.func,
      })
    ).isRequired,
  }).isRequired,
  threatRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.instanceOf(Element) })
  ]),
  timelineRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.instanceOf(Element) })
  ]),
};

ThreatsContent.defaultProps = {
  threatTypes: {
    derived: 0,
    userDefined: 0,
  },
  timelineData: {
    series: [],
    xAxis: [],
  },
  threatRef: null,
  timelineRef: null,
};

export default ThreatsContent;