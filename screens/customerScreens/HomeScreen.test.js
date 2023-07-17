import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import HomeScreen from './HomeScreen';
import { AuthContext } from '../../navigation/AuthProvider';
import { firebase } from '../../firebaseconfig';



// Mock the useNavigation hook
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(() => ({
    navigate: jest.fn(),
  })),
}));

// Mock the Firebase methods and functionality used in HomeScreen component
jest.mock('../../firebaseconfig', () => ({
  firebase: {
    auth: jest.fn(() => ({
      currentUser: {
        uid: 'user-uid',
      },
    })),
    firestore: jest.fn(() => ({
      collection: jest.fn(() => ({
        doc: jest.fn(() => ({
          get: jest.fn(() => ({
            then: jest.fn(() => ({
              exists: true,
              data: () => ({
                firstName: 'John',
              }),
              catch: jest.fn(() => ({

              })),
            })),
          })),
          onSnapshot: jest.fn(() => ({
            exists: true,
            data: () => ({
                currentPoint: '200',
                totalPoint: '200',
              }),
          })),
        })),
        orderBy: jest.fn(() => ({
          onSnapshot: jest.fn(() => ({

          })),

        })),
      })),
    })),
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

const renderWithAuthContext = () => {
    return render(
      <AuthContext.Provider value={{ 
        user: { 
            uid: 'user-uid',
            currentPoint: '100',
            totalPoint: '100',
            firstName: 'John'
        },
        logout: jest.fn() }}>
        <HomeScreen />
      </AuthContext.Provider>
    );
};

// const renderWithAuthContext = (user) => {
//   return render(
//     <AuthContext.Provider
//       value={{
//         user,
//         logout: jest.fn(),
//       }}
//     >
//       <HomeScreen />
//     </AuthContext.Provider>
//   );
// };

describe('Customer HomeScreen', () => {
    let renderResult; // Store the render result
  
    beforeEach(() => {
      renderResult = renderWithAuthContext(); // Call renderWithAuthContext once and store the result
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
  
    it('renders the welcome text', () => {
      const { getByText } = renderResult; // Use the stored render result
      const welcomeText = getByText(/Welcome! */);
      expect(welcomeText).toBeDefined();
    });
  
    it('renders the current point balance', () => {
      const { getByText } = renderResult; // Use the stored render result
      const pointBalanceText = getByText(/Your Current Point Balance: .*/);
      expect(pointBalanceText).toBeDefined();
    });

  //   it('renders the welcome text with dummy user', () => {
  //   const user = {
  //     uid: 'user-uid',
  //     currentPoint: '100',
  //     totalPoint: '100',
  //     firstName: 'John',
  //   };
  //   const { getByText } = renderWithAuthContext(user);
  //   const welcomeText = getByText(/Welcome! John/);
  //   expect(welcomeText).toBeDefined();
  // });

  // it('renders the current point balance with dummy user', () => {
  //   const user = {
  //     uid: 'user-uid',
  //     currentPoint: '100',
  //     totalPoint: '100',
  //     firstName: 'John',
  //   };
  //   const { getByText } = renderWithAuthContext(user);
  //   const pointBalanceText = getByText(/Your Current Point Balance: 100/);
  //   expect(pointBalanceText).toBeDefined();
  // });
  

  //Functional Tests
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

});