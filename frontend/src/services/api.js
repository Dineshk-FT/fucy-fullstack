/*eslint-disable*/
import { createAsyncThunk } from '@reduxjs/toolkit';
import { configuration } from '../services/baseApiService';
import axios from 'axios';
import { createHeaders, createHeadersForJson } from '../store/Zustand/store';

const FormData = require('form-data');

export const login = createAsyncThunk('login', async ({ username, password }, thunkAPI) => {
  const FormData = require('form-data');
  let data = new FormData();
  data.append('username', username);
  data.append('password', password);
  const URL = `${configuration.apiBaseUrl}login`;
  try {
    const res = await axios.post(URL, data);
    // console.log('res', res);
    return res;
  } catch (error) {
    // console.log('error', thunkAPI.rejectWithValue({ ...error.response, name: 'login' }));
    if (error) return thunkAPI.rejectWithValue({ ...error.response, name: 'login' });
  }
});

export const register = createAsyncThunk('register', async (details, thunkAPI) => {
  const FormData = require('form-data');
  let data = new FormData();
  data.append('username', details?.email);
  data.append('password', details?.password);
  const URL = `${configuration.apiBaseUrl}register`;
  try {
    const res = await axios.post(URL, data);
    // console.log('res', res);
    return res;
  } catch (error) {
    console.log('error', thunkAPI.rejectWithValue({ ...error.response, name: 'register' }));
    if (error) return thunkAPI.rejectWithValue({ ...error.response, name: 'register' });
  }
});

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
    return error.response;
  }
  // const res = await axios(options);
  // return res.data;
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
