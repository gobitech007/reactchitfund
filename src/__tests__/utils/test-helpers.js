/**
 * Test Helper Utilities
 * Provides utility functions for generating test data and mocking API responses
 */

/**
 * Generate test users with realistic data
 * @param {number} count - Number of users to generate
 * @returns {Array} Array of test user objects
 */
export const generateTestUsers = (count) => {
  const users = [];
  const firstNames = [
    'Rajesh', 'Priya', 'Amit', 'Sunita', 'Vikram', 'Kavya', 'Arjun', 'Meera',
    'Ravi', 'Anita', 'Suresh', 'Deepika', 'Kiran', 'Pooja', 'Manoj', 'Shreya',
    'Anil', 'Rekha', 'Sanjay', 'Nisha', 'Rohit', 'Divya', 'Ajay', 'Sita',
    'Ramesh', 'Geeta', 'Vinod', 'Lata', 'Ashok', 'Usha', 'Prakash', 'Radha',
    'Mohan', 'Sushma', 'Gopal', 'Manju', 'Hari', 'Shanti', 'Krishna', 'Parvati',
    'Ganesh', 'Lakshmi', 'Shiva', 'Saraswati', 'Vishnu', 'Durga', 'Brahma', 'Kali',
    'Indra', 'Ganga', 'Surya', 'Chandra', 'Vayu', 'Agni', 'Varuna', 'Kubera',
    'Yama', 'Kartikeya', 'Hanuman', 'Bharat', 'Arjuna', 'Bhima', 'Nakula', 'Sahadeva',
    'Yudhishthira', 'Draupadi', 'Kunti', 'Gandhari', 'Dhritarashtra', 'Pandu', 'Vidura', 'Shakuni',
    'Duryodhana', 'Dushasana', 'Karna', 'Dronacharya', 'Bhishma', 'Kripa', 'Ashwatthama', 'Abhimanyu',
    'Subhadra', 'Rukmini', 'Radha', 'Yasoda', 'Devaki', 'Rohini', 'Balarama', 'Sudama',
    'Uddhava', 'Akrura', 'Vasudeva', 'Nanda', 'Kamsa', 'Jarasandha', 'Shishupala', 'Dantavakra',
    'Ekalavya', 'Barbarika', 'Ghatotkacha'
  ];

  const lastNames = [
    'Sharma', 'Verma', 'Gupta', 'Agarwal', 'Singh', 'Kumar', 'Jain', 'Bansal',
    'Mittal', 'Goel', 'Arora', 'Malhotra', 'Kapoor', 'Chopra', 'Bhatia', 'Sethi',
    'Khanna', 'Sood', 'Ahuja', 'Tandon', 'Saxena', 'Rastogi', 'Srivastava', 'Tiwari',
    'Pandey', 'Mishra', 'Shukla', 'Dubey', 'Tripathi', 'Chaturvedi', 'Dwivedi', 'Joshi',
    'Bhatt', 'Patel', 'Shah', 'Mehta', 'Desai', 'Modi', 'Thakkar', 'Vyas',
    'Trivedi', 'Joshi', 'Dave', 'Parikh', 'Amin', 'Gandhi', 'Doshi', 'Kothari',
    'Agrawal', 'Bansal', 'Goyal', 'Jindal', 'Singhal', 'Garg', 'Jaiswal', 'Khandelwal',
    'Maheshwari', 'Porwal', 'Somani', 'Rungta', 'Bajaj', 'Dalmia', 'Birla', 'Ruia',
    'Poddar', 'Kedia', 'Saraf', 'Agarwala', 'Baid', 'Choraria', 'Daga', 'Fatehpuria',
    'Goenka', 'Himatsingka', 'Jhunjhunwala', 'Kanoria', 'Lohia', 'Mundra', 'Newar', 'Oswal',
    'Patodia', 'Rathi', 'Singhania', 'Taparia', 'Vaid', 'Wadhwa', 'Yadav', 'Zaveri'
  ];

  const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'rediffmail.com'];
  const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad'];

  for (let i = 0; i < count; i++) {
    const firstName = firstNames[i % firstNames.length];
    const lastName = lastNames[i % lastNames.length];
    const fullName = `${firstName} ${lastName}`;
    
    // Generate mobile number (Indian format)
    const mobileNumber = `${Math.floor(Math.random() * 3) + 7}${Math.floor(Math.random() * 900000000) + 100000000}`;
    
    // Generate email (some users might not have email - optional field)
    const email = Math.random() > 0.1 ? // 90% chance of having email
      `${firstName.toLowerCase()}${lastName.toLowerCase()}${i}@${domains[i % domains.length]}` : 
      '';
    
    // Generate Aadhar number (some users might not have - optional field)
    const aadharNumber = Math.random() > 0.2 ? // 80% chance of having aadhar
      `${Math.floor(Math.random() * 9000) + 1000}${Math.floor(Math.random() * 90000000) + 10000000}` :
      '';
    
    // Generate date of birth (age between 18-65)
    const currentYear = new Date().getFullYear();
    const birthYear = currentYear - (Math.floor(Math.random() * 47) + 18); // 18-65 years old
    const birthMonth = Math.floor(Math.random() * 12) + 1;
    const birthDay = Math.floor(Math.random() * 28) + 1; // Safe day range for all months
    
    // Generate PIN (4-6 digits)
    const pin = Math.floor(Math.random() * 900000) + 100000;
    
    // Generate password
    const password = `Pass${i}@${firstName.substring(0, 3)}`;

    users.push({
      id: i + 1,
      fullName,
      email,
      mobileNumber,
      aadharNumber,
      birthDay,
      birthMonth,
      birthYear,
      dateOfBirth: `${birthYear}-${String(birthMonth).padStart(2, '0')}-${String(birthDay).padStart(2, '0')}`,
      pin,
      password,
      city: cities[i % cities.length],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  return users;
};

/**
 * Generate test payment data
 * @param {number} userId - User ID
 * @param {number} amount - Payment amount
 * @returns {Object} Payment data object
 */
export const generatePaymentData = (userId, amount = 200) => {
  const paymentMethods = ['credit_card', 'debit_card', 'upi', 'net_banking'];
  const cardNumbers = [
    '4111111111111111', // Visa test card
    '5555555555554444', // Mastercard test card
    '378282246310005',  // Amex test card
    '6011111111111117'  // Discover test card
  ];

  return {
    user_id: userId,
    amount,
    payment_method: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
    card_number: cardNumbers[Math.floor(Math.random() * cardNumbers.length)],
    card_holder_name: 'Test User',
    expiry_month: '12',
    expiry_year: '2025',
    cvv: '123',
    upi_id: `testuser${userId}@paytm`,
    description: `Payment for chit fund - User ${userId}`,
    currency: 'INR'
  };
};

/**
 * Generate test chit data
 * @param {number} count - Number of chits to generate
 * @returns {Array} Array of chit objects
 */
export const generateTestChits = (count = 10) => {
  const chitNames = [
    'Monthly Savings Chit', 'Weekly Investment Chit', 'Festival Special Chit',
    'Education Fund Chit', 'Home Loan Chit', 'Business Growth Chit',
    'Emergency Fund Chit', 'Marriage Fund Chit', 'Vehicle Purchase Chit',
    'Gold Investment Chit', 'Property Investment Chit', 'Health Care Chit'
  ];

  const chits = [];
  for (let i = 0; i < count; i++) {
    chits.push({
      chit_id: i + 1,
      chit_name: chitNames[i % chitNames.length],
      total_amount: (i + 1) * 10000, // 10k, 20k, 30k, etc.
      monthly_amount: (i + 1) * 1000, // 1k, 2k, 3k, etc.
      duration_months: 12,
      total_members: 12,
      current_members: Math.floor(Math.random() * 12) + 1,
      status: 'active',
      start_date: new Date().toISOString(),
      created_at: new Date().toISOString()
    });
  }
  return chits;
};

/**
 * Mock API responses for testing
 * @param {Object} mockAuthService - Mocked auth service
 * @param {Object} mockPaymentService - Mocked payment service
 */
export const mockApiResponses = (mockAuthService, mockPaymentService) => {
  // Mock successful registration
  mockAuthService.register = jest.fn().mockImplementation((userData) => {
    return Promise.resolve({
      success: true,
      data: {
        user_id: Math.floor(Math.random() * 10000),
        fullName: userData.fullName,
        email: userData.email,
        phone: userData.mobileNumber,
        aadhar: userData.aadharNumber,
        dob: userData.dateOfBirth,
        pin: userData.pin,
        generated_password: userData.password || `Gen${Math.random().toString(36).substring(7)}`,
        created_at: new Date().toISOString()
      }
    });
  });

  // Mock successful login
  mockAuthService.login = jest.fn().mockImplementation((loginData) => {
    return Promise.resolve({
      success: true,
      data: {
        user: {
          user_id: Math.floor(Math.random() * 10000),
          fullName: 'Test User',
          email: loginData.email,
          phone: loginData.phone,
          aadhar: loginData.aadhar
        },
        access_token: `mock-token-${Math.random().toString(36).substring(7)}`,
        token_type: 'Bearer',
        expires_in: 3600
      }
    });
  });

  // Mock password reset
  mockAuthService.resetPassword = jest.fn().mockResolvedValue({
    success: true,
    message: 'Password reset email sent successfully'
  });

  // Mock payment processing
  mockPaymentService.processPayment = jest.fn().mockImplementation((paymentData) => {
    return Promise.resolve({
      success: true,
      data: {
        transaction_id: `txn-${Math.random().toString(36).substring(7)}`,
        amount: paymentData.amount,
        payment_method: paymentData.payment_method,
        status: 'completed',
        created_at: new Date().toISOString(),
        receipt_url: `https://example.com/receipt/${Math.random().toString(36).substring(7)}`
      }
    });
  });

  // Mock transaction history
  mockPaymentService.getTransactionHistory = jest.fn().mockResolvedValue({
    success: true,
    data: {
      transactions: [],
      total: 0,
      page: 1,
      limit: 10
    }
  });

  // Mock chit users data
  mockPaymentService.getChitUsers = jest.fn().mockResolvedValue({
    success: true,
    data: generateTestChits(5)
  });

  // Mock chit payment details
  mockPaymentService.getChitPaymentDetails = jest.fn().mockResolvedValue({
    success: true,
    data: []
  });
};

/**
 * Create mock user context
 * @param {Object} user - User object
 * @returns {Object} Mock context
 */
export const createMockUserContext = (user = null) => ({
  currentUser: user,
  login: jest.fn(),
  logout: jest.fn(),
  register: jest.fn(),
  isAuthenticated: !!user,
  loading: false,
  error: null
});

/**
 * Create mock data context
 * @param {Object} initialData - Initial store data
 * @returns {Object} Mock data context
 */
export const createMockDataContext = (initialData = {}) => ({
  store: {
    chitUsersLoading: false,
    chitUsersError: null,
    ...initialData
  },
  updateStore: jest.fn(),
  clearStore: jest.fn()
});

/**
 * Simulate network delay for realistic testing
 * @param {number} ms - Delay in milliseconds
 * @returns {Promise} Promise that resolves after delay
 */
export const simulateNetworkDelay = (ms = 100) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Generate test card details for payment testing
 * @returns {Object} Test card details
 */
export const generateTestCardDetails = () => {
  const testCards = [
    {
      number: '4111111111111111',
      type: 'visa',
      holder_name: 'Test User',
      expiry_month: '12',
      expiry_year: '2025',
      cvv: '123'
    },
    {
      number: '5555555555554444',
      type: 'mastercard',
      holder_name: 'Test User',
      expiry_month: '11',
      expiry_year: '2026',
      cvv: '456'
    },
    {
      number: '378282246310005',
      type: 'amex',
      holder_name: 'Test User',
      expiry_month: '10',
      expiry_year: '2027',
      cvv: '1234'
    }
  ];

  return testCards[Math.floor(Math.random() * testCards.length)];
};

/**
 * Generate test UPI IDs
 * @returns {string} Test UPI ID
 */
export const generateTestUpiId = () => {
  const providers = ['paytm', 'phonepe', 'googlepay', 'amazonpay', 'bhim'];
  const usernames = ['testuser', 'user123', 'demo', 'sample', 'test'];
  
  const provider = providers[Math.floor(Math.random() * providers.length)];
  const username = usernames[Math.floor(Math.random() * usernames.length)];
  
  return `${username}${Math.floor(Math.random() * 1000)}@${provider}`;
};

/**
 * Validate test data integrity
 * @param {Array} users - Array of user objects
 * @returns {Object} Validation result
 */
export const validateTestData = (users) => {
  const errors = [];
  const duplicates = {
    emails: [],
    phones: [],
    aadhars: []
  };

  const emailSet = new Set();
  const phoneSet = new Set();
  const aadharSet = new Set();

  users.forEach((user, index) => {
    // Check required fields
    if (!user.fullName || user.fullName.length < 3) {
      errors.push(`User ${index + 1}: Invalid full name`);
    }
    
    if (!user.mobileNumber || user.mobileNumber.length !== 10) {
      errors.push(`User ${index + 1}: Invalid mobile number`);
    }
    
    if (!user.pin || user.pin.toString().length < 4) {
      errors.push(`User ${index + 1}: Invalid PIN`);
    }

    // Check for duplicates
    if (user.email && emailSet.has(user.email)) {
      duplicates.emails.push(user.email);
    } else if (user.email) {
      emailSet.add(user.email);
    }

    if (phoneSet.has(user.mobileNumber)) {
      duplicates.phones.push(user.mobileNumber);
    } else {
      phoneSet.add(user.mobileNumber);
    }

    if (user.aadharNumber && aadharSet.has(user.aadharNumber)) {
      duplicates.aadhars.push(user.aadharNumber);
    } else if (user.aadharNumber) {
      aadharSet.add(user.aadharNumber);
    }
  });

  return {
    isValid: errors.length === 0 && 
             duplicates.emails.length === 0 && 
             duplicates.phones.length === 0 && 
             duplicates.aadhars.length === 0,
    errors,
    duplicates,
    totalUsers: users.length,
    validUsers: users.length - errors.length
  };
};