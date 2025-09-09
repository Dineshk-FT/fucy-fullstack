/*eslint-disable*/
import { createAsyncThunk } from '@reduxjs/toolkit';
import { configuration } from '../services/baseApiService';
import axios from 'axios';
import { createHeaders, createHeadersForJson } from '../store/Zustand/store';
import { isLicenseExpiring, getExpiryMessage } from '../utils/licenseUtils';

const FormData = require('form-data');

export const verifyCard = async (paymentMethodId) => {
  try {
    const response = await axios.post(
      `${configuration.apiBaseUrl}verify-card`,
      new URLSearchParams({
        payment_method_id: paymentMethodId
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Card verification error:', error);
    throw error;
  }
};

export const login = createAsyncThunk('login', async ({ username, password, org }, thunkAPI) => {
  const FormData = require('form-data');
  let data = new FormData();
  data.append('username', username);
  data.append('password', password);
  if (org) {
    data.append('org', org);
  }

  const URL = `${configuration.apiBaseUrl}login`;
  try {
    const res = await axios.post(URL, data);

    // Check if response has license data
    const licenseEndDate = res.data?.license_end;

    if (licenseEndDate) {
      const isExpiring = isLicenseExpiring(licenseEndDate);
      const expiryMessage = getExpiryMessage(licenseEndDate);

      if (isExpiring) {
        thunkAPI.dispatch({
          type: 'userDetails/setLicenseWarning',
          payload: {
            show: true,
            message: expiryMessage
          }
        });
      }
    }

    return res;
  } catch (error) {
    if (error) return thunkAPI.rejectWithValue({ ...error.response, name: 'login' });
  }
});

export const register = createAsyncThunk('register', async (data, { rejectWithValue }) => {
  const FormData = require('form-data');
  const formData = new FormData();

  // Append all data fields to formData
  Object.entries(data).forEach(([key, value]) => {
    formData.append(key, value);
  });

  const URL = `${configuration.apiBaseUrl}register`;
  try {
    const response = await axios.post(URL, formData);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || { error: error.message });
  }
});

export const SendVerificationOTP = async (details) => {
  const FormData = require('form-data');
  let data = new FormData();
  data.append('email', details?.email);

  const URL = `${configuration.apiBaseUrl}send-verification-otp`;

  try {
    const res = await axios.post(URL, data);
    return res;
  } catch (error) {
    console.error('Error while sending OTP:', error);
    return error.response.data;
  }
};

export const VerifyOTP = async (details) => {
  const FormData = require('form-data');
  let data = new FormData();
  data.append('email', details?.email);
  data.append('otp', details?.otp);

  const URL = `${configuration.apiBaseUrl}verify-otp`;

  try {
    const res = await axios.post(URL, data);
    return res;
  } catch (error) {
    console.error('Error while verifying OTP:', error);
    return error.response.data;
  }
};

export const CheckUserStatus = async (details) => {
  const FormData = require('form-data');
  let data = new FormData();
  data.append('email', details?.email);
  data.append('org', details?.org);
  const URL = `${configuration.apiBaseUrl}check-user-status`;
  try {
    const res = await axios.post(URL, data);
    // console.log('res', res);
    return res;
  } catch (error) {
    console.error('Error while registering:', error);
    return error.response.data;
  }
};
export const GET_CALL = async (modelId, url) => {
  let data = new FormData();
  data.append('model-id', modelId);

  try {
    const res = await axios({
      method: 'POST',
      url: url,
      headers: createHeaders(),
      data: data
    });
    return res.data;
  } catch (error) {
    console.error('Error in GET_CALL:', error);
    return error.response.data;
  }
  // const res = await axios(options);
  // return res.data;
};

export const GET_CALL_WITH_DETAILS = async (modelId, url) => {
  let data = new FormData();
  data.append('model-id', modelId);
  // console.log('createHeadersForJson', createHeadersForJson());

  try {
    const res = await axios({
      method: 'POST',
      url: url,
      ...createHeadersForJson(),
      data: data
    });
    return res.data;
  } catch (error) {
    console.error('Error in GET_CALL:', error);
    return error.response?.data || { error: 'Unknown error occurred' };
  }
};

export const UPDATE_CALL = async (details, url) => {
  const trimmed = Object.fromEntries(
    Object.entries(details)
      .filter(([_, value]) => value !== undefined) // Filter out undefined values
      .map(([key, value]) => [key, typeof value === 'string' ? value.trim() : value])
  );

  let data = new FormData();
  for (const [key, value] of Object.entries(trimmed)) {
    data.append(key, value);
  }

  try {
    const res = await axios({
      method: 'POST',
      url: url,
      ...createHeaders(),
      data: data
    });
    return res.data;
  } catch (error) {
    console.error('Error in UPDATE_CALL:', error);
    return error.response.data;
  }
  // const res = await axios(options);
  // return res.data;
};

export const PATCH_CALL = async (details, url) => {
  try {
    // Optimize trimming logic
    const cleanedDetails = {};
    for (const key in details) {
      const value = details[key];
      cleanedDetails[key] = typeof value === 'string' ? value.trim() : value;
    }

    // Build FormData efficiently
    const formData = new FormData();
    Object.entries(cleanedDetails).forEach(([key, value]) => formData.append(key, value));

    // Make API call
    const res = await axios({
      method: 'PATCH',
      url,
      data: formData,
      headers: { 'Content-Type': 'multipart/form-data' }, // Ensure proper headers
      ...createHeaders() // Ensure this does not overwrite Content-Type
    });

    return res.data;
  } catch (error) {
    console.error('Error in PATCH_CALL:', error);
    return error.response?.data || { error: 'Unknown error occurred' };
  }
};

export const ADD_CALL = async (details, url) => {
  const trimmed = Object.fromEntries(
    Object.entries(details).map(([key, value]) => [key, typeof value === 'string' ? value.trim() : value])
  );
  // console.log('trimmed', trimmed);
  let data = new FormData();
  for (const [key, value] of Object.entries(trimmed)) {
    data.append(key, value);
  }

  try {
    const res = await axios({
      method: 'POST',
      url: url,
      ...createHeaders(),
      data: data
    });
    return res.data;
  } catch (error) {
    console.error('Error in ADD_CALL:', error);
    return error.response.data;
  }
  // const res = await axios(options);
  // return res.data;
};

export const ADD_CALL_MODEL = async (details, url) => {
  const trimmed = Object.fromEntries(
    Object.entries(details).map(([key, value]) => [key, typeof value === 'string' ? value.trim() : value])
  );

  try {
    const res = await axios.post(url, trimmed, {
      headers: {
        'Content-Type': 'application/json'
      },
      ...createHeaders()
    });
    return res.data;
  } catch (error) {
    console.error('Error in ADD_CALL:', error);
    return error.response;
  }
};

export const DELETE_CALL = async (details, url) => {
  const trimmed = Object.fromEntries(
    Object.entries(details).map(([key, value]) => [key, typeof value === 'string' ? value.trim() : value])
  );
  // console.log('trimmed', trimmed);
  let data = new FormData();
  for (const [key, value] of Object.entries(trimmed)) {
    data.append(key, value);
  }

  try {
    const res = await axios({
      method: 'DELETE',
      url: url,
      ...createHeaders(),
      data: data
    });
    return res.data;
  } catch (error) {
    console.error('Error in DELETE_CALL:', error);
    return error.response.data;
  }
  // const res = await axios(options);
  // return res.data;
};
