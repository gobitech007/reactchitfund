import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import i18n from '../../i18n';

interface LanguageState {
  currentLanguage: string;
  availableLanguages: { code: string; name: string }[];
}

const initialState: LanguageState = {
  currentLanguage: i18n.language || 'en',
  availableLanguages: [
    { code: 'ta', name: 'தமிழ்' },
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिंदी' }
  ],
};

const languageSlice = createSlice({
  name: 'language',
  initialState,
  reducers: {
    changeLanguage: (state, action: PayloadAction<string>) => {
      state.currentLanguage = action.payload;
      i18n.changeLanguage(action.payload);
      
      // Set the document language attribute
      document.documentElement.lang = action.payload;
      
      // Set the document direction based on language
      const rtlLanguages = ['ar', 'he', 'fa', 'ur', 'yi', 'dv'];
      document.documentElement.dir = rtlLanguages.includes(action.payload) ? 'rtl' : 'ltr';
    },
  },
});

export const { changeLanguage } = languageSlice.actions;
export default languageSlice.reducer;