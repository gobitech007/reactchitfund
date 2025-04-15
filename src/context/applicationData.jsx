import { useEffect, createContext, useRef, useContext, useState } from 'react';
import isEqual from 'lodash/isEqual';
import { AuthService, PaymentService, UserService } from '../services';
import { useAuth } from '../context/AuthContext';

// Create context with default value
const DataContext = createContext({ store: {} });

// DataProvider component
export const DataProvider = ({ children }) => {
  const [store, setStore] = useState({});
  
  // Value to be provided to consumers
  const value = {
    store,
    setStore
  };
  
  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

// Custom hook to use the data context
export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

// Define API endpoints mapping
const API_ENDPOINTS = {
  'chitUsers': (userId) => PaymentService.getChitUsers(userId),
  'userProfile': () => UserService.getCurrentProfile(),
  'currentUser': () => AuthService.getCurrentUserData(),
  'transactions': (page = 1, limit = 10) => PaymentService.getTransactionHistory(page, limit),
  'paymentMethods': () => PaymentService.getSavedPaymentMethods(),
};

export const useDynamicApiStore = (key, options = {}) => {
  const { intervalTime = null, params = [] } = options;
  const { isAuthenticated, currentUser } = useAuth();
  const { store, setStore } = useData();
  const prevDataRef = useRef({});

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        // Check if the key exists in our API_ENDPOINTS mapping
        if (!API_ENDPOINTS[key]) {
          console.error(`API endpoint for key "${key}" is not defined`);
          return;
        }

        // Get the appropriate API function based on the key
        const apiFunction = API_ENDPOINTS[key];
        
        // For chitUsers, we need the user ID
        let newData;
        if (key === 'chitUsers' && currentUser?.user_id) {
          newData = await apiFunction(currentUser.user_id).then(data => data);
        } else {
          // Call the API function with any provided parameters
          newData = await apiFunction(...params).then(data => data);
        }

        if (!isEqual(newData, prevDataRef.current[key])) {
          prevDataRef.current[key] = newData;
          if (isMounted) {
            setStore(prev => ({
              ...prev,
              [key]: newData,
            }));
          }
        }
      } catch (err) {
        console.error(`Failed to fetch ${key}:`, err);
      }
    };

    // Only fetch if user is authenticated (when required)
    if (key !== 'currentUser' && !isAuthenticated) {
      console.warn(`Skipping API call for ${key} - user not authenticated`);
      return;
    }

    fetchData();

    let interval;
    if (intervalTime) {
      interval = setInterval(fetchData, intervalTime);
    }

    return () => {
      isMounted = false;
      if (interval) clearInterval(interval);
    };
  }, [key, intervalTime, isAuthenticated, currentUser, setStore, ...params]);

  return store[key];
};

export default DataContext;