/*eslint-disable*/
import { useState } from 'react';
import { Box, Button, Divider, Step, StepLabel, Stepper } from '@mui/material';

import StepOneUserInfo from './StepOneUserInfo';
import StepTwoPlanSelection from './StepTwoPlaSelection';
import StepThreePayment from './StepThreePayment';

const steps = ['User Info', 'Select Plan', 'Payment'];

const RegisterStepper = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [formValues, setFormValues] = useState({});

  const handleNext = (newValues) => {
    setFormValues((prev) => ({ ...prev, ...newValues }));
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return <StepOneUserInfo handleNext={handleNext} data={formValues} />;
      case 1:
        return <StepTwoPlanSelection handleNext={handleNext} handleBack={handleBack} data={formValues} />;
      case 2:
        return <StepThreePayment handleBack={handleBack} data={formValues} />;
      default:
        return null;
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <Divider sx={{ my: 2, borderColor: 'white', boxShadow: '1px 0px 1px gray' }} />
      <Box>{getStepContent(activeStep)}</Box>
    </Box>
  );
};

export default RegisterStepper;
