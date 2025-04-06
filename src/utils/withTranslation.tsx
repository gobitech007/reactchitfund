import React from 'react';
import { useTranslation } from 'react-i18next';

// Higher Order Component to add translation to class components
export const withTranslation = <P extends object>(
  Component: React.ComponentType<P & { t: (key: string, options?: any) => string }>
) => {
  return (props: P) => {
    const { t } = useTranslation();
    return <Component {...props} t={t} />;
  };
};