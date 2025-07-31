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
          // console.error(`API endpoint for key "${key}" is not defined`);
          return;
        }

        // Get the appropriate API function based on the key
        const apiFunction = API_ENDPOINTS[key];
        
        // For chitUsers, we need the user ID
        let apiResponse: any;
        if (key === 'chitUsers') {
          // console.log('Preparing to fetch chit users, current user:', currentUser);
          
          // Try to get user_id from different possible properties
          let userId = null;
          
          // First check common properties
          if (currentUser?.user_id) {
            userId = currentUser.user_id;
            // console.log('Found user_id property:', userId);
          } else if (currentUser?.id) {
            userId = currentUser.id;
            // console.log('Found id property:', userId);
          } else if (currentUser?.userId) {
            userId = currentUser.userId;
            // console.log('Found userId property:', userId);
          } else if (currentUser?._id) {
            userId = currentUser._id;
            // console.log('Found _id property:', userId);
          }
          
          // If not found, try to extract from token or search through all properties
          if (!userId && typeof currentUser === 'object' && currentUser !== null) {
            // console.log('Searching through all user properties for ID-like values');
            
            // Look for any property that looks like an ID
            for (const [key, value] of Object.entries(currentUser)) {
              if (typeof value === 'string' || typeof value === 'number') {
                const strValue = String(value);
                // Check for UUID format or numeric ID
                if (strValue.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i) || 
                    strValue.match(/^\d+$/)) {
                  userId = strValue;
                  // console.log(`Found potential ID in property ${key}:`, userId);
                  break;
                }
              }
            }
          }
          
          // If still not found, try to use a default or fallback
          if (!userId) {
            // Try to get from sessionStorage directly as a last resort
            const storedUser = sessionStorage.getItem('user');
            if (storedUser) {
              try {
                const parsedUser = JSON.parse(storedUser);
                userId = parsedUser.user_id || parsedUser.id || parsedUser._id || parsedUser.userId;
                // console.log('Found user ID in sessionStorage:', userId);
              } catch (e) {
                // console.error('Error parsing stored user:', e);
              }
            }
            
            // If we still don't have a user ID, use a default for testing
            if (!userId) {
              // console.warn('No user ID found, using default/fallback ID');
              userId = '1'; // Default ID for testing - replace with appropriate fallback
            }
          }
          
          if (!userId) {
            // console.error('User ID not found in currentUser object:', currentUser);
            throw new Error('User ID is required but not found in user data');
          }
          
          // console.log('Fetching chit users with user ID:', userId);
          apiResponse = await apiFunction(userId);
        } else {
          // Call the API function with any provided parameters
          apiResponse = await apiFunction(...params);
        }
        
        // Check if the API response has an error
        if (apiResponse?.error) {
          // console.error(`API error for ${key}:`, apiResponse.error);
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
      // console.warn(`Skipping API call for ${key} - user not authenticated`);
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