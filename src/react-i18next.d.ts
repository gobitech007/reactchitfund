declare module 'react-i18next/initReactI18next' {
  import { i18n } from 'i18next';
  
  const initReactI18next: {
    type: 'frontend';
    init: (instance: i18n) => void;
  };
  
  export default initReactI18next;
}