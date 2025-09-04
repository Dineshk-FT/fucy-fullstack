/*eslint-disable*/
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Grid, Box, Typography, Button } from '@mui/material';
import { PieChart, pieArcClasses, pieArcLabelClasses } from '@mui/x-charts';
import { useTheme, alpha } from '@mui/material/styles';
import ColorTheme from '../../themes/ColorTheme';
import RefreshIcon from '@mui/icons-material/Refresh';
import StatCard from './StatCard';
import EnhancedChartCard from './EnhancedChartCard';
import PieChartIcon from '@mui/icons-material/PieChart';
import CategoryIcon from '@mui/icons-material/Category';
import LinkIcon from '@mui/icons-material/Link';
import WarningIcon from '@mui/icons-material/Warning';
import GppBadIcon from '@mui/icons-material/GppBad';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import SecurityIcon from '@mui/icons-material/Security';
import AssessmentIcon from '@mui/icons-material/Assessment';

const OverviewContent = ({ projectStats, loading, overviewRiskCounts, handleRefresh }) => {
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

  const overviewRiskData = useMemo(() => {
    const hasData = overviewRiskCounts && (
      (overviewRiskCounts.high || 0) > 0 ||
      (overviewRiskCounts.medium || 0) > 0 ||
      (overviewRiskCounts.low || 0) > 0
    );
    
    if (!hasData) {
      return [
        { 
          value: 1, 
          label: 'No risks', 
          color: colors.chartColors[6] || '#9e9e9e', 
          id: 'no-risks' 
        }
      ];
    }
    
    return [
      { 
        value: Math.max(0, overviewRiskCounts.high || 0), 
        label: 'High', 
        color: colors.chartColors[1] || '#ff5252', 
        id: 'risk-high' 
      },
      { 
        value: Math.max(0, overviewRiskCounts.medium || 0), 
        label: 'Medium', 
        color: colors.chartColors[2] || '#ffc107', 
        id: 'risk-medium' 
      },
      { 
        value: Math.max(0, overviewRiskCounts.low || 0), 
        label: 'Low', 
        color: colors.chartColors[3] || '#4caf50', 
        id: 'risk-low' 
      }
    ].filter(item => item.value > 0);
  }, [overviewRiskCounts, colors.chartColors]);

  const statCards = [
    { 
      key: 'assets', 
      title: 'Assets', 
      value: projectStats?.totalComponents || 0, 
      color: 0, 
      icon: CategoryIcon 
    },
    { 
      key: 'connections', 
      title: 'Connections', 
      value: projectStats?.totalConnections || 0, 
      color: 2, 
      icon: LinkIcon 
    },
    { 
      key: 'damages', 
      title: 'Damages', 
      value: projectStats?.totalDamageScenarios || 0, 
      color: 3, 
      icon: WarningIcon 
    },
    { 
      key: 'derived-damages', 
      title: 'D-Damage', 
      value: projectStats?.totalDerivedDamageScenarios || 0, 
      color: 4, 
      icon: WarningIcon 
    },
    { 
      key: 'threats', 
      title: 'Threats', 
      value: projectStats?.totalThreats || 0, 
      color: 5, 
      icon: WarningIcon 
    },
    { 
      key: 'attacks', 
      title: 'Attacks', 
      value: projectStats?.totalAttackScenarios || 0, 
      color: 1, 
      icon: GppBadIcon 
    },
    { 
      key: 'risks', 
      title: 'Risks', 
      value: projectStats?.risksIdentified || 0, 
      color: 6, 
      icon: ReportProblemIcon 
    },
    { 
      key: 'goals', 
      title: 'Goals', 
      value: projectStats?.cyberGoals || 0, 
      color: 2, 
      icon: SecurityIcon 
    },
    { 
      key: 'claims', 
      title: 'Claims', 
      value: projectStats?.cyberClaims || 0, 
      color: 3, 
      icon: AssessmentIcon 
    },
    { 
      key: 'requirements', 
      title: 'Reqs', 
      value: projectStats?.cyberRequirements || 0, 
      color: 4, 
      icon: WarningIcon 
    },
    { 
      key: 'controls', 
      title: 'Controls', 
      value: projectStats?.cyberControls || 0, 
      color: 7, 
      icon: SecurityIcon 
    },
  ];

  return (
    <>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {statCards.map(({ key, title, value, color, icon: Icon }) => (
          <Grid item xs={6} sm={4} md={2} lg={1} key={key}>
            <StatCard 
              title={title} 
              value={value} 
              color={colors.chartColors[color % colors.chartColors.length]} 
              icon={Icon} 
              loading={loading} 
            />
          </Grid>
        ))}
      </Grid>
      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid item xs={12} md={6}>
          <EnhancedChartCard title="Risk Distribution" icon={PieChartIcon} loading={loading}>
            {overviewRiskData.length > 0 ? (
              <PieChart
                series={[{
                  highlightScope: { faded: 'global', highlighted: 'item' },
                  faded: { innerRadius: 30, additionalRadius: -10, color: 'gray' },
                  arcLabel: (params) => params.percent > 5 ? `${params.value} (${Math.round(params.percent)}%)` : '',
                  arcLabelMinAngle: 15,
                  cornerRadius: 4,
                  paddingAngle: 2,
                  innerRadius: '40%',
                  outerRadius: '80%',
                  cx: '50%',
                  cy: '50%',
                  data: overviewRiskData,
                  valueFormatter: (value) => String(value || 0),
                }]}
                slotProps={{
                  legend: {
                    direction: 'row',
                    position: { vertical: 'bottom', horizontal: 'middle' },
                    padding: { top: 20, bottom: 10 },
                    labelStyle: {
                      fontSize: '0.75rem',
                      fill: colors.textSecondary,
                      fontFamily: theme.typography.fontFamily,
                      cursor: 'pointer',
                      '&:hover': {
                        color: colors.primary,
                      },
                    },
                    itemMark: (markParams) => (
                      <rect
                        key={`mark-${markParams.color}`}
                        x={0}
                        y={-5}
                        width={10}
                        height={10}
                        fill={markParams.color}
                        fillOpacity={markParams.isFaded ? 0.3 : 1}
                        rx={2}
                        ry={2}
                        style={{
                          transition: 'all 0.2s ease-in-out',
                          transform: markParams.isFaded ? 'scale(0.8)' : 'scale(1)',
                          opacity: markParams.isFaded ? 0.7 : 1,
                        }}
                      />
                    ),
                  },
                }}
                sx={{
                  [`& .${pieArcClasses.root}`]: {
                    stroke: colors.paperBg,
                    strokeWidth: 2,
                    transition: 'all 0.3s ease-in-out',
                    cursor: 'pointer',
                    '&:hover': {
                      opacity: 0.9,
                      transform: 'scale(1.05)',
                      filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.2))',
                    },
                  },
                  [`& .${pieArcLabelClasses.root}`]: {
                    fontSize: '0.65rem',
                    fill: colors.paperBg,
                    fontWeight: 600,
                    fontFamily: theme.typography.fontFamily,
                    pointerEvents: 'none',
                  },
                }}
              />
            ) : (
              <Box sx={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: 1,
              }}>
                <Typography variant="body2" color="textSecondary">
                  No risk data available
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={handleRefresh}
                  startIcon={<RefreshIcon />}
                >
                  Refresh
                </Button>
              </Box>
            )}
          </EnhancedChartCard>
        </Grid>
      </Grid>
    </>
  );
};

OverviewContent.propTypes = {
  projectStats: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
  overviewRiskCounts: PropTypes.shape({
    high: PropTypes.number,
    medium: PropTypes.number,
    low: PropTypes.number
  }).isRequired,
  handleRefresh: PropTypes.func.isRequired
};

export default OverviewContent;