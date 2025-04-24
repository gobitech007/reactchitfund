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
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  InputAdornment,
  Grid
} from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
// import { DataProvider } from '../context';
import PaymentIcon from '@mui/icons-material/Payment';
import CellGrid from '../components/CellGrid';
import PaymentPanel from '../components/PaymentPanel';
import { withNavigation } from '../utils/withNavigation';
import { getCurrentWeekWithOrdinal, getCurrentMonthName } from '../utils/date-utils';
import QRCodeComponent from '../components/QRCodeComponent';
import { useAuth, useData, useDynamicApiStore } from '../context';
import {PaymentService, ApiService} from '../services';
import { CellData, ChitItem, PaymentData, PaymentFormData, PaymentMethod } from '../utils/interface-utils';

interface CellSelectionProps {
  navigate?: (path: string) => void;
}

const CellSelection: React.FC<CellSelectionProps> = ({ navigate }) => {
  
    const { currentUser } = useAuth();
    // const { store } = useData();
  // State for selected cells
  const [selectedCells, setSelectedCells] = useState<number[]>([]);

  const [selectWeek, setSelectWeek] = useState<number[]>([]);

  // State for disabled cells (example: already taken by others)
  const [disabledCells, setDisabledCells] = useState<number[]>([]);
  
  // State for paid cells
  const [paidCells, setPaidCells] = useState<CellData[]>([]);

  // State for notification
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info' as 'success' | 'info' | 'warning' | 'error'
  });

  // State for payment modal
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  // State for payment form data
  const [paymentData, setPaymentData] = useState<PaymentFormData>({
    amount: 200,
    paymentMethod: 'credit_card',
  });

  // State for available chit list
  
  // Get chit users data from the store
  const chitUsersData = useDynamicApiStore('chitUsers', { 
    params: currentUser?.user_id ? [currentUser.user_id] : [], 
  });
  
  // Access the full store for debugging and get loading/error states
  const { store } = useData();
  // Use type assertion to access dynamic properties
  const isLoading = store['chitUsersLoading'] as boolean;
  const error = store['chitUsersError'] as string | null;
  const [chitList, setChitList] = useState<ChitListItem[]>([]);
  
  
  // Log the store and chitUsersData for debugging
  useEffect(() => {
    setChitList(chitUsersData);
    store.chitUsersLoading = false;
    // Update chitList when API data is available
    if (chitUsersData && Array.isArray(chitUsersData)) {
      // Type assertion for the API data
      const typedChitData = chitUsersData as Array<ChitItem>;
      
      const formattedChitList: ChitListItem[] = typedChitData.map(chit => ({
        chit_no: chit.chit_no || chit.chit_no || `chit-${Math.random().toString(36).substr(2, 9)}`,
        name: `Weekly Chit ${chit.chit_no}- ₹${chit.amount || '200'}`,
        amount: `${chit.amount || '200'}`,
        chit_id: chit.chit_id,
      }));
      
      if (formattedChitList.length > 0) {
        setChitList(formattedChitList);
        
        // If there's only one chit, fetch its payment details automatically
        if (formattedChitList.length === 1 && formattedChitList[0].chit_id && disabledCells.length === 0) {
          // Use cached data if available
          fetchChitPaymentDetailsRef.current(formattedChitList[0].chit_id, false);
        }
      }
    }
  }, [store, chitUsersData, isLoading, error, disabledCells]);
  
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
    setSelectedCells(prev => {
      // If already selected, remove it
      if (prev.includes(cellNumber)) {
        // When removing a cell, only allow removing the highest number
        // to maintain sequential selection
        if (cellNumber === Math.max(...prev)) {
          return prev.filter(cell => cell !== cellNumber);
        } else {
          setNotification({
            open: true,
            message: 'You can only deselect the last selected week',
            severity: 'warning'
          });
          return prev;
        }
      }
      
      // If max selections reached, show warning and don't add
      if (prev.length >= MAX_SELECTIONS) {
        setNotification({
          open: true,
          message: `You can only select up to ${MAX_SELECTIONS} week`,
          severity: 'warning'
        });
        return prev;
      }

      // For sequential selection, check if the new cell is the next in sequence
      if (prev.length === 0) {
        // First selection can be any cell
        return [cellNumber];
      } else {
        // Get the highest currently selected cell
        const highestSelected = Math.max(...prev);
        
        // Only allow selection if it's the next cell in sequence
        if (cellNumber === highestSelected + 1) {
          return [...prev, cellNumber];
        } else {
          setNotification({
            open: true,
            message: 'You must select weeks in sequential order',
            severity: 'warning'
          });
          return prev;
        }
      }
    });
  };

  useEffect(() => { 
    const paidCellsWeek = paidCells.filter(cell => cell.is_paid === 'Y').map(cell => cell.week);
    setSelectWeek(paidCellsWeek)
    setSelectedCells(selectedCells);
  }, [selectedCells, paidCells]);

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

  // Handle payment form input changes
  const handlePaymentInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setPaymentData(prev => ({
      ...prev,
      [name]: name === 'amount' ? Math.max(200, Number(value)) : value
    }));
  };

  // Handle payment method change
  const handlePaymentMethodChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPaymentData(prev => ({
      ...prev,
      paymentMethod: e.target.value as PaymentMethod
    }));
  };

  // Handle payment submission
  const handleFinalPaymentSubmit = async () => {
    try {
      // Get the first chit from the list (assuming we're paying for the selected chit)
      const selectedChit = chitList.length > 0 ? chitList[0] : null;
      
      if (!selectedChit || !currentUser) {
        setNotification({
          open: true,
          message: 'Missing chit or user information',
          severity: 'error'
        });
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
      
      // Calculate amount per week
      const amountPerWeek = Math.floor(paymentData.amount / weeksToProcess.length);
      
      // Process payments for all selected weeks
      const paymentPromises = weeksToProcess.map(async (week) => {
        // Prepare backend payment request data for this week
        const backendPayload = {
          user_id: currentUser.user_id,
          chit_no: parseInt(selectedChit.chit_no),
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
          message: `Some payments failed: ${failedPayments.map(r => r.error).join(', ')}`,
          severity: 'error'
        });
        return;
      }
      
      // All payments succeeded
      const response = responses[0]; // Use the first response for notification

      if (response.error) {
        // Show error notification
        setNotification({
          open: true,
          message: `Payment failed: ${response.error}`,
          severity: 'error'
        });
        return;
      }

      // Close the modal
      setPaymentModalOpen(false);

      // Show success notification with transaction ID
      setNotification({
        open: true,
        message: `Successfully processed payment of ₹${paymentData.amount} for weeks: ${weeksToProcess.join(', ')}. Transaction ID: ${transactionId}`,
        severity: 'success'
      });
      
      // Optionally fetch all payments for this transaction ID to confirm they were processed
      try {
        // Use ApiService directly to avoid TypeScript errors if the method isn't recognized
        const allPaymentsResponse = await ApiService.get(`/payments/transaction/${transactionId.split('-')[0]}`);
        
        if (allPaymentsResponse.data && allPaymentsResponse.data.length > 0) {
          console.log('All payments for this transaction:', allPaymentsResponse.data);
        }
      } catch (error) {
        console.error('Error fetching all payments for transaction:', error);
      }

      // Clear selected cells after successful payment
      setSelectedCells([]);
      
      // Refresh payment details to update the UI with newly paid weeks
      if (selectedChit && selectedChit.chit_no) {
        // Force refresh after payment to get updated data
        fetchChitPaymentDetailsRef.current(selectedChit.chit_no, true);
      }

      // In a real app, you might navigate to another page after successful payment
      // if (navigate) navigate('/dashboard');
    } catch (error) {
      console.error('Payment error:', error);

      // Show error notification
      setNotification({
        open: true,
        message: `Payment failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
      message: `Payment of ₹${data.payAmount} initiated for ${data.chitId}`,
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
      console.log('Skipping duplicate fetch request for chit:', chitId);
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
      console.log('Using cached results for chit:', chitId);
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
      console.log('Fetching payment details for chit:', chitId);
      const response = await PaymentService.getChitPaymentDetails(chitId);
      
      if (response.data) {
        // Update cache
        cachedResultsRef.current[chitId] = response.data;
        lastFetchTimeRef.current = Date.now();
        
        // Set paid cells from the response
        setPaidCells(response.data);
        
        // Update disabled cells to include paid cells
        const newDisabledCells = response.data
          .filter(cell => cell.is_paid === 'Y')
          .map(cell => cell.week);
        setDisabledCells(newDisabledCells);
      }
    } catch (error) {
      console.error('Error fetching chit payment details:', error);
      setNotification({
        open: true,
        message: `Failed to load payment details: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
  const handlePaymentValuesChange = (values: {
    chitId: string;
    baseAmount: number;
    payAmount: number;
    weekSelection: number;
  }) => { 
    setSelectedCells([]);  
    if (values.baseAmount?.toString().length < 3 || (values && values.payAmount !== 0 && values.payAmount?.toString().length < 3)) {
      return; 
    } 
    // Fetch payment details when chit ID changes
    if (values.chitId && values.baseAmount.toString().length >= 2 && disabledCells.length === 0) {
      fetchChitPaymentDetails(values.chitId);
    }
    
    // Update selected cells based on weekSelection
    // This is just an example - you might want to implement your own logic
    const paidCellsLength = paidCells.filter(cell => cell.is_paid === 'Y').map(cell => cell.week);
    const newSelectedCells: number[] = paidCellsLength; // Include previous array values
    const maxSelectedCell = paidCellsLength.length > 0 ? Math.max(...paidCellsLength) : 0;
    for (let i = 1; i <= (values.weekSelection + maxSelectedCell); i++) {
      // Only add to selected cells if not already paid and not already in the array
      const isPaid = paidCells.some(cell => cell.week === i && cell.is_paid === 'Y');
      const isAlreadySelected = newSelectedCells.includes(i);
      if (!isPaid && !isAlreadySelected) {
        newSelectedCells.push(i);
      }
    }
    setSelectedCells(newSelectedCells);
    // Update payment data
    setPaymentData(prev => ({
      ...prev,
      amount: values.payAmount
    }));
  };

  const weekSelected = () => {
    const paidWeeks = paidCells.filter(cell => cell.is_paid === 'Y').map(cell => cell.week);
    return selectedCells.filter(cellNumber => !paidWeeks.includes(cellNumber));
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, mt: 4, mb: 4 }}>
        {/* Left Panel - Payment Panel */}
        <Box sx={{ width: { xs: '100%', md: '30%' } }}>
          {isLoading ? (
            <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1">Loading chit data...</Typography>
            </Paper>
          ) : error ? (
            <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1" color="error">
                Error loading chit data: {error}
              </Typography>
              <Button 
                variant="outlined" 
                color="primary" 
                sx={{ mt: 2 }}
                onClick={() => window.location.reload()}
              >
                Retry
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
            />
          )}
        </Box>
        
        {/* Right Panel - Week Selection */}
        <Box sx={{ width: { xs: '100%', md: '70%' } }}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
              <Typography variant="h4" component="h1" gutterBottom align="center">
                Week Selection
              </Typography>

              <Chip
                icon={<CalendarTodayIcon />}
                label={`Week ${currentWeek} of ${currentMonth}`}
                color="primary"
                variant="outlined"
                sx={{ mb: 2 }}
              />
            </Box>
            
            {selectedCells.length > 0 && (
              <Alert severity="info" sx={{ mb: 2 }}>
                You have selected {weekSelected().length} week(s): {weekSelected().join(', ')}
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
            Payment Details
          </Typography>

          <Typography variant="body1" sx={{ mb: 3 }}>
            {/* You have selected {selectedCells.length} week(s): {selectedCells.join(', ')} */}
            You have selected {selectedCells.length} week(s)
          </Typography>

          <Divider sx={{ mb: 3 }} />

          <Box component="form" noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="amount"
              label="Amount (₹)"
              name="amount"
              type="number"
              value={paymentData.amount}
              onChange={handlePaymentInputChange}
              InputProps={{
                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                inputProps: { min: 200 }
              }}
              helperText="Minimum amount is ₹200"
              sx={{ mb: 3 }}
            />

            <FormControl component="fieldset" sx={{ mb: 3 }}>
              <FormLabel component="legend">Payment Method</FormLabel>
              <RadioGroup
                aria-label="payment-method"
                name="paymentMethod"
                value={paymentData.paymentMethod}
                onChange={handlePaymentMethodChange}
              >
                <FormControlLabel
                  value="credit_card"
                  control={<Radio />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CreditCardIcon sx={{ mr: 1 }} />
                      <Typography>Credit Card</Typography>
                    </Box>
                  }
                />
                <FormControlLabel
                  value="debit_card"
                  control={<Radio />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PaymentIcon sx={{ mr: 1 }} />
                      <Typography>Debit Card</Typography>
                    </Box>
                  }
                />
                <FormControlLabel
                  value="upi"
                  control={<Radio />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AccountBalanceIcon sx={{ mr: 1 }} />
                      <Typography>UPI</Typography>
                    </Box>
                  }
                />
              </RadioGroup>
            </FormControl>

            {/* Credit Card or Debit Card Form Fields */}
            {(paymentData.paymentMethod === 'credit_card' || paymentData.paymentMethod === 'debit_card') && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    id="cardNumber"
                    label="Card Number"
                    name="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={paymentData.cardNumber || ''}
                    onChange={handlePaymentInputChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    id="cardName"
                    label="Name on Card"
                    name="cardName"
                    value={paymentData.cardName || ''}
                    onChange={handlePaymentInputChange}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    required
                    fullWidth
                    id="expiryDate"
                    label="Expiry Date"
                    name="expiryDate"
                    placeholder="MM/YY"
                    value={paymentData.expiryDate || ''}
                    onChange={handlePaymentInputChange}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    required
                    fullWidth
                    id="cvv"
                    label="CVV"
                    name="cvv"
                    type="password"
                    value={paymentData.cvv || ''}
                    onChange={handlePaymentInputChange}
                  />
                </Grid>
              </Grid>
            )}

            {/* UPI Form Fields */}
            {paymentData.paymentMethod === 'upi' && (
              <Box>
                <TextField
                  required
                  fullWidth
                  id="upiId"
                  label="UPI ID"
                  name="upiId"
                  placeholder="yourname@upi"
                  value={paymentData.upiId || ''}
                  onChange={handlePaymentInputChange}
                  helperText="Enter your UPI ID (e.g., yourname@upi)"
                  sx={{ mb: 3 }}
                />

                {/* QR Code Display */}
                <QRCodeComponent value={'55'} />
                <Box
                  sx={{
                    mt: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    border: '1px solid #ddd',
                    borderRadius: 1,
                    p: 2
                  }}
                >
                  <Typography variant="subtitle1" gutterBottom>
                    Scan QR Code to Pay
                  </Typography>

                  {/* Placeholder for QR Code */}
                  <Box
                    sx={{
                      width: 200,
                      height: 200,
                      bgcolor: '#f5f5f5',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      border: '1px solid #ddd',
                      position: 'relative',
                      my: 2
                    }}
                  >
                    {/* QR Code Pattern (Simple Representation) */}
                    <Box sx={{
                      width: 160,
                      height: 160,
                      bgcolor: 'white',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(8, 1fr)',
                      gridTemplateRows: 'repeat(8, 1fr)',
                      gap: '2px'
                    }}>
                      {Array.from({ length: 64 }).map((_, index) => (
                        <Box
                          key={index}
                          sx={{
                            bgcolor: Math.random() > 0.5 ? 'black' : 'white',
                            width: '100%',
                            height: '100%'
                          }}
                        />
                      ))}
                    </Box>

                    {/* Center Logo */}
                    <Box
                      sx={{
                        position: 'absolute',
                        width: 40,
                        height: 40,
                        bgcolor: 'white',
                        borderRadius: '50%',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        boxShadow: '0 0 5px rgba(0,0,0,0.2)'
                      }}
                    >
                      <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                        UPI
                      </Typography>
                    </Box>
                  </Box>

                  <Typography variant="body2" color="text.secondary" align="center">
                    Amount: ₹{paymentData.amount}
                  </Typography>

                  <Typography variant="caption" color="text.secondary" align="center" sx={{ mt: 1 }}>
                    QR code is valid for 15 minutes
                  </Typography>
                </Box>
              </Box>
            )}

            <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={handleFinalPaymentSubmit}
              >
                Pay
              </Button>
              <Button
                fullWidth
                variant="outlined"
                onClick={handlePaymentModalClose}
              >
                Cancel
              </Button>
            </Stack>
          </Box>
        </Paper>
      </Modal>
    </Container>
  );
};

export default withNavigation(CellSelection);