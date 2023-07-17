import React from 'react';
import { render, waitFor, fireEvent, findByText } from '@testing-library/react-native';
import { AuthContext, AuthProvider } from '../../navigation/AuthProvider';
import { firebase } from '../../firebaseconfig';
import ActivityScreen from './Activity';
import { capitalizeFirstLetter, getDateOfTransaction, calculateTotalRevenue } from './Activity';


// Mock the AuthContext value
const authContextValue = {
  user: { uid: 'user-uid' }
};

// Mock firebase and firestore
jest.mock('../../firebaseconfig', () => ({
  firebase: {
    firestore: jest.fn().mockReturnValue({
      collection: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      onSnapshot: jest.fn().mockImplementation((callback) => {
        const mockSnapshot = {
          forEach: (cb) => {
            const mockDoc = {
              id: 'mockDocId',
              data: () => ({
                // Mock data properties for a transaction
                id: 'mockTransactionId',
                sellerId: 'mockSellerId',
                timeStamp: { toDate: () => new Date('2023-07-16T09:30:00') },
                amountPaid: 10.5,
                // Add more mock data properties as needed
              }),
            };
            cb(mockDoc);
          },
        };
        callback(mockSnapshot);
        return jest.fn(); // Mock unsubscribe function
      }),
    }),
  },
}));


describe('ActivityScreen', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('calculates total revenue correctly', () => {
    const mockTransactions = [
      { amountPaid: 10.5 },
      { amountPaid: 15.75 },
    ];

    const totalRevenue = calculateTotalRevenue(mockTransactions);

    expect(totalRevenue).toBe(26.25);
  });

  it('capitalizeFirstLetter() capitalizes the first letter of a non-empty string', () => {
    expect(capitalizeFirstLetter('hello')).toBe('Hello');
    expect(capitalizeFirstLetter('world')).toBe('World');
    expect(capitalizeFirstLetter('example')).toBe('Example');
  });

  it('formats transaction date correctly', () => {
    const mockTimestamp = { toDate: () => new Date('2023-07-16T09:30:00') };
    const formattedDate = getDateOfTransaction(mockTimestamp);

    expect(formattedDate).toBe('16/07/2023, 9:30:00 am');
  });

  it('fetches and displays transactions', async () => {
    const { findByText } = render(
    <AuthProvider>
      <ActivityScreen />
    </AuthProvider>);

    const transactionId = await findByText('Transaction ID: mockTransactionId');
    const amountPaid = await findByText('Amount Paid: $10.50');
    // Add more assertions for other rendered transaction details
    expect(transactionId).toBeTruthy();
    expect(amountPaid).toBeTruthy();
  });

  
});
