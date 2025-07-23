import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Alert,
  CircularProgress,
  Divider,
  Card,
  CardContent,
  Radio,
  RadioGroup,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAppSelector, useAppDispatch } from '../redux/hooks';
import { 
  fetchSavedPaymentMethods, 
  fetchAvailablePaymentMethods,
  processPayment
} from '../redux/slices/paymentSlice';
import { fetchChitList } from '../redux/slices/dataSlice';

const Pay: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { savedPaymentMethods, availablePaymentMethods, loading, error } = useAppSelector(state => state.payment);
  const { chitList } = useAppSelector(state => state.data);
  const { currentUser } = useAppSelector(state => state.auth);


  const [selectedChit, setSelectedChit] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [savedMethod, setSavedMethod] = useState('');
  const [savePaymentInfo, setSavePaymentInfo] = useState(false);
  const [formErrors, setFormErrors] = useState({
    selectedChit: '',
    amount: '',
    paymentMethod: '',
  });
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    // Fetch payment methods and chit list when component mounts
    dispatch(fetchSavedPaymentMethods());
    dispatch(fetchAvailablePaymentMethods());
    if (currentUser && currentUser.id) {
      dispatch(fetchChitList());
    }
  }, [dispatch, currentUser]);

  const validateForm = () => {
    let valid = true;
    const errors = {
      selectedChit: '',
      amount: '',
      paymentMethod: '',
    };

    if (!selectedChit) {
      errors.selectedChit = t('payment.errors.selectChit');
      valid = false;
    }

    if (!amount) {
      errors.amount = t('payment.errors.enterAmount');
      valid = false;
    } else if (isNaN(Number(amount)) || Number(amount) <= 0) {
      errors.amount = t('payment.errors.invalidAmount');
      valid = false;
    }

    if (!paymentMethod && !savedMethod) {
      errors.paymentMethod = t('payment.errors.selectPaymentMethod');
      valid = false;
    }

    setFormErrors(errors);
    return valid;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (validateForm()) {
      try {
        const paymentData = {
          chitId: selectedChit,
          amount: Number(amount),
          paymentMethodId: savedMethod || undefined,
          paymentMethod: !savedMethod ? paymentMethod : undefined,
          savePaymentInfo: !savedMethod && savePaymentInfo,
        };

        const resultAction = await dispatch(processPayment(paymentData));
        
        if (processPayment.fulfilled.match(resultAction)) {
          setPaymentSuccess(true);
          // Reset form
          setSelectedChit('');
          setAmount('');
          setPaymentMethod('');
          setSavedMethod('');
          setSavePaymentInfo(false);
        }
      } catch (error) {
        console.error('Payment error:', error);
      }
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {t('navigation.pay')}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {paymentSuccess && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {t('payment.success')}
          </Alert>
        )}

        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
              <Typography sx={{ ml: 2 }}>{t('common.loading')}</Typography>
            </Box>
          ) : (
            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    {t('payment.selectChit')}
                  </Typography>
                  <FormControl fullWidth error={!!formErrors.selectedChit}>
                    <InputLabel>{t('payment.chitPlan')}</InputLabel>
                    <Select
                      value={selectedChit}
                      onChange={(e) => setSelectedChit(e.target.value)}
                      label={t('payment.chitPlan')}
                    >
                      {(chitList || []).map((chit: any) => (
                        <MenuItem key={chit.id} value={chit.id}>
                          {chit.name} - {formatCurrency(chit.amount)}
                        </MenuItem>
                      ))}
                    </Select>
                    {formErrors.selectedChit && (
                      <FormHelperText>{formErrors.selectedChit}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label={t('payment.amount')}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    error={!!formErrors.amount}
                    helperText={formErrors.amount}
                    InputProps={{
                      startAdornment: <Typography sx={{ mr: 1 }}>₹</Typography>,
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    {t('payment.paymentMethod')}
                  </Typography>

                  {savedPaymentMethods.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        {t('payment.savedMethods')}
                      </Typography>
                      <RadioGroup
                        value={savedMethod}
                        onChange={(e) => {
                          setSavedMethod(e.target.value);
                          setPaymentMethod('');
                        }}
                      >
                        {(savedPaymentMethods || []).map((method: any) => (
                          <Card key={method.id} sx={{ mb: 1, border: savedMethod === method.id ? '1px solid primary.main' : 'none' }}>
                            <CardContent sx={{ py: 1 }}>
                              <FormControlLabel
                                value={method.id}
                                control={<Radio />}
                                label={
                                  <Box>
                                    <Typography variant="subtitle2">
                                      {method.type === 'card' ? `${method.cardBrand} **** ${method.last4}` : method.bankName}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      {method.type === 'card' 
                                        ? `${t('payment.expires')}: ${method.expiryMonth}/${method.expiryYear}` 
                                        : `${t('payment.accountNumber')}: **** ${method.last4}`}
                                    </Typography>
                                  </Box>
                                }
                              />
                            </CardContent>
                          </Card>
                        ))}
                      </RadioGroup>
                    </Box>
                  )}

                  <Typography variant="subtitle1" gutterBottom>
                    {savedPaymentMethods.length > 0 
                      ? t('payment.orUseNewMethod') 
                      : t('payment.selectPaymentMethod')}
                  </Typography>

                  <FormControl fullWidth error={!!formErrors.paymentMethod && !savedMethod}>
                    <InputLabel>{t('payment.paymentMethod')}</InputLabel>
                    <Select
                      value={paymentMethod}
                      onChange={(e) => {
                        setPaymentMethod(e.target.value);
                        setSavedMethod('');
                      }}
                      label={t('payment.paymentMethod')}
                      disabled={!!savedMethod}
                    >
                      {(availablePaymentMethods || []).map((method: any) => (
                        <MenuItem key={method.id} value={method.id}>
                          {method.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {formErrors.paymentMethod && !savedMethod && (
                      <FormHelperText>{formErrors.paymentMethod}</FormHelperText>
                    )}
                  </FormControl>

                  {paymentMethod && !savedMethod && (
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={savePaymentInfo}
                          onChange={(e) => setSavePaymentInfo(e.target.checked)}
                        />
                      }
                      label={t('payment.saveForFuture')}
                      sx={{ mt: 1 }}
                    />
                  )}
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      size="large"
                      disabled={loading}
                    >
                      {loading ? t('common.processing') : t('payment.payNow')}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default Pay;