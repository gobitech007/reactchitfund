import { ApiService } from './api.service';

export interface GooglePayPaymentRequest {
  googlePayToken: string;
  amount: number;
  currency: string;
  chitId: string;
  weeks: number[];
  userId: string;
  orderId: string;
  paymentMethodData?: any;
}

export interface GooglePayPaymentResponse {
  success: boolean;
  transactionId?: string;
  orderId?: string;
  error?: string;
  message?: string;
  gatewayResponse?: any;
}

export interface TransactionRecord {
  id?: number;
  transactionId: string;
  orderId: string;
  userId: string;
  chitId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  paymentStatus: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
  weeks: number[];
  googlePayToken?: string;
  gatewayResponse?: any;
  createdAt?: Date;
  updatedAt?: Date;
}

class GooglePayService {
  private static instance: GooglePayService;

  private constructor() {
    // ApiService is a plain object, not a class with getInstance()
  }

  public static getInstance(): GooglePayService {
    if (!GooglePayService.instance) {
      GooglePayService.instance = new GooglePayService();
    }
    return GooglePayService.instance;
  }

  /**
   * Process Google Pay payment
   */
  async processPayment(paymentRequest: GooglePayPaymentRequest): Promise<GooglePayPaymentResponse> {
    try {
      const response = await ApiService.post('/payments/google-pay', paymentRequest);
      if (response.error) {
        return {
          success: false,
          error: response.error
        };
      }
      return response.data;
    } catch (error: any) {
      console.error('Google Pay payment processing error:', error);
      return {
        success: false,
        error: error.message || 'Payment processing failed'
      };
    }
  }

  /**
   * Verify Google Pay token (client-side validation)
   */
  validateGooglePayToken(token: string): boolean {
    try {
      // Basic validation - check if token exists and is not empty
      if (!token || typeof token !== 'string' || token.trim().length === 0) {
        return false;
      }

      // Additional validation can be added here
      // For production, you should validate the token structure and signature
      return true;
    } catch (error) {
      console.error('Google Pay token validation error:', error);
      return false;
    }
  }

  /**
   * Get transaction status
   */
  async getTransactionStatus(transactionId: string): Promise<any> {
    try {
      const response = await ApiService.get(`/payments/transaction/${transactionId}`);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    } catch (error: any) {
      console.error('Error fetching transaction status:', error);
      throw new Error(error.message || 'Failed to fetch transaction status');
    }
  }

  /**
   * Get user's payment history
   */
  async getPaymentHistory(userId: string, chitId?: string): Promise<TransactionRecord[]> {
    try {
      const params = chitId ? { chitId } : undefined;
      const response = await ApiService.get(`/payments/history/${userId}`, params);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    } catch (error: any) {
      console.error('Error fetching payment history:', error);
      throw new Error(error.message || 'Failed to fetch payment history');
    }
  }

  /**
   * Refund a Google Pay transaction
   */
  async refundTransaction(transactionId: string, amount?: number, reason?: string): Promise<GooglePayPaymentResponse> {
    try {
      const refundRequest = {
        transactionId,
        amount,
        reason
      };
      
      const response = await ApiService.post('/payments/refund', refundRequest);
      if (response.error) {
        return {
          success: false,
          error: response.error
        };
      }
      return response.data;
    } catch (error: any) {
      console.error('Google Pay refund error:', error);
      return {
        success: false,
        error: error.message || 'Refund processing failed'
      };
    }
  }

  /**
   * Generate order ID for Google Pay transaction
   */
  generateOrderId(chitId: string, userId: string): string {
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 9000) + 1000;
    return `GPAY_${chitId}_${userId}_${timestamp}_${randomNum}`;
  }

  /**
   * Format amount for Google Pay (convert rupees to paise)
   */
  formatAmountForGooglePay(amountInRupees: number): number {
    return Math.round(amountInRupees * 100);
  }

  /**
   * Format amount from Google Pay (convert paise to rupees)
   */
  formatAmountFromGooglePay(amountInPaise: number): number {
    return amountInPaise / 100;
  }

  /**
   * Validate payment amount
   */
  validatePaymentAmount(amount: number, minAmount: number = 1): boolean {
    return amount >= minAmount && amount <= 1000000; // Max 10 lakh rupees
  }

  /**
   * Get supported payment methods for Google Pay
   */
  getSupportedPaymentMethods(): any {
    return {
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
  }

  /**
   * Create payment data request for Google Pay
   */
  createPaymentDataRequest(
    amount: number,
    currency: string,
    merchantInfo: { merchantId: string; merchantName: string },
    transactionId: string
  ): any {
    return {
      apiVersion: 2,
      apiVersionMinor: 0,
      allowedPaymentMethods: this.getSupportedPaymentMethods().allowedPaymentMethods,
      merchantInfo,
      transactionInfo: {
        totalPriceStatus: 'FINAL',
        totalPrice: (amount / 100).toFixed(2), // Convert paise to rupees
        currencyCode: currency,
        countryCode: 'IN',
        transactionId
      }
    };
  }
}

export default GooglePayService;