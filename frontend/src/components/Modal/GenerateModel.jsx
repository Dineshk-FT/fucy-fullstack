import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Box, Typography, TextField, Button, Grid, InputLabel } from '@mui/material';

const GenerateModel = ({ open, handleClose }) => {
  const [formValues, setFormValues] = useState({
    system: '',
    algorithms: 'SoC, SoH, Sox , Additional Algorithm',
    communication: 'CAN, Ethernet, LIN , MOST',
    chemistry: 'LiON, LFP , Solid State Batteries'
  });

  const handleChange = (field) => (event) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  return (
    <Dialog open={open} onClose={handleClose} sx={{ '& .MuiPaper-root': { maxWidth: 700 } }}>
      <DialogTitle>
        <Typography variant="h4" color="primary">
          Create With AI
        </Typography>
      </DialogTitle>

      <DialogContent dividers sx={{ bgcolor: '#f7f7f7' }}>
        <Box sx={{ mb: 3 }}>
          {/* <InputLabel
            sx={{
              fontWeight: 'bold',
              fontSize: '1.1rem',
              mb: 2,
              color: '#000'
            }}
          >
            Ask Question
          </InputLabel> */}

          <Grid container spacing={2} alignItems="center">
            <Grid item xs={4}>
              <InputLabel sx={{ color: '#000', fontWeight: 600 }}>System</InputLabel>
            </Grid>
            <Grid item xs={8}>
              <TextField
                fullWidth
                variant="outlined"
                sx={{ '& .MuiInputBase-input': { color: '#575757' } }}
                value={formValues.system}
                onChange={handleChange('system')}
              />
            </Grid>

            <Grid item xs={4}>
              <InputLabel sx={{ color: '#000', fontWeight: 600 }}>Algorithms</InputLabel>
            </Grid>
            <Grid item xs={8}>
              <TextField
                fullWidth
                variant="outlined"
                sx={{ '& .MuiInputBase-input': { color: '#575757' } }}
                value={formValues.algorithms}
                onChange={handleChange('algorithms')}
              />
            </Grid>

            <Grid item xs={4}>
              <InputLabel sx={{ color: '#000', fontWeight: 600 }}>Communication Interfaces</InputLabel>
            </Grid>
            <Grid item xs={8}>
              <TextField
                fullWidth
                variant="outlined"
                sx={{ '& .MuiInputBase-input': { color: '#575757' } }}
                value={formValues.communication}
                onChange={handleChange('communication')}
              />
            </Grid>

            <Grid item xs={4}>
              <InputLabel sx={{ color: '#000', fontWeight: 600 }}>Cell Chemistry</InputLabel>
            </Grid>
            <Grid item xs={8}>
              <TextField
                fullWidth
                variant="outlined"
                sx={{ '& .MuiInputBase-input': { color: '#575757' } }}
                value={formValues.chemistry}
                onChange={handleChange('chemistry')}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button variant="outlined" color="error" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="contained" onClick={() => console.log(formValues)}>
          Next
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GenerateModel;
