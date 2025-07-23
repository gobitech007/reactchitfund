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
  Tabs,
  Tab,
  Alert,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import PhoneIcon from "@mui/icons-material/Phone";
import BadgeIcon from "@mui/icons-material/Badge";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { login } from "../redux/slices/authSlice";

import { validateEmail, validateMobileNumber, validateAadharNumber } from "../utils/form-utils";

const Login: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector(state => state.auth);

  const [loginMethod, setLoginMethod] = useState<'email' | 'mobile' | 'aadhar'>('email');
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [aadharNumber, setAadharNumber] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({
    email: "",
    phone: "",
    aadharNumber: "",
    password: "",
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: 'email' | 'mobile' | 'aadhar') => {
    setLoginMethod(newValue);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    if (!name) return;

    let newErrors = { ...errors };

    switch (name) {
      case "email":
        newErrors.email = validateEmail(value) ? "" : "Please enter a valid email address";
        setEmail(value);
        break;
      case "phone":
        newErrors.phone = validateMobileNumber(value) ? "" : "Please enter a valid mobile number";
        setPhone(value);
        break;
      case "aadharNumber":
        newErrors.aadharNumber = validateAadharNumber(value) ? "" : "Please enter a valid Aadhar number";
        setAadharNumber(value);
        break;
      case "password":
        newErrors.password = value.length < 4 ? "Password must be at least 4 characters" : "";
        setPassword(value);
        break;
      default:
        break;
    }

    setErrors(newErrors);
  };

  const isFormValid = () => {
    // Check if the selected identifier is filled
    if (
      (loginMethod === 'email' && !email) ||
      (loginMethod === 'mobile' && !phone) ||
      (loginMethod === 'aadhar' && !aadharNumber)
    ) {
      return false;
    }

    // Check if there are any validation errors for the current login method
    if (
      (loginMethod === 'email' && errors.email) ||
      (loginMethod === 'mobile' && errors.phone) ||
      (loginMethod === 'aadhar' && errors.aadharNumber) ||
      (password && errors.password)
    ) {
      return false;
    }

    // Check specific field validations for password if it's provided
    if (password && password.length < 4) return false;

    // All validations passed
    return true;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isFormValid()) {
      try {
        // Form is valid, proceed with submission
        const credentials: {
          username: string;
          email?: string;
          phone?: string;
          aadharNumber?: string;
          password?: string;
        } = { username: ''};

        // Add password if provided
        if (password) {
          credentials.password = password;
        }

        // Add the appropriate identifier based on login method
        if (loginMethod === 'email') {
          credentials.email = email;
          credentials.username = email; // Some backends expect username field
        } else if (loginMethod === 'mobile') {
          credentials.phone = phone;
          credentials.username = phone; // Some backends expect username field
        } else if (loginMethod === 'aadhar') {
          credentials.aadharNumber = aadharNumber;
          credentials.username = aadharNumber; // Some backends expect username field
        }

        console.log("Login form submitted:", credentials);

        // Dispatch login action
        const resultAction = await dispatch(login(credentials));
        
        if (login.fulfilled.match(resultAction)) {
          // Login successful, navigate to dashboard
          navigate('/dashboard');
        }
      } catch (error) {
        console.error("Login error:", error);
      }
    } else {
      console.log("Form has errors, cannot submit");
    }
  };

  const handleClear = () => {
    setEmail("");
    setPhone("");
    setAadharNumber("");
    setPassword("");
    setErrors({
      email: "",
      phone: "",
      aadharNumber: "",
      password: "",
    });
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          {t('auth.loginForm')}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs
            value={loginMethod}
            onChange={handleTabChange}
            variant="fullWidth"
            aria-label="login method tabs"
          >
            <Tab value="email" label={t('auth.email')} />
            <Tab value="mobile" label={t('auth.mobile')} />
            <Tab value="aadhar" label={t('auth.aadhar')} />
          </Tabs>
        </Box>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Grid container spacing={3}>
            {loginMethod === 'email' && (
              <Grid size={12}>
                <TextField
                  fullWidth
                  label={t('auth.email')}
                  name="email"
                  type="email"
                  value={email}
                  onChange={handleChange}
                  error={errors.email !== ""}
                  helperText={errors.email}
                  required
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor:
                          email && errors.email === ""
                            ? "green"
                            : "",
                      },
                      "&:hover fieldset": {
                        borderColor:
                          email && errors.email === ""
                            ? "green"
                            : "",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor:
                          email && errors.email === ""
                            ? "green"
                            : "",
                      },
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            )}

            {loginMethod === 'mobile' && (
              <Grid size={12}>
                <TextField
                  fullWidth
                  label={t('auth.phone')}
                  name="phone"
                  type="tel"
                  value={phone}
                  onChange={handleChange}
                  error={errors.phone !== ""}
                  helperText={errors.phone}
                  required
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor:
                          phone && errors.phone === ""
                            ? "green"
                            : "",
                      },
                      "&:hover fieldset": {
                        borderColor:
                          phone && errors.phone === ""
                            ? "green"
                            : "",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor:
                          phone && errors.phone === ""
                            ? "green"
                            : "",
                      },
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            )}

            {loginMethod === 'aadhar' && (
              <Grid size={12}>
                <TextField
                  fullWidth
                  label={t('auth.aadharNumber')}
                  name="aadharNumber"
                  type="text"
                  value={aadharNumber}
                  onChange={handleChange}
                  error={errors.aadharNumber !== ""}
                  helperText={errors.aadharNumber}
                  required
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor:
                          aadharNumber && errors.aadharNumber === ""
                            ? "green"
                            : "",
                      },
                      "&:hover fieldset": {
                        borderColor:
                          aadharNumber && errors.aadharNumber === ""
                            ? "green"
                            : "",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor:
                          aadharNumber && errors.aadharNumber === ""
                            ? "green"
                            : "",
                      },
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BadgeIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            )}

            <Grid size={12}>
              <TextField
                fullWidth
                label={`${t('auth.password')} (${t('common.optional')})`}
                name="password"
                type="password"
                value={password}
                onChange={handleChange}
                error={errors.password !== ""}
                helperText={errors.password}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor:
                        password && errors.password === ""
                          ? "green"
                          : "",
                    },
                    "&:hover fieldset": {
                      borderColor:
                        password && errors.password === ""
                          ? "green"
                          : "",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor:
                        password && errors.password === ""
                          ? "green"
                          : "",
                    },
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid size={12}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={handleClear}
                  disabled={loading}
                >
                  {t('common.clear')}
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={!isFormValid() || loading}
                >
                  {loading ? t('common.loading') : t('auth.login')}
                </Button>
              </Box>
            </Grid>

            <Grid size={12} sx={{ mt: 2, textAlign: "center" }}>
              <Link href="/forgot-password" variant="body2">
                {t('auth.forgotPassword')}
              </Link>
            </Grid>

            <Grid size={12} sx={{ mt: 1, textAlign: "center" }}>
              <Typography variant="body2">
                {t('auth.noAccount')}{" "}
                <Link href="/register" variant="body2">
                  {t('auth.register')}
                </Link>
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;