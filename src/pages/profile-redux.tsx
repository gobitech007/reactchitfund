import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Avatar,
  Divider,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  IconButton,
  InputAdornment,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useTranslation } from 'react-i18next';
import { useAppSelector, useAppDispatch } from '../redux/hooks';
import { fetchUserProfile, updateUserProfile, changePassword } from '../redux/slices/userSlice';
import { validateEmail, validateMobileNumber, validateAadharNumber, validateFullName } from '../utils/form-utils';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const Profile: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { profile: currentUser, loading, error, updateSuccess } = useAppSelector(state => state.user);
  const [tabValue, setTabValue] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    phone: '',
    aadharNumber: '',
    address: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [formErrors, setFormErrors] = useState({
    fullname: '',
    email: '',
    phone: '',
    aadharNumber: '',
    address: '',
  });

  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    // Fetch user profile when component mounts
    dispatch(fetchUserProfile());
  }, [dispatch]);

  useEffect(() => {
    // Update form data when user data is loaded
    if (currentUser) {
      setFormData({
        fullname: currentUser.fullName || '',
        email: currentUser.email || '',
        phone: currentUser.mobileNumber || '',
        aadharNumber: currentUser.aadharNumber || '',
        address: currentUser.address || '',
      });
    }
  }, [currentUser]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Validate input
    let error = '';
    switch (name) {
      case 'fullname':
        error = validateFullName(value) ? '' : t('validation.invalidName');
        break;
      case 'email':
        error = validateEmail(value) ? '' : t('validation.invalidEmail');
        break;
      case 'phone':
        error = validateMobileNumber(value) ? '' : t('validation.invalidPhone');
        break;
      case 'aadharNumber':
        error = validateAadharNumber(value) ? '' : t('validation.invalidAadhar');
        break;
      default:
        break;
    }

    setFormErrors({
      ...formErrors,
      [name]: error,
    });
  };

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setPasswordData({
      ...passwordData,
      [name]: value,
    });

    // Validate password fields
    let error = '';
    switch (name) {
      case 'currentPassword':
        error = value.length < 6 ? t('validation.passwordTooShort') : '';
        break;
      case 'newPassword':
        error = value.length < 6 ? t('validation.passwordTooShort') : '';
        // Also update confirm password error if it's already been entered
        if (passwordData.confirmPassword) {
          setPasswordErrors({
            ...passwordErrors,
            confirmPassword: value === passwordData.confirmPassword ? '' : t('validation.passwordsDoNotMatch'),
          });
        }
        break;
      case 'confirmPassword':
        error = value === passwordData.newPassword ? '' : t('validation.passwordsDoNotMatch');
        break;
      default:
        break;
    }

    setPasswordErrors({
      ...passwordErrors,
      [name]: error,
    });
  };

  const handleEditToggle = () => {
    setEditMode(!editMode);
    if (!editMode) {
      // Reset form data to current user data when entering edit mode
      if (currentUser) {
        setFormData({
          fullname: currentUser.fullname || '',
          email: currentUser.email || '',
          phone: currentUser.phone || '',
          aadharNumber: currentUser.aadharNumber || '',
          address: currentUser.address || '',
        });
      }
    }
  };

  const isProfileFormValid = () => {
    return !Object.values(formErrors).some(error => error !== '') &&
      formData.fullname && formData.email && formData.phone;
  };

  const isPasswordFormValid = () => {
    return !Object.values(passwordErrors).some(error => error !== '') &&
      passwordData.currentPassword && passwordData.newPassword && passwordData.confirmPassword;
  };

  const handleProfileSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isProfileFormValid()) {
      try {
        await dispatch(updateUserProfile(formData));
        setEditMode(false);
      } catch (error) {
        console.error('Profile update error:', error);
      }
    }
  };

  const handlePasswordSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isPasswordFormValid()) {
      try {
        await dispatch(changePassword({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }));
        // Reset password fields on success
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } catch (error) {
        console.error('Password change error:', error);
      }
    }
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!currentUser || !currentUser.fullname) return '?';
    return currentUser.fullname
      .split(' ')
      .map((name: string) => name.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {t('navigation.profile')}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {updateSuccess && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {t('profile.updateSuccess')}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>{t('common.loading')}</Typography>
          </Box>
        ) : (
          <Paper elevation={3} sx={{ p: 3 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabValue} onChange={handleTabChange} aria-label="profile tabs">
                <Tab label={t('profile.personalInfo')} id="profile-tab-0" aria-controls="profile-tabpanel-0" />
                <Tab label={t('profile.security')} id="profile-tab-1" aria-controls="profile-tabpanel-1" />
              </Tabs>
            </Box>

            <TabPanel value={tabValue} index={0}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar
                    sx={{
                      width: 80,
                      height: 80,
                      bgcolor: 'primary.main',
                      fontSize: '2rem',
                      mr: 2,
                    }}
                  >
                    {getUserInitials()}
                  </Avatar>
                  <Box>
                    <Typography variant="h5">{currentUser?.fullname}</Typography>
                    <Typography variant="body1" color="text.secondary">
                      {currentUser?.email}
                    </Typography>
                  </Box>
                </Box>
                <Button
                  startIcon={editMode ? <CancelIcon /> : <EditIcon />}
                  onClick={handleEditToggle}
                  color={editMode ? 'secondary' : 'primary'}
                >
                  {editMode ? t('common.cancel') : t('common.edit')}
                </Button>
              </Box>

              <Divider sx={{ mb: 3 }} />

              <Box component="form" onSubmit={handleProfileSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label={t('profile.fullname')}
                      name="fullname"
                      value={formData.fullname}
                      onChange={handleInputChange}
                      error={!!formErrors.fullname}
                      helperText={formErrors.fullname}
                      disabled={!editMode}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label={t('profile.email')}
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      error={!!formErrors.email}
                      helperText={formErrors.email}
                      disabled={!editMode}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label={t('profile.phone')}
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      error={!!formErrors.phone}
                      helperText={formErrors.phone}
                      disabled={!editMode}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label={t('profile.aadharNumber')}
                      name="aadharNumber"
                      value={formData.aadharNumber}
                      onChange={handleInputChange}
                      error={!!formErrors.aadharNumber}
                      helperText={formErrors.aadharNumber}
                      disabled={!editMode}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label={t('profile.address')}
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      error={!!formErrors.address}
                      helperText={formErrors.address}
                      disabled={!editMode}
                      multiline
                      rows={3}
                    />
                  </Grid>

                  {editMode && (
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                        <Button
                          type="submit"
                          variant="contained"
                          color="primary"
                          startIcon={<SaveIcon />}
                          disabled={!isProfileFormValid() || loading}
                        >
                          {loading ? t('common.saving') : t('common.save')}
                        </Button>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </Box>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Typography variant="h6" gutterBottom>
                {t('profile.changePassword')}
              </Typography>
              <Box component="form" onSubmit={handlePasswordSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label={t('profile.currentPassword')}
                      name="currentPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      error={!!passwordErrors.currentPassword}
                      helperText={passwordErrors.currentPassword}
                      required
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                            >
                              {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label={t('profile.newPassword')}
                      name="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      error={!!passwordErrors.newPassword}
                      helperText={passwordErrors.newPassword}
                      required
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              edge="end"
                            >
                              {showNewPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label={t('profile.confirmPassword')}
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      error={!!passwordErrors.confirmPassword}
                      helperText={passwordErrors.confirmPassword}
                      required
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              edge="end"
                            >
                              {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={!isPasswordFormValid() || loading}
                      >
                        {loading ? t('common.updating') : t('profile.updatePassword')}
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </TabPanel>
          </Paper>
        )}
      </Box>
    </Container>
  );
};

export default Profile;