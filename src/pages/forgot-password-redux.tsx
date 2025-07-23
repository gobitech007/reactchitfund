import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  InputAdornment,
  Paper,
  Link,
  Alert,
  Grid,
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { requestPasswordReset } from "../redux/slices/authSlice";

import { validateEmail } from "../utils/form-utils";

const ForgotPassword: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector(state => state.auth);

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [resetSent, setResetSent] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setEmail(value);
    setEmailError(validateEmail(value) ? "" : "Please enter a valid email address");
  };

  const isFormValid = () => {
    return email && !emailError;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isFormValid()) {
      try {
        // Dispatch password reset request action
        const resultAction = await dispatch(requestPasswordReset(email));
        
        if (requestPasswordReset.fulfilled.match(resultAction)) {
          // Reset request successful
          setResetSent(true);
        }
      } catch (error) {
        console.error("Password reset request error:", error);
      }
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          {t('auth.forgotPasswordTitle')}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {resetSent ? (
          <Box sx={{ mt: 3 }}>
            <Alert severity="success" sx={{ mb: 2 }}>
              {t('auth.resetLinkSent')}
            </Alert>
            <Typography variant="body1" paragraph>
              {t('auth.checkEmail')}
            </Typography>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={() => navigate('/login')}
              sx={{ mt: 2 }}
            >
              {t('auth.backToLogin')}
            </Button>
          </Box>
        ) : (
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <Typography variant="body1" paragraph>
              {t('auth.forgotPasswordInstructions')}
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('auth.email')}
                  name="email"
                  type="email"
                  value={email}
                  onChange={handleChange}
                  error={emailError !== ""}
                  helperText={emailError}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => navigate('/login')}
                    disabled={loading}
                  >
                    {t('common.cancel')}
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={!isFormValid() || loading}
                  >
                    {loading ? t('common.loading') : t('auth.sendResetLink')}
                  </Button>
                </Box>
              </Grid>

              <Grid item xs={12} sx={{ mt: 2, textAlign: "center" }}>
                <Typography variant="body2">
                  {t('auth.rememberPassword')}{" "}
                  <Link href="/login" variant="body2">
                    {t('auth.login')}
                  </Link>
                </Typography>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default ForgotPassword;