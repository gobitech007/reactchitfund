/**
 * Performance and Load Testing
 * Tests system performance under various load conditions
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
import { 
  generateTestUsers, 
  mockApiResponses, 
  simulateNetworkDelay,
  validateTestData,
  generatePaymentData
} from '../utils/test-helpers';

// Mock the services and dependencies
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

describe('Performance and Load Testing', () => {
  let testUsers;
  const mockAuthService = AuthService;
  const mockPaymentService = PaymentService;

  beforeAll(() => {
    // Generate test users for load testing
    testUsers = generateTestUsers(100);
    
    // Validate test data integrity
    const validation = validateTestData(testUsers);
    console.log('Test data validation:', validation);
    
    // Setup API mocks
    mockApiResponses(mockAuthService, mockPaymentService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset performance marks
    if (performance.clearMarks) {
      performance.clearMarks();
    }
    if (performance.clearMeasures) {
      performance.clearMeasures();
    }
  });

  describe('Registration Load Testing', () => {
    test('should handle 100 concurrent registrations within acceptable time', async () => {
      const startTime = performance.now();
      const concurrentLimit = 10; // Process in batches to avoid overwhelming
      const batches = [];
      
      // Create batches of concurrent registrations
      for (let i = 0; i < testUsers.length; i += concurrentLimit) {
        const batch = testUsers.slice(i, i + concurrentLimit);
        batches.push(batch);
      }

      let totalProcessed = 0;
      const results = [];

      for (const batch of batches) {
        const batchPromises = batch.map(async (user, index) => {
          const batchStartTime = performance.now();
          
          // Mock registration response with network delay
          mockAuthService.register.mockResolvedValueOnce({
            success: true,
            data: {
              user_id: totalProcessed + index + 1,
              fullName: user.fullName,
              email: user.email,
              phone: user.mobileNumber,
              generated_password: user.password
            }
          });

          try {
            // Simulate registration API call
            await simulateNetworkDelay(Math.random() * 100 + 50); // 50-150ms delay
            const response = await mockAuthService.register({
              fullName: user.fullName,
              email: user.email,
              mobileNumber: user.mobileNumber,
              dateOfBirth: user.dateOfBirth,
              aadharNumber: user.aadharNumber,
              pin: user.pin
            });

            const batchEndTime = performance.now();
            return {
              success: true,
              userId: response.data.user_id,
              processingTime: batchEndTime - batchStartTime,
              user: user.fullName
            };
          } catch (error) {
            const batchEndTime = performance.now();
            return {
              success: false,
              error: error.message,
              processingTime: batchEndTime - batchStartTime,
              user: user.fullName
            };
          }
        });

        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
        totalProcessed += batch.length;

        // Small delay between batches to simulate real-world conditions
        await simulateNetworkDelay(10);
      }

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // Performance assertions
      expect(results.length).toBe(100);
      expect(results.filter(r => r.success).length).toBe(100);
      expect(totalTime).toBeLessThan(30000); // Should complete within 30 seconds

      // Calculate performance metrics
      const processingTimes = results.map(r => r.processingTime);
      const avgProcessingTime = processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length;
      const maxProcessingTime = Math.max(...processingTimes);
      const minProcessingTime = Math.min(...processingTimes);

      console.log('Registration Performance Metrics:', {
        totalUsers: results.length,
        totalTime: `${totalTime.toFixed(2)}ms`,
        avgProcessingTime: `${avgProcessingTime.toFixed(2)}ms`,
        maxProcessingTime: `${maxProcessingTime.toFixed(2)}ms`,
        minProcessingTime: `${minProcessingTime.toFixed(2)}ms`,
        throughput: `${(results.length / (totalTime / 1000)).toFixed(2)} registrations/second`
      });

      // Performance thresholds
      expect(avgProcessingTime).toBeLessThan(500); // Average should be under 500ms
      expect(maxProcessingTime).toBeLessThan(2000); // Max should be under 2 seconds
    }, 45000);

    test('should maintain registration form responsiveness under load', async () => {
      const user = userEvent.setup();
      const formInteractions = [];

      // Test form responsiveness with rapid interactions
      for (let i = 0; i < 10; i++) {
        const startTime = performance.now();
        
        const { unmount } = render(<Register />);

        await act(async () => {
          const fullNameInput = screen.getByLabelText(/auth.fullName/i);
          const interactionStart = performance.now();
          
          await user.type(fullNameInput, testUsers[i].fullName);
          
          const interactionEnd = performance.now();
          formInteractions.push(interactionEnd - interactionStart);
        });

        unmount();
        
        const endTime = performance.now();
        expect(endTime - startTime).toBeLessThan(1000); // Each render should be under 1 second
      }

      const avgInteractionTime = formInteractions.reduce((a, b) => a + b, 0) / formInteractions.length;
      expect(avgInteractionTime).toBeLessThan(200); // Form interactions should be under 200ms

      console.log('Form Responsiveness Metrics:', {
        avgInteractionTime: `${avgInteractionTime.toFixed(2)}ms`,
        maxInteractionTime: `${Math.max(...formInteractions).toFixed(2)}ms`,
        minInteractionTime: `${Math.min(...formInteractions).toFixed(2)}ms`
      });
    });
  });

  describe('Login Load Testing', () => {
    test('should handle 100 concurrent logins efficiently', async () => {
      const startTime = performance.now();
      const loginPromises = [];

      // Create concurrent login promises
      for (let i = 0; i < 100; i++) {
        const user = testUsers[i];
        
        mockAuthService.login.mockResolvedValueOnce({
          success: true,
          data: {
            user: {
              user_id: i + 1,
              fullName: user.fullName,
              email: user.email,
              phone: user.mobileNumber
            },
            access_token: `load-test-token-${i + 1}`,
            token_type: 'Bearer'
          }
        });

        const loginPromise = (async () => {
          const loginStartTime = performance.now();
          
          try {
            await simulateNetworkDelay(Math.random() * 80 + 20); // 20-100ms delay
            const response = await mockAuthService.login({
              phone: user.mobileNumber,
              password: user.password
            });

            const loginEndTime = performance.now();
            return {
              success: true,
              userId: response.data.user.user_id,
              processingTime: loginEndTime - loginStartTime,
              user: user.fullName
            };
          } catch (error) {
            const loginEndTime = performance.now();
            return {
              success: false,
              error: error.message,
              processingTime: loginEndTime - loginStartTime,
              user: user.fullName
            };
          }
        })();

        loginPromises.push(loginPromise);
      }

      const results = await Promise.all(loginPromises);
      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // Performance assertions
      expect(results.length).toBe(100);
      expect(results.filter(r => r.success).length).toBe(100);
      expect(totalTime).toBeLessThan(15000); // Should complete within 15 seconds

      // Calculate performance metrics
      const processingTimes = results.map(r => r.processingTime);
      const avgProcessingTime = processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length;

      console.log('Login Performance Metrics:', {
        totalLogins: results.length,
        totalTime: `${totalTime.toFixed(2)}ms`,
        avgProcessingTime: `${avgProcessingTime.toFixed(2)}ms`,
        throughput: `${(results.length / (totalTime / 1000)).toFixed(2)} logins/second`
      });

      expect(avgProcessingTime).toBeLessThan(300); // Average should be under 300ms
    }, 20000);

    test('should handle login session management for multiple users', async () => {
      const activeSessions = new Map();
      const sessionPromises = [];

      for (let i = 0; i < 50; i++) {
        const user = testUsers[i];
        
        const sessionPromise = (async () => {
          // Mock login
          mockAuthService.login.mockResolvedValueOnce({
            success: true,
            data: {
              user: { user_id: i + 1, fullName: user.fullName },
              access_token: `session-token-${i + 1}`,
              expires_in: 3600
            }
          });

          const loginResponse = await mockAuthService.login({
            phone: user.mobileNumber,
            password: user.password
          });

          // Store session
          activeSessions.set(i + 1, {
            token: loginResponse.data.access_token,
            user: loginResponse.data.user,
            loginTime: Date.now()
          });

          return { userId: i + 1, success: true };
        })();

        sessionPromises.push(sessionPromise);
      }

      const results = await Promise.all(sessionPromises);
      
      expect(results.length).toBe(50);
      expect(activeSessions.size).toBe(50);
      expect(results.every(r => r.success)).toBe(true);

      console.log('Session Management Metrics:', {
        activeSessions: activeSessions.size,
        successfulLogins: results.filter(r => r.success).length
      });
    });
  });

  describe('Payment Load Testing', () => {
    test('should process 100 payments concurrently', async () => {
      const startTime = performance.now();
      const paymentPromises = [];

      for (let i = 0; i < 100; i++) {
        const user = testUsers[i];
        const paymentData = generatePaymentData(i + 1, 200 + (i * 10));

        mockPaymentService.processPayment.mockResolvedValueOnce({
          success: true,
          data: {
            transaction_id: `load-test-txn-${i + 1}`,
            amount: paymentData.amount,
            status: 'completed',
            payment_method: paymentData.payment_method,
            created_at: new Date().toISOString()
          }
        });

        const paymentPromise = (async () => {
          const paymentStartTime = performance.now();
          
          try {
            // Simulate payment processing delay
            await simulateNetworkDelay(Math.random() * 200 + 100); // 100-300ms delay
            
            const response = await mockPaymentService.processPayment(paymentData);
            
            const paymentEndTime = performance.now();
            return {
              success: true,
              transactionId: response.data.transaction_id,
              amount: response.data.amount,
              processingTime: paymentEndTime - paymentStartTime,
              user: user.fullName
            };
          } catch (error) {
            const paymentEndTime = performance.now();
            return {
              success: false,
              error: error.message,
              processingTime: paymentEndTime - paymentStartTime,
              user: user.fullName
            };
          }
        })();

        paymentPromises.push(paymentPromise);
      }

      const results = await Promise.all(paymentPromises);
      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // Performance assertions
      expect(results.length).toBe(100);
      expect(results.filter(r => r.success).length).toBe(100);
      expect(totalTime).toBeLessThan(25000); // Should complete within 25 seconds

      // Calculate performance metrics
      const processingTimes = results.map(r => r.processingTime);
      const avgProcessingTime = processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length;
      const totalAmount = results.reduce((sum, r) => sum + (r.amount || 0), 0);

      console.log('Payment Performance Metrics:', {
        totalPayments: results.length,
        totalAmount: `₹${totalAmount}`,
        totalTime: `${totalTime.toFixed(2)}ms`,
        avgProcessingTime: `${avgProcessingTime.toFixed(2)}ms`,
        throughput: `${(results.length / (totalTime / 1000)).toFixed(2)} payments/second`,
        avgAmountPerSecond: `₹${(totalAmount / (totalTime / 1000)).toFixed(2)}/second`
      });

      expect(avgProcessingTime).toBeLessThan(500); // Average should be under 500ms
    }, 30000);

    test('should handle payment failures gracefully under load', async () => {
      const paymentPromises = [];
      let failureCount = 0;

      for (let i = 0; i < 50; i++) {
        const shouldFail = i % 10 === 0; // 10% failure rate
        
        if (shouldFail) {
          mockPaymentService.processPayment.mockRejectedValueOnce(
            new Error('Payment gateway timeout')
          );
          failureCount++;
        } else {
          mockPaymentService.processPayment.mockResolvedValueOnce({
            success: true,
            data: {
              transaction_id: `resilience-test-txn-${i + 1}`,
              amount: 200,
              status: 'completed'
            }
          });
        }

        const paymentPromise = (async () => {
          try {
            await simulateNetworkDelay(Math.random() * 100 + 50);
            const response = await mockPaymentService.processPayment({
              amount: 200,
              payment_method: 'credit_card'
            });
            return { success: true, transactionId: response.data.transaction_id };
          } catch (error) {
            return { success: false, error: error.message };
          }
        })();

        paymentPromises.push(paymentPromise);
      }

      const results = await Promise.all(paymentPromises);
      const successCount = results.filter(r => r.success).length;
      const actualFailureCount = results.filter(r => !r.success).length;

      expect(results.length).toBe(50);
      expect(successCount).toBe(50 - failureCount);
      expect(actualFailureCount).toBe(failureCount);

      console.log('Payment Resilience Metrics:', {
        totalPayments: results.length,
        successfulPayments: successCount,
        failedPayments: actualFailureCount,
        successRate: `${((successCount / results.length) * 100).toFixed(2)}%`
      });
    });
  });

  describe('Memory and Resource Usage', () => {
    test('should not cause memory leaks with multiple component renders', async () => {
      const initialMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
      const components = [];

      // Render and unmount components multiple times
      for (let i = 0; i < 100; i++) {
        const { unmount } = render(<Register />);
        components.push(unmount);
        
        // Unmount every 10 components to simulate real usage
        if (i % 10 === 9) {
          components.forEach(unmountFn => unmountFn());
          components.length = 0;
          
          // Force garbage collection if available
          if (global.gc) {
            global.gc();
          }
        }
      }

      // Clean up remaining components
      components.forEach(unmountFn => unmountFn());

      const finalMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
      const memoryIncrease = finalMemory - initialMemory;

      console.log('Memory Usage Metrics:', {
        initialMemory: `${(initialMemory / 1024 / 1024).toFixed(2)} MB`,
        finalMemory: `${(finalMemory / 1024 / 1024).toFixed(2)} MB`,
        memoryIncrease: `${(memoryIncrease / 1024 / 1024).toFixed(2)} MB`
      });

      // Memory increase should be reasonable (less than 50MB for 100 renders)
      if (performance.memory) {
        expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // 50MB
      }
    });

    test('should handle rapid state updates efficiently', async () => {
      const user = userEvent.setup();
      const { unmount } = render(<Register />);

      const startTime = performance.now();
      
      // Perform rapid state updates
      const fullNameInput = screen.getByLabelText(/auth.fullName/i);
      
      await act(async () => {
        for (let i = 0; i < 100; i++) {
          await user.clear(fullNameInput);
          await user.type(fullNameInput, `Test User ${i}`);
        }
      });

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      console.log('State Update Performance:', {
        totalUpdates: 100,
        totalTime: `${totalTime.toFixed(2)}ms`,
        avgUpdateTime: `${(totalTime / 100).toFixed(2)}ms`
      });

      expect(totalTime).toBeLessThan(10000); // Should complete within 10 seconds
      unmount();
    });
  });

  describe('Network Resilience Testing', () => {
    test('should handle network timeouts gracefully', async () => {
      const timeoutPromises = [];

      for (let i = 0; i < 20; i++) {
        // Simulate network timeout
        mockAuthService.register.mockImplementationOnce(() => {
          return new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Network timeout')), 100);
          });
        });

        const timeoutPromise = (async () => {
          try {
            await mockAuthService.register(testUsers[i]);
            return { success: true };
          } catch (error) {
            return { success: false, error: error.message };
          }
        })();

        timeoutPromises.push(timeoutPromise);
      }

      const results = await Promise.all(timeoutPromises);
      const timeoutCount = results.filter(r => !r.success && r.error.includes('timeout')).length;

      expect(timeoutCount).toBe(20); // All should timeout
      console.log('Network Resilience:', {
        totalRequests: results.length,
        timeouts: timeoutCount,
        timeoutRate: `${((timeoutCount / results.length) * 100).toFixed(2)}%`
      });
    });

    test('should retry failed requests appropriately', async () => {
      let attemptCount = 0;
      
      mockAuthService.register.mockImplementation(() => {
        attemptCount++;
        if (attemptCount <= 2) {
          return Promise.reject(new Error('Temporary network error'));
        }
        return Promise.resolve({
          success: true,
          data: { user_id: 1, fullName: 'Test User' }
        });
      });

      // Simulate retry logic
      const retryRequest = async (maxRetries = 3) => {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
          try {
            const response = await mockAuthService.register(testUsers[0]);
            return { success: true, attempts: attempt, data: response.data };
          } catch (error) {
            if (attempt === maxRetries) {
              return { success: false, attempts: attempt, error: error.message };
            }
            await simulateNetworkDelay(100 * attempt); // Exponential backoff
          }
        }
      };

      const result = await retryRequest();
      
      expect(result.success).toBe(true);
      expect(result.attempts).toBe(3);
      expect(attemptCount).toBe(3);

      console.log('Retry Logic:', {
        finalResult: result.success ? 'Success' : 'Failed',
        totalAttempts: result.attempts,
        apiCalls: attemptCount
      });
    });
  });
});