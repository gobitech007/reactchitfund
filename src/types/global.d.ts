// Global type declarations
interface Window {
  login?: (formData: { email?: string;
    phone?: string;
    aadharNumber?: string; password?: string;pin?: string}) => boolean;
}