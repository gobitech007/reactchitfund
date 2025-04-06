import React, { useEffect } from 'react';
import '../i18n'; // Import the i18n configuration
import { useTranslation } from 'react-i18next';

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

  // Set the document language attribute when language changes
  useEffect(() => {
    document.documentElement.lang = i18n.language;
    document.documentElement.dir = getLanguageDirection(i18n.language);
  }, [i18n.language]);

  return <>{children}</>;
};

export default I18nProvider;