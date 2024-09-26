import { createAsyncThunk } from '@reduxjs/toolkit';
import { configuration } from '../services/baseApiService';
import axios from 'axios';

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
