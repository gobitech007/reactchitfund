import { createSlice } from '@reduxjs/toolkit';

interface ThemeState {
  darkTheme: boolean;
}

const initialState: ThemeState = {
  darkTheme: false,
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.darkTheme = !state.darkTheme;
    },
    setDarkTheme: (state, action) => {
      state.darkTheme = action.payload;
    },
  },
});

export const { toggleTheme, setDarkTheme } = themeSlice.actions;
export default themeSlice.reducer;