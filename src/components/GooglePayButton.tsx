import React, { useEffect, useState } from 'react';
import { Button, CircularProgress, Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

// Extend Window interface to include Google Pay API
declare global {
  interface Window {
    google?: {
      payments: {
        api: {
          PaymentsClient: new (config: any) => any;
        };
      };
    };
  }
}

interface GooglePayButtonProps {
  amount: number;
  currency: string;
  chitId: string;
  weeks: number[];
  userId: string;
  onPaymentSuccess: (paymentData: any) => void;
  onPaymentError: (error: any) => void;
  disabled?: boolean;
}

const GooglePayButton: React.FC<GooglePayButtonProps> = ({
  amount,
  currency,
  chitId,
  weeks,
  userId,
  onPaymentSuccess,
  onPaymentError,
  disabled = false
}) => {
  const { t } = useTranslation();
  const [isGooglePayReady, setIsGooglePayReady] = useState(false);
  const [paymentsClient, setPaymentsClient] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadGooglePayScript = () => {
      return new Promise<void>((resolve, reject) => {
        if (window.google && window.google.payments) {
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://pay.google.com/gp/p/js/pay.js';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Google Pay script'));
        document.head.appendChild(script);
      });
    };

    const initializeGooglePay = async () => {
      try {
        await loadGooglePayScript();
        
        if (window.google && window.google.payments) {
          const client = new window.google.payments.api.PaymentsClient({
            environment: process.env.REACT_APP_GOOGLE_PAY_ENVIRONMENT || 'TEST'
          });

          const isReadyToPayRequest = {
            apiVersion: 2,
            apiVersionMinor: 0,
            allowedPaymentMethods: [{
              type: 'CARD',
              parameters: {
                allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
                allowedCardNetworks: ['MASTERCARD', 'VISA', 'AMEX', 'DISCOVER']
              }
            }]
          };

          const isReadyToPay = await client.isReadyToPay(isReadyToPayRequest);

          if (isReadyToPay.result) {
            setIsGooglePayReady(true);
            setPaymentsClient(client);
          }
        }
      } catch (error) {
        console.error('Google Pay initialization error:', error);
        onPaymentError({
          message: 'Failed to initialize Google Pay',
          error: error
        });
      }
    };

    initializeGooglePay();
  }, [onPaymentError]);

  const generateOrderId = () => {
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 9000) + 1000;
    return `ORDER_${chitId}_${timestamp}_${randomNum}`;
  };

  const handleGooglePayClick = async () => {
    if (!paymentsClient || disabled) return;

    setIsLoading(true);
    const orderId = generateOrderId();

    const paymentDataRequest = {
      apiVersion: 2,
      apiVersionMinor: 0,
      allowedPaymentMethods: [{
        type: 'CARD',
        parameters: {
          allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
          allowedCardNetworks: ['MASTERCARD', 'VISA', 'AMEX', 'DISCOVER']
        },
        tokenizationSpecification: {
          type: 'PAYMENT_GATEWAY',
          parameters: {
            gateway: process.env.REACT_APP_PAYMENT_GATEWAY || '3388000000022966632',
            
            gatewayMerchantId: process.env.REACT_APP_GATEWAY_MERCHANT_ID || '3388000000022966632'
          }
        }
      }],
      merchantInfo: {
        merchantId: process.env.REACT_APP_GOOGLE_PAY_MERCHANT_ID || 'BCR2DN7T5DKJDGQS',
        merchantName: process.env.REACT_APP_MERCHANT_NAME || 'SM Chit Fund'
      },
      transactionInfo: {
        totalPriceStatus: 'FINAL',
        totalPrice: (amount / 100).toFixed(2), // Convert paise to rupees
        currencyCode: currency,
        countryCode: 'IN',
        transactionId: orderId
      },
      callbackIntents: ['PAYMENT_AUTHORIZATION']
    };

    try {
      const paymentData = await paymentsClient.loadPaymentData(paymentDataRequest);
      
      // Prepare payment data for backend processing
      const processedPaymentData = {
        googlePayToken: paymentData.paymentMethodData.tokenizationData.token,
        amount: amount,
        currency: currency,
        chitId: chitId,
        weeks: weeks,
        userId: userId,
        orderId: orderId,
        paymentMethodData: paymentData,
        transactionInfo: paymentDataRequest.transactionInfo
      };

      onPaymentSuccess(processedPaymentData);
    } catch (error: any) {
      console.error('Google Pay payment error:', error);
      
      let errorMessage = t('pay.paymentFailed', { error: 'Unknown error' });
      
      if (error.statusCode === 'CANCELED') {
        errorMessage = t('pay.paymentCancelled');
      } else if (error.statusCode === 'DEVELOPER_ERROR') {
        errorMessage = t('pay.paymentConfigurationError');
      }
      
      onPaymentError({
        message: errorMessage,
        error: error,
        statusCode: error.statusCode
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isGooglePayReady) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2 }}>
        <CircularProgress size={20} />
        <Typography variant="body2" color="textSecondary">
          {t('pay.loadingGooglePay')}
        </Typography>
      </Box>
    );
  }

  return (
    <Button
      variant="contained"
      onClick={handleGooglePayClick}
      disabled={disabled || isLoading}
      startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
      sx={{
        backgroundColor: '#4285f4',
        color: 'white',
        minHeight: 48,
        borderRadius: 2,
        textTransform: 'none',
        fontSize: '16px',
        fontWeight: 500,
        '&:hover': {
          backgroundColor: '#3367d6'
        },
        '&:disabled': {
          backgroundColor: '#cccccc'
        }
      }}
      fullWidth
    >
      {isLoading ? t('pay.processing') : t('pay.payWithGooglePay')}
    </Button>
  );
};

export default GooglePayButton;