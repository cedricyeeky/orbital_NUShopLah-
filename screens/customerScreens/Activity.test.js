import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { AuthContext } from '../../navigation/AuthProvider';
import { firebase } from '../../firebaseconfig';
import renderer from 'react-test-renderer';
import {
  ActivityScreen,
  fetchTransactions,
  getDateOfTransaction,
  renderItem,
  calculateTotalSpent,
} from './Activity';

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
        { id: 'transaction1', 
          data: jest.fn(() => ({ 
            timeStamp: '01/07/2022, 10:30:00 am',//{ toDate: jest.fn(() => new Date()) }, 
            customerName: "customer_name", 
            amountPaid: 51,
            customerId: "customer_id",
            transactionType: 'Points Transaction', 
            
            /* other data properties */ })) },
        { id: 'transaction2', 
          data: jest.fn(() => ({ 
            timeStamp: '01/07/2022, 11:30:00 am',//{ toDate: jest.fn(() => new Date()) }, 
            customerName: "customer_name",
            amountPaid: 47,
            customerId: "customer_id",
            transactionType: 'Voucher Transaction',
            voucherType: 'Dollar',
            
            /* other data properties */ })) },
      ];
      mockData.forEach(callback);
    }),
  };

jest.mock('../../firebaseconfig', () => ({
  firebase: {
    firestore: jest.fn(() => mockFirestore),
  },
}));

// From SettingsScreen.test.js (Customer) Mock firebase and firestore
// jest.mock('../../firebaseconfig', () => ({
//     firebase: {
//       firestore: jest.fn().mockReturnValue({
//         collection: jest.fn().mockReturnThis(),
//         doc: jest.fn().mockReturnThis(),
//         get: jest.fn().mockResolvedValue({ exists: true, data: () => ({ firstName: 'John' }) }),
//         onSnapshot: jest.fn().mockReturnValue({ data: () => ({ currentPoint: 100, totalPoint: 200 }) }),
//       }),
//       auth: jest.fn().mockReturnValue({
//         currentUser: { uid: 'user-uid', email: 'test@example.com', firstName: 'John', currentPoint: 100, totalPoint: 200, },
//         sendPasswordResetEmail: jest.fn().mockResolvedValue(),
//       }),
//     },
//   }));
  
//   const TestComponent = () => (
//       <AuthContext.Provider value={{ user: { uid: 'user-uid' }, logout: jest.fn() }}>
//             <SettingsScreen />
//       </AuthContext.Provider>
//   )

// describe('ActivityScreen', () => {
//   it('renders correctly', () => {
//     const tree = renderer.create(<ActivityScreen />).toJSON();
//     expect(tree).toMatchSnapshot();
//   });

//   // Add more tests for the ActivityScreen component if needed
// });

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
    expect(mockFirestore.where).toHaveBeenCalledWith('customerId', '==', user.uid);
    expect(mockFirestore.orderBy).toHaveBeenCalledWith('timeStamp', 'desc');
    expect(mockFirestore.onSnapshot).toHaveBeenCalledTimes(1);
    expect(setTransactions).toHaveBeenCalledWith(
        expect.arrayContaining([
            { amountPaid: 51,
              id: 'transaction1', 
              timeStamp: '01/07/2022, 10:30:00 am', 
              customerName: "customer_name",
              customerId: "customer_id", 
              transactionType: 'Points Transaction', 
              /* other data properties */ 
            },
            { amountPaid: 47,
              id: 'transaction2', 
              timeStamp: '01/07/2022, 11:30:00 am', 
              customerName: "customer_name",
              customerId: "customer_id",
              transactionType: 'Voucher Transaction',
              voucherType: 'Dollar', /* other data properties */ 
            },
          ])
    );
  });

  // Add more tests for the fetchTransactions function if needed
});

describe('getDateOfTransaction', () => {
  it('should format the timestamp correctly', () => {
    // Mock timestamp
    const mockTimestamp = {
      toDate: jest.fn(() => new Date('2022-07-01T10:30:00')),
    };

    const formattedDate = getDateOfTransaction(mockTimestamp);
    expect(formattedDate).toBe('01/07/2022, 10:30:00 am');
  });

//   it('should return an empty string if timestamp is not provided', () => {
//     const formattedDate = formatDate(null);
//     expect(formattedDate).toBe('');
//   });

  // Add more tests for the formatDate function if needed
});

describe('renderItem', () => {
  it('should render the transaction logs with correct format', () => {
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

    // const renderedItem = renderItem({ item: mockItem });
    // Perform assertions to check the rendered item's output
    // You can use testing-library/react-native or snapshot testing here
    const { getByTestId, getByText } = render(renderItem({ item: mockItem }));

    jest.spyOn(Date.prototype, 'toLocaleString').mockReturnValue('1/1/2023, 12:00:00 AM')

    // Perform assertions
    const renderedItem = getByTestId('TEST_ID_DOLLAR_VOUCHER_TRANSACTION');
    expect(renderedItem.props.style.backgroundColor).toBe('#f07b10'); // Assert background color

    const verifyingText = getByText('Transaction Type: Voucher Transaction');
    expect(verifyingText).toBeDefined();

    // const date = getByTestId('date');
    // expect(date.props.children).toBe('Date: 1/1/2023, 12:00:00 AM'); // Assert formatted date

    // Clean up the spy
    jest.restoreAllMocks();
  });

  // Add more tests for the renderItem function if needed
});

describe('calculateTotalSpent', () => {
  it('should calculate the total spent correctly', () => {
    const transactions = [
      { amountPaid: 10 },
      { amountPaid: 20 },
      { amountPaid: 30 },
    ];

    const totalSpent = calculateTotalSpent(transactions);

    expect(totalSpent).toBe(60);
  });

  it('should return 0 if transactions array is empty', () => {
    const transactions = [];

    const totalSpent = calculateTotalSpent(transactions);

    expect(totalSpent).toBe(0);
  });

  it('should handle decimal places correctly', () => {
    const transactions = [
      { amountPaid: 9.99 },
      { amountPaid: 7.25 },
      { amountPaid: 13.8 },
    ];

    const totalSpent = calculateTotalSpent(transactions);

    expect(totalSpent).toBe(31.04);
  });

  // Add more tests for the calculateTotalSpent function if needed
});
