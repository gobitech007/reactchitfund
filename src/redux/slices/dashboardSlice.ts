import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import { DashboardService } from '../../services';

// Mock transaction data (similar to what's in dashboard.js)
const mockTransactions = [
  {
    id: 'TXN-001-2023',
    date: new Date(2023, 6, 15),
    amount: 5000,
    mobileNumber: '9876543210',
    status: 'completed'
  },
  {
    id: 'TXN-002-2023',
    date: new Date(2023, 6, 18),
    amount: 2500,
    mobileNumber: '8765432109',
    status: 'completed'
  },
  {
    id: 'TXN-003-2023',
    date: new Date(2023, 6, 20),
    amount: 7500,
    mobileNumber: '7654321098',
    status: 'pending'
  },
  {
    id: 'TXN-004-2023',
    date: new Date(2023, 6, 22),
    amount: 3000,
    mobileNumber: '6543210987',
    status: 'failed'
  },
  {
    id: 'TXN-005-2023',
    date: new Date(2023, 6, 25),
    amount: 10000,
    mobileNumber: '5432109876',
    status: 'completed'
  },
  {
    id: 'TXN-006-2023',
    date: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()),
    amount: 4500,
    mobileNumber: '4321098765',
    status: 'pending'
  },
  {
    id: 'TXN-007-2023',
    date: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()),
    amount: 8000,
    mobileNumber: '3210987654',
    status: 'completed'
  },
  {
    id: 'TXN-008-2023',
    date: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - 1),
    amount: 6000,
    mobileNumber: '2109876543',
    status: 'failed'
  },
  {
    id: 'TXN-009-2023',
    date: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - 2),
    amount: 12000,
    mobileNumber: '1098765432',
    status: 'completed'
  },
  {
    id: 'TXN-010-2023',
    date: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - 3),
    amount: 9000,
    mobileNumber: '0987654321',
    status: 'pending'
  },
];

// Mock user data
const mockUsers = [
  { id: 1, name: 'John Doe', registrationDate: new Date(2023, 0, 15) },
  { id: 2, name: 'Jane Smith', registrationDate: new Date(2023, 1, 20) },
  { id: 3, name: 'Robert Johnson', registrationDate: new Date(2023, 2, 10) },
  { id: 4, name: 'Emily Davis', registrationDate: new Date(2023, 3, 5) },
  { id: 5, name: 'Michael Wilson', registrationDate: new Date(2023, 4, 25) },
  { id: 6, name: 'Sarah Brown', registrationDate: new Date(2023, 5, 12) },
  { id: 7, name: 'David Miller', registrationDate: new Date(2023, 6, 8) },
  { id: 8, name: 'Jennifer Taylor', registrationDate: new Date(2023, 7, 17) },
  { id: 9, name: 'James Anderson', registrationDate: new Date(2023, 8, 22) },
  { id: 10, name: 'Patricia Thomas', registrationDate: new Date(2023, 9, 30) },
  { id: 11, name: 'Richard Jackson', registrationDate: new Date(2023, 10, 14) },
  { id: 12, name: 'Linda White', registrationDate: new Date(2023, 11, 3) },
  { id: 13, name: 'Charles Harris', registrationDate: new Date(2024, 0, 9) },
  { id: 14, name: 'Susan Martin', registrationDate: new Date(2024, 1, 27) },
  { id: 15, name: 'Joseph Thompson', registrationDate: new Date(2024, 2, 18) },
  { id: 16, name: 'Margaret Garcia', registrationDate: new Date(2024, 3, 7) },
  { id: 17, name: 'Thomas Martinez', registrationDate: new Date(2024, 4, 21) },
  { id: 18, name: 'Dorothy Robinson', registrationDate: new Date(2024, 5, 11) },
  { id: 19, name: 'Daniel Clark', registrationDate: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - 1) },
  { id: 20, name: 'Lisa Rodriguez', registrationDate: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()) },
];

interface DashboardData {
  registeredUsers: number;
  todayTransactions: number;
  monthlyTransactions: number;
  totalTransactionAmount: number;
}

interface DashboardState {
  data: DashboardData;
  loading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  data: {
    registeredUsers: 0,
    todayTransactions: 0,
    monthlyTransactions: 0,
    totalTransactionAmount: 0
  },
  loading: false,
  error: null
};

// Async thunk to fetch dashboard data
export const fetchDashboardData = createAsyncThunk(
  'dashboard/fetchData',
  async (_, { rejectWithValue }) => {
    try {
      // Try to use the DashboardService if it exists
      // if (typeof DashboardService !== 'undefined' && DashboardService.getDashboardData) {
      //   const response = await DashboardService.getDashboardData();
        
      //   if (response.error) {
      //     return rejectWithValue(response.error);
      //   }
        
      //   return response.data;
      // }
      
      // Otherwise, use mock data
      // Calculate statistics
      const totalUsers = mockUsers.length;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayTransactions = mockTransactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        transactionDate.setHours(0, 0, 0, 0);
        return transactionDate.getTime() === today.getTime();
      }).length;

      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();

      const monthlyTransactions = mockTransactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return transactionDate.getMonth() === currentMonth &&
               transactionDate.getFullYear() === currentYear;
      }).length;

      const totalAmount = mockTransactions.reduce((sum, transaction) => {
        if (transaction.status === 'completed') {
          return sum + transaction.amount;
        }
        return sum;
      }, 0);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      return {
        registeredUsers: totalUsers,
        todayTransactions,
        monthlyTransactions,
        totalTransactionAmount: totalAmount
      };
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch dashboard data');
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearDashboardError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearDashboardError } = dashboardSlice.actions;
export default dashboardSlice.reducer;