/* eslint-disable */
import React, { useEffect, useState, useRef, useCallback } from 'react';
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
  IconButton,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
  BarChart,
  PieChart,
  LineChart,
  pieArcLabelClasses,
  pieArcClasses,
} from '@mui/x-charts';
import ColorTheme from '../../themes/ColorTheme';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
jsPDF.autoTable = autoTable;
import Chart from 'chart.js/auto';
import { alpha } from '@mui/material/styles';

// Icons
import CategoryIcon from '@mui/icons-material/Category';
import DevicesIcon from '@mui/icons-material/Devices';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SecurityIcon from '@mui/icons-material/Security';
import LinkIcon from '@mui/icons-material/Link';
import WarningIcon from '@mui/icons-material/Warning';
import GppBadIcon from '@mui/icons-material/GppBad';
import CloseIcon from '@mui/icons-material/Close';
import RefreshIcon from '@mui/icons-material/Refresh';
import PieChartIcon from '@mui/icons-material/PieChart';
import BarChartIcon from '@mui/icons-material/BarChart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { GET_CALL } from '../../services/api';
import { configuration } from '../../services/baseApiService';

const StatCard = ({ title, value, color, icon: Icon, loading = false, trend, trendValue }) => {
  const theme = useTheme();
  const colors = ColorTheme();
  const [elevation, setElevation] = useState(2);
  const [isHovered, setIsHovered] = useState(false);
  const cardColor = color || theme.palette.primary.main;
  
  // Determine trend styles
  const getTrendStyles = () => {
    if (!trend) return null;
    const isPositive = trend === 'up';
    return {
      display: 'flex',
      alignItems: 'center',
      mt: 0.5,
      color: isPositive ? theme.palette.success.main : theme.palette.error.main,
      '& svg': {
        fontSize: '1rem',
        ml: 0.5,
      },
    };
  };

  return (
    <Fade in={!loading} timeout={500}>
      <Tooltip
        title={`View details for ${title}`}
        arrow
        TransitionComponent={Zoom}
        enterDelay={300}
        leaveDelay={200}
      >
        <Paper
          elevation={elevation}
          onMouseEnter={() => {
            setElevation(8);
            setIsHovered(true);
          }}
          onMouseLeave={() => {
            setElevation(2);
            setIsHovered(false);
          }}
          sx={{
            p: 2.5,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 3,
            bgcolor: colors.paperBg || 'background.paper',
            border: `1px solid ${alpha(colors.borderColor || theme.palette.divider, 0.2)}`,
            minWidth: 140,
            transition: theme.transitions.create(
              ['all', 'transform', 'box-shadow'],
              {
                duration: theme.transitions.duration.shorter,
                easing: theme.transitions.easing.easeInOut,
              }
            ),
            '&:hover': {
              transform: 'translateY(-6px)',
              boxShadow: `0 12px 24px -4px ${alpha(cardColor, 0.12)}`,
              borderColor: alpha(cardColor, 0.3),
            },
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 4,
              background: `linear-gradient(90deg, ${cardColor} 0%, ${alpha(cardColor, 0.7)} 100%)`,
              opacity: 0.8,
              transition: 'all 0.3s ease-in-out',
            },
            '&:hover::before': {
              opacity: 1,
              height: 5,
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
              minHeight: 140,
              p: 2,
              gap: 1.5
            }}>
              <CircularProgress 
                size={36} 
                thickness={3} 
                sx={{ 
                  color: alpha(cardColor, 0.8),
                  mb: 1,
                  '& .MuiCircularProgress-circle': {
                    strokeLinecap: 'round',
                    stroke: `url(#loading-gradient-${cardColor.replace('#', '')})`,
                  },
                }} 
              />
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'text.secondary',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  opacity: 0.8
                }}
              >
                Loading...
              </Typography>
              <Box 
                sx={{ 
                  width: '60%', 
                  height: 4, 
                  background: `linear-gradient(90deg, ${alpha(cardColor, 0.2)} 0%, ${alpha(cardColor, 0.1)} 100%)`,
                  borderRadius: 2,
                  mt: 0.5
                }}
              />
            </Box>
          ) : (
            <Box sx={{ width: '100%' }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 2,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: theme.palette.text.secondary,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    fontSize: '0.7rem',
                    opacity: 0.9,
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
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      bgcolor: alpha(cardColor, 0.1),
                      '& svg': {
                        color: cardColor,
                        fontSize: 20,
                        transition: theme.transitions.create('transform', {
                          duration: theme.transitions.duration.standard,
                        }),
                      },
                    }}
                  >
                    <Icon />
                  </Box>
                )}
              </Box>
              
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  fontSize: '2rem',
                  lineHeight: 1.2,
                  mb: 1,
                  background: `linear-gradient(135deg, ${cardColor} 0%, ${alpha(cardColor, 0.8)} 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  transition: 'all 0.3s ease-in-out',
                  transform: isHovered ? 'scale(1.05)' : 'scale(1)',
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
                  <Typography variant="caption" sx={{ ml: 0.5, fontWeight: 600 }}>
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
                  height: 4,
                  background: `linear-gradient(90deg, ${cardColor} 0%, ${alpha(cardColor, 0.1)} 100%)`,
                  opacity: isHovered ? 0.8 : 0.4,
                  transition: 'opacity 0.3s ease-in-out',
                }}
              />
            </Box>
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
    totalDerivedDamageScenarios: 0,
    totalAttackScenarios: 0,
    risksIdentified: 0,
    cyberGoals: 0,
    cyberClaims: 0,
    cyberRequirements: 0,
    cyberControls: 0,
    totalConnections: 0,
    uniqueProperties: 0
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
          { key: 'riskTreatments', endpoint: `${baseUrl}v1/get_details/riskDetAndTreat`, defaultValue: {} },
        ];

        const dashboardDataTemp = {};
        apiEndpoints.forEach(({ key, defaultValue }) => {
          dashboardDataTemp[key] = Array.isArray(defaultValue)
            ? [...defaultValue]
            : { ...defaultValue };
        });

        for (const { key, endpoint, defaultValue } of apiEndpoints) {
          try {
            console.log(`Fetching data for ${key} from ${endpoint}`);
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

        // Count actual asset nodes (filter out edges and other non-asset nodes)
        const allNodes = dashboardDataTemp.components?.template?.nodes || [];
        
        // Check for different possible node type identifiers
        const assetNodes = allNodes.filter(node => {
          if (!node || !node.id) return false;
          
          return !node.id.startsWith('reactflow__edge') && 
                 (node.type === 'default' || 
                  node.type === 'asset' || 
                  (node.data && node.data.type === 'asset') ||
                  (node.data && node.data.label));
        });
        
        const comps = assetNodes.length;

        // Count connections (edges between nodes)
        const connections = (dashboardDataTemp.components.template?.edges || []).length;

        // Count unique properties across all nodes
        const allProperties = new Set();
        assetNodes.forEach(node => {
          if (node.properties && Array.isArray(node.properties)) {
            node.properties.forEach(prop => allProperties.add(prop));
          }
        });

        // Count threats - handle both array and object with Details array, similar to damageScenarios
        let threatsData = [];
        if (Array.isArray(dashboardDataTemp.threats) && dashboardDataTemp.threats.length > 0) {
          // Get threats from Details array in the first item
          threatsData = dashboardDataTemp.threats[0]?.Details || [];
        }
        const threats = threatsData.length;
        const damages = dashboardDataTemp.damageScenarios.reduce(
          (sum, d) => sum + (d.Details?.length || 0),
          0
        );
        const attacks = dashboardDataTemp.attackScenarios.reduce(
          (sum, a) => sum + (a.scenes?.length || 0),
          0
        );
        const risks = dashboardDataTemp.riskTreatments.Details?.length || 0;
        // Count cybersecurity items by type
        const cyberItems = (dashboardDataTemp.cybersecurity || []).reduce((acc, item) => {
          if (item && item.type) {
            switch(item.type) {
              case 'cybersecurity_goals':
                acc.goals = Array.isArray(item.scenes) ? item.scenes.length : 0;
                break;
              case 'cybersecurity_claims':
                acc.claims = Array.isArray(item.scenes) ? item.scenes.length : 0;
                break;
              case 'cybersecurity_requirements':
                acc.requirements = Array.isArray(item.scenes) ? item.scenes.length : 0;
                break;
              case 'cybersecurity_controls':
                acc.controls = Array.isArray(item.scenes) ? item.scenes.length : 0;
                break;
              default:
                console.log('Unknown cybersecurity type:', item.type);
            }
          }
          return acc;
        }, { goals: 0, claims: 0, requirements: 0, controls: 0 });

        // Additional stats
        let totalImpacts = 0,
          impactCount = 0;
        let safety = 0,
          financial = 0,
          operational = 0,
          privacy = 0;
          
        // Process impact data from damage scenarios
        dashboardDataTemp.damageScenarios.forEach((scenario) => {
          // Process Details array at the top level
          if (scenario.Details && Array.isArray(scenario.Details)) {
            scenario.Details.forEach(detail => {
              if (detail.impacts) {
                processImpactData(detail.impacts);
              }
            });
          }
          
          // Process Derivations array
          if (scenario.Derivations && Array.isArray(scenario.Derivations)) {
            scenario.Derivations.forEach(derivation => {
              if (derivation.impacts) {
                processImpactData(derivation.impacts);
              }
              // Also check for Details inside Derivations
              if (derivation.Details && Array.isArray(derivation.Details)) {
                derivation.Details.forEach(detail => {
                  if (detail.impacts) {
                    processImpactData(detail.impacts);
                  }
                });
              }
            });
          }
          
          // Handle case where impacts are direct properties of the scenario
          if (scenario.impacts) {
            processImpactData(scenario.impacts);
          }
        });
        
        // Helper function to process impact data
        function processImpactData(impacts) {
          // Handle the case where impacts is an object with impact types as keys
          if (impacts && typeof impacts === 'object') {
            Object.entries(impacts).forEach(([impactType, impactValue]) => {
              // Skip if impact value is null, undefined, or empty string
              if (impactValue == null || impactValue === '') return;
              
              // Extract the base impact type (remove ' Impact' suffix if present)
              const baseImpactType = impactType.replace(' Impact', '').trim();
              
              // Convert impact value to numeric score
              const num = typeof impactValue === 'string'
                ? { 
                    'Low': 1, 
                    'Minor': 1,
                    'Medium': 2, 
                    'Moderate': 2,
                    'High': 3,
                    'Major': 3,
                    'Severe': 3
                  }[impactValue.trim()] || 0
                : typeof impactValue === 'number' ? impactValue : 0;
                
              if (num > 0) {  // Only count valid impacts
                totalImpacts += num;
                impactCount++;
                
                // Categorize impact by type (case-insensitive)
                const lowerType = baseImpactType.toLowerCase();
                if (lowerType.includes('safety')) {
                  safety += num;
                } else if (lowerType.includes('financial')) {
                  financial += num;
                } else if (lowerType.includes('operational')) {
                  operational += num;
                } else if (lowerType.includes('privacy')) {
                  privacy += num;
                }
              }
            });
          }
        }
        
        // Calculate average impact
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

        // Use the correct damage scenarios count from the Derivations array
        const finalDamageScenarios = damageScenariosData.length;
        const finalDerivedDamageScenarios = derivedDamageScenarios.length;
        
        setProjectStats(prevStats => ({
          ...prevStats,
          totalComponents: comps,
          totalThreats: threats,
          totalDamageScenarios: finalDamageScenarios,
          totalDerivedDamageScenarios: finalDerivedDamageScenarios,
          totalAttackScenarios: attacks,
          risksIdentified: risks,
          cyberGoals: cyberItems?.goals || 0,
          cyberClaims: cyberItems?.claims || 0,
          cyberRequirements: cyberItems?.requirements || 0,
          cyberControls: cyberItems?.controls || 0,
          averageImpact: avgImpact,
          unmitigatedRisks: unmitigated,
          coveragePercentage: coverage,
          highFeasibilityAttacks: highFeas,
          totalConnections: connections,
          uniqueProperties: allProperties.size,
        }));

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

        // Process attack scenarios per threat
        const attackCountsPerThreat = {};
        dashboardDataTemp.attackScenarios.forEach(attack => {
          attack.scenes?.forEach(scene => {
            const threatId = scene.threat_id || 'Unknown';
            attackCountsPerThreat[threatId] = (attackCountsPerThreat[threatId] || 0) + 1;
          });
        });
        
        const topThreats = Object.entries(attackCountsPerThreat)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([threatId, count], index) => ({
            scenario: `Scenario ${index + 1}`,
            count,
            threatId
          }));
        setAttackPerScenario(topThreats);

        // Process threats and attacks per asset
        const threatIdsWithAttacksSet = new Set();
        const assetThreatAttackTemp = [];

        // First, process all attack scenes to collect threat IDs and count attacks per asset
        const attackCountsByAsset = {};
        dashboardDataTemp.attackScenarios.forEach(attack => {
          attack.scenes?.forEach(scene => {
            if (scene.threat_id) {
              threatIdsWithAttacksSet.add(scene.threat_id);
            }
            if (scene.asset_id) {
              attackCountsByAsset[scene.asset_id] = (attackCountsByAsset[scene.asset_id] || 0) + 1;
            }
          });
        });
        
        setThreatIdsWithAttacks(threatIdsWithAttacksSet);

        // Then process all assets to count threats and attacks
        if (dashboardDataTemp.components.template?.nodes) {
          dashboardDataTemp.components.template.nodes.forEach((asset, index) => {
            if (!asset || !asset.id) return;
            
            const assetId = asset.id;
            let threatCount = 0;
            
            // Count threats for this asset by checking all threat details
            dashboardDataTemp.threats.forEach(threatGroup => {
              if (threatGroup.Details) {
                threatCount += threatGroup.Details.filter(detail => 
                  detail.asset_id === assetId || 
                  detail.nodeId === assetId
                ).length;
              }
            });
            
            assetThreatAttackTemp.push({
              id: `asset-${assetId || index}`,
              assetId: asset.data?.label || assetId,
              threatCount,
              attackCount: attackCountsByAsset[assetId] || 0
            });
          });
        }
        
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
          impactDistribution.safety || 0,
          impactDistribution.financial || 0,
          impactDistribution.operational || 0,
          impactDistribution.privacy || 0,
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
    { field: 'id', headerName: 'ID', width: 100 },
    { field: 'name', headerName: 'Name', width: 200 },
    { field: 'loss', headerName: 'Loss Type', width: 150 },
  ];

  // Get damage scenarios data from the Derivations array in the first item
  const getDamageScenariosData = () => {
    if (Array.isArray(dashboardData.damageScenarios) && dashboardData.damageScenarios.length > 0) {
      return dashboardData.damageScenarios[0]?.Derivations || [];
    } else if (dashboardData.damageScenarios?.Details) {
      return Array.isArray(dashboardData.damageScenarios.Details)
        ? dashboardData.damageScenarios.Details
        : [];
    }
    return [];
  };

  const damageRows = getDamageScenariosData().map((ds, index) => ({
    ...ds,
    id: ds.id || `ds-${index}`,
    name: ds.name || `Damage Scenario ${index + 1}`,
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
      { title: 'Derived Damages', value: projectStats.totalDerivedDamageScenarios, color: colors.chartColors[4] },
      { title: 'Attacks', value: projectStats.totalAttackScenarios, color: colors.chartColors[3] },
      { title: 'Risks', value: projectStats.risksIdentified, color: colors.chartColors[2] },
      { title: 'Controls', value: projectStats.controlsImplemented, color: colors.chartColors[3] },
      { title: 'Avg Impact', value: projectStats.averageImpact, color: colors.chartColors[0] },
      { title: 'Unmitigated', value: projectStats.unmitigatedRisks, color: colors.chartColors[1] },
      { title: 'Coverage %', value: `${projectStats.coveragePercentage}%`, color: colors.chartColors[3] },
      { title: 'High Feas', value: projectStats.highFeasibilityAttacks, color: colors.chartColors[1] },
      { title: 'Connections', value: projectStats.totalConnections, color: colors.chartColors[0] },
      { title: 'Properties', value: projectStats.uniqueProperties, color: colors.chartColors[2] },
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

    // Count actual asset nodes (filter out edges and other non-asset nodes)
    const allNodes = data.components?.template?.nodes || [];
    const assetNodes = allNodes.filter(node => {
      if (!node || !node.id) return false;
      return !node.id.startsWith('reactflow__edge') && 
             (node.type === 'default' || 
              node.type === 'asset' || 
              (node.data && node.data.type === 'asset') ||
              (node.data && node.data.label));
    });
    
    let threatsData = [];
    let damageScenariosData = [];
    let derivedDamageScenarios = [];
    
    if (Array.isArray(data.threats) && data.threats.length > 0) {
      threatsData = data.threats[0]?.Details || [];
    }
    
    if (Array.isArray(data.damageScenarios) && data.damageScenarios.length > 0) {
      // Get standard damage scenarios from Derivations array in the first item
      damageScenariosData = data.damageScenarios[0]?.Derivations || [];
      derivedDamageScenarios = data.damageScenarios[1]?.Details || [];
    }
    
    const totalThreats = threatsData.length;
    const totalDerivedDamageScenarios = derivedDamageScenarios.length;
    const totalDamageScenarios = damageScenariosData.length;
    const totalComponents = assetNodes.length;
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
    setProjectStats(prevStats => ({
      ...prevStats,
      totalComponents,
      totalThreats,
      totalDamageScenarios,
      totalDerivedDamageScenarios,
      totalAttackScenarios,
      risksIdentified: high + medium + low,
      controlsImplemented: cybersecurityData.length,
      totalConnections: data.components?.template?.edges?.length || 0,
      uniqueProperties: new Set(data.components?.template?.nodes?.flatMap(node => node.properties || [])).size,
    }));

    setRiskLevels({ high, medium, low });
  };

  // Memoized data fetching function to prevent unnecessary re-renders
  const fetchDashboardData = useCallback(async () => {
    if (!modelId) return;
    
    const isMounted = { current: true };
    
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

      // Process API responses
      const processResponse = (response, defaultValue) => {
        if (response === undefined) return Array.isArray(defaultValue) ? [] : {};
        return Array.isArray(defaultValue) 
          ? (Array.isArray(response) ? [...response] : [])
          : (response ? { ...response } : {});
      };

      // Fetch all data
      const results = {};
      for (const { key, endpoint, defaultValue } of apiEndpoints) {
        if (!isMounted.current) return;
        
        try {
          const startTime = Date.now();
          const response = await GET_CALL(modelId, endpoint);
          const duration = Date.now() - startTime;
          console.log(`[API] ${key} response (${duration}ms):`, response);
          results[key] = processResponse(response, defaultValue);
          console.log(`[API] Processed ${key} data:`, results[key]);
        } catch (err) {
          results[key] = Array.isArray(defaultValue) ? [] : {};
        }
      }

      // Only update state if component is still mounted
      if (isMounted.current) {
        setDashboardData(results);
        processDashboardData(results);
      }
      
    } catch (err) {
      console.error('Error in fetchDashboardData:', err);
      if (isMounted.current) {
        setError('Failed to load dashboard data. Please try again later.');
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
        setIsRefreshing(false);
      }
    }
    
    return () => {
      isMounted.current = false;
    };
  }, [modelId]); // Only re-create when modelId changes

  const fetchData = async () => {
    await fetchDashboardData();
  };

  useEffect(() => {
    if (!open || !modelId) {
      return;
    }

    fetchDashboardData();
  }, [open, modelId, fetchDashboardData]);

  const handleRefresh = async () => {
    await fetchDashboardData();
  };

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
            background: `linear-gradient(90deg, ${alpha(theme.palette.background.default, 0.8)} 0%, ${alpha(theme.palette.background.paper, 0.8)} 100%)`,
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
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={4} sm={3} md={2} lg={1}>
                  <StatCard
                    title="Assets"
                    value={projectStats.totalComponents}
                    color={colors.chartColors[0]}
                    icon={CategoryIcon}
                    loading={loading}
                  />
                </Grid>
                <Grid item xs={4} sm={3} md={2} lg={1}>
                  <StatCard
                    title="Properties"
                    value={projectStats.uniqueProperties || 0}
                    color={colors.chartColors[1]}
                    icon={SecurityIcon}
                    loading={loading}
                  />
                </Grid>
                <Grid item xs={4} sm={3} md={2} lg={1}>
                  <StatCard
                    title="Connections"
                    value={projectStats.totalConnections || 0}
                    color={colors.chartColors[2]}
                    icon={LinkIcon}
                    loading={loading}
                  />
                </Grid>
                <Grid item xs={4} sm={3} md={2} lg={1}>
                  <StatCard
                    title="Damages"
                    value={projectStats.totalDamageScenarios}
                    color={colors.chartColors[3]}
                    icon={WarningIcon}
                  />
                </Grid>
                <Grid item xs={4} sm={3} md={2} lg={1}>
                  <StatCard
                    title="Derived Dmg"
                    value={projectStats.totalDerivedDamageScenarios}
                    color={colors.chartColors[4]}
                    icon={WarningIcon}
                    loading={loading}
                  />
                </Grid>
                <Grid item xs={4} sm={3} md={2} lg={1}>
                  <StatCard
                    title="Threats"
                    value={projectStats.totalThreats}
                    color={colors.chartColors[5]}
                    icon={WarningIcon}
                    loading={loading}
                  />
                </Grid>
                <Grid item xs={4} sm={3} md={2} lg={1}>
                  <StatCard
                    title="Attacks"
                    value={projectStats.totalAttackScenarios}
                    color={colors.chartColors[1]}
                    icon={GppBadIcon}
                  />
                </Grid>
                <Grid item xs={4} sm={3} md={2} lg={1}>
                  <StatCard
                    title="Goals"
                    value={projectStats.cyberGoals || 0}
                    color={colors.chartColors[2]}
                    icon={SecurityIcon}
                    loading={loading}
                  />
                </Grid>
                <Grid item xs={4} sm={3} md={2} lg={1}>
                  <StatCard
                    title="Claims"
                    value={projectStats.cyberClaims || 0}
                    color={colors.chartColors[3]}
                    icon={AssessmentIcon}
                    loading={loading}
                  />
                </Grid>
                <Grid item xs={4} sm={3} md={2} lg={1}>
                  <StatCard
                    title="Reqs"
                    value={projectStats.cyberRequirements || 0}
                    color={colors.chartColors[4]}
                    icon={WarningIcon}
                    loading={loading}
                  />
                </Grid>
                <Grid item xs={4} sm={3} md={2} lg={1}>
                  <StatCard
                    title="Controls"
                    value={projectStats.cyberControls || 0}
                    color={colors.chartColors[5]}
                    icon={SecurityIcon}
                    loading={loading}
                  />
                </Grid>
              </Grid>
              <Grid container spacing={2} sx={{ mt: 1 }}>
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
              <Grid container spacing={2} sx={{ mt: 1 }}>
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
              <Grid container spacing={2} sx={{ mt: 1 }}>
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
              <Grid container spacing={2} sx={{ mt: 1 }}>
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