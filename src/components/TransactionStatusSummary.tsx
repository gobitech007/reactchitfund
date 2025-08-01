import React from 'react';
import {
  Box,
  Paper,
  Grid,
  Typography,
  Chip,
  Card,
  CardContent,
  LinearProgress
} from '@mui/material';
import {
  CheckCircle as CompletedIcon,
  Schedule as PendingIcon,
  Error as FailedIcon,
  Refresh as RefundedIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface TransactionStatusSummaryProps {
  transactions: any[];
  selectedUser?: {
    user_id: string;
    fullName: string;
    email?: string;
    mobileNumber?: string;
  };
  selectedChit?: {
    chit_id: string;
    chit_no: string;
    amount: number;
    description?: string;
  };
}

const TransactionStatusSummary: React.FC<TransactionStatusSummaryProps> = ({
  transactions,
  selectedUser,
  selectedChit
}) => {
  const { t } = useTranslation();

  // Calculate status counts
  const statusCounts = transactions.reduce((acc, transaction) => {
    const status = transaction.status || 'pending';
    acc[status] = (acc[status] || 0) + 1;
    acc.total = (acc.total || 0) + 1;
    acc.totalAmount = (acc.totalAmount || 0) + (transaction.amount || 0);
    return acc;
  }, {});

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CompletedIcon color="success" />;
      case 'pending':
        return <PendingIcon color="warning" />;
      case 'failed':
        return <FailedIcon color="error" />;
      case 'refunded':
        return <RefundedIcon color="info" />;
      default:
        return <PendingIcon />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'error';
      case 'refunded':
        return 'info';
      default:
        return 'default';
    }
  };

  const statusTypes = ['completed', 'pending', 'failed', 'refunded'];

  if (transactions.length === 0) {
    return null;
  }

  return (
    <Paper elevation={1} sx={{ mb: 3, p: 2 }}>
      <Typography variant="h6" gutterBottom>
        {t('transactionHistory.summary.title')}
        {selectedUser && (
          <Typography variant="subtitle2" color="text.secondary">
            {selectedUser.fullName}
            {selectedChit && ` - Chit #${selectedChit.chit_no}`}
          </Typography>
        )}
      </Typography>

      <Grid container spacing={2}>
        {/* Total Summary */}
        <Grid item xs={12} md={3}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                {statusCounts.total || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('transactionHistory.summary.totalTransactions')}
              </Typography>
              <Typography variant="h6" color="text.primary" sx={{ mt: 1 }}>
                ₹{(statusCounts.totalAmount || 0).toLocaleString('en-IN')}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {t('transactionHistory.summary.totalAmount')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Status Breakdown */}
        {statusTypes.map((status) => {
          const count = statusCounts[status] || 0;
          const percentage = statusCounts.total > 0 ? (count / statusCounts.total) * 100 : 0;
          
          return (
            <Grid item xs={12} md={2.25} key={status}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                    {getStatusIcon(status)}
                    <Typography variant="h5" sx={{ ml: 1 }}>
                      {count}
                    </Typography>
                  </Box>
                  <Chip
                    label={t(`transactionHistory.status.${status}`)}
                    color={getStatusColor(status) as any}
                    size="small"
                    sx={{ mb: 1 }}
                  />
                  <LinearProgress
                    variant="determinate"
                    value={percentage}
                    color={getStatusColor(status) as any}
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {percentage.toFixed(1)}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Additional Metrics */}
      {selectedUser && (
        <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="text.secondary">
                {t('transactionHistory.summary.averageAmount')}
              </Typography>
              <Typography variant="h6">
                ₹{statusCounts.total > 0 ? Math.round(statusCounts.totalAmount / statusCounts.total).toLocaleString('en-IN') : 0}
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="text.secondary">
                {t('transactionHistory.summary.successRate')}
              </Typography>
              <Typography variant="h6" color="success.main">
                {statusCounts.total > 0 ? ((statusCounts.completed || 0) / statusCounts.total * 100).toFixed(1) : 0}%
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="text.secondary">
                {t('transactionHistory.summary.pendingAmount')}
              </Typography>
              <Typography variant="h6" color="warning.main">
                ₹{((statusCounts.pending || 0) * (statusCounts.totalAmount / statusCounts.total || 0)).toLocaleString('en-IN')}
              </Typography>
            </Grid>
          </Grid>
        </Box>
      )}
    </Paper>
  );
};

export default TransactionStatusSummary;