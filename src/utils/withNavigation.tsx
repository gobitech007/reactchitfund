import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Higher-order component that adds navigation capabilities to class components
 * @param Component The class component to wrap
 * @returns A new component with navigation props
 */
export const withNavigation = (Component: React.ComponentType<any>) => {
  return (props: any) => {
    const navigate = useNavigate();
    
    return <Component {...props} navigate={navigate} />;
  };
};