/*eslint-disable*/
import { useState } from 'react';
import { Box, Button, Grid, Paper, Typography } from '@mui/material';

const StepTwoPlanSelection = ({ handleNext, handleBack, data, plans }) => {
  const [selected, setSelected] = useState(data.plan || '');

  return (
    <Box>
      <Typography color="primary" variant="h4" mb={4} textAlign="center">
        Select a Plan
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
          gap: 3,
          maxWidth: 900,
          margin: '0 auto'
        }}
      >
        {plans.map((plan) => (
          <Paper
            key={plan.id}
            elevation={selected === plan.id ? 6 : 3}
            sx={{
              p: 3,
              borderRadius: 3,
              textAlign: 'center',
              border: selected === plan.id ? '2px solid #0BDA51' : '1px solid #ddd',
              boxShadow: selected === plan.id ? '0 0 12px rgba(46, 193, 172, 0.3)' : '',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              flexDirection: 'column',
              height: '100%', // Equal height
              '&:hover': {
                boxShadow: '0 0 16px rgba(0,0,0,0.1)',
                transform: 'translateY(-2px)'
              }
            }}
            onClick={() => setSelected(plan.id)}
          >
            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <Typography variant="h5" color="secondary" gutterBottom>
                  {plan.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {plan.details}
                </Typography>
              </div>
              <Typography variant="h5" fontWeight="bold" color="primary" mt={2}>
                {plan.price}
              </Typography>
            </Box>
          </Paper>
        ))}
      </Box>
      <Box sx={{ mt: 5, display: 'flex', justifyContent: 'space-between' }}>
        <Button onClick={handleBack} variant="outlined">
          Back
        </Button>
        <Button variant="contained" onClick={() => handleNext({ plan: selected })} disabled={!selected}>
          Next
        </Button>
      </Box>
    </Box>
  );
};

export default StepTwoPlanSelection;
