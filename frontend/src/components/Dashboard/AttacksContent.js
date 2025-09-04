/*eslint-disable*/
import React from 'react';
import PropTypes from 'prop-types';
import { Grid, Typography, Box, useMediaQuery } from '@mui/material';
import { BarChart, PieChart, pieArcClasses, pieArcLabelClasses } from '@mui/x-charts';
import { useTheme, alpha } from '@mui/material/styles';
import ColorTheme from '../../themes/ColorTheme';
import EnhancedChartCard from './EnhancedChartCard';

const AttacksContent = ({ cyberBreakdown, attackPerScenario, attackFeasibility, feasRef }) => {
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
        rx: 4,
        ry: 4,
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

  const hasCyberData = cyberBreakdown.goals > 0 || cyberBreakdown.claims > 0 || 
                     cyberBreakdown.requirements > 0 || cyberBreakdown.controls > 0;

  const cyberPieData = {
    series: [
      {
        data: hasCyberData 
          ? [
              { id: 'goals', value: cyberBreakdown.goals, label: 'Goals', color: colors.chartColors[0] },
              { id: 'claims', value: cyberBreakdown.claims, label: 'Claims', color: colors.chartColors[1] },
              { id: 'requirements', value: cyberBreakdown.requirements, label: 'Reqs', color: colors.chartColors[2] },
              { id: 'controls', value: cyberBreakdown.controls, label: 'Ctrls', color: colors.chartColors[3] },
            ].filter(item => item.value > 0)
          : [{ id: 'no-data', value: 1, label: 'No Data', color: colors.chartColors[6] || '#d9d9d9' }],
      },
    ],
  };

  const hasAttackPathsData = attackPerScenario.length > 0 && attackPerScenario.some(s => s.count > 0);
  
  const attackPathsBarData = {
    series: [
      {
        data: hasAttackPathsData ? attackPerScenario.map(s => s.count) : [0],
        label: 'Number of Attack Paths',
      },
    ],
    xAxis: [{
      scaleType: 'band',
      data: hasAttackPathsData ? attackPerScenario.map(s => s.scenario) : ['No Data'],
    }],
  };

  const hasFeasibilityData = attackFeasibility.high > 0 || attackFeasibility.medium > 0 || attackFeasibility.low > 0;
  
  const feasBarData = {
    series: [
      {
        data: hasFeasibilityData 
          ? [attackFeasibility.high, attackFeasibility.medium, attackFeasibility.low]
          : [0, 0, 0],
        label: 'Counts',
      },
    ],
    xAxis: [{
      scaleType: 'band',
      data: ['High', 'Medium', 'Low'],
    }],
  };

  return (
    <Grid container spacing={2} sx={{ mt: 0.5 }}>
      <Grid item xs={12} md={6}>
        <EnhancedChartCard 
          title="Cyber Breakdown" 
          titleTooltip="Distribution of cyber elements"
          noData={!hasCyberData}
          noDataText="No cyber data available"
        >
          <PieChart
            series={cyberPieData.series}
            height={300}
            {...chartOptions}
            slotProps={{
              ...chartOptions.slotProps,
              legend: {
                ...chartOptions.slotProps.legend,
                hidden: isMobile,
              },
            }}
            sx={{
              ...chartOptions.sx,
              [`& .${pieArcClasses.arcLabel}`]: {
                fill: colors.paperBg,
                fontWeight: 'bold',
                fontSize: isMobile ? '0.6rem' : '0.7rem',
              },
            }}
          />
        </EnhancedChartCard>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <EnhancedChartCard 
          title="Attack Paths per Scenario" 
          titleTooltip="Number of attack paths per scenario"
          noData={!hasAttackPathsData}
          noDataText="No attack paths data available"
        >
          <BarChart
            {...attackPathsBarData}
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
              ...attackPathsBarData.xAxis[0],
              label: 'Scenarios',
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
            colors={[colors.chartColors[0]]}
          />
        </EnhancedChartCard>
      </Grid>
      
      <Grid item xs={12}>
        <EnhancedChartCard 
          title="Attack Feasibility" 
          titleTooltip="Distribution of attack feasibility levels"
          chartRef={feasRef}
          noData={!hasFeasibilityData}
          noDataText="No feasibility data available"
        >
          <BarChart
            {...feasBarData}
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
              ...feasBarData.xAxis[0],
              label: 'Feasibility Level',
              labelStyle: { 
                fill: colors.chartText,
                fontSize: isMobile ? '0.7rem' : '0.75rem',
              },
              tickLabelStyle: {
                fill: colors.chartText,
                fontSize: isMobile ? '0.6rem' : '0.65rem',
              },
            }]}
            colors={[
              colors.chartColors[1], // High - red
              colors.chartColors[2], // Medium - yellow
              colors.chartColors[3]  // Low - green
            ]}
          />
        </EnhancedChartCard>
      </Grid>
    </Grid>
  );
};

AttacksContent.propTypes = {
  cyberBreakdown: PropTypes.shape({
    goals: PropTypes.number,
    claims: PropTypes.number,
    requirements: PropTypes.number,
    controls: PropTypes.number,
  }).isRequired,
  attackPerScenario: PropTypes.arrayOf(
    PropTypes.shape({
      scenario: PropTypes.string.isRequired,
      count: PropTypes.number.isRequired,
    })
  ).isRequired,
  attackFeasibility: PropTypes.shape({
    high: PropTypes.number,
    medium: PropTypes.number,
    low: PropTypes.number,
  }).isRequired,
  feasRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.instanceOf(Element) })
  ]),
};

AttacksContent.defaultProps = {
  cyberBreakdown: {
    goals: 0,
    claims: 0,
    requirements: 0,
    controls: 0,
  },
  attackPerScenario: [],
  attackFeasibility: {
    high: 0,
    medium: 0,
    low: 0,
  },
  feasRef: null,
};

export default AttacksContent;