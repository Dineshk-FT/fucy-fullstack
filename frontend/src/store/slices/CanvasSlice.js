import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isCanvasPage: '',
  selectedBlock: {},
  drawerwidthChange: 400,
  initialDialogOpen: false,
  propertiesTabOpen: false,
  addNodeTabOpen: false,
  anchorEl: null,
  isHeaderOpen: false,
  details: {
    name: '',
    properties: [],
    isAsset: false
  }
};

const CanvasSlice = createSlice({
  name: 'Canvas',
  initialState,
  reducers: {
    openAddNodeTab: (state) => {
      return { ...state, addNodeTabOpen: true };
    },
    openHeader: (state) => {
      return { ...state, isHeaderOpen: true };
    },
    closeHeader: (state) => {
      return { ...state, isHeaderOpen: false };
    },
    setDrawerwidth: (state, action) => {
      return { ...state, drawerwidthChange: Number(action.payload) };
    },
    setAnchorEl: (state, action) => {
      // console.log('action', action?.payload?.id);
      return { ...state, anchorEl: action.payload };
    },
    setDetails: (state, action) => {
      if (typeof action.payload === 'function') {
        state.details = action.payload(state.details);
      } else {
        state.details = action.payload;
      }
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
  closeAddNodeTab,
  setAnchorEl,
  setDetails,
  openHeader,
  closeHeader,
  setDrawerwidth
} = CanvasSlice.actions;
export default CanvasSlice.reducer;
