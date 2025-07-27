import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Grid,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  InputAdornment,
  Alert,
  Chip,
  Button,
  Tooltip
} from '@mui/material';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PaymentIcon from '@mui/icons-material/Payment';
import BugReportIcon from '@mui/icons-material/BugReport';
import QRCodeComponent from './QRCodeComponent';
import { PaymentFormData, PaymentMethod } from '../utils/interface-utils';
import { getRandomTestCard, getRandomTestUpiId, generateFutureExpiryDate } from '../utils/test-card-data';

interface PaymentMethodsProps {
  paymentData: PaymentFormData;
  onPaymentDataChange: (data: PaymentFormData) => void;
  errors?: Record<string, string>;
}

const PaymentMethods: React.FC<PaymentMethodsProps> = ({
  paymentData,
  onPaymentDataChange,
  errors = {}
}) => {
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Validation functions
  const validateCardNumber = (cardNumber: string): string => {
    if (!cardNumber) return 'Card number is required';
    
    // Remove spaces and non-digits
    const cleanCardNumber = cardNumber.replace(/\D/g, '');
    
    if (cleanCardNumber.length !== 16) {
      return 'Card number must be exactly 16 digits';
    }
    
    // Basic Luhn algorithm check
    let sum = 0;
    let isEven = false;
    
    for (let i = cleanCardNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cleanCardNumber.charAt(i), 10);
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    if (sum % 10 !== 0) {
      return 'Invalid card number';
    }
    
    return '';
  };

  const validateExpiryDate = (expiryDate: string): string => {
    if (!expiryDate) return 'Expiry date is required';
    
    const expiryRegex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
    if (!expiryRegex.test(expiryDate)) {
      return 'Expiry date must be in MM/YY format';
    }
    
    const [month, year] = expiryDate.split('/');
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100; // Get last 2 digits
    const currentMonth = currentDate.getMonth() + 1; // 0-indexed, so add 1
    
    const expMonth = parseInt(month, 10);
    const expYear = parseInt(year, 10);
    
    // Check if the expiry date is in the future
    if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
      return 'Card has expired. Please enter a future date';
    }
    
    return '';
  };

  const validateCVV = (cvv: string): string => {
    if (!cvv) return 'CVV is required';
    
    const cvvRegex = /^[0-9]{3,4}$/;
    if (!cvvRegex.test(cvv)) {
      return 'CVV must be 3 or 4 digits';
    }
    
    return '';
  };

  const validateCardName = (cardName: string): string => {
    if (!cardName) return 'Name on card is required';
    
    if (cardName.length < 2) {
      return 'Name must be at least 2 characters';
    }
    
    const nameRegex = /^[a-zA-Z\s]+$/;
    if (!nameRegex.test(cardName)) {
      return 'Name can only contain letters and spaces';
    }
    
    return '';
  };

  const validateUpiId = (upiId: string): string => {
    if (!upiId) return 'UPI ID is required';
    
    const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$/;
    if (!upiRegex.test(upiId)) {
      return 'Please enter a valid UPI ID (e.g., yourname@upi)';
    }
    
    return '';
  };

  // Format card number with spaces
  const formatCardNumber = (value: string): string => {
    const cleanValue = value.replace(/\D/g, '');
    const formattedValue = cleanValue.replace(/(.{4})/g, '$1 ').trim();
    return formattedValue.substring(0, 19); // Max length with spaces
  };

  // Format expiry date
  const formatExpiryDate = (value: string): string => {
    const cleanValue = value.replace(/\D/g, '');
    if (cleanValue.length >= 2) {
      return cleanValue.substring(0, 2) + '/' + cleanValue.substring(2, 4);
    }
    return cleanValue;
  };

  // Handle input changes with validation
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;
    let error = '';

    // Format and validate based on field type
    switch (name) {
      case 'cardNumber':
        formattedValue = formatCardNumber(value);
        error = validateCardNumber(formattedValue);
        break;
      case 'expiryDate':
        formattedValue = formatExpiryDate(value);
        error = validateExpiryDate(formattedValue);
        break;
      case 'cvv':
        formattedValue = value.replace(/\D/g, '').substring(0, 4);
        error = validateCVV(formattedValue);
        break;
      case 'cardName':
        formattedValue = value.replace(/[^a-zA-Z\s]/g, '');
        error = validateCardName(formattedValue);
        break;
      case 'upiId':
        error = validateUpiId(value);
        break;
      default:
        break;
    }

    // Update validation errors
    setValidationErrors(prev => ({
      ...prev,
      [name]: error
    }));

    // Update payment data
    onPaymentDataChange({
      ...paymentData,
      [name]: formattedValue
    });
  };

  // Handle payment method change
  const handlePaymentMethodChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPaymentMethod = e.target.value as PaymentMethod;
    
    // Clear validation errors when switching payment methods
    setValidationErrors({});
    
    onPaymentDataChange({
      ...paymentData,
      paymentMethod: newPaymentMethod,
      // Clear fields from other payment methods
      ...(newPaymentMethod !== 'credit_card' && newPaymentMethod !== 'debit_card' && {
        cardNumber: '',
        cardName: '',
        expiryDate: '',
        cvv: ''
      }),
      ...(newPaymentMethod !== 'upi' && {
        upiId: ''
      })
    });
  };

  // Get card type from card number
  const getCardType = (cardNumber: string): string => {
    const cleanNumber = cardNumber.replace(/\D/g, '');
    
    if (cleanNumber.startsWith('4')) return 'Visa';
    if (cleanNumber.startsWith('5') || cleanNumber.startsWith('2')) return 'Mastercard';
    if (cleanNumber.startsWith('3')) return 'American Express';
    if (cleanNumber.startsWith('6')) return 'Discover';
    
    return '';
  };

  // Fill test data for development/testing
  const fillTestData = () => {
    if (paymentData.paymentMethod === 'credit_card' || paymentData.paymentMethod === 'debit_card') {
      const testCard = getRandomTestCard();
      onPaymentDataChange({
        ...paymentData,
        cardNumber: testCard.cardNumber,
        cardName: testCard.cardName,
        expiryDate: generateFutureExpiryDate(),
        cvv: testCard.cvv
      });
    } else if (paymentData.paymentMethod === 'upi') {
      onPaymentDataChange({
        ...paymentData,
        upiId: getRandomTestUpiId()
      });
    }
  };

  return (
    <Box>
      {/* Payment Method Selection */}
      <FormControl component="fieldset" fullWidth sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <FormLabel component="legend">
            <Typography variant="h6" gutterBottom>
              Select Payment Method
            </Typography>
          </FormLabel>
          
          {/* Test Data Button - Only show in development */}
          {process.env.NODE_ENV === 'development' && (
            <Tooltip title="Fill with test data for development">
              <Button
                size="small"
                variant="outlined"
                color="secondary"
                startIcon={<BugReportIcon />}
                onClick={fillTestData}
                sx={{ ml: 2 }}
              >
                Test Data
              </Button>
            </Tooltip>
          )}
        </Box>
        <RadioGroup
          value={paymentData.paymentMethod}
          onChange={handlePaymentMethodChange}
          row
        >
          <FormControlLabel
            value="credit_card"
            control={<Radio />}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CreditCardIcon />
                Credit Card
              </Box>
            }
          />
          <FormControlLabel
            value="debit_card"
            control={<Radio />}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PaymentIcon />
                Debit Card
              </Box>
            }
          />
          <FormControlLabel
            value="upi"
            control={<Radio />}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccountBalanceIcon />
                UPI
              </Box>
            }
          />
        </RadioGroup>
      </FormControl>

      {/* Credit/Debit Card Form Fields */}
      {(paymentData.paymentMethod === 'credit_card' || paymentData.paymentMethod === 'debit_card') && (
        <Box>
          <Typography variant="h6" gutterBottom>
            {paymentData.paymentMethod === 'credit_card' ? 'Credit Card' : 'Debit Card'} Details
          </Typography>
          
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
                onChange={handleInputChange}
                error={!!validationErrors.cardNumber || !!errors.cardNumber}
                helperText={validationErrors.cardNumber || errors.cardNumber || 'Enter 16-digit card number'}
                InputProps={{
                  endAdornment: paymentData.cardNumber && (
                    <InputAdornment position="end">
                      <Chip 
                        label={getCardType(paymentData.cardNumber)} 
                        size="small" 
                        variant="outlined"
                      />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="cardName"
                label="Name on Card"
                name="cardName"
                placeholder="John Doe"
                value={paymentData.cardName || ''}
                onChange={handleInputChange}
                error={!!validationErrors.cardName || !!errors.cardName}
                helperText={validationErrors.cardName || errors.cardName || 'Enter name as shown on card'}
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
                onChange={handleInputChange}
                error={!!validationErrors.expiryDate || !!errors.expiryDate}
                helperText={validationErrors.expiryDate || errors.expiryDate || 'MM/YY format'}
                inputProps={{ maxLength: 5 }}
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
                placeholder="123"
                value={paymentData.cvv || ''}
                onChange={handleInputChange}
                error={!!validationErrors.cvv || !!errors.cvv}
                helperText={validationErrors.cvv || errors.cvv || '3-4 digit security code'}
                inputProps={{ maxLength: 4 }}
              />
            </Grid>
          </Grid>

          {/* Security Notice */}
          <Alert severity="info" sx={{ mt: 2 }}>
            Your card information is encrypted and secure. We never store your CVV.
          </Alert>
        </Box>
      )}

      {/* UPI Form Fields */}
      {paymentData.paymentMethod === 'upi' && (
        <Box>
          <Typography variant="h6" gutterBottom>
            UPI Payment Details
          </Typography>
          
          <TextField
            required
            fullWidth
            id="upiId"
            label="UPI ID"
            name="upiId"
            placeholder="yourname@upi"
            value={paymentData.upiId || ''}
            onChange={handleInputChange}
            error={!!validationErrors.upiId || !!errors.upiId}
            helperText={validationErrors.upiId || errors.upiId || 'Enter your UPI ID (e.g., yourname@paytm, yourname@googlepay)'}
            sx={{ mb: 3 }}
          />

          {/* QR Code Display */}
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

            {/* QR Code Component */}
            <QRCodeComponent value={paymentData.upiId || 'default-upi-payment'} />
            
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
              Scan this QR code with any UPI app to make the payment
            </Typography>
          </Box>

          {/* UPI Apps Info */}
          <Alert severity="info" sx={{ mt: 2 }}>
            You can use any UPI app like Google Pay, PhonePe, Paytm, BHIM, or your bank's UPI app to scan and pay.
          </Alert>
        </Box>
      )}
    </Box>
  );
};

export default PaymentMethods;