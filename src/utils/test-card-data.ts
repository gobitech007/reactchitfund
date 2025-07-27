// Test Card Data for Development and Testing
// These are dummy card numbers that pass validation but are not real cards

export interface TestCardData {
  cardNumber: string;
  cardName: string;
  expiryDate: string;
  cvv: string;
  cardType: string;
}

export const TEST_CARDS: TestCardData[] = [
  // Visa Test Cards
  {
    cardNumber: '4111 1111 1111 1111',
    cardName: 'John Doe',
    expiryDate: '12/25',
    cvv: '123',
    cardType: 'Visa'
  },
  {
    cardNumber: '4000 0000 0000 0002',
    cardName: 'Jane Smith',
    expiryDate: '06/26',
    cvv: '456',
    cardType: 'Visa'
  },
  
  // Mastercard Test Cards
  {
    cardNumber: '5555 5555 5555 4444',
    cardName: 'Bob Johnson',
    expiryDate: '09/27',
    cvv: '789',
    cardType: 'Mastercard'
  },
  {
    cardNumber: '5105 1051 0510 5100',
    cardName: 'Alice Brown',
    expiryDate: '03/28',
    cvv: '321',
    cardType: 'Mastercard'
  },
  
  // American Express Test Cards
  {
    cardNumber: '3782 8224 6310 005',
    cardName: 'Charlie Wilson',
    expiryDate: '11/25',
    cvv: '1234',
    cardType: 'American Express'
  },
  {
    cardNumber: '3714 4963 5398 431',
    cardName: 'Diana Davis',
    expiryDate: '08/26',
    cvv: '5678',
    cardType: 'American Express'
  },
  
  // Discover Test Cards
  {
    cardNumber: '6011 1111 1111 1117',
    cardName: 'Edward Miller',
    expiryDate: '04/27',
    cvv: '987',
    cardType: 'Discover'
  }
];

// Test UPI IDs
export const TEST_UPI_IDS = [
  'testuser@paytm',
  'john.doe@googlepay',
  'alice123@phonepe',
  'testpay@upi',
  'demo.user@bhim',
  'sample@ybl',
  'test.payment@okaxis',
  'dummy@ibl'
];

// Helper function to get a random test card
export const getRandomTestCard = (): TestCardData => {
  const randomIndex = Math.floor(Math.random() * TEST_CARDS.length);
  return TEST_CARDS[randomIndex];
};

// Helper function to get a random test UPI ID
export const getRandomTestUpiId = (): string => {
  const randomIndex = Math.floor(Math.random() * TEST_UPI_IDS.length);
  return TEST_UPI_IDS[randomIndex];
};

// Helper function to generate future expiry date
export const generateFutureExpiryDate = (): string => {
  const currentDate = new Date();
  const futureDate = new Date(currentDate.getFullYear() + 2, currentDate.getMonth() + Math.floor(Math.random() * 12));
  const month = (futureDate.getMonth() + 1).toString().padStart(2, '0');
  const year = futureDate.getFullYear().toString().slice(-2);
  return `${month}/${year}`;
};

// Note: These are test card numbers and should only be used for development and testing
// They will not work with real payment processors
export const TESTING_NOTES = {
  visa: 'Visa test cards start with 4',
  mastercard: 'Mastercard test cards start with 5 or 2',
  amex: 'American Express test cards start with 3 and have 15 digits',
  discover: 'Discover test cards start with 6',
  cvv: 'CVV is 3 digits for most cards, 4 digits for American Express',
  expiry: 'Use future dates in MM/YY format',
  upi: 'UPI IDs should be in format: username@provider'
};