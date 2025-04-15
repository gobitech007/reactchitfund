import { useEffect, createContext, useRef, useContext, useState, ReactNode } from 'react';
import isEqual from 'lodash/isEqual';
import { AuthService, PaymentService, UserService } from '../services';
import { useAuth } from '../context/AuthContext';

// Define the store type with index signature for dynamic properties
export interface StoreData {
  [key: string]: any;
}

// Define the context type
export interface DataContextType {
  store: StoreData;
  setStore: React.Dispatch<React.SetStateAction<StoreData>>;
}

// Create context with default value
const DataContext = createContext<DataContextType>({ 
  store: {}, 
  setStore: () => {} 
});

// DataProvider component
export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [store, setStore] = useState<StoreData>({});
  
  // Value to be provided to consumers
  const value: DataContextType = {
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
export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

// Define API endpoint keys type
export type ApiEndpointKey = 'chitUsers' | 'userProfile' | 'currentUser' | 'transactions' | 'paymentMethods';

// Define API endpoints mapping
const API_ENDPOINTS: Record<ApiEndpointKey, (...args: any[]) => Promise<any>> = {
  'chitUsers': (userId: string) => PaymentService.getChitUsers(userId),
  'userProfile': () => UserService.getCurrentProfile(),
  'currentUser': () => AuthService.getCurrentUserData(),
  'transactions': (page = 1, limit = 10) => PaymentService.getTransactionHistory(page, limit),
  'paymentMethods': () => PaymentService.getSavedPaymentMethods(),
};

// Define options type for the hook
interface DynamicApiOptions {
  intervalTime?: number | null;
  params?: any[];
}

export const useDynamicApiStore = (key: ApiEndpointKey, options: DynamicApiOptions = {}) => {
  const { intervalTime = null, params = [] } = options;
  const { isAuthenticated, currentUser } = useAuth();
  const { store, setStore } = useData();
  const prevDataRef = useRef<Record<string, any>>({});

  useEffect(() => {
    let isMounted = true;
    
    // Set loading state to true when starting to fetch
    if (isMounted) {
      setStore(prev => ({
        ...prev,
        [`${key}Loading`]: true,
      }));
    }

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
        let apiResponse: any;
        if (key === 'chitUsers' && currentUser?.user_id) {
          apiResponse = await apiFunction(currentUser.user_id);
        } else {
          // Call the API function with any provided parameters
          apiResponse = await apiFunction(...params);
        }
        
        // Check if the API response has an error
        if (apiResponse?.error) {
          console.error(`API error for ${key}:`, apiResponse.error);
          // Store the error in the state so components can handle it
          if (isMounted) {
            setStore(prev => ({
              ...prev,
              [`${key}Error`]: apiResponse.error,
              [`${key}Loading`]: false,
            }));
          }
          return;
        }
        
        // Extract the data from the API response
        const newData = apiResponse?.data;        
        if (newData && !isEqual(newData, prevDataRef.current[key])) {
          prevDataRef.current[key] = newData;
          if (isMounted) {
            setStore(prev => ({
              ...prev,
              [key]: newData,
              [`${key}Error`]: null,
              [`${key}Loading`]: false,
            }));
          }
        }
      } catch (err) {
        console.error(`Failed to fetch ${key}:`, err);
        // Store the error in the state
        if (isMounted) {
          setStore(prev => ({
            ...prev,
            [`${key}Error`]: err instanceof Error ? err.message : 'An unknown error occurred',
            [`${key}Loading`]: false,
          }));
        }
      }
    };

    // Only fetch if user is authenticated (when required)
    if (key !== 'currentUser' && !isAuthenticated) {
      console.warn(`Skipping API call for ${key} - user not authenticated`);
      return;
    }

    fetchData();

    let interval: NodeJS.Timeout | undefined;
    if (intervalTime) {
      interval = setInterval(fetchData, intervalTime);
    }

    return () => {
      // isMounted = false;
      if (interval) clearInterval(interval);
    };
  }, [key, intervalTime, isAuthenticated, currentUser, setStore, ...params]);

  return store[key] as any;
};

export default DataContext;