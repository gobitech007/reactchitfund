import React, { useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Divider,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAppSelector, useAppDispatch } from '../redux/hooks';
import { setDarkTheme } from '../redux/slices/themeSlice';
import { changeLanguage as setLanguage } from '../redux/slices/languageSlice';

const Settings: React.FC = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const { darkTheme } = useAppSelector(state => state.theme);
  const { currentLanguage } = useAppSelector(state => state.language);
  const { profile, loading, error, updateSuccess } = useAppSelector(state => state.user);

  useEffect(() => {
    // Set the language from Redux state
    if (currentLanguage && i18n.language !== currentLanguage ) {
      i18n.changeLanguage(currentLanguage);
    }
  }, [currentLanguage, i18n]);

  const handleThemeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newTheme = event.target.checked ? 'dark' : 'light';
    dispatch(setDarkTheme(newTheme));
  };

  const handleLanguageChange = (event: any) => {
    const newLanguage = event.target.value;
    dispatch(setLanguage(newLanguage));
  };

  const handleNotificationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    dispatch(updateUserPreferences({
      notifications: {
        email: profile?.notifications?.email ?? false,
        push: profile?.notifications?.push ?? false,
        sms: profile?.notifications?.sms ?? false,
        inApp: profile?.notifications?.inApp ?? false,
        [name]: checked,
      },
      privacy: {
        shareData: false,
        showActivity: false
      }
    }));
  };

  const handlePrivacyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    dispatch(updateUserPreferences({
      privacy: {
        shareData: profile?.privacy?.shareData ?? false,
        showActivity: profile?.privacy?.showActivity ?? false,
        [name]: checked,
      },
      notifications: {
        email: false,
        push: false,
        sms: false,
        inApp: false
      }
    }));
  };

  const handleResetSettings = () => {
    // Reset to default settings
    dispatch(setDarkTheme('light'));
    dispatch(setLanguage('en'));
    dispatch(updateUserPreferences({
      notifications: {
        email: true,
        push: true,
        sms: true,
        inApp: true,
      },
      privacy: {
        shareData: false,
        showActivity: true,
      },
    }));
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {t('navigation.settings')}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {updateSuccess && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {t('settings.updateSuccess')}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>{t('common.loading')}</Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  {t('settings.appearance')}
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <Box sx={{ mb: 3 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={darkTheme}
                        onChange={handleThemeChange}
                        name="darkMode"
                      />
                    }
                    label={t('settings.darkMode')}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {t('settings.darkModeDescription')}
                  </Typography>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <FormControl fullWidth>
                    <InputLabel id="language-select-label">{t('settings.language')}</InputLabel>
                    <Select
                      labelId="language-select-label"
                      value={currentLanguage}
                      label={t('settings.language')}
                      onChange={handleLanguageChange}
                    >
                      <MenuItem value="en">English</MenuItem>
                      <MenuItem value="hi">हिन्दी (Hindi)</MenuItem>
                      <MenuItem value="ta">தமிழ் (Tamil)</MenuItem>
                    </Select>
                  </FormControl>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {t('settings.languageDescription')}
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  {t('settings.notifications')}
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <Box sx={{ mb: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={profile?.notifications?.email || false}
                        onChange={handleNotificationChange}
                        name="email"
                      />
                    }
                    label={t('settings.emailNotifications')}
                  />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={profile?.notifications?.push || false}
                        onChange={handleNotificationChange}
                        name="push"
                      />
                    }
                    label={t('settings.pushNotifications')}
                  />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={profile?.notifications?.sms || false}
                        onChange={handleNotificationChange}
                        name="sms"
                      />
                    }
                    label={t('settings.smsNotifications')}
                  />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={profile?.notifications?.inApp || false}
                        onChange={handleNotificationChange}
                        name="inApp"
                      />
                    }
                    label={t('settings.inAppNotifications')}
                  />
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  {t('settings.privacy')}
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <Box sx={{ mb: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={profile?.privacy?.shareData || false}
                        onChange={handlePrivacyChange}
                        name="shareData"
                      />
                    }
                    label={t('settings.shareData')}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {t('settings.shareDataDescription')}
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={profile?.privacy?.showActivity || false}
                        onChange={handlePrivacyChange}
                        name="showActivity"
                      />
                    }
                    label={t('settings.showActivity')}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {t('settings.showActivityDescription')}
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={handleResetSettings}
                  sx={{ mr: 2 }}
                >
                  {t('settings.resetToDefault')}
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => console.log('Settings saved')}
                >
                  {t('common.save')}
                </Button>
              </Box>
            </Grid>
          </Grid>
        )}
      </Box>
    </Container>
  );
};

export default Settings;

function updateUserPreferences(arg0: { notifications: { email: boolean; push: boolean; sms: boolean; inApp: boolean; }; privacy: { shareData: boolean; showActivity: boolean; }; }): any {
  throw new Error('Function not implemented.');
}
