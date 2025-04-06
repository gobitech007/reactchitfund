/**
 * Payment Service
 * Handles payment processing and transaction management
 */

import ApiService from './api.service';

// Payment method types
export type PaymentMethod = 'credit_card' | 'debit_card' | 'upi' | 'net_banking' | 'wallet';

// Payment status types
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';

// Card details interface
export interface CardDetails {
  cardNumber: string;
  cardName: string;
  expiryDate: string;
  cvv: string;
}

// UPI details interface
export interface UpiDetails {
  upiId: string;
}

// Payment request interface
export interface PaymentRequest {
  amount: number;
  paymentMethod: PaymentMethod;
  description?: string;
  selectedWeeks?: number[];
  cardDetails?: CardDetails;
  upiDetails?: UpiDetails;
  savePaymentMethod?: boolean;
}

// Transaction interface
export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  description?: string;
  selectedWeeks?: number[];
  transactionId?: string;
  createdAt: string;
  updatedAt: string;
}

// Saved payment method interface
export interface SavedPaymentMethod {
  id: string;
  userId: string;
  type: PaymentMethod;
  lastFour?: string;
  expiryDate?: string;
  cardName?: string;
  upiId?: string;
  isDefault: boolean;
  createdAt: string;
}

/**
 * Payment Service
 * Provides methods for payment processing and transaction management
 */
export const PaymentService = {
  /**
   * Process a payment
   * @param paymentData - Payment request data
   * @returns Promise with payment response
   */
  processPayment: async (paymentData: PaymentRequest) => {
    return await ApiService.post<Transaction>('/payments/process', paymentData);
  },

  /**
   * Get user's transaction history
   * @param page - Page number for pagination
   * @param limit - Number of items per page
   * @returns Promise with transaction history
   */
  getTransactionHistory: async (page: number = 1, limit: number = 10) => {
    return await ApiService.get<{ transactions: Transaction[], total: number }>('/payments/transactions', {
      page: page.toString(),
      limit: limit.toString()
    });
  },

  /**
   * Get transaction details by ID
   * @param transactionId - Transaction ID
   * @returns Promise with transaction details
   */
  getTransactionById: async (transactionId: string) => {
    return await ApiService.get<Transaction>(`/payments/transactions/${transactionId}`);
  },

  /**
   * Get user's saved payment methods
   * @returns Promise with saved payment methods
   */
  getSavedPaymentMethods: async () => {
    return await ApiService.get<SavedPaymentMethod[]>('/payments/methods');
  },

  /**
   * Save a payment method for future use
   * @param paymentMethod - Payment method details
   * @returns Promise with saved payment method
   */
  savePaymentMethod: async (paymentMethod: Partial<SavedPaymentMethod>) => {
    return await ApiService.post<SavedPaymentMethod>('/payments/methods', paymentMethod);
  },

  /**
   * Delete a saved payment method
   * @param paymentMethodId - Payment method ID
   * @returns Promise with deletion response
   */
  deletePaymentMethod: async (paymentMethodId: string) => {
    return await ApiService.delete(`/payments/methods/${paymentMethodId}`);
  },

  /**
   * Set a payment method as default
   * @param paymentMethodId - Payment method ID
   * @returns Promise with update response
   */
  setDefaultPaymentMethod: async (paymentMethodId: string) => {
    return await ApiService.put(`/payments/methods/${paymentMethodId}/default`);
  },

  /**
   * Generate payment receipt
   * @param transactionId - Transaction ID
   * @returns Promise with receipt data
   */
  generateReceipt: async (transactionId: string) => {
    return await ApiService.get(`/payments/transactions/${transactionId}/receipt`);
  },

  /**
   * Request a refund
   * @param transactionId - Transaction ID
   * @param reason - Refund reason
   * @returns Promise with refund response
   */
  requestRefund: async (transactionId: string, reason: string) => {
    return await ApiService.post(`/payments/transactions/${transactionId}/refund`, { reason });
  },

  /**
   * Check payment status
   * @param transactionId - Transaction ID
   * @returns Promise with payment status
   */
  checkPaymentStatus: async (transactionId: string) => {
    return await ApiService.get<{ status: PaymentStatus }>(`/payments/status/${transactionId}`);
  },

  /**
   * Get available payment methods
   * @returns Promise with available payment methods
   */
  getAvailablePaymentMethods: async () => {
    return await ApiService.get<{ methods: PaymentMethod[] }>('/payments/available-methods');
  },

  /**
   * Validate card details (client-side validation)
   * @param cardDetails - Card details to validate
   * @returns Validation result
   */
  validateCardDetails: (cardDetails: CardDetails): { isValid: boolean; errors: Record<string, string> } => {
    const errors: Record<string, string> = {};
    
    // Remove spaces and dashes from card number
    const cardNumber = cardDetails.cardNumber.replace(/[\s-]/g, '');
    
    // Validate card number (simple Luhn algorithm check)
    if (!/^\d{13,19}$/.test(cardNumber) || !isValidLuhn(cardNumber)) {
      errors.cardNumber = 'Invalid card number';
    }
    
    // Validate card name
    if (!cardDetails.cardName || cardDetails.cardName.trim().length < 3) {
      errors.cardName = 'Card name is required';
    }
    
    // Validate expiry date (MM/YY format)
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(cardDetails.expiryDate)) {
      errors.expiryDate = 'Invalid expiry date format (MM/YY)';
    } else {
      // Check if card is expired
      const [month, year] = cardDetails.expiryDate.split('/');
      const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1, 1);
      const today = new Date();
      
      if (expiryDate < today) {
        errors.expiryDate = 'Card has expired';
      }
    }
    
    // Validate CVV (3-4 digits)
    if (!/^\d{3,4}$/.test(cardDetails.cvv)) {
      errors.cvv = 'Invalid CVV';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  /**
   * Validate UPI ID (client-side validation)
   * @param upiId - UPI ID to validate
   * @returns Validation result
   */
  validateUpiId: (upiId: string): { isValid: boolean; error?: string } => {
    // UPI ID format: username@provider
    const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/;
    
    if (!upiRegex.test(upiId)) {
      return {
        isValid: false,
        error: 'Invalid UPI ID format (should be username@provider)'
      };
    }
    
    return { isValid: true };
  }
};

/**
 * Luhn algorithm for credit card validation
 * @param cardNumber - Card number to validate
 * @returns Boolean indicating if card number is valid
 */
function isValidLuhn(cardNumber: string): boolean {
  let sum = 0;
  let shouldDouble = false;
  
  // Loop through values starting from the rightmost digit
  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cardNumber.charAt(i));
    
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  
  return sum % 10 === 0;
}

export default PaymentService;