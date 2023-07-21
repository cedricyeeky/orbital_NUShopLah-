// //CANNOT PROCEED. KIV!

// import React from 'react';
// import { render, fireEvent } from '@testing-library/react-native';
// import IdScreen from './IdScreen';
// import { AuthProvider } from '../../navigation/AuthProvider';
// import QRCodeWithLogo from '../../components/QRCodeWithLogo';

// // Mock dependencies
// const mockAuthContextValue = {
//   user: { uid: 'mocked-uid' },
// };

// const mockUser = {
//     uid: 'mocked-uid',
//     firstName: 'John',
//     currentPoint: '100',
//     totalPoint: '200',
//   };

// // jest.mock('../../navigation/AuthProvider', () => ({
// //   AuthContext: {
// //     Consumer: ({ children }) => children(mockAuthContextValue),
// //   },
// // }));

// jest.mock('../../firebaseconfig', () => ({
//   firebase: {
//     firestore: jest.fn(() => ({
//       collection: jest.fn(() => ({
//         doc: jest.fn(() => ({
//           get: jest.fn(() =>
//             Promise.resolve({
//               exists: true,
//               data: () => ({
//                 currentPoint: 100,
//                 totalPoint: 200,
//               }),
//             })
//           ),
//           onSnapshot: jest.fn((callback) => {
//             callback({
//               data: jest.fn(() => ({
//                 currentPoint: 150,
//                 totalPoint: 250,
//               })),
//             });
//             return jest.fn();
//           }),
//         })),
//       })),
//     })),
//     auth: jest.fn(() => ({
//       currentUser: { uid: 'mocked-uid' },
//     })),
//   },
// }));

// jest.mock('../../assets/NUShopLah!.png', () => 'mocked-logo-image');

// describe('IdScreen', () => {
//   it('renders correctly', () => {
//     const { getByText, getByTestId } = render(
//         <AuthProvider>
//             <IdScreen />
//         </AuthProvider>
//     );

//     expect(getByText("'s ID")).toBeTruthy();
//     expect(getByText('Current Point Balance:')).toBeTruthy();
//     expect(getByText('0')).toBeTruthy();
//     expect(getByTestId('qrcode-component')).toBeTruthy();
//   });

//   it('updates current point and total point when user data changes', () => {
//     const { getByText } = render(
//         <AuthProvider>
//             <IdScreen />
//         </AuthProvider>
//     );

//     expect(getByText('0')).toBeTruthy(); // Initial current point

//     fireEvent.get(getByText("'s ID"), 'onSnapshot'); // Trigger snapshot callback

//     expect(getByText('150')).toBeTruthy(); // Updated current point
//   });

//   it('generates correct QR code data', () => {
//     const { getByTestId } = render(
//         <AuthProvider>
//             <IdScreen />
//         </AuthProvider>
//     );

//     const qrcodeComponent = getByTestId('qrcode-component');
//     expect(qrcodeComponent.props.value).toEqual(
//       JSON.stringify({
//         uid: 'mocked-uid',
//         firstName: 'John',
//         currentPoint: 100,
//         totalPoint: 200,
//         amountPaid: 0,
//         isVoucher: false,
//       })
//     );
//   });
// });

import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import IdScreen from './IdScreen';
import { AuthContext } from '../../navigation/AuthProvider';
import { firebase } from '../../firebaseconfig';
import { generateQRCodeData, startFirestoreListener } from './IdScreen';

// Mock the AuthContext
// jest.mock('../../navigation/AuthProvider', () => ({
//   AuthContext: {
//     user: {
//       uid: 'user-uid',
//     },
//   },
// }));


// Mock firebase and firestore
jest.mock('../../firebaseconfig', () => ({
    firebase: {
      firestore: jest.fn().mockReturnValue({
        collection: jest.fn().mockReturnThis(),
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
    },
}));

const TestComponent = () => (
    <AuthContext.Provider value={{ user: { uid: 'user-uid' }, logout: jest.fn() }}>
          <IdScreen />
    </AuthContext.Provider>
)

  

describe('IdScreen', () => {
    it('renders the user ID screen with correct data', async () => {
        const { getByTestId, getByText } = render(<TestComponent />);

        // Wait for the component to fetch user data and render
        await waitFor(() => getByTestId('TEST_ID_CONTAINER'));

        expect(getByText("John's ID")).toBeTruthy();
        expect(getByText('Current Point Balance:')).toBeTruthy();
        expect(getByText('100')).toBeTruthy();

        // You can add more assertions as needed
    });

    it('should call firebase firestore to get user data', async () => {
        
        // Test if the firestore functions were called correctly
        expect(firebase.firestore().collection).toHaveBeenCalledWith('users');
        expect(firebase.firestore().doc).toHaveBeenCalledWith('user-uid');
        expect(firebase.firestore().get).toHaveBeenCalled();

        // Test if the auth functions were called correctly
        expect(firebase.auth().currentUser.uid).toEqual('user-uid');
        expect(firebase.auth().currentUser.email).toEqual('test@example.com');
        expect(firebase.auth().currentUser.firstName).toEqual('John');
        expect(firebase.auth().currentUser.currentPoint).toEqual(100);
        expect(firebase.auth().currentUser.totalPoint).toEqual(200);
    });

    it('use a Firestore listener and updates the currentPoint and totalPoint whenever there are changes', () => {
        const user = {
            uid: 'mock-user-uid',
            currentPoint: 100,
            totalPoint: 200,
        };
        const setCurrentPointMock = jest.fn();
        const setTotalPointMock = jest.fn();
    
        // Mock the onSnapshot method and capture the listener callback
        const onSnapshotMock = jest.fn((callback) => {
            const updatedData = {
                currentPoint: 200,
                totalPoint: 300,
            };
            const snapshotMock = {
                data: jest.fn(() => updatedData),
            };
            // Simulate an update by calling the listener callback with the mock snapshot
            callback(snapshotMock);
        });

        const unsubscribe = () => startFirestoreListener(user, setCurrentPointMock, setTotalPointMock);
    
        // Call the listener callback with the mock snapshot
        const userDocRefMock = {
            onSnapshot: onSnapshotMock,
        };

        const userCollectionRefMock = {
            doc: jest.fn(() => userDocRefMock),
        };

        const firestoreMock = {
            collection: jest.fn(() => userCollectionRefMock),
        };

        jest.spyOn(firebase, 'firestore').mockReturnValue(firestoreMock);

        unsubscribe(); // Unsubscribe the listener
    
        expect(setCurrentPointMock).toHaveBeenCalledWith(200);
        expect(setTotalPointMock).toHaveBeenCalledWith(300);
      });
});

describe('generateQRCodeData', () => {
    it('generates the correct QR code data when user is logged in', () => {
      const user = {
        uid: 'mock-user-uid',
      };
      const firstName = 'John';
      const currentPoint = 100;
      const totalPoint = 500;
  
      const expectedResult = JSON.stringify({
        uid: 'mock-user-uid',
        firstName: 'John',
        currentPoint: 100,
        totalPoint: 500,
        amountPaid: 0,
        isVoucher: false,
      });
  
      const result = generateQRCodeData(user.uid, firstName, currentPoint, totalPoint);
  
      expect(result).toEqual(expectedResult);
    });
  
    it('returns null when user is logged out', () => {
      const user = null; // User is logged out
      const firstName = 'John';
      const currentPoint = 100;
      const totalPoint = 500;
  
      const result = generateQRCodeData(user, firstName, currentPoint, totalPoint);
  
      expect(result).toBeNull();
    });
  });