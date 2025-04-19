import React, { useState, useEffect } from 'react';
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
  IconButton,
  CircularProgress,
  Container,
  Alert,
  Snackbar
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import { useTranslation } from 'react-i18next';

import { formatDate } from '../utils/date-utils';
import {PaymentService} from '../services';

// Define transaction interface based on API response
interface Payment {
  pay_id: number;
  transaction_id: string;
  pay_type: string;
  created_at: string;
  updated_at: string;
}

interface Transaction {
  chit_id: number;
  user_id: number;
  chit_no: number;
  amount: number;
  week: number;
  is_paid: string;
  payment: Payment | null;
}

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
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [totalCount, setTotalCount] = useState<number>(0);
  const [serverPaging, setServerPaging] = useState<boolean>(false);

  // Fetch transactions from API
  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Calculate skip for server-side pagination
        const skip = serverPaging ? page * rowsPerPage : 0;
        const limit = serverPaging ? rowsPerPage : 100; // Get more records if client-side pagination
        
        const response = await PaymentService.getTransactionHistoryPage({
          skip,
          limit
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
  }, [serverPaging, page, rowsPerPage]);

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

  // Filter transactions based on search term (client-side filtering)
  const filteredTransactions = transactions.filter(transaction =>
    transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (transaction.mobileNumber && transaction.mobileNumber.includes(searchTerm)) ||
    transaction.amount.toString().includes(searchTerm) ||
    (transaction.originalData?.chit_no && transaction.originalData.chit_no.toString().includes(searchTerm)) ||
    (transaction.originalData?.week && transaction.originalData.week.toString().includes(searchTerm))
  );

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
          <IconButton aria-label={t('common.filter')}>
            <FilterListIcon />
          </IconButton>
        </Box>

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
                      .map((transaction) => (
                        <TableRow key={transaction.id} hover>
                          <TableCell>{transaction.id}</TableCell>
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
                      ))}
                    {filteredTransactions.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          {t('transactionHistory.noTransactions')}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
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