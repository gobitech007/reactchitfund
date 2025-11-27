# Google Pay Integration Setup Guide

This guide will help you set up Google Pay integration for your SM Chit Fund React application.

## Prerequisites

1. **Google Pay Business Account**: You need to have Google Pay for Business credentials
2. **Payment Gateway**: A payment gateway that supports Google Pay (like Razorpay, Stripe, PayU, etc.)
3. **SSL Certificate**: Your website must be served over HTTPS
4. **Domain Verification**: Your domain must be verified with Google

## Setup Steps

### 1. Environment Configuration

Create a `.env` file in your project root with the following variables:

```env
# Google Pay Configuration
REACT_APP_GOOGLE_PAY_ENVIRONMENT=TEST
REACT_APP_GOOGLE_PAY_MERCHANT_ID=your_google_pay_merchant_id_here
REACT_APP_PAYMENT_GATEWAY=your_payment_gateway_name
REACT_APP_GATEWAY_MERCHANT_ID=your_gateway_merchant_id
REACT_APP_MERCHANT_NAME=SM Chit Fund

# API Configuration
REACT_APP_API_URL=http://localhost:3000/api
```

### 2. Google Pay Business Setup

1. **Register for Google Pay for Business**:
   - Go to [Google Pay Business Console](https://pay.google.com/business/console)
   - Complete the registration process
   - Get your Merchant ID

2. **Domain Verification**:
   - Add your domain to Google Pay Business Console
   - Verify domain ownership
   - Configure allowed domains for payment requests

3. **Integration Settings**:
   - Set up your payment gateway integration
   - Configure webhook URLs for payment notifications
   - Set up merchant information

### 3. Payment Gateway Configuration

#### For Razorpay:
```env
REACT_APP_PAYMENT_GATEWAY=razorpay
REACT_APP_GATEWAY_MERCHANT_ID=your_razorpay_merchant_id
```

#### For Stripe:
```env
REACT_APP_PAYMENT_GATEWAY=stripe
REACT_APP_GATEWAY_MERCHANT_ID=your_stripe_merchant_id
```

#### For PayU:
```env
REACT_APP_PAYMENT_GATEWAY=payu
REACT_APP_GATEWAY_MERCHANT_ID=your_payu_merchant_id
```

### 4. Backend API Setup

1. **Install Dependencies** (for Node.js backend):
```bash
npm install express cors helmet morgan
```

2. **Create Payment Endpoint**:
   - Copy the sample backend code from `backend-example/google-pay-api.js`
   - Adapt it to your backend framework
   - Implement your payment gateway integration

3. **Database Schema**:
```sql
CREATE TABLE transactions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  transaction_id VARCHAR(100) UNIQUE NOT NULL,
  order_id VARCHAR(100) NOT NULL,
  user_id BIGINT NOT NULL,
  chit_id VARCHAR(50) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'INR',
  payment_method VARCHAR(50) NOT NULL,
  payment_status ENUM('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED') NOT NULL,
  weeks JSON,
  gateway_response JSON,
  google_pay_token TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_user_chit (user_id, chit_id),
  INDEX idx_transaction_id (transaction_id),
  INDEX idx_status (payment_status)
);
```

### 5. Frontend Integration

The Google Pay integration is already implemented in your React app with the following components:

1. **GooglePayButton.tsx**: Main Google Pay button component
2. **PaymentMethods.tsx**: Updated to include Google Pay option
3. **pay.tsx**: Updated with Google Pay handlers
4. **GooglePayService.ts**: Service for Google Pay API calls

### 6. Testing

#### Test Mode Setup:
1. Set `REACT_APP_GOOGLE_PAY_ENVIRONMENT=TEST`
2. Use test merchant ID provided by Google
3. Use test payment gateway credentials

#### Test Cards:
Google Pay test environment supports various test cards:
- Visa: 4111111111111111
- Mastercard: 5555555555554444
- American Express: 378282246310005

### 7. Production Deployment

#### Before going live:
1. **Change Environment**:
   ```env
   REACT_APP_GOOGLE_PAY_ENVIRONMENT=PRODUCTION
   ```

2. **Update Merchant IDs**:
   - Use production Google Pay Merchant ID
   - Use production payment gateway credentials

3. **SSL Certificate**:
   - Ensure your website has a valid SSL certificate
   - Google Pay only works on HTTPS

4. **Domain Verification**:
   - Verify your production domain with Google
   - Update allowed domains in Google Pay Business Console

5. **Testing**:
   - Test with small amounts first
   - Verify webhook handling
   - Test refund functionality

### 8. Security Considerations

1. **Token Validation**: Always validate Google Pay tokens on your backend
2. **Amount Verification**: Verify payment amounts match your records
3. **Idempotency**: Implement idempotent payment processing
4. **Webhook Security**: Verify webhook signatures from your payment gateway
5. **PCI Compliance**: Ensure your system meets PCI DSS requirements

### 9. Error Handling

The integration includes comprehensive error handling for:
- Network failures
- Payment gateway errors
- Google Pay API errors
- User cancellation
- Invalid configurations

### 10. Monitoring and Logging

Implement monitoring for:
- Payment success/failure rates
- Transaction processing times
- Error frequencies
- User experience metrics

## Troubleshooting

### Common Issues:

1. **Google Pay button not showing**:
   - Check if Google Pay script is loaded
   - Verify merchant ID configuration
   - Ensure HTTPS is enabled

2. **Payment fails**:
   - Check payment gateway configuration
   - Verify token validation on backend
   - Check network connectivity

3. **Domain verification issues**:
   - Ensure domain is added to Google Pay Business Console
   - Verify domain ownership
   - Check DNS configuration

### Support

For technical support:
1. Check Google Pay Business Console documentation
2. Contact your payment gateway support
3. Review browser console for JavaScript errors
4. Check backend logs for API errors

## Additional Resources

- [Google Pay Web Developer Documentation](https://developers.google.com/pay/api/web)
- [Google Pay Business Console](https://pay.google.com/business/console)
- [Payment Gateway Documentation](https://razorpay.com/docs/) (example for Razorpay)

## License

This integration is part of the SM Chit Fund application and follows the same license terms.