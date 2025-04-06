import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import PaymentIcon from '@mui/icons-material/Payment';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { useTranslation } from 'react-i18next';
import '../i18n';

// Mock transaction data (similar to what's in transactionhistory.tsx)
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

const Dashboard = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    registeredUsers: 0,
    todayTransactions: 0,
    monthlyTransactions: 0,
    totalTransactionAmount: 0
  });

  useEffect(() => {
    // Simulate API call to fetch dashboard data
    const fetchDashboardData = async () => {
      // In a real app, this would be API calls
      setTimeout(() => {
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

        setDashboardData({
          registeredUsers: totalUsers,
          todayTransactions,
          monthlyTransactions,
          totalTransactionAmount: totalAmount
        });

        setLoading(false);
      }, 1000);
    };

    fetchDashboardData();
  }, []);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            {t('navigation.dashboard')}
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>{t('common.loading')}</Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {/* Registered Users Card */}
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={3}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <PeopleIcon color="primary" fontSize="large" sx={{ mr: 1 }} />
                    <Typography variant="h6" component="div">
                      {t('dashboard.registeredUsers')}
                    </Typography>
                  </Box>
                  <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {dashboardData.registeredUsers}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('dashboard.totalUsers')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Today's Transactions Card */}
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={3}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <CalendarTodayIcon color="secondary" fontSize="large" sx={{ mr: 1 }} />
                    <Typography variant="h6" component="div">
                      {t('dashboard.todayTransactions')}
                    </Typography>
                  </Box>
                  <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {dashboardData.todayTransactions}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('dashboard.transactionsToday')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Monthly Transactions Card */}
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={3}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <PaymentIcon color="success" fontSize="large" sx={{ mr: 1 }} />
                    <Typography variant="h6" component="div">
                      {t('dashboard.monthlyTransactions')}
                    </Typography>
                  </Box>
                  <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {dashboardData.monthlyTransactions}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('dashboard.transactionsThisMonth')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Total Transaction Amount Card */}
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={3}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <TrendingUpIcon color="error" fontSize="large" sx={{ mr: 1 }} />
                    <Typography variant="h6" component="div">
                      {t('dashboard.totalAmount')}
                    </Typography>
                  </Box>
                  <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {formatCurrency(dashboardData.totalTransactionAmount)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('dashboard.totalCompletedTransactions')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Summary Section */}
            <Grid item xs={12}>
              <Paper elevation={3} sx={{ p: 3, mt: 2 }}>
                <Typography variant="h5" component="h2" gutterBottom>
                  {t('dashboard.summary')}
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="body1" paragraph>
                  {t('dashboard.welcomeMessage')}
                </Typography>
                <Typography variant="body1">
                  {t('dashboard.registeredUsers')}: <strong>{dashboardData.registeredUsers}</strong>.
                  {t('dashboard.todayTransactions')}: <strong>{dashboardData.todayTransactions}</strong>.
                  {t('dashboard.monthlyTransactions')}: <strong>{dashboardData.monthlyTransactions}</strong>.
                  {t('dashboard.totalAmount')}: <strong>{formatCurrency(dashboardData.totalTransactionAmount)}</strong>.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        )}
      </Box>
    </Container>
  );
};

export default Dashboard;