import { combineReducers } from 'redux';

// reducer import
import customizationReducer from './customizationReducer';
import CurrentIdSlice from '../slices/CurrentIdSlice';
import CanvasSlice from '../slices/CanvasSlice';
import PageSectionSlice from '../slices/PageSectionSlice';
import UserDetailsSlice from '../slices/UserDetailsSlice';

// ==============================|| COMBINE REDUCER ||============================== //

const reducer = combineReducers({
  customization: customizationReducer,
  currentId: CurrentIdSlice,
  canvas: CanvasSlice,
  pageName: PageSectionSlice,
  userDetails: UserDetailsSlice
});

export default reducer;
