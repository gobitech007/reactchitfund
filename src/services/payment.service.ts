/**
 * Payment Service
 * Handles payment processing and transaction management
 */

import { Transaction, SavedPaymentMethod, PaymentStatus, PaymentMethod, CardDetails, ChitItem, ChitListItem, CellData } from '../utils/interface-utils';
import ApiService, { ApiResponse } from './api.service';

/**
 * Payment Service interface
 * Defines the shape of the PaymentService object
 */
export interface IPaymentService {
  processPayment: (paymentData: PaymentRequest | any) => Promise<ApiResponse<Transaction>>;
  getTransactionHistory: (page?: number, limit?: number) => Promise<ApiResponse<{ transactions: Transaction[], total: number }>>;
  getTransactionById: (transactionId: string) => Promise<ApiResponse<Transaction>>;
  getPaymentsByTransactionId: (transactionId: string) => Promise<ApiResponse<Transaction[]>>;
  getSavedPaymentMethods: () => Promise<ApiResponse<SavedPaymentMethod[]>>;
  savePaymentMethod: (paymentMethod: Partial<SavedPaymentMethod>) => Promise<ApiResponse<SavedPaymentMethod>>;
  deletePaymentMethod: (paymentMethodId: string) => Promise<ApiResponse<any>>;
  setDefaultPaymentMethod: (paymentMethodId: string) => Promise<ApiResponse<any>>;
  generateReceipt: (transactionId: string) => Promise<ApiResponse<any>>;
  requestRefund: (transactionId: string, reason: string) => Promise<ApiResponse<any>>;
  checkPaymentStatus: (transactionId: string) => Promise<ApiResponse<{ status: PaymentStatus }>>;
  getAvailablePaymentMethods: () => Promise<ApiResponse<{ methods: PaymentMethod[] }>>;
  validateCardDetails: (cardDetails: CardDetails) => { isValid: boolean; errors: Record<string, string> };
  validateUpiId: (upiId: string) => { isValid: boolean; error?: string };
  getChitUsers: (user_id: string) => Promise<ApiResponse<{ status: PaymentStatus }>>;
  getChitPaymentDetails: (chit_id: string) => Promise<ApiResponse<CellData[]>>;
  getTransactionHistoryPage: (params: { skip?: number, limit?: number }) => Promise<ApiResponse<any>>;
  createChitUsers: (chitUsers: Partial<ChitListItem>) => Promise<ApiResponse<ChitListItem>>;
}

/**
 * Payment Service
 * Provides methods for payment processing and transaction management
 */
export const PaymentService: IPaymentService = {
  /**
   * Process a payment
   * @param paymentData - Payment request data (can be either PaymentRequest or backend format)
   * @returns Promise with payment response
   */
  processPayment: async (paymentData: PaymentRequest | any) => {
    return await ApiService.post<Transaction>('/payments/process/', paymentData);
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
   * Get payments by transaction ID
   * @param transactionId - Transaction ID
   * @returns Promise with payments for the transaction
   */
  getPaymentsByTransactionId: async (transactionId: string) => {
    return await ApiService.get<Transaction[]>(`/payments/transaction/${transactionId}`);
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
  },

  /**Chit user Details */
  getChitUsers: async (user_id: string) => {
    if (!user_id) {
      throw new Error('User ID is required');
    }
    return await ApiService.get<{ status: PaymentStatus }>(`/payments/chits/user/${user_id}`);
  },
  createChitUsers: async (chitUsers: Partial<ChitListItem>) => {
    if (!chitUsers.user_id) {
      throw new Error('User ID are required');
    }
    // Send the chitUsers object directly, not wrapped in another object
    return await ApiService.post<ChitListItem>(`/payments/chit_users/`, chitUsers);
  },
  
  /**Get chit payment details by chit_id */
  getChitPaymentDetails: async (chit_id: string) => {
    if (!chit_id) {
      throw new Error('Chit ID is required');
    }
    return await ApiService.get<CellData[]>(`/payments/chit_users/${chit_id}/pay_details/`);
  },
  getTransactionHistoryPage: async(params: { skip?: number, limit?: number }) => {
      // Convert numeric parameters to strings as required by ApiService
      const stringParams: Record<string, string> = {};
      if (params.skip !== undefined) stringParams.skip = params.skip.toString();
      if (params.limit !== undefined) stringParams.limit = params.limit.toString();      
      return await ApiService.get('/payments/transaction-history/', stringParams);
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