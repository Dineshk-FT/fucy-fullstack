import React from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Typography, FormGroup, FormControlLabel, Checkbox } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

function LossContent() {
  return (
    <div>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
          <Typography>Power Management</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <FormGroup>
            <FormControlLabel control={<Checkbox />} label="Loss of Integrity" />
            <FormControlLabel control={<Checkbox />} label="Loss of Authorization" />
          </FormGroup>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel2a-content" id="panel2a-header">
          <Typography>Signal</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <FormGroup>
            <FormControlLabel control={<Checkbox />} label="Loss of Non-repudiation" />
            <FormControlLabel control={<Checkbox />} label="Loss of Authenticity" />
          </FormGroup>
        </AccordionDetails>
      </Accordion>
    </div>
  );
}

export default LossContent;
