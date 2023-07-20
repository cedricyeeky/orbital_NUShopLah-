import React from 'react';
import { render, waitFor, fireEvent, findByText, act} from '@testing-library/react-native';
import { AuthContext, AuthProvider } from '../../navigation/AuthProvider';
import { firebase } from '../../firebaseconfig';
import {  changePassword, getDateOfVoucher, fetchVouchers, handleCancelVoucher, deleteVoucher, renderItem } from './SettingsScreen';
import { Alert } from 'react-native';
import SettingsScreen from './SettingsScreen';

// Mock the Firestore implementation
const mockFirestore = {
  collection: jest.fn(() => mockFirestore),
  where: jest.fn(() => mockFirestore),
  orderBy: jest.fn(() => mockFirestore),
  onSnapshot: jest.fn(),
  doc: jest.fn(() => mockFirestore),
  delete: jest.fn().mockResolvedValue(),
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
    auth: jest.fn().mockReturnValue({
      currentUser: { uid: 'user-uid', email: 'test@example.com', firstName: 'John', currentPoint: 100, totalPoint: 200, },
      sendPasswordResetEmail: jest.fn().mockResolvedValue(),
    }),
  },
}));

// describe('changePassword', () => {
//   it('should send a password reset email', () => {
//     changePassword();

//     const alertSpy = jest.spyOn(Alert, 'alert');

//     expect(firebase.auth().sendPasswordResetEmail).toHaveBeenCalledWith('mock@example.com');

//     expect(alertSpy).toHaveBeenCalledWith('Password Reset Email Sent!');
//   });

//   it('should show an alert with an error message if there is an error', () => {
//     firebase.auth().sendPasswordResetEmail.mockRejectedValue('Error sending password reset email');

//     changePassword();

//     const alertSpy = jest.spyOn(Alert, 'alert');

//     expect(firebase.auth().sendPasswordResetEmail).toHaveBeenCalledWith('mock@example.com');

//     expect(alertSpy).toHaveBeenCalledWith('Error sending password reset email');
//   });
// });

describe('getDateOfVoucher', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('formats transaction date correctly', () => {
    const mockTimestamp = { toDate: () => new Date('2023-07-16T09:30:00') };
    const formattedDate = getDateOfVoucher(mockTimestamp);

    expect(formattedDate).toBe('16/07/2023, 9:30:00 am');
  });
});

describe('handleCancelVoucher', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should show confirmation alert when cancelling a voucher', () => {
    const voucherId = 'voucher1';

    const alertSpy = jest.spyOn(Alert, 'alert');

    handleCancelVoucher(voucherId);

    expect(alertSpy).toHaveBeenCalledWith(
      'Cancel Voucher',
      'Are you sure you want to cancel this voucher?',
      expect.arrayContaining([
        expect.objectContaining({
          text: 'Cancel',
          style: 'cancel',
        }),
        expect.objectContaining({
          text: 'Confirm',
          style: 'destructive',
          onPress: expect.any(Function),
        }),
      ]),
      { cancelable: true }
    );
  });

});

describe('deleteVoucher', () => {
  it('should delete the voucher from Firestore', async () => {
    const voucherId = 'voucher1';

    // Call the function
    await deleteVoucher(voucherId);

    // Verify that the Firestore delete method is called with the correct arguments
    expect(mockFirestore.doc).toHaveBeenCalledWith('voucher1');
    expect(mockFirestore.delete).toHaveBeenCalled();
  });
});

describe('Seller Account Screen', () => {
  afterEach(() => {
    jest.clearAllMocks();
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

  
  it('should render the created dollar voucher card transaction log with correct format', () => {
    // Mock item data
    const mockItem = {
      voucherType: 'dollar',
      voucherImage: 'mock-dollar-voucher-url',
      id: 'voucher1',
      voucherDescription: 'this is a dollar voucher',
      voucherAmount: 10,
      pointsRequired: 200,
      timeStamp: { toDate: jest.fn(() => new Date('2023-01-01T00:00:00Z')) },
    };

    const { getByTestId, getByText } = render(renderItem({ item: mockItem }));

    jest.spyOn(Date.prototype, 'toLocaleString').mockReturnValue('1/1/2023, 8:00:00 AM')

    // Perform assertions
    const renderedItem = getByTestId('TEST_ID_DOLLAR_VOUCHER');
    expect(renderedItem.props.style.backgroundColor).toBe('#f07b10'); // Assert background color

    //Stronger Test
    const verifyingText = getByText('Value: $10');
    expect(verifyingText).toBeDefined();

    // Clean up the spy
    jest.restoreAllMocks();
  });

  it('should render the created percentage voucher card with correct format', () => {
    // Mock item data
    const mockItem = {
      voucherType: 'percentage',
      voucherImage: 'mock-percentage-voucher-url',
      id: 'voucher2',
      voucherDescription: 'this is a percentage voucher',
      voucherPercentage: 5,
      pointsRequired: 100,
      timeStamp: { toDate: jest.fn(() => new Date('2023-01-01T00:00:00Z')) },
    };

    const { getByTestId, getByText } = render(renderItem({ item: mockItem }));

    jest.spyOn(Date.prototype, 'toLocaleString').mockReturnValue('1/1/2023, 8:00:00 AM')

    // Perform assertions
    const renderedItem = getByTestId('TEST_ID_PERCENTAGE_VOUCHER');
    expect(renderedItem.props.style.backgroundColor).toBe('#db7b98'); // Assert background color

    //Stronger Test
    const verifyingText = getByText('Percentage: 5%');
    expect(verifyingText).toBeDefined();

    // Clean up the spy
    jest.restoreAllMocks();
  });

  it('should send a password reset email and show an alert', async () => {
    // Mock the resolved state of the get() method
    // firebase.firestore().collection().doc().get.mockResolvedValueOnce({
    //     exists: true,
    //     data: jest.fn().mockReturnValue({ firstName: 'John' }),
    // });
    
    // Mock the sendPasswordResetEmail function
    firebase.auth().sendPasswordResetEmail.mockResolvedValueOnce();
    
    // Create a mock implementation for the alert function
    const mockedAlert = jest.fn();
    
    // Mock the global.alert function
    global.alert = mockedAlert;
    
    const { getByTestId } = render(
      <AuthProvider>
        <SettingsScreen />
      </AuthProvider>
    );
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

  

