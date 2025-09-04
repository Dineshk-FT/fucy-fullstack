/*eslint-disable*/
import React from 'react';
import PropTypes from 'prop-types';
import { Grid, Paper, Typography, Box } from '@mui/material';
import { BarChart, PieChart } from '@mui/x-charts';
import { useTheme } from '@mui/material/styles';
import ColorTheme from '../../themes/ColorTheme';

const RisksContent = ({ impactDistribution, riskLevels, treatmentDistribution, impactRef }) => {
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

  const riskLevelsData = [
    { 
      id: 'high', 
      value: Math.max(0, riskLevels?.high || 0), 
      label: 'High', 
      color: colors.chartColors[1] || '#ff4d4f' 
    },
    { 
      id: 'medium', 
      value: Math.max(0, riskLevels?.medium || 0), 
      label: 'Medium', 
      color: colors.chartColors[2] || '#faad14' 
    },
    { 
      id: 'low', 
      value: Math.max(0, riskLevels?.low || 0), 
      label: 'Low', 
      color: colors.chartColors[3] || '#52c41a' 
    },
  ].filter(item => item.value > 0);

  const hasRiskData = riskLevelsData.length > 0;

  const riskPieData = {
    series: [
      {
        data: hasRiskData 
          ? riskLevelsData 
          : [{ id: 'no-data', value: 1, label: 'No Data', color: colors.chartColors[6] || '#d9d9d9' }],
      },
    ],
  };

  const treatmentTypes = [
    { 
      id: 'sharing', 
      value: treatmentDistribution?.sharing || 0, 
      label: 'Sharing the Risk', 
      color: colors.chartColors[0] 
    },
    { 
      id: 'retaining', 
      value: treatmentDistribution?.retaining || 0, 
      label: 'Retaining the Risk', 
      color: colors.chartColors[1] 
    },
    { 
      id: 'avoiding', 
      value: treatmentDistribution?.avoiding || 0, 
      label: 'Avoiding the Risk', 
      color: colors.chartColors[2] 
    },
    { 
      id: 'reducing', 
      value: treatmentDistribution?.reducing || 0, 
      label: 'Reducing the Risk', 
      color: colors.chartColors[3] 
    },
    { 
      id: 'notRated', 
      value: treatmentDistribution?.notRated || 0, 
      label: 'Not Rated', 
      color: colors.chartColors[4] 
    },
  ].filter(item => item.value > 0);

  const hasTreatmentData = treatmentTypes.length > 0;

  const treatmentPieData = {
    series: [
      {
        data: hasTreatmentData 
          ? treatmentTypes 
          : [{ 
              id: 'no-treatment-data', 
              value: 1, 
              label: 'No Treatment Data', 
              color: colors.chartColors[6] || '#d9d9d9' 
            }],
      },
    ],
  };

  return (
    <Grid container spacing={2} sx={{ mt: 1 }}>
      <Grid item xs={12} md={6}>
        <Paper elevation={1} sx={{ p: 1, borderRadius: 1, bgcolor: colors.paperBg }}>
          <Typography variant="subtitle2" sx={{ color: colors.title }}>
            Impact Distribution
          </Typography>
          <Box ref={impactRef} sx={{ height: 300, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {hasImpactData ? (
              <BarChart
                {...impactBarData}
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
                  ...impactBarData.xAxis[0],
                  label: 'Impact Categories',
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
                  No impact distribution data available
                </Typography>
              </Box>
            )}
          </Box>
        </Paper>
      </Grid>
      <Grid item xs={12} md={6}>
        <Paper elevation={1} sx={{ p: 1, borderRadius: 1, bgcolor: colors.paperBg }}>
          <Typography variant="subtitle2" sx={{ color: colors.title }}>
            Risk Levels Pie
          </Typography>
          <Box sx={{ height: 300, position: 'relative' }}>
            <Box sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'center',
              opacity: hasRiskData ? 1 : 0.4
            }}>
              <PieChart
                series={riskPieData.series}
                height={300}
                {...chartOptions}
                slotProps={{
                  ...chartOptions.slotProps,
                  legend: { 
                    hidden: true 
                  },
                  pie: {
                    ...chartOptions.slotProps?.pie,
                    onClick: (event, itemIdentifier, item) => {
                      if (item.id === 'no-data') return; // Prevent interaction with no-data slice
                    },
                  },
                }}
              />
            </Box>
            {!hasRiskData && (
              <Box sx={{ 
                position: 'absolute', 
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                p: 2,
              }}>
                <Typography variant="body2" color="textSecondary">
                  No risk level data available
                </Typography>
              </Box>
            )}
          </Box>
        </Paper>
      </Grid>
      <Grid item xs={12} md={6}>
        <Paper elevation={1} sx={{ p: 1, borderRadius: 1, bgcolor: colors.paperBg }}>
          <Typography variant="subtitle2" sx={{ color: colors.title }}>
            Threats Scenarios by Treatment
          </Typography>
          <Box sx={{ height: 300, position: 'relative' }}>
            <Box sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'center',
              opacity: hasTreatmentData ? 1 : 0.4
            }}>
              <PieChart
                series={treatmentPieData.series}
                height={300}
                {...chartOptions}
                slotProps={{
                  ...chartOptions.slotProps,
                  legend: { 
                    hidden: true,
                    labelStyle: {
                      fontSize: '0.7rem',
                    },
                  },
                  pie: {
                    ...chartOptions.slotProps?.pie,
                    onClick: (event, itemIdentifier, item) => {
                      if (item.id === 'no-treatment-data') return; // Prevent interaction with no-data slice
                    },
                  },
                }}
              />
            </Box>
            {!hasTreatmentData && (
              <Box sx={{ 
                position: 'absolute', 
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                p: 2,
              }}>
                <Typography variant="body2" color="textSecondary">
                  No treatment data available
                </Typography>
              </Box>
            )}
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};

RisksContent.propTypes = {
  impactDistribution: PropTypes.object.isRequired,
  riskLevels: PropTypes.object.isRequired,
  treatmentDistribution: PropTypes.object.isRequired,
  impactRef: PropTypes.object.isRequired
};

export default RisksContent;