import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isCanvasPage: '',
  selectedBlock: {},
  initialDialogOpen: false,
  propertiesTabOpen: false,
  selectedItem: {}
};

const CanvasSlice = createSlice({
  name: 'Canvas',
  initialState,
  reducers: {
    setSelectedItem: (state, action) => {
      return { ...state, selectedItem: action.payload };
    },
    changeCanvasPage: (state, action) => {
      return { ...state, isCanvasPage: action.payload };
    },
    setSelectedBlock: (state, action) => {
      return { ...state, selectedBlock: action.payload };
    },
    OpenInitialDialog: (state) => {
      return { ...state, initialDialogOpen: true };
    },
    CloseInitialDialog: (state) => {
      return { ...state, initialDialogOpen: false };
    },
    OpenPropertiesTab: (state) => {
      return { ...state, propertiesTabOpen: true };
    },
    ClosePropertiesTab: (state) => {
      return { ...state, propertiesTabOpen: false };
    }
  }
});

export const {
  changeCanvasPage,
  setSelectedBlock,
  OpenInitialDialog,
  CloseInitialDialog,
  OpenPropertiesTab,
  ClosePropertiesTab,
  setSelectedItem
} = CanvasSlice.actions;
export default CanvasSlice.reducer;
