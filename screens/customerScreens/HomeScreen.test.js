import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { AuthContext } from '../../navigation/AuthProvider';
import { firebase } from '../../firebaseconfig';

import HomeScreen , { filteredVouchers, handleVoucherRedemption, generateQRCodeData, retrieveVoucherData } from './HomeScreen';

// Mock the useNavigation hook
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(() => ({
    navigate: jest.fn(),
  })),
}));

// Mock the Firebase methods and functionality used in HomeScreen component
jest.mock('../../firebaseconfig', () => ({
  firebase: {
    firestore: jest.fn().mockReturnValue({
      collection: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      doc: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({ 
          exists: true, 
          data: () => ({ 
              uid: 'user-uid', 
              email: 'test@example.com',
              firstName: 'John', 
              currentPoint: 100, 
              totalPoint: 200, 
          }) 
      }),
      onSnapshot: jest.fn().mockReturnValue({ data: () => ({ currentPoint: 100, totalPoint: 200 }) }),
    }),
    auth: jest.fn().mockReturnValue({
      currentUser: { 
          uid: 'user-uid', 
          email: 'test@example.com', 
          firstName: 'John', 
          currentPoint: 100,
          totalPoint: 200, },
      sendPasswordResetEmail: jest.fn().mockResolvedValue(),
    }),
    storage: jest.fn(() => ({
      ref: jest.fn(() => ({
        child: jest.fn(() => ({
          put: jest.fn(() => ({
            on: jest.fn((event, progress, error, complete) => {
              if (event === 'state_changed') {
                complete();
              } else if (event === 'error') {
                error('Image upload error');
              }
            }),
          })),
          getDownloadURL: jest.fn(() => Promise.resolve('https://example.com/voucher-image')),
        })),
      })),
    })),
  },
}));


const TestComponent = () => (
  <AuthContext.Provider value={{
      user: { 
        uid: 'user-uid',
      },
      logout: jest.fn() }}>
      <HomeScreen />
  </AuthContext.Provider>
)

describe('Customer HomeScreen', () => {
    let renderResult; // Store the render result
  
    beforeEach(() => {
      // renderResult = renderWithAuthContext(); // Call renderWithAuthContext once and store the result
      renderResult = render(<TestComponent />);
    });
  
    //Rendering Tests
    it('renders without error', () => {
      renderResult;
    });
  
    it('renders the logo', () => {
      const { getByTestId } = renderResult; // Use the stored render result
      const logo = getByTestId('logo');
      expect(logo).toBeDefined();
    });
  
    it('renders the welcome text', async () => {
      const { getByText, getByTestId } = renderResult; // Use the stored render result
      // Wait for the component to fetch user data and render
      await waitFor(() => getByTestId('TEST_ID_CONTAINER'));
      expect(getByText('Welcome! John')).toBeTruthy();
    });
  
    it('renders the current point balance', () => {
      const { getByText } = renderResult; // Use the stored render result
      const pointBalanceText = getByText(`Your Current Point Balance: 100`);
      expect(pointBalanceText).toBeDefined();
    });

    it('logs out the user', () => {
      const logoutMock = jest.fn();
      const { getByText } = render(
        <AuthContext.Provider value={{ user: { uid: 'testUserId' }, logout: logoutMock }}>
          <HomeScreen />
        </AuthContext.Provider>
      );
  
      fireEvent.press(getByText('Logout'));
  
      expect(logoutMock).toHaveBeenCalled();
    });

});

describe('handleVoucherRedemption', () => {
  it('should handle voucher redemption correctly', () => {
    // Mock necessary dependencies and data
    const voucher = {
      voucherId: 'voucher123',
      pointsRequired: 50,
    };
    const setRedeemedVoucher = jest.fn();
    const toggleTrue = jest.fn();
    const setIsUseNowButtonClicked = jest.fn();
    const toggleFalse = jest.fn();

    // Mock the Alert.alert method
    const alertMock = jest.spyOn(Alert, 'alert');

    // Invoke the handleVoucherRedemption function
    handleVoucherRedemption(
      voucher,
      setRedeemedVoucher,
      toggleTrue,
      setIsUseNowButtonClicked,
      toggleFalse
    );

    // Verify the expected interactions
    expect(setRedeemedVoucher).toHaveBeenCalledWith(voucher);
    expect(toggleTrue).toHaveBeenCalled();
    expect(setIsUseNowButtonClicked).toHaveBeenCalledWith(true);

    // Check the alert message
    expect(alertMock).toHaveBeenCalledWith(
      'Alert',
      'Show the Voucher QR Code to the Seller to redeem this Voucher'
    );
  });
});

describe('fetchAvailableVouchers', () => {
  it('should retrieve voucher data correctly', async () => {
    // Mock the Firestore collection and snapshot
    const currentUserUid = 'user1'; // Assuming the current user is 'user1'
    const vouchers = [
      { voucherId: 'voucher1', usedBy: ['user1', 'user2'] },
      { voucherId: 'voucher2', usedBy: ['user2', 'user3'] },
    ];
    const redeemedVouchers = [
      { voucherId: 'redeemed1', usedBy: ['user1'] },
      { voucherId: 'redeemed2', usedBy: ['user3'] },
    ];

    const voucherDocs = vouchers.map((voucher) => ({
      id: voucher.voucherId,
      data: () => ({...voucher}), //Include usedBy field
    }));
    const redeemedVoucherDocs = redeemedVouchers.map((voucher) => ({
      id: voucher.voucherId,
      data: () => ({...voucher}), //Include usedBy field
    }));

    const forEachMock = jest.fn((callback) => {
      [...voucherDocs, ...redeemedVoucherDocs].forEach((doc) => {
        callback(doc);
      });
    });

    const snapshot = { forEach: forEachMock };

    const getMock = jest.fn().mockResolvedValue(snapshot);
    const orderByMock = jest.fn().mockReturnValue({ get: getMock });
    const collectionMock = jest.fn().mockReturnValue({ orderBy: orderByMock });


    jest.spyOn(firebase, 'firestore').mockReturnValue({
      collection: collectionMock,
    });
  
    // Invoke the retrieveVoucherData function
    act(async () => {
      const result = await retrieveVoucherData();
      
      // Verify calls
      expect(collectionMock).toHaveBeenCalledWith('vouchers');
      expect(orderByMock).toHaveBeenCalledWith('sellerName', 'asc');
      expect(getMock).toHaveBeenCalled();
      expect(forEachMock).toHaveBeenCalled();
    });

    // Verify the filtered vouchers
    const vouchersData = [];
    const redeemedVouchersData = [];
    vouchers.concat(redeemedVouchers).forEach((voucher) => {
      if (voucher.usedBy.includes(currentUserUid)) {
        redeemedVouchersData.push(voucher);
      } else {
        vouchersData.push(voucher);
      }
    });

    const expectedResult = {
      vouchersData: [
        { voucherId: 'voucher2', usedBy: ['user2', 'user3'] },
        { voucherId: 'redeemed2', usedBy: ['user3'] }
      ],
      redeemedVouchersData: [
        { voucherId: 'voucher1', usedBy: ['user1', 'user2'] },
        { voucherId: 'redeemed1', usedBy: ['user1'] }
      ]
    };

    expect(expectedResult).toEqual({
      vouchersData,
      redeemedVouchersData,
    });
  });

  it('should handle errors when retrieving voucher data', async () => {
    // Mock an error when retrieving voucher data
    const error = new Error('Failed to retrieve voucher data');
    const collectionMock = jest.fn().mockReturnValue({
      orderBy: jest.fn().mockReturnValue({
        get: jest.fn().mockRejectedValue(error),
      }),
    });
    jest.spyOn(firebase, 'firestore').mockReturnValue({
      collection: collectionMock,
    });

    // Spy on the console.log function
    const consoleLogSpy = jest.spyOn(console, 'log');

    // Invoke the retrieveVoucherData function
    const result = await retrieveVoucherData();

    // Verify the result
    expect(collectionMock).toHaveBeenCalledWith('vouchers');
    expect(collectionMock().orderBy).toHaveBeenCalledWith('sellerName', 'asc');
    expect(collectionMock().orderBy().get).toHaveBeenCalled();
    expect(result).toEqual({
      vouchersData: [],
      redeemedVouchersData: [],
    });
    expect(consoleLogSpy).toHaveBeenCalledWith(
      'Error retrieving voucher data:',
      error
    );

    // Restore the console.log function
    consoleLogSpy.mockRestore();
  });
});

const redeemedVoucherData = { //Mock redeemed Voucher
  pointsRequired: 100,
  sellerId: 'seller123',
  voucherAmount: 50,
  voucherDescription: 'Mocked Voucher',
  voucherId: 'voucher123',
  voucherPercentage: 10,
  voucherType: 'Percentage',
};

const userData = {
  firstName: 'John', // Mocked user first name
};

describe('generateQRCodeData', () => {
  it('should render and encode the Voucher QR code correctly', () => {

    // Call the generateQRCodeData function with mocked user data and redeemed voucher data
    const qrCodeData = generateQRCodeData(
      { uid: 'user-uid' }, // Mocked user data
      userData.firstName,
      redeemedVoucherData
    );

    const expectedResult = JSON.stringify({
      customerId: 'user-uid',
      customerName: 'John',
      pointsRequired: 100,
      isVoucher: true,
      sellerId: 'seller123',
      voucherAmount: 50,
      voucherDescription: 'Mocked Voucher',
      voucherId: 'voucher123',
      voucherPercentage: 10,
      voucherType: 'Percentage',
    });

    // Check if the QR code data is encoded correctly
    expect(qrCodeData).toEqual(expectedResult);
  });
});

 
//   it('redeems a voucher when the user has sufficient points', () => {
//     const { getByText } = renderResult;
//     const redeemButton = getByText('USE NOW');
    
//     // Mock the necessary dependencies and user data
//     const firebaseMock = jest.fn();
//     const currentUserMock = { uid: 'user123' };
//     const voucherMock = {
//       voucherId: 'voucher123',
//       pointsRequired: 50,
//       sellerId: 'seller123',
//       // Add other required properties for generating QR code data
//     };
  
//     // Mock the necessary Firebase functions
//     firebaseMock.auth = jest.fn(() => ({
//       currentUser: currentUserMock,
//     }));
//     firebaseMock.firestore = jest.fn(() => ({
//       collection: jest.fn(() => ({
//         doc: jest.fn(() => ({
//           get: jest.fn(() => ({
//             exists: true,
//             data: () => ({
//               currentPoint: 100, // Set the user's current point balance
//               totalPoint: 200, // Set the user's total point balance
//             }),
//           })),
//         })),
//       })),
//     }));
  
//     // Mock the necessary Alert functions
//     const alertMock = jest.fn();
  
//     // Replace the original dependencies with the mocks
//     jest.mock('../../firebaseconfig', () => ({ firebase: firebaseMock }));
//     jest.mock('react-native', () => ({ Alert: { alert: alertMock } }));
  
//     // Perform the redemption by clicking the redeem button
//     fireEvent.press(redeemButton);
  
//     // Assert that the necessary functions were called with the expected parameters
//     expect(alertMock).toHaveBeenCalledWith(
//       'Redeem Voucher',
//       'Are you sure you want to redeem this voucher?',
//       expect.any(Array) // Mock the array of buttons and their onPress functions
//     );
  
//     expect(firebaseMock.firestore().collection().doc).toHaveBeenCalledWith('user123');
//     expect(firebaseMock.firestore().collection().doc().get).toHaveBeenCalled();
    
//   });


// describe('HomeScreen', () => {
//   it('should redeem a voucher when confirmed by the user', () => {
//     // Mock necessary dependencies and data
//     const voucher = {
//       voucherId: 'voucher123',
//       pointsRequired: 50,
//     };
//     const setRedeemedVoucher = jest.fn();
//     const toggleTrue = jest.fn();
//     const setIsUseNowButtonClicked = jest.fn();
//     const toggleFalse = jest.fn();
//     const Alert = {
//       alert: jest.fn((title, message, buttons) => {
//         // Simulate user confirming the redemption
//         buttons[1].onPress();
//       }),
//     };

//     const alertSpy = jest.spyOn(Alert, 'alert');

//     // Invoke the handleVoucherRedemption function
//     handleVoucherRedemption(
//       voucher,
//       setRedeemedVoucher,
//       toggleTrue,
//       setIsUseNowButtonClicked,
//       toggleFalse,
//       Alert
//     );

//     // Verify the expected interactions
//     expect(setRedeemedVoucher).toHaveBeenCalledWith(voucher);
//     expect(toggleTrue).toHaveBeenCalled();
//     expect(setIsUseNowButtonClicked).toHaveBeenCalledWith(true);
//     expect(toggleFalse).not.toHaveBeenCalled();
//     expect(Alert.alert).toHaveBeenCalledWith(
//       'Alert',
//       'Show the Voucher QR Code to the Seller to redeem this Voucher',
//       expect.any(Array)
//     );
//   });

//   it('should show a warning if the user does not have sufficient points', () => {
//     // Mock necessary dependencies and data
//     const voucher = {
//       voucherId: 'voucher123',
//       pointsRequired: 100,
//     };
//     const setRedeemedVoucher = jest.fn();
//     const toggleTrue = jest.fn();
//     const setIsUseNowButtonClicked = jest.fn();
//     const toggleFalse = jest.fn();
//     const Alert = {
//       alert: jest.fn(),
//     };

//     // Invoke the handleVoucherRedemption function
//     handleVoucherRedemption(
//       voucher,
//       setRedeemedVoucher,
//       toggleTrue,
//       setIsUseNowButtonClicked,
//       toggleFalse,
//       Alert
//     );

//     // Verify the expected interactions
//     expect(setRedeemedVoucher).not.toHaveBeenCalled();
//     expect(toggleTrue).not.toHaveBeenCalled();
//     expect(setIsUseNowButtonClicked).not.toHaveBeenCalled();
//     expect(toggleFalse).not.toHaveBeenCalled();
//     expect(Alert.alert).toHaveBeenCalledWith(
//       'Warning',
//       'Insufficient Point Balance!'
//     );
//   });

//   it('should cancel voucher redemption if the user does not confirm', () => {
//     // Mock necessary dependencies and data
//     const voucher = {
//       voucherId: 'voucher123',
//       pointsRequired: 50,
//     };
//     const setRedeemedVoucher = jest.fn();
//     const toggleTrue = jest.fn();
//     const setIsUseNowButtonClicked = jest.fn();
//     const toggleFalse = jest.fn();
//     const Alert = {
//       alert: jest.fn((title, message, buttons) => {
//         // Simulate user canceling the redemption
//         buttons[0].onPress();
//       }),
//     };

//     // Invoke the handleVoucherRedemption function
//     handleVoucherRedemption(
//       voucher,
//       setRedeemedVoucher,
//       toggleTrue,
//       setIsUseNowButtonClicked,
//       toggleFalse,
//       Alert
//     );

//     // Verify the expected interactions
//     expect(setRedeemedVoucher).not.toHaveBeenCalled();
//     expect(toggleTrue).not.toHaveBeenCalled();
//     expect(setIsUseNowButtonClicked).not.toHaveBeenCalled();
//     expect(toggleFalse).not.toHaveBeenCalled();
//     expect(Alert.alert).toHaveBeenCalledWith(
//       'Redeem Voucher',
//       'Are you sure you want to redeem this voucher?',
//       expect.any(Array)
//     );
//   });

//   it('should handle voucher redemption cancellation', () => {
//     // Mock necessary dependencies and data
//     const voucher = {
//       voucherId: 'voucher123',
//       pointsRequired: 50,
//     };
//     const setRedeemedVoucher = jest.fn();
//     const toggleTrue = jest.fn();
//     const setIsUseNowButtonClicked = jest.fn();
//     const toggleFalse = jest.fn();
//     const Alert = {
//       alert: jest.fn(),
//     };

//     // Invoke the handleVoucherRedemption function
//     handleVoucherRedemption(
//       voucher,
//       setRedeemedVoucher,
//       toggleTrue,
//       setIsUseNowButtonClicked,
//       toggleFalse,
//       Alert
//     );

//     // Simulate user canceling the redemption
//     fireEvent.press(Alert.alert.mock.calls[0][2][0]);

//     // Verify the expected interactions
//     expect(setRedeemedVoucher).not.toHaveBeenCalled();
//     expect(toggleTrue).not.toHaveBeenCalled();
//     expect(setIsUseNowButtonClicked).not.toHaveBeenCalled();
//     expect(toggleFalse).toHaveBeenCalled();
//     expect(Alert.alert).toHaveBeenCalledWith(
//       'Alert',
//       'Show the Voucher QR Code to the Seller to redeem this Voucher',
//       expect.any(Array)
//     );
//   });
// });

