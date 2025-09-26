/*eslint-disable*/
import React, { useState } from 'react';
import { styled } from '@mui/material/styles';
import { Box, Typography, IconButton, Collapse } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useTheme } from '@mui/material/styles';

const SectionHeader = styled(Box)(({ theme, isopen }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1, 2),
  cursor: 'pointer',
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(0.5),
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  transition: theme.transitions.create('background-color', {
    duration: theme.transitions.duration.shortest,
  }),
}));

const SectionContent = styled(Box)(({ theme }) => ({
  padding: theme.spacing(0, 2, 1, 4),
  overflow: 'hidden',
}));

const SectionIcon = styled(Box)(({ theme }) => ({
  marginRight: theme.spacing(1),
  display: 'flex',
  alignItems: 'center',
  color: theme.palette.primary.main,
}));

export const CollapsibleSection = ({ 
  title, 
  icon: Icon, 
  children, 
  defaultOpen = true,
  onToggle,
  ...props 
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const theme = useTheme();
  
  const handleToggle = (e) => {
    e.stopPropagation();
    const newState = !isOpen;
    setIsOpen(newState);
    if (onToggle) onToggle(newState);
  };

  return (
    <Box {...props}>
      <SectionHeader 
        onClick={handleToggle}
        isopen={isOpen ? 1 : 0}
      >
        <IconButton
          size="small"
          sx={{
            transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
            transition: theme.transitions.create('transform', {
              duration: theme.transitions.duration.shortest,
            }),
            padding: '4px',
            marginRight: '4px',
          }}
        >
          <ExpandMoreIcon fontSize="small" />
        </IconButton>
        {Icon && (
          <SectionIcon>
            <Icon fontSize="small" />
          </SectionIcon>
        )}
        <Typography 
          variant="subtitle2" 
          sx={{ 
            fontWeight: 600,
            flexGrow: 1,
            color: 'text.primary',
          }}
        >
          {title}
        </Typography>
      </SectionHeader>
      <Collapse in={isOpen} timeout="auto" unmountOnExit>
        <SectionContent>
          {children}
        </SectionContent>
      </Collapse>
    </Box>
  );
};

export default CollapsibleSection;
