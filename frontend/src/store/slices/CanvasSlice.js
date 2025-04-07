import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isCanvasPage: '',
  selectedBlock: {},
  drawerwidthChange: 400,
  initialDialogOpen: false,
  propertiesTabOpen: false,
  addNodeTabOpen: false,
  addDataNodeTab: false,
  anchorEl: {
    node: null,
    edge: null
  },
  isSaveModalOpen: false,
  isHeaderOpen: false,
  details: {
    name: '',
    properties: [],
    isAsset: false
  },
  edgeDetails: {
    name: '',
    properties: [],
    isAsset: false,
    style: {}
  }
};

const CanvasSlice = createSlice({
  name: 'Canvas',
  initialState,
  reducers: {
    openAddNodeTab: (state) => {
      return { ...state, addNodeTabOpen: true };
    },
    openAddDataNodeTab: (state) => {
      return {...state, addDataNodeTab: true };
    },
    openHeader: (state) => {
      return { ...state, isHeaderOpen: true };
    },
    closeHeader: (state) => {
      return { ...state, isHeaderOpen: false };
    },
    setSaveModal: (state, action) => {
      return { ...state, isSaveModalOpen: Boolean(action.payload) };
    },
    setDrawerwidth: (state, action) => {
      return { ...state, drawerwidthChange: Number(action.payload) };
    },
    setAnchorEl: (state, action) => {
      // console.log('action', action?.payload?.id);
      return { ...state, anchorEl: { [action.payload.type]: action.payload.value } };
    },
    clearAnchorEl: () => {
      return { anchorEl: { node: null, edge: null } };
    },
    setDetails: (state, action) => {
      if (typeof action.payload === 'function') {
        state.details = action.payload(state.details);
      } else {
        state.details = action.payload;
      }
    },
    setEdgeDetails: (state, action) => {
      if (typeof action.payload === 'function') {
        state.edgeDetails = action.payload(state.edgeDetails);
      } else {
        state.edgeDetails = action.payload;
      }
    },
    closeAddNodeTab: (state) => {
      return { ...state, addNodeTabOpen: false };
    },
    closeAddDataNodeTab: (state) => {
      return { ...state, addDataNodeTab: false };
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
  openAddDataNodeTab,
  closeAddNodeTab,
  closeAddDataNodeTab,
  setAnchorEl,
  clearAnchorEl,
  setDetails,
  setEdgeDetails,
  openHeader,
  closeHeader,
  setSaveModal,
  setDrawerwidth
} = CanvasSlice.actions;
export default CanvasSlice.reducer;
