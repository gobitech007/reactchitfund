import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  Button,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { useTranslation } from 'react-i18next';
import { useAppSelector, useAppDispatch } from '../redux/hooks';
import { fetchTransactionHistory, fetchTransactionById } from '../redux/slices/paymentSlice';
import { Transaction } from '../utils/interface-utils';

const TransactionHistory: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { transactions, loading, error, totalTransactions } = useAppSelector(state => state.payment);
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    // Fetch transaction history when component mounts
    dispatch(fetchTransactionHistory({ page: page + 1, limit: rowsPerPage }));
  }, [dispatch, page, rowsPerPage]);

  useEffect(() => {
    // Filter transactions based on search term
    if (searchTerm.trim() === '') {
      setFilteredTransactions(transactions);
    } else {
      const filtered = transactions.filter(transaction => 
        transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        // transaction.mobileNumber.includes(searchTerm) ||
        transaction.amount.toString().includes(searchTerm)
      );
      setFilteredTransactions(filtered);
    }
  }, [transactions, searchTerm]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  const handleViewTransaction = (transactionId: string) => {
    dispatch(fetchTransactionById(transactionId));
    // In a real app, you might navigate to a transaction details page
    console.log(`View transaction: ${transactionId}`);
  };

  const handleDownloadReceipt = (transactionId: string) => {
    // In a real app, this would trigger a download
    console.log(`Download receipt for transaction: ${transactionId}`);
  };

  // Format date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
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

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {t('navigation.transactionHistory')}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <TextField
              label={t('transaction.search')}
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={handleSearch}
              sx={{ width: '300px' }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={clearSearch}>
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              placeholder={t('transaction.searchPlaceholder')}
            />
            <Button
              variant="outlined"
              startIcon={<FileDownloadIcon />}
              onClick={() => console.log('Download all transactions')}
            >
              {t('transaction.downloadAll')}
            </Button>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
              <Typography sx={{ ml: 2 }}>{t('common.loading')}</Typography>
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table sx={{ minWidth: 650 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('transaction.id')}</TableCell>
                      <TableCell>{t('transaction.date')}</TableCell>
                      <TableCell>{t('transaction.amount')}</TableCell>
                      <TableCell>{t('transaction.mobileNumber')}</TableCell>
                      <TableCell>{t('transaction.status')}</TableCell>
                      <TableCell align="center">{t('transaction.actions')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredTransactions.length > 0 ? (
                      filteredTransactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell component="th" scope="row">
                            {transaction.id}
                          </TableCell>
                          <TableCell>{formatDate(transaction.date)}</TableCell>
                          <TableCell>{formatCurrency(transaction.amount)}</TableCell>
                          <TableCell>{transaction.mobileNumber}</TableCell>
                          <TableCell>
                            <Chip
                              label={t(`transaction.status.${transaction.status.toLowerCase()}`)}
                              color={getStatusColor(transaction.status) as any}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                              <Tooltip title={t('transaction.view')}>
                                <IconButton
                                  size="small"
                                  onClick={() => handleViewTransaction(transaction.id)}
                                >
                                  <VisibilityIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              {transaction.status.toLowerCase() === 'completed' && (
                                <Tooltip title={t('transaction.downloadReceipt')}>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleDownloadReceipt(transaction.id)}
                                  >
                                    <FileDownloadIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          {searchTerm
                            ? t('transaction.noSearchResults')
                            : t('transaction.noTransactions')}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={totalTransactions}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage={t('common.rowsPerPage')}
              />
            </>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default TransactionHistory;