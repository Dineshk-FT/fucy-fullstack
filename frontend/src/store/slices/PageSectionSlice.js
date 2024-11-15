import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  pageName: '',
  Properties: [],
  hasError: false,
  title: '',
  modelId: '',
  selectedNodeGroupId: ''
};

const PageSectionSlice = createSlice({
  name: 'pageName',
  initialState,
  reducers: {
    setSelectedNodeGroupId: (state, action) => {
      return { ...state, selectedNodeGroupId: action.payload };
    },
    setModelId: (state, action) => {
      return { ...state, modelId: action.payload };
    },
    changePage: (state, action) => {
      return { ...state, pageName: action.payload };
    },
    setTitle: (state, action) => {
      // console.log('action', action);
      return { ...state, title: action.payload };
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

export const { changePage, setProperties, clearProperties, triggerError, resetError, setTitle, setModelId, setSelectedNodeGroupId } =
  PageSectionSlice.actions;
export default PageSectionSlice.reducer;
