/*eslint-disable*/
import { useState } from 'react';
import { Box, Divider, Step, StepLabel, Stepper } from '@mui/material';
import Button from '../../../../components/Buttons/Button';
import StepOneUserInfo from './StepOneUserInfo';
import StepTwoPlanSelection from './StepTwoPlanSelection';
import StepThreePayment from './StepThreePayment';
import { register } from '../../../../services/api';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

const steps = ['User Info', 'Select Plan', 'Payment'];

const RegisterStepper = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [formValues, setFormValues] = useState({});
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const notify = (message, status) => toast[status](message);

  const allPlans = [
    { id: 'trial', name: 'Free Trial', details: '2 Weeks Free', price: '₹0' },
    { id: '1month', name: 'Monthly', details: '₹499 per month', price: '₹499' },
    { id: '1year', name: 'Yearly', details: '₹4999 per year', price: '₹4999' }
  ];

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
      license_type: formValues?.plan,
      payment_method_id: values?.payment_method_id // Include payment_method_id
    };

    try {
      const res = await dispatch(register(data)).unwrap();
      if (!res.error) {
        notify(res?.data?.message ?? 'Registered Successfully', 'success');
        notify(`A license key has been sent to ${data.email}. Your license key: ${res?.data?.license_key}`, 'success');
        sessionStorage.setItem('license_key', res?.data?.license_key);
        setTimeout(() => {
          navigate('/login');
        }, 800);
      } else {
        notify(res?.data?.error ?? 'Something went wrong', 'error');
      }
    } catch (error) {
      console.error('Registration failed:', error);
      notify(error?.error ?? 'Something went wrong', 'error');
    }
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return <StepOneUserInfo handleNext={handleNext} data={formValues} />;
      case 1:
        return <StepTwoPlanSelection handleNext={handleNext} handleBack={handleBack} data={formValues} plans={allPlans} />;
      case 2:
        return <StepThreePayment handleBack={handleBack} data={formValues} handleSubmit={handleSubmit} selectedPlan={formValues.plan} />;
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
      <Toaster position="top-center" reverseOrder={false} />
    </Box>
  );
};

export default RegisterStepper;
