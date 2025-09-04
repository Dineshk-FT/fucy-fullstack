/*eslint-disable*/
import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Tabs,
  Tab,
  Typography,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Alert,
  Tooltip,
  Fade,
  Slide,
  IconButton,
} from '@mui/material';
import ColorTheme from '../../themes/ColorTheme';
import { alpha } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import RefreshIcon from '@mui/icons-material/Refresh';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { GET_CALL } from '../../services/api';
import { configuration } from '../../services/baseApiService';
import StatCard from './StatCard';
import TabPanel from './TabPanel';
import EnhancedChartCard from './EnhancedChartCard';
import OverviewContent from './OverviewContent';
import RisksContent from './RisksContent';
import ThreatsContent from './ThreatsContent';
import AttacksContent from './AttacksContent';

const apiCache = new Map();
const PENDING_REQUESTS = new Map();

const DashboardDialog = ({ open, onClose, modelId }) => {
  const theme = useTheme();
  const colors = ColorTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const abortControllerRef = useRef(new AbortController());
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
  const [threatIdsWithAttacks, setThreatIdsWithAttacks] = useState(new Set());
  const [overallRisk, setOverallRisk] = useState('Low');
  const [tabValue, setTabValue] = useState(0);

  const chartRefs = {
    overview: useRef(null),
    impact: useRef(null),
    threat: useRef(null),
    feas: useRef(null),
  };

  const fetchWithCache = useCallback(async (endpoint, forceRefresh = false) => {
    const cacheKey = `${modelId}:${endpoint}`;
    
    // Return cached data if available and not forcing refresh
    if (!forceRefresh && apiCache.has(cacheKey)) {
      return apiCache.get(cacheKey);
    }

    // If there's already a pending request, return its promise
    if (PENDING_REQUESTS.has(cacheKey)) {
      return PENDING_REQUESTS.get(cacheKey);
    }

    // Create new request
    const requestPromise = (async () => {
      try {
        const response = await GET_CALL(modelId, endpoint, { 
          signal: abortControllerRef.current.signal 
        });
        apiCache.set(cacheKey, response);
        return response;
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error(`Error in fetchWithCache for ${endpoint}:`, error);
          // If we have cached data, return it even if refresh fails
          if (apiCache.has(cacheKey)) {
            console.log('Returning cached data due to error');
            return apiCache.get(cacheKey);
          }
          throw error;
        }
      } finally {
        PENDING_REQUESTS.delete(cacheKey);
      }
    })();
    
    PENDING_REQUESTS.set(cacheKey, requestPromise);
    return requestPromise;
  }, [modelId]);

  const fetchDashboardData = useCallback(async (forceRefresh = false) => {
    if (!modelId) return;

    // Only show loading state on initial load, not on refresh
    if (!forceRefresh) {
      setLoading(true);
    }
    setError(null);
    setIsRefreshing(forceRefresh);

    try {
      // Process API endpoints in parallel with error handling
      const apiEndpoints = [
        { key: 'components', endpoint: `${configuration.apiBaseUrl}v1/get_details/assets`, defaultValue: {} },
        { key: 'threats', endpoint: `${configuration.apiBaseUrl}v1/get_details/threat_scenarios`, defaultValue: [] },
        { key: 'damageScenarios', endpoint: `${configuration.apiBaseUrl}v1/get_details/damage_scenarios`, defaultValue: [] },
        { key: 'attackScenarios', endpoint: `${configuration.apiBaseUrl}v1/get_details/attacks`, defaultValue: [] },
        { key: 'cybersecurity', endpoint: `${configuration.apiBaseUrl}v1/get_details/cybersecurity`, defaultValue: [] },
        { key: 'riskTreatments', endpoint: `${configuration.apiBaseUrl}v1/get/riskDetAndTreat`, defaultValue: {} },
      ];

      const dashboardDataTemp = {};
      const apiCalls = apiEndpoints.map(async ({ key, endpoint, defaultValue }) => {
        try {
          const response = await fetchWithCache(endpoint, forceRefresh);
          dashboardDataTemp[key] = Array.isArray(defaultValue)
            ? Array.isArray(response)
              ? response
              : []
            : typeof response === 'object' && response !== null
              ? response
              : { ...defaultValue };
        } catch (error) {
          console.error(`Error processing ${key}:`, error);
          dashboardDataTemp[key] = Array.isArray(defaultValue) 
            ? [...defaultValue] 
            : { ...defaultValue };
        }
      });

      await Promise.all(apiCalls);
      setDashboardData(dashboardDataTemp);

      const allNodes = dashboardDataTemp.components?.template?.nodes || [];
      const assetNodes = allNodes.filter(node => {
        if (!node || !node.id) return false;
        return !node.id.startsWith('reactflow__edge') &&
               (node.type === 'default' ||
                node.type === 'asset' ||
                (node.data && node.data.type === 'asset') ||
                (node.data && node.data.label));
      });

      const totalComponents = assetNodes.length;
      const totalConnections = dashboardDataTemp.components?.template?.edges?.length || 0;
      let threatsData = [];
      let damageScenariosData = [];
      let derivedDamageScenarios = [];

      if (Array.isArray(dashboardDataTemp.threats) && dashboardDataTemp.threats.length > 0) {
        threatsData = dashboardDataTemp.threats[0]?.Details || [];
      }
      if (Array.isArray(dashboardDataTemp.damageScenarios) && dashboardDataTemp.damageScenarios.length > 0) {
        damageScenariosData = dashboardDataTemp.damageScenarios[0]?.Derivations || [];
        derivedDamageScenarios = dashboardDataTemp.damageScenarios[1]?.Details || [];
      }

      const totalThreats = threatsData.length;
      const totalDamageScenarios = damageScenariosData.length;
      const totalDerivedDamageScenarios = derivedDamageScenarios.length;
      const totalAttackScenarios = dashboardDataTemp.attackScenarios.reduce(
        (sum, a) => sum + (a.scenes?.length || 0),
        0
      );

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
          }
        }
        return acc;
      }, { goals: 0, claims: 0, requirements: 0, controls: 0 });

      setCyberBreakdown({
        goals: cyberItems.goals,
        claims: cyberItems.claims,
        requirements: cyberItems.requirements,
        controls: cyberItems.controls,
      });

      setProjectStats({
        totalComponents,
        totalThreats,
        totalDamageScenarios,
        totalDerivedDamageScenarios,
        totalAttackScenarios,
        // Count all risk treatments, regardless of whether they have attack_scene or not
        risksIdentified: Array.isArray(dashboardDataTemp.riskTreatments) 
          ? dashboardDataTemp.riskTreatments.length 
          : dashboardDataTemp.riskTreatments.Details?.length || 0,
        cyberGoals: cyberItems.goals,
        cyberClaims: cyberItems.claims,
        cyberRequirements: cyberItems.requirements,
        cyberControls: cyberItems.controls,
        totalConnections,
        averageImpact: calculateAverageImpact(dashboardDataTemp),
        unmitigatedRisks: calculateUnmitigatedRisks(dashboardDataTemp),
        coveragePercentage: calculateCoveragePercentage(dashboardDataTemp),
        highFeasibilityAttacks: calculateHighFeasibilityAttacks(dashboardDataTemp),
      });

      let high = 0, medium = 0, low = 0;
      
      if (dashboardDataTemp.riskTreatments?.Details?.length > 0) {
        dashboardDataTemp.riskTreatments.Details.forEach((risk) => {
          try {
            // Check if attack_scene exists and has an overall_rating
            if (risk.attack_scene?.overall_rating) {
              const rating = String(risk.attack_scene.overall_rating).toLowerCase();
              if (rating.includes('high')) high++;
              else if (rating.includes('medium')) medium++;
              else if (rating.includes('low')) low++;
            } else {
              // Fallback to impact calculation if no attack_scene rating
              const allDerivations = dashboardDataTemp.damageScenarios.flatMap(ds => ds.Derivations || []);
              const damage = allDerivations.find(d => d?._id === risk.damage_id);
              if (damage?.impacts) {
                const maxImpact = Object.entries(damage.impacts).reduce((max, [_, impactValue]) => {
                  if (impactValue === null || impactValue === undefined || impactValue === '') return max;
                  const num = typeof impactValue === 'string'
                    ? {
                        'low': 1, 'low ': 1, 'low_impact': 1, 'low impact': 1,
                        'medium': 2, 'medium ': 2, 'medium_impact': 2, 'medium impact': 2,
                        'high': 3, 'high ': 3, 'high_impact': 3, 'high impact': 3,
                        'Low': 1, 'Medium': 2, 'High': 3
                      }[String(impactValue).toLowerCase().trim()] || 0
                    : typeof impactValue === 'number' ? impactValue : 0;
                  return num > max ? num : max;
                }, 0);
                
                if (maxImpact >= 2.5) high++;
                else if (maxImpact >= 1.5) medium++;
                else if (maxImpact > 0) low++;
              } else {
                medium++; // Default to medium if no impacts found
              }
            }
          } catch (riskError) {
            console.error('Error processing risk:', risk, riskError);
            medium++; // Default to medium on error
          }
        });
      }
      
      setRiskLevels({ high, medium, low });
      setOverallRisk(high > 5 ? 'High' : high > 0 || medium > 5 ? 'Medium' : 'Low');

      const derived = dashboardDataTemp.threats.find((t) => t.type === 'derived')?.Details?.length || 0;
      const userDefined = dashboardDataTemp.threats.find((t) => t.type === 'User-defined')?.length || 0;
      setThreatTypes({ derived, userDefined });

      const impactBreakdown = {
        safety: { high: 0, medium: 0, low: 0 },
        financial: { high: 0, medium: 0, low: 0 },
        operational: { high: 0, medium: 0, low: 0 },
        privacy: { high: 0, medium: 0, low: 0 }
      };

      dashboardDataTemp.damageScenarios.forEach(scenario => {
        const derivations = scenario.Derivations || [];
        const details = scenario.Details || [];
        [...derivations, ...details].forEach(item => {
          if (item.impacts) {
            Object.entries(item.impacts).forEach(([impactType, impactValue]) => {
              const baseType = impactType.replace(' Impact', '').toLowerCase();
              const severity = String(impactValue).toLowerCase().trim();
              if (severity === 'high' || severity === 'severe' || severity === 'major') {
                if (baseType.includes('safety')) impactBreakdown.safety.high++;
                else if (baseType.includes('financial')) impactBreakdown.financial.high++;
                else if (baseType.includes('operational')) impactBreakdown.operational.high++;
                else if (baseType.includes('privacy')) impactBreakdown.privacy.high++;
              } // add for medium, low if needed
            });
          }
        });
      });

      const impactScores = {
        safety: impactBreakdown.safety.high * 3 + impactBreakdown.safety.medium * 2 + impactBreakdown.safety.low,
        financial: impactBreakdown.financial.high * 3 + impactBreakdown.financial.medium * 2 + impactBreakdown.financial.low,
        operational: impactBreakdown.operational.high * 3 + impactBreakdown.operational.medium * 2 + impactBreakdown.operational.low,
        privacy: impactBreakdown.privacy.high * 3 + impactBreakdown.privacy.medium * 2 + impactBreakdown.privacy.low
      };
      setImpactDistribution(impactScores);

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

      const attackCountsPerThreat = {};
      dashboardDataTemp.attackScenarios.forEach((attack, attackIndex) => {
        attack.scenes?.forEach((scene, sceneIndex) => {
          const threatId = scene.threat_id || 'Unknown';
          attackCountsPerThreat[threatId] = (attackCountsPerThreat[threatId] || 0) + 1;
        });
      });

      const topThreats = Object.entries(attackCountsPerThreat)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([threatId, count], index) => {
          const threatDetails = dashboardDataTemp.threats.flatMap(t => t.Details || [])
            .find(t => t.rowId === threatId || t._id === threatId);
          return {
            scenario: threatDetails?.damage_name || `Scenario ${index + 1}`,
            count,
            threatId,
            description: threatDetails?.description || ''
          };
        });
      setAttackPerScenario(topThreats);

      const threatIdsWithAttacksSet = new Set();
      dashboardDataTemp.attackScenarios.forEach(attack => {
        attack.scenes?.forEach(scene => {
          if (scene.threat_id) {
            threatIdsWithAttacksSet.add(scene.threat_id);
          }
        });
      });
      setThreatIdsWithAttacks(threatIdsWithAttacksSet);

    } catch (err) {
      console.error('Error in fetchDashboardData:', err);
      if (err.name !== 'AbortError') {
        setError('Failed to load dashboard data. Some data might be outdated.');
      }
    } finally {
      if (!forceRefresh) {
        setLoading(false);
      }
      setIsRefreshing(false);
    }
  }, [modelId]);

  useEffect(() => {
    if (!open || !modelId) {
      return;
    }
    const controller = new AbortController();
    const fetchData = async () => {
      try {
        await fetchDashboardData();
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error in fetchData:', error);
          setError('Failed to load dashboard data. Please try again.');
          setLoading(false);
          setIsRefreshing(false);
        }
      }
    };
    fetchData();
    return () => {
      controller.abort();
    };
  }, [open, modelId, fetchDashboardData]);

  const handleRefresh = useCallback(async () => {
    try {
      setIsRefreshing(true);
      setError(null);
      // Clear the cache for all endpoints
      const apiEndpoints = [
        'assets',
        'threat_scenarios',
        'damage_scenarios',
        'attacks',
        'cybersecurity',
        'riskDetAndTreat'
      ];
      apiEndpoints.forEach(endpoint => {
        const cacheKey = `${modelId}:${configuration.apiBaseUrl}v1/get_details/${endpoint}`;
        apiCache.delete(cacheKey);
      });
      
      // Create a new abort controller for the refresh
      abortControllerRef.current.abort();
      abortControllerRef.current = new AbortController();
      
      // Force refresh all data
      await fetchDashboardData(true);
    } catch (error) {
      console.error('Error during refresh:', error);
      if (error.name !== 'AbortError') {
        setError('Failed to refresh data. Some data might be outdated.');
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [modelId, fetchDashboardData]);

  const overviewRiskCounts = useMemo(() => {
    const counts = { high: 0, medium: 0, low: 0 };
    
    try {
      // Check if riskTreatments is an array (direct response) or has a Details property
      const riskData = Array.isArray(dashboardData.riskTreatments) 
        ? dashboardData.riskTreatments 
        : dashboardData.riskTreatments?.Details || [];
      
      if (!Array.isArray(riskData)) {
        console.warn('Risk treatments data is not in expected format:', dashboardData.riskTreatments);
        return counts;
      }

      riskData.forEach((item) => {
        try {
          // Handle different possible property paths for the rating
          const rating = (
            item?.attack_scene?.overall_rating ||
            item?.overall_rating ||
            item?.risk_level ||
            ''
          ).toLowerCase();
          
          if (rating.includes('high')) counts.high++;
          else if (rating.includes('medium')) counts.medium++;
          else if (rating.includes('low')) counts.low++;
        } catch (error) {
          console.error('Error processing risk item:', error, item);
        }
      });
      
    } catch (error) {
      console.error('Error calculating risk distribution:', error);
    }
    
    return counts;
  }, [dashboardData.riskTreatments]);

  const timelineData = useMemo(() => ({
    series: [
      {
        data: dashboardData.threats.flatMap(t =>
          t.Details?.map(d => ({
            x: d.createdAt ? new Date(d.createdAt) : new Date(),
            y: 1
          })) || []
        ),
        label: 'Threats Over Time',
        color: colors.chartColors[0]
      },
    ],
    xAxis: [
      {
        data: dashboardData.threats.flatMap(t =>
          t.Details?.map(d => d.createdAt ? new Date(d.createdAt) : new Date()) || []
        ),
        scaleType: 'time',
        valueFormatter: (value) => {
          if (!value) return '';
          const date = new Date(value);
          return date.toLocaleDateString();
        }
      },
    ],
  }), [dashboardData.threats, colors]);

  const calculateAverageImpact = (data) => {
    if (!data?.damageScenarios?.length) return 0;
    let totalImpact = 0;
    let count = 0;
    data.damageScenarios.forEach(ds => {
      const derivations = ds.Derivations || [];
      derivations.forEach(detail => {
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

  const calculateUnmitigatedRisks = (data) => {
    if (!data?.riskTreatments?.Details?.length) return 0;
    return data.riskTreatments.Details.filter(
      risk => !risk.risk_treatment || risk.risk_treatment === 'Not Rated'
    ).length;
  };

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

  const calculateHighFeasibilityAttacks = (data) => {
    if (!data?.attackScenarios?.length) return 0;
    return data.attackScenarios.reduce((count, attack) => {
      const scenes = attack.scenes || [];
      return count + scenes.filter(s => {
        const feasibility = s['Attack Feasibilities Rating'] || '';
        return feasibility.toLowerCase() === 'high';
      }).length;
    }, 0);
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
        <Box display="flex" alignItems="center" gap={1}>
          <Tooltip title={isRefreshing ? 'Refreshing...' : 'Refresh Data'} arrow>
            <span> {/* Wrapper for disabled tooltip */}
              <IconButton 
                onClick={handleRefresh}
                disabled={isRefreshing}
                color="primary"
                size="small"
                sx={{
                  p: 1,
                  '&.Mui-disabled': {
                    color: 'text.secondary',
                    opacity: 0.7,
                  },
                  '&:hover:not(:disabled)': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  },
                }}
              >
                {isRefreshing ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <RefreshIcon />
                )}
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Close" arrow>
            <IconButton
              onClick={onClose}
              size="small"
              sx={{
                p: 1,
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
                onClick={fetchDashboardData}
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
            <Box sx={{ borderBottom: 1, borderColor: colors.tabBorder, mb: 2, position: 'relative' }}>
              <Tabs
                value={tabValue}
                onChange={(e, newValue) => setTabValue(newValue)}
                variant="scrollable"
                scrollButtons="auto"
                allowScrollButtonsMobile
                aria-label="dashboard tabs"
                sx={{
                  '& .MuiTabs-indicator': {
                    backgroundColor: colors.logo,
                    height: 3,
                  },
                  '& .MuiTabScrollButton-root': {
                    color: colors.tabContentClr,
                    '&.Mui-disabled': {
                      opacity: 0.3,
                    },
                  },
                }}
              >
                <Tab
                  label="Overview"
                  sx={{
                    minHeight: 48,
                    color: colors.tabContentClr,
                    '&.Mui-selected': { 
                      color: colors.logo,
                      fontWeight: 600,
                    },
                    '&:hover': {
                      backgroundColor: alpha(colors.logo, 0.08),
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                />
                <Tab
                  label="Risks & Impacts"
                  sx={{
                    minHeight: 48,
                    color: colors.tabContentClr,
                    '&.Mui-selected': { 
                      color: colors.logo,
                      fontWeight: 600,
                    },
                    '&:hover': {
                      backgroundColor: alpha(colors.logo, 0.08),
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                />
                <Tab
                  label="Threats & Damages"
                  sx={{
                    minHeight: 48,
                    color: colors.tabContentClr,
                    '&.Mui-selected': { 
                      color: colors.logo,
                      fontWeight: 600,
                    },
                    '&:hover': {
                      backgroundColor: alpha(colors.logo, 0.08),
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                />
                <Tab
                  label="Attacks & Cyber"
                  sx={{
                    minHeight: 48,
                    color: colors.tabContentClr,
                    '&.Mui-selected': { 
                      color: colors.logo,
                      fontWeight: 600,
                    },
                    '&:hover': {
                      backgroundColor: alpha(colors.logo, 0.08),
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                />
              </Tabs>
            </Box>
            <Slide direction="right" in={tabValue === 0} mountOnEnter unmountOnExit>
              <Box>
                <TabPanel value={tabValue} index={0}>
                  <OverviewContent
                    projectStats={projectStats}
                    loading={loading}
                    overviewRiskCounts={overviewRiskCounts}
                    handleRefresh={handleRefresh}
                  />
                </TabPanel>
              </Box>
            </Slide>
            <Slide direction={tabValue > 1 ? 'left' : 'right'} in={tabValue === 1} mountOnEnter unmountOnExit>
              <Box>
                <TabPanel value={tabValue} index={1}>
                  <RisksContent
                    impactDistribution={impactDistribution}
                    riskLevels={riskLevels}
                    treatmentDistribution={treatmentDistribution}
                    impactRef={chartRefs.impact}
                  />
                </TabPanel>
              </Box>
            </Slide>
            <Slide direction={tabValue > 2 ? 'left' : 'right'} in={tabValue === 2} mountOnEnter unmountOnExit>
              <Box>
                <TabPanel value={tabValue} index={2}>
                  <ThreatsContent
                    threatTypes={threatTypes}
                    timelineData={timelineData}
                    threatRef={chartRefs.threat}
                    timelineRef={chartRefs.timeline}
                  />
                </TabPanel>
              </Box>
            </Slide>
            <Slide direction="left" in={tabValue === 3} mountOnEnter unmountOnExit>
              <Box>
                <TabPanel value={tabValue} index={3}>
                  <AttacksContent
                    cyberBreakdown={cyberBreakdown}
                    attackPerScenario={attackPerScenario}
                    attackFeasibility={attackFeasibility}
                    feasRef={chartRefs.feas}
                  />
                </TabPanel>
              </Box>
            </Slide>
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
      </DialogActions>
    </Dialog>
  );
};

export default DashboardDialog;