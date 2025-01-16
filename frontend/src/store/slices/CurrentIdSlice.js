import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentId: '',
  isLevelOpen: false,
  isCyberBlockOpen: false,
  attackScene: {},
  levelDts: {},
  isNavbarClose: false,
  isDark: false,
  tableOpen: ''
};

const CurrentIdSlice = createSlice({
  name: 'Pagename',
  initialState,
  reducers: {
    storeCurrentId: (state, action) => {
      return { ...state, currentId: action.payload };
    },
    setTableOpen: (state, action) => {
      return { ...state, tableOpen: action.payload };
    },
    setAttackScene: (state, action) => {
      return { ...state, attackScene: action.payload };
    },
    levelOpen: (state, action) => {
      return {
        ...state,
        levelDts: action.payload,
        isLevelOpen: true
      };
    },
    cyberBlockOpen: (state) => {
      return {
        ...state,
        isCyberBlockOpen: true
      };
    },
    navbarSlide: (state) => {
      return {
        ...state,
        isNavbarClose: !state.isNavbarClose
      };
    },
    changeMode: (state) => {
      return {
        ...state,
        isDark: !state.isDark
      };
    },
    closeAll: (state) => {
      return {
        ...state,
        isLevelOpen: false,
        isCyberBlockOpen: false,
        activeTab: '',
        isAttackTableOpen: false,
        isRiskTableOpen: false,
        tableOpen: ''
      };
    }
  }
});

export const { storeCurrentId, setAttackScene, levelOpen, cyberBlockOpen, closeAll, changeMode, navbarSlide, setTableOpen } =
  CurrentIdSlice.actions;
export default CurrentIdSlice.reducer;
