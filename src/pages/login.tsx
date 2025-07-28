import React from "react";
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
  IconButton,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import PhoneIcon from "@mui/icons-material/Phone";
import BadgeIcon from "@mui/icons-material/Badge";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

import { validateEmail, validateMobileNumber, validateAadharNumber } from "../utils/form-utils";
import { withNavigation } from "../utils/withNavigation";
import { withTranslation } from "../utils/withTranslation";
import '../i18n';

interface LoginProps {
  navigate?: (path: string) => void;
}

interface LoginPropsWithTranslation extends LoginProps {
  t: (key: string, options?: any) => string;
}

interface LoginState {
  loginMethod: 'email' | 'mobile' | 'aadhar';
  email: string;
  phone: string;
  aadharNumber: string;
  password: string;
  showPassword: boolean;
  errors: {
    email: string;
    phone: string;
    aadharNumber: string;
    password: string;
  };
}

class Login extends React.Component<LoginPropsWithTranslation, LoginState> {
  constructor(props: LoginPropsWithTranslation) {
    super(props);
    this.state = {
      loginMethod: 'mobile',
      email: "",
      phone: "",
      aadharNumber: "",
      password: "",
      showPassword: false,
      errors: {
        email: "",
        phone: "",
        aadharNumber: "",
        password: "",
      },
    };
  }

  handleTabChange = (event: React.SyntheticEvent, newValue: 'email' | 'mobile' | 'aadhar') => {
    this.setState({ loginMethod: newValue });
  };

  handleTogglePasswordVisibility = () => {
    this.setState(prevState => ({
      showPassword: !prevState.showPassword
    }));
  };

  handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.persist();
    const { name, value } = event.target;
    if (!name) return;
    let errors = this.state.errors;

    switch (name) {
      case "email":
        errors.email = validateEmail(value) ? "" : "Please enter a valid email address";
        break;
      case "phone":
        errors.phone = validateMobileNumber(value) ? "" : "Please enter a valid mobile number";
        break;
      case "aadharNumber":
        errors.aadharNumber = validateAadharNumber(value) ? "" : "Please enter a valid Aadhar number";
        break;
      case "password":
        errors.password = value.length < 4 ? "Password must be at least 4 characters" : "";
        break;
      default:
        break;
    }

    this.setState(prevState => ({
      ...prevState,
      errors,
      [name]: value,
    }));
  };

  isFormValid = () => {
    const { loginMethod, email, phone, aadharNumber, password, errors } = this.state;

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

  handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const { loginMethod, email, phone, aadharNumber, password } = this.state;

    if (this.isFormValid()) {
      try {
        // Form is valid, proceed with submission
        const credentials: {
          email?: string;
          phone?: string;
          aadharNumber?: string;
          password?: string;
          pin?: string;
        } = {};

        // Add password if provided
        if (password) {
          credentials.password = password;
        }

        // Add the appropriate identifier based on login method
        if (loginMethod === 'email') {
          credentials.email = email;
        } else if (loginMethod === 'mobile') {
          credentials.phone = phone;
        } else if (loginMethod === 'aadhar') {
          credentials.aadharNumber = aadharNumber;
        }

        console.log("Login form submitted:", credentials);

        // Import AuthService dynamically to avoid circular dependencies
        const { AuthService } = await import('../services');

        // Get the login function from context through window
        // This is a workaround since we're using class components with TypeScript
        if (window.login) {
          // Show loading state (could add a loading state to component)
          const loginCredentials = {
            ...credentials
          };

          const success = await window.login(loginCredentials);

          if (success) {
            if (this.props.navigate) {
              this.props.navigate('/dashboard');
            }
            // Navigation is now handled in the AuthContext
            // No need to navigate here as it's done in the context
          } else {
            // Handle login failure
            alert("Login failed. Please check your credentials.");
          }
        } else {
          // Fallback for when context is not available - use AuthService directly
          console.log("Auth context not available, using AuthService directly");

          const response = await AuthService.login(credentials);

          if (response.error) {
            alert(`Login failed: ${response.error}`);
          } else {
            alert("Login successful!");
            
            // Store the token in localStorage (already done in AuthService.login)
            
            // Store user data if available
            // if (response.data && response.data.user) {
            //   localStorage.setItem('user', JSON.stringify(response.data.user));
            // }
            
            // Navigate to dashboard
            if (this.props.navigate) {
              this.props.navigate('/dashboard');
            }
          }
        }
      } catch (error) {
        console.error("Login error:", error);
        alert(`Login error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } else {
      console.log("Form has errors, cannot submit");
      alert("Please fill all fields correctly");
    }
  };

  handleClear = () => {
    this.setState({
      email: "",
      phone: "",
      aadharNumber: "",
      password: "",
      showPassword: false,
      errors: {
        email: "",
        phone: "",
        aadharNumber: "",
        password: "",
      },
    });
  };

  render() {
    const { loginMethod, errors } = this.state;
    const { t } = this.props;

    return (
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            {t('auth.loginForm')}
          </Typography>

          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs
              value={loginMethod}
              onChange={this.handleTabChange}
              variant="fullWidth"
              aria-label="login method tabs"
            >
              <Tab value="mobile" label={t('auth.mobile')} />
              <Tab value="email" label={t('auth.email')} />
              <Tab value="aadhar" label={t('auth.aadhar')} />
            </Tabs>
          </Box>

          <Box component="form" onSubmit={this.handleSubmit} sx={{ mt: 3 }}>
            <Grid container spacing={3}>
              {loginMethod === 'mobile' && (
                <Grid size={12}>
                  <TextField
                    fullWidth
                    label={t('auth.phone')}
                    name="phone"
                    type="tel"
                    value={this.state.phone}
                    onChange={this.handleChange}
                    error={errors.phone !== ""}
                    helperText={errors.phone}
                    required
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": {
                          borderColor:
                            this.state.phone && errors.phone === ""
                              ? "green"
                              : "",
                        },
                        "&:hover fieldset": {
                          borderColor:
                            this.state.phone && errors.phone === ""
                              ? "green"
                              : "",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor:
                            this.state.phone && errors.phone === ""
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

              {loginMethod === 'email' && (
                <Grid size={12}>
                  <TextField
                    fullWidth
                    label={t('auth.email')}
                    name="email"
                    type="email"
                    value={this.state.email}
                    onChange={this.handleChange}
                    error={errors.email !== ""}
                    helperText={errors.email}
                    required
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": {
                          borderColor:
                            this.state.email && errors.email === ""
                              ? "green"
                              : "",
                        },
                        "&:hover fieldset": {
                          borderColor:
                            this.state.email && errors.email === ""
                              ? "green"
                              : "",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor:
                            this.state.email && errors.email === ""
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

              {loginMethod === 'aadhar' && (
                <Grid size={12}>
                  <TextField
                    fullWidth
                    label={t('auth.aadharNumber')}
                    name="aadharNumber"
                    type="text"
                    value={this.state.aadharNumber}
                    onChange={this.handleChange}
                    error={errors.aadharNumber !== ""}
                    helperText={errors.aadharNumber}
                    required
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": {
                          borderColor:
                            this.state.aadharNumber && errors.aadharNumber === ""
                              ? "green"
                              : "",
                        },
                        "&:hover fieldset": {
                          borderColor:
                            this.state.aadharNumber && errors.aadharNumber === ""
                              ? "green"
                              : "",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor:
                            this.state.aadharNumber && errors.aadharNumber === ""
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
                  type={this.state.showPassword ? "text" : "password"}
                  value={this.state.password}
                  onChange={this.handleChange}
                  error={errors.password !== ""}
                  helperText={errors.password}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor:
                          this.state.password.length >= 6 &&
                          errors.password === ""
                            ? "green"
                            : "",
                      },
                      "&:hover fieldset": {
                        borderColor:
                          this.state.password.length >= 6 &&
                          errors.password === ""
                            ? "green"
                            : "",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor:
                          this.state.password.length >= 6 &&
                          errors.password === ""
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
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={this.handleTogglePasswordVisibility}
                          edge="end"
                          size="small"
                        >
                          {this.state.showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid size={12}>
                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    size="large"
                    disabled={!this.isFormValid()}
                  >
                    {t('auth.login')}
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="error"
                    size="large"
                    onClick={this.handleClear}
                  >
                    {t('auth.clear')}
                  </Button>
                </Box>
              </Grid>

              <Grid size={12} sx={{ mt: 2, textAlign: 'center' }}>
                <Typography variant="body2">
                  <Link
                    underline="hover"
                    sx={{ cursor: 'pointer' }}
                    onClick={() => this.props.navigate && this.props.navigate('/forgot-password')}
                  >
                    {t('auth.forgotPassword')}
                  </Link>
                </Typography>
              </Grid>

              <Grid size={12} sx={{ mt: 1, textAlign: 'center' }}>
                <Typography variant="body2">
                {t('auth.dontHaveAccount')}{' '}
                  <Link
                    underline="hover"
                    sx={{ cursor: 'pointer' }}
                    onClick={() => this.props.navigate && this.props.navigate('/register')}
                  >
                     {t('auth.registerHere')}
                  </Link>
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Container>
    );
  }
}

export default withTranslation(withNavigation(Login));