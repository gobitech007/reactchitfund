import React, { useEffect } from 'react';
import '../i18n'; // Import the i18n configuration
import { useTranslation } from 'react-i18next';
import { useAppSelector, useAppDispatch } from '../redux/hooks';
import { changeLanguage } from '../redux/slices/languageSlice';

interface I18nProviderProps {
  children: React.ReactNode;
}

// Helper function to determine text direction based on language
const getLanguageDirection = (language: string): 'rtl' | 'ltr' => {
  // List of RTL languages
  const rtlLanguages = ['ar', 'he', 'fa', 'ur', 'yi', 'dv'];
  return rtlLanguages.includes(language) ? 'rtl' : 'ltr';
};

const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
  const { i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const { currentLanguage } = useAppSelector(state => state.language);

  // Initialize language from i18n on first render
  useEffect(() => {
    if (i18n.language && i18n.language !== currentLanguage) {
      dispatch(changeLanguage(i18n.language));
    }
  }, [currentLanguage, dispatch, i18n.language]);

  // Set the document language attribute when language changes
  useEffect(() => {
    document.documentElement.lang = currentLanguage;
    document.documentElement.dir = getLanguageDirection(currentLanguage);
    
    // Also update i18n if it doesn't match Redux state
    if (i18n.language !== currentLanguage) {
      i18n.changeLanguage(currentLanguage);
    }
  }, [currentLanguage, i18n]);

  return <>{children}</>;
};

export default I18nProvider;