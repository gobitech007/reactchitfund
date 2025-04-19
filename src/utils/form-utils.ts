/**
 * Form Utilities
 * 
 * This file contains utility functions for form validation and formatting
 * that can be reused across the application.
 */

/**
 * Validates an email address
 * @param email - The email address to validate
 * @returns Boolean indicating if the email is valid
 */
export const validateEmail = (email: string): boolean => {
  if (!email) {
    return false;
  }

  const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  return emailRegex.test(email.toLowerCase());
};

/**
 * Validates an email address (detailed version)
 * @param email - The email address to validate
 * @returns An object containing isValid flag and error message if invalid
 */
export const validateEmailDetailed = (email: string): { isValid: boolean; error: string } => {
  if (!email) {
    return { isValid: false, error: "Email is required" };
  }

  const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  if (!emailRegex.test(email.toLowerCase())) {
    return { isValid: false, error: "Please enter a valid email address" };
  }

  return { isValid: true, error: "" };
};

/**
 * Validates a full name
 * @param name - The full name to validate
 * @param minLength - Minimum required length (default: 3)
 * @returns An object containing isValid flag and error message if invalid
 */
export const validateFullName = (name: string, minLength: number = 3): { isValid: boolean; error: string } => {
  if (!name) {
    return { isValid: false, error: "Full Name is required" };
  }
  
  if (name.length < minLength) {
    return { isValid: false, error: `Full Name must be at least ${minLength} characters` };
  }
  
  return { isValid: true, error: "" };
};

/**
 * Validates a mobile number
 * @param number - The mobile number to validate
 * @param requiredLength - Required length of the number (default: 10)
 * @returns Boolean indicating if the mobile number is valid
 */
export const validateMobileNumber = (number: string, requiredLength: number = 10): boolean => {
  if (!number) {
    return false;
  }

  // Remove any non-digit characters for validation
  const digitsOnly = number.replace(/\D/g, "");
  const phoneRegex = new RegExp(`^[0-9]{${requiredLength}}$`);

  return phoneRegex.test(digitsOnly);
};

/**
 * Validates a mobile number (detailed version)
 * @param number - The mobile number to validate
 * @param requiredLength - Required length of the number (default: 10)
 * @returns An object containing isValid flag and error message if invalid
 */
export const validateMobileNumberDetailed = (number: string, requiredLength: number = 10): { isValid: boolean; error: string } => {
  if (!number) {
    return { isValid: false, error: "Mobile number is required" };
  }

  // Remove any non-digit characters for validation
  const digitsOnly = number.replace(/\D/g, "");
  const phoneRegex = new RegExp(`^[0-9]{${requiredLength}}$`);

  if (!phoneRegex.test(digitsOnly)) {
    return { isValid: false, error: `Mobile number must be ${requiredLength} digits` };
  }

  return { isValid: true, error: "" };
};

/**
 * Validates an Aadhar number
 * @param number - The Aadhar number to validate
 * @returns Boolean indicating if the Aadhar number is valid
 */
export const validateAadharNumber = (number: string): boolean => {
  if (!number) {
    return false;
  }

  // Remove any non-digit characters for validation
  const digitsOnly = number.replace(/\D/g, "");
  const aadharRegex = /^[0-9]{12}$/;

  return aadharRegex.test(digitsOnly);
};

/**
 * Validates an Aadhar number (detailed version)
 * @param number - The Aadhar number to validate
 * @returns An object containing isValid flag and error message if invalid
 */
export const validateAadharNumberDetailed = (number: string): { isValid: boolean; error: string } => {
  if (!number) {
    return { isValid: false, error: "Aadhar number is required" };
  }

  // Remove any non-digit characters for validation
  const digitsOnly = number.replace(/\D/g, "");
  const aadharRegex = /^[0-9]{12}$/;

  if (!aadharRegex.test(digitsOnly)) {
    return { isValid: false, error: "Aadhar number must be 12 digits" };
  }

  return { isValid: true, error: "" };
};

/**
 * Formats a mobile number with spaces
 * @param number - The mobile number to format
 * @returns Formatted mobile number with spaces
 */
export const formatMobileNumber = (number?: string): string => {
  if (!number) return '';
  
  // Remove any non-digit characters
  const digitsOnly = number.replace(/\D/g, "");
  
  // Format with a space after every 3 digits (XXX XXX XXXX)
  return digitsOnly.replace(/(\d{3})(?=\d)/g, "$1 ").trim();
};

/**
 * Formats an Aadhar number with spaces
 * @param number - The Aadhar number to format
 * @returns Formatted Aadhar number with spaces
 */
export const formatAadharNumber = (number: string): string => {
  // Remove any non-digit characters
  const digitsOnly = number.replace(/\D/g, "");
  
  // Format with a space after every 4 digits (XXXX XXXX XXXX)
  return digitsOnly.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
};

/**
 * Validates a date of birth
 * @param day - Day of birth
 * @param month - Month of birth
 * @param year - Year of birth
 * @param minAge - Minimum required age (default: 18)
 * @returns An object containing isValid flag and error message if invalid
 */
export const validateDateOfBirth = (
  day: number | string,
  month: number | string,
  year: number | string,
  minAge: number = 18
): { isValid: boolean; error: string } => {
  // Convert to numbers if they are strings
  const dayNum = typeof day === 'string' ? parseInt(day, 10) : day;
  const monthNum = typeof month === 'string' ? parseInt(month, 10) : month;
  const yearNum = typeof year === 'string' ? parseInt(year, 10) : year;
  
  // Check if all parts are provided
  if (!dayNum || !monthNum || !yearNum) {
    if (dayNum || monthNum || yearNum) {
      return { isValid: false, error: "Please complete the date of birth" };
    }
    return { isValid: true, error: "" }; // All empty is valid (if not required)
  }
  
  // Check if the date is valid
  const date = new Date(yearNum, monthNum - 1, dayNum);
  const isValidDate =
    date.getFullYear() === yearNum &&
    date.getMonth() === monthNum - 1 &&
    date.getDate() === dayNum;
  
  if (!isValidDate) {
    return { isValid: false, error: "Invalid date" };
  }
  
  // Check age requirements
  const today = new Date();
  const birthDate = new Date(yearNum, monthNum - 1, dayNum);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  if (age < minAge) {
    return { isValid: false, error: `You must be at least ${minAge} years old` };
  } else if (age > 120) {
    return { isValid: false, error: "Invalid age" };
  }
  
  return { isValid: true, error: "" };
};

/**
 * Generates an array of days (1-31) for dropdown selection
 * @returns Array of days
 */
export const getDays = (): number[] => {
  const days: number[] = [];
  for (let i = 1; i <= 31; i++) {
    days.push(i);
  }
  return days;
};

/**
 * Generates an array of months for dropdown selection
 * @returns Array of month objects with value and label
 */
export const getMonths = (): { value: number; label: string }[] => {
  return [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];
};

/**
 * Generates an array of years for dropdown selection
 * @param range - Number of years to include in the past (default: 100)
 * @returns Array of years
 */
export const getYears = (range: number = 100): number[] => {
  const years = [];
  const currentYear = new Date().getFullYear();
  for (let i = currentYear; i >= currentYear - range; i--) {
    years.push(i);
  }
  return years;
};

/**
 * Formats a date string from separate day, month, and year values
 * @param day - Day value
 * @param month - Month value
 * @param year - Year value
 * @param format - Output format (default: 'yyyy-mm-dd')
 * @returns Formatted date string
 */
export const formatDate = (
  day: number | string,
  month: number | string,
  year: number | string,
  format: string = 'yyyy-mm-dd'
): string => {
  // Ensure values are padded with leading zeros if needed
  const dayStr = String(day).padStart(2, '0');
  const monthStr = String(month).padStart(2, '0');
  const yearStr = String(year);
  
  switch (format.toLowerCase()) {
    case 'dd/mm/yyyy':
      return `${dayStr}/${monthStr}/${yearStr}`;
    case 'mm/dd/yyyy':
      return `${monthStr}/${dayStr}/${yearStr}`;
    case 'dd-mm-yyyy':
      return `${dayStr}-${monthStr}-${yearStr}`;
    case 'yyyy/mm/dd':
      return `${yearStr}/${monthStr}/${dayStr}`;
    case 'yyyy-mm-dd':
    default:
      return `${yearStr}-${monthStr}-${dayStr}`;
  }
};// Define types for the component props
export interface RegisterProps {
  navigate?: (path: string) => void;
}

// Define types for the month object
export interface Month {
  value: number;
  label: string;
}

// Define types for the form errors
export interface FormErrors {
  fullName: string;
  email: string;
  mobileNumber: string;
  dateOfBirth: string;
  aadharNumber: string;
}

// Define types for the component state
export interface RegisterState {
  fullName: string;
  email: string;
  mobileNumber: string;
  birthDay: number | string;
  birthMonth: number | string;
  birthYear: number | string;
  aadharNumber: string;
  pin: string;
  errors: FormErrors;
}

// Define type for form submission data
export interface FormData {
  fullName: string;
  email: string;
  mobileNumber: string;
  dateOfBirth: string;
  aadharNumber: string;
}

export const handleEmptyInput = (): RegisterState => {
  return {
    fullName: "",
    email: "",
    mobileNumber: "",
    birthDay: "",
    birthMonth: "",
    birthYear: "",
    aadharNumber: "",
    pin: "",
    errors: {
      fullName: "",
      email: "",
      mobileNumber: "",
      dateOfBirth: "",
      aadharNumber: "",
    },
  }
}
