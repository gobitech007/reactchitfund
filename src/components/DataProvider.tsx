import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { fetchChitList } from '../redux/slices/dataSlice';

interface DataProviderProps {
  children: React.ReactNode;
}

const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector(state => state.auth);

  // Fetch chit list when the user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchChitList());
    }
  }, [dispatch, isAuthenticated]);

  return <>{children}</>;
};

export default DataProvider;