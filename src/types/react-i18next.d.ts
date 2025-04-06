// This file provides type declarations for react-i18next if TypeScript can't find them
declare module 'react-i18next' {
  import { ReactNode } from 'react';
  
  export interface UseTranslationResponse {
    t: (key: string, options?: object) => string;
    i18n: {
      changeLanguage: (lng: string) => Promise<void>;
      language: string;
    };
    ready: boolean;
  }
  
  export function useTranslation(ns?: string | string[], options?: object): UseTranslationResponse;
  
  export interface TransProps {
    i18nKey: string;
    values?: object;
    components?: ReactNode[];
    children?: ReactNode;
  }
  
  export function Trans(props: TransProps): JSX.Element;
}