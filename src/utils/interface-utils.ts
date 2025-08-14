import { PaperProps } from "@mui/material";

export interface ChitItem {
    chit_id?: string;
    user_id?: string;
    chit_no: string;
    amount: string | number;
    description?: string;
    name?: string;
}
export interface ChitListItem {
    user_id: number;
    chit_no: number;
    amount: number;
    chit_id?: string;
}

export interface PaypanelChange {
    chitId: string;
    chitNo: string;
    baseAmount: number;
    payAmount: number;
    weekSelection: number;
}
export interface PaymentData {
    chitId: string;
    baseAmount: number;
    payAmount: number;
    weekSelection: number;
}

// Payment method type
export type PaymentMethod = 'credit_card' | 'debit_card' | 'upi' | 'net_banking' | 'wallet' | 'google_pay';
export interface PaymentFormData {
  amount: number;
  paymentMethod: PaymentMethod;
  cardNumber?: string;
  cardName?: string;
  expiryDate?: string;
  cvv?: string;
  upiId?: string;
  googlePayToken?: string;
  paymentMethodData?: any;
  orderId?: string;
}

export interface CellData {
    week: number;
    is_paid: 'Y' | 'N';
    updated_at?: string;
}

export interface CellProps extends PaperProps {
    selected?: boolean;
    disabled?: boolean;
    paid?: boolean;
  }

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
    transaction_id: string; // Required transaction ID
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