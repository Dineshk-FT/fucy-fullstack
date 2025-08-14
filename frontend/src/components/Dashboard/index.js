/* eslint-disable */
import React, { useEffect, useState, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Grid,
  Paper,
  Typography,
  Tabs,
  Tab,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Alert,
  Tooltip,
  Fade,
  Zoom,
  Grow,
  Slide,
  useScrollTrigger,
  AppBar,
  Toolbar,
  IconButton,
} from '@mui/material';
import { DataGrid, gridClasses } from '@mui/x-data-grid';
import { 
  BarChart, 
  PieChart, 
  LineChart,
  pieArcLabelClasses,
  pieArcClasses,
  barClasses,
  lineChartClasses,
  axisClasses,
  chartsGridClasses,
  ChartsTooltip,
  ChartsLegend,
  ChartsAxisHighlight,
  ChartsReferenceLine,
  ChartsXAxis,
  ChartsYAxis,
  ChartsGrid,
  ResponsiveChartContainer,
  BarPlot,
  LinePlot,
  PiePlot,
  MarkPlot,
} from '@mui/x-charts';
import ColorTheme from '../../themes/ColorTheme';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
jsPDF.autoTable = autoTable;
import Chart from 'chart.js/auto';
import { alpha } from '@mui/material/styles';

// Icons
import DevicesIcon from '@mui/icons-material/Devices';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SecurityIcon from '@mui/icons-material/Security';
import WarningIcon from '@mui/icons-material/Warning';
import GppBadIcon from '@mui/icons-material/GppBad';
import CloseIcon from '@mui/icons-material/Close';
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';
import TimelineIcon from '@mui/icons-material/Timeline';
import PieChartIcon from '@mui/icons-material/PieChart';
import BarChartIcon from '@mui/icons-material/BarChart';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import { GET_CALL } from '../../services/api';
import { configuration } from '../../services/baseApiService';

const StatCard = ({ title, value, color, icon: Icon, loading = false }) => {
  const theme = useTheme();
  const colors = ColorTheme();
  const [elevation, setElevation] = useState(2);

  return (
    <Fade in={!loading} timeout={500}>
      <Tooltip
        title={`View details for ${title}`}
        arrow
        TransitionComponent={Zoom}
      >
        <Paper
          elevation={elevation}
          onMouseEnter={() => setElevation(6)}
          onMouseLeave={() => setElevation(2)}
          sx={{
            p: 2,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 2,
            bgcolor: colors.paperBg || 'background.paper',
            border: `1px solid ${alpha(colors.borderColor || theme.palette.divider, 0.5)}`,
            minWidth: 120,
            transition: theme.transitions.create(
              ['all', 'transform', 'box-shadow'],
              {
                duration: theme.transitions.duration.standard,
                easing: theme.transitions.easing.easeInOut,
              }
            ),
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: theme.shadows[8],
              borderColor: alpha(colors.primary || theme.palette.primary.main, 0.5),
            },
          }}
        >
          {loading ? (
            <CircularProgress size={24} thickness={4} color="inherit" />
          ) : (
            <>
              {Icon && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    bgcolor: alpha(color || theme.palette.primary.main, 0.1),
                    mb: 1.5,
                    '& svg': {
                      color: color || theme.palette.primary.main,
                      fontSize: 28,
                      transition: theme.transitions.create('transform', {
                        duration: theme.transitions.duration.standard,
                      }),
                    },
                    '&:hover svg': {
                      transform: 'scale(1.1)',
                    },
                  }}
                >
                  <Icon />
                </Box>
              )}
              <Typography
                variant="caption"
                display="block"
                sx={{
                  color: colors.textSecondary,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                  fontSize: '0.65rem',
                  mb: 0.5,
                  opacity: 0.9,
                }}
              >
                {title}
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: color || theme.palette.primary.main,
                  fontWeight: 700,
                  fontSize: '1.4rem',
                  lineHeight: 1.2,
                  textAlign: 'center',
                  background: `linear-gradient(45deg, ${color || theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {value}
              </Typography>
            </>
          )}
        </Paper>
      </Tooltip>
    </Fade>
  );
};

const TabPanel = ({ children, value, index, ...other }) => {
  const theme = useTheme();
  const colors = ColorTheme();
  const isActive = value === index;

  return (
    <div
      role="tabpanel"
      hidden={!isActive}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      <Fade
        in={isActive}
        timeout={theme.transitions.duration.enteringScreen}
        mountOnEnter
        unmountOnExit
      >
        <Box
          sx={{
            p: { xs: 1.5, sm: 2, md: 3 },
            opacity: isActive ? 1 : 0,
            transition: theme.transitions.create('opacity', {
              duration: theme.transitions.duration.enteringScreen,
            }),
          }}
        >
          <Grow in={isActive} timeout={theme.transitions.duration.enteringScreen}>
            <div>{children}</div>
          </Grow>
        </Box>
      </Fade>
    </div>
  );
};

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

const DashboardDialog = ({ open, onClose, modelId }) => {
  const theme = useTheme();
  const colors = ColorTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    components: {},
    threats: [],
    damageScenarios: [],
    attackScenarios: [],
    cybersecurity: [],
    riskTreatments: {},
  });
  const [projectStats, setProjectStats] = useState({
    totalComponents: 0,
    totalThreats: 0,
    totalDamageScenarios: 0,
    totalAttackScenarios: 0,
    risksIdentified: 0,
    controlsImplemented: 0,
    averageImpact: 0,
    unmitigatedRisks: 0,
    coveragePercentage: 0,
    highFeasibilityAttacks: 0,
  });
  const [riskLevels, setRiskLevels] = useState({ high: 0, medium: 0, low: 0 });
  const [threatTypes, setThreatTypes] = useState({ derived: 0, userDefined: 0 });
  const [impactDistribution, setImpactDistribution] = useState({
    safety: 0,
    financial: 0,
    operational: 0,
    privacy: 0,
  });
  const [cyberBreakdown, setCyberBreakdown] = useState({
    goals: 0,
    claims: 0,
    requirements: 0,
    controls: 0,
  });
  const [attackFeasibility, setAttackFeasibility] = useState({
    high: 0,
    medium: 0,
    low: 0,
  });
  const [treatmentDistribution, setTreatmentDistribution] = useState({
    sharing: 0,
    retaining: 0,
    avoiding: 0,
    reducing: 0,
    notRated: 0,
  });
  const [attackPerScenario, setAttackPerScenario] = useState([]);
  const [assetThreatAttack, setAssetThreatAttack] = useState([]);
  const [threatIdsWithAttacks, setThreatIdsWithAttacks] = useState(new Set());
  const [overallRisk, setOverallRisk] = useState('Low');
  const [tabValue, setTabValue] = useState(0);

  const chartRefs = {
    overview: useRef(null),
    impact: useRef(null),
    threat: useRef(null),
    feas: useRef(null),
  };

  useEffect(() => {
    if (!open || !modelId) {
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const baseUrl = configuration.apiBaseUrl;
        const apiEndpoints = [
          { key: 'components', endpoint: `${baseUrl}v1/get_details/assets`, defaultValue: {} },
          { key: 'threats', endpoint: `${baseUrl}v1/get_details/threat_scenarios`, defaultValue: [] },
          { key: 'damageScenarios', endpoint: `${baseUrl}v1/get_details/damage_scenarios`, defaultValue: [] },
          { key: 'attackScenarios', endpoint: `${baseUrl}v1/get_details/attacks`, defaultValue: [] },
          { key: 'cybersecurity', endpoint: `${baseUrl}v1/get_details/cybersecurity`, defaultValue: [] },
          { key: 'riskTreatments', endpoint: `${baseUrl}v1/get/riskDetAndTreat`, defaultValue: {} },
        ];

        const dashboardDataTemp = {};
        apiEndpoints.forEach(({ key, defaultValue }) => {
          dashboardDataTemp[key] = Array.isArray(defaultValue)
            ? [...defaultValue]
            : { ...defaultValue };
        });

        for (const { key, endpoint, defaultValue } of apiEndpoints) {
          try {
            const response = await GET_CALL(modelId, endpoint);
            if (response !== undefined) {
              dashboardDataTemp[key] = Array.isArray(defaultValue)
                ? Array.isArray(response)
                  ? response
                  : []
                : typeof response === 'object' && response !== null
                  ? response
                  : {};
            }
          } catch (error) {
            console.error(`Error fetching ${endpoint}:`, error);
            dashboardDataTemp[key] = Array.isArray(defaultValue)
              ? [...defaultValue]
              : { ...defaultValue };
          }
        }

        setDashboardData(dashboardDataTemp);

        // Compute core stats
        const comps = dashboardDataTemp.components.template?.nodes?.length || 0;
        const threats = dashboardDataTemp.threats.reduce(
          (sum, t) => sum + (t.Details?.length || 0),
          0
        );
        const damages = dashboardDataTemp.damageScenarios.reduce(
          (sum, d) => sum + (d.Details?.length || 0),
          0
        );
        const attacks = dashboardDataTemp.attackScenarios.reduce(
          (sum, a) => sum + (a.scenes?.length || 0),
          0
        );
        const risks = dashboardDataTemp.riskTreatments.Details?.length || 0;
        const controls =
          dashboardDataTemp.cybersecurity.filter(
            (c) => c.type === 'cybersecurity_controls'
          )?.[0]?.scenes?.length || 0;

        // Additional stats
        let totalImpacts = 0,
          impactCount = 0;
        let safety = 0,
          financial = 0,
          operational = 0,
          privacy = 0;
        dashboardDataTemp.damageScenarios.forEach((ds) => {
          ds.Details?.forEach((d) => {
            Object.entries(d.impacts || {}).forEach(([key, val]) => {
              const num =
                typeof val === 'string'
                  ? { Low: 1, Medium: 2, High: 3 }[val] || 0
                  : val || 0;
              totalImpacts += num;
              impactCount++;
              if (key.toLowerCase().includes('safety')) safety += num;
              else if (key.toLowerCase().includes('financial'))
                financial += num;
              else if (key.toLowerCase().includes('operational'))
                operational += num;
              else if (key.toLowerCase().includes('privacy')) privacy += num;
            });
          });
        });
        const avgImpact = impactCount > 0 ? (totalImpacts / impactCount).toFixed(2) : 0;

        const unmitigated =
          risks -
          dashboardDataTemp.riskTreatments.Details?.filter(
            (r) => r.cybersecurity?.cybersecurity_controls?.length > 0
          ).length || 0;
        const coverage = risks > 0 ? ((controls / risks) * 100).toFixed(1) : 0;

        let highFeas = 0,
          medFeas = 0,
          lowFeas = 0;
        dashboardDataTemp.attackScenarios.forEach((as) => {
          as.scenes?.forEach((s) => {
            const rating = s['Attack Feasibilities Rating'] || '';
            if (rating === 'High') highFeas++;
            else if (rating === 'Medium') medFeas++;
            else if (rating === 'Low') lowFeas++;
          });
        });

        setProjectStats({
          totalComponents: comps,
          totalThreats: threats,
          totalDamageScenarios: damages,
          totalAttackScenarios: attacks,
          risksIdentified: risks,
          controlsImplemented: controls,
          averageImpact: avgImpact,
          unmitigatedRisks: unmitigated,
          coveragePercentage: coverage,
          highFeasibilityAttacks: highFeas,
        });

        // Risk levels
        let high = 0,
          medium = 0,
          low = 0;
        dashboardDataTemp.riskTreatments.Details?.forEach((risk) => {
          const damage = dashboardDataTemp.damageScenarios
            .flatMap((ds) => ds.Details || [])
            .find((d) => d._id === risk.damage_id);
          if (damage) {
            const maxImpact = Object.values(damage.impacts || {}).reduce(
              (max, val) => {
                const num =
                  typeof val === 'string'
                    ? { Low: 1, Medium: 2, High: 3 }[val] || 0
                    : val || 0;
                return num > max ? num : max;
              },
              0
            );
            if (maxImpact >= 3) high++;
            else if (maxImpact === 2) medium++;
            else low++;
          }
        });
        setRiskLevels({ high, medium, low });

        // Overall risk
        setOverallRisk(high > 5 ? 'High' : high > 0 || medium > 5 ? 'Medium' : 'Low');

        // Threat types
        const derived =
          dashboardDataTemp.threats.find((t) => t.type === 'derived')?.Details
            ?.length || 0;
        const userDefined =
          dashboardDataTemp.threats.find((t) => t.type === 'User-defined')
            ?.length || 0;
        setThreatTypes({ derived, userDefined });

        // Impact distribution
        setImpactDistribution({ safety, financial, operational, privacy });

        // Cyber breakdown
        const goals =
          dashboardDataTemp.cybersecurity.find(
            (c) => c.type === 'cybersecurity_goals'
          )?.scenes?.length || 0;
        const claims =
          dashboardDataTemp.cybersecurity.find(
            (c) => c.type === 'cybersecurity_claims'
          )?.scenes?.length || 0;
        const reqs =
          dashboardDataTemp.cybersecurity.find(
            (c) => c.type === 'cybersecurity_requirements'
          )?.scenes?.length || 0;
        setCyberBreakdown({ goals, claims, requirements: reqs, controls });

        // Attack feasibility
        setAttackFeasibility({ high: highFeas, medium: medFeas, low: lowFeas });

        // New: Treatment distribution
        let sharing = 0, retaining = 0, avoiding = 0, reducing = 0, notRated = 0;
        dashboardDataTemp.riskTreatments.Details?.forEach(risk => {
          const treatment = risk.risk_treatment || 'Not rated';
          if (treatment === 'Sharing the Option') sharing++;
          else if (treatment === 'Retaining the risk') retaining++;
          else if (treatment === 'Avoiding the risk') avoiding++;
          else if (treatment === 'Reducing the risk') reducing++;
          else notRated++;
        });
        setTreatmentDistribution({ sharing, retaining, avoiding, reducing, notRated });

        // New: Attack paths per scenario (threat)
        const attackCountsPerThreat = dashboardDataTemp.attackScenarios.reduce((acc, a) => {
          a.scenes?.forEach(s => {
            const threatId = s.threat_id || 'Unknown';
            acc[threatId] = (acc[threatId] || 0) + 1;
          });
          return acc;
        }, {});
        const threatIds = Object.keys(attackCountsPerThreat).slice(0, 3);
        setAttackPerScenario(threatIds.map((id, i) => ({ scenario: `Scenario ${i + 1}`, count: attackCountsPerThreat[id] })));

        // New: Threats and attack paths per asset (assuming asset_id in details/scenes)
        const newThreatIdsWithAttacks = new Set(dashboardDataTemp.attackScenarios.flatMap(a => a.scenes?.map(s => s.threat_id) || []));
        setThreatIdsWithAttacks(newThreatIdsWithAttacks);
        const assetThreatAttackTemp = dashboardDataTemp.components.template?.nodes?.map((asset, index) => {
          const assetId = asset.id;
          const threatCount = dashboardDataTemp.threats.reduce((count, t) => count + t.Details.filter(d => d.asset_id === assetId).length, 0);
          const attackCount = dashboardDataTemp.attackScenarios.reduce((count, a) => count + a.scenes.filter(s => s.asset_id === assetId).length, 0);
          return {
            id: `asset-${assetId || index}`,
            assetId: asset.data.label || assetId,
            threatCount,
            attackCount
          };
        }) || [];
        setAssetThreatAttack(assetThreatAttackTemp);

      } catch (err) {
        setError('Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [open, modelId]);

  // Chart data adapter for Chart.js and MUI Charts
  const adaptChartData = (chartData, type) => {
    if (!chartData) {
      console.error('Chart data is undefined or null');
      return { labels: [], datasets: [] };
    }

    try {
      if (type === 'pie') {
        const series = chartData.series?.[0]?.data || [];
        return {
          labels: series.map((d) => d?.label || '').filter(Boolean),
          datasets: [
            {
              data: series.map((d) => d?.value || 0),
              backgroundColor: series.map(
                (d, i) => d?.color || colors.chartColors[i % colors.chartColors.length]
              ),
            },
          ],
        };
      } else {
        // bar or line
        const xAxisData = chartData.xAxis?.[0]?.data || [];
        const seriesData = Array.isArray(chartData.series) ? chartData.series : [];
        return {
          labels: xAxisData,
          datasets: seriesData.map((s, i) => ({
            label: s?.label || '',
            data: Array.isArray(s?.data) ? s.data : [],
            backgroundColor:
              s?.backgroundColor || colors.chartColors[i % colors.chartColors.length],
            borderColor:
              s?.borderColor || colors.chartColors[i % colors.chartColors.length],
            borderWidth: type === 'line' ? 2 : 0,
          })),
        };
      }
    } catch (error) {
      console.error('Error adapting chart data:', error);
      return { labels: [], datasets: [] };
    }
  };

  // Chart configurations with theme support
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

  const overviewBarData = {
    series: [
      {
        data: [
          projectStats.totalComponents,
          projectStats.totalThreats,
          projectStats.risksIdentified,
          projectStats.controlsImplemented,
        ],
        label: 'Counts',
        color: colors.chartColors[0],
      },
    ],
    xAxis: [{ scaleType: 'band', data: ['Comps', 'Threats', 'Risks', 'Ctrls'] }],
  };

  const riskPieData = {
    series: [
      {
        data: [
          { id: 0, value: riskLevels.high, label: 'High', color: colors.chartColors[1] },
          { id: 1, value: riskLevels.medium, label: 'Medium', color: colors.chartColors[2] },
          { id: 2, value: riskLevels.low, label: 'Low', color: colors.chartColors[3] },
        ],
      },
    ],
  };

  const threatBarData = {
    series: [
      {
        data: [threatTypes.derived, threatTypes.userDefined],
        label: 'Counts',
        color: colors.chartColors[0],
      },
    ],
    xAxis: [{ scaleType: 'band', data: ['Derived', 'User-Def'] }],
  };

  const impactBarData = {
    series: [
      {
        data: [
          impactDistribution.safety,
          impactDistribution.financial,
          impactDistribution.operational,
          impactDistribution.privacy,
        ],
        label: 'Impact Scores',
        color: colors.chartColors[0],
      },
    ],
    xAxis: [
      {
        scaleType: 'band',
        data: ['Safety', 'Financial', 'Operational', 'Privacy'],
      },
    ],
  };

  const cyberPieData = {
    series: [
      {
        data: [
          { id: 0, value: cyberBreakdown.goals, label: 'Goals', color: colors.chartColors[0] },
          { id: 1, value: cyberBreakdown.claims, label: 'Claims', color: colors.chartColors[1] },
          {
            id: 2,
            value: cyberBreakdown.requirements,
            label: 'Reqs',
            color: colors.chartColors[2],
          },
          { id: 3, value: cyberBreakdown.controls, label: 'Ctrls', color: colors.chartColors[3] },
        ],
      },
    ],
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

  const timelineData = {
    series: [
      { data: dashboardData.threats.map(t => t.Details?.length || 0), label: 'Number of Threats', color: colors.chartColors[0] },
      { data: dashboardData.threats.map(t => t.Details?.filter(d => !threatIdsWithAttacks.has(d._id)).length || 0), label: 'Number of Threats without Attack Path', color: colors.chartColors[1] },
    ],
    xAxis: [{ data: dashboardData.threats.map(t => t.timestamp || Date.now()), scaleType: 'time' }],
  };

  const treatmentPieData = {
    series: [
      {
        data: [
          { id: 0, value: treatmentDistribution.sharing, label: 'Sharing the Option', color: colors.chartColors[0] },
          { id: 1, value: treatmentDistribution.retaining, label: 'Retaining the risk', color: colors.chartColors[1] },
          { id: 2, value: treatmentDistribution.avoiding, label: 'Avoiding the risk', color: colors.chartColors[2] },
          { id: 3, value: treatmentDistribution.reducing, label: 'Reducing the risk', color: colors.chartColors[3] },
          { id: 4, value: treatmentDistribution.notRated, label: 'Not rated', color: colors.chartColors[4] },
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

  // Tables
  const riskColumns = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'threat_id', headerName: 'Threat ID', width: 100 },
    { field: 'damage_id', headerName: 'Damage ID', width: 100 },
    { field: 'label', headerName: 'Label', width: 120 },
    { field: 'threat_key', headerName: 'Threat Key', width: 100 },
    {
      field: 'cybersecurity_goals',
      headerName: 'Goals',
      width: 100,
      valueGetter: (params) => params.row.cybersecurity?.cybersecurity_goals?.length || 0,
    },
    {
      field: 'catalogs',
      headerName: 'Catalogs',
      width: 100,
      valueGetter: (params) => params.row.catalogs?.length || 0,
    },
  ];

  const riskRows = (dashboardData.riskTreatments.Details || []).map((r, index) => ({
    ...r,
    id: r.id || index,
  }));

  const attackColumns = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'type', headerName: 'Type', width: 100 },
    { field: 'Name', headerName: 'Name', width: 120 },
    { field: 'threat_id', headerName: 'Threat ID', width: 100 },
    { field: 'Attack Feasibilities Rating', headerName: 'Feasibility', width: 120 },
    { field: 'Elapsed Time', headerName: 'Time', width: 100 },
  ];

  const attackRows = dashboardData.attackScenarios.flatMap((a) =>
    a.scenes?.map((s) => ({ ...s, id: s.ID, type: a.type })) || []
  );

  const threatColumns = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'type', headerName: 'Type', width: 100 },
    { field: 'detailCount', headerName: 'Details', width: 80 },
    {
      field: 'propCount',
      headerName: 'Props',
      width: 80,
      valueGetter: (params) =>
        params.row.Details?.reduce((sum, d) => sum + (d.props?.length || 0), 0) || 0,
    },
  ];

  const threatRows = dashboardData.threats.map((t) => ({
    ...t,
    id: t._id,
    detailCount: t.Details?.length || o,
  }));

  const damageColumns = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'type', headerName: 'Type', width: 100 },
    {
      field: 'Name',
      headerName: 'Name',
      valueGetter: (params) => params.row.Details?.[0]?.Name || 'N/A',
      width: 120,
    },
    {
      field: 'cyberLosses',
      headerName: 'Losses',
      width: 100,
      valueGetter: (params) =>
        params.row.Details?.reduce((sum, d) => sum + (d.cyberLosses?.length || 0), 0) || 0,
    },
  ];

  const damageRows = dashboardData.damageScenarios.map((ds) => ({
    ...ds,
    id: ds._id,
  }));

  const cyberColumns = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'type', headerName: 'Type', width: 120 },
    {
      field: 'sceneCount',
      headerName: 'Scenes',
      width: 80,
      valueGetter: (params) => params.row.scenes?.length || 0,
    },
    {
      field: 'threatKeys',
      headerName: 'Threat Keys',
      width: 120,
      valueGetter: (params) => {
        const threatKey = params.row.scenes?.[0]?.threat_key;
        return Array.isArray(threatKey) ? threatKey.join(', ') : threatKey || 'N/A';
      },
    },
  ];

  const cyberRows = dashboardData.cybersecurity.map((c) => ({
    ...c,
    id: c._id,
    sceneCount: c.scenes?.length || 0,
  }));

  const assetColumns = [
    { field: 'assetId', headerName: 'Asset BID', width: 150 },
    { field: 'threatCount', headerName: 'Number of Threat Scenarios', width: 200 },
    { field: 'attackCount', headerName: 'Number of Attack Paths', width: 200 },
  ];

  // Generate chart image for PDF export
  const generateChartImage = (chartData, type) => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');

    const adaptedData = adaptChartData(chartData, type);
    new Chart(ctx, {
      type,
      data: adaptedData,
      options: {
        responsive: false,
        plugins: {
          title: {
            display: true,
            text: chartData.title || 'Chart',
            color: colors.chartText,
          },
          legend: {
            display: type !== 'pie',
            position: 'bottom',
            labels: {
              color: colors.chartText,
            },
          },
        },
        scales:
          type === 'bar' || type === 'line'
            ? {
              x: {
                type: 'category',
                ticks: { color: colors.chartText },
                grid: { color: colors.chartGrid },
              },
              y: {
                beginAtZero: true,
                ticks: { color: colors.chartText },
                grid: { color: colors.chartGrid },
              },
            }
            : undefined,
        backgroundColor: colors.chartBackground,
      },
    });

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(canvas.toDataURL('image/png'));
      }, 100);
    });
  };

  // PDF Export
  const exportPDF = async () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const date = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    let y = 10;

    // Title and Metadata
    doc.setFontSize(16);
    doc.setTextColor(colors.textPrimary);
    doc.text('Comprehensive Security Dashboard Report', 10, y);
    y += 10;
    doc.setFontSize(10);
    doc.text(`Generated: ${date}`, 10, y);
    doc.text(`Model ID: ${modelId}`, 150, y);
    y += 10;

    // Overview Section (Cards)
    doc.setFontSize(12);
    doc.text('Overview', 10, y);
    y += 5;
    const stats = [
      { title: 'Components', value: projectStats.totalComponents, color: colors.chartColors[0] },
      { title: 'Threats', value: projectStats.totalThreats, color: colors.chartColors[1] },
      { title: 'Damages', value: projectStats.totalDamageScenarios, color: colors.chartColors[2] },
      { title: 'Attacks', value: projectStats.totalAttackScenarios, color: colors.chartColors[3] },
      { title: 'Risks', value: projectStats.risksIdentified, color: colors.chartColors[2] },
      { title: 'Controls', value: projectStats.controlsImplemented, color: colors.chartColors[3] },
      { title: 'Avg Impact', value: projectStats.averageImpact, color: colors.chartColors[0] },
      { title: 'Unmitigated', value: projectStats.unmitigatedRisks, color: colors.chartColors[1] },
      { title: 'Coverage %', value: `${projectStats.coveragePercentage}%`, color: colors.chartColors[3] },
      { title: 'High Feas', value: projectStats.highFeasibilityAttacks, color: colors.chartColors[1] },
    ];
    stats.forEach((stat, index) => {
      if (y > 270) {
        doc.addPage();
        y = 10;
        doc.text('Overview (Continued)', 10, y);
        y += 5;
      }
      const rgb = hexToRgb(stat.color).map((c) => c * 255);
      doc.setFillColor(...rgb);
      doc.rect(10 + (index % 5) * 35, y, 30, 20, 'F');
      doc.setTextColor(255, 255, 255);
      doc.text(stat.title, 10 + (index % 5) * 35 + 5, y + 5);
      doc.text(stat.value.toString(), 10 + (index % 5) * 35 + 5, y + 15);
      if ((index + 1) % 5 === 0) y += 25;
    });
    y += 10;

    // Charts
    const charts = [
      { title: 'Project Overview', data: overviewBarData, type: 'bar' },
      { title: 'Impact Distribution', data: impactBarData, type: 'bar' },
      { title: 'Threat Types', data: threatBarData, type: 'bar' },
      { title: 'Attack Feasibility', data: feasBarData, type: 'bar' },
      { title: 'Risk Levels', data: riskPieData, type: 'pie' },
      { title: 'Cyber Breakdown', data: cyberPieData, type: 'pie' },
      { title: 'Threats Timeline', data: timelineData, type: 'line' },
    ];
    for (const chart of charts) {
      if (y > 250) {
        doc.addPage();
        y = 10;
      }
      doc.setTextColor(colors.textPrimary);
      doc.text(chart.title, 10, y);
      y += 5;
      const imgData = await generateChartImage(chart, chart.type);
      doc.addImage(imgData, 'PNG', 10, y, 180, 80);
      y += 90;
    }

    // Tables
    const tables = [
      { title: 'Top Risks', columns: riskColumns, rows: riskRows },
      { title: 'Attack Scenarios', columns: attackColumns, rows: attackRows },
      { title: 'Threat Scenarios', columns: threatColumns, rows: threatRows },
      { title: 'Damage Scenarios', columns: damageColumns, rows: damageRows },
      { title: 'Cybersecurity Items', columns: cyberColumns, rows: cyberRows },
    ];
    for (const table of tables) {
      if (y > 250) {
        doc.addPage();
        y = 10;
      }
      doc.setTextColor(colors.textPrimary);
      doc.text(table.title, 10, y);
      y += 5;
      autoTable(doc, {
        head: [table.columns.map((c) => c.headerName)],
        body: table.rows.map((row) =>
          table.columns.map((c) => {
            const value = c.valueGetter ? c.valueGetter({ row }) : row[c.field];
            return value !== null && value !== undefined ? value.toString() : 'N/A';
          })
        ),
        startY: y,
        theme: 'grid',
        styles: {
          fontSize: 8,
          cellPadding: 2,
          overflow: 'linebreak',
          textColor: colors.textPrimary,
          fillColor: colors.paperBg,
        },
        headStyles: {
          fillColor: colors.tableHeaderBg,
          textColor: colors.textPrimary,
        },
        alternateRowStyles: {
          fillColor: colors.tableRowOdd,
        },
        columnStyles: table.columns.reduce(
          (styles, col, idx) => ({
            ...styles,
            [idx]: { cellWidth: col.width / 3.78, minCellWidth: col.width / 3.78 },
          }),
          {}
        ),
      });
      y = doc.lastAutoTable.finalY + 10;
    }

    doc.save(`Security_Dashboard_Report_${modelId}_${date.split(',')[0].replace(/\//g, '-')}.pdf`);
  };

  // Helper function to convert hex color to RGB
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? [
        parseInt(result[1], 16) / 255,
        parseInt(result[2], 16) / 255,
        parseInt(result[3], 16) / 255,
      ]
      : [0, 0, 0];
  };

  // Table styling
  const tableSx = {
    '& .MuiDataGrid-root': {
      borderColor: colors.borderColor,
      backgroundColor: colors.paperBg,
      color: `${colors.textPrimary} !important`, // Ensure root-level text color
      '& .MuiDataGrid-cell': {
        color: `${colors.textPrimary} !important`,
        borderColor: colors.borderColor,
        '&:focus': {
          outline: 'none',
        },
      },
      '& .MuiDataGrid-columnHeaders': {
        backgroundColor: colors.tableHeaderBg,
        color: `${colors.textPrimary} !important`,
        borderColor: colors.borderColor,
        '& .MuiDataGrid-columnHeaderTitle': {
          fontWeight: 600,
          color: `${colors.textPrimary} !important`,
        },
      },
      '& .MuiDataGrid-row': {
        '&:nth-of-type(odd)': {
          backgroundColor: colors.tableRowOdd,
          '& .MuiDataGrid-cell': {
            color: `${colors.textPrimary} !important`,
          },
        },
        '&:hover': {
          backgroundColor: colors.tableRowHover,
          '& .MuiDataGrid-cell': {
            color: `${colors.textPrimary} !important`,
          },
        },
      },
      '& .MuiDataGrid-footerContainer': {
        backgroundColor: colors.paperBg,
        color: `${colors.textPrimary} !important`,
        borderColor: colors.borderColor,
        '& .MuiTablePagination-root': {
          color: `${colors.textPrimary} !important`,
          '& .MuiTablePagination-selectLabel': {
            color: `${colors.textPrimary} !important`,
          },
          '& .MuiTablePagination-displayedRows': {
            color: `${colors.textPrimary} !important`,
          },
          '& .MuiTablePagination-actions': {
            '& .MuiIconButton-root': {
              color: `${colors.textPrimary} !important`,
              '&:disabled': {
                color: colors.buttonDisabledText,
              },
            },
          },
        },
      },
      '& .MuiDataGrid-sortIcon, & .MuiDataGrid-menuIcon, & .MuiDataGrid-filterIcon': {
        color: `${colors.textPrimary} !important`,
      },
      '& .MuiDataGrid-overlay': {
        color: `${colors.textPrimary} !important`,
        backgroundColor: colors.paperBg,
      },
    },
  };

  // Helper function to calculate average impact
  const calculateAverageImpact = (data) => {
    if (!data?.damageScenarios?.length) return 0;

    let totalImpact = 0;
    let count = 0;

    data.damageScenarios.forEach(ds => {
      const details = ds.Details || [];
      details.forEach(detail => {
        if (detail.impacts) {
          const impacts = Object.values(detail.impacts);
          const avg = impacts.reduce((sum, val) => {
            const num = typeof val === 'string'
              ? { Low: 1, Medium: 2, High: 3 }[val] || 0
              : val || 0;
            return sum + num;
          }, 0) / (impacts.length || 1);

          totalImpact += avg;
          count++;
        }
      });
    });

    return count > 0 ? (totalImpact / count).toFixed(1) : 0;
  };

  // Helper function to calculate unmitigated risks
  const calculateUnmitigatedRisks = (data) => {
    if (!data?.riskTreatments?.Details?.length) return 0;

    return data.riskTreatments.Details.filter(
      risk => !risk.risk_treatment || risk.risk_treatment === 'Not Rated'
    ).length;
  };

  // Helper function to calculate coverage percentage
  const calculateCoveragePercentage = (data) => {
    if (!data?.cybersecurity?.length || !data?.threats?.length) return 0;

    const coveredThreats = new Set();
    data.cybersecurity.forEach(control => {
      if (control.related_threats) {
        control.related_threats.forEach(threatId => {
          coveredThreats.add(threatId);
        });
      }
    });

    return Math.round((coveredThreats.size / data.threats.length) * 100) || 0;
  };

  // Helper function to count high feasibility attacks
  const calculateHighFeasibilityAttacks = (data) => {
    if (!data?.attackScenarios?.length) return 0;

    return data.attackScenarios.filter(attack => {
      const feasibility = attack.feasibility || '';
      return typeof feasibility === 'string'
        ? feasibility.toLowerCase() === 'high'
        : feasibility >= 3; // Assuming 1-5 scale where 3+ is high
    }).length;
  };

  const processDashboardData = (data) => {
    // Process the dashboard data and update state
    if (!data) return;

    // Calculate project stats
    const totalComponents = data.components?.length || 0;
    const totalThreats = data.threats?.length || 0;
    const totalDamageScenarios = data.damageScenarios?.length || 0;
    const totalAttackScenarios = data.attackScenarios?.length || 0;
    const cybersecurityData = data.cybersecurity || [];

    // Calculate risk levels
    let high = 0,
      medium = 0,
      low = 0;
    data.riskTreatments.Details?.forEach((risk) => {
      const damage = data.damageScenarios
        .flatMap((ds) => ds.Details || [])
        .find((d) => d._id === risk.damage_id);
      if (damage) {
        const maxImpact = Object.values(damage.impacts || {}).reduce(
          (max, val) => {
            const num =
              typeof val === 'string'
                ? { Low: 1, Medium: 2, High: 3 }[val] || 0
                : val || 0;
            return num > max ? num : max;
          },
          0
        );
        if (maxImpact >= 3) high++;
        else if (maxImpact === 2) medium++;
        else low++;
      }
    });

    // Update state with calculated values
    setProjectStats({
      totalComponents,
      totalThreats,
      totalDamageScenarios,
      totalAttackScenarios,
      risksIdentified: high + medium + low,
      controlsImplemented: cybersecurityData.length,
      averageImpact: calculateAverageImpact(data),
      unmitigatedRisks: calculateUnmitigatedRisks(data),
      coveragePercentage: calculateCoveragePercentage(data),
      highFeasibilityAttacks: calculateHighFeasibilityAttacks(data),
    });

    setRiskLevels({ high, medium, low });
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const baseUrl = configuration.apiBaseUrl;
      const apiEndpoints = [
        { key: 'components', endpoint: `${baseUrl}v1/get_details/assets`, defaultValue: {} },
        { key: 'threats', endpoint: `${baseUrl}v1/get_details/threat_scenarios`, defaultValue: [] },
        { key: 'damageScenarios', endpoint: `${baseUrl}v1/get_details/damage_scenarios`, defaultValue: [] },
        { key: 'attackScenarios', endpoint: `${baseUrl}v1/get_details/attacks`, defaultValue: [] },
        { key: 'cybersecurity', endpoint: `${baseUrl}v1/get_details/cybersecurity`, defaultValue: [] },
        { key: 'riskTreatments', endpoint: `${baseUrl}v1/get/riskDetAndTreat`, defaultValue: {} },
      ];

      const dashboardDataTemp = {};
      apiEndpoints.forEach(({ key, defaultValue }) => {
        dashboardDataTemp[key] = Array.isArray(defaultValue)
          ? [...defaultValue]
          : { ...defaultValue };
      });

      for (const { key, endpoint, defaultValue } of apiEndpoints) {
        try {
          const response = await GET_CALL(modelId, endpoint);
          if (response !== undefined) {
            dashboardDataTemp[key] = Array.isArray(defaultValue)
              ? [...response]
              : { ...response };
          }
        } catch (err) {
          console.error(`Error fetching ${key}:`, err);
          dashboardDataTemp[key] = Array.isArray(defaultValue) ? [] : {};
        }
      }

      setDashboardData(dashboardDataTemp);
      processDashboardData(dashboardDataTemp);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again later.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    await fetchDashboardData();
  };

  const fetchData = async () => {
    await fetchDashboardData();
  };

  useEffect(() => {
    if (!open || !modelId) {
      return;
    }

    fetchDashboardData();
  }, [open, modelId]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: colors.modalBg,
          backgroundImage: 'none',
          borderRadius: 2,
          minHeight: fullScreen ? '100vh' : '80vh',
          maxHeight: fullScreen ? '100vh' : '90vh',
          overflow: 'hidden',
          position: 'relative',
          '&:before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          },
        },
      }}
      TransitionComponent={Slide}
      TransitionProps={{
        direction: 'up',
        timeout: { enter: 300, exit: 200 },
      }}
    >
      <DialogTitle sx={{
        borderBottom: `1px solid ${alpha(colors.borderColor || theme.palette.divider, 0.2)}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        py: 2,
        px: 3,
        bgcolor: colors.modalBg,
        backdropFilter: 'blur(8px)',
      }}>
        <Box display="flex" alignItems="center">
          <AssessmentIcon sx={{ mr: 1.5, color: theme.palette.primary.main }} />
          <Typography variant="h6" component="div" sx={{
            fontWeight: 600,
            background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '0.5px',
          }}>
            Project Dashboard
          </Typography>
        </Box>
        <Box>
          <Tooltip title="Refresh Data" arrow>
            <IconButton
              onClick={handleRefresh}
              disabled={isRefreshing}
              size="small"
              sx={{
                mr: 1,
                transition: theme.transitions.create('transform'),
                '&:hover': {
                  transform: 'rotate(90deg)',
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                },
              }}
            >
              <RefreshIcon
                sx={{
                  color: isRefreshing ? theme.palette.text.disabled : theme.palette.primary.main,
                  animation: isRefreshing ? '$spin 1s linear infinite' : 'none',
                }}
              />
            </IconButton>
          </Tooltip>
          <Tooltip title="Close" arrow>
            <IconButton
              onClick={onClose}
              size="small"
              sx={{
                '&:hover': {
                  bgcolor: alpha(theme.palette.error.main, 0.1),
                  color: theme.palette.error.main,
                },
              }}
            >
              <CloseIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </DialogTitle>
      <DialogContent dividers sx={{
        p: 0,
        position: 'relative',
        '&::-webkit-scrollbar': {
          width: '8px',
          height: '8px',
        },
        '&::-webkit-scrollbar-track': {
          background: alpha(theme.palette.divider, 0.1),
          borderRadius: '4px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: alpha(theme.palette.primary.main, 0.3),
          borderRadius: '4px',
          '&:hover': {
            background: alpha(theme.palette.primary.main, 0.5),
          },
        },
      }}>
        {loading && !isRefreshing ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight={400}
            sx={{
              background: `linear-gradient(135deg, ${alpha(theme.palette.background.default, 0.8)} 0%, ${alpha(theme.palette.background.paper, 0.8)} 100%)`,
            }}
          >
            <Fade in={loading} timeout={500}>
              <Box textAlign="center">
                <CircularProgress size={60} thickness={2} color="primary" />
                <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                  Loading dashboard data...
                </Typography>
              </Box>
            </Fade>
          </Box>
        ) : error ? (
          <Alert
            severity="error"
            sx={{
              m: 2,
              borderRadius: 2,
              '& .MuiAlert-icon': {
                fontSize: 32,
                alignItems: 'center',
              },
            }}
            action={
              <Button
                color="inherit"
                size="small"
                onClick={fetchData}
                disabled={isRefreshing}
                startIcon={<RefreshIcon />}
              >
                Retry
              </Button>
            }
          >
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Error Loading Dashboard
            </Typography>
            <Typography variant="body2">
              {error}
            </Typography>
          </Alert>
        ) : (
          <>
            <Box sx={{ borderBottom: 1, borderColor: colors.tabBorder, mb: 2 }}>
              <Tabs
                value={tabValue}
                onChange={(e, newValue) => setTabValue(newValue)}
                sx={{
                  '& .MuiTabs-indicator': {
                    backgroundColor: colors.logo,
                  },
                }}
              >
                <Tab
                  label="Overview"
                  sx={{
                    color: colors.tabContentClr,
                    '&.Mui-selected': { color: colors.logo },
                  }}
                />
                <Tab
                  label="Risks & Impacts"
                  sx={{
                    color: colors.tabContentClr,
                    '&.Mui-selected': { color: colors.logo },
                  }}
                />
                <Tab
                  label="Threats & Damages"
                  sx={{
                    color: colors.tabContentClr,
                    '&.Mui-selected': { color: colors.logo },
                  }}
                />
                <Tab
                  label="Attacks & Cyber"
                  sx={{
                    color: colors.tabContentClr,
                    '&.Mui-selected': { color: colors.logo },
                  }}
                />
              </Tabs>
            </Box>
            <TabPanel value={tabValue} index={0}>
              <Grid container spacing={1} sx={{ mb: 1 }}>
                <Grid item xs={4} sm={3} md={2}>
                  <StatCard
                    title="Components"
                    value={projectStats.totalComponents}
                    color={colors.chartColors[0]}
                    icon={DevicesIcon}
                  />
                </Grid>
                <Grid item xs={4} sm={3} md={2}>
                  <StatCard
                    title="Threats"
                    value={projectStats.totalThreats}
                    color={colors.chartColors[1]}
                    icon={ReportProblemIcon}
                  />
                </Grid>
                <Grid item xs={4} sm={3} md={2}>
                  <StatCard
                    title="Damages"
                    value={projectStats.totalDamageScenarios}
                    color={colors.chartColors[2]}
                    icon={WarningIcon}
                  />
                </Grid>
                <Grid item xs={4} sm={3} md={2}>
                  <StatCard
                    title="Attacks"
                    value={projectStats.totalAttackScenarios}
                    color={colors.chartColors[3]}
                    icon={GppBadIcon}
                  />
                </Grid>
                <Grid item xs={4} sm={3} md={2}>
                  <StatCard
                    title="Risks"
                    value={projectStats.risksIdentified}
                    color={colors.chartColors[2]}
                    icon={AssessmentIcon}
                  />
                </Grid>
                <Grid item xs={4} sm={3} md={2}>
                  <StatCard
                    title="Controls"
                    value={projectStats.controlsImplemented}
                    color={colors.chartColors[3]}
                    icon={SecurityIcon}
                  />
                </Grid>
                <Grid item xs={4} sm={3} md={2}>
                  <StatCard
                    title="Avg Impact"
                    value={projectStats.averageImpact}
                    color={colors.chartColors[0]}
                    icon={AssessmentIcon}
                  />
                </Grid>
                <Grid item xs={4} sm={3} md={2}>
                  <StatCard
                    title="Unmitigated"
                    value={projectStats.unmitigatedRisks}
                    color={colors.chartColors[1]}
                    icon={WarningIcon}
                  />
                </Grid>
                <Grid item xs={4} sm={3} md={2}>
                  <StatCard
                    title="Coverage %"
                    value={`${projectStats.coveragePercentage}%`}
                    color={colors.chartColors[3]}
                    icon={SecurityIcon}
                  />
                </Grid>
                <Grid item xs={4} sm={3} md={2}>
                  <StatCard
                    title="High Feas"
                    value={projectStats.highFeasibilityAttacks}
                    color={colors.chartColors[1]}
                    icon={GppBadIcon}
                  />
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <EnhancedChartCard 
                    title="Threat Overview" 
                    icon={BarChartIcon}
                    loading={loading}
                  >
                    {overviewBarData.series[0].data.some((v) => v > 0) ? (
                      <BarChart
                        {...overviewBarData}
                        height={300}
                        {...chartOptions}
                        series={overviewBarData.series.map(series => ({
                          ...series,
                          highlightScope: { highlighted: 'item', faded: 'global' },
                        }))}
                        slotProps={{
                          ...chartOptions.slotProps,
                          bar: {
                            style: {
                              rx: 4,
                              transition: 'all 0.3s ease-in-out',
                            },
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
                          No data available
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
                <Grid item xs={12} md={6}>
                  <EnhancedChartCard 
                    title="Risk Distribution" 
                    icon={PieChartIcon}
                    loading={loading}
                  >
                    {riskLevels.high + riskLevels.medium + riskLevels.low > 0 ? (
                      <PieChart
                        series={[
                          {
                            ...riskPieData.series[0],
                            highlightScope: { faded: 'global', highlighted: 'item' },
                            faded: { innerRadius: 30, additionalRadius: -10, color: 'gray' },
                            arcLabel: (params) => {
                              return params.percent > 5 
                                ? `${params.value} (${Math.round(params.percent)}%)` 
                                : '';
                            },
                            arcLabelMinAngle: 15,
                            cornerRadius: 4,
                            paddingAngle: 2,
                            innerRadius: '40%',
                            outerRadius: '80%',
                            cx: '50%',
                            cy: '50%',
                            data: riskPieData.series[0].data.map((item, index) => ({
                              ...item,
                              id: `risk-${index}`,
                            })),
                            valueFormatter: (value, { dataIndex }) => {
                              const total = riskPieData.series[0].data.reduce((sum, item) => sum + item.value, 0);
                              const percentage = Math.round((value / total) * 100);
                              return `${value} (${percentage}%)`;
                            },
                          },
                        ]}
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
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
              <Grid container spacing={1}>
                <Grid item xs={12} md={6}>
                  <Paper
                    elevation={1}
                    sx={{ p: 1, borderRadius: 1, bgcolor: colors.paperBg }}
                  >
                    <Typography variant="subtitle2" sx={{ color: colors.title }}>
                      Impact Distribution
                    </Typography>
                    <Box ref={chartRefs.impact}>
                      {impactBarData.series[0].data.some((v) => v > 0) ? (
                        <BarChart
                          {...impactBarData}
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
                <Grid item xs={12} md={6}>
                  <Paper
                    elevation={1}
                    sx={{ p: 1, borderRadius: 1, bgcolor: colors.paperBg }}
                  >
                    <Typography variant="subtitle2" sx={{ color: colors.title }}>
                      Risk Levels Pie
                    </Typography>
                    {riskLevels.high + riskLevels.medium + riskLevels.low > 0 ? (
                      <PieChart
                        series={riskPieData.series}
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
                  <Paper
                    elevation={1}
                    sx={{ p: 1, borderRadius: 1, bgcolor: colors.paperBg }}
                  >
                    <Typography variant="subtitle2" sx={{ color: colors.title }}>
                      Threats Scenarios by Treatment
                    </Typography>
                    {Object.values(treatmentDistribution).some(v => v > 0) ? (
                      <PieChart
                        series={treatmentPieData.series}
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
              </Grid>
              <Paper
                elevation={1}
                sx={{ p: 1, mt: 1, borderRadius: 1, bgcolor: colors.paperBg }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{ color: colors.title, mb: 1 }}
                >
                  Risks Table
                </Typography>
                <DataGrid
                  rows={riskRows}
                  columns={riskColumns}
                  autoHeight
                  pageSizeOptions={[5]}
                  disableRowSelectionOnClick
                  sx={tableSx}
                />
              </Paper>
            </TabPanel>
            <TabPanel value={tabValue} index={2}>
              <Grid container spacing={1}>
                <Grid item xs={12} md={6}>
                  <Paper
                    elevation={1}
                    sx={{ p: 1, borderRadius: 1, bgcolor: colors.paperBg }}
                  >
                    <Typography variant="subtitle2" sx={{ color: colors.title }}>
                      Threat Types
                    </Typography>
                    <Box ref={chartRefs.threat}>
                      {threatBarData.series[0].data.some((v) => v > 0) ? (
                        <BarChart
                          {...threatBarData}
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
                <Grid item xs={12} md={6}>
                  <Paper
                    elevation={1}
                    sx={{ p: 1, borderRadius: 1, bgcolor: colors.paperBg }}
                  >
                    <Typography variant="subtitle2" sx={{ color: colors.title }}>
                      Threats Timeline
                    </Typography>
                    {timelineData.series[0].data.some((v) => v > 0) ? (
                      <LineChart
                        {...timelineData}
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
              </Grid>
              <Paper
                elevation={1}
                sx={{ p: 1, mt: 1, borderRadius: 1, bgcolor: colors.paperBg }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{ color: colors.title, mb: 1 }}
                >
                  Threats Table
                </Typography>
                <DataGrid
                  rows={threatRows}
                  columns={threatColumns}
                  autoHeight
                  pageSizeOptions={[5]}
                  disableRowSelectionOnClick
                  sx={tableSx}
                />
              </Paper>
              <Paper
                elevation={1}
                sx={{ p: 1, mt: 1, borderRadius: 1, bgcolor: colors.paperBg }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{ color: colors.title, mb: 1 }}
                >
                  Threats and Attack Paths per Asset
                </Typography>
                <DataGrid
                  rows={assetThreatAttack}
                  columns={assetColumns}
                  autoHeight
                  pageSizeOptions={[5]}
                  disableRowSelectionOnClick
                  sx={tableSx}
                />
              </Paper>
              <Paper
                elevation={1}
                sx={{ p: 1, mt: 1, borderRadius: 1, bgcolor: colors.paperBg }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{ color: colors.title, mb: 1 }}
                >
                  Damage Scenarios Table
                </Typography>
                <DataGrid
                  rows={damageRows}
                  columns={damageColumns}
                  autoHeight
                  pageSizeOptions={[5]}
                  disableRowSelectionOnClick
                  sx={tableSx}
                />
              </Paper>
            </TabPanel>
            <TabPanel value={tabValue} index={3}>
              <Grid container spacing={1}>
                <Grid item xs={12} md={6}>
                  <Paper
                    elevation={1}
                    sx={{ p: 1, borderRadius: 1, bgcolor: colors.paperBg }}
                  >
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
                  <Paper
                    elevation={1}
                    sx={{ p: 1, borderRadius: 1, bgcolor: colors.paperBg }}
                  >
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
                  <Paper
                    elevation={1}
                    sx={{ p: 1, borderRadius: 1, bgcolor: colors.paperBg }}
                  >
                    <Typography variant="subtitle2" sx={{ color: colors.title }}>
                      Attack Feasibility
                    </Typography>
                    <Box ref={chartRefs.feas}>
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
              <Paper
                elevation={1}
                sx={{ p: 1, mt: 1, borderRadius: 1, bgcolor: colors.paperBg }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{ color: colors.title, mb: 1 }}
                >
                  Attacks Table
                </Typography>
                <DataGrid
                  rows={attackRows}
                  columns={attackColumns}
                  autoHeight
                  pageSizeOptions={[5]}
                  disableRowSelectionOnClick
                  sx={tableSx}
                />
              </Paper>
              <Paper
                elevation={1}
                sx={{ p: 1, mt: 1, borderRadius: 1, bgcolor: colors.paperBg }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{ color: colors.title, mb: 1 }}
                >
                  Cybersecurity Table
                </Typography>
                <DataGrid
                  rows={cyberRows}
                  columns={cyberColumns}
                  autoHeight
                  pageSizeOptions={[5]}
                  disableRowSelectionOnClick
                  sx={tableSx}
                />
              </Paper>
            </TabPanel>
          </>
        )}
      </DialogContent>
      <DialogActions
        sx={{ p: 1, borderTop: `1px solid ${colors.borderColor}`, bgcolor: colors.modalBg }}
      >
        <Button
          onClick={onClose}
          color="primary"
          variant="outlined"
          size="small"
          sx={{
            color: colors.buttonText,
            borderColor: colors.buttonBorder,
            '&:hover': {
              borderColor: colors.buttonHoverBorder,
              backgroundColor: colors.buttonHoverBg,
            },
          }}
        >
          Close
        </Button>
        <Button
          variant="contained"
          color="primary"
          disabled={loading}
          onClick={exportPDF}
          size="small"
          sx={{
            backgroundColor: colors.primaryButtonBg,
            color: colors.primaryButtonText,
            '&:hover': {
              backgroundColor: colors.primaryButtonHoverBg,
            },
            '&:disabled': {
              backgroundColor: colors.buttonDisabledBg,
              color: colors.buttonDisabledText,
            },
          }}
        >
          {loading ? <CircularProgress size={16} color="inherit" /> : 'Export PDF'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DashboardDialog;