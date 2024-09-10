import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isCanvasPage: '',
  selectedBlock: {}
};

const CanvasSlice = createSlice({
  name: 'Canvas',
  initialState,
  reducers: {
    changeCanvasPage: (state, action) => {
      return { ...state, isCanvasPage: action.payload };
    },
    setSelectedBlock: (state, action) => {
      return { ...state, selectedBlock: action.payload };
    }
  }
});

export const { changeCanvasPage, setSelectedBlock } = CanvasSlice.actions;
export default CanvasSlice.reducer;
