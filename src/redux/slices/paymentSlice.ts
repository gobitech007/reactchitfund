import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { PaymentService } from '../../services';
import { Transaction, SavedPaymentMethod, PaymentMethod, ChitListItem } from '../../utils/interface-utils';

interface PaymentState {
  transactions: Transaction[];
  currentTransaction: Transaction | null;
  savedPaymentMethods: SavedPaymentMethod[];
  availablePaymentMethods: PaymentMethod[];
  chitPaymentDetails: { week: number; is_paid: 'Y' | 'N' }[];
  loading: boolean;
  error: string | null;
  totalTransactions: number;
}

const initialState: PaymentState = {
  transactions: [],
  currentTransaction: null,
  savedPaymentMethods: [],
  availablePaymentMethods: [],
  chitPaymentDetails: [],
  loading: false,
  error: null,
  totalTransactions: 0,
};

// Async thunks
export const processPayment = createAsyncThunk(
  'payment/processPayment',
  async (paymentData: any, { rejectWithValue }) => {
    try {
      const response = await PaymentService.processPayment(paymentData);
      
      if (response.error) {
        return rejectWithValue(response.error);
      }
      
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Payment processing failed');
    }
  }
);

export const fetchTransactionHistory = createAsyncThunk(
  'payment/fetchTransactionHistory',
  async ({ page = 1, limit = 10 }: { page?: number; limit?: number }, { rejectWithValue }) => {
    try {
      const response = await PaymentService.getTransactionHistory(page, limit);
      
      if (response.error) {
        return rejectWithValue(response.error);
      }
      
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch transaction history');
    }
  }
);

export const fetchTransactionById = createAsyncThunk(
  'payment/fetchTransactionById',
  async (transactionId: string, { rejectWithValue }) => {
    try {
      const response = await PaymentService.getTransactionById(transactionId);
      
      if (response.error) {
        return rejectWithValue(response.error);
      }
      
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch transaction');
    }
  }
);

export const fetchSavedPaymentMethods = createAsyncThunk(
  'payment/fetchSavedPaymentMethods',
  async (_, { rejectWithValue }) => {
    try {
      const response = await PaymentService.getSavedPaymentMethods();
      
      if (response.error) {
        return rejectWithValue(response.error);
      }
      
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch payment methods');
    }
  }
);

export const savePaymentMethod = createAsyncThunk(
  'payment/savePaymentMethod',
  async (paymentMethod: Partial<SavedPaymentMethod>, { rejectWithValue }) => {
    try {
      const response = await PaymentService.savePaymentMethod(paymentMethod);
      
      if (response.error) {
        return rejectWithValue(response.error);
      }
      
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to save payment method');
    }
  }
);

export const deletePaymentMethod = createAsyncThunk(
  'payment/deletePaymentMethod',
  async (paymentMethodId: string, { rejectWithValue }) => {
    try {
      const response = await PaymentService.deletePaymentMethod(paymentMethodId);
      
      if (response.error) {
        return rejectWithValue(response.error);
      }
      
      return paymentMethodId;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to delete payment method');
    }
  }
);

export const fetchAvailablePaymentMethods = createAsyncThunk(
  'payment/fetchAvailablePaymentMethods',
  async (_, { rejectWithValue }) => {
    try {
      const response = await PaymentService.getAvailablePaymentMethods();
      
      if (response.error) {
        return rejectWithValue(response.error);
      }
      
      return response.data?.methods || [];
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch available payment methods');
    }
  }
);

export const fetchChitPaymentDetails = createAsyncThunk(
  'payment/fetchChitPaymentDetails',
  async (chitId: string, { rejectWithValue }) => {
    try {
      const response = await PaymentService.getChitPaymentDetails(chitId);
      
      if (response.error) {
        return rejectWithValue(response.error);
      }
      
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch chit payment details');
    }
  }
);

export const createChitUser = createAsyncThunk(
  'payment/createChitUser',
  async (chitUser: Partial<ChitListItem>, { rejectWithValue }) => {
    try {
      const response = await PaymentService.createChitUsers(chitUser);
      
      if (response.error) {
        return rejectWithValue(response.error);
      }
      
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to create chit user');
    }
  }
);

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    clearPaymentError: (state) => {
      state.error = null;
    },
    resetCurrentTransaction: (state) => {
      state.currentTransaction = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Process payment
      .addCase(processPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(processPayment.fulfilled, (state, action: PayloadAction<Transaction | null>) => {
        state.loading = false;
        state.currentTransaction = action.payload;
      })
      .addCase(processPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch transaction history
      .addCase(fetchTransactionHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactionHistory.fulfilled, (state, action: PayloadAction<{ transactions: Transaction[], total: number } | null>) => {
        state.loading = false;
        if (action.payload) {
          state.transactions = action.payload.transactions;
          state.totalTransactions = action.payload.total;
        } else {
          state.transactions = [];
          state.totalTransactions = 0;
        }
      })
      .addCase(fetchTransactionHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch transaction by ID
      .addCase(fetchTransactionById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactionById.fulfilled, (state, action: PayloadAction<Transaction | null>) => {
        state.loading = false;
        state.currentTransaction = action.payload;
      })
      .addCase(fetchTransactionById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch saved payment methods
      .addCase(fetchSavedPaymentMethods.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSavedPaymentMethods.fulfilled, (state, action: PayloadAction<SavedPaymentMethod[] | null>) => {
        state.loading = false;
        if (action.payload) {
          state.savedPaymentMethods = action.payload;
        } else {
          state.savedPaymentMethods = [];
        }
      })
      .addCase(fetchSavedPaymentMethods.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Save payment method
      .addCase(savePaymentMethod.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(savePaymentMethod.fulfilled, (state, action: PayloadAction<SavedPaymentMethod | null>) => {
        state.loading = false;
        if(action.payload) {
          state.savedPaymentMethods.push(action.payload);
        } else {
            console.log("No payload received");
        }
      })
      .addCase(savePaymentMethod.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Delete payment method
      .addCase(deletePaymentMethod.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePaymentMethod.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.savedPaymentMethods = state.savedPaymentMethods.filter(
          method => method.id !== action.payload
        );
      })
      .addCase(deletePaymentMethod.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch available payment methods
      .addCase(fetchAvailablePaymentMethods.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAvailablePaymentMethods.fulfilled, (state, action: PayloadAction<PaymentMethod[]>) => {
        state.loading = false;
        state.availablePaymentMethods = action.payload || [];
      })
      .addCase(fetchAvailablePaymentMethods.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch chit payment details
      .addCase(fetchChitPaymentDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChitPaymentDetails.fulfilled, (state, action: PayloadAction<{ week: number; is_paid: 'Y' | 'N' }[] | null>) => {
        state.loading = false;
        if (action.payload) {
          state.chitPaymentDetails = action.payload;
        } else {
          state.chitPaymentDetails = [];
        }
      })
      .addCase(fetchChitPaymentDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearPaymentError, resetCurrentTransaction } = paymentSlice.actions;
export default paymentSlice.reducer;