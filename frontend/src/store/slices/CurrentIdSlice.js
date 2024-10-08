import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    currentId: '',
    isDerivationTableOpen:false,
    isDsTableOpen: false,
    isTsTableOpen: false,
    isCyberTableOpen: false,
    isAttackTreeOpen: false,
    isLevelOpen: false,
    isCyberBlockOpen: false,
    attackScene: {},
    levelDts: {},
    isRightDrawerOpen: false,
    isLeftDrawerOpen:false,
    isNavbarClose: false,
    isDark: false
};

const CurrentIdSlice = createSlice({
    name: 'Pagename',
    initialState,
    reducers: {
        storeCurrentId: (state, action) => {
            return { ...state, currentId: action.payload };
        },
        DsTableOpen: (state) => {
            return {
                ...state,
                isDsTableOpen: true,
                isTsTableOpen: false,
                isAttackTreeOpen: false,
                isLevelOpen: false,
                isCyberBlockOpen: false,
                isCyberTableOpen: false,
                isDerivationTableOpen:false,
            };
        },
        TsTableOpen: (state) => {
            return {
                ...state,
                isTsTableOpen: true,
                isDsTableOpen: false,
                isAttackTreeOpen: false,
                isLevelOpen: false,
                isCyberBlockOpen: false,
                isCyberTableOpen: false,
                isDerivationTableOpen:false,
            };
        },
        DerivationTableOpen: (state) => {
            return {
                ...state,
                isDerivationTableOpen:true,
                isAttackTreeOpen: false,
                isTsTableOpen: false,
                isDsTableOpen: false,
                isLevelOpen: false,
                isCyberBlockOpen: false,
                isCyberTableOpen: false,
                isRightDrawerOpen: false
            }
        },
        AttackTreePageOpen: (state) => {
            return {
                ...state,
                isAttackTreeOpen: true,
                isTsTableOpen: false,
                isDsTableOpen: false,
                isLevelOpen: false,
                isCyberBlockOpen: false,
                isCyberTableOpen: false,
                isDerivationTableOpen:false,
            };
        },
        setAttackScene: (state, action) => {
            return { ...state, attackScene: action.payload };
        },
        levelOpen: (state, action) => {
            return {
                ...state,
                levelDts: action.payload,
                isLevelOpen: true,
                isTsTableOpen: false,
                isDsTableOpen: false,
                isCyberBlockOpen: false,
                isCyberTableOpen: false,
                isDerivationTableOpen:false,
            };
        },
        cyberBlockOpen: (state) => {
            return {
                ...state,
                isCyberBlockOpen: true,
                isAttackTreeOpen: false,
                isTsTableOpen: false,
                isDsTableOpen: false,
                isLevelOpen: false,
                isCyberTableOpen: false,
                isDerivationTableOpen:false,
            };
        },
        cyberTableOpen: (state) => {
            return {
                ...state,
                isCyberTableOpen: true,
                isCyberBlockOpen: false,
                isAttackTreeOpen: false,
                isTsTableOpen: false,
                isDsTableOpen: false,
                isLevelOpen: false,
                isDerivationTableOpen:false,

            };
        },
        drawerOpen: (state) => {
            return {
                ...state,
                isRightDrawerOpen: true
            };
        },
        drawerClose: (state) => {
            return {
                ...state,
                isRightDrawerOpen: false
            };
        },
        leftDrawerOpen: (state) => {
            return {
                ...state,
                isLeftDrawerOpen: true
            };
        },
        leftDrawerClose: (state) => {
            return {
                ...state,
                isLeftDrawerOpen: false
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
                isDerivationTableOpen:false,
                isAttackTreeOpen: false,
                isTsTableOpen: false,
                isDsTableOpen: false,
                isLevelOpen: false,
                isCyberBlockOpen: false,
                isCyberTableOpen: false,
                activeTab: '',
                isRightDrawerOpen: false,
                isLeftDrawerOpen:false
            };
        }
    }
});

export const {
    storeCurrentId,
    DsTableOpen,
    TsTableOpen,
    DerivationTableOpen,
    AttackTreePageOpen,
    setAttackScene,
    levelOpen,
    cyberBlockOpen,
    closeAll,
    cyberTableOpen,
    drawerOpen,
    drawerClose,
    leftDrawerOpen,
    leftDrawerClose,
    changeMode,
    navbarSlide,
} = CurrentIdSlice.actions;
export default CurrentIdSlice.reducer;
