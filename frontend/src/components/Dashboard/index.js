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
} from '@mui/material';
import { BarChart, PieChart, LineChart } from '@mui/x-charts';
import { DataGrid } from '@mui/x-data-grid';
import jsPDF from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import Chart from 'chart.js/auto'; 
import DevicesIcon from '@mui/icons-material/Devices';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SecurityIcon from '@mui/icons-material/Security';
import WarningIcon from '@mui/icons-material/Warning';
import GppBadIcon from '@mui/icons-material/GppBad';
import useStore from '../../store/Zustand/store';
import { GET_CALL } from '../../services/api';
import { configuration } from '../../services/baseApiService';

const StatCard = ({ title, value, color, icon: Icon }) => (
  <Tooltip title={`Details for ${title}`}>
    <Paper elevation={1} sx={{ p: 1, textAlign: 'center', borderRadius: 1, bgcolor: 'background.paper', minWidth: 100 }}>
      {Icon && <Icon sx={{ color, fontSize: 24, mb: 0.5 }} />}
      <Typography variant="caption" display="block">{title}</Typography>
      <Typography variant="subtitle1" sx={{ color }}>{value}</Typography>
    </Paper>
  </Tooltip>
);

const TabPanel = ({ children, value, index }) => (
  <Box role="tabpanel" hidden={value !== index} sx={{ p: 1 }}>
    {value === index && children}
  </Box>
);

const DashboardDialog = ({ open, onClose, modelId }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    components: {},
    threats: [],
    damageScenarios: [],
    attackScenarios: [],
    cybersecurity: [],
    riskTreatments: {}
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
    highFeasibilityAttacks: 0
  });
  const [riskLevels, setRiskLevels] = useState({ high: 0, medium: 0, low: 0 });
  const [threatTypes, setThreatTypes] = useState({ derived: 0, userDefined: 0 });
  const [impactDistribution, setImpactDistribution] = useState({ safety: 0, financial: 0, operational: 0, privacy: 0 });
  const [cyberBreakdown, setCyberBreakdown] = useState({ goals: 0, claims: 0, requirements: 0, controls: 0 });
  const [attackFeasibility, setAttackFeasibility] = useState({ high: 0, medium: 0, low: 0 });
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
          { key: 'riskTreatments', endpoint: `${baseUrl}v1/get/riskDetAndTreat`, defaultValue: {} }
        ];

        const dashboardDataTemp = {};
        apiEndpoints.forEach(({ key, defaultValue }) => {
          dashboardDataTemp[key] = Array.isArray(defaultValue) ? [...defaultValue] : { ...defaultValue };
        });

        for (const { key, endpoint, defaultValue } of apiEndpoints) {
          try {
            const response = await GET_CALL(modelId, endpoint);
            if (response !== undefined) {
              dashboardDataTemp[key] = Array.isArray(defaultValue) ? (Array.isArray(response) ? response : []) : (typeof response === 'object' && response !== null ? response : {});
            }
          } catch (error) {
            console.error(`Error fetching ${endpoint}:`, error);
            dashboardDataTemp[key] = Array.isArray(defaultValue) ? [...defaultValue] : { ...defaultValue };
          }
        }

        setDashboardData(dashboardDataTemp);

        // Compute core stats
        const comps = dashboardDataTemp.components.template?.nodes?.length || 0;
        const threats = dashboardDataTemp.threats.reduce((sum, t) => sum + (t.Details?.length || 0), 0);
        const damages = dashboardDataTemp.damageScenarios.reduce((sum, d) => sum + (d.Details?.length || 0), 0);
        const attacks = dashboardDataTemp.attackScenarios.reduce((sum, a) => sum + (a.scenes?.length || 0), 0);
        const risks = dashboardDataTemp.riskTreatments.Details?.length || 0;
        const controls = dashboardDataTemp.cybersecurity.filter(c => c.type === 'cybersecurity_controls')?.[0]?.scenes?.length || 0;

        // Additional stats
        let totalImpacts = 0, impactCount = 0;
        let safety = 0, financial = 0, operational = 0, privacy = 0;
        dashboardDataTemp.damageScenarios.forEach(ds => {
          ds.Details?.forEach(d => {
            Object.entries(d.impacts || {}).forEach(([key, val]) => {
              const num = typeof val === 'string' ? ({ Low: 1, Medium: 2, High: 3 }[val] || 0) : (val || 0);
              totalImpacts += num;
              impactCount++;
              if (key.toLowerCase().includes('safety')) safety += num;
              else if (key.toLowerCase().includes('financial')) financial += num;
              else if (key.toLowerCase().includes('operational')) operational += num;
              else if (key.toLowerCase().includes('privacy')) privacy += num;
            });
          });
        });
        const avgImpact = impactCount > 0 ? (totalImpacts / impactCount).toFixed(2) : 0;

        const unmitigated = risks - dashboardDataTemp.riskTreatments.Details?.filter(r => r.cybersecurity?.cybersecurity_controls?.length > 0).length || 0;
        const coverage = risks > 0 ? ((controls / risks) * 100).toFixed(1) : 0;

        let highFeas = 0, medFeas = 0, lowFeas = 0;
        dashboardDataTemp.attackScenarios.forEach(as => {
          as.scenes?.forEach(s => {
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
          highFeasibilityAttacks: highFeas
        });

        // Risk levels
        let high = 0, medium = 0, low = 0;
        dashboardDataTemp.riskTreatments.Details?.forEach(risk => {
          const damage = dashboardDataTemp.damageScenarios.flatMap(ds => ds.Details || []).find(d => d._id === risk.damage_id);
          if (damage) {
            const maxImpact = Object.values(damage.impacts || {}).reduce((max, val) => {
              const num = typeof val === 'string' ? ({ Low: 1, Medium: 2, High: 3 }[val] || 0) : (val || 0);
              return num > max ? num : max;
            }, 0);
            if (maxImpact >= 3) high++;
            else if (maxImpact === 2) medium++;
            else low++;
          }
        });
        setRiskLevels({ high, medium, low });

        // Overall risk
        setOverallRisk(high > 5 ? 'High' : (high > 0 || medium > 5) ? 'Medium' : 'Low');

        // Threat types
        const derived = dashboardDataTemp.threats.find(t => t.type === 'derived')?.Details?.length || 0;
        const userDefined = dashboardDataTemp.threats.find(t => t.type === 'User-defined')?.length || 0;
        setThreatTypes({ derived, userDefined });

        // Impact distribution
        setImpactDistribution({ safety, financial, operational, privacy });

        // Cyber breakdown
        const goals = dashboardDataTemp.cybersecurity.find(c => c.type === 'cybersecurity_goals')?.scenes?.length || 0;
        const claims = dashboardDataTemp.cybersecurity.find(c => c.type === 'cybersecurity_claims')?.scenes?.length || 0;
        const reqs = dashboardDataTemp.cybersecurity.find(c => c.type === 'cybersecurity_requirements')?.scenes?.length || 0;
        setCyberBreakdown({ goals, claims, requirements: reqs, controls });

        // Attack feasibility
        setAttackFeasibility({ high: highFeas, medium: medFeas, low: lowFeas });

      } catch (err) {
        setError('Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [open, modelId]);

  // Chart data adapted for Chart.js
  const adaptChartData = (chartData, type) => {
    if (!chartData) {
      console.error('Chart data is undefined or null');
      return { labels: [], datasets: [] };
    }

    try {
      if (type === 'pie') {
        const series = chartData.series?.[0]?.data || [];
        return {
          labels: series.map(d => d?.label || '').filter(Boolean),
          datasets: [{
            data: series.map(d => d?.value || 0),
            backgroundColor: series.map(d => d?.color || theme.palette.grey[300]),
          }],
        };
      } else { // bar or line
        const xAxisData = chartData.xAxis?.[0]?.data || [];
        const seriesData = Array.isArray(chartData.series) ? chartData.series : [];
        
        return {
          labels: xAxisData,
          datasets: seriesData.map(s => ({
            label: s?.label || '',
            data: Array.isArray(s?.data) ? s.data : [],
            backgroundColor: s?.backgroundColor || theme.palette.primary.main,
            borderColor: s?.borderColor || theme.palette.primary.main,
            borderWidth: type === 'line' ? 2 : 0,
          })).filter(ds => ds.data.length > 0), // Only include datasets with data
        };
      }
    } catch (error) {
      console.error('Error adapting chart data:', error);
      return { labels: [], datasets: [] };
    }
  };

  const overviewBarData = {
    series: [{ data: [projectStats.totalComponents, projectStats.totalThreats, projectStats.risksIdentified, projectStats.controlsImplemented], label: 'Counts' }],
    xAxis: [{ scaleType: 'band', data: ['Comps', 'Threats', 'Risks', 'Ctrls'] }]
  };

  const riskPieData = {
    series: [{
      data: [
        { id: 0, value: riskLevels.high, label: 'High', color: theme.palette.error.main },
        { id: 1, value: riskLevels.medium, label: 'Medium', color: theme.palette.warning.main },
        { id: 2, value: riskLevels.low, label: 'Low', color: theme.palette.success.main }
      ]
    }]
  };

  const threatBarData = {
    series: [{ data: [threatTypes.derived, threatTypes.userDefined], label: 'Counts' }],
    xAxis: [{ scaleType: 'band', data: ['Derived', 'User-Def'] }]
  };

  const impactBarData = {
    series: [{ data: [impactDistribution.safety, impactDistribution.financial, impactDistribution.operational, impactDistribution.privacy], label: 'Impact Scores' }],
    xAxis: [{ scaleType: 'band', data: ['Safety', 'Financial', 'Operational', 'Privacy'] }]
  };

  const cyberPieData = {
    series: [{
      data: [
        { id: 0, value: cyberBreakdown.goals, label: 'Goals' },
        { id: 1, value: cyberBreakdown.claims, label: 'Claims' },
        { id: 2, value: cyberBreakdown.requirements, label: 'Reqs' },
        { id: 3, value: cyberBreakdown.controls, label: 'Ctrls' }
      ]
    }]
  };

  const feasBarData = {
    series: [{ data: [attackFeasibility.high, attackFeasibility.medium, attackFeasibility.low], label: 'Counts' }],
    xAxis: [{ scaleType: 'band', data: ['High', 'Med', 'Low'] }]
  };

  const timelineData = {
    series: [{ data: dashboardData.threats.map(t => t.Details?.length || 0) }],
    xAxis: [{ data: dashboardData.threats.map(t => t.timestamp || Date.now()) }]
  };

  // Tables
  const riskColumns = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'threat_id', headerName: 'Threat ID', width: 100 },
    { field: 'damage_id', headerName: 'Damage ID', width: 100 },
    { field: 'label', headerName: 'Label', width: 120 },
    { field: 'threat_key', headerName: 'Threat Key', width: 100 },
    { field: 'cybersecurity_goals', headerName: 'Goals', width: 100, valueGetter: (params) => params.row.cybersecurity?.cybersecurity_goals?.length || 0 },
    { field: 'catalogs', headerName: 'Catalogs', width: 100, valueGetter: (params) => params.row.catalogs?.length || 0 }
  ];

  const riskRows = (dashboardData.riskTreatments.Details || []).map((r, index) => ({
    ...r,
    id: r.id || index
  }));

  const attackColumns = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'type', headerName: 'Type', width: 100 },
    { field: 'Name', headerName: 'Name', width: 120 },
    { field: 'threat_id', headerName: 'Threat ID', width: 100 },
    { field: 'Attack Feasibilities Rating', headerName: 'Feasibility', width: 120 },
    { field: 'Elapsed Time', headerName: 'Time', width: 100 }
  ];

  const attackRows = dashboardData.attackScenarios.flatMap(a => a.scenes?.map(s => ({ ...s, id: s.ID, type: a.type })) || []);

  const threatColumns = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'type', headerName: 'Type', width: 100 },
    { field: 'detailCount', headerName: 'Details', width: 80 },
    { field: 'propCount', headerName: 'Props', width: 80, valueGetter: (params) => params.row.Details?.reduce((sum, d) => sum + (d.props?.length || 0), 0) || 0 }
  ];

  const threatRows = dashboardData.threats.map(t => ({ ...t, id: t._id, detailCount: t.Details?.length || 0 }));

  const damageColumns = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'type', headerName: 'Type', width: 100 },
    { field: 'Name', headerName: 'Name', valueGetter: (params) => params.row.Details?.[0]?.Name || 'N/A', width: 120 },
    { field: 'cyberLosses', headerName: 'Losses', width: 100, valueGetter: (params) => params.row.Details?.reduce((sum, d) => sum + (d.cyberLosses?.length || 0), 0) || 0 }
  ];

  const damageRows = dashboardData.damageScenarios.map(ds => ({ ...ds, id: ds._id }));

  const cyberColumns = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'type', headerName: 'Type', width: 120 },
    { field: 'sceneCount', headerName: 'Scenes', width: 80, valueGetter: (params) => params.row.scenes?.length || 0 },
    { field: 'threatKeys', headerName: 'Threat Keys', width: 120, valueGetter: (params) => {
      const threatKey = params.row.scenes?.[0]?.threat_key;
      return Array.isArray(threatKey) ? threatKey.join(', ') : (threatKey || 'N/A');
    }}
  ];

  const cyberRows = dashboardData.cybersecurity.map(c => ({ ...c, id: c._id, sceneCount: c.scenes?.length || 0 }));

  // Function to generate chart image using Chart.js
  const generateChartImage = (chartData, type) => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');

    const adaptedData = adaptChartData(chartData, type);
    new Chart(ctx, {
      type: type,
      data: adaptedData,
      options: {
        responsive: false,
        plugins: {
          title: {
            display: true,
            text: chartData.title || 'Chart',
          },
          legend: {
            display: type !== 'pie',
            position: 'bottom',
          },
        },
        scales: (type === 'bar' || type === 'line') ? {
          x: {
            type: 'category',
          },
          y: {
            beginAtZero: true,
          },
        } : undefined,
      },
    });

    // Ensure chart is rendered before capturing
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(canvas.toDataURL('image/png'));
      }, 100); // Small delay to ensure rendering
    });
  };

  // PDF Export with programmatic content
  const exportPDF = async () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const date = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }); // 03:45 PM IST, August 13, 2025
    let y = 10;

    // Title and Metadata
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
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
      { title: 'Components', value: projectStats.totalComponents, color: theme.palette.primary.main },
      { title: 'Threats', value: projectStats.totalThreats, color: theme.palette.error.main },
      { title: 'Damages', value: projectStats.totalDamageScenarios, color: theme.palette.warning.main },
      { title: 'Attacks', value: projectStats.totalAttackScenarios, color: theme.palette.error.dark },
      { title: 'Risks', value: projectStats.risksIdentified, color: theme.palette.warning.main },
      { title: 'Controls', value: projectStats.controlsImplemented, color: theme.palette.success.main },
      { title: 'Avg Impact', value: projectStats.averageImpact, color: theme.palette.info.main },
      { title: 'Unmitigated', value: projectStats.unmitigatedRisks, color: theme.palette.error.main },
      { title: 'Coverage %', value: `${projectStats.coveragePercentage}%`, color: theme.palette.success.main },
      { title: 'High Feas', value: projectStats.highFeasibilityAttacks, color: theme.palette.error.dark },
    ];
    stats.forEach((stat, index) => {
      if (y > 270) {
        doc.addPage();
        y = 10;
        doc.text('Overview (Continued)', 10, y);
        y += 5;
      }
      const rgb = hexToRgb(stat.color).map(c => c * 255);
      doc.setFillColor(...rgb);
      doc.rect(10 + (index % 5) * 35, y, 30, 20, 'F');
      doc.setTextColor(255, 255, 255);
      doc.text(stat.title, 10 + (index % 5) * 35 + 5, y + 5);
      doc.text(stat.value.toString(), 10 + (index % 5) * 35 + 5, y + 15);
      if ((index + 1) % 5 === 0) y += 25;
    });
    y += 10;

    // Charts - Generate images using Chart.js
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
      doc.text(table.title, 10, y);
      y += 5;
      autoTable(doc, {
        head: [table.columns.map(c => c.headerName)],
        body: table.rows.map(row => table.columns.map(c => {
          const value = c.valueGetter ? c.valueGetter({ row }) : row[c.field];
          return value !== null && value !== undefined ? value.toString() : 'N/A';
        })),
        startY: y,
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 2, overflow: 'linebreak' },
        headStyles: { fillColor: [200, 200, 200] },
        columnStyles: table.columns.reduce((styles, col, idx) => ({ ...styles, [idx]: { cellWidth: col.width / 3.78, minCellWidth: col.width / 3.78 } }), {}),
      });
      y = doc.lastAutoTable.finalY + 10;
    }

    doc.save(`Security_Dashboard_Report_${modelId}_${date.split(',')[0].replace(/\//g, '-')}.pdf`);
  };

  // Helper function to convert hex color to RGB
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [parseInt(result[1], 16) / 255, parseInt(result[2], 16) / 255, parseInt(result[3], 16) / 255] : [0, 0, 0];
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xl"
      fullScreen={fullScreen}
      PaperProps={{ sx: { minHeight: '90vh' } }}
    >
      <DialogTitle sx={{ borderBottom: `1px solid ${theme.palette.divider}`, p: 1 }}>
        Comprehensive Security Dashboard
      </DialogTitle>
      <DialogContent sx={{ p: 1 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert>
        ) : (
          <>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 1 }}>
              <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} variant="scrollable" scrollButtons="auto">
                <Tab label="Overview" />
                <Tab label="Risks & Impacts" />
                <Tab label="Threats & Damages" />
                <Tab label="Attacks & Cyber" />
              </Tabs>
            </Box>
            <TabPanel value={tabValue} index={0}>
              <Grid container spacing={1} sx={{ mb: 1 }}>
                <Grid item xs={4} sm={3} md={2}><StatCard title="Components" value={projectStats.totalComponents} color={theme.palette.primary.main} icon={DevicesIcon} /></Grid>
                <Grid item xs={4} sm={3} md={2}><StatCard title="Threats" value={projectStats.totalThreats} color={theme.palette.error.main} icon={ReportProblemIcon} /></Grid>
                <Grid item xs={4} sm={3} md={2}><StatCard title="Damages" value={projectStats.totalDamageScenarios} color={theme.palette.warning.main} icon={WarningIcon} /></Grid>
                <Grid item xs={4} sm={3} md={2}><StatCard title="Attacks" value={projectStats.totalAttackScenarios} color={theme.palette.error.dark} icon={GppBadIcon} /></Grid>
                <Grid item xs={4} sm={3} md={2}><StatCard title="Risks" value={projectStats.risksIdentified} color={theme.palette.warning.main} icon={AssessmentIcon} /></Grid>
                <Grid item xs={4} sm={3} md={2}><StatCard title="Controls" value={projectStats.controlsImplemented} color={theme.palette.success.main} icon={SecurityIcon} /></Grid>
                <Grid item xs={4} sm={3} md={2}><StatCard title="Avg Impact" value={projectStats.averageImpact} color={theme.palette.info.main} icon={AssessmentIcon} /></Grid>
                <Grid item xs={4} sm={3} md={2}><StatCard title="Unmitigated" value={projectStats.unmitigatedRisks} color={theme.palette.error.main} icon={WarningIcon} /></Grid>
                <Grid item xs={4} sm={3} md={2}><StatCard title="Coverage %" value={`${projectStats.coveragePercentage}%`} color={theme.palette.success.main} icon={SecurityIcon} /></Grid>
                <Grid item xs={4} sm={3} md={2}><StatCard title="High Feas" value={projectStats.highFeasibilityAttacks} color={theme.palette.error.dark} icon={GppBadIcon} /></Grid>
              </Grid>
              <Grid container spacing={1}>
                <Grid item xs={12} md={6}>
                  <Paper elevation={1} sx={{ p: 1, borderRadius: 1, bgcolor: 'background.paper' }}>
                    <Typography variant="subtitle2">Overview Bar</Typography>
                    <Box ref={chartRefs.overview}>
                      <BarChart {...overviewBarData} height={300} margin={{ top: 20, right: 30, left: 40, bottom: 40 }} />
                    </Box>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper elevation={1} sx={{ p: 1, borderRadius: 1, bgcolor: 'background.paper' }}>
                    <Typography variant="subtitle2">Risk Pie</Typography>
                    {riskLevels.high + riskLevels.medium + riskLevels.low > 0 ? (
                      <PieChart series={riskPieData.series} height={300} slotProps={{ legend: { hidden: true } }} />
                    ) : <Typography color="textSecondary" align="center">No data</Typography>}
                  </Paper>
                </Grid>
              </Grid>
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
              <Grid container spacing={1}>
                <Grid item xs={12} md={6}>
                  <Paper elevation={1} sx={{ p: 1, borderRadius: 1, bgcolor: 'background.paper' }}>
                    <Typography variant="subtitle2">Impact Distribution</Typography>
                    <Box ref={chartRefs.impact}>
                      <BarChart {...impactBarData} height={300} margin={{ top: 20, right: 30, left: 40, bottom: 40 }} />
                    </Box>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper elevation={1} sx={{ p: 1, borderRadius: 1, bgcolor: 'background.paper' }}>
                    <Typography variant="subtitle2">Risk Levels Pie</Typography>
                    <PieChart series={riskPieData.series} height={300} slotProps={{ legend: { hidden: true } }} />
                  </Paper>
                </Grid>
              </Grid>
              <Paper elevation={1} sx={{ p: 1, mt: 1, borderRadius: 1, bgcolor: 'background.paper' }}>
                <Typography variant="subtitle2">Risks Table</Typography>
                <DataGrid rows={riskRows} columns={riskColumns} autoHeight pageSizeOptions={[5]} disableRowSelectionOnClick />
              </Paper>
            </TabPanel>
            <TabPanel value={tabValue} index={2}>
              <Grid container spacing={1}>
                <Grid item xs={12} md={6}>
                  <Paper elevation={1} sx={{ p: 1, borderRadius: 1, bgcolor: 'background.paper' }}>
                    <Typography variant="subtitle2">Threat Types</Typography>
                    <Box ref={chartRefs.threat}>
                      <BarChart {...threatBarData} height={300} margin={{ top: 20, right: 30, left: 40, bottom: 40 }} />
                    </Box>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper elevation={1} sx={{ p: 1, borderRadius: 1, bgcolor: 'background.paper' }}>
                    <Typography variant="subtitle2">Threats Timeline</Typography>
                    <LineChart {...timelineData} height={300} margin={{ top: 20, right: 30, left: 40, bottom: 40 }} />
                  </Paper>
                </Grid>
              </Grid>
              <Paper elevation={1} sx={{ p: 1, mt: 1, borderRadius: 1, bgcolor: 'background.paper' }}>
                <Typography variant="subtitle2">Threats Table</Typography>
                <DataGrid rows={threatRows} columns={threatColumns} autoHeight pageSizeOptions={[5]} disableRowSelectionOnClick />
              </Paper>
              <Paper elevation={1} sx={{ p: 1, mt: 1, borderRadius: 1, bgcolor: 'background.paper' }}>
                <Typography variant="subtitle2">Damage Scenarios Table</Typography>
                <DataGrid rows={damageRows} columns={damageColumns} autoHeight pageSizeOptions={[5]} disableRowSelectionOnClick />
              </Paper>
            </TabPanel>
            <TabPanel value={tabValue} index={3}>
              <Grid container spacing={1}>
                <Grid item xs={12} md={6}>
                  <Paper elevation={1} sx={{ p: 1, borderRadius: 1, bgcolor: 'background.paper' }}>
                    <Typography variant="subtitle2">Cyber Breakdown</Typography>
                    <PieChart series={cyberPieData.series} height={300} slotProps={{ legend: { hidden: true } }} />
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper elevation={1} sx={{ p: 1, borderRadius: 1, bgcolor: 'background.paper' }}>
                    <Typography variant="subtitle2">Attack Feasibility</Typography>
                    <Box ref={chartRefs.feas}>
                      <BarChart {...feasBarData} height={300} margin={{ top: 20, right: 30, left: 40, bottom: 40 }} />
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
              <Paper elevation={1} sx={{ p: 1, mt: 1, borderRadius: 1, bgcolor: 'background.paper' }}>
                <Typography variant="subtitle2">Attacks Table</Typography>
                <DataGrid rows={attackRows} columns={attackColumns} autoHeight pageSizeOptions={[5]} disableRowSelectionOnClick />
              </Paper>
              <Paper elevation={1} sx={{ p: 1, mt: 1, borderRadius: 1, bgcolor: 'background.paper' }}>
                <Typography variant="subtitle2">Cybersecurity Table</Typography>
                <DataGrid rows={cyberRows} columns={cyberColumns} autoHeight pageSizeOptions={[5]} disableRowSelectionOnClick />
              </Paper>
            </TabPanel>
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 1, borderTop: `1px solid ${theme.palette.divider}` }}>
        <Button onClick={onClose} color="primary" variant="outlined" size="small">
          Close
        </Button>
        <Button variant="contained" color="primary" disabled={loading} onClick={exportPDF} size="small">
          {loading ? <CircularProgress size={16} /> : 'Export PDF'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DashboardDialog;