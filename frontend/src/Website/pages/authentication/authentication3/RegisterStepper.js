/*eslint-disable*/
import { useState } from 'react';
import { Box, Button, Divider, Step, StepLabel, Stepper } from '@mui/material';

import StepOneUserInfo from './StepOneUserInfo';
import StepTwoPlanSelection from './StepTwoPlanSelection';
import StepThreePayment from './StepThreePayment';
import { register } from '../../../../services/api';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
const steps = ['User Info', 'Select Plan', 'Payment'];

const RegisterStepper = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [formValues, setFormValues] = useState({});
  const [isFirstTimer, setIsFirstTimer] = useState(true); // default true
  const dispatch = useDispatch();
  const notify = (message, status) => toast[status](message);
  // Replace with real check from backend!

  // console.log('formValues', formValues);
  const allPlans = [
    { id: 'trial', name: 'Free Trial', details: '2 Weeks Free', price: '₹0' },
    { id: '1month', name: 'Monthly', details: '₹499 per month', price: '₹499' },
    { id: '1year', name: 'Yearly', details: '₹4999 per year', price: '₹4999' }
  ];

  const plansToShow = isFirstTimer ? allPlans.filter((p) => p.id === 'trial') : allPlans.filter((p) => p.id !== 'trial');

  const handleNext = (newValues) => {
    setFormValues((prev) => ({ ...prev, ...newValues }));
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSubmit = async (values) => {
    const data = {
      firstname: formValues?.fname,
      lastname: formValues?.lname,
      email: formValues?.email,
      org: formValues?.organization,
      password: formValues?.password,
      role: formValues?.role,
      license_type: formValues?.plan
    };

    try {
      const res = await dispatch(register(data)).unwrap();
      console.log('Registration success:', res);
      if (!res.error) {
        notify(res?.data?.message ?? 'Registered Successfully', 'success');
      }

      // ✅ Redirect, toast or show success UI here
    } catch (error) {
      console.error('Registration failed:', error);
      notify(error?.data?.message ?? 'Something went wrong', 'error');

      // ✅ Show toast, form error, etc.
    }
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return <StepOneUserInfo handleNext={handleNext} data={formValues} setIsFirstTimer={setIsFirstTimer} />;
      case 1:
        return <StepTwoPlanSelection handleNext={handleNext} handleBack={handleBack} data={formValues} plans={plansToShow} />;
      case 2:
        return (
          <StepThreePayment
            handleBack={handleBack}
            data={formValues}
            handleSubmit={handleSubmit}
            isFirstTimer={isFirstTimer}
            selectedPlan={formValues.plan}
          />
        );
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
