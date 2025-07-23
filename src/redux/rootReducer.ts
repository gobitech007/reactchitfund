import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import themeReducer from './slices/themeSlice';
import languageReducer from './slices/languageSlice';
import paymentReducer from './slices/paymentSlice';
import dataReducer from './slices/dataSlice';
import dashboardReducer from './slices/dashboardSlice';

// Combine all reducers
const rootReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  theme: themeReducer,
  language: languageReducer,
  payment: paymentReducer,
  data: dataReducer,
  dashboard: dashboardReducer,
});

export default rootReducer;