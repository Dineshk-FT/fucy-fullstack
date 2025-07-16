/*eslint-disable*/
import { Box, Grid, TextField, Button, Typography } from '@mui/material';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { CheckUserStatus } from '../../../../services/api';

const StepOneUserInfo = ({ handleNext, data, setIsFirstTimer }) => {
  return (
    <Formik
      initialValues={{
        fname: data.fname || '',
        lname: data.lname || '',
        email: data.email || '',
        password: data.password || '',
        organization: data.organization || '',
        role: data.role || ''
      }}
      validationSchema={Yup.object().shape({
        fname: Yup.string().required('First Name required'),
        lname: Yup.string().required('Last Name required'),
        email: Yup.string().email().required('Email required'),
        password: Yup.string().required('Password required'),
        organization: Yup.string().required('Organization required'),
        role: Yup.string().required('Role required')
      })}
      onSubmit={async (values) => {
        try {
          const res = await CheckUserStatus({
            email: values.email,
            org: values.organization
          });

          // console.log('CheckUserStatus res', res);

          const { exists, trialUsed, trialExpired } = res.data;

          // logic: if no account + trial not used -> first timer
          const isFirstTimer = !exists || (!trialUsed && !trialExpired);
          setIsFirstTimer(isFirstTimer);

          // Save form values and move to next
          handleNext(values);
        } catch (error) {
          console.error('CheckUserStatus failed:', error);
          // Optional: show toast or inline error
        }
      }}
    >
      {({ values, handleChange, handleSubmit, errors, touched }) => (
        <form onSubmit={handleSubmit}>
          <Typography color="primary" variant="h4" mb={2}>
            Enter Your Details
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                name="fname"
                label="First Name"
                value={values.fname}
                onChange={handleChange}
                error={Boolean(errors.fname && touched.fname)}
                helperText={touched.fname && errors.fname}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                name="lname"
                label="Last Name"
                value={values.lname}
                onChange={handleChange}
                error={Boolean(errors.lname && touched.lname)}
                helperText={touched.lname && errors.lname}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                name="email"
                label="Email"
                value={values.email}
                onChange={handleChange}
                error={Boolean(errors.email && touched.email)}
                helperText={touched.email && errors.email}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                name="password"
                label="Password"
                type="password"
                value={values.password}
                onChange={handleChange}
                error={Boolean(errors.password && touched.password)}
                helperText={touched.password && errors.password}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                name="organization"
                label="Organization"
                value={values.organization}
                onChange={handleChange}
                error={Boolean(errors.organization && touched.organization)}
                helperText={touched.organization && errors.organization}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                name="role"
                label="Role"
                value={values.role}
                onChange={handleChange}
                error={Boolean(errors.role && touched.role)}
                helperText={touched.role && errors.role}
              />
            </Grid>
          </Grid>
          <Box sx={{ mt: 3 }}>
            <Button type="submit" variant="contained">
              Next
            </Button>
          </Box>
        </form>
      )}
    </Formik>
  );
};

export default StepOneUserInfo;
