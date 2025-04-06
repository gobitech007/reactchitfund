// Global type declarations
interface Window {
  login?: (formData: { email?: string;
    mobileNumber?: string;
    aadharNumber?: string; password?: string}) => boolean;
}