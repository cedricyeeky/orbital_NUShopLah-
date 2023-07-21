import React from 'react';
import { render, waitFor, fireEvent, findByText } from '@testing-library/react-native';
import { AuthContext, AuthProvider } from '../../navigation/AuthProvider';
import { firebase } from '../../firebaseconfig';
import ActivityScreen from './Activity';
import { capitalizeFirstLetter, getDateOfTransaction, calculateTotalRevenue, fetchTransactions, renderItem } from './Activity';

// Mock dependencies
jest.mock('../../navigation/AuthProvider', () => ({
  AuthContext: {
    useContext: jest.fn(),
  },
}));

// Mock the Firestore implementation
const mockFirestore = {
  collection: jest.fn(() => mockFirestore),
  where: jest.fn(() => mockFirestore),
  orderBy: jest.fn(() => mockFirestore),
  onSnapshot: jest.fn(),
};

//Mock Query to be used in testing
const mockQuery = {
    forEach: jest.fn((callback) => {
      const mockData = [
        { id: 'transaction1', data: jest.fn(() => ({ timeStamp: { toDate: jest.fn(() => new Date()) }, /* other data properties */ })) },
        { id: 'transaction2', data: jest.fn(() => ({ timeStamp: { toDate: jest.fn(() => new Date()) }, /* other data properties */ })) },
      ];
      mockData.forEach(callback);
    }),
  };

jest.mock('../../firebaseconfig', () => ({
  firebase: {
    firestore: jest.fn(() => mockFirestore),
  },
}));



  describe('fetchTransactions', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should fetch transactions and set them correctly', () => {
      // Mock user and setTransactions function
      const user = { uid: 'user123' };
      const setTransactions = jest.fn();
  
      // Mock Firestore query
      mockFirestore.onSnapshot.mockImplementation((callback) => {
        callback(mockQuery);
        return jest.fn(); // Mocking the unsubscribe function
      });
  
      fetchTransactions(user.uid, setTransactions);
  
      expect(mockFirestore.collection).toHaveBeenCalledWith('transactions');
      expect(mockFirestore.where).toHaveBeenCalledWith('sellerId', '==', user.uid);
      expect(mockFirestore.orderBy).toHaveBeenCalledWith('timeStamp', 'desc');
      expect(mockFirestore.onSnapshot).toHaveBeenCalledTimes(1);
      expect(setTransactions).toHaveBeenCalledWith(
          expect.arrayContaining([
              { id: 'transaction1', timeStamp: expect.any(Object), /* other data properties */ },
              { id: 'transaction2', timeStamp: expect.any(Object), /* other data properties */ },
            ])
      );
    });
  });

  describe('getDateOfTransaction', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should format transaction date correctly', () => {
      const mockTimestamp = { toDate: () => new Date('2023-07-16T09:30:00') };
      const formattedDate = getDateOfTransaction(mockTimestamp);
  
      expect(formattedDate).toBe('16/07/2023, 9:30:00 am');
    });

  });

  describe('capitalizeFirstLetter', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
    
    it('should capitalize the first letter of a non-empty string', () => {
      expect(capitalizeFirstLetter('hello')).toBe('Hello');
      expect(capitalizeFirstLetter('world')).toBe('World');
      expect(capitalizeFirstLetter('example')).toBe('Example');
    });

  });

  describe('renderItem', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should render the dollar voucher transaction log with correct format', () => {
      // Mock item data
      const mockItem = {
        id: 'transaction1',
        timeStamp: { toDate: jest.fn(() => new Date('2023-01-01T00:00:00Z')) },
        amountPaid: 10,
        pointsAwarded: 0,
        voucherType: 'dollar',
        transactionType: 'Voucher Transaction',
        /* other item properties */
      };
  
      const { getByTestId, getByText } = render(renderItem({ item: mockItem }));
  
      jest.spyOn(Date.prototype, 'toLocaleString').mockReturnValue('1/1/2023, 8:00:00 AM')
  
      // Perform assertions
      const renderedItem = getByTestId('TEST_ID_DOLLAR_VOUCHER_TRANSACTION');
      expect(renderedItem.props.style.backgroundColor).toBe('#f07b10'); // Assert background color
  
      //Stronger Test
      const verifyingText = getByText('Transaction Type: Voucher Transaction');
      expect(verifyingText).toBeDefined();
  
      // Clean up the spy
      jest.restoreAllMocks();
    });

    it('should render the percentage voucher transaction log with correct format', () => {
      // Mock item data
      const mockItem = {
        id: 'transaction2',
        timeStamp: { toDate: jest.fn(() => new Date('2023-01-01T00:00:00Z')) },
        amountPaid: 15,
        pointsAwarded: 0,
        voucherType: 'percentage',
        transactionType: 'Voucher Transaction',
        /* other item properties */
      };
  
      const { getByTestId, getByText } = render(renderItem({ item: mockItem }));
  
      jest.spyOn(Date.prototype, 'toLocaleString').mockReturnValue('1/1/2023, 8:00:00 AM')
  
      // Perform assertions
      const renderedItem = getByTestId('TEST_ID_PERCENTAGE_VOUCHER_TRANSACTION');
      expect(renderedItem.props.style.backgroundColor).toBe('#db7b98'); // Assert background color
  
      //Stronger Test
      const verifyingText = getByText('Transaction Type: Voucher Transaction');
      expect(verifyingText).toBeDefined();
  
      // Clean up the spy
      jest.restoreAllMocks();
    });
  
    it('should render the points transaction log with correct format', () => {
      // Mock item data
      const mockItem = {
        id: 'transaction3',
        timeStamp: { toDate: jest.fn(() => new Date('2023-01-01T00:00:00Z')) },
        amountPaid: 20,
        pointsAwarded: 20,
        transactionType: 'Points Transaction',
        /* other item properties */
      };
  
      const { getByTestId, getByText } = render(renderItem({ item: mockItem }));
  
      jest.spyOn(Date.prototype, 'toLocaleString').mockReturnValue('1/1/2023, 8:00:00 AM')
  
      // Perform assertions
      const renderedItem = getByTestId('TEST_ID_POINT_TRANSACTION');
      expect(renderedItem.props.style.backgroundColor).toBe('#003D7C'); // Assert background color
  
      //Stronger Test
      const verifyingText = getByText('Transaction Type: Points Transaction');
      expect(verifyingText).toBeDefined();
  
      // Clean up the spy
      jest.restoreAllMocks();
    });

  });

  describe('calculateTotalRevenue', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should calculate total revenue correctly', () => {
      const mockTransactions = [
        { amountPaid: 10 },
        { amountPaid: 15 },
      ];
  
      const totalRevenue = calculateTotalRevenue(mockTransactions);
  
      expect(totalRevenue).toBe(25);
    });

    it('should calculate total revenue to be $0 if there is no transactions', () => {
      const mockTransactions = [];
  
      const totalRevenue = calculateTotalRevenue(mockTransactions);
  
      expect(totalRevenue).toBe(0);
    });


    it('should calulate total revenue correctly and rounds the sum to 2 decimal places', () => {
      const mockTransactions = [
        { amountPaid: 10.375 },
        { amountPaid: 15.547 },
      ];
  
      const totalRevenue = calculateTotalRevenue(mockTransactions);
  
      expect(totalRevenue).toBe(25.92);
    });

  });

  

  
