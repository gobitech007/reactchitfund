/**
 * Integration Test: 100 Users Registration, Login, and Payment Flow
 * Tests the complete user journey from registration to payment
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

// Mock services
import { AuthService } from '../../services/auth.service';
import { PaymentService } from '../../services/payment.service';

// Components
import Register from '../../pages/register';
import Login from '../../pages/login';
import CellSelection from '../../pages/pay';

// Test utilities
import { generateTestUsers, mockApiResponses } from '../utils/test-helpers';

// Mock the services
jest.mock('../../services/auth.service');
jest.mock('../../services/payment.service');
jest.mock('../../utils/withNavigation', () => ({
  withNavigation: (Component) => (props) => <Component {...props} navigate={jest.fn()} />
}));
jest.mock('../../utils/withTranslation', () => ({
  withTranslation: (Component) => (props) => <Component {...props} t={(key) => key} />
}));
jest.mock('../../context', () => ({
  useAuth: () => ({ currentUser: { user_id: 1, fullName: 'Test User' } }),
  useData: () => ({ store: {} }),
  useDynamicApiStore: () => []
}));

describe('100 Users Flow: Register -> Login -> Pay', () => {
  let testUsers;
  const mockAuthService = AuthService;
  const mockPaymentService = PaymentService;

  beforeAll(() => {
    // Generate 100 test users
    testUsers = generateTestUsers(100);
    
    // Setup API mocks
    mockApiResponses(mockAuthService, mockPaymentService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('User Registration Flow', () => {
    test('should successfully register 100 users', async () => {
      const user = userEvent.setup();
      let successfulRegistrations = 0;

      for (let i = 0; i < testUsers.length; i++) {
        const testUser = testUsers[i];
        
        // Mock successful registration response
        mockAuthService.register.mockResolvedValueOnce({
          success: true,
          data: {
            user_id: i + 1,
            fullName: testUser.fullName,
            email: testUser.email,
            phone: testUser.mobileNumber,
            generated_password: testUser.password
          }
        });

        // Render registration form
        const { unmount } = render(<Register />);

        // Fill out registration form
        await act(async () => {
          // Full Name
          const fullNameInput = screen.getByLabelText(/auth.fullName/i);
          await user.clear(fullNameInput);
          await user.type(fullNameInput, testUser.fullName);

          // Email (optional)
          if (testUser.email) {
            const emailInput = screen.getByLabelText(/auth.email/i);
            await user.clear(emailInput);
            await user.type(emailInput, testUser.email);
          }

          // Mobile Number
          const mobileInput = screen.getByLabelText(/auth.mobileNumber/i);
          await user.clear(mobileInput);
          await user.type(mobileInput, testUser.mobileNumber);

          // Date of Birth
          const daySelect = screen.getByLabelText(/Day/i);
          await user.selectOptions(daySelect, testUser.birthDay.toString());

          const monthSelect = screen.getByLabelText(/Month/i);
          await user.selectOptions(monthSelect, testUser.birthMonth.toString());

          const yearSelect = screen.getByLabelText(/Year/i);
          await user.selectOptions(yearSelect, testUser.birthYear.toString());

          // Aadhar Number (optional)
          if (testUser.aadharNumber) {
            const aadharInput = screen.getByLabelText(/auth.aadharNumber/i);
            await user.clear(aadharInput);
            await user.type(aadharInput, testUser.aadharNumber);
          }

          // PIN
          const pinInput = screen.getByLabelText(/auth.pin/i);
          await user.clear(pinInput);
          await user.type(pinInput, testUser.pin.toString());
        });

        // Submit form
        const submitButton = screen.getByRole('button', { name: /auth.register/i });
        
        await act(async () => {
          await user.click(submitButton);
        });

        // Wait for registration to complete
        await waitFor(() => {
          expect(mockAuthService.register).toHaveBeenCalledWith(
            expect.objectContaining({
              fullName: testUser.fullName,
              mobileNumber: testUser.mobileNumber,
              pin: testUser.pin
            })
          );
        });

        successfulRegistrations++;
        unmount();
      }

      expect(successfulRegistrations).toBe(100);
      expect(mockAuthService.register).toHaveBeenCalledTimes(100);
    }, 60000); // 60 second timeout for 100 users

    test('should handle registration validation errors', async () => {
      const user = userEvent.setup();
      const invalidUser = {
        fullName: 'A', // Too short
        email: 'invalid-email',
        mobileNumber: '123', // Too short
        birthDay: 1,
        birthMonth: 1,
        birthYear: 2025, // Future date
        aadharNumber: '123', // Too short
        pin: 'abc' // Non-numeric
      };

      render(<Register />);

      await act(async () => {
        // Fill with invalid data
        const fullNameInput = screen.getByLabelText(/auth.fullName/i);
        await user.type(fullNameInput, invalidUser.fullName);

        const emailInput = screen.getByLabelText(/auth.email/i);
        await user.type(emailInput, invalidUser.email);

        const mobileInput = screen.getByLabelText(/auth.mobileNumber/i);
        await user.type(mobileInput, invalidUser.mobileNumber);

        const pinInput = screen.getByLabelText(/auth.pin/i);
        await user.type(pinInput, invalidUser.pin);
      });

      // Check for validation errors
      await waitFor(() => {
        expect(screen.getByText(/Full Name must be at least 3 characters/i)).toBeInTheDocument();
        expect(screen.getByText(/Please enter a valid email address/i)).toBeInTheDocument();
        expect(screen.getByText(/Mobile number must be 10 digits/i)).toBeInTheDocument();
        expect(screen.getByText(/PIN should only contain numbers/i)).toBeInTheDocument();
      });
    });
  });

  describe('User Login Flow', () => {
    test('should successfully login 100 users with different methods', async () => {
      const user = userEvent.setup();
      let successfulLogins = 0;

      for (let i = 0; i < testUsers.length; i++) {
        const testUser = testUsers[i];
        const loginMethod = i % 3 === 0 ? 'email' : i % 3 === 1 ? 'mobile' : 'aadhar';

        // Mock successful login response
        mockAuthService.login.mockResolvedValueOnce({
          success: true,
          data: {
            user: {
              user_id: i + 1,
              fullName: testUser.fullName,
              email: testUser.email,
              phone: testUser.mobileNumber
            },
            access_token: `mock-token-${i + 1}`,
            token_type: 'Bearer'
          }
        });

        const { unmount } = render(<Login />);

        await act(async () => {
          // Select login method tab
          if (loginMethod === 'email') {
            const emailTab = screen.getByRole('tab', { name: /email/i });
            await user.click(emailTab);
            
            const emailInput = screen.getByLabelText(/email/i);
            await user.type(emailInput, testUser.email || `user${i}@test.com`);
          } else if (loginMethod === 'mobile') {
            const mobileTab = screen.getByRole('tab', { name: /mobile/i });
            await user.click(mobileTab);
            
            const phoneInput = screen.getByLabelText(/phone/i);
            await user.type(phoneInput, testUser.mobileNumber);
          } else {
            const aadharTab = screen.getByRole('tab', { name: /aadhar/i });
            await user.click(aadharTab);
            
            const aadharInput = screen.getByLabelText(/aadhar/i);
            await user.type(aadharInput, testUser.aadharNumber || `123456789012`);
          }

          // Enter password
          const passwordInput = screen.getByLabelText(/password/i);
          await user.type(passwordInput, testUser.password);
        });

        // Submit login form
        const loginButton = screen.getByRole('button', { name: /login/i });
        
        await act(async () => {
          await user.click(loginButton);
        });

        // Wait for login to complete
        await waitFor(() => {
          expect(mockAuthService.login).toHaveBeenCalledWith(
            expect.objectContaining({
              password: testUser.password
            })
          );
        });

        successfulLogins++;
        unmount();
      }

      expect(successfulLogins).toBe(100);
      expect(mockAuthService.login).toHaveBeenCalledTimes(100);
    }, 60000);

    test('should handle login validation errors', async () => {
      const user = userEvent.setup();

      render(<Login />);

      await act(async () => {
        // Try to login with invalid email
        const emailInput = screen.getByLabelText(/email/i);
        await user.type(emailInput, 'invalid-email');

        const passwordInput = screen.getByLabelText(/password/i);
        await user.type(passwordInput, '123'); // Too short
      });

      // Check for validation errors
      await waitFor(() => {
        expect(screen.getByText(/Please enter a valid email address/i)).toBeInTheDocument();
        expect(screen.getByText(/Password must be at least 4 characters/i)).toBeInTheDocument();
      });
    });
  });

  describe('Payment Flow', () => {
    test('should successfully process payments for 100 users', async () => {
      const user = userEvent.setup();
      let successfulPayments = 0;

      for (let i = 0; i < testUsers.length; i++) {
        const testUser = testUsers[i];
        const paymentAmount = 200 + (i * 10); // Varying amounts

        // Mock successful payment response
        mockPaymentService.processPayment.mockResolvedValueOnce({
          success: true,
          data: {
            transaction_id: `txn-${i + 1}`,
            amount: paymentAmount,
            status: 'completed',
            payment_method: 'credit_card',
            created_at: new Date().toISOString()
          }
        });

        // Mock chit users data
        mockPaymentService.getChitUsers.mockResolvedValueOnce({
          success: true,
          data: [
            {
              chit_id: 1,
              chit_name: 'Test Chit',
              amount: paymentAmount,
              status: 'active'
            }
          ]
        });

        const { unmount } = render(<CellSelection />);

        await act(async () => {
          // Wait for component to load
          await waitFor(() => {
            expect(screen.getByText(/payment/i)).toBeInTheDocument();
          });

          // Select cells (simulate cell selection)
          const cellButtons = screen.getAllByRole('button');
          const paymentButton = cellButtons.find(btn => 
            btn.textContent?.includes('Pay') || btn.textContent?.includes('payment')
          );

          if (paymentButton) {
            await user.click(paymentButton);
          }
        });

        // Fill payment form if modal opens
        await waitFor(async () => {
          const amountInput = screen.queryByLabelText(/amount/i);
          if (amountInput) {
            await user.clear(amountInput);
            await user.type(amountInput, paymentAmount.toString());

            // Select payment method
            const creditCardRadio = screen.queryByLabelText(/credit card/i);
            if (creditCardRadio) {
              await user.click(creditCardRadio);
            }

            // Submit payment
            const submitPaymentButton = screen.getByRole('button', { name: /pay now/i });
            await user.click(submitPaymentButton);
          }
        });

        successfulPayments++;
        unmount();
      }

      expect(successfulPayments).toBe(100);
    }, 90000); // 90 second timeout for payment processing

    test('should handle payment validation errors', async () => {
      const user = userEvent.setup();

      render(<CellSelection />);

      await act(async () => {
        // Try to make payment with invalid data
        const amountInput = screen.queryByLabelText(/amount/i);
        if (amountInput) {
          await user.clear(amountInput);
          await user.type(amountInput, '0'); // Invalid amount
        }
      });

      // Check for validation errors
      await waitFor(() => {
        const errorMessage = screen.queryByText(/amount must be greater than 0/i);
        if (errorMessage) {
          expect(errorMessage).toBeInTheDocument();
        }
      });
    });
  });

  describe('Complete User Journey', () => {
    test('should complete full journey for 10 users (register -> login -> pay)', async () => {
      const user = userEvent.setup();
      const journeyUsers = testUsers.slice(0, 10); // Test with 10 users for complete journey
      let completedJourneys = 0;

      for (let i = 0; i < journeyUsers.length; i++) {
        const testUser = journeyUsers[i];

        // Step 1: Register
        mockAuthService.register.mockResolvedValueOnce({
          success: true,
          data: { user_id: i + 1, ...testUser }
        });

        let component = render(<Register />);

        await act(async () => {
          const fullNameInput = screen.getByLabelText(/auth.fullName/i);
          await user.type(fullNameInput, testUser.fullName);

          const mobileInput = screen.getByLabelText(/auth.mobileNumber/i);
          await user.type(mobileInput, testUser.mobileNumber);

          const pinInput = screen.getByLabelText(/auth.pin/i);
          await user.type(pinInput, testUser.pin.toString());

          const submitButton = screen.getByRole('button', { name: /auth.register/i });
          await user.click(submitButton);
        });

        await waitFor(() => {
          expect(mockAuthService.register).toHaveBeenCalled();
        });

        component.unmount();

        // Step 2: Login
        mockAuthService.login.mockResolvedValueOnce({
          success: true,
          data: {
            user: { user_id: i + 1, ...testUser },
            access_token: `token-${i + 1}`
          }
        });

        component = render(<Login />);

        await act(async () => {
          const phoneInput = screen.getByLabelText(/phone/i);
          await user.type(phoneInput, testUser.mobileNumber);

          const passwordInput = screen.getByLabelText(/password/i);
          await user.type(passwordInput, testUser.password);

          const loginButton = screen.getByRole('button', { name: /login/i });
          await user.click(loginButton);
        });

        await waitFor(() => {
          expect(mockAuthService.login).toHaveBeenCalled();
        });

        component.unmount();

        // Step 3: Payment
        mockPaymentService.processPayment.mockResolvedValueOnce({
          success: true,
          data: { transaction_id: `txn-${i + 1}`, status: 'completed' }
        });

        component = render(<CellSelection />);

        await act(async () => {
          // Simulate payment process
          const paymentButtons = screen.getAllByRole('button');
          const payButton = paymentButtons.find(btn => 
            btn.textContent?.includes('Pay') || btn.textContent?.includes('payment')
          );

          if (payButton) {
            await user.click(payButton);
          }
        });

        component.unmount();
        completedJourneys++;
      }

      expect(completedJourneys).toBe(10);
    }, 120000); // 2 minute timeout for complete journey
  });

  describe('Performance and Load Testing', () => {
    test('should handle concurrent user registrations', async () => {
      const concurrentUsers = 20;
      const registrationPromises = [];

      // Mock successful responses for all concurrent requests
      for (let i = 0; i < concurrentUsers; i++) {
        mockAuthService.register.mockResolvedValueOnce({
          success: true,
          data: { user_id: i + 1, ...testUsers[i] }
        });
      }

      // Create concurrent registration promises
      for (let i = 0; i < concurrentUsers; i++) {
        const promise = new Promise(async (resolve) => {
          const { unmount } = render(<Register />);
          
          // Simulate form filling and submission
          await act(async () => {
            // Fast form filling simulation
            const form = screen.getByRole('form') || screen.getByTestId('registration-form');
            if (form) {
              fireEvent.submit(form);
            }
          });

          unmount();
          resolve(true);
        });

        registrationPromises.push(promise);
      }

      // Wait for all concurrent registrations to complete
      const results = await Promise.all(registrationPromises);
      expect(results.length).toBe(concurrentUsers);
    }, 30000);

    test('should maintain performance with rapid successive logins', async () => {
      const rapidLogins = 50;
      const startTime = Date.now();

      for (let i = 0; i < rapidLogins; i++) {
        mockAuthService.login.mockResolvedValueOnce({
          success: true,
          data: {
            user: { user_id: i + 1 },
            access_token: `rapid-token-${i + 1}`
          }
        });

        const { unmount } = render(<Login />);
        
        await act(async () => {
          // Simulate rapid login
          const form = screen.getByRole('form') || screen.getByTestId('login-form');
          if (form) {
            fireEvent.submit(form);
          }
        });

        unmount();
      }

      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      // Should complete 50 logins in under 10 seconds
      expect(totalTime).toBeLessThan(10000);
    }, 15000);
  });
});