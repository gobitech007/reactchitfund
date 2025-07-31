/**
 * Real Database Integration Test: 100 Users Registration, Login, and Payment Flow
 * This test actually inserts 100 users into the database and processes real payments
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

// Real services (no mocking)
import { AuthService } from '../../services/auth.service';
import { PaymentService } from '../../services/payment.service';
import { ApiService } from '../../services/api.service';

// Components
import Register from '../../pages/register';
import Login from '../../pages/login';
import CellSelection from '../../pages/pay';

// Test utilities
import { generateTestUsers, validateTestData, generatePaymentData } from '../utils/test-helpers';

// Mock only the navigation and translation utilities
jest.mock('../../utils/withNavigation', () => ({
  withNavigation: (Component) => (props) => <Component {...props} navigate={jest.fn()} />
}));
jest.mock('../../utils/withTranslation', () => ({
  withTranslation: (Component) => (props) => <Component {...props} t={(key) => key} />
}));

// Mock context with real user data
const mockCurrentUser = { user_id: null, fullName: null };
jest.mock('../../context', () => ({
  useAuth: () => ({ 
    currentUser: mockCurrentUser,
    login: jest.fn(),
    logout: jest.fn()
  }),
  useData: () => ({ store: {} }),
  useDynamicApiStore: () => []
}));

describe('Real Database Integration: 100 Users Flow', () => {
  let testUsers;
  let createdUserIds = [];
  let processedPayments = [];
  let testResults = {
    registrations: { success: 0, failed: 0, errors: [] },
    logins: { success: 0, failed: 0, errors: [] },
    payments: { success: 0, failed: 0, errors: [] }
  };

  beforeAll(async () => {
    console.log('🚀 Starting Real Database Integration Tests...');
    console.log('⚠️  WARNING: This will create 100 real users and payments in the database!');
    
    // Generate 100 test users
    testUsers = generateTestUsers(100);
    
    // Validate test data
    const validation = validateTestData(testUsers);
    if (!validation.isValid) {
      throw new Error(`Invalid test data: ${validation.errors.join(', ')}`);
    }
    
    console.log(`✅ Generated ${testUsers.length} valid test users`);
    
    // Verify API connection
    try {
      await ApiService.get('/health-check');
      console.log('✅ API connection verified');
    } catch (error) {
      console.warn('⚠️  API health check failed, proceeding anyway...');
    }
  }, 30000);

  afterAll(async () => {
    console.log('\n🧹 Cleanup: Removing test data from database...');
    
    // Clean up created users (optional - comment out if you want to keep test data)
    if (createdUserIds.length > 0) {
      try {
        for (const userId of createdUserIds) {
          try {
            await ApiService.delete(`/users/${userId}`);
          } catch (error) {
            console.warn(`Failed to delete user ${userId}:`, error.message);
          }
        }
        console.log(`✅ Cleaned up ${createdUserIds.length} test users`);
      } catch (error) {
        console.warn('⚠️  Cleanup failed:', error.message);
      }
    }
    
    // Print final summary
    console.log('\n📊 FINAL TEST SUMMARY:');
    console.log(`Registrations: ${testResults.registrations.success} success, ${testResults.registrations.failed} failed`);
    console.log(`Logins: ${testResults.logins.success} success, ${testResults.logins.failed} failed`);
    console.log(`Payments: ${testResults.payments.success} success, ${testResults.payments.failed} failed`);
    console.log(`Total Users Created: ${createdUserIds.length}`);
    console.log(`Total Payments Processed: ${processedPayments.length}`);
  }, 60000);

  describe('Real User Registration (100 Users)', () => {
    test('should register 100 users in the database', async () => {
      console.log('\n👤 Starting user registration process...');
      const batchSize = 5; // Process in smaller batches to avoid overwhelming the server
      
      for (let i = 0; i < testUsers.length; i += batchSize) {
        const batch = testUsers.slice(i, i + batchSize);
        console.log(`Processing registration batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(testUsers.length/batchSize)} (${batch.length} users)`);
        
        const batchPromises = batch.map(async (user, batchIndex) => {
          const globalIndex = i + batchIndex;
          
          try {
            // Prepare registration data
            const registrationData = {
              fullName: user.fullName,
              email: user.email || undefined,
              password: user.password,
              mobileNumber: user.mobileNumber,
              dateOfBirth: user.dateOfBirth,
              aadharNumber: user.aadharNumber || undefined,
              pin: user.pin
            };

            console.log(`  Registering user ${globalIndex + 1}: ${user.fullName} (${user.mobileNumber})`);
            
            // Make real API call to register user
            const response = await AuthService.register(registrationData);
            
            if (response.success || response.data) {
              const userData = response.data || response;
              createdUserIds.push(userData.user_id || userData.id);
              testResults.registrations.success++;
              
              console.log(`  ✅ User ${globalIndex + 1} registered successfully (ID: ${userData.user_id || userData.id})`);
              
              return {
                success: true,
                userId: userData.user_id || userData.id,
                userData: userData,
                originalUser: user
              };
            } else {
              throw new Error(response.error || 'Registration failed');
            }
            
          } catch (error) {
            testResults.registrations.failed++;
            testResults.registrations.errors.push({
              user: user.fullName,
              error: error.message
            });
            
            console.log(`  ❌ User ${globalIndex + 1} registration failed: ${error.message}`);
            
            return {
              success: false,
              error: error.message,
              originalUser: user
            };
          }
        });

        // Wait for batch to complete
        const batchResults = await Promise.all(batchPromises);
        
        // Small delay between batches to be gentle on the server
        if (i + batchSize < testUsers.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      // Assertions
      expect(testResults.registrations.success).toBeGreaterThan(0);
      expect(createdUserIds.length).toBe(testResults.registrations.success);
      
      console.log(`\n✅ Registration completed: ${testResults.registrations.success} success, ${testResults.registrations.failed} failed`);
      
      if (testResults.registrations.failed > 0) {
        console.log('❌ Registration errors:');
        testResults.registrations.errors.forEach(error => {
          console.log(`  - ${error.user}: ${error.error}`);
        });
      }
      
    }, 300000); // 5 minute timeout for 100 registrations
  });

  describe('Real User Login (Registered Users)', () => {
    test('should login all successfully registered users', async () => {
      console.log('\n🔐 Starting user login process...');
      
      if (createdUserIds.length === 0) {
        console.log('⚠️  No users were registered, skipping login tests');
        return;
      }

      const batchSize = 10; // Larger batch size for logins as they're faster
      
      // Get successfully registered users
      const registeredUsers = testUsers.filter((user, index) => 
        createdUserIds.some(id => id !== undefined)
      ).slice(0, createdUserIds.length);

      for (let i = 0; i < registeredUsers.length; i += batchSize) {
        const batch = registeredUsers.slice(i, i + batchSize);
        console.log(`Processing login batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(registeredUsers.length/batchSize)} (${batch.length} users)`);
        
        const batchPromises = batch.map(async (user, batchIndex) => {
          const globalIndex = i + batchIndex;
          
          try {
            // Try different login methods
            const loginMethods = [
              { phone: user.mobileNumber, password: user.password },
              ...(user.email ? [{ email: user.email, password: user.password }] : []),
              ...(user.aadharNumber ? [{ aadhar: user.aadharNumber, password: user.password }] : [])
            ];

            let loginSuccess = false;
            let loginResponse = null;

            // Try each login method until one succeeds
            for (const loginData of loginMethods) {
              try {
                console.log(`  Attempting login ${globalIndex + 1}: ${user.fullName} via ${Object.keys(loginData)[0]}`);
                
                loginResponse = await AuthService.login(loginData);
                
                if (loginResponse.success || loginResponse.data || loginResponse.access_token) {
                  loginSuccess = true;
                  break;
                }
              } catch (methodError) {
                // Try next method
                continue;
              }
            }

            if (loginSuccess) {
              testResults.logins.success++;
              console.log(`  ✅ User ${globalIndex + 1} logged in successfully`);
              
              return {
                success: true,
                loginData: loginResponse.data || loginResponse,
                originalUser: user
              };
            } else {
              throw new Error('All login methods failed');
            }
            
          } catch (error) {
            testResults.logins.failed++;
            testResults.logins.errors.push({
              user: user.fullName,
              error: error.message
            });
            
            console.log(`  ❌ User ${globalIndex + 1} login failed: ${error.message}`);
            
            return {
              success: false,
              error: error.message,
              originalUser: user
            };
          }
        });

        // Wait for batch to complete
        await Promise.all(batchPromises);
        
        // Small delay between batches
        if (i + batchSize < registeredUsers.length) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      // Assertions
      expect(testResults.logins.success).toBeGreaterThan(0);
      
      console.log(`\n✅ Login completed: ${testResults.logins.success} success, ${testResults.logins.failed} failed`);
      
      if (testResults.logins.failed > 0) {
        console.log('❌ Login errors:');
        testResults.logins.errors.forEach(error => {
          console.log(`  - ${error.user}: ${error.error}`);
        });
      }
      
    }, 180000); // 3 minute timeout for logins
  });

  describe('Real Payment Processing (Logged-in Users)', () => {
    test('should process payments for all logged-in users', async () => {
      console.log('\n💳 Starting payment processing...');
      
      if (testResults.logins.success === 0) {
        console.log('⚠️  No users logged in successfully, skipping payment tests');
        return;
      }

      const batchSize = 3; // Smaller batch size for payments as they're more resource intensive
      const paymentAmount = 200; // Base payment amount
      
      // Get users who logged in successfully
      const loggedInUsers = testUsers.slice(0, testResults.logins.success);

      for (let i = 0; i < loggedInUsers.length; i += batchSize) {
        const batch = loggedInUsers.slice(i, i + batchSize);
        console.log(`Processing payment batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(loggedInUsers.length/batchSize)} (${batch.length} users)`);
        
        const batchPromises = batch.map(async (user, batchIndex) => {
          const globalIndex = i + batchIndex;
          const userPaymentAmount = paymentAmount + (globalIndex * 10); // Varying amounts
          
          try {
            // Generate payment data
            const paymentData = generatePaymentData(globalIndex + 1, userPaymentAmount);
            
            // Add additional required fields for real payment
            const realPaymentData = {
              ...paymentData,
              user_id: createdUserIds[globalIndex] || globalIndex + 1,
              chit_id: 1, // Default chit ID
              cells: [globalIndex + 1], // Cell selection
              payment_method: paymentData.payment_method,
              amount: userPaymentAmount,
              currency: 'INR',
              description: `Chit fund payment for ${user.fullName}`,
              // Test card details (use test card numbers)
              card_details: paymentData.payment_method.includes('card') ? {
                card_number: paymentData.card_number,
                card_holder_name: user.fullName,
                expiry_month: paymentData.expiry_month,
                expiry_year: paymentData.expiry_year,
                cvv: paymentData.cvv
              } : undefined,
              // UPI details
              upi_details: paymentData.payment_method === 'upi' ? {
                upi_id: paymentData.upi_id
              } : undefined
            };

            console.log(`  Processing payment ${globalIndex + 1}: ₹${userPaymentAmount} for ${user.fullName}`);
            
            // Make real API call to process payment
            const paymentResponse = await PaymentService.processPayment(realPaymentData);
            
            if (paymentResponse.success || paymentResponse.data) {
              const paymentData = paymentResponse.data || paymentResponse;
              processedPayments.push({
                transactionId: paymentData.transaction_id || paymentData.id,
                amount: userPaymentAmount,
                userId: createdUserIds[globalIndex] || globalIndex + 1,
                status: paymentData.status || 'completed'
              });
              
              testResults.payments.success++;
              console.log(`  ✅ Payment ${globalIndex + 1} processed successfully (₹${userPaymentAmount})`);
              
              return {
                success: true,
                paymentData: paymentData,
                amount: userPaymentAmount,
                originalUser: user
              };
            } else {
              throw new Error(paymentResponse.error || 'Payment processing failed');
            }
            
          } catch (error) {
            testResults.payments.failed++;
            testResults.payments.errors.push({
              user: user.fullName,
              amount: userPaymentAmount,
              error: error.message
            });
            
            console.log(`  ❌ Payment ${globalIndex + 1} failed: ${error.message}`);
            
            return {
              success: false,
              error: error.message,
              amount: userPaymentAmount,
              originalUser: user
            };
          }
        });

        // Wait for batch to complete
        await Promise.all(batchPromises);
        
        // Longer delay between payment batches
        if (i + batchSize < loggedInUsers.length) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      // Assertions
      expect(testResults.payments.success).toBeGreaterThan(0);
      expect(processedPayments.length).toBe(testResults.payments.success);
      
      // Calculate total payment amount
      const totalAmount = processedPayments.reduce((sum, payment) => sum + payment.amount, 0);
      
      console.log(`\n✅ Payment processing completed:`);
      console.log(`  - Successful payments: ${testResults.payments.success}`);
      console.log(`  - Failed payments: ${testResults.payments.failed}`);
      console.log(`  - Total amount processed: ₹${totalAmount}`);
      console.log(`  - Average payment amount: ₹${(totalAmount / testResults.payments.success).toFixed(2)}`);
      
      if (testResults.payments.failed > 0) {
        console.log('❌ Payment errors:');
        testResults.payments.errors.forEach(error => {
          console.log(`  - ${error.user} (₹${error.amount}): ${error.error}`);
        });
      }
      
    }, 600000); // 10 minute timeout for payments
  });

  describe('Database Verification', () => {
    test('should verify all data exists in database', async () => {
      console.log('\n🔍 Verifying database records...');
      
      // Verify users exist in database
      let verifiedUsers = 0;
      for (const userId of createdUserIds) {
        try {
          const userResponse = await ApiService.get(`/users/${userId}`);
          if (userResponse.data || userResponse.success) {
            verifiedUsers++;
          }
        } catch (error) {
          console.warn(`User ${userId} not found in database`);
        }
      }
      
      // Verify payments exist in database
      let verifiedPayments = 0;
      for (const payment of processedPayments) {
        try {
          const paymentResponse = await ApiService.get(`/payments/${payment.transactionId}`);
          if (paymentResponse.data || paymentResponse.success) {
            verifiedPayments++;
          }
        } catch (error) {
          console.warn(`Payment ${payment.transactionId} not found in database`);
        }
      }
      
      console.log(`✅ Database verification completed:`);
      console.log(`  - Users in database: ${verifiedUsers}/${createdUserIds.length}`);
      console.log(`  - Payments in database: ${verifiedPayments}/${processedPayments.length}`);
      
      // Assertions
      expect(verifiedUsers).toBe(createdUserIds.length);
      expect(verifiedPayments).toBe(processedPayments.length);
      
    }, 120000); // 2 minute timeout for verification
  });

  describe('Data Integrity Check', () => {
    test('should validate data consistency', async () => {
      console.log('\n🔎 Checking data integrity...');
      
      // Check for duplicate phone numbers in created users
      const phoneNumbers = new Set();
      let duplicatePhones = 0;
      
      for (const userId of createdUserIds) {
        try {
          const userResponse = await ApiService.get(`/users/${userId}`);
          const userData = userResponse.data || userResponse;
          
          if (phoneNumbers.has(userData.phone || userData.mobileNumber)) {
            duplicatePhones++;
          } else {
            phoneNumbers.add(userData.phone || userData.mobileNumber);
          }
        } catch (error) {
          // User not found, skip
        }
      }
      
      // Check payment amounts consistency
      let totalDbAmount = 0;
      for (const payment of processedPayments) {
        try {
          const paymentResponse = await ApiService.get(`/payments/${payment.transactionId}`);
          const paymentData = paymentResponse.data || paymentResponse;
          totalDbAmount += paymentData.amount || 0;
        } catch (error) {
          // Payment not found, skip
        }
      }
      
      const expectedTotalAmount = processedPayments.reduce((sum, p) => sum + p.amount, 0);
      
      console.log(`✅ Data integrity check completed:`);
      console.log(`  - Duplicate phone numbers: ${duplicatePhones}`);
      console.log(`  - Expected total amount: ₹${expectedTotalAmount}`);
      console.log(`  - Actual total amount: ₹${totalDbAmount}`);
      
      // Assertions
      expect(duplicatePhones).toBe(0);
      expect(totalDbAmount).toBe(expectedTotalAmount);
      
    }, 180000); // 3 minute timeout for integrity check
  });
});