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
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import PhoneIcon from "@mui/icons-material/Phone";
import PersonIcon from "@mui/icons-material/Person";
import BadgeIcon from "@mui/icons-material/Badge";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { register } from "../redux/slices/authSlice";

import {
  validateEmail,
  validateMobileNumber,
  validateAadharNumber,
  validateFullName,
} from "../utils/form-utils";

const Register: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector(state => state.auth);

  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    phone: "",
    aadharNumber: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });

  const [errors, setErrors] = useState({
    fullname: "",
    email: "",
    phone: "",
    aadharNumber: "",
    password: "",
    confirmPassword: "",
    agreeTerms: "",
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = event.target;
    const newValue = name === "agreeTerms" ? checked : value;

    setFormData({
      ...formData,
      [name]: newValue,
    });

    let newErrors = { ...errors };

    switch (name) {
      case "fullname":
        newErrors.fullname = validateFullName(value) ? "" : "Please enter a valid name";
        break;
      case "email":
        newErrors.email = validateEmail(value) ? "" : "Please enter a valid email address";
        break;
      case "phone":
        newErrors.phone = validateMobileNumber(value) ? "" : "Please enter a valid mobile number";
        break;
      case "aadharNumber":
        newErrors.aadharNumber = validateAadharNumber(value) ? "" : "Please enter a valid Aadhar number";
        break;
      case "password":
        newErrors.password = value.length < 6 ? "Password must be at least 6 characters" : "";
        // Also update confirm password error if it's already been entered
        if (formData.confirmPassword) {
          newErrors.confirmPassword = value === formData.confirmPassword ? "" : "Passwords do not match";
        }
        break;
      case "confirmPassword":
        newErrors.confirmPassword = value === formData.password ? "" : "Passwords do not match";
        break;
      case "agreeTerms":
        newErrors.agreeTerms = checked ? "" : "You must agree to the terms and conditions";
        break;
      default:
        break;
    }

    setErrors(newErrors);
  };

  const isFormValid = () => {
    // Check if all required fields are filled
    if (
      !formData.fullname ||
      !formData.email ||
      !formData.phone ||
      !formData.aadharNumber ||
      !formData.password ||
      !formData.confirmPassword ||
      !formData.agreeTerms
    ) {
      return false;
    }

    // Check if there are any validation errors
    return !Object.values(errors).some((error) => error !== "");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isFormValid()) {
      try {
        // Form is valid, proceed with submission
        const userData = {
          fullName: formData.fullname,
          email: formData.email,
          mobileNumber: formData.phone,
          aadharNumber: formData.aadharNumber,
          password: formData.password,
          dateOfBirth: new Date().toISOString().split('T')[0], // Added missing required field
          pin: 0,
          username: formData.email.split('@')[0],
        };

        console.log("Registration form submitted:", userData);

        // Dispatch register action
        const resultAction = await dispatch(register(userData));
        
        if (register.fulfilled.match(resultAction)) {
          // Registration successful, navigate to login
          navigate('/login');
        }
      } catch (error) {
        console.error("Registration error:", error);
      }
    } else {
      console.log("Form has errors, cannot submit");
    }
  };

  const handleClear = () => {
    setFormData({
      fullname: "",
      email: "",
      phone: "",
      aadharNumber: "",
      password: "",
      confirmPassword: "",
      agreeTerms: false,
    });
    setErrors({
      fullname: "",
      email: "",
      phone: "",
      aadharNumber: "",
      password: "",
      confirmPassword: "",
      agreeTerms: "",
    });
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 8, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          {t('auth.registerForm')}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('auth.fullname')}
                name="fullname"
                value={formData.fullname}
                onChange={handleChange}
                error={errors.fullname !== ""}
                helperText={errors.fullname}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('auth.email')}
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email !== ""}
                helperText={errors.email}
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
              <TextField
                fullWidth
                label={t('auth.phone')}
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                error={errors.phone !== ""}
                helperText={errors.phone}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('auth.aadharNumber')}
                name="aadharNumber"
                value={formData.aadharNumber}
                onChange={handleChange}
                error={errors.aadharNumber !== ""}
                helperText={errors.aadharNumber}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BadgeIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('auth.password')}
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password !== ""}
                helperText={errors.password}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('auth.confirmPassword')}
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword !== ""}
                helperText={errors.confirmPassword}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="agreeTerms"
                    checked={formData.agreeTerms}
                    onChange={handleChange}
                    color="primary"
                  />
                }
                label={t('auth.agreeTerms')}
              />
              {errors.agreeTerms && (
                <Typography color="error" variant="caption" display="block">
                  {errors.agreeTerms}
                </Typography>
              )}
            </Grid>

            <Grid item xs={12}>
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
                  {loading ? t('common.loading') : t('auth.register')}
                </Button>
              </Box>
            </Grid>

            <Grid item xs={12} sx={{ mt: 2, textAlign: "center" }}>
              <Typography variant="body2">
                {t('auth.alreadyHaveAccount')}{" "}
                <Link href="/login" variant="body2">
                  {t('auth.login')}
                </Link>
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default Register;