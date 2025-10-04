import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  TablePagination,
  Chip,
  TextField,
  InputAdornment,
  CircularProgress,
  Container,
  Alert,
  Snackbar
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';

import { formatDate } from '../utils/date-utils';
import {PaymentService} from '../services';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { ChitService } from '../services/chit.service';
import TransactionFiltersComponent, { TransactionFilters, UserOption, ChitOption } from '../components/TransactionFilters';
import TransactionStatusSummary from '../components/TransactionStatusSummary';
import TransactionQuickActions from '../components/TransactionQuickActions';
import { useAuth } from '../context/AuthContext';
import { hasPermission, ROLES } from '../utils/role-utils';
import {queryClient} from '../services/queryClient';


// Map API transaction to UI transaction model
const mapTransactionForUI = (transaction: any) => {
  console.log("Mapping transaction:", transaction);
  
  // Handle potential missing data gracefully
  if (!transaction) {
    console.warn("Received undefined or null transaction");
    return {
      id: `unknown-${Date.now()}`,
      date: new Date(),
      amount: 0,
      mobileNumber: 'N/A',
      status: 'pending' as 'pending',
      originalData: null
    };
  }
  
  // Generate a transaction ID based on available data
  const id = transaction.payment?.transaction_id || `CHIT-${transaction.chit_no}-W${transaction.week}`;
  
  // Determine status based on is_paid flag
  let status: 'completed' | 'pending' | 'failed' = 'pending';
  if (transaction.is_paid === 'Y') {
    status = 'completed';
  } else if (transaction.payment && transaction.payment.pay_id) {
    // If there's a payment record but is_paid is not 'Y', it might be failed
    status = 'failed';
  }
  
  // Create a date from payment date or current date
  const date = transaction.payment?.created_at 
    ? new Date(transaction.payment.created_at) 
    : new Date();
  
  // For demo purposes, we'll use a placeholder mobile number
  // In a real app, you would get this from the user profile
  const mobileNumber = '9876543210';
  
  return {
    id,
    date,
    amount: transaction.amount || 0,
    mobileNumber,
    status,
    chitNo: transaction.chit_no,
    week: transaction.week,
    paymentMethod: transaction.payment?.pay_type || 'N/A',
    transactionId: transaction.payment?.transaction_id || 'N/A',
    originalData: transaction // Keep the original data for reference
  };
};

const TransactionHistory = () => {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [totalCount, setTotalCount] = useState<number>(0);
  const [serverPaging, setServerPaging] = useState<boolean>(false);
  
  // Filter states
  const [filters, setFilters] = useState<TransactionFilters>({});
  const [users, setUsers] = useState<UserOption[]>([]);
  const [chits, setChits] = useState<ChitOption[]>([]);
  const [filtersLoading, setFiltersLoading] = useState<boolean>(false);
  const usersCache = useRef<UserOption[]>([]); // Cache for users to avoid refetching
  
  // Check if current user can view all users' transactions
  const canViewAllTransactions = currentUser && hasPermission(currentUser.role || 'customer', [ROLES.ADMIN, ROLES.MANAGER]);

  // get chit hooks
  const { data: chitData, isLoading: chitLoading, error: chitError } = useQuery({
    queryKey: ['chits'],
    queryFn: () => ChitService.getAllChits({ limit: 100 }),
    enabled: canViewAllTransactions // Only fetch if user can view all transactions
  });
  if (chitData && chitData.success && chitData.data) {
          const chitOptions: ChitOption[] = chitData.data.map((chit: any) => ({
            chit_id: chit.chit_id,
            chit_no: chit.chit_no || chit.chit_name,
            amount: chit.monthly_amount || chit.total_amount || chit.amount || 0,
            description: chit.description
          }));
          setChits(chitOptions);
    }
        console.log("Chit data from useQuery:", chitData, chitLoading, chitError);
  // Fetch users and chits data for filters (admin/manager only)
  useEffect(() => {
    const fetchFilterData = async () => {
      if (!canViewAllTransactions) return;
      // if (!usersCache.current.length) return;
      setFiltersLoading(true);
      try {
        // Fetch users
        const usersResponse = await UserService.getAllUsers(1, 100);
        if (usersResponse) {
          usersCache.current = usersResponse; // Cache users in cache
          setUsers(usersResponse);
        }
        // console.log( await UserService.getUsersService())

        // Fetch chits
        // const chitsResponse = await ChitService.getAllChits({ limit: 100 });
        // if (chitsResponse.success && chitsResponse.data) {
        //   const chitOptions: ChitOption[] = chitsResponse.data.map((chit: any) => ({
        //     chit_id: chit.chit_id,
        //     chit_no: chit.chit_no || chit.chit_name,
        //     amount: chit.monthly_amount || chit.total_amount || chit.amount || 0,
        //     description: chit.description
        //   }));
        //   setChits(chitOptions);
        // }
      } catch (error) {
        console.error('Error fetching filter data:', error);
        // Set mock data for development
        setUsers([
          { user_id: '1', fullName: 'John Doe', email: 'john@example.com', mobileNumber: '9876543210' },
          { user_id: '2', fullName: 'Jane Smith', email: 'jane@example.com', mobileNumber: '9876543211' },
          { user_id: '3', fullName: 'Bob Johnson', email: 'bob@example.com', mobileNumber: '9876543212' }
        ]);
        setChits([
          { chit_id: '1', chit_no: '1', amount: 5000, description: 'Monthly Chit Fund' },
          { chit_id: '2', chit_no: '2', amount: 10000, description: 'Premium Chit Fund' },
          { chit_id: '3', chit_no: '3', amount: 2000, description: 'Basic Chit Fund' }
        ]);
      } finally {
        setFiltersLoading(false);
      }
    };

    fetchFilterData();
  }, []);

  // Fetch transactions from API
  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Calculate skip for server-side pagination
        const skip = serverPaging ? page * rowsPerPage : 0;
        const limit = serverPaging ? rowsPerPage : 100; // Get more records if client-side pagination
        
        // Determine user_id based on role and filters
        let user_id;
        if (canViewAllTransactions) {
          // Admin/Manager can view all transactions or filter by specific user
          user_id = filters.selectedUser?.user_id;
        } else {
          // Customer can only view their own transactions
          user_id = AuthService.getCurrentUser()?.user_id;
        }
        
        const response = await PaymentService.getTransactionHistoryPage({
          skip,
          limit,
          user_id
        });
        
        console.log("Transaction history response:", response);
        
        // Map API response to UI model
        if (response.data && Array.isArray(response.data)) {
          const mappedTransactions = response.data.map(mapTransactionForUI);
          setTransactions(mappedTransactions);
          setTotalCount(response.data.length);
        } else {
          console.warn("Unexpected response format:", response.data);
          setTransactions([]);
          setTotalCount(0);
        }
        
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching transactions:', err);
        setError(err.message || 'Failed to load transactions');
        setLoading(false);
        
        // For development/testing, use mock data if API fails
        const mockTransactions = [
          {
            chit_id: 1,
            user_id: 1,
            chit_no: 1,
            amount: 1000,
            week: 1,
            is_paid: 'Y',
            payment: {
              pay_id: 1,
              transaction_id: 'TXN123456',
              pay_type: 'card',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          },
          {
            chit_id: 2,
            user_id: 1,
            chit_no: 1,
            amount: 1000,
            week: 2,
            is_paid: 'N',
            payment: null
          }
        ];
        
        // Uncomment the following line to use mock data during development
        // const mappedTransactions = mockTransactions.map(mapTransactionForUI);
        // setTransactions(mappedTransactions);
        // setTotalCount(mockTransactions.length);
        
        // For production, just set empty transactions
        setTransactions([]);
      }
    };

    fetchTransactions();
  }, [serverPaging, page, rowsPerPage, filters.selectedUser, canViewAllTransactions]);

  // Handle page change
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
    
    // If not using server-side pagination, we don't need to refetch
    if (!serverPaging) {
      // Just update the page state for client-side pagination
    }
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle search
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  // Handle filter changes
  const handleFiltersChange = (newFilters: TransactionFilters) => {
    setFilters(newFilters);
    setPage(0); // Reset to first page when filters change
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setFilters({});
    setSearchTerm('');
    setPage(0);
  };

  // Handle loading user-specific chits
  const handleUserChitsLoad = async (userId: string): Promise<ChitOption[]> => {
    try {
      const response = await UserService.getUserChits(userId);
      if (response.data && Array.isArray(response.data)) {
        return response.data.map((chit: any) => ({
          chit_id: chit.chit_id || chit.id,
          chit_no: chit.chit_no || chit.chit_name || 'Unknown',
          amount: chit.monthly_amount || chit.total_amount || chit.amount || 0,
          description: chit.description || chit.chit_name
        }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching user chits:', error);
      // Return mock data for development
      return [
        { chit_id: `${userId}_1`, chit_no: '1', amount: 5000, description: `User ${userId} - Monthly Chit` },
        { chit_id: `${userId}_2`, chit_no: '2', amount: 10000, description: `User ${userId} - Premium Chit` }
      ];
    }
  };

  // Filter transactions based on search term and filters (client-side filtering)
  const filteredTransactions = transactions.filter(transaction => {
    // Search term filter
    const searchMatch = !searchTerm || !filters.searchTerm || 
      transaction.id.toLowerCase().includes((searchTerm || filters.searchTerm).toLowerCase()) ||
      (transaction.mobileNumber && transaction.mobileNumber.includes(searchTerm || filters.searchTerm)) ||
      transaction.amount.toString().includes(searchTerm || filters.searchTerm) ||
      (transaction.originalData?.chit_no && transaction.originalData.chit_no.toString().includes(searchTerm || filters.searchTerm)) ||
      (transaction.originalData?.week && transaction.originalData.week.toString().includes(searchTerm || filters.searchTerm));

    // Status filter
    const statusMatch = !filters.status || transaction.status === filters.status;

    // Payment method filter
    const paymentMethodMatch = !filters.paymentMethod || 
      (transaction.originalData?.payment?.pay_type === filters.paymentMethod);

    // Chit filter
    const chitMatch = !filters.selectedChit || 
      (transaction.originalData?.chit_no && transaction.originalData.chit_no.toString() === filters.selectedChit.chit_no);

    // Date range filter
    const dateFromMatch = !filters.dateFrom || transaction.date >= filters.dateFrom;
    const dateToMatch = !filters.dateTo || transaction.date <= filters.dateTo;

    // Amount range filter
    const amountMinMatch = !filters.amountMin || transaction.amount >= filters.amountMin;
    const amountMaxMatch = !filters.amountMax || transaction.amount <= filters.amountMax;

    return searchMatch && statusMatch && paymentMethodMatch && chitMatch && 
           dateFromMatch && dateToMatch && amountMinMatch && amountMaxMatch;
  });

  // Get status chip color based on status
  const getStatusChipColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  // Get translated status text
  const getStatusText = (status: string) => {
    return t(`transactionHistory.status.${status}`);
  };

  // Get payment method text
  const getPaymentMethodText = (transaction: any) => {
    if (!transaction.originalData?.payment?.pay_type) {
      return '-';
    }
    
    const payType = transaction.originalData.payment.pay_type;
    return t(`transactionHistory.paymentMethod.${payType}`) || payType;
  };

  // Format chit and week info
  const formatChitWeekInfo = (transaction: any) => {
    if (!transaction.originalData) return '-';
    
    return `${t('transactionHistory.chitNo')}: ${transaction.originalData.chit_no}, ${t('transactionHistory.week')}: ${transaction.originalData.week}`;
  };

  // Handle error close
  const handleErrorClose = () => {
    setError(null);
  };

  // Handle export functionality
  const handleExport = (format: 'csv' | 'pdf' | 'excel') => {
    console.log(`Exporting ${filteredTransactions.length} transactions as ${format}`);
    // TODO: Implement actual export functionality
    // This would typically call an API endpoint or generate the file client-side
  };

  // Handle refresh
  const handleRefresh = () => {
    setPage(0);
    // Trigger a re-fetch by updating a dependency
    window.location.reload();
  };

  // Handle print
  const handlePrint = () => {
    window.print();
  };

  // Handle email report
  const handleEmailReport = () => {
    console.log('Sending email report to:', filters.selectedUser?.email);
    // TODO: Implement email report functionality
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            {t('transactionHistory.title')}
          </Typography>
        </Box>

        {/* Error Snackbar */}
        <Snackbar open={!!error} autoHideDuration={6000} onClose={handleErrorClose}>
          <Alert onClose={handleErrorClose} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>

        {/* Filters - only show for admin/manager */}
        {canViewAllTransactions && (
          <TransactionFiltersComponent
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onClearFilters={handleClearFilters}
            users={users}
            chits={chits}
            loading={filtersLoading}
            onUserChitsLoad={handleUserChitsLoad}
          />
        )}

        {/* Transaction Summary - show when there are transactions and filters are applied */}
        {(canViewAllTransactions && (filters.selectedUser || filteredTransactions.length > 0)) && (
          <TransactionStatusSummary
            transactions={filteredTransactions}
            selectedUser={filters.selectedUser}
            selectedChit={filters.selectedChit}
          />
        )}

        {/* Quick Actions - show for admin/manager when there are transactions */}
        {canViewAllTransactions && filteredTransactions.length > 0 && (
          <TransactionQuickActions
            selectedUser={filters.selectedUser}
            selectedChit={filters.selectedChit}
            transactionCount={filteredTransactions.length}
            onExport={handleExport}
            onRefresh={handleRefresh}
            onPrint={handlePrint}
            onEmailReport={handleEmailReport}
          />
        )}

        {/* Search for customers or when filters are not shown */}
        {!canViewAllTransactions && (
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
            <TextField
              label={t('common.search')}
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ width: '300px' }}
            />
          </Box>
        )}

        <Paper elevation={2}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
              <Typography sx={{ ml: 2 }}>{t('common.loading')}</Typography>
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>{t('transactionHistory.columns.transactionId')}</strong></TableCell>
                      {canViewAllTransactions && !filters.selectedUser && (
                        <TableCell><strong>{t('transactionHistory.columns.user')}</strong></TableCell>
                      )}
                      <TableCell><strong>{t('transactionHistory.columns.chitInfo')}</strong></TableCell>
                      <TableCell><strong>{t('transactionHistory.columns.date')}</strong></TableCell>
                      <TableCell><strong>{t('transactionHistory.columns.amount')}</strong></TableCell>
                      <TableCell><strong>{t('transactionHistory.columns.paymentMethod')}</strong></TableCell>
                      <TableCell><strong>{t('transactionHistory.columns.status')}</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredTransactions
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((transaction) => {
                        // Find user info for this transaction if showing all users
                        const transactionUser = canViewAllTransactions && !filters.selectedUser 
                          ? users.find(user => user.user_id === transaction.originalData?.user_id?.toString())
                          : null;

                        return (
                          <TableRow key={transaction.id} hover>
                            <TableCell>{transaction.id}</TableCell>
                            {canViewAllTransactions && !filters.selectedUser && (
                              <TableCell>
                                {transactionUser ? (
                                  <Box>
                                    <Typography variant="body2" fontWeight="bold">
                                      {transactionUser.fullName}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {transactionUser.mobileNumber || transactionUser.email}
                                    </Typography>
                                  </Box>
                                ) : (
                                  <Typography variant="body2" color="text.secondary">
                                    User ID: {transaction.originalData?.user_id || 'Unknown'}
                                  </Typography>
                                )}
                              </TableCell>
                            )}
                            <TableCell>{formatChitWeekInfo(transaction)}</TableCell>
                            <TableCell>{formatDate(transaction.date, 'DD/MM/YYYY')}</TableCell>
                            <TableCell>₹{transaction.amount.toLocaleString('en-IN')}</TableCell>
                            <TableCell>{getPaymentMethodText(transaction)}</TableCell>
                            <TableCell>
                              <Chip
                                label={getStatusText(transaction.status)}
                                color={getStatusChipColor(transaction.status) as any}
                                size="small"
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    {filteredTransactions.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={canViewAllTransactions && !filters.selectedUser ? 7 : 6} align="center">
                          {t('transactionHistory.noTransactions')}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50,100]}
                component="div"
                count={filteredTransactions.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage={t('transactionHistory.rowsPerPage')}
              />
            </>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default TransactionHistory;