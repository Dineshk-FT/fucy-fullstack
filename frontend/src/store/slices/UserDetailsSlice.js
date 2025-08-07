import { createSlice } from '@reduxjs/toolkit';
import { login } from '../../services/api';

const initialState = {
  userDetails: {},
  isLoggedIn: false,
  loading: false,
  error: null,
  licenseWarning: {
    show: false,
    message: ''
  }
};

const UserDetailsSlice = createSlice({
  name: 'userDetails',
  initialState,
  reducers: {
    setLicenseWarning: (state, action) => {
      state.licenseWarning = {
        show: action.payload.show !== undefined ? action.payload.show : true,
        message: action.payload.message || ''
      };
    },
    clearLicenseWarning: (state) => {
      state.licenseWarning = {
        show: false,
        message: ''
      };
    },
    logout: () => {
      return { ...initialState };
    }
  },
  extraReducers(builder) {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.userDetails = action.payload.data;
        state.error = null;
        state.isLoggedIn = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.userDetails = {};
      });
  }
});

export const { 
  logout, 
  setLicenseWarning, 
  clearLicenseWarning 
} = UserDetailsSlice.actions;
export default UserDetailsSlice.reducer;
