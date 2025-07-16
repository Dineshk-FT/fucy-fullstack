/*eslint-disable*/
import { Box, Button, Grid, TextField, Typography } from '@mui/material';
import { Formik } from 'formik';
import * as Yup from 'yup';

const StepThreePayment = ({ handleBack, data, handleSubmit, isFirstTimer, selectedPlan }) => {
  // Check if payment is optional:
  const isTrial = isFirstTimer && selectedPlan === 'trial';

  const validationSchema = isTrial
    ? Yup.object().shape({}) // No validation if trial
    : Yup.object().shape({
        cardNumber: Yup.string().required('Card Number required'),
        expiry: Yup.string().required('Expiry Date required'),
        cvc: Yup.string().required('CVC required'),
        nameOnCard: Yup.string().required('Name required')
      });

  return (
    <Formik
      initialValues={{
        cardNumber: '',
        expiry: '',
        cvc: '',
        nameOnCard: ''
      }}
      validationSchema={validationSchema}
      onSubmit={(values) => handleSubmit(values)}
    >
      {({ values, handleChange, handleSubmit, errors, touched }) => (
        <form onSubmit={handleSubmit}>
          <Typography color="primary" variant="h4" mb={2}>
            Credit Card Details {isTrial && <>(optional for trial users)</>}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="cardNumber"
                label="Card Number"
                value={values.cardNumber}
                onChange={handleChange}
                error={Boolean(errors.cardNumber && touched.cardNumber)}
                helperText={touched.cardNumber && errors.cardNumber}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                name="expiry"
                label="Expiry (MM/YY)"
                value={values.expiry}
                onChange={handleChange}
                error={Boolean(errors.expiry && touched.expiry)}
                helperText={touched.expiry && errors.expiry}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                name="cvc"
                label="CVC"
                value={values.cvc}
                onChange={handleChange}
                error={Boolean(errors.cvc && touched.cvc)}
                helperText={touched.cvc && errors.cvc}
              />
            </Grid>
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
          </Grid>
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
            <Button onClick={handleBack}>Back</Button>
            <Button variant="contained" type="submit">
              Complete Registration
            </Button>
          </Box>
        </form>
      )}
    </Formik>
  );
};

export default StepThreePayment;
