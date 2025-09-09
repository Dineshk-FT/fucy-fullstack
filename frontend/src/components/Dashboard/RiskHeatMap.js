/*eslint-disable*/
import React, { useMemo } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  useTheme, 
  Chip, 
  Stack, 
  Tooltip,
  Divider,
  useMediaQuery
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import WarningIcon from '@mui/icons-material/Warning';
import { styled } from '@mui/material/styles';

const RiskChip = styled(Chip)(({ theme, risklevel }) => ({
  height: '24px',
  borderRadius: '4px',
  fontWeight: 600,
  '& .MuiChip-label': {
    padding: '0 6px',
    fontSize: '0.7rem',
  },
  ...(risklevel === 'high' && {
    backgroundColor: alpha(theme.palette.error.light, 0.15),
    color: theme.palette.error.dark,
    border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
  }),
  ...(risklevel === 'medium' && {
    backgroundColor: alpha(theme.palette.warning.light, 0.15),
    color: theme.palette.warning.dark,
    border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`,
  }),
  ...(risklevel === 'low' && {
    backgroundColor: alpha(theme.palette.success.light, 0.15),
    color: theme.palette.success.dark,
    border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
  }),
}));

const RiskHeatMap = ({ risks = [], components = [] }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Process data to count risks per component with validation
  const componentRisks = useMemo(() => {
    if (!Array.isArray(components) || !Array.isArray(risks)) {
      console.error('Invalid props: components and risks must be arrays');
      return [];
    }

    // Create a map of component IDs to their risk counts
    const riskMap = new Map();

    // Initialize all components with zero counts
    components.forEach(component => {
      if (component?.id) {
        riskMap.set(component.id, {
          id: component.id,
          name: component.name || `Component ${component.id}`,
          high: 0,
          medium: 0,
          low: 0,
          total: 0
        });
      }
    });

    // Count risks for each component
    risks.forEach(risk => {
      if (!risk?.componentId) return;
      
      const component = riskMap.get(risk.componentId);
      if (!component) return;
      
      const level = typeof risk.level === 'string' ? risk.level.toLowerCase() : 'low';
      
      if (['high', 'medium', 'low'].includes(level)) {
        component[level]++;
        component.total++;
      }
    });

    // Convert map to array and sort by total risks (descending)
    return Array.from(riskMap.values())
      .filter(comp => comp.total > 0)
      .sort((a, b) => b.total - a.total);
  }, [components, risks]);

  // No risks to display
  if (componentRisks.length === 0) {
    return (
      <Paper 
        elevation={0}
        sx={{
          p: 2,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
          textAlign: 'center',
          color: 'text.secondary',
        }}
      >
        <Typography variant="body2">
          {components.length === 0 
            ? 'No components available' 
            : risks.length === 0 
              ? 'No risks found' 
              : 'No risks mapped to components'}
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 2,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
      }}
    >
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="subtitle1" fontWeight={600}>
          Component Risks
        </Typography>
      </Box>
      
      <Stack spacing={1}>
        {componentRisks.map(comp => (
          <Box key={comp.id}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="body2" fontWeight={500} noWrap>
                {comp.name}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, ml: 1 }}>
                {comp.high > 0 && (
                  <Tooltip title={`${comp.high} high risk${comp.high > 1 ? 's' : ''}`}>
                    <RiskChip 
                      label={comp.high} 
                      risklevel="high" 
                      size="small"
                    />
                  </Tooltip>
                )}
                {comp.medium > 0 && (
                  <Tooltip title={`${comp.medium} medium risk${comp.medium > 1 ? 's' : ''}`}>
                    <RiskChip 
                      label={comp.medium} 
                      risklevel="medium" 
                      size="small"
                    />
                  </Tooltip>
                )}
                {comp.low > 0 && (
                  <Tooltip title={`${comp.low} low risk${comp.low > 1 ? 's' : ''}`}>
                    <RiskChip 
                      label={comp.low} 
                      risklevel="low" 
                      size="small"
                    />
                  </Tooltip>
                )}
              </Box>
            </Box>
            {componentRisks.indexOf(comp) < componentRisks.length - 1 && (
              <Divider sx={{ my: 1 }} />
            )}
          </Box>
        ))}
      </Stack>
    </Paper>
  );
};

export default RiskHeatMap;
