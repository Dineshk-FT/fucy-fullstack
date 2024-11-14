import { createAsyncThunk } from '@reduxjs/toolkit';
import { configuration } from '../services/baseApiService';
import axios from 'axios';
import { createHeaders } from '../Zustand/store';

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
  const URL = `${configuration.backendUrl}register`;
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
  }
  // const res = await axios(options);
  // return res.data;
};

export const UPDATE_CALL = async (details, url) => {
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
    console.error('Error in UPDATE_CALL:', error);
  }
  // const res = await axios(options);
  // return res.data;
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
  }
  // const res = await axios(options);
  // return res.data;
};
