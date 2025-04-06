import React from "react";
import { Link } from "react-router-dom";
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  InputAdornment,
  Paper,
  Alert,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import EmailIcon from "@mui/icons-material/Email";
import { validateEmail } from "../utils/form-utils";
import { withNavigation } from "../utils/withNavigation";
import { withTranslation } from "../utils/withTranslation";
import '../i18n';

interface ForgotPasswordProps {
  navigate?: (path: string) => void;
}

interface ForgotPasswordPropsWithTranslation extends ForgotPasswordProps {
  t: (key: string, options?: any) => string;
}

interface ForgotPasswordState {
  email: string;
  error: string;
  isSubmitted: boolean;
}

class ForgotPassword extends React.Component<ForgotPasswordPropsWithTranslation, ForgotPasswordState> {
  constructor(props: ForgotPasswordPropsWithTranslation) {
    super(props);
    this.state = {
      email: "",
      error: "",
      isSubmitted: false,
    };
  }

  handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    const error = validateEmail(value) ? "" : this.props.t('validation.invalidEmail');

    this.setState({
      email: value,
      error,
      isSubmitted: false,
    });
  };

  isFormValid = () => {
    const { email, error } = this.state;
    return email.length > 0 && error === "";
  };

  handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const { email } = this.state;

    if (this.isFormValid()) {
      // Form is valid, proceed with submission
      console.log("Forgot password form submitted for:", email);
      // Here you would typically make an API call to send a password reset email
      this.setState({ isSubmitted: true });
    } else {
      this.setState({
        error: this.props.t('validation.invalidEmail'),
      });
    }
  };

  handleClear = () => {
    this.setState({
      email: "",
      error: "",
      isSubmitted: false,
    });
  };

  render() {
    const { email, error, isSubmitted } = this.state;
    const { t } = this.props;

    return (
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            {t('auth.forgotPasswordForm')}
          </Typography>

          <Typography variant="body1" sx={{ mb: 3, textAlign: 'center' }}>
            {t('auth.passwordResetInstructions')}
          </Typography>

          {isSubmitted && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {t('auth.resetLinkSent', { email })}
            </Alert>
          )}

          <Box component="form" onSubmit={this.handleSubmit} sx={{ mt: 3 }}>
            <Grid container spacing={3}>
              <Grid size={12}>
                <TextField
                  fullWidth
                  label={t('auth.email')}
                  name="email"
                  type="email"
                  value={email}
                  onChange={this.handleChange}
                  error={error !== ""}
                  helperText={error}
                  required
                  disabled={isSubmitted}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor:
                          email && error === ""
                            ? "green"
                            : "",
                      },
                      "&:hover fieldset": {
                        borderColor:
                          email && error === ""
                            ? "green"
                            : "",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor:
                          email && error === ""
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

              <Grid size={12}>
                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    size="large"
                    disabled={!this.isFormValid() || isSubmitted}
                  >
                    {isSubmitted ? t('auth.emailSent') : t('auth.sendResetLink')}
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="error"
                    size="large"
                    onClick={this.handleClear}
                    disabled={isSubmitted}
                  >
                    {t('auth.clear')}
                  </Button>
                </Box>
              </Grid>

              <Grid size={12} sx={{ mt: 2, textAlign: 'center' }}>
                <Typography variant="body2">
                  {t('auth.rememberPassword')}{' '}
                  <Link
                    to="/login"
                  >
                    {t('auth.backToLogin')}
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

export default withTranslation(withNavigation(ForgotPassword));