import React, { useEffect } from 'react';
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
import { useAppSelector, useAppDispatch } from '../redux/hooks';
import { fetchDashboardData } from '../redux/slices/dashboardSlice';
import '../i18n';

const Dashboard = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { data, loading, error } = useAppSelector(state => state.dashboard);
  const { currentUser } = useAppSelector(state => state.auth);

  useEffect(() => {
    // Fetch dashboard data when component mounts
    dispatch(fetchDashboardData());
  }, [dispatch]);

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
          {currentUser && (
            <Typography variant="subtitle1">
              {t('dashboard.welcome')}, {currentUser.fullname || currentUser.username}
            </Typography>
          )}
        </Box>

        {error && (
          <Paper elevation={3} sx={{ p: 2, mb: 3, bgcolor: 'error.light' }}>
            <Typography color="error">{error}</Typography>
          </Paper>
        )}

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
                    {data.registeredUsers}
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
                    {data.todayTransactions}
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
                    {data.monthlyTransactions}
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
                    {formatCurrency(data.totalTransactionAmount)}
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
                  {t('dashboard.registeredUsers')}: <strong>{data.registeredUsers}</strong>.{' '}
                  {t('dashboard.todayTransactions')}: <strong>{data.todayTransactions}</strong>.{' '}
                  {t('dashboard.monthlyTransactions')}: <strong>{data.monthlyTransactions}</strong>.{' '}
                  {t('dashboard.totalAmount')}: <strong>{formatCurrency(data.totalTransactionAmount)}</strong>.
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