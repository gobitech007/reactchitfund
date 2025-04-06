import React from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Paper,
  SelectChangeEvent,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import CakeIcon from "@mui/icons-material/Cake";
import BadgeIcon from "@mui/icons-material/Badge";

import { validateEmail, formatMobileNumber, validateAadharNumber, formatAadharNumber, validateFullName,
    getDays, getMonths, getYears, RegisterProps, RegisterState, validateDateOfBirth,
    handleEmptyInput } from "../utils/form-utils";
import { withNavigation } from "../utils/withNavigation";
import { withTranslation } from "../utils/withTranslation";
import '../i18n';

interface RegisterPropsWithTranslation extends RegisterProps {
  t: (key: string, options?: any) => string;
}

class Register extends React.Component<RegisterPropsWithTranslation, RegisterState> {
 private days  = getDays();
 private months  = getMonths();
 private years  = getYears();
 private noData = handleEmptyInput();
  /**
   * Initializes the component's state.
   * @param {Object} props - The properties passed to the component.
   * The state includes fields for user input such as fullName, email, mobileNumber,
   * birthDay, birthMonth, birthYear, aadharNumber, and an errors object for validation errors.
   */

  constructor(props: RegisterPropsWithTranslation) {
    super(props);
    this.state = this.noData;
  }

  handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.persist();
    const { name, value } = event.target;
    if (!name) return;
    let errors = this.state.errors;

    switch (name) {
      case "fullName":
        errors.fullName = validateFullName(value as string) ? "" : (value as string).length < 3 ? "Full Name must be at least 3 characters" : "";
        break;
      case "email":
        errors.email = validateEmail(value as string) ? "" : "Please enter a valid email address";
        break;
      case "mobileNumber":
        const formattedValue = formatMobileNumber(value as string);
        this.setState({ mobileNumber: formattedValue });
        break;
      case "aadharNumber":
        errors.aadharNumber = validateAadharNumber(value as string) ? "" : "Aadhar number must be 12 digits";
        const formatedAadharNumber = formatAadharNumber(value as string);
        this.setState({ aadharNumber: formatedAadharNumber });
        break;
      default:
        break;
    }

    this.setState(
      {
        errors,
        [name]: value,
      } as Pick<RegisterState, keyof RegisterState>
    );
  };
  handleSelectChange = (event: SelectChangeEvent<string | number>) => {
    const { name, value } = event.target;
    this.setState({
      [name]: value,
    } as unknown as Pick<RegisterState, keyof RegisterState>);
  }

  // Check if the form is valid
  isFormValid = () => {
    const {
      fullName,
      email,
      mobileNumber,
      birthDay,
      birthMonth,
      birthYear,
      aadharNumber,
      errors,
    } = this.state;

    // Check if all required fields are filled
    if (
      !fullName ||
      !email ||
      !mobileNumber ||
      !birthDay ||
      !birthMonth ||
      !birthYear ||
      !aadharNumber
    ) {
      return false;
    }

    // Check if there are any validation errors
    for (const error of Object.values(errors)) {
      if (error.length > 0) {
        return false;
      }
    }

    // Check specific field validations
    if (fullName.length < 3) return false;
    if (mobileNumber.length !== 10) return false;
    if (aadharNumber.length !== 12) return false;

    // All validations passed
    return true;
  };

  handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Validate form before submission
    const {
      fullName,
      email,
      mobileNumber,
      birthDay,
      birthMonth,
      birthYear,
      aadharNumber,
      errors,
    } = this.state;
    let valid = true;

    // Validate date of birth
    const dateValidation = validateDateOfBirth(birthDay, birthMonth, birthYear);
    if (!dateValidation.isValid) {
      valid = false;
      // Update the dateOfBirth error in state
      this.setState({
        errors: {
          ...this.state.errors,
          dateOfBirth: dateValidation.error
        }
      });
    } else {
      // Clear any previous date of birth errors
      this.setState({
        errors: {
          ...this.state.errors,
          dateOfBirth: ""
        }
      });
    }

    Object.values(errors).forEach((val) => {
      if (val.length > 0) {
        valid = false;
      }
    });

    if (
      valid &&
      fullName &&
      email &&
      mobileNumber &&
      birthDay &&
      birthMonth &&
      birthYear &&
      aadharNumber
    ) {
      try {
        // Form is valid, proceed with submission
        const formData = {
          fullName,
          email,
          password: '', // This would need to be added to the form
          mobileNumber,
          dateOfBirth: `${birthYear}-${birthMonth}-${birthDay}`,
          aadharNumber: aadharNumber.replace(/\s/g, ""), // Remove spaces for submission
        };

        console.log("Registration form submitted:", formData);

        // Import AuthService dynamically to avoid circular dependencies
        const { AuthService } = await import('../services');

        // Call the register function from AuthService
        const response = await AuthService.register(formData);

        if (response.error) {
          alert(`Registration failed: ${response.error}`);
        } else {
          alert("Registration successful! Please login with your credentials.");

          // Navigate to login page after successful registration
          if (this.props.navigate) {
            this.props.navigate('/login');
          }
        }
      } catch (error) {
        console.error("Registration error:", error);
        alert(`Registration error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } else {
      console.log("Form has errors, cannot submit");
      alert("Please fill all fields correctly");
    }
  };

  handleClear = () => {    
    this.setState(this.noData);
  }

  render() {
    const { errors } = this.state;
    const { t } = this.props;

    return (
      <Container maxWidth="md">
        <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            {t('auth.registerForm')}
          </Typography>

          <Box component="form" onSubmit={this.handleSubmit} sx={{ mt: 3 }}>
            <Grid container spacing={3}>
              <Grid size={12}>
                <TextField
                  fullWidth
                  label={t('auth.fullName')}
                  name="fullName"
                  value={this.state.fullName}
                  onChange={this.handleChange}
                  error={errors.fullName !== ""}
                  helperText={errors.fullName}
                  required
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor:
                          this.state.fullName.length >= 3 &&
                          errors.fullName === ""
                            ? "green"
                            : "",
                      },
                      "&:hover fieldset": {
                        borderColor:
                          this.state.fullName.length >= 3 &&
                          errors.fullName === ""
                            ? "green"
                            : "",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor:
                          this.state.fullName.length >= 3 &&
                          errors.fullName === ""
                            ? "green"
                            : "",
                      },
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
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

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label={t('auth.mobileNumber')}
                  name="mobileNumber"
                  value={this.state.mobileNumber}
                  onChange={this.handleChange}
                  error={errors.mobileNumber !== ""}
                  helperText={errors.mobileNumber}
                  required
                  inputProps={{
                    maxLength: 10, // 10 digits
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor:
                          this.state.mobileNumber.length === 10 &&
                          errors.mobileNumber === ""
                            ? "green"
                            : "",
                      },
                      "&:hover fieldset": {
                        borderColor:
                          this.state.mobileNumber.length === 10 &&
                          errors.mobileNumber === ""
                            ? "green"
                            : "",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor:
                          this.state.mobileNumber.length === 10 &&
                          errors.mobileNumber === ""
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

              <Grid size={12}>
                <Typography
                  variant="subtitle1"
                  gutterBottom
                  sx={{ display: "flex", alignItems: "center" }}
                >
                  <CakeIcon sx={{ mr: 1 }} /> {t('auth.dateOfBirth')}
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <FormControl
                  fullWidth
                  error={errors.dateOfBirth !== ""}
                  required
                >
                  <InputLabel id="birth-day-label">{t('time.day')}</InputLabel>
                  <Select
                    labelId="birth-day-label"
                    id="birth-day"
                    name="birthDay"
                    value={this.state.birthDay}
                    label="Day"
                    onChange={this.handleSelectChange}
                  >
                    {Array.isArray(this.days) && this.days.map((day) => (
                      <MenuItem key={day} value={day}>
                        {day}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <FormControl
                  fullWidth
                  error={errors.dateOfBirth !== ""}
                  required
                >
                  <InputLabel id="birth-month-label">{t('time.month')}</InputLabel>
                  <Select
                    labelId="birth-month-label"
                    id="birth-month"
                    name="birthMonth"
                    value={this.state.birthMonth}
                    label="Month"
                    onChange={this.handleSelectChange}
                  >
                    {Array.isArray(this.months) && this.months.map((month) => (
                      <MenuItem key={month.value} value={month.value}>
                        {month.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <FormControl
                  fullWidth
                  error={errors.dateOfBirth !== ""}
                  required
                >
                  <InputLabel id="birth-year-label">{t('time.year')}</InputLabel>
                  <Select
                    labelId="birth-year-label"
                    id="birth-year"
                    name="birthYear"
                    value={this.state.birthYear}
                    label="Year"
                    onChange={this.handleSelectChange}
                  >
                    {Array.isArray(this.years) && this.years.map((year) => (
                      <MenuItem key={year} value={year}>
                        {year}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {errors.dateOfBirth && (
                  <FormHelperText error>{errors.dateOfBirth}</FormHelperText>
                )}
              </Grid>

              <Grid size={12}>
                <TextField
                  fullWidth
                  label={`${t('auth.aadharNumber')} (12 digits)`}
                  name="aadharNumber"
                  value={this.state.aadharNumber.replace(
                    /(\d{4})(?=\d)/g,
                    "$1 "
                  )}
                  onChange={this.handleChange}
                  error={errors.aadharNumber !== ""}
                  helperText={errors.aadharNumber || `${t('time.format')}": XXXX XXXX XXXX"`}
                  required
                  inputProps={{
                    maxLength: 14, // 12 digits + 2 spaces
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor:
                          this.state.aadharNumber.length === 12 &&
                          errors.aadharNumber === ""
                            ? "green"
                            : "",
                      },
                      "&:hover fieldset": {
                        borderColor:
                          this.state.aadharNumber.length === 12 &&
                          errors.aadharNumber === ""
                            ? "green"
                            : "",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor:
                          this.state.aadharNumber.length === 12 &&
                          errors.aadharNumber === ""
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
                    {t('auth.register')}
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
                  <Button
                    fullWidth
                    variant="outlined"
                    color="secondary"
                    size="large"
                    onClick={() => this.props.navigate && this.props.navigate('/login')}
                  >
                    {t('auth.login')}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Container>
    );
  }
}

export default withTranslation(withNavigation(Register));
