import { createSlice } from '@reduxjs/toolkit';

const initialState ={
    isCanvasPage:'',
}

const CanvasSlice = createSlice({
    name: 'Canvas',
    initialState,
    reducers:{
        changeCanvasPage:(state, action)=>{
            return { ...state, isCanvasPage:action.payload };
        },
    }
})

export const { changeCanvasPage } = CanvasSlice.actions;
export default CanvasSlice.reducer;