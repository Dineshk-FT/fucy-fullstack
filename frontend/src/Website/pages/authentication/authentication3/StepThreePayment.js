/*eslint-disable*/
import { useState, useEffect } from 'react';
import { Box, Grid, Typography, TextField, useTheme } from '@mui/material';
import { CheckCircleOutline, CreditCardOutlined, ArrowBackIosNew } from '@mui/icons-material';
import Button from '../../../../components/Buttons/Button';
import { Formik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { verifyCard } from '../../../../services/api';

const StepThreePayment = ({ handleBack, data, handleSubmit, selectedPlan }) => {
  const theme = useTheme();
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
      <Box sx={{ 
        p: 4, 
        textAlign: 'center',
        maxWidth: 600,
        mx: 'auto',
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 1
      }}>
        <Typography variant="h6" color="error" gutterBottom>
          Payment Error
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          {stripeError}
        </Typography>
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => window.location.reload()} 
          sx={{ 
            mt: 2,
            borderRadius: 2,
            py: 1.5,
            px: 4,
            fontWeight: 600
          }}
        >
          Refresh Page
        </Button>
      </Box>
    );
  }

  // Sample plan data - replace with actual plan data from props
  const planData = {
    trial: { name: '14-Day Free Trial', price: '$0', period: 'for 14 days' },
    pro: { name: 'Pro Plan', price: '$29', period: 'per month' },
    enterprise: { name: 'Enterprise', price: 'Custom', period: 'Contact sales' }
  };

  const selectedPlanData = planData[selectedPlan] || planData.trial;

  return (
    <Formik
      initialValues={{
        nameOnCard: '',
      }}
      validationSchema={validationSchema}
      onSubmit={handleCardVerification}
    >
      {({ values, handleChange, handleSubmit, errors, touched, isSubmitting, handleBlur }) => (
        <form onSubmit={handleSubmit}>
          <Box sx={{ maxWidth: 600, mx: 'auto', px: 2 }}>
            <Typography 
              variant="h4" 
              gutterBottom 
              fontWeight={700}
              color="primary"
              textAlign="center"
              mb={3}
            >
              {isTrial ? 'Start Your Free Trial' : 'Complete Your Purchase'}
            </Typography>
            
            {/* Plan Summary */}
            <Box sx={{ 
              bgcolor: 'background.paper', 
              borderRadius: 2,
              p: 3,
              mb: 4,
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}>
              <Typography variant="h6" fontWeight={600} mb={1}>
                Order Summary
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body1" color="text.secondary">
                  {selectedPlanData.name}
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {selectedPlanData.price}
                  {selectedPlanData.period && (
                    <Typography component="span" variant="body2" color="text.secondary" ml={0.5}>
                      /{selectedPlanData.period}
                    </Typography>
                  )}
                </Typography>
              </Box>
              {!isTrial && (
                <Box sx={{ 
                  bgcolor: 'success.light', 
                  color: 'success.dark',
                  p: 1.5,
                  borderRadius: 1,
                  mt: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <CheckCircleOutline fontSize="small" />
                  <Typography variant="body2" fontWeight={500}>
                    {selectedPlanData.price === 'Custom' 
                      ? 'Contact us for enterprise pricing'
                      : `Billed ${selectedPlanData.period}`}
                  </Typography>
                </Box>
              )}
            </Box>
            
            {isTrial && (
              <Box 
                sx={{ 
                  bgcolor: 'success.light', 
                  color: 'success.contrastText',
                  p: 2,
                  borderRadius: 2,
                  mb: 4,
                  textAlign: 'center'
                }}
              >
                <Typography variant="body1" fontWeight={500}>
                  No credit card required for the free trial period
                </Typography>
              </Box>
            )}
            {!isTrial && (
              <Box 
                sx={{ 
                  p: 3, 
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  mb: 4
                }}
              >
                <Typography variant="h6" fontWeight={600} mb={3}>
                  Payment Method
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Name on Card"
                      name="nameOnCard"
                      value={values.nameOnCard || ''}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.nameOnCard && Boolean(errors.nameOnCard)}
                      helperText={touched.nameOnCard && errors.nameOnCard}
                      variant="outlined"
                      InputProps={{
                        style: {
                          borderRadius: 8,
                          backgroundColor: theme.palette.background.paper
                        },
                        startAdornment: (
                          <CreditCardOutlined 
                            sx={{ 
                              color: 'text.secondary',
                              mr: 1.5,
                              fontSize: '1.25rem'
                            }} 
                          />
                        )
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': {
                            borderColor: theme.palette.primary.main,
                          },
                        },
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Box>
                      <Typography variant="subtitle2" gutterBottom fontWeight={600} color="text.primary">
                        Card Details
                      </Typography>
                      <Box
                        sx={{
                          p: 2,
                          border: '1px solid',
                          borderColor: cardError ? 'error.main' : 'divider',
                          borderRadius: 2,
                          bgcolor: theme.palette.background.paper,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            borderColor: theme.palette.primary.main,
                            boxShadow: `0 0 0 1px ${theme.palette.primary.main}`
                          },
                          '&.StripeElement--focus': {
                            borderColor: theme.palette.primary.main,
                            boxShadow: `0 0 0 2px ${theme.palette.primary.main}40`
                          }
                        }}
                        className={cardError ? 'Mui-error' : ''}
                      >
                        <CardElement
                          options={{
                            style: {
                              base: {
                                fontSize: '16px',
                                color: theme.palette.text.primary,
                                fontFamily: theme.typography.fontFamily,
                                '::placeholder': {
                                  color: theme.palette.text.secondary,
                                  opacity: 0.7,
                                },
                                ':-webkit-autofill': {
                                  color: theme.palette.text.primary,
                                },
                                iconColor: theme.palette.primary.main,
                              },
                              invalid: {
                                color: theme.palette.error.main,
                                iconColor: theme.palette.error.main,
                              },
                            },
                            hidePostalCode: true,
                          }}
                          onChange={(e) => {
                            setCardError(e.error?.message || null);
                          }}
                        />
                      </Box>
                      {cardError && (
                        <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block' }}>
                          {cardError}
                        </Typography>
                      )}
                      <Box sx={{ mt: 2, display: 'flex', gap: 1.5, justifyContent: 'flex-end' }}>
                        <img 
                          src="/assets/images/payment-methods/visa.svg" 
                          alt="Visa" 
                          style={{ height: 20, opacity: 0.8 }} 
                        />
                        <img 
                          src="/assets/images/payment-methods/mastercard.svg" 
                          alt="Mastercard" 
                          style={{ height: 20, opacity: 0.8 }} 
                        />
                        <img 
                          src="/assets/images/payment-methods/amex.svg" 
                          alt="American Express" 
                          style={{ height: 20, opacity: 0.8 }} 
                        />
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            )}
            <Box 
              sx={{ 
                mt: 4,
                pt: 3,
                borderTop: '1px solid',
                borderColor: 'divider',
                display: 'flex', 
                flexDirection: { xs: 'column-reverse', sm: 'row' },
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 2,
                '& > *': {
                  width: { xs: '100%', sm: 'auto' },
                  maxWidth: { xs: '100%', sm: 200 },
                  flex: { xs: '0 0 auto', sm: 1 }
                }
              }}
            >
              <Button
                onClick={handleBack}
                variant="outlined"
                color="primary"
                disabled={isSubmitting || isProcessing}
                size="large"
                fullWidth
                startIcon={<ArrowBackIosNew fontSize="small" />}
                sx={{
                  borderRadius: 2,
                  py: 1.5,
                  fontWeight: 600,
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    borderWidth: 2,
                    borderColor: 'primary.main',
                    backgroundColor: 'transparent',
                  },
                  borderWidth: 2,
                  '&.Mui-disabled': {
                    borderWidth: 2,
                    opacity: 0.7
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Back
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isSubmitting || isProcessing}
                loading={isSubmitting || isProcessing}
                loadingText={isProcessing ? 'Processing...' : 'Submitting...'}
                size="large"
                fullWidth
                sx={{
                  borderRadius: 2,
                  py: 1.5,
                  fontWeight: 600,
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: `0 8px 16px ${theme.palette.primary.main}40`,
                  },
                  '&.Mui-disabled': {
                    background: theme.palette.action.disabledBackground,
                    color: theme.palette.action.disabled,
                    transform: 'none !important',
                    boxShadow: 'none !important'
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                {isTrial ? 'Start Free Trial' : 'Complete Payment'}
              </Button>
            </Box>
          </Box>
        </form>
      )}
    </Formik>
  );
};

export default StepThreePayment;