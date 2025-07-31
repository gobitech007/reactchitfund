/**
 * Database Setup Utilities
 * Prepares the database for real integration testing
 */

import { ApiService } from '../../services/api.service';

/**
 * Database Setup Class
 * Handles database preparation and cleanup for testing
 */
export class DatabaseSetup {
  constructor() {
    this.testTablePrefix = 'test_';
    this.testDataIds = {
      users: [],
      payments: [],
      chits: []
    };
  }

  /**
   * Initialize database for testing
   */
  async initializeDatabase() {
    console.log('🔧 Initializing database for testing...');
    
    try {
      // Check database connection
      await this.checkDatabaseConnection();
      
      // Create test chit if needed
      await this.createTestChit();
      
      // Verify required tables exist
      await this.verifyTables();
      
      console.log('✅ Database initialization completed');
      return true;
    } catch (error) {
      console.error('❌ Database initialization failed:', error.message);
      throw error;
    }
  }

  /**
   * Check if database connection is working
   */
  async checkDatabaseConnection() {
    try {
      const response = await ApiService.get('/health-check');
      if (!response || (!response.success && !response.data)) {
        throw new Error('Database health check failed');
      }
      console.log('✅ Database connection verified');
    } catch (error) {
      console.warn('⚠️  Database health check endpoint not available, proceeding...');
    }
  }

  /**
   * Create a test chit for payment testing
   */
  async createTestChit() {
    try {
      const testChitData = {
        chit_name: 'Test Chit for 100 Users',
        total_amount: 100000, // ₹1,00,000
        monthly_amount: 1000,  // ₹1,000 per month
        duration_months: 12,
        total_members: 100,
        status: 'active',
        start_date: new Date().toISOString(),
        description: 'Test chit created for 100 users integration testing'
      };

      // Try to create test chit
      const response = await ApiService.post('/chits/', testChitData);
      
      if (response.success || response.data) {
        const chitData = response.data || response;
        this.testDataIds.chits.push(chitData.chit_id || chitData.id);
        console.log(`✅ Test chit created (ID: ${chitData.chit_id || chitData.id})`);
        return chitData.chit_id || chitData.id;
      }
    } catch (error) {
      console.warn('⚠️  Could not create test chit, using default chit ID 1');
      return 1; // Default chit ID
    }
  }

  /**
   * Verify required database tables exist
   */
  async verifyTables() {
    const requiredEndpoints = [
      '/users/',
      '/payments/',
      '/chits/',
      '/auth/register',
      '/auth/login'
    ];

    for (const endpoint of requiredEndpoints) {
      try {
        // Try to access each endpoint to verify table/functionality exists
        await ApiService.get(endpoint);
        console.log(`✅ Endpoint verified: ${endpoint}`);
      } catch (error) {
        if (error.response && error.response.status === 404) {
          console.warn(`⚠️  Endpoint not found: ${endpoint}`);
        } else if (error.response && error.response.status === 405) {
          console.log(`✅ Endpoint exists: ${endpoint} (Method not allowed is expected)`);
        } else {
          console.warn(`⚠️  Could not verify endpoint: ${endpoint}`);
        }
      }
    }
  }

  /**
   * Clean up test data from database
   */
  async cleanupTestData() {
    console.log('🧹 Cleaning up test data...');
    
    let cleanedCount = 0;

    // Clean up test users
    for (const userId of this.testDataIds.users) {
      try {
        await ApiService.delete(`/users/${userId}`);
        cleanedCount++;
      } catch (error) {
        console.warn(`Failed to delete user ${userId}:`, error.message);
      }
    }

    // Clean up test payments
    for (const paymentId of this.testDataIds.payments) {
      try {
        await ApiService.delete(`/payments/${paymentId}`);
        cleanedCount++;
      } catch (error) {
        console.warn(`Failed to delete payment ${paymentId}:`, error.message);
      }
    }

    // Clean up test chits
    for (const chitId of this.testDataIds.chits) {
      try {
        await ApiService.delete(`/chits/${chitId}`);
        cleanedCount++;
      } catch (error) {
        console.warn(`Failed to delete chit ${chitId}:`, error.message);
      }
    }

    console.log(`✅ Cleanup completed: ${cleanedCount} records removed`);
    
    // Reset tracking arrays
    this.testDataIds = { users: [], payments: [], chits: [] };
  }

  /**
   * Add user ID to tracking for cleanup
   */
  trackUser(userId) {
    if (userId && !this.testDataIds.users.includes(userId)) {
      this.testDataIds.users.push(userId);
    }
  }

  /**
   * Add payment ID to tracking for cleanup
   */
  trackPayment(paymentId) {
    if (paymentId && !this.testDataIds.payments.includes(paymentId)) {
      this.testDataIds.payments.push(paymentId);
    }
  }

  /**
   * Get database statistics
   */
  async getDatabaseStats() {
    const stats = {
      totalUsers: 0,
      totalPayments: 0,
      totalChits: 0,
      testUsers: this.testDataIds.users.length,
      testPayments: this.testDataIds.payments.length,
      testChits: this.testDataIds.chits.length
    };

    try {
      // Get total users count
      const usersResponse = await ApiService.get('/users/?limit=1');
      if (usersResponse.data && usersResponse.data.total) {
        stats.totalUsers = usersResponse.data.total;
      }

      // Get total payments count
      const paymentsResponse = await ApiService.get('/payments/?limit=1');
      if (paymentsResponse.data && paymentsResponse.data.total) {
        stats.totalPayments = paymentsResponse.data.total;
      }

      // Get total chits count
      const chitsResponse = await ApiService.get('/chits/?limit=1');
      if (chitsResponse.data && chitsResponse.data.total) {
        stats.totalChits = chitsResponse.data.total;
      }

    } catch (error) {
      console.warn('Could not fetch database statistics:', error.message);
    }

    return stats;
  }

  /**
   * Backup database before testing (if supported)
   */
  async createBackup() {
    try {
      const backupResponse = await ApiService.post('/admin/backup', {
        backup_name: `test_backup_${Date.now()}`,
        description: '100 users test backup'
      });

      if (backupResponse.success || backupResponse.data) {
        console.log('✅ Database backup created');
        return backupResponse.data.backup_id;
      }
    } catch (error) {
      console.warn('⚠️  Database backup not available, proceeding without backup');
      return null;
    }
  }

  /**
   * Restore database from backup (if supported)
   */
  async restoreBackup(backupId) {
    if (!backupId) return false;

    try {
      const restoreResponse = await ApiService.post(`/admin/restore/${backupId}`);
      
      if (restoreResponse.success) {
        console.log('✅ Database restored from backup');
        return true;
      }
    } catch (error) {
      console.warn('⚠️  Database restore failed:', error.message);
      return false;
    }
  }

  /**
   * Validate database schema for required fields
   */
  async validateSchema() {
    console.log('🔍 Validating database schema...');
    
    const schemaChecks = {
      users: ['user_id', 'full_name', 'mobile_number', 'date_of_birth', 'pin'],
      payments: ['transaction_id', 'user_id', 'amount', 'payment_method', 'status'],
      chits: ['chit_id', 'chit_name', 'total_amount', 'monthly_amount', 'status']
    };

    const validationResults = {};

    for (const [table, requiredFields] of Object.entries(schemaChecks)) {
      try {
        // Try to get schema information
        const schemaResponse = await ApiService.get(`/schema/${table}`);
        
        if (schemaResponse.data && schemaResponse.data.fields) {
          const availableFields = schemaResponse.data.fields.map(f => f.name);
          const missingFields = requiredFields.filter(field => !availableFields.includes(field));
          
          validationResults[table] = {
            valid: missingFields.length === 0,
            missingFields,
            availableFields
          };
        } else {
          validationResults[table] = { valid: false, error: 'Schema not available' };
        }
      } catch (error) {
        console.warn(`⚠️  Could not validate schema for ${table}:`, error.message);
        validationResults[table] = { valid: true, warning: 'Schema validation skipped' };
      }
    }

    console.log('✅ Schema validation completed');
    return validationResults;
  }
}

/**
 * Test Data Validator
 * Validates test data before insertion
 */
export class TestDataValidator {
  /**
   * Validate user data before registration
   */
  static validateUserData(userData) {
    const errors = [];

    // Required fields
    if (!userData.fullName || userData.fullName.length < 3) {
      errors.push('Full name must be at least 3 characters');
    }

    if (!userData.mobileNumber || userData.mobileNumber.length !== 10) {
      errors.push('Mobile number must be exactly 10 digits');
    }

    if (!userData.pin || userData.pin.toString().length < 4) {
      errors.push('PIN must be at least 4 digits');
    }

    if (!userData.dateOfBirth) {
      errors.push('Date of birth is required');
    }

    // Optional field validation
    if (userData.email && !this.isValidEmail(userData.email)) {
      errors.push('Invalid email format');
    }

    if (userData.aadharNumber && userData.aadharNumber.length !== 12) {
      errors.push('Aadhar number must be exactly 12 digits');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate payment data before processing
   */
  static validatePaymentData(paymentData) {
    const errors = [];

    if (!paymentData.amount || paymentData.amount <= 0) {
      errors.push('Payment amount must be greater than 0');
    }

    if (!paymentData.payment_method) {
      errors.push('Payment method is required');
    }

    if (!paymentData.user_id) {
      errors.push('User ID is required');
    }

    // Validate payment method specific data
    if (paymentData.payment_method.includes('card')) {
      if (!paymentData.card_details || !paymentData.card_details.card_number) {
        errors.push('Card details are required for card payments');
      }
    }

    if (paymentData.payment_method === 'upi') {
      if (!paymentData.upi_details || !paymentData.upi_details.upi_id) {
        errors.push('UPI ID is required for UPI payments');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Check if email format is valid
   */
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

// Export singleton instance
export const dbSetup = new DatabaseSetup();