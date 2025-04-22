import { createSlice } from '@reduxjs/toolkit';
import { login } from '../../services/api';

const initialState = {
  userDetails: {},
  isLoggedIn: false,
  loading: false,
  error: null
};

const UserDetailsSlice = createSlice({
  name: 'Canvas',
  initialState,
  reducers: {
    logout: (state) => {
      return { ...state, userDetails: {}, isLoggedIn: false };
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

export const { logout } = UserDetailsSlice.actions;
export default UserDetailsSlice.reducer;
