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
  Container
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import { useTranslation } from 'react-i18next';

import '../i18n';
import { formatDate } from '../utils/date-utils';
import { formatMobileNumber } from '../utils/form-utils';

// Define transaction interface
interface Transaction {
  id: string;
  date: Date;
  amount: number;
  mobileNumber: string;
  status: 'completed' | 'pending' | 'failed';
}

// Mock data for demonstration
const mockTransactions: Transaction[] = [
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
    date: new Date(2023, 7, 1),
    amount: 4500,
    mobileNumber: '4321098765',
    status: 'pending'
  },
  {
    id: 'TXN-007-2023',
    date: new Date(2023, 7, 5),
    amount: 8000,
    mobileNumber: '3210987654',
    status: 'completed'
  },
  {
    id: 'TXN-008-2023',
    date: new Date(2023, 7, 10),
    amount: 6000,
    mobileNumber: '2109876543',
    status: 'failed'
  },
  {
    id: 'TXN-009-2023',
    date: new Date(2023, 7, 15),
    amount: 12000,
    mobileNumber: '1098765432',
    status: 'completed'
  },
  {
    id: 'TXN-010-2023',
    date: new Date(2023, 7, 20),
    amount: 9000,
    mobileNumber: '0987654321',
    status: 'pending'
  },
];

const TransactionHistory = () => {
  const { t } = useTranslation();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Simulate API call to fetch transactions
  useEffect(() => {
    const fetchTransactions = async () => {
      // In a real app, this would be an API call
      setTimeout(() => {
        setTransactions(mockTransactions);
        setLoading(false);
      }, 1000);
    };

    fetchTransactions();
  }, []);

  // Handle page change
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
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

  // Filter transactions based on search term
  const filteredTransactions = transactions.filter(transaction =>
    transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.mobileNumber.includes(searchTerm) ||
    transaction.amount.toString().includes(searchTerm)
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

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            {t('transactionHistory.title')}
          </Typography>
        </Box>

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
                      <TableCell><strong>{t('transactionHistory.columns.date')}</strong></TableCell>
                      <TableCell><strong>{t('transactionHistory.columns.amount')}</strong></TableCell>
                      <TableCell><strong>{t('transactionHistory.columns.mobileNumber')}</strong></TableCell>
                      <TableCell><strong>{t('transactionHistory.columns.status')}</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredTransactions
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((transaction) => (
                        <TableRow key={transaction.id} hover>
                          <TableCell>{transaction.id}</TableCell>
                          <TableCell>{formatDate(transaction.date, 'DD/MM/YYYY')}</TableCell>
                          <TableCell>₹{transaction.amount.toLocaleString('en-IN')}</TableCell>
                          <TableCell>{formatMobileNumber(transaction.mobileNumber)}</TableCell>
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
                        <TableCell colSpan={5} align="center">
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