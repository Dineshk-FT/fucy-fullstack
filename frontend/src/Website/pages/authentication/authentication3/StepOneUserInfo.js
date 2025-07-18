/* eslint-disable */
import { Box, Grid, TextField, Button, Typography } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { InputAdornment, IconButton } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { CheckUserStatus, SendVerificationOTP, VerifyOTP } from '../../../../services/api';
import { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';

const StepOneUserInfo = ({ handleNext, data, setIsFirstTimer }) => {
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [formSnapshot, setFormSnapshot] = useState({});
  const [loading, setLoading] = useState(false);
  // console.log('loading', loading);
  return (
    <>
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
          setLoading(true);
          // Optional: check user status if needed
          // const res = await CheckUserStatus({ email: values.email, org: values.organization });
          // const { exists, trialUsed, trialExpired } = res.data;
          // const isFirstTimer = !exists || (!trialUsed && !trialExpired);
          // setIsFirstTimer(isFirstTimer);

          await SendVerificationOTP({ email: values.email })
            .then((res) => {
              if (!res.error) {
                toast.success(res?.data?.message || 'OTP sent successfully');
              } else {
                toast.error(res?.error?.message ?? 'Something went wrong');
              }
            })
            .catch((err) => {
              if (err) {
                toast.error(err?.response?.data?.error ?? 'Something went wrong');
              }
            })
            .finally(() => {
              setLoading(false);
            });
          setOtpSent(true);
          setFormSnapshot(values);
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
                  type={showPassword ? 'text' : 'password'}
                  value={values.password}
                  onChange={handleChange}
                  error={Boolean(errors.password && touched.password)}
                  helperText={touched.password && errors.password}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
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
              {!otpSent && (
                <LoadingButton loading={loading} type="submit" variant="contained">
                  Send OTP
                </LoadingButton>
              )}

              {otpSent && !isVerified && (
                <>
                  <TextField label="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} fullWidth sx={{ mb: 2 }} />
                  <Button
                    variant="contained"
                    onClick={async () => {
                      const verifyRes = await VerifyOTP({ email: formSnapshot.email, otp });
                      if (verifyRes?.data?.message) {
                        setIsVerified(true);
                        toast.success(verifyRes?.data?.message || 'OTP verified successfully');
                      } else {
                        toast.error(verifyRes?.data?.error || 'OTP verification failed');
                      }
                    }}
                  >
                    Verify OTP
                  </Button>
                </>
              )}

              {isVerified && (
                <Button variant="contained" sx={{ mt: 2 }} onClick={() => handleNext(formSnapshot)}>
                  Next
                </Button>
              )}
            </Box>
          </form>
        )}
      </Formik>
      <Toaster position="top-right" reverseOrder={false} />
    </>
  );
};

export default StepOneUserInfo;
