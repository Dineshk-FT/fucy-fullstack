/*eslint-disable*/
import React from 'react';
import PropTypes from 'prop-types';
import { Grid, Typography, Box, useMediaQuery } from '@mui/material';
import { BarChart, LineChart, ScatterChart } from '@mui/x-charts';
import { useTheme, alpha } from '@mui/material/styles';
import ColorTheme from '../../themes/ColorTheme';
import EnhancedChartCard from './EnhancedChartCard';

const ThreatsContent = ({ 
  threatTypes, 
  timelineData, 
  threatRef, 
  timelineRef,
  threats = [],
  impactDistribution = { safety: 0, financial: 0, operational: 0, privacy: 0 }
}) => {
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

  // Impact Distribution Data
  const impactCategories = [
    { key: 'safety', label: 'Safety' },
    { key: 'financial', label: 'Financial' },
    { key: 'operational', label: 'Operational' },
    { key: 'privacy', label: 'Privacy' },
  ];

  const hasImpactData = impactCategories.some(
    ({ key }) => impactDistribution?.[key] > 0
  );

  const impactBarData = {
    series: [
      {
        data: impactCategories.map(({ key }) => impactDistribution?.[key] || 0),
        label: 'Impact Scores',
        color: colors.chartColors[0],
      },
    ],
    xAxis: [
      {
        scaleType: 'band',
        data: impactCategories.map(({ label }) => label),
      },
    ],
  };

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
      {/* Impact Distribution Chart */}
      <Grid item xs={12} md={6} ref={threatRef}>
        <EnhancedChartCard
          title="Impact Distribution"
          subtitle="Distribution of impact scores across different categories"
          chartContainerStyle={{
            height: 300,
            width: '100%',
            position: 'relative',
          }}
        >
          {hasImpactData ? (
            <BarChart
              {...chartOptions}
              series={impactBarData.series}
              xAxis={impactBarData.xAxis}
              yAxis={[
                {
                  scaleType: 'linear',
                  min: 0,
                  max: Math.max(...impactCategories.map(cat => impactDistribution[cat.key] || 0)) * 1.2 || 10,
                  label: 'Impact Score',
                },
              ]}
            />
          ) : (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              height={300}
              color="text.secondary"
            >
              No impact distribution data available
            </Box>
          )}
        </EnhancedChartCard>
      </Grid>
      {/* Threat Types Bar Chart */}
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
      <Grid item xs={12} md={6}>
        <EnhancedChartCard
          title="Threat Impact vs. Likelihood"
          tooltip="Visualizes the relationship between threat impact and likelihood"
        >
          <Box sx={{ width: '100%', height: 300 }}>
            {threats.length > 0 ? (
              <ScatterChart
                series={[
                  {
                    label: 'Threats',
                    data: threats
                      .filter(threat => {
                        const hasImpact = threat?.impact && getImpactValue(threat.impact) > 0;
                        const hasLikelihood = threat?.likelihood && getLikelihoodValue(threat.likelihood) > 0;
                        return hasImpact && hasLikelihood;
                      })
                      .map(threat => {
                        const impact = getImpactValue(threat.impact);
                        const likelihood = getLikelihoodValue(threat.likelihood);
                        return {
                          x: impact,
                          y: likelihood,
                          id: threat.id || Math.random().toString(36).substr(2, 9),
                          name: threat.name || `Threat ${threat.id || ''}`.trim(),
                          size: 8 + (impact * 2), // Larger dots for higher impact
                        };
                      }),
                    color: theme.palette.primary.main,
                    markerSize: (params) => params.size || 8,
                  },
                ]}
                xAxis={[
                  {
                    label: 'Impact',
                    valueFormatter: (value) => {
                      const levels = ['Low', 'Medium', 'High', 'Critical'];
                      const index = Math.min(3, Math.max(0, Math.round(value) - 1));
                      return levels[index] || '';
                    },
                    min: 1,
                    max: 4,
                    tickMinStep: 1,
                    tickLabelStyle: {
                      fontSize: isMobile ? '0.7rem' : '0.8rem',
                      fill: theme.palette.text.primary,
                    },
                    labelStyle: {
                      fontSize: isMobile ? '0.8rem' : '0.9rem',
                      fill: theme.palette.text.primary,
                    },
                  }
                ]}
                yAxis={[
                  {
                    label: 'Likelihood',
                    valueFormatter: (value) => {
                      const levels = ['Rare', 'Unlikely', 'Possible', 'Likely', 'Certain'];
                      const index = Math.min(4, Math.max(0, Math.round(value) - 1));
                      return levels[index] || '';
                    },
                    min: 1,
                    max: 5,
                    tickMinStep: 1,
                    tickLabelStyle: {
                      fontSize: isMobile ? '0.7rem' : '0.8rem',
                      fill: theme.palette.text.primary,
                    },
                    labelStyle: {
                      fontSize: isMobile ? '0.8rem' : '0.9rem',
                      fill: theme.palette.text.primary,
                    },
                  }
                ]}
                tooltip={{
                  itemContent: (params) => {
                    const dataPoint = params.series?.data?.[params.dataIndex];
                    if (!dataPoint) return null;
                    
                    const { name, x, y } = dataPoint;
                    const impactLevels = ['Low', 'Medium', 'High', 'Critical'];
                    const likelihoodLevels = ['Rare', 'Unlikely', 'Possible', 'Likely', 'Certain'];
                    
                    const impactText = x >= 1 && x <= 4 ? impactLevels[Math.round(x) - 1] : 'Unknown';
                    const likelihoodText = y >= 1 && y <= 5 ? likelihoodLevels[Math.round(y) - 1] : 'Unknown';
                    
                    return (
                      <Box sx={{ p: 1 }}>
                        <Typography variant="subtitle2">{name || 'Unnamed Threat'}</Typography>
                        <Box sx={{ mt: 0.5 }}>
                          <Box>Impact: <strong>{impactText}</strong></Box>
                          <Box>Likelihood: <strong>{likelihoodText}</strong></Box>
                        </Box>
                      </Box>
                    );
                  },
                }}
                {...chartOptions}
              />
            ) : (
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                height: '100%',
                color: 'text.secondary'
              }}>
                No threat data available
              </Box>
            )}
          </Box>
        </EnhancedChartCard>
      </Grid>
    </Grid>
  );
};

ThreatsContent.propTypes = {
  impactDistribution: PropTypes.shape({
    safety: PropTypes.number,
    financial: PropTypes.number,
    operational: PropTypes.number,
    privacy: PropTypes.number,
  }),
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

// Helper functions for the scatter plot
const getImpactValue = (impact) => {
  if (!impact) return 0;
  const impactStr = String(impact).toLowerCase().trim();
  const impactMap = {
    'low': 1,
    'medium': 2,
    'high': 3,
    'critical': 4,
    '1': 1,
    '2': 2,
    '3': 3,
    '4': 4
  };
  return impactMap[impactStr] || 0;
};

const getLikelihoodValue = (likelihood) => {
  if (!likelihood) return 0;
  const likelihoodStr = String(likelihood).toLowerCase().trim();
  const likelihoodMap = {
    'rare': 1,
    'unlikely': 2,
    'possible': 3,
    'likely': 4,
    'certain': 5,
    '1': 1,
    '2': 2,
    '3': 3,
    '4': 4,
    '5': 5
  };
  return likelihoodMap[likelihoodStr] || 0;
};

ThreatsContent.defaultProps = {
  impactDistribution: {
    safety: 0,
    financial: 0,
    operational: 0,
    privacy: 0,
  },
  threatTypes: {
    derived: 0,
    userDefined: 0,
  },
  threats: [],
  timelineData: {
    series: [],
    xAxis: [],
  },
  threatRef: null,
  timelineRef: null,
};

export default ThreatsContent;