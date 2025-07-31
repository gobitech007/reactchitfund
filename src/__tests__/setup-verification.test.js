/**
 * Setup Verification Test
 * Ensures the test environment is properly configured
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Test utilities
import { generateTestUsers, validateTestData } from './utils/test-helpers';

describe('Test Environment Setup', () => {
  test('should have proper test environment configured', () => {
    expect(process.env.NODE_ENV).toBe('test');
  });

  test('should generate valid test users', () => {
    const users = generateTestUsers(10);
    const validation = validateTestData(users);
    
    expect(users).toHaveLength(10);
    expect(validation.isValid).toBe(true);
    expect(validation.errors).toHaveLength(0);
    
    // Check user structure
    users.forEach(user => {
      expect(user).toHaveProperty('fullName');
      expect(user).toHaveProperty('mobileNumber');
      expect(user).toHaveProperty('pin');
      expect(user).toHaveProperty('dateOfBirth');
      expect(user.fullName.length).toBeGreaterThan(2);
      expect(user.mobileNumber.length).toBe(10);
    });
  });

  test('should have required testing libraries available', () => {
    // Test React Testing Library
    const TestComponent = () => <div>Test Component</div>;
    render(<TestComponent />);
    expect(screen.getByText('Test Component')).toBeInTheDocument();
    
    // Test Jest matchers
    expect(true).toBe(true);
    expect([1, 2, 3]).toHaveLength(3);
    expect({ name: 'test' }).toHaveProperty('name');
  });

  test('should support async operations', async () => {
    const asyncOperation = () => Promise.resolve('success');
    const result = await asyncOperation();
    expect(result).toBe('success');
  });

  test('should support mock functions', () => {
    const mockFn = jest.fn();
    mockFn('test');
    
    expect(mockFn).toHaveBeenCalled();
    expect(mockFn).toHaveBeenCalledWith('test');
    expect(mockFn).toHaveBeenCalledTimes(1);
  });
});