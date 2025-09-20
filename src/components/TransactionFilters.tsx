import React, { useState } from 'react';
import {
  Box,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Grid,
  Chip,
  Typography,
  Collapse,
  IconButton,
  Autocomplete,
  SelectChangeEvent
} from '@mui/material';
import {
  FilterList as FilterListIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
// Using regular TextField for date inputs to avoid compatibility issues

// Filter interfaces
export interface UserOption {
  user_id: string;
  fullName: string;
  email?: string;
  mobileNumber?: string;
}

export interface ChitOption {
  chit_id: string;
  chit_no: string;
  amount: number;
  description?: string;
}

export interface TransactionFilters {
  selectedUser?: UserOption;
  selectedChit?: ChitOption;
  status?: string;
  paymentMethod?: string;
  dateFrom?: Date;
  dateTo?: Date;
  amountMin?: number;
  amountMax?: number;
  searchTerm?: string;
}

interface TransactionFiltersProps {
  filters: TransactionFilters;
  onFiltersChange: (filters: TransactionFilters) => void;
  onClearFilters: () => void;
  users: UserOption[];
  chits: ChitOption[];
  loading?: boolean;
  onUserChitsLoad?: (userId: string) => Promise<ChitOption[]>;
}

const TransactionFiltersComponent: React.FC<TransactionFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  users,
  chits,
  loading = false,
  onUserChitsLoad
}) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const [userChits, setUserChits] = useState<ChitOption[]>([]);
  const [loadingUserChits, setLoadingUserChits] = useState(false);

  // Status options
  const statusOptions = [
    { value: 'completed', label: t('transactionHistory.status.completed') },
    { value: 'pending', label: t('transactionHistory.status.pending') },
    { value: 'failed', label: t('transactionHistory.status.failed') },
    { value: 'refunded', label: t('transactionHistory.status.refunded') }
  ];

  // Payment method options
  const paymentMethodOptions = [
    { value: 'credit_card', label: t('transactionHistory.paymentMethod.credit_card') },
    { value: 'debit_card', label: t('transactionHistory.paymentMethod.debit_card') },
    { value: 'upi', label: t('transactionHistory.paymentMethod.upi') },
    { value: 'net_banking', label: t('transactionHistory.paymentMethod.net_banking') },
    { value: 'wallet', label: t('transactionHistory.paymentMethod.wallet') }
  ];

  // Handle filter changes
  const handleFilterChange = (key: keyof TransactionFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    onFiltersChange(newFilters);
  };

  // Handle user selection
  const handleUserChange = async (event: any, newValue: UserOption | null) => {
    handleFilterChange('selectedUser', newValue);
    // Clear selected chit when user changes
    if (newValue?.user_id !== filters.selectedUser?.user_id) {
      handleFilterChange('selectedChit', null);
    }

    // Load user's chits when a user is selected
    if (newValue && onUserChitsLoad) {
      setLoadingUserChits(true);
      try {
        const userSpecificChits = await onUserChitsLoad(newValue.user_id);
        setUserChits(userSpecificChits);
      } catch (error) {
        console.error('Error loading user chits:', error);
        setUserChits([]);
      } finally {
        setLoadingUserChits(false);
      }
    } else {
      setUserChits([]);
    }
  };

  // Handle chit selection
  const handleChitChange = (event: any, newValue: ChitOption | null) => {
    handleFilterChange('selectedChit', newValue);
  };

  // Handle status change
  const handleStatusChange = (event: SelectChangeEvent) => {
    handleFilterChange('status', event.target.value);
  };

  // Handle payment method change
  const handlePaymentMethodChange = (event: SelectChangeEvent) => {
    handleFilterChange('paymentMethod', event.target.value);
  };

  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.selectedUser) count++;
    if (filters.selectedChit) count++;
    if (filters.status) count++;
    if (filters.paymentMethod) count++;
    if (filters.dateFrom) count++;
    if (filters.dateTo) count++;
    if (filters.amountMin) count++;
    if (filters.amountMax) count++;
    if (filters.searchTerm) count++;
    return count;
  };

  // Use user-specific chits if available, otherwise use all chits
  const filteredChits = filters.selectedUser ? userChits : chits;

  return (
    <Paper elevation={1} sx={{ mb: 3 }}>
      <Box sx={{ p: 2 }}>
        {/* Filter Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FilterListIcon sx={{ mr: 1 }} />
            <Typography variant="h6">
              {t('transactionHistory.filters.title')}
            </Typography>
            {getActiveFilterCount() > 0 && (
              <Chip 
                label={`${getActiveFilterCount()} active`}
                size="small"
                color="primary"
                sx={{ ml: 2 }}
              />
            )}
          </Box>
          <Box>
            <Button
              variant="outlined"
              size="small"
              onClick={onClearFilters}
              startIcon={<ClearIcon />}
              sx={{ mr: 1 }}
              disabled={getActiveFilterCount() === 0}
            >
              {t('common.clear')}
            </Button>
            <IconButton
              onClick={() => setExpanded(!expanded)}
              size="small"
            >
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
        </Box>

        {/* Quick Filters */}
        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          <TextField
            size="small"
            placeholder={t('common.search')}
            value={filters.searchTerm || ''}
            onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
            sx={{ minWidth: 200 }}
          />
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>{t('transactionHistory.filters.status')}</InputLabel>
            <Select
              value={filters.status || ''}
              label={t('transactionHistory.filters.status')}
              onChange={handleStatusChange}
            >
              <MenuItem value="">
                <em>{t('common.all')}</em>
              </MenuItem>
              {statusOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Advanced Filters */}
        <Collapse in={expanded}>
          <Grid container spacing={2}>
            {/* User Selection */}
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={users}
                getOptionLabel={(option) => `${option.fullName} (${option.mobileNumber || option.email})`}
                value={filters.selectedUser || null}
                onChange={handleUserChange}
                loading={loading}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={t('transactionHistory.filters.user')}
                    size="small"
                  />
                )}
                renderOption={(props, option) => (
                  <Box component="li" {...props}>
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {option.fullName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {option.mobileNumber || option.email} • ID: {option.user_id}
                      </Typography>
                    </Box>
                  </Box>
                )}
              />
            </Grid>

            {/* Chit Selection */}
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={filteredChits}
                getOptionLabel={(option) => `Chit ${option.chit_no} - ₹${option.amount.toLocaleString('en-IN')}`}
                value={filters.selectedChit || null}
                onChange={handleChitChange}
                disabled={!filters.selectedUser}
                loading={loadingUserChits}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={t('transactionHistory.filters.chit')}
                    size="small"
                    helperText={!filters.selectedUser ? t('transactionHistory.filters.selectUserFirst') : 
                               loadingUserChits ? 'Loading user chits...' : 
                               filteredChits.length === 0 && filters.selectedUser ? 'No chits found for this user' : ''}
                  />
                )}
                renderOption={(props, option) => (
                  <Box component="li" {...props}>
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        Chit #{option.chit_no}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Amount: ₹{option.amount.toLocaleString('en-IN')} • ID: {option.chit_id}
                      </Typography>
                      {option.description && (
                        <Typography variant="caption" display="block" color="text.secondary">
                          {option.description}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                )}
                noOptionsText={loadingUserChits ? 'Loading...' : 'No chits found'}
              />
            </Grid>

            {/* Payment Method */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel>{t('transactionHistory.filters.paymentMethod')}</InputLabel>
                <Select
                  value={filters.paymentMethod || ''}
                  label={t('transactionHistory.filters.paymentMethod')}
                  onChange={handlePaymentMethodChange}
                >
                  <MenuItem value="">
                    <em>{t('common.all')}</em>
                  </MenuItem>
                  {paymentMethodOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Date Range */}
            <Grid item xs={12} md={3}>
              <TextField
                label={t('transactionHistory.filters.dateFrom')}
                type="date"
                size="small"
                fullWidth
                value={filters.dateFrom ? filters.dateFrom.toISOString().split('T')[0] : ''}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value ? new Date(e.target.value) : undefined)}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                label={t('transactionHistory.filters.dateTo')}
                type="date"
                size="small"
                fullWidth
                value={filters.dateTo ? filters.dateTo.toISOString().split('T')[0] : ''}
                onChange={(e) => handleFilterChange('dateTo', e.target.value ? new Date(e.target.value) : undefined)}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>

            {/* Amount Range */}
            <Grid item xs={12} md={3}>
              <TextField
                label={t('transactionHistory.filters.amountMin')}
                type="number"
                size="small"
                fullWidth
                value={filters.amountMin || ''}
                onChange={(e) => handleFilterChange('amountMin', e.target.value ? Number(e.target.value) : undefined)}
                InputProps={{
                  startAdornment: '₹'
                }}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                label={t('transactionHistory.filters.amountMax')}
                type="number"
                size="small"
                fullWidth
                value={filters.amountMax || ''}
                onChange={(e) => handleFilterChange('amountMax', e.target.value ? Number(e.target.value) : undefined)}
                InputProps={{
                  startAdornment: '₹'
                }}
              />
            </Grid>
          </Grid>
        </Collapse>
      </Box>
    </Paper>
  );
};

export default TransactionFiltersComponent;