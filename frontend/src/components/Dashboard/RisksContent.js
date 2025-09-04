/*eslint-disable*/
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Grid, Paper, Typography, Box, useMediaQuery, Button } from '@mui/material';
import { BarChart, PieChart, pieArcClasses, pieArcLabelClasses } from '@mui/x-charts';
import { useTheme, alpha } from '@mui/material/styles';
import ColorTheme from '../../themes/ColorTheme';
import EnhancedChartCard from './EnhancedChartCard';
import RiskHeatMap from './RiskHeatMap';
import ViewListIcon from '@mui/icons-material/ViewList';
import GridViewIcon from '@mui/icons-material/GridView';

const RisksContent = ({ 
  impactDistribution, 
  riskLevels, 
  treatmentDistribution, 
  impactRef, 
  components = [],
  risks = [] 
}) => {
  const theme = useTheme();
  const colors = ColorTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [viewMode, setViewMode] = useState('grid');

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
      '& .MuiBarElement-root': {
        rx: 4,
        ry: 4,
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

  const treatmentBarData = {
    series: [
      {
        data: treatmentTypes.map(type => type.value),
        label: 'Count',
      },
    ],
    xAxis: [
      {
        scaleType: 'band',
        data: treatmentTypes.map(type => type.label),
      },
    ],
  };

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
    <Grid container spacing={2} sx={{ mt: 0.5 }}>
      <Grid item xs={12}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="h2">Risk Analysis</Typography>
          <Box>
            <Button 
              size="small" 
              variant={viewMode === 'grid' ? 'contained' : 'outlined'} 
              onClick={() => setViewMode('grid')}
              sx={{ mr: 1, minWidth: 'auto', p: 1 }}
            >
              <GridViewIcon fontSize="small" />
            </Button>
            <Button 
              size="small" 
              variant={viewMode === 'list' ? 'contained' : 'outlined'} 
              onClick={() => setViewMode('list')}
              sx={{ minWidth: 'auto', p: 1 }}
            >
              <ViewListIcon fontSize="small" />
            </Button>
          </Box>
        </Box>
      </Grid>

      {viewMode === 'grid' && (
        <>
          <Grid item xs={12}>
            <RiskHeatMap 
              risks={risks}
              components={components}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <EnhancedChartCard 
              title="Impact Distribution" 
              titleTooltip="Distribution of risks by impact category"
              chartRef={impactRef}
              noData={!hasImpactData}
              noDataText="No impact distribution data available"
            >
              <BarChart
                {...impactBarData}
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
                  ...impactBarData.xAxis[0],
                  label: 'Impact Categories',
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
              title="Risk Levels" 
              titleTooltip="Distribution of risks by severity level"
              noData={!hasRiskData}
              noDataText="No risk level data available"
            >
              <PieChart
                series={[
                  {
                    data: hasRiskData ? riskLevelsData : [{ 
                      id: 'no-data', 
                      value: 1, 
                      label: 'No Data', 
                      color: colors.chartColors[6] || '#d9d9d9' 
                    }],
                    innerRadius: isMobile ? 40 : 60,
                    outerRadius: isMobile ? 80 : 100,
                    paddingAngle: 2,
                    cornerRadius: 4,
                    highlightScope: { faded: 'global', highlighted: 'item' },
                    faded: { innerRadius: 20, additionalRadius: -10, color: 'gray' },
                    arcLabel: (params) => {
                      if (!hasRiskData) return '';
                      return `${params.label}: ${params.value}`;
                    },
                    arcLabelMinAngle: 15,
                  },
                ]}
                {...chartOptions}
                slotProps={{
                  ...chartOptions.slotProps,
                  legend: {
                    ...chartOptions.slotProps.legend,
                    itemMarkWidth: 12,
                    itemMarkHeight: 12,
                  },
                }}
                sx={{
                  ...chartOptions.sx,
                  [`& .${pieArcClasses.arcLabel}`]: {
                    fill: colors.paperBg,
                    fontWeight: 'bold',
                    fontSize: isMobile ? '0.65rem' : '0.75rem',
                  },
                }}
              />
            </EnhancedChartCard>
          </Grid>
          <Grid item xs={12}>
            <EnhancedChartCard 
              title="Risk Treatment Distribution" 
              titleTooltip="Distribution of risk treatment approaches"
              noData={!hasTreatmentData}
              noDataText="No risk treatment data available"
            >
              <BarChart
                {...treatmentBarData}
                height={300}
                {...chartOptions}
                margin={{ 
                  top: 20, 
                  right: 20, 
                  bottom: isMobile ? 120 : 80, 
                  left: 40 
                }}
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
                  ...treatmentBarData.xAxis[0],
                  label: 'Treatment Types',
                  labelStyle: { 
                    fill: colors.chartText,
                    fontSize: isMobile ? '0.7rem' : '0.75rem',
                  },
                  tickLabelStyle: {
                    fill: colors.chartText,
                    fontSize: isMobile ? '0.6rem' : '0.65rem',
                    angle: isMobile ? -45 : 0,
                    textAnchor: isMobile ? 'end' : 'middle',
                  },
                }]}
                colors={treatmentBarData.series.map((_, index) => colors.chartColors[index % colors.chartColors.length])}
              />
            </EnhancedChartCard>
          </Grid>
        </>
      )}
      
      {viewMode === 'list' && (
        <Grid item xs={12}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Risk List View</Typography>
            {/* Add your list view implementation here */}
            <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
              <Typography>Risk list view coming soon</Typography>
            </Box>
          </Paper>
        </Grid>
      )}
    </Grid>
  );
};

RisksContent.propTypes = {
  impactDistribution: PropTypes.shape({
    safety: PropTypes.number,
    financial: PropTypes.number,
    operational: PropTypes.number,
    privacy: PropTypes.number,
  }),
  riskLevels: PropTypes.shape({
    high: PropTypes.number,
    medium: PropTypes.number,
    low: PropTypes.number,
  }),
  treatmentDistribution: PropTypes.shape({
    sharing: PropTypes.number,
    retaining: PropTypes.number,
    avoiding: PropTypes.number,
    reducing: PropTypes.number,
    notRated: PropTypes.number,
  }),
  impactRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
  ]),
  components: PropTypes.arrayOf(PropTypes.object),
  risks: PropTypes.arrayOf(PropTypes.object),
};

RisksContent.defaultProps = {
  impactDistribution: {
    safety: 0,
    financial: 0,
    operational: 0,
    privacy: 0,
  },
  riskLevels: {
    high: 0,
    medium: 0,
    low: 0,
  },
  treatmentDistribution: {
    sharing: 0,
    retaining: 0,
    avoiding: 0,
    reducing: 0,
    notRated: 0,
  },
  impactRef: null,
};

export default RisksContent;