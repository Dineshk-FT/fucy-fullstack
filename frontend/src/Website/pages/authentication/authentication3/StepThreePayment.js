/*eslint-disable*/
import { useState, useEffect } from 'react';
import { Box, Button, Grid, Typography, CircularProgress, TextField } from '@mui/material';
import { Formik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { verifyCard } from '../../../../services/api';

const StepThreePayment = ({ handleBack, data, handleSubmit, selectedPlan }) => {
  const isTrial = selectedPlan === 'trial';
  const stripe = useStripe();
  const elements = useElements();
  const [cardError, setCardError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [stripeError, setStripeError] = useState(null);

  useEffect(() => {
    if (!stripe || !elements) {
      setStripeError('Stripe is not properly initialized. Please try refreshing the page.');
    } else {
      setStripeError(null);
      console.log('Stripe initialized successfully');
    }
  }, [stripe, elements]);

  const validationSchema = isTrial
    ? Yup.object().shape({})
    : Yup.object().shape({
        nameOnCard: Yup.string().required('Name on card is required'),
      });

  const handleCardVerification = async (values, { setSubmitting }) => {
    if (isTrial) {
      handleSubmit(values);
      setSubmitting(false);
      return;
    }

    if (!stripe || !elements) {
      toast.error('Stripe is not loaded');
      setSubmitting(false);
      return;
    }

    setIsProcessing(true);
    setCardError(null);

    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        setCardError('Please enter card details');
        setIsProcessing(false);
        setSubmitting(false);
        return;
      }

      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: values.nameOnCard,
        },
      });

      if (error) {
        setCardError(error.message);
        setIsProcessing(false);
        setSubmitting(false);
        return;
      }

      try {
        const result = await verifyCard(paymentMethod.id);
        
        if (result && result.success) {
          handleSubmit({ ...values, payment_method_id: paymentMethod.id });
        } else {
          const errorMessage = result?.error || 'Card verification failed';
          setCardError(errorMessage);
          toast.error(errorMessage);
        }
      } catch (error) {
        const errorMessage = error.message || 'An error occurred while processing your request';
        setCardError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (error) {
      setCardError('An error occurred during card verification');
      toast.error('An error occurred during card verification');
    } finally {
      setIsProcessing(false);
      setSubmitting(false);
    }
  };

  if (stripeError) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography color="error" variant="h6">
          {stripeError}
        </Typography>
        <Button variant="contained" onClick={() => window.location.reload()} sx={{ mt: 2 }}>
          Refresh Page
        </Button>
      </Box>
    );
  }

  return (
    <Formik
      initialValues={{
        nameOnCard: '',
      }}
      validationSchema={validationSchema}
      onSubmit={handleCardVerification}
    >
      {({ values, handleChange, handleSubmit, errors, touched, isSubmitting }) => (
        <form onSubmit={handleSubmit}>
          <Typography color="primary" variant="h4" mb={2}>
            Credit Card Details {isTrial && <>(optional for trial users)</>}
          </Typography>
          <Grid container spacing={2}>
            {!isTrial && (
              <>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    name="nameOnCard"
                    label="Name on Card"
                    value={values.nameOnCard}
                    onChange={handleChange}
                    error={Boolean(errors.nameOnCard && touched.nameOnCard)}
                    helperText={touched.nameOnCard && errors.nameOnCard}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ p: 2, border: '1px solid #ccc', borderRadius: '4px' }}>
                    <CardElement
                      options={{
                        style: {
                          base: {
                            fontSize: '16px',
                            color: '#424770',
                            '::placeholder': { color: '#aab7c4' },
                          },
                          invalid: { color: '#9e2146' },
                        },
                      }}
                    />
                  </Box>
                  {cardError && (
                    <Typography color="error" variant="caption" mt={1}>
                      {cardError}
                    </Typography>
                  )}
                </Grid>
              </>
            )}
            {isTrial && (
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  No payment details required for trial plan.
                </Typography>
              </Grid>
            )}
          </Grid>
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
            <Button onClick={handleBack} disabled={isProcessing || isSubmitting}>
              Back
            </Button>
            <Button
              variant="contained"
              type="submit"
              disabled={isProcessing || isSubmitting || (!isTrial && !values.nameOnCard)}
            >
              {isProcessing || isSubmitting ? <CircularProgress size={24} /> : 'Complete Registration'}
            </Button>
          </Box>
        </form>
      )}
    </Formik>
  );
};

export default StepThreePayment;