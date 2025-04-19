import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  InputAdornment,
  Stack,
  Alert,
  IconButton,
  Tooltip,
  // Snackbar
} from '@mui/material';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import PaymentIcon from '@mui/icons-material/Payment';
// import CancelIcon from '@mui/icons-material/Cancel';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { ChitItem, ChitListItem, PaymentData, PaypanelChange } from '../utils/interface-utils';
import { PaymentService } from '../services';

interface PaymentPanelProps {
  onPaymentSubmit: (paymentData: PaymentData) => void;
  onCancel: () => void;
  chitList?: ChitItem[];
  onChangeValues?: (values: PaypanelChange) => void;
  alreadyBaseAmount?: () => boolean;
  currentUserId?: number; // Add current user ID prop
}

const PaymentPanel: React.FC<PaymentPanelProps> = ({ 
  onPaymentSubmit, 
  onCancel,
  chitList = [], // Default to empty array if not provided
  onChangeValues,
  alreadyBaseAmount,
  currentUserId = 1 // Default to user ID 1 if not provided
}) => {
  // State for form fields
  const [selectedChit, setSelectedChit] = useState<string>('');
  const [baseAmount, setBaseAmount] = useState<number>(200);
  const [payAmount, setPayAmount] = useState<number>(200);
  const [weekSelection, setWeekSelection] = useState<number>(1); // Default to 1 week
  const [error, setError] = useState<string | null>(null);
  const [showBaseAmountNoValidation, setShowBaseAmountNoValidation] = useState<boolean>(false);
  const [isCreatingChit, setIsCreatingChit] = useState<boolean>(false);
  const [notification, setNotification] = useState<{show: boolean, message: string}>({
    show: false,
    message: ''
  });
  const [isFieldVisible, setIsFieldVisible] = useState<boolean>(false);
  
  // Function to notify parent component of changes
  const notifyChanges = (updates: Partial<PaypanelChange>) => {
    if (onChangeValues) {
      // Find the selected chit in the list to get its chit_id and chit_no
      const selectedChitItem = chitList.find(chit => chit.chit_no === (updates.chitId || selectedChit));
      
      // Use the chit_id from the selected chit if available, otherwise use the chit_no as fallback
      const chitId = selectedChitItem?.chit_id || updates.chitId || selectedChit;
      
      // Use the chit_no from the selected chit, or fallback to the selectedChit value
      const chitNo = updates.chitNo !== undefined ? updates.chitNo : (selectedChitItem?.chit_no || selectedChit);
      
      onChangeValues({
        chitId: chitId,
        chitNo: chitNo,
        baseAmount: updates.baseAmount !== undefined ? updates.baseAmount : baseAmount,
        payAmount: updates.payAmount !== undefined ? updates.payAmount : payAmount,
        weekSelection: updates.weekSelection !== undefined ? updates.weekSelection : weekSelection
      });
    }
  };
  
  // Update pay amount when base amount changes
  // Auto-select the chit if there's only one in the list
  useEffect(() => {
    setPayAmount(baseAmount);
    setWeekSelection(1); // Reset to 1 week when base amount changes
    
    // Notify parent of changes
    const updates: any = { payAmount: baseAmount, weekSelection: 1 };
    
    if (chitList?.length > 0) {
      const chitId = chitList[0].chit_no;
      setSelectedChit(chitId);
      setBaseAmount(chitList[0].amount as number);
      updates.chitId = chitId;
    }
    
    notifyChanges(updates);
  }, [baseAmount, chitList]);

  // Handle chit selection change
  const handleChitChange = (event: SelectChangeEvent) => {
    const newChitId = event.target.value;
    setSelectedChit(newChitId);
    
    // Find the selected chit and safely handle its amount
    const selectedChitAmount = chitList.find(chit => chit.chit_no === newChitId)?.amount;
    // Convert to string before parsing, provide default of 200 if undefined
    const amountValue = selectedChitAmount !== undefined 
      ? (typeof selectedChitAmount === 'number' ? selectedChitAmount : parseInt(selectedChitAmount, 10))
      : 200;
    
    setIsCreatingChit(false);
    setBaseAmount(amountValue);
    notifyChanges({ chitId: newChitId });
  };

  // Handle base amount change with validation
  const handleBaseAmountChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value, 10);
    
    // If in no validation mode, just set the value without validation
    if (showBaseAmountNoValidation) {
      setBaseAmount(value);
      notifyChanges({ baseAmount: value });
      
      // Check if the user has completed entering the amount (by checking if the input loses focus)
      // We'll implement this with a blur event handler
      return;
    }
    
    // If empty or not a number, set to minimum
    if (isNaN(value) && value < 0) {
      setBaseAmount(200);
      notifyChanges({ baseAmount: 200 });
      return;
    }
    
    // Validate for minimum amount
    if (value < 200 && value >= 0) {
      setBaseAmount(value);
      setError('Base amount must be at least ₹200');
      notifyChanges({ baseAmount: value });
      return;
    }
    
    // Validate for hundreds (200, 300, 400, etc.)
    if (value % 100 !== 0 && value >= 200) {
      const roundedValue = Math.floor(value / 100) * 100;
      setBaseAmount(roundedValue);
      setError('Base amount must be in hundreds (200, 300, 400, etc.)');
      notifyChanges({ baseAmount: roundedValue });
      return;
    }
    
    // Valid amount
    setBaseAmount(value);
    // If there's at least one chit in the list, update it
    if (chitList.length > 0) {
      chitList[0].amount = value.toString();
      chitList[0].name = chitList[0].name?.split('₹')[0] + '₹' + value.toString();
      const newChitId = chitList[0].chit_no;
      setSelectedChit(newChitId); // Set to chit_no which is the correct identifier
      notifyChanges({ baseAmount: value, chitId: newChitId });
    } else {
      notifyChanges({ baseAmount: value });
    }
    setError(null);
  };
  
  // Handle base amount blur event to create a new chit when in no validation mode
  const handleBaseAmountBlur = async () => {
    if (showBaseAmountNoValidation && !isNaN(baseAmount) && baseAmount > 0) {
      setIsCreatingChit(true);
      const newChitData: ChitListItem = {
        user_id: currentUserId,
        amount: baseAmount,
        chit_no: (chitList.length + 1)
      };
      try {
        // Create a new chit user
        const newChit = await PaymentService.createChitUsers(newChitData);
        
        if (newChit && newChit.data) {
          // Convert ChitListItem to ChitItem before pushing to chitList
          const newChitItem: ChitItem = {
            chit_id: newChit.data?.chit_id?.toString(),
            user_id: newChit.data.user_id?.toString(),
            chit_no: newChit.data.chit_no?.toString(),
            amount: newChit.data.amount,
            name: `Chit ${newChit.data.chit_no} - ₹${newChit.data.amount}`
          };
          
          // Add the new chit to the chitList
          chitList.push(newChitItem);
          
          // Select the new chit
          setSelectedChit(newChitItem.chit_no);
          
          // Notify parent of changes
          notifyChanges({ 
            // chitId: newChit.chit_no,
            // chitNo: newChit.chit_no,
            baseAmount: baseAmount,
            payAmount: baseAmount,
            weekSelection: 1
          });
          
          // Show success notification
          setNotification({
            show: true,
            message: `New chit created successfully with amount ₹${baseAmount}`
          });
          
          // Turn off no validation mode
          setIsCreatingChit(false);
          setShowBaseAmountNoValidation(true);
          setIsFieldVisible(false);
        }
      } catch (error) {
        console.error('Error creating new chit:', error);
        setError('Failed to create new chit. Please try again.'+ error);
      } finally {
        setIsCreatingChit(false);
      }
    }
  };
  
  // Toggle the base amount field without validation
  const toggleBaseAmountNoValidation = () => {
    setIsFieldVisible(true);
    setShowBaseAmountNoValidation(!showBaseAmountNoValidation);
    setError(null);
  };

  // Handle pay amount change
  const handlePayAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value, 10);
    
    // If empty or not a number, set to base amount
    if (isNaN(value) && value < 0) {
      setPayAmount(baseAmount);
      notifyChanges({ payAmount: baseAmount });
      return;
    }
    
    // Validate for minimum amount (base amount)
    if (value < baseAmount) {
      setPayAmount(value);
      setError(`Pay amount must be at least ₹${baseAmount}`);
      notifyChanges({ payAmount: value });
      return;
    }
    
    // Validate that pay amount is a multiple of base amount
    if (value % baseAmount !== 0) {
      setPayAmount(value);
      setError(`Pay amount must be in multiples of ₹${baseAmount}`);
      notifyChanges({ payAmount: value });
      return;
    }
    
    // Valid amount
    setPayAmount(value);
    const newWeekSelection = value / baseAmount;
    setWeekSelection(newWeekSelection);
    notifyChanges({ 
      payAmount: value,
      weekSelection: newWeekSelection
    });
    setError(null);
  };

  // Handle form submission
  const handleSubmit = () => {
    // Validate form
    if (!selectedChit) {
      setError('Please select a chit');
      return;
    }
    
    if (baseAmount < 200) {
      setError('Base amount must be at least ₹200');
      return;
    }
    
    if (payAmount < baseAmount) {
      setError(`Pay amount must be at least ₹${baseAmount}`);
      return;
    }
    
    // Calculate weekSelection if not already set
    const weeks = weekSelection || (payAmount / baseAmount);
    
    // Submit payment data
    onPaymentSubmit({
      chitId: selectedChit,
      baseAmount,
      payAmount,
      weekSelection: weeks
    });
  };

  return (
    <Paper elevation={3} sx={{ p: 3, width: '100%', maxWidth: 400 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Typography variant="h6" component="h2" gutterBottom sx={{ mr: 1 }}>
          Payment Details
        </Typography>
        <Tooltip title="Create new chit">
          <IconButton 
            color={showBaseAmountNoValidation ? "primary" : "default"} 
            onClick={toggleBaseAmountNoValidation}
            size="small"
          >
            <AddCircleIcon />
          </IconButton>
        </Tooltip>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      
      <Stack spacing={3} >
        {/* Chit Selection Dropdown */}
      {!isFieldVisible && (
        <FormControl fullWidth>
          <InputLabel id="chit-select-label">Select Chit</InputLabel>
          <Select
            labelId="chit-select-label"
            id="chit-select"
            value={selectedChit}
            label="Select Chit"
            onChange={handleChitChange}
            required
            disabled={chitList.length === 1}
          >
            {chitList.length === 0 ? (
              <MenuItem value="" disabled>
                No chits available
              </MenuItem>
            ) : (
              chitList.map((chit) => (
                <MenuItem key={chit.chit_no} value={chit.chit_no}>
                  {chit.name || `Chit ${chit.chit_no} - ₹${chit.amount}`}
                </MenuItem>
              ))
            )}
          </Select>
        </FormControl>
      )}
        {/* Base Amount Field */}
        <TextField
          fullWidth
          label={showBaseAmountNoValidation ? "Base Amount (No Validation)" : "Base Amount"}
          type="number"
          value={baseAmount}
          onChange={handleBaseAmountChange}
          onBlur={handleBaseAmountBlur}
          disabled={(!showBaseAmountNoValidation && !isCreatingChit) }
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <CurrencyRupeeIcon />
              </InputAdornment>
            ),
          }}
          helperText={showBaseAmountNoValidation ? "Enter any amount and press Tab to create a new chit" : "Minimum ₹200, in hundreds only (200, 300, 400, etc.)"}
          required
          color={showBaseAmountNoValidation ? "secondary" : "primary"}
        />
        
        {/* Pay Amount Field */}
        
      {!isFieldVisible && (
        <TextField
          fullWidth
          label="Pay Amount"
          type="number"
          value={payAmount}
          onChange={handlePayAmountChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <CurrencyRupeeIcon />
              </InputAdornment>
            ),
          }}
          helperText={`Minimum ₹${baseAmount}`}
          required
        />)}
        
        {/* Action Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
        {!isFieldVisible && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<PaymentIcon />}
            onClick={handleSubmit}
            disabled={error !== null}
          >
            Pay Now
          </Button>)}
          
          {/* <Button
            variant="outlined"
            color="secondary"
            startIcon={<CancelIcon />}
            onClick={onCancel}
          >
            Cancel
          </Button> */}
        </Box>
      </Stack>
    </Paper>
  );
};

export default PaymentPanel;