/*eslint-disable*/
import React from 'react';
import PropTypes from 'prop-types';
import { Grid, Paper, Typography, Box } from '@mui/material';
import { BarChart, PieChart } from '@mui/x-charts';
import { useTheme } from '@mui/material/styles';
import ColorTheme from '../../themes/ColorTheme';

const AttacksContent = ({ cyberBreakdown, attackPerScenario, attackFeasibility, feasRef }) => {
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

  const cyberPieData = {
    series: [
      {
        data: [
          { id: 0, value: cyberBreakdown.goals, label: 'Goals', color: colors.chartColors[0] },
          { id: 1, value: cyberBreakdown.claims, label: 'Claims', color: colors.chartColors[1] },
          { id: 2, value: cyberBreakdown.requirements, label: 'Reqs', color: colors.chartColors[2] },
          { id: 3, value: cyberBreakdown.controls, label: 'Ctrls', color: colors.chartColors[3] },
        ],
      },
    ],
  };

  const attackPathsBarData = {
    series: [
      {
        data: attackPerScenario.map(s => s.count),
        label: 'Number of Attack Paths',
        color: colors.chartColors[0],
      },
    ],
    xAxis: [{ scaleType: 'band', data: attackPerScenario.map(s => s.scenario) }],
  };

  const feasBarData = {
    series: [
      {
        data: [attackFeasibility.high, attackFeasibility.medium, attackFeasibility.low],
        label: 'Counts',
        color: colors.chartColors[0],
      },
    ],
    xAxis: [{ scaleType: 'band', data: ['High', 'Med', 'Low'] }],
  };

  return (
    <Grid container spacing={2} sx={{ mt: 1 }}>
      <Grid item xs={12} md={6}>
        <Paper elevation={1} sx={{ p: 1, borderRadius: 1, bgcolor: colors.paperBg }}>
          <Typography variant="subtitle2" sx={{ color: colors.title }}>
            Cyber Breakdown
          </Typography>
          {cyberPieData.series[0].data.some((d) => d.value > 0) ? (
            <PieChart
              series={cyberPieData.series}
              height={300}
              {...chartOptions}
              slotProps={{ ...chartOptions.slotProps, legend: { hidden: true } }}
            />
          ) : (
            <Typography color={colors.textSecondary} align="center">
              No data
            </Typography>
          )}
        </Paper>
      </Grid>
      <Grid item xs={12} md={6}>
        <Paper elevation={1} sx={{ p: 1, borderRadius: 1, bgcolor: colors.paperBg }}>
          <Typography variant="subtitle2" sx={{ color: colors.title }}>
            Attack Paths per Scenario
          </Typography>
          {attackPerScenario.length > 0 ? (
            <BarChart
              {...attackPathsBarData}
              height={300}
              margin={{ top: 20, right: 30, left: 40, bottom: 40 }}
              {...chartOptions}
            />
          ) : (
            <Typography color={colors.textSecondary} align="center">
              No data
            </Typography>
          )}
        </Paper>
      </Grid>
      <Grid item xs={12} md={6}>
        <Paper elevation={1} sx={{ p: 1, borderRadius: 1, bgcolor: colors.paperBg }}>
          <Typography variant="subtitle2" sx={{ color: colors.title }}>
            Attack Feasibility
          </Typography>
          <Box ref={feasRef}>
            {feasBarData.series[0].data.some((v) => v > 0) ? (
              <BarChart
                {...feasBarData}
                height={300}
                margin={{ top: 20, right: 30, left: 40, bottom: 40 }}
                {...chartOptions}
              />
            ) : (
              <Typography color={colors.textSecondary} align="center">
                No data
              </Typography>
            )}
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};

AttacksContent.propTypes = {
  cyberBreakdown: PropTypes.object.isRequired,
  attackPerScenario: PropTypes.array.isRequired,
  attackFeasibility: PropTypes.object.isRequired,
  feasRef: PropTypes.object.isRequired
};

export default AttacksContent;