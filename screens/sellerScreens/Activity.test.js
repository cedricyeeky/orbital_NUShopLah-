import React from 'react';
import { render, waitFor, fireEvent, findByText } from '@testing-library/react-native';
import { AuthContext, AuthProvider } from '../../navigation/AuthProvider';
import { firebase } from '../../firebaseconfig';
import ActivityScreen from './Activity';
import { capitalizeFirstLetter, getDateOfTransaction, calculateTotalRevenue, fetchTransactions } from './Activity';


// // Mock the AuthContext value
// const authContextValue = {
//   user: { uid: 'user-uid' }
// };

// // Mock firebase and firestore
// jest.mock('../../firebaseconfig', () => ({
//   firebase: {
//     firestore: jest.fn().mockReturnValue({
//       collection: jest.fn().mockReturnThis(),
//       where: jest.fn().mockReturnThis(),
//       orderBy: jest.fn().mockReturnThis(),
//       onSnapshot: jest.fn().mockImplementation((callback) => {
//         const mockSnapshot = {
//           forEach: (cb) => {
//             const mockDoc = {
//               id: 'mockDocId',
//               data: () => ({
//                 // Mock data properties for a transaction
//                 id: 'mockTransactionId',
//                 sellerId: 'mockSellerId',
//                 timeStamp: { toDate: () => new Date('2023-07-16T09:30:00') },
//                 amountPaid: 10.5,
//                 // Add more mock data properties as needed
//               }),
//             };
//             cb(mockDoc);
//           },
//         };
//         callback(mockSnapshot);
//         return jest.fn(); // Mock unsubscribe function
//       }),
//     }),
//   },
// }));

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

  it('renders Dollar Voucher transaction containers with orange colour', async () => {
    // Render the ActivityScreen component
    const { getByTestId } = render(
      <AuthContext.Provider value={{ user: { uid: 'user-uid' }, logout: jest.fn() }}>
        <ActivityScreen />
      </AuthContext.Provider>
    );
  
    // Find the containers by test ID
    const dollarContainer = getByTestId('dollar-voucher-container');
  
    // Assert the container colors
    expect(dollarContainer).toHaveStyle({ backgroundColor: '#f07b10' }); // Orange color
  });

  it('renders Percentage Voucher transaction containers with pink colour', async () => {
    // Render the ActivityScreen component
    const { getByTestId } = render(
      <AuthContext.Provider value={{ user: { uid: 'user-uid' }, logout: jest.fn() }}>
        <ActivityScreen />
      </AuthContext.Provider>
    );
  
    // Find the containers by test ID
    const percentageContainer = getByTestId('percentage-voucher-container');
  
    // Assert the container colors
    expect(percentageContainer).toHaveStyle({ backgroundColor: '#db7b98' }); // Pink color
  });

  it('renders Points Voucher transaction containers with dark blue colour', async () => {
    // Render the ActivityScreen component
    const { getByTestId } = render(
      <AuthContext.Provider value={{ user: { uid: 'user-uid' }, logout: jest.fn() }}>
        <ActivityScreen />
      </AuthContext.Provider>
    );
  
    // Find the containers by test ID
    const pointContainer = getByTestId('point-transaction-container');
  
    // Assert the container colors
    expect(pointContainer).toHaveStyle({backgroundColor: '#003d7c'});
  });

  
});
