# Test Card Details for Development

This document contains dummy card details that can be used for testing the payment functionality. These are safe test card numbers that follow proper validation rules but are not real cards.

## Quick Test Data

### Credit/Debit Cards

#### Visa Cards
- **Card Number**: 4111 1111 1111 1111
- **Name**: John Doe
- **Expiry**: 12/25
- **CVV**: 123

- **Card Number**: 4000 0000 0000 0002
- **Name**: Jane Smith
- **Expiry**: 06/26
- **CVV**: 456

#### Mastercard
- **Card Number**: 5555 5555 5555 4444
- **Name**: Bob Johnson
- **Expiry**: 09/27
- **CVV**: 789

- **Card Number**: 5105 1051 0510 5100
- **Name**: Alice Brown
- **Expiry**: 03/28
- **CVV**: 321

#### American Express
- **Card Number**: 3782 8224 6310 005
- **Name**: Charlie Wilson
- **Expiry**: 11/25
- **CVV**: 1234

- **Card Number**: 3714 4963 5398 431
- **Name**: Diana Davis
- **Expiry**: 08/26
- **CVV**: 5678

#### Discover
- **Card Number**: 6011 1111 1111 1117
- **Name**: Edward Miller
- **Expiry**: 04/27
- **CVV**: 987

### UPI IDs
- testuser@paytm
- john.doe@googlepay
- alice123@phonepe
- testpay@upi
- demo.user@bhim
- sample@ybl
- test.payment@okaxis
- dummy@ibl

## Validation Rules Implemented

### Card Number
- Must be exactly 16 digits (15 for American Express)
- Must pass Luhn algorithm validation
- Automatically formatted with spaces (1234 5678 9012 3456)

### Expiry Date
- Must be in MM/YY format
- Must be a future date (not expired)
- Automatically formatted as you type

### CVV
- Must be 3 digits for most cards
- Must be 4 digits for American Express
- Only numeric characters allowed

### Name on Card
- Must be at least 2 characters
- Only letters and spaces allowed
- Required field

### UPI ID
- Must follow format: username@provider
- Must contain @ symbol
- Must have valid characters before and after @

## How to Use

### Method 1: Manual Entry
Copy and paste any of the test card details above into the payment form.

### Method 2: Auto-Fill (Development Mode)
1. Select your payment method (Credit Card, Debit Card, or UPI)
2. Click the "Test Data" button (only visible in development mode)
3. The form will automatically fill with random test data

### Method 3: Programmatic Access
```typescript
import { getRandomTestCard, getRandomTestUpiId } from '../utils/test-card-data';

// Get a random test card
const testCard = getRandomTestCard();

// Get a random test UPI ID
const testUpiId = getRandomTestUpiId();
```

## Important Notes

⚠️ **These are test card numbers only!**
- They will pass client-side validation
- They should NOT be used with real payment processors
- They are for development and testing purposes only
- Real payment processing requires integration with actual payment gateways

## Features Implemented

✅ **Card Number Validation**
- 16-digit validation
- Luhn algorithm check
- Auto-formatting with spaces
- Card type detection (Visa, Mastercard, etc.)

✅ **Expiry Date Validation**
- MM/YY format enforcement
- Future date validation
- Auto-formatting as you type

✅ **CVV Validation**
- 3-4 digit validation
- Numeric only input
- Masked input for security

✅ **UPI ID Validation**
- Email-like format validation
- Real-time validation feedback

✅ **User Experience**
- Real-time validation feedback
- Error messages for invalid inputs
- Auto-formatting for better UX
- Card type detection and display
- Test data auto-fill for development

## Testing Scenarios

### Valid Scenarios
- Use any of the test card numbers above
- Use future expiry dates
- Use valid CVV numbers
- Use properly formatted UPI IDs

### Invalid Scenarios to Test
- Expired cards (past dates)
- Invalid card numbers (wrong length, failed Luhn check)
- Invalid CVV (wrong length, non-numeric)
- Invalid UPI IDs (missing @, invalid format)
- Empty required fields