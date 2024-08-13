import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  pageName: '',
  Properties: [],
  hasError: false
};

const PageSectionSlice = createSlice({
  name: 'pageName',
  initialState,
  reducers: {
    changePage: (state, action) => {
      return { ...state, pageName: action.payload };
    },
    setProperties: (state, action) => {
      return { ...state, Properties: action.payload };
    },
    clearProperties: (state) => {
      return { ...state, Properties: [] };
    },
    triggerError: (state) => {
      return { ...state, hasError: true };
    },
    resetError: (state) => {
      return { ...state, hasError: false };
    }
  }
});

export const { changePage, setProperties, clearProperties, triggerError, resetError } = PageSectionSlice.actions;
export default PageSectionSlice.reducer;
