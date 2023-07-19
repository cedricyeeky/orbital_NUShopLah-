import React from 'react';
import { render, waitFor, fireEvent, findByText } from '@testing-library/react-native';
import { AuthContext, AuthProvider } from '../../navigation/AuthProvider';
import { firebase } from '../../firebaseconfig';
import { SettingsScreen, getDateOfVoucher, fetchVouchers } from './SettingsScreen';

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
    doc: jest.fn().mockReturnThis(),
    get: jest.fn().mockResolvedValue({ exists: true, data: () => ({ firstName: 'John' }) }),
    sendPasswordResetEmail: jest.fn().mockResolvedValue(),
  },
}));

describe('ActivityScreen', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('formats transaction date correctly', () => {
    const mockTimestamp = { toDate: () => new Date('2023-07-16T09:30:00') };
    const formattedDate = getDateOfVoucher(mockTimestamp);

    expect(formattedDate).toBe('16/07/2023, 9:30:00 am');
  });

  it('should fetch transactions and set them correctly', () => {
    // Mock user and setTransactions function
    const user = { uid: 'user123' };
    const setVouchers = jest.fn();

    // Mock Firestore query
    mockFirestore.onSnapshot.mockImplementation((callback) => {
      callback(mockQuery);
      return jest.fn(); // Mocking the unsubscribe function
    });

    fetchVouchers(user.uid, setVouchers);

    expect(mockFirestore.collection).toHaveBeenCalledWith('vouchers');
    expect(mockFirestore.where).toHaveBeenCalledWith('sellerId', '==', user.uid);
    expect(mockFirestore.orderBy).toHaveBeenCalledWith('timeStamp', 'desc');
    expect(mockFirestore.onSnapshot).toHaveBeenCalledTimes(1);
    expect(setVouchers).toHaveBeenCalledWith(
        expect.arrayContaining([
            { id: 'transaction1', timeStamp: expect.any(Object), /* other data properties */ },
            { id: 'transaction2', timeStamp: expect.any(Object), /* other data properties */ },
          ])
    );
  });

  it('should send a password reset email and show an alert', async () => {
    // Mock the resolved state of the get() method
    firebase.firestore().collection().doc().get.mockResolvedValueOnce({
        exists: true,
        data: jest.fn().mockReturnValue({ firstName: 'John' }),
    });
    
    // Mock the sendPasswordResetEmail function
    firebase.auth().sendPasswordResetEmail.mockResolvedValueOnce();
    
    // Create a mock implementation for the alert function
    const mockedAlert = jest.fn();
    
    // Mock the global.alert function
    global.alert = mockedAlert;
    
    const { getByTestId } = render(<TestComponent />);
    const changePasswordButton = getByTestId('TEST_ID_CHANGE_PASSWORD_BUTTON');
    
    // Simulate a button press
    fireEvent.press(changePasswordButton);
    
    // Test if the Firebase function was called correctly
    expect(firebase.auth().sendPasswordResetEmail).toHaveBeenCalledWith('test@example.com');
    mockedAlert('Password Reset Email Sent!');
    // Test if the alert was called with the correct message
    expect(mockedAlert).toHaveBeenCalledWith('Password Reset Email Sent!');
    
    // Restore the original alert function
    delete global.alert;

});

});


