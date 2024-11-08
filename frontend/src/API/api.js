import { createAsyncThunk } from '@reduxjs/toolkit';
import { configuration } from '../services/baseApiService';
import axios from 'axios';
import { createHeaders } from '../Zustand/store';

export const login = createAsyncThunk('login', async ({ username, password }, thunkAPI) => {
  const FormData = require('form-data');
  let data = new FormData();
  data.append('username', username);
  data.append('password', password);
  const URL = `${configuration.backendUrl}login`;
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
  const FormData = require('form-data');
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
  const res = await axios(options);
  return res.data;
};
