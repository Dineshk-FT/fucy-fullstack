/*eslint-disable*/
import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

// material-ui
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  Stack,
  Typography,
  useMediaQuery,
  Alert
} from '@mui/material';

// third party
import * as Yup from 'yup';
import { Formik } from 'formik';

// project imports
import useScriptRef from '../../../../hooks/useScriptRef';
import AnimateButton from '../../../../components/extended/AnimateButton';

// assets
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Google from '../../../../assets/images/icons/social-google.svg';
import { changeCanvasPage, OpenInitialDialog } from '../../../../store/slices/CanvasSlice';
import { closeAll } from '../../../../store/slices/CurrentIdSlice';
import { login, checkUserStatus, CheckUserStatus } from '../../../../services/api';
import toast, { Toaster } from 'react-hot-toast';
import { setModelId } from '../../../../store/slices/PageSectionSlice';
import LicenseExpiryModal from '../../../../components/Modal/LicenseExpiryModal';
import { setLicenseWarning } from '../../../../store/slices/UserDetailsSlice';

const FirebaseLogin = ({ ...others }) => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const scriptedRef = useScriptRef();
  const notify = (message, status) => toast[status](message);
  const matchDownSM = useMediaQuery(theme.breakpoints.down('md'));
  const customization = useSelector((state) => state.customization);
  const [checked, setChecked] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [licenseWarning, setLicenseWarning] = useState(null);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [orgInput, setOrgInput] = useState('');
  const [emailInput, setEmailInput] = useState('');

  const googleHandler = async () => {
    console.error('Login');
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const checkLicenseStatus = useCallback(async (email, org) => {
    if (!email || !org) return;

    setCheckingStatus(true);
    try {
      const response = await CheckUserStatus({
        email: email.trim(), // No toLowerCase() - case sensitive
        org: org.trim() // No toLowerCase() - case sensitive
      });
      // console.log('response', response);
      const data = response.data;

      if (!data.exists) {
        setLicenseWarning({
          severity: 'error',
          message: data.message || 'User not found'
        });
        return;
      }

      if (data.message === 'User not found in this organization') {
        setLicenseWarning({
          severity: 'error',
          message: 'User not found in this organization'
        });
        return;
      }

      if (data.trialUsed && data.license_end) {
        const expirationDate = new Date(data.license_end);
        const today = new Date();
        const timeDiff = expirationDate.getTime() - today.getTime();
        const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));

        if (daysRemaining <= 0) {
          setLicenseWarning({
            severity: 'error',
            message: 'Your trial license has expired!'
          });
        } else if (daysRemaining <= 14) {
          setLicenseWarning({
            severity: 'warning',
            message: `Your trial license expires in ${daysRemaining} day${daysRemaining === 1 ? '' : 's'}`
          });
        } else {
          setLicenseWarning(null);
        }
      }
    } catch (error) {
      console.log('error', error);
      setLicenseWarning({
        severity: 'error',
        message: 'Error checking license status'
      });
    } finally {
      setCheckingStatus(false);
    }
  }, []);

  useEffect(() => {
    if (!orgInput) return;

    const timer = setTimeout(() => {
      checkLicenseStatus(emailInput, orgInput);
    }, 2000);

    return () => clearTimeout(timer);
  }, [orgInput, emailInput, checkLicenseStatus]);

  const handleLogin = (email, password, org) => {
    // First clear any existing license warning
    dispatch({ type: 'Canvas/clearLicenseWarning' });
    
    dispatch(login({ 
      username: email, 
      password, 
      org 
    }))
      .then((res) => {
        if (res.payload.status === 200 || res.payload.status === 201) {
          notify('Login Successfully', 'success');
          
          // Show license warning if needed (will be handled by the login thunk)
          if (res.payload.data?.license?.isExpiring) {
            // The warning is already dispatched by the login thunk
          }
          
          setTimeout(() => {
            sessionStorage.setItem('user-id', res?.payload?.data['user-id']);
            window.location.href = `/Models/${res?.payload?.data?.model_id}`;
            dispatch(changeCanvasPage('canvas'));
            dispatch(setModelId(res?.payload?.data?.model_id));
            dispatch(OpenInitialDialog());
            dispatch(closeAll());
          }, 600);
        } else {
          notify(res.payload.data.error, 'error');
        }
      })
      .catch((err) => {
        console.error('Login error:', err);
        notify(err.message || 'Login failed', 'error');
      });
  };

  return (
    <>
      <Grid container direction="column" justifyContent="center" spacing={2}>
        <Grid item xs={12} container alignItems="center" justifyContent="center">
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1">Sign in with Email address</Typography>
          </Box>
        </Grid>
      </Grid>

      <Formik
        initialValues={{
          email: '',
          password: '',
          org: '',
          submit: null
        }}
        validationSchema={Yup.object().shape({
          email: Yup.string().max(255).required('Email/Username is required'),
          password: Yup.string().max(255).required('Password is required'),
          org: Yup.string().max(255).required('Organization is required')
        })}
        onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
          try {
            if (scriptedRef.current) {
              setStatus({ success: true });
              setSubmitting(false);
              handleLogin(values.email, values.password, values.org);
            }
          } catch (err) {
            console.error(err);
            if (scriptedRef.current) {
              setStatus({ success: false });
              setErrors({ submit: err.message });
              setSubmitting(false);
            }
          }
        }}
      >
        {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
          <form noValidate onSubmit={handleSubmit} {...others}>
            <FormControl fullWidth error={Boolean(touched.email && errors.email)} sx={{ ...theme.typography.customInput, mb: 2 }}>
              <InputLabel htmlFor="outlined-adornment-email-login">Email Address / Username</InputLabel>
              <OutlinedInput
                id="outlined-adornment-email-login"
                type="text"
                value={values.email}
                name="email"
                onBlur={handleBlur}
                onChange={(e) => {
                  handleChange(e);
                  setEmailInput(e.target.value);
                }}
                label="Email Address / Username"
                inputProps={{}}
              />
              {touched.email && errors.email && (
                <FormHelperText error id="standard-weight-helper-text-email-login">
                  {errors.email}
                </FormHelperText>
              )}
            </FormControl>

            <FormControl fullWidth error={Boolean(touched.org && errors.org)} sx={{ ...theme.typography.customInput, mb: 2 }}>
              <InputLabel htmlFor="outlined-adornment-org-login">Organization</InputLabel>
              <OutlinedInput
                id="outlined-adornment-org-login"
                type="text"
                value={values.org}
                name="org"
                onBlur={handleBlur}
                onChange={(e) => {
                  handleChange(e);
                  setOrgInput(e.target.value);
                }}
                label="Organization"
                inputProps={{}}
              />
              {touched.org && errors.org && (
                <FormHelperText error id="standard-weight-helper-text-org-login">
                  {errors.org}
                </FormHelperText>
              )}
            </FormControl>

            <FormControl fullWidth error={Boolean(touched.password && errors.password)} sx={{ ...theme.typography.customInput, mb: 2 }}>
              <InputLabel htmlFor="outlined-adornment-password-login">Password</InputLabel>
              <OutlinedInput
                id="outlined-adornment-password-login"
                type={showPassword ? 'text' : 'password'}
                value={values.password}
                name="password"
                onBlur={handleBlur}
                onChange={handleChange}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                      size="large"
                    >
                      {showPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                }
                label="Password"
                inputProps={{}}
              />
              {touched.password && errors.password && (
                <FormHelperText error id="standard-weight-helper-text-password-login">
                  {errors.password}
                </FormHelperText>
              )}
            </FormControl>

            {licenseWarning && (
              <Box sx={{ mb: 2 }}>
                <Alert severity={licenseWarning.severity}>{licenseWarning.message}</Alert>
              </Box>
            )}

            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
              <FormControlLabel
                control={
                  <Checkbox checked={checked} onChange={(event) => setChecked(event.target.checked)} name="checked" color="primary" />
                }
                label="Remember me"
              />
              <Typography variant="subtitle1" color="secondary" sx={{ textDecoration: 'none', cursor: 'pointer' }}>
                Forgot Password?
              </Typography>
            </Stack>
            {errors.submit && (
              <Box sx={{ mt: 3 }}>
                <FormHelperText error>{errors.submit}</FormHelperText>
              </Box>
            )}

            <Box sx={{ mt: 2 }}>
              <AnimateButton>
                <Button
                  disableElevation
                  disabled={isSubmitting || checkingStatus}
                  fullWidth
                  size="large"
                  type="submit"
                  variant="contained"
                  color="secondary"
                >
                  {checkingStatus ? 'Checking...' : 'Sign in'}
                </Button>
              </AnimateButton>
            </Box>
          </form>
        )}
      </Formik>
      <Toaster position="top-center" reverseOrder={false} />
      <LicenseExpiryModal />
    </>
  );
};

export default FirebaseLogin;
