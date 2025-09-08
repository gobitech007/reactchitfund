import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Container,
  Paper,
  Typography,
  Button,
  Divider,
  Alert,
  Snackbar,
  Stack,
  Box,
  Chip,
  Modal,
  TextField,
  InputAdornment
} from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CellGrid from '../components/CellGrid';
import PaymentPanel from '../components/PaymentPanel';
import PaymentMethods from '../components/PaymentMethods';
import { withNavigation } from '../utils/withNavigation';
import { getCurrentWeekWithOrdinal, getCurrentMonthName } from '../utils/date-utils';
import { useAuth, useData, useDynamicApiStore } from '../context';
import {PaymentService, ApiService} from '../services';
import { CellData, ChitItem, PaymentData, PaymentFormData } from '../utils/interface-utils';
import { useTranslation } from 'react-i18next';

interface CellSelectionProps {
  navigate?: (path: string) => void;
}

const CellSelection: React.FC<CellSelectionProps> = ({ navigate }) => {
  const { t } = useTranslation();
  
    const { currentUser } = useAuth();
    
    // Debug current user data
    // console.log('Current user in pay.tsx:', currentUser);
    
    // Ensure we have a valid user_id
    const userId = currentUser?.user_id || currentUser?.id;
    if (!userId && currentUser) {
      console.warn('User is authenticated but user_id is missing:', currentUser);
    }
    
    // const { store } = useData();
  // State for selected cells
  const [selectedCells, setSelectedCells] = useState<number[]>([]);

  const [selectWeek, setSelectWeek] = useState<number[]>([]);

  // State for disabled cells (example: already taken by others)
  const [disabledCells, setDisabledCells] = useState<number[]>([]);
  
  // State for paid cells
  const [paidCells, setPaidCells] = useState<CellData[]>([]);
  const [chitSelectId, setChitSelectId] = useState<string>('');
  const [calendarSelection, setCalendarSelection] = useState<boolean>(false);

  // State for notification
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info' as 'success' | 'info' | 'warning' | 'error'
  });

  // State for payment modal
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  // State for base amount modal
  const [baseAmountModalOpen, setBaseAmountModalOpen] = useState(false);
  const [baseAmountValue, setBaseAmountValue] = useState<number>(200);
  const [baseAmountError, setBaseAmountError] = useState<string>('');
  const [pendingChitData, setPendingChitData] = useState<Array<ChitItem> | null>(null);

  // State for payment form data
  const [paymentData, setPaymentData] = useState<PaymentFormData>({
    amount: baseAmountValue,
    paymentMethod: 'credit_card',
  });

  // State for payment validation errors
  const [paymentErrors, setPaymentErrors] = useState<Record<string, string>>({});

  // State for available chit list
  
  // Add retry count state for triggering refetch
  const [retryCount, setRetryCount] = useState(0);

  // Get chit users data from the store
  const chitUsersData = useDynamicApiStore('chitUsers', { 
    params: userId ? [userId, retryCount] : [retryCount], 
  });
  
  // Show error if user is authenticated but user_id is missing
  if (currentUser && !userId) {
    console.error('User is authenticated but user_id is missing. This indicates an authentication issue.');
  }
  
  // Access the full store for debugging and get loading/error states
  const { store } = useData();
  // Use type assertion to access dynamic properties
  const isLoading = store['chitUsersLoading'] as boolean;
  const error = store['chitUsersError'] as string | null;
  const [chitList, setChitList] = useState<ChitListItem[]>([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  
  // Process chitUsersData when it changes
  useEffect(() => {
    // Don't modify the store directly to avoid triggering re-renders
    // Only update chitList if chitUsersData is valid and different from current chitList
    if (chitUsersData && Array.isArray(chitUsersData)) {
      // Type assertion for the API data
      const typedChitData = chitUsersData as Array<ChitItem>;
      
      // Check if any chit has null amount
      const chitWithNullAmount = typedChitData.find(chit => chit.amount === null || chit.amount === undefined);
      
      if (chitWithNullAmount) {
        // Store the pending data and show base amount modal
        setPendingChitData(typedChitData);
        setBaseAmountModalOpen(true);
        return; // Don't process the data yet
      }
      
      const formattedChitList: ChitListItem[] = typedChitData.map(chit => ({
        chit_no: chit.chit_no || `chit-${Math.random().toString(36).substr(2, 9)}`,
        name: `${t('pay.weeklyChit')} ${chit.chit_no}- ₹${chit.amount || baseAmountValue}`,
        amount: `${chit.amount || baseAmountValue}`,
        chit_id: chit.chit_id,
      }));
      
      console.log('Formatted chit list:', formattedChitList);
      setChitList(formattedChitList);
      setIsInitialLoad(false);
    } else if (!isLoading && !error && isInitialLoad) {
      // If we're not loading, no error, but still on initial load and no data
      // This might indicate an empty result or authentication issue
      console.warn('No chit data received. User ID:', userId, 'Current User:', currentUser);
      setIsInitialLoad(false);
    }
  }, [chitUsersData, isLoading, error, isInitialLoad, userId, currentUser, baseAmountValue, t]);
  
  // Handle fetching payment details when chitList changes
  useEffect(() => {
    // If chitList is loaded and we don't have a selected chit, select the first one
    if (chitList.length > 0 && !chitSelectId) {
      const firstChit = chitList[0];
      if (firstChit.chit_id) {
        console.log('Auto-selecting first chit:', firstChit.chit_id);
        setChitSelectId(firstChit.chit_id);
        // Fetch payment details for the first chit
        fetchChitPaymentDetailsRef.current(firstChit.chit_id, false);
      }
    }
  }, [chitList, chitSelectId]);
  
  // Define the chit list item type
  interface ChitListItem {
    chit_id?: string;
    chit_no: string;
    name: string;
    amount: string | number;
  }

  const handleDisableBaseAmount = () => {
    // Implement logic here to disable the base amount for a given week
    const paidYcells = paidCells.filter(cell => cell.is_paid === 'Y');
    return paidYcells.length > 0;
  }

  // Maximum number of cells a user can select
  const MAX_SELECTIONS = 54;

  const handleCellClick = (cellNumber: number) => {
    const paidWeeks = paidCells.filter(cell => cell.is_paid === 'Y').map(cell => cell.week);
    setSelectedCells(prev => {
      // Check if cell is disabled or already paid
      if (disabledCells.includes(cellNumber) || paidWeeks.includes(cellNumber)) {
        setNotification({
          open: true,
          message: t('pay.weekAlreadyPaidOrNotAvailable'),
          severity: 'warning'
        });
        return prev;
      }

      // If already selected, remove it (toggle functionality)
      if (prev.includes(cellNumber)) {
        return prev.filter(cell => cell !== cellNumber);
      }
      
      // If max selections reached, show warning and don't add
      if (prev.length >= MAX_SELECTIONS) {
        setNotification({
          open: true,
          message: t('pay.maxWeeksSelectionWarning', { max: MAX_SELECTIONS }),
          severity: 'warning'
        });
        return prev;
      }
      let cellAdded = [...prev, cellNumber].sort((a, b) => a - b);
      cellAdded = cellAdded.filter(cell => !paidWeeks.includes(cell)).sort((a, b) => a - b);
      
      // Check if there's a gap between paid weeks and new cells
      if (paidWeeks.length > 0 && cellAdded.length > 0) {
        const maxPaidWeek = Math.max(...paidWeeks);
        const minNewCell = Math.min(...cellAdded);
        // If there's a gap (not continuous), prevent selection
        if (maxPaidWeek + 1 < minNewCell) {
          setNotification({
            open: true,
            message: t('pay.randomWeeksSelectionNotAllowed'),
            severity: 'warning'
          });
          return prev;
        }
      }
      
      // Check if the new cells themselves are continuous
      if (cellAdded.length > 1) {
        for (let i = 1; i < cellAdded.length; i++) {
          if (cellAdded[i] !== cellAdded[i - 1] + 1) {
            setNotification({
              open: true,
              message: t('pay.randomWeeksSelectionNotAllowed'),
              severity: 'warning'
            });
            return prev;
          }
        }
      }
      if (cellAdded?.length > 0) {
        setCalendarSelection(true);
      }

      // Add the cell to selection (multi-select - any available cell can be selected)
      return  cellAdded; // Keep the array sorted for better UX
    });
  };

  // Debug useEffect to log selectedCells changes
  useEffect(() => {
    console.log('Selected cells updated:', selectedCells);
  }, [selectedCells]);

  // Debug useEffect to track chit selection changes
  useEffect(() => {
    console.log('Chit selection changed:', {
      chitSelectId,
      paidCellsCount: paidCells.length,
      disabledCellsCount: disabledCells.length
    });
  }, [chitSelectId, paidCells.length, disabledCells.length]);

  // Debug useEffect to track data loading states
  useEffect(() => {
    console.log('Pay page state:', {
      isLoading,
      error,
      isInitialLoad,
      chitUsersData: chitUsersData ? 'Data available' : 'No data',
      chitListLength: chitList.length,
      userId,
      currentUser: currentUser ? 'User available' : 'No user'
    });
  }, [isLoading, error, isInitialLoad, chitUsersData, chitList.length, userId, currentUser]);

  // Handle authentication delay on page reload
  useEffect(() => {
    // If we don't have a user ID but we have a current user, try to extract it
    if (!userId && currentUser && isInitialLoad) {
      console.log('Attempting to extract user ID from current user on reload:', currentUser);
      // This will trigger a re-render and potentially refetch data
    }
    
    // Set a timeout to handle cases where authentication is taking too long
    const authTimeout = setTimeout(() => {
      if (isInitialLoad && !chitUsersData && !isLoading && !error) {
        console.warn('Authentication or data loading timeout, attempting retry...');
        setRetryCount(prev => prev + 1);
      }
    }, 5000); // 5 second timeout

    return () => clearTimeout(authTimeout);
  }, [userId, currentUser, isInitialLoad, chitUsersData, isLoading, error]);

  useEffect(() => { 
    const paidCellsWeek = paidCells.filter(cell => cell.is_paid === 'Y').map(cell => cell.week);
    setSelectWeek(paidCellsWeek);
    // Remove the setSelectedCells(selectedCells) line as it causes an infinite loop
    // by updating the state with the same value that's in the dependency array
  }, [paidCells]);

  // const handleConfirmSelection = () => {
  //   if (selectedCells.length === 0) {
  //     setNotification({
  //       open: true,
  //       message: 'Please select at least one week',
  //       severity: 'warning'
  //     });
  //     return;
  //   }

  //   // Calculate default amount based on number of selected cells (e.g., 200 per cell)
  //   const calculatedAmount = Math.max(200, selectedCells.length * 200);

  //   // Update payment data with calculated amount
  //   setPaymentData(prev => ({
  //     ...prev,
  //     amount: calculatedAmount
  //   }));

  //   // Open payment modal
  //   setPaymentModalOpen(true);
  // };

  // Handle payment modal close
  const handlePaymentModalClose = () => {
    setPaymentModalOpen(false);
  };

  // Handle Google Pay success
  const handleGooglePaySuccess = async (googlePayData: any) => {
    try {
      console.log('Google Pay success:', googlePayData);
      
      // Update payment data with Google Pay token
      setPaymentData(prev => ({
        ...prev,
        paymentMethod: 'google_pay',
        googlePayToken: googlePayData.googlePayToken,
        paymentMethodData: googlePayData.paymentMethodData,
        orderId: googlePayData.orderId
      }));

      // Process the payment directly without opening modal
      await processGooglePayPayment(googlePayData);
      
    } catch (error) {
      console.error('Error handling Google Pay success:', error);
      setNotification({
        open: true,
        message: t('pay.paymentFailed', { error: error instanceof Error ? error.message : 'Unknown error' }),
        severity: 'error'
      });
    }
  };

  // Handle Google Pay error
  const handleGooglePayError = (error: any) => {
    console.error('Google Pay error:', error);
    
    let errorMessage = t('pay.paymentFailed', { error: 'Unknown error' });
    
    if (error.statusCode === 'CANCELED') {
      errorMessage = t('pay.paymentCancelled');
    } else if (error.statusCode === 'DEVELOPER_ERROR') {
      errorMessage = t('pay.paymentConfigurationError');
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    setNotification({
      open: true,
      message: errorMessage,
      severity: 'error'
    });
  };

  // Process Google Pay payment
  const processGooglePayPayment = async (googlePayData: any) => {
    try {
      // Prepare payment request for backend
      const paymentRequest = {
        googlePayToken: googlePayData.googlePayToken,
        amount: googlePayData.amount,
        currency: googlePayData.currency,
        chitId: googlePayData.chitId,
        weeks: googlePayData.weeks,
        userId: googlePayData.userId,
        orderId: googlePayData.orderId,
        paymentMethodData: googlePayData.paymentMethodData
      };

      // Call your backend API to process the payment
      const response = await fetch('/api/payments/google-pay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}` // Add your auth token
        },
        body: JSON.stringify(paymentRequest)
      });

      const result = await response.json();

      if (result.success) {
        // Payment successful
        setNotification({
          open: true,
          message: t('pay.paymentSuccessful', { 
            amount: googlePayData.amount / 100, // Convert back to rupees
            weeks: googlePayData.weeks.join(', '), 
            transactionId: result.transactionId 
          }),
          severity: 'success'
        });

        // Close payment modal if open
        setPaymentModalOpen(false);

        // Refresh payment details
        if (googlePayData.chitId) {
          fetchChitPaymentDetailsRef.current(googlePayData.chitId, true);
        }

        // Clear selected cells after successful payment
        setSelectedCells([]);
        setCalendarSelection(false);

      } else {
        // Payment failed
        setNotification({
          open: true,
          message: t('pay.paymentFailed', { error: result.error || 'Payment processing failed' }),
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Google Pay payment processing error:', error);
      setNotification({
        open: true,
        message: t('pay.paymentFailed', { error: error instanceof Error ? error.message : 'Network error' }),
        severity: 'error'
      });
    }
  };

  // Handle base amount modal close
  const handleBaseAmountModalClose = () => {
    setBaseAmountModalOpen(false);
    setBaseAmountError('');
    setPendingChitData(null);
  };

  // Handle base amount input change
  const handleBaseAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setBaseAmountValue(value);
    
    // Clear error if value is valid
    if (value >= 200) {
      setBaseAmountError('');
    }
  };

  // Handle base amount submission
  const handleBaseAmountSubmit = () => {
    // Validate base amount
    if (baseAmountValue < 200) {
      setBaseAmountError(t('pay.baseAmountMustBeAtLeast'));
      return;
    }

    if (!pendingChitData) {
      setBaseAmountError(t('pay.noChitDataAvailableError'));
      return;
    }

    // Process the pending chit data with the provided base amount
    const formattedChitList: ChitListItem[] = pendingChitData.map(chit => ({
      chit_no: chit.chit_no || `chit-${Math.random().toString(36).substr(2, 9)}`,
      name: `${t('pay.weeklyChit')} ${chit.chit_no}- ₹${chit.amount || baseAmountValue}`,
      amount: `${chit.amount || baseAmountValue}`,
      chit_id: chit.chit_id,
    }));

    console.log('Formatted chit list with base amount:', formattedChitList);
    setChitList(formattedChitList);
    setIsInitialLoad(false);
    
    // Close modal and reset state
    setBaseAmountModalOpen(false);
    setBaseAmountError('');
    setPendingChitData(null);
    
    // Show success notification
    setNotification({
      open: true,
      message: t('pay.baseAmountSetSuccessfully', { amount: baseAmountValue }),
      severity: 'success'
    });
  };

  // Handle payment form input changes
  const handlePaymentInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setPaymentData(prev => ({
      ...prev,
      [name]: name === 'amount' ? Math.max(200, Number(value)) : value
    }));
  };

  // Handle payment method change
  // const handlePaymentMethodChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   setPaymentData(prev => ({
  //     ...prev,
  //     paymentMethod: e.target.value as PaymentMethod
  //   }));
  // };

  // Handle payment data changes from PaymentMethods component
  const handlePaymentDataChange = (newPaymentData: PaymentFormData) => {
    setPaymentData(newPaymentData);
    // Clear errors when data changes
    setPaymentErrors({});
  };

  // Validate payment data
  const validatePaymentData = (): boolean => {
    const errors: Record<string, string> = {};

    if (paymentData.paymentMethod === 'credit_card' || paymentData.paymentMethod === 'debit_card') {
      if (!paymentData.cardNumber) {
        errors.cardNumber = 'Card number is required';
      } else {
        const cleanCardNumber = paymentData.cardNumber.replace(/\D/g, '');
        if (cleanCardNumber.length !== 16) {
          errors.cardNumber = 'Card number must be exactly 16 digits';
        }
      }

      if (!paymentData.cardName) {
        errors.cardName = 'Name on card is required';
      }

      if (!paymentData.expiryDate) {
        errors.expiryDate = 'Expiry date is required';
      } else {
        const expiryRegex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
        if (!expiryRegex.test(paymentData.expiryDate)) {
          errors.expiryDate = 'Expiry date must be in MM/YY format';
        } else {
          const [month, year] = paymentData.expiryDate.split('/');
          const currentDate = new Date();
          const currentYear = currentDate.getFullYear() % 100;
          const currentMonth = currentDate.getMonth() + 1;
          
          const expMonth = parseInt(month, 10);
          const expYear = parseInt(year, 10);
          
          if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
            errors.expiryDate = 'Card has expired. Please enter a future date';
          }
        }
      }

      if (!paymentData.cvv) {
        errors.cvv = 'CVV is required';
      } else {
        const cvvRegex = /^[0-9]{3,4}$/;
        if (!cvvRegex.test(paymentData.cvv)) {
          errors.cvv = 'CVV must be 3 or 4 digits';
        }
      }
    }

    if (paymentData.paymentMethod === 'upi') {
      if (!paymentData.upiId) {
        errors.upiId = 'UPI ID is required';
      } else {
        const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$/;
        if (!upiRegex.test(paymentData.upiId)) {
          errors.upiId = 'Please enter a valid UPI ID';
        }
      }
    }

    setPaymentErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle payment submission
  const handleFinalPaymentSubmit = async () => {
    // Validate payment data first
    if (!validatePaymentData()) {
      setNotification({
        open: true,
        message: t('pay.fixValidationErrors'),
        severity: 'error'
      });
      return;
    }

    try {
      // Get the first chit from the list (assuming we're paying for the selected chit)
      const selectedChit = chitSelectId ? chitSelectId : chitList.length > 0 ? chitList[0].chit_no : null;
      
      if (!selectedChit || !currentUser || !userId) {
        setNotification({
          open: true,
          message: t('pay.missingChitOrUserInfo'),
          severity: 'error'
        });
        console.error('Payment validation failed:', { selectedChit, currentUser, userId });
        return;
      }
      
      // Generate a random transaction ID
      const generateTransactionId = () => {
        const timestamp = Date.now();
        const randomNum = Math.floor(Math.random() * 9000) + 1000; // 4-digit random number
        return `TXN${timestamp}${randomNum}`;
      };

      // Generate a single transaction ID for all payments
      const transactionId = generateTransactionId();
      
      // If no weeks are selected, default to the first week
      const weeksToProcess = selectedCells.length > 0 ? selectedCells : paidCells ? [] : [1];
      
      const paidWeeks = paidCells.filter(cell => cell.is_paid === 'Y').map(cell => cell.week);
      const filterWeek = selectedCells.filter( cells => !paidWeeks.includes(cells));

      // Calculate amount per week
      const amountPerWeek = Math.floor(paymentData.amount / filterWeek.length);
      
      // Process payments for all selected weeks
      const paymentPromises = filterWeek.map(async (week) => {
        // Prepare backend payment request data for this week
        const backendPayload = {
          user_id: userId,
          chit_no: parseInt(selectedChit),
          amount: amountPerWeek, // Divide amount among weeks
          week_no: week,
          pay_type: paymentData.paymentMethod === 'credit_card' || paymentData.paymentMethod === 'debit_card' 
            ? 'card' 
            : paymentData.paymentMethod === 'upi' ? 'UPI' : 'netbanking',
          pay_card: paymentData.paymentMethod === 'credit_card' ? 'credit' : 
                   paymentData.paymentMethod === 'debit_card' ? 'debit' : null,
          pay_card_name: paymentData.cardName || null,
          pay_expiry_no: paymentData.expiryDate || null,
          pay_qr: paymentData.upiId || null,
          transaction_id: `${transactionId}-W${week}` // Add transaction ID with week suffix
        };
        
        // Process payment for this week
        return await PaymentService.processPayment(backendPayload as any);
      });
      
      // Wait for all payment requests to complete
      const responses = await Promise.all(paymentPromises);
      
      // Check if any payment failed
      const failedPayments = responses.filter(response => response.error);
      
      // If any payment failed, show error
      if (failedPayments.length > 0) {
        setNotification({
          open: true,
          message: t('pay.somePaymentsFailed', { errors: failedPayments.map(r => r.error).join(', ') }),
          severity: 'error'
        });
        return;
      }
      
      // All payments succeeded
      // const response = responses.flatMap(response => response?.data).flat(); // Flatten nested arrays; // Use the first response for notification

      if (responses[0].error) {
        // Show error notification
        setNotification({
          open: true,
          message: t('pay.paymentFailed', { error: responses[0].error }),
          severity: 'error'
        });
        return;
      }

      // Close the modal
      setPaymentModalOpen(false);

      // Show success notification with transaction ID
      setNotification({
        open: true,
        message: t('pay.paymentSuccessful', { 
          amount: paymentData.amount, 
          weeks: weeksToProcess.join(', '), 
          transactionId: transactionId 
        }),
        severity: 'success'
      });
      
      // Optionally fetch all payments for this transaction ID to confirm they were processed
      try {
        // Use ApiService directly to avoid TypeScript errors if the method isn't recognized
        const allPaymentsResponse = await ApiService.get(`/payments/transaction/${transactionId.split('-')[0]}`);
        
        if (allPaymentsResponse.data && allPaymentsResponse.data.length > 0) {
          // console.log('All payments for this transaction:', allPaymentsResponse.data);
        }
      } catch (error) {
        // console.error('Error fetching all payments for transaction:', error);
      }

      // Clear selected cells after successful payment
      // setSelectedCells([]);
      
      // Refresh payment details to update the UI with newly paid weeks
      if (chitList?.length > 0) {
        // Force refresh after payment to get updated data
        const selectChidId = chitList[0].chit_id || '';
        // Force refresh after payment to get updated data
        fetchChitPaymentDetailsRef.current(selectChidId, true);
      }

      // In a real app, you might navigate to another page after successful payment
      // if (navigate) navigate('/dashboard');
    } catch (error) {
      // console.error('Payment error:', error);

      // Show error notification
      setNotification({
        open: true,
        message: t('pay.paymentFailed', { error: error instanceof Error ? error.message : 'Unknown error' }),
        severity: 'error'
      });
    }
  };

  // const handleClearSelection = () => {
  //   setSelectedCells([]);
  // };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  // Get current week and month
  const currentWeek = getCurrentWeekWithOrdinal();
  const currentMonth = getCurrentMonthName();

  // Handle payment panel submission
  const handlePayModal = (data: PaymentData) => { 
    setChitSelectId(data?.chitId)   ;
    // Update payment data
    setPaymentData(prev => ({
      ...prev,
      amount: data.payAmount
    }));
    
    // Open payment modal
    setPaymentModalOpen(true);
    
    // Show notification
    setNotification({
      open: true,
      message: t('pay.paymentInitiated', { amount: data.payAmount, chitId: data.chitId }),
      severity: 'info'
    });
  };
  
  // Handle payment panel cancel
  // const handlePaymentCancel = () => {
  //   // Show notification
  //   setNotification({
  //     open: true,
  //     message: 'Payment cancelled',
  //     severity: 'info'
  //   });
  // };
  
  // Create refs to track API call state and cache results
  const lastFetchedChitIdRef = useRef<string | null>(null);
  const isFetchingRef = useRef<boolean>(false);
  const lastFetchTimeRef = useRef<number>(0);
  const cachedResultsRef = useRef<{[key: string]: CellData[]}>({});
  
  // Create a ref for the fetchChitPaymentDetails function
  const fetchChitPaymentDetailsRef = useRef(async (chitId: string, forceRefresh: boolean = false) => {
    if (!chitId) return;
    
    // Skip if already fetching the same chit
    if (isFetchingRef.current && lastFetchedChitIdRef.current === chitId) {
      // console.log('Skipping duplicate fetch request for chit:', chitId);
      return;
    }
    
    // Check if we have cached results and it's not a forced refresh
    const currentTime = Date.now();
    const cacheAge = currentTime - lastFetchTimeRef.current;
    const CACHE_TTL = 60000; // 1 minute cache TTL
    
    if (
      !forceRefresh && 
      lastFetchedChitIdRef.current === chitId && 
      cachedResultsRef.current[chitId] && 
      cacheAge < CACHE_TTL
    ) {
      // console.log('Using cached results for chit:', chitId);
      setPaidCells(cachedResultsRef.current[chitId]);
      
      // Update disabled cells from cache
      const newDisabledCells = cachedResultsRef.current[chitId]
        .filter(cell => cell.is_paid === 'Y')
        .map(cell => cell.week);
      setDisabledCells(newDisabledCells);
      return;
    }
    
    // Set fetching state
    isFetchingRef.current = true;
    lastFetchedChitIdRef.current = chitId;
    
    try {
      // console.log('Fetching payment details for chit:', chitId);
      const response = await PaymentService.getChitPaymentDetails(chitId);
      
      if (response.data) {
        // Update cache
        cachedResultsRef.current[chitId] = response.data;
        lastFetchTimeRef.current = Date.now();
        
        // Set paid cells from the response
        setPaidCells(response.data);
        
        // Update disabled cells to include paid cells (remove duplicates using Set)
        const newDisabledCells = Array.from(new Set(response.data
          .filter(cell => cell.is_paid === 'Y')
          .map(cell => cell.week)));
        setDisabledCells(newDisabledCells);
        setChitSelectId(chitId);
      }
    } catch (error) {
      // console.error('Error fetching chit payment details:', error);
      setNotification({
        open: true,
        message: t('pay.failedToLoadPaymentDetails', { error: error instanceof Error ? error.message : 'Unknown error' }),
        severity: 'error'
      });
    } finally {
      // Reset fetching state
      isFetchingRef.current = false;
    }
  });
  
  // Cleanup and reset refs when component unmounts
  useEffect(() => {
    return () => {
      // Reset all refs when component unmounts
      lastFetchedChitIdRef.current = null;
      isFetchingRef.current = false;
      lastFetchTimeRef.current = 0;
      cachedResultsRef.current = {};
    };
  }, []);
  
  // Function to call the ref's current value
  const fetchChitPaymentDetails = useCallback((chitId: string, forceRefresh: boolean = false) => {
    fetchChitPaymentDetailsRef.current(chitId, forceRefresh);
  }, []);
  
  // Function to clear the cache if needed
  // const clearPaymentDetailsCache = useCallback(() => {
  //   lastFetchedChitIdRef.current = null;
  //   lastFetchTimeRef.current = 0;
  //   cachedResultsRef.current = {};
  //   console.log('Payment details cache cleared');
  // }, []);

  // Handle payment panel value changes
  const handlePaymentValuesChange = useCallback((values: {
    chitId: string;
    chitNo: string;
    baseAmount: number;
    payAmount: number;
    weekSelection: number;
  }) => { 
    console.log('Payment values changed:', values);
    
    // Check if chit has changed
    const chitChanged = chitSelectId !== values.chitId;
    
    if (chitChanged) {
      // Reset calendar state when chit changes
      setSelectedCells([]);
      setPaidCells([]);
      setDisabledCells([]);
      setCalendarSelection(false);
      
      // Update the selected chit ID
      setChitSelectId(values.chitId);
      
      // Fetch payment details for the new chit
      if (values.chitId) {
        console.log('Fetching payment details for new chit:', values.chitId);
        fetchChitPaymentDetails(values.chitId, true); // Force refresh for new chit
      }
    }
    
    if (calendarSelection) {
      // If user has manually selected cells, don't override their selection
      // Just update payment data
      setPaymentData(prev => ({
        ...prev,
        amount: values.payAmount
      }));
    } else {
      // Auto-calculate selected cells based on weekSelection only if no manual selection
      if (!chitChanged && values.baseAmount && values.payAmount && values.weekSelection > 0) {
        const paidCellsLength = paidCells.filter(cell => cell.is_paid === 'Y').map(cell => cell.week);
        const newSelectedCells: number[] = [...paidCellsLength]; // Include previous paid cells
        const maxSelectedCell = paidCellsLength.length > 0 ? Math.max(...paidCellsLength) : 0;
        
        // Add new cells based on weekSelection
        for (let i = maxSelectedCell + 1; i <= (values.weekSelection + maxSelectedCell); i++) {
          // Only add to selected cells if not already paid and not already in the array
          const isPaid = paidCells.some(cell => cell.week === i && cell.is_paid === 'Y');
          const isAlreadySelected = newSelectedCells.includes(i);
          if (!isPaid && !isAlreadySelected) {
            newSelectedCells.push(i);
          }
        }
        setSelectedCells(newSelectedCells.sort((a, b) => a - b));
      }
      
      // Update payment data
      setPaymentData(prev => ({
        ...prev,
        amount: values.payAmount
      }));
    }
  }, [calendarSelection, paidCells, fetchChitPaymentDetails, chitSelectId]);

  const weekSelected = () => {
    const paidWeeks = paidCells.filter(cell => cell.is_paid === 'Y').map(cell => cell.week);
    return selectedCells.filter(cellNumber => !paidWeeks.includes(cellNumber));
  };

  // Retry function to refetch data
  const handleRetry = () => {
    console.log('Retrying data fetch...');
    setRetryCount(prev => prev + 1);
    setIsInitialLoad(true);
    setChitList([]); // Clear existing data
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, mt: 4, mb: 4 }}>
        {/* Left Panel - Payment Panel */}
        <Box sx={{ width: { xs: '100%', md: '30%' } }}>
          {isLoading || isInitialLoad ? (
            <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1">{t('pay.loadingChitData')}</Typography>
              {isInitialLoad && (
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  {t('pay.initializingPaymentSystem')}
                </Typography>
              )}
            </Paper>
          ) : error ? (
            <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1" color="error">
                {t('pay.errorLoadingChitData', { error: error })}
              </Typography>
              <Button 
                variant="outlined" 
                color="primary" 
                sx={{ mt: 2 }}
                onClick={handleRetry}
              >
                {t('pay.retry')}
              </Button>
            </Paper>
          ) : chitList.length === 0 ? (
            <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1" color="textSecondary">
                {t('pay.noChitDataAvailable')}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                {t('pay.notEnrolledInChitFunds')}
              </Typography>
              <Button 
                variant="outlined" 
                color="primary" 
                sx={{ mt: 2 }}
                onClick={handleRetry}
              >
                {t('pay.refresh')}
              </Button>
            </Paper>
          ) : (
            <PaymentPanel 
              onPaymentSubmit={handlePayModal}
              chitList={chitList}
              selectedCells={selectedCells}
              onChangeValues={handlePaymentValuesChange}
              alreadyBaseAmount={handleDisableBaseAmount}
              selectWeek={selectWeek}
              maxSelection={MAX_SELECTIONS}
              currentUserId={userId || 0}
            />
          )}
        </Box>
        
        {/* Right Panel - Week Selection */}
        <Box sx={{ width: { xs: '100%', md: '70%' } }}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
              <Typography variant="h4" component="h1" gutterBottom align="center">
                {t('pay.weekSelection')}
              </Typography>

              <Chip
                icon={<CalendarTodayIcon />}
                label={t('pay.weekOf', { week: currentWeek, month: currentMonth })}
                color="primary"
                variant="outlined"
                sx={{ mb: 2 }}
              />
            </Box>
            
            {selectedCells.length > 0 && (
              <Alert severity="info" sx={{ mb: 2 }}>
                {t('pay.selectedCells', { count: weekSelected().length, cells: weekSelected().join(', ') })}
              </Alert>
            )}

            <CellGrid 
              onCellClick={handleCellClick}
              disabledCells={disabledCells}
              selectedCells={selectedCells}
              paidCells={paidCells}
              title=""
            />

            <Divider sx={{ my: 3 }} />

            {/* <Stack direction="row" spacing={2} justifyContent="center">
              <Button 
                variant="contained" 
                color="primary"
                size="large"
                onClick={handleConfirmSelection}
                disabled={selectedCells.length === 0}
              >
                Confirm Selection
              </Button>
              <Button 
                variant="outlined" 
                color="secondary"
                size="large"
                onClick={handleClearSelection}
                disabled={selectedCells.length === 0}
              >
                Clear Selection
              </Button>
            </Stack> */}
          </Paper>
        </Box>
      </Box>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>

      {/* Base Amount Modal */}
      <Modal
        open={baseAmountModalOpen}
        onClose={handleBaseAmountModalClose}
        aria-labelledby="base-amount-modal-title"
        aria-describedby="base-amount-modal-description"
      >
        <Paper
          elevation={5}
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '90%', sm: '70%', md: '40%' },
            maxWidth: 500,
            p: 4,
            maxHeight: '90vh',
            overflow: 'auto'
          }}
        >
          <Typography id="base-amount-modal-title" variant="h5" component="h2" gutterBottom>
            {t('pay.setBaseAmount')}
          </Typography>

          <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
            {t('pay.baseAmountDescription')}
          </Typography>

          <Divider sx={{ mb: 3 }} />

          <Box component="form" noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="baseAmount"
              label={t('pay.baseAmountLabel')}
              name="baseAmount"
              type="number"
              value={baseAmountValue}
              onChange={handleBaseAmountChange}
              error={!!baseAmountError}
              helperText={baseAmountError || t('pay.minimumAmountIs')}
              InputProps={{
                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                inputProps: { min: 200, step: 50 }
              }}
              sx={{ mb: 3 }}
              autoFocus
            />

            <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={handleBaseAmountSubmit}
                disabled={baseAmountValue < 200}
              >
                {t('pay.setBaseAmount')}
              </Button>
              <Button
                fullWidth
                variant="outlined"
                onClick={handleBaseAmountModalClose}
              >
                {t('pay.cancel')}
              </Button>
            </Stack>
          </Box>
        </Paper>
      </Modal>

      {/* Payment Modal */}
      <Modal
        open={paymentModalOpen}
        onClose={handlePaymentModalClose}
        aria-labelledby="payment-modal-title"
        aria-describedby="payment-modal-description"
      >
        <Paper
          elevation={5}
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '90%', sm: '70%', md: '50%' },
            maxWidth: 600,
            p: 4,
            maxHeight: '90vh',
            overflow: 'auto'
          }}
        >
          <Typography id="payment-modal-title" variant="h5" component="h2" gutterBottom>
            {t('pay.paymentDetails')}
          </Typography>

          <Typography variant="body1" sx={{ mb: 3 }}>
            {/* You have selected {selectedCells.length} week(s): {selectedCells.join(', ')} */}
            {t('pay.youHaveSelectedWeeks', { count: selectedCells.length })}
          </Typography>

          <Divider sx={{ mb: 3 }} />

          <Box component="form" noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="amount"
              label={t('pay.amountLabel')}
              name="amount"
              type="number"
              disabled
              value={paymentData.amount}
              onChange={handlePaymentInputChange}
              InputProps={{
                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                inputProps: { min: 200 }
              }}
              helperText={t('pay.minimumAmountIs')}
              sx={{ mb: 3 }}
            />

            {/* Payment Methods Component */}
            <PaymentMethods
              paymentData={paymentData}
              onPaymentDataChange={handlePaymentDataChange}
              errors={paymentErrors}
              chitId={chitSelectId}
              weeks={selectedCells}
              userId={userId || ''}
              onGooglePaySuccess={handleGooglePaySuccess}
              onGooglePayError={handleGooglePayError}
            />

            <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={handleFinalPaymentSubmit}
              >
                {t('pay.pay')}
              </Button>
              <Button
                fullWidth
                variant="outlined"
                onClick={handlePaymentModalClose}
              >
                {t('pay.cancel')}
              </Button>
            </Stack>
          </Box>
        </Paper>
      </Modal>
    </Container>
  );
};

export default withNavigation(CellSelection);