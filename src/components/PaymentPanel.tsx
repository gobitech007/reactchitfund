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
  Alert
} from '@mui/material';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import PaymentIcon from '@mui/icons-material/Payment';
import CancelIcon from '@mui/icons-material/Cancel';

interface ChitItem {
  chit_no: string;
  amount: string | number;
  description?: string;
  name?: string;
}

interface PaymentPanelProps {
  onPaymentSubmit: (paymentData: PaymentData) => void;
  onCancel: () => void;
  chitList?: ChitItem[];
  onChangeValues?: (values: {
    chitId: string;
    baseAmount: number;
    payAmount: number;
    weekSelection: number;
  }) => void;
}

export interface PaymentData {
  chitId: string;
  baseAmount: number;
  payAmount: number;
  weekSelection: number;
}

const PaymentPanel: React.FC<PaymentPanelProps> = ({ 
  onPaymentSubmit, 
  onCancel,
  chitList = [], // Default to empty array if not provided
  onChangeValues
}) => {
  // State for form fields
  const [selectedChit, setSelectedChit] = useState<string>('');
  const [baseAmount, setBaseAmount] = useState<number>(200);
  const [payAmount, setPayAmount] = useState<number>(200);
  const [weekSelection, setWeekSelection] = useState<number>(1); // Default to 1 week
  const [error, setError] = useState<string | null>(null);
  
  // Function to notify parent component of changes
  const notifyChanges = (updates: Partial<{
    chitId: string;
    baseAmount: number;
    payAmount: number;
    weekSelection: number;
  }>) => {
    if (onChangeValues) {
      onChangeValues({
        chitId: updates.chitId !== undefined ? updates.chitId : selectedChit,
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
    
    if (chitList.length === 1) {
      const chitId = chitList[0].chit_no;
      setSelectedChit(chitId);
      updates.chitId = chitId;
    }
    
    notifyChanges(updates);
  }, [baseAmount, chitList]);

  // Handle chit selection change
  const handleChitChange = (event: SelectChangeEvent) => {
    const newChitId = event.target.value;
    setSelectedChit(newChitId);
    notifyChanges({ chitId: newChitId });
  };

  // Handle base amount change with validation
  const handleBaseAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value, 10);
    
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
      <Typography variant="h6" component="h2" gutterBottom>
        Payment Details
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Stack spacing={3}>
        {/* Chit Selection Dropdown */}
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
        
        {/* Base Amount Field */}
        <TextField
          fullWidth
          label="Base Amount"
          type="number"
          value={baseAmount}
          onChange={handleBaseAmountChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <CurrencyRupeeIcon />
              </InputAdornment>
            ),
          }}
          helperText="Minimum ₹200, in hundreds only (200, 300, 400, etc.)"
          required
        />
        
        {/* Pay Amount Field */}
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
        />
        
        {/* Action Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<PaymentIcon />}
            onClick={handleSubmit}
            disabled={error !== null}
          >
            Pay Now
          </Button>
          
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<CancelIcon />}
            onClick={onCancel}
          >
            Cancel
          </Button>
        </Box>
      </Stack>
    </Paper>
  );
};

export default PaymentPanel;