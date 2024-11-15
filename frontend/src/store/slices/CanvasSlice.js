import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isCanvasPage: '',
  selectedBlock: {},
  initialDialogOpen: false,
  propertiesTabOpen: false,
  addNodeTabOpen: false
};

const CanvasSlice = createSlice({
  name: 'Canvas',
  initialState,
  reducers: {
    openAddNodeTab: (state) => {
      return { ...state, addNodeTabOpen: true };
    },
    closeAddNodeTab: (state) => {
      return { ...state, addNodeTabOpen: false };
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
  openAddNodeTab,
  closeAddNodeTab
} = CanvasSlice.actions;
export default CanvasSlice.reducer;
