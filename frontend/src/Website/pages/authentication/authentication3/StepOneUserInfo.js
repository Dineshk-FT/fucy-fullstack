/* eslint-disable */
import { Box, Grid, TextField, Typography, LinearProgress, Paper, Fade, Zoom, Slide, Collapse, keyframes } from '@mui/material';
import { InputAdornment, IconButton } from '@mui/material';
import Button from '../../../../components/Buttons/Button';
import { Visibility, VisibilityOff, CheckCircle, ErrorOutline, Refresh } from '@mui/icons-material';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { CheckUserStatus, SendVerificationOTP, VerifyOTP } from '../../../../services/api';
import { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { useTheme } from '@mui/material/styles';

// Password strength indicator component
const PasswordStrength = ({ password = '' }) => {
  const getStrength = (pass) => {
    let strength = 0;
    if (pass.length >= 8) strength += 1;
    if (pass.match(/[a-z]+/)) strength += 1;
    if (pass.match(/[A-Z]+/)) strength += 1;
    if (pass.match(/[0-9]+/)) strength += 1;
    if (pass.match(/[!@#$%^&*(),.?\":{}|<>]+/)) strength += 1;
    return Math.min(Math.floor((strength / 5) * 100), 100);
  };

  const strength = getStrength(password);
  const getColor = (strength) => {
    if (strength < 30) return 'error';
    if (strength < 70) return 'warning';
    return 'success';
  };

  return (
    <Box sx={{ mt: 1, width: '100%' }}>
      <LinearProgress 
        variant="determinate" 
        value={strength} 
        color={getColor(strength)}
        sx={{
          height: 6,
          borderRadius: 3,
          '& .MuiLinearProgress-bar': {
            borderRadius: 3,
          },
        }}
      />
      <Typography variant="caption" color="text.secondary">
        {!password ? 'Password strength' : 
         strength < 30 ? 'Weak' : 
         strength < 70 ? 'Moderate' : 'Strong'}
      </Typography>
    </Box>
  );
};

const StepOneUserInfo = ({ handleNext, data, setIsFirstTimer }) => {
  const theme = useTheme();
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [formSnapshot, setFormSnapshot] = useState({});
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  const [otpInputs, setOtpInputs] = useState(Array(6).fill(''));
  const [shake, setShake] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: null, message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Animation for OTP input shake
  const shakeAnimation = keyframes`
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
    20%, 40%, 60%, 80% { transform: translateX(5px); }
  `;

  // Resend OTP timer
  useEffect(() => {
    if (otpSent && !canResend) {
      const timer = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [otpSent, canResend]);

  const validateForm = async (values) => {
    const errors = {};
    
    try {
      await validationSchema.validate(values, { abortEarly: false });
    } catch (err) {
      err.inner.forEach((error) => {
        errors[error.path] = error.message;
      });
    }
    
    // Custom validation for email domain
    if (values.email && !/^[^@]+@[^@]+\.[^@]+$/.test(values.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    return Object.keys(errors).length === 0 ? null : errors;
  };

  const handleSubmit = async (values, { setSubmitting, setFieldError, setTouched }) => {
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: '' });
    setFormValues(values);
    setSubmitting(true);
    
    // Manually validate all fields
    const errors = await validateForm(values);
    if (errors) {
      Object.keys(errors).forEach(field => {
        setFieldError(field, errors[field]);
        setFieldTouched(field, true, false);
      });
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setIsSubmitting(false);
      setSubmitting(false);
      return;
    }

    try {
      const res = await SendVerificationOTP({ email: values.email });
      if (!res.error) {
        setOtpSent(true);
        setFormValues(values);
        setSubmitStatus({ 
          type: 'success', 
          message: 'Verification code sent to your email',
          email: values.email
        });
        toast.success('Verification code sent!');
      } else {
        const errorMsg = res.error?.message || 'Failed to send verification code';
        setSubmitStatus({ 
          type: 'error', 
          message: errorMsg 
        });
        toast.error(errorMsg);
        // Shake form on error
        setShake(true);
        setTimeout(() => setShake(false), 500);
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      const errorMsg = 'An error occurred. Please try again.';
      setSubmitStatus({ 
        type: 'error', 
        message: errorMsg 
      });
      toast.error(errorMsg);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setIsSubmitting(false);
      setSubmitting(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;
    
    setLoading(true);
    try {
      // Validate email before resending OTP
      if (!formValues.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formValues.email)) {
        toast.error('Please enter a valid email address');
        setLoading(false);
        return;
      }
      
      const res = await SendVerificationOTP({ email: formValues.email });
      if (!res.error) {
        toast.success('New verification code sent!');
        setCanResend(false);
        setResendTimer(30);
        setOtpInputs(Array(6).fill(''));
        setVerificationError('');
        
        // Show success message in the UI
        setSubmitStatus({
          type: 'success',
          message: 'New verification code sent to your email',
          email: formValues.email
        });
      } else {
        const errorMessage = res?.error?.message || 'Failed to resend OTP. Please try again.';
        toast.error(errorMessage);
        setSubmitStatus({
          type: 'error',
          message: errorMessage
        });
        setShake(true);
        setTimeout(() => setShake(false), 500);
      }
    } catch (error) {
      toast.error('An error occurred while resending OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value && !/^[0-9]$/.test(value)) return;
    
    const newOtpInputs = [...otpInputs];
    newOtpInputs[index] = value;
    setOtpInputs(newOtpInputs);
    setOtp(newOtpInputs.join(''));
    setVerificationError('');
    
    // Auto focus next input
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };
  
  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpInputs[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };
  
  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text/plain').trim();
    if (/^\d{6}$/.test(pasteData)) {
      const pastedOtp = pasteData.split('');
      setOtpInputs(pastedOtp);
      setOtp(pasteData);
      document.getElementById(`otp-5`)?.focus();
    }
  };

  const handleOtpVerification = async () => {
    // Reset error state
    setVerificationError('');
    
    // Validate OTP format
    if (!/^\d{6}$/.test(otp)) {
      setVerificationError('Please enter a valid 6-digit code');
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    
    // Additional OTP validation (e.g., check for all same digits, sequential numbers)
    if (/(\d)\1{5}/.test(otp)) {
      setVerificationError('Please enter a valid verification code');
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
  };

  const validationSchema = Yup.object().shape({
    fname: Yup.string()
      .required('First name is required')
      .min(2, 'First name must be at least 2 characters')
      .max(50, 'First name must be less than 50 characters')
      .matches(/^[a-zA-Z\s'-]+$/, 'First name can only contain letters, spaces, hyphens, and apostrophes'),
      
    lname: Yup.string()
      .required('Last name is required')
      .min(2, 'Last name must be at least 2 characters')
      .max(50, 'Last name must be less than 50 characters')
      .matches(/^[a-zA-Z\s'-]+$/, 'Last name can only contain letters, spaces, hyphens, and apostrophes'),
      
    email: Yup.string()
      .email('Please enter a valid email address')
      .required('Email is required')
      .matches(
        /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
        'Invalid email format'
      ),
      
    password: Yup.string()
      .required('Password is required')
      .min(8, 'Password must be at least 8 characters')
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      ),
      
    confirmPassword: Yup.string()
      .required('Please confirm your password')
      .oneOf([Yup.ref('password'), null], 'Passwords must match'),
      
    phone: Yup.string()
      .required('Phone number is required')
      .matches(
        /^[0-9]{10}$/, 
        'Phone number must be exactly 10 digits'
      ),
      
    role: Yup.string()
      .required('Please select a role')
      .oneOf(['user', 'admin', 'manager', 'executive', 'other'], 'Invalid role selected'),
      
    organization: Yup.string()
      .required('Organization is required')
      .min(2, 'Must be at least 2 characters')
  });

  return (
    <>
      <Formik
        initialValues={{
          fname: '',
          lname: '',
          email: '',
          password: '',
          confirmPassword: '',
          phone: '',
          role: ''
        }}
        validateOnChange={true}
        validateOnBlur={true}
        validateOnMount={false}
        validationSchema={validationSchema}
        validate={validateForm}
        onSubmit={handleSubmit}
      >
        {({ values, handleChange, handleBlur, handleSubmit, errors, touched }) => (
          <form onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(e);
          }}>
            <Box 
              sx={{ 
                textAlign: 'center', 
                mb: 4,
                animation: shake ? `${shakeAnimation} 0.5s ease-in-out` : 'none'
              }}
              onAnimationEnd={() => setShake(false)}
            >
              <Fade in={true} timeout={500}>
                <Box>
                  <Typography color="primary" variant="h4" fontWeight={700} gutterBottom>
                    {otpSent ? 'Verify Your Email' : 'Create Your Account'}
                  </Typography>
                  <Typography color="text.secondary" variant="body1" mb={2}>
                    {otpSent 
                      ? `We've sent a 6-digit code to ${submitStatus.email || 'your email'}`
                      : 'Fill in your details to get started'}
                  </Typography>
                  
                  {submitStatus.type === 'success' && (
                    <Fade in={submitStatus.type === 'success'} timeout={500}>
                      <Box 
                        sx={{
                          backgroundColor: 'success.light',
                          color: 'success.contrastText',
                          p: 1.5,
                          borderRadius: 1,
                          mt: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 1
                        }}
                      >
                        <CheckCircle fontSize="small" />
                        <Typography variant="body2">
                          {submitStatus.message}
                        </Typography>
                      </Box>
                    </Fade>
                  )}
                  
                  {submitStatus.type === 'error' && (
                    <Fade in={submitStatus.type === 'error'} timeout={500}>
                      <Box 
                        sx={{
                          backgroundColor: 'error.light',
                          color: 'error.contrastText',
                          p: 1.5,
                          borderRadius: 1,
                          mt: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 1
                        }}
                      >
                        <ErrorOutline fontSize="small" />
                        <Typography variant="body2">
                          {submitStatus.message}
                        </Typography>
                      </Box>
                    </Fade>
                  )}
                </Box>
              </Fade>
            </Box>
            <Grid container spacing={2} sx={{ '& .MuiGrid-item': { py: 1 } }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="fname"
                  label="First Name"
                  value={values.fname}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={Boolean(errors.fname && touched.fname)}
                  helperText={touched.fname && errors.fname}
                  variant="outlined"
                  margin="normal"
                  InputProps={{
                    style: {
                      borderRadius: '8px',
                      backgroundColor: theme.palette.background.paper,
                      transition: 'all 0.3s ease',
                    },
                    sx: {
                      '&:hover fieldset': {
                        borderColor: theme.palette.primary.main + ' !important',
                      },
                    },
                  }}
                  InputLabelProps={{
                    style: { color: theme.palette.text.secondary },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="lname"
                  label="Last Name"
                  value={values.lname}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={Boolean(errors.lname && touched.lname)}
                  helperText={touched.lname && errors.lname}
                  variant="outlined"
                  margin="normal"
                  InputProps={{
                    style: {
                      borderRadius: '8px',
                      backgroundColor: theme.palette.background.paper,
                      transition: 'all 0.3s ease',
                    },
                    sx: {
                      '&:hover fieldset': {
                        borderColor: theme.palette.primary.main + ' !important',
                      },
                    },
                  }}
                  InputLabelProps={{
                    style: { color: theme.palette.text.secondary },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="email"
                  label="Email Address"
                  type="email"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={Boolean(errors.email && touched.email)}
                  helperText={touched.email && (errors.email || 'We\'ll send a verification code to this email')}
                  variant="outlined"
                  margin="normal"
                  InputProps={{
                    style: {
                      borderRadius: '8px',
                      backgroundColor: theme.palette.background.paper,
                      transition: 'all 0.3s ease',
                    },
                    sx: {
                      '&:hover fieldset': {
                        borderColor: theme.palette.primary.main + ' !important',
                      },
                    },
                  }}
                  InputLabelProps={{
                    style: { color: theme.palette.text.secondary },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="password"
                  label="Create a Password"
                  type={showPassword ? 'text' : 'password'}
                  value={values.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={Boolean(errors.password && touched.password)}
                  helperText={touched.password && errors.password}
                  variant="outlined"
                  margin="normal"
                  InputProps={{
                    style: {
                      borderRadius: '8px',
                      backgroundColor: theme.palette.background.paper,
                      transition: 'all 0.3s ease',
                    },
                    sx: {
                      '&:hover fieldset': {
                        borderColor: theme.palette.primary.main + ' !important',
                      },
                    },
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton 
                          onClick={(e) => {
                            e.preventDefault();
                            setShowPassword(!showPassword);
                          }}
                          edge="end"
                          sx={{
                            color: 'text.secondary',
                            '&:hover': {
                              backgroundColor: 'transparent',
                              color: theme.palette.primary.main,
                            }
                          }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  InputLabelProps={{
                    style: { color: theme.palette.text.secondary },
                  }}
                />
                {values.password && <PasswordStrength password={values.password} />}
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="organization"
                  label="Organization Name"
                  value={values.organization}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={Boolean(errors.organization && touched.organization)}
                  helperText={touched.organization && (errors.organization || 'Your company or organization name')}
                  variant="outlined"
                  margin="normal"
                  InputProps={{
                    style: {
                      borderRadius: '8px',
                      backgroundColor: theme.palette.background.paper,
                      transition: 'all 0.3s ease',
                    },
                    sx: {
                      '&:hover fieldset': {
                        borderColor: theme.palette.primary.main + ' !important',
                      },
                    },
                  }}
                  InputLabelProps={{
                    style: { color: theme.palette.text.secondary },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="role"
                  label="Your Role"
                  value={values.role}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={Boolean(errors.role && touched.role)}
                  helperText={touched.role && (errors.role || 'Select your primary role in the organization')}
                  variant="outlined"
                  margin="normal"
                  select
                  SelectProps={{
                    native: true,
                    style: {
                      borderRadius: '8px',
                      backgroundColor: theme.palette.background.paper,
                      transition: 'all 0.3s ease',
                    },
                    sx: {
                      '&:hover fieldset': {
                        borderColor: theme.palette.primary.main + ' !important',
                      },
                    },
                  }}
                  InputLabelProps={{
                    style: { color: theme.palette.text.secondary },
                  }}
                >
                  <option value="">Select your role</option>
                  <option value="developer">Developer</option>
                  <option value="designer">Designer</option>
                  <option value="manager">Manager</option>
                  <option value="executive">Executive</option>
                  <option value="admin">Administrator</option>
                  <option value="other">Other</option>
                </TextField>
              </Grid>
            </Grid>

            <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {!otpSent ? (
                <Fade in={!otpSent} timeout={500}>
                  <Box>
                    <Button 
                      type="submit" 
                      variant="contained" 
                      size="large"
                      fullWidth
                      disabled={isSubmitting}
                      sx={{
                        height: 48,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                        fontSize: '1rem',
                        boxShadow: '0 4px 14px 0 rgba(0, 0, 0, 0.1)',
                        '&:hover': {
                          boxShadow: '0 6px 20px 0 rgba(0, 0, 0, 0.15)',
                          transform: 'translateY(-1px)'
                        },
                        '&:active': {
                          transform: 'translateY(0)',
                          boxShadow: '0 2px 10px 0 rgba(0, 0, 0, 0.1)'
                        },
                        '&.Mui-disabled': {
                          backgroundColor: 'action.disabledBackground',
                          color: 'action.disabled'
                        },
                        transition: 'all 0.2s ease',
                      }}
                      startIcon={
                        isSubmitting ? (
                          <Box 
                            component="span" 
                            sx={{
                              display: 'inline-block',
                              width: 20,
                              height: 20,
                              border: '2px solid',
                              borderColor: 'primary.contrastText',
                              borderTopColor: 'transparent',
                              borderRadius: '50%',
                              animation: 'spin 1s linear infinite',
                              '@keyframes spin': {
                                '0%': { transform: 'rotate(0deg)' },
                                '100%': { transform: 'rotate(360deg)' },
                              },
                            }}
                          />
                        ) : null
                      }
                    >
                      {isSubmitting ? 'Sending...' : 'Send Verification Code'}
                    </Button>
                    
                    {!isSubmitting && submitStatus.type === 'error' && (
                      <Fade in={!isSubmitting && submitStatus.type === 'error'} timeout={500}>
                        <Typography 
                          variant="caption" 
                          color="error" 
                          sx={{
                            display: 'block',
                            mt: 1,
                            textAlign: 'center',
                            animation: 'pulse 2s infinite',
                            '@keyframes pulse': {
                              '0%': { opacity: 0.6 },
                              '50%': { opacity: 1 },
                              '100%': { opacity: 0.6 },
                            },
                          }}
                        >
                          {submitStatus.message}
                        </Typography>
                      </Fade>
                    )}
                  </Box>
                </Fade>
              ) : !isVerified ? (
                <>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                      Enter Verification Code
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={2}>
                      We've sent a 6-digit code to {formSnapshot.email}
                    </Typography>
                    
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        gap: 1.5, 
                        mb: 2,
                        animation: shake ? `${shakeAnimation} 0.5s ease-in-out` : 'none'
                      }}
                      onAnimationEnd={() => setShake(false)}
                    >
                      {[0, 1, 2, 3, 4, 5].map((i) => (
                        <Fade in={true} key={i} timeout={100 * (i + 1)}>
                          <TextField
                            inputProps={{
                              maxLength: 1,
                              inputMode: 'numeric',
                              style: {
                                textAlign: 'center',
                                fontSize: '1.5rem',
                                padding: '12px',
                                height: '60px',
                                width: '100%',
                                caretColor: theme.palette.primary.main,
                              },
                            }}
                            value={otpInputs[i]}
                            onChange={(e) => handleOtpChange(i, e.target.value)}
                            onKeyDown={(e) => handleOtpKeyDown(i, e)}
                            onPaste={handlePaste}
                            id={`otp-${i}`}
                            variant="outlined"
                            autoComplete="one-time-code"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                width: '100%',
                                '& input': {
                                  textAlign: 'center',
                                  '&::selection': {
                                    backgroundColor: 'transparent',
                                  },
                                },
                                '& fieldset': {
                                  borderWidth: '2px',
                                  borderColor: verificationError ? theme.palette.error.main : 
                                    otpInputs[i] ? theme.palette.primary.main : theme.palette.divider,
                                  transition: 'all 0.3s ease',
                                },
                                '&:hover fieldset': {
                                  borderColor: verificationError ? theme.palette.error.dark : 
                                    theme.palette.primary.main,
                                },
                                '&.Mui-focused fieldset': {
                                  borderColor: verificationError ? theme.palette.error.main : 
                                    theme.palette.primary.main,
                                  borderWidth: '2px',
                                  boxShadow: `0 0 0 3px ${theme.palette.primary.light}40`,
                                },
                              },
                            }}
                          />
                        </Fade>
                      ))}
                    </Box>
                    
                    <Box sx={{ mt: 2 }}>
                      <Collapse in={!!verificationError}>
                        <Box 
                          sx={{
                            backgroundColor: theme.palette.error.light,
                            color: theme.palette.error.contrastText,
                            p: 1.5,
                            borderRadius: 1,
                            mb: 2,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            animation: shake ? `${shakeAnimation} 0.5s ease-in-out` : 'none'
                          }}
                        >
                          <ErrorOutline fontSize="small" />
                          <Typography variant="body2">{verificationError}</Typography>
                        </Box>
                      </Collapse>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                        <Button
                          variant="text"
                          color="primary"
                          onClick={handleResendOTP}
                          disabled={!canResend || loading}
                          startIcon={<Refresh />}
                          sx={{
                            textTransform: 'none',
                            fontWeight: 500,
                            '&:hover': {
                              backgroundColor: 'transparent',
                              textDecoration: 'underline',
                              transform: 'rotate(-30deg)',
                            },
                            '& .MuiButton-startIcon': {
                              transition: 'transform 0.3s ease',
                            },
                            '&:hover .MuiButton-startIcon': {
                              transform: 'rotate(180deg)',
                            },
                            transition: 'all 0.3s ease',
                          }}
                        >
                          {loading ? 'Sending...' : canResend ? 'Resend Code' : `Resend in ${resendTimer}s`}
                        </Button>
                        
                        <Zoom in={otp.length === 6}>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={async () => {
                              if (otp.length !== 6) {
                                setVerificationError('Please enter a 6-digit code');
                                setShake(true);
                                return;
                              }
                              
                              setVerifying(true);
                              setVerificationError('');
                              
                              try {
                                const verifyRes = await VerifyOTP({ 
                                  email: formSnapshot.email, 
                                  otp 
                                });
                                
                                if (verifyRes?.data?.message) {
                                  setIsVerified(true);
                                  toast.success(verifyRes.data.message);
                                } else {
                                  const errorMsg = verifyRes?.data?.error || 'Invalid verification code';
                                  setVerificationError(errorMsg);
                                  setShake(true);
                                  toast.error(errorMsg);
                                }
                              } catch (error) {
                                console.error('Verification error:', error);
                                const errorMsg = 'An error occurred during verification';
                                setVerificationError(errorMsg);
                                setShake(true);
                                toast.error(errorMsg);
                              } finally {
                                setVerifying(false);
                              }
                            }}
                            disabled={verifying}
                            sx={{
                              textTransform: 'none',
                              fontWeight: 600,
                              borderRadius: 2,
                              px: 4,
                              height: 44,
                              '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: theme.shadows[4],
                              },
                              '&:active': {
                                transform: 'translateY(0)',
                                boxShadow: theme.shadows[2],
                              },
                              transition: 'all 0.2s ease',
                            }}
                          >
                            {verifying ? (
                              <>
                                <Box 
                                  component="span" 
                                  sx={{
                                    display: 'inline-block',
                                    width: 20,
                                    height: 20,
                                    border: `2px solid ${theme.palette.primary.contrastText}`,
                                    borderTopColor: 'transparent',
                                    borderRadius: '50%',
                                    animation: 'spin 1s linear infinite',
                                    mr: 1,
                                    '@keyframes spin': {
                                      '0%': { transform: 'rotate(0deg)' },
                                      '100%': { transform: 'rotate(360deg)' },
                                    },
                                  }}
                                />
                                Verifying...
                              </>
                            ) : 'Verify Code'}
                          </Button>
                        </Zoom>
                      </Box>
                    </Box>
                  </Box>
                </>
              ) : (
                <Button 
                  variant="contained" 
                  color="primary" 
                  size="large"
                  fullWidth
                  onClick={() => handleNext(formSnapshot)}
                  sx={{
                    height: 48,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '1rem',
                    backgroundColor: theme.palette.success.main,
                    '&:hover': {
                      backgroundColor: theme.palette.success.dark,
                      boxShadow: '0 6px 20px 0 rgba(76, 175, 80, 0.3)',
                      transform: 'translateY(-1px)'
                    },
                    transition: 'all 0.3s ease',
                  }}
                  startIcon={<CheckCircle />}
                >
                  Continue to Plan Selection
                </Button>
              )}
              
              <Button 
                variant="text" 
                color="inherit"
                onClick={() => {
                  if (otpSent && !isVerified) {
                    setOtpSent(false);
                    setOtp('');
                  } else if (isVerified) {
                    // Handle back from verified state if needed
                  } else {
                    // Handle back from initial state (go to previous step)
                    // You might want to add a back handler prop for this
                  }
                }}
                sx={{
                  mt: 1,
                  alignSelf: 'center',
                  textTransform: 'none',
                  color: theme.palette.text.secondary,
                  '&:hover': {
                    backgroundColor: 'transparent',
                    textDecoration: 'underline',
                  },
                }}
              >
                {otpSent ? (isVerified ? '' : 'Back to form') : 'Back'}
              </Button>
            </Box>
          </form>
        )}
      </Formik>
      <Toaster position="top-right" reverseOrder={false} />
    </>
  );
};

export default StepOneUserInfo;
