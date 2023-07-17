import React from 'react';
import { render, fireEvent, waitFor, getByTestId, getByText } from '@testing-library/react-native';
import { AuthProvider, AuthContext } from '../../navigation/AuthProvider';
import HomeScreen from './HomeScreen';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

jest.mock('expo-image-picker');

// Mock Firebase dependencies
jest.mock('@react-navigation/native');
jest.mock('expo-image-picker', () => ({
    requestMediaLibraryPermissionsAsync: jest.fn(),
    launchImageLibraryAsync: jest.fn(),
  }));
  jest.mock('../../firebaseconfig', () => {
    return {
      firebase: {
        auth: jest.fn(() => ({
          currentUser: {
            uid: 'testUserId',
          },
        })),
        storage: jest.fn(() => ({
          ref: jest.fn(() => ({
            child: jest.fn(() => ({
              put: jest.fn(() => ({
                snapshot: {
                  ref: {
                    getDownloadURL: jest.fn(() => Promise.resolve('mockedImageUrl')),
                  },
                },
              })),
            })),
          })),
        })),
        firestore: jest.fn(() => ({
          collection: jest.fn(() => ({
            doc: jest.fn(() => ({
              id: 'mockedVoucherId',
              set: jest.fn(() => Promise.resolve()),
              get: jest.fn(() => Promise.resolve({ exists: true, data: () => ({ firstName: 'John' }) })),
            })),
          })),
        })),
      },
    };
  });

describe('HomeScreen', () => {
    beforeAll(() => {
        // Mock the permission result
        ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValueOnce({
            granted: true,
        });

        // Mock the image selection
        ImagePicker.launchImageLibraryAsync.mockResolvedValueOnce({
            cancelled: false,
            uri: 'mockedImageUri',
        });
        });

    afterAll(() => {
        // Restore the original implementation
        jest.restoreAllMocks();
        });

  test('renders home screen wihtout error', () => {
    const { getByText } = render(
      <AuthProvider>
        <HomeScreen />
      </AuthProvider>
    );
  });

  test('renders welcome message', () => {
    const { getByText } = render(
        <AuthProvider>
          <HomeScreen />
        </AuthProvider>
      );

    expect(getByText('Welcome!')).toBeDefined();
  });

  it('renders voucher amount input', () => {
    const { getByTestId } = render(
        <AuthProvider >
          <HomeScreen />
        </AuthProvider>
      );

    expect(getByTestId('Voucher Amount ($)')).toBeDefined();
  });

  it('renders points required input', () => {
    const { getByTestId } = render(
        <AuthProvider >
          <HomeScreen />
        </AuthProvider>
      );

    expect(getByTestId('Points Required')).toBeDefined();
  });

  // ...

  it('displays error alert for negative voucher amount values', async () => {
    const { getByText, getByTestId } = render(
      <AuthProvider >
        <HomeScreen />
      </AuthProvider>
    );

    const alertSpy = jest.spyOn(Alert, 'alert');

    fireEvent.changeText(getByTestId('Voucher Amount ($)'), '-10');
    // fireEvent.changeText(getByTestId('Points Required'), '-100');

    fireEvent.press(getByText('Create'));

    await waitFor(() => {
    //   expect(getByText('Invalid voucher inputs. Please check your input values.')).toBeDefined();
    expect(alertSpy).toHaveBeenCalledWith('Error!', 'Voucher Amount cannot be Negative!');
    });
  });

  it('displays error alert for negative points required values', async () => {
    const { getByText, getByTestId } = render(
      <AuthProvider >
        <HomeScreen />
      </AuthProvider>
    );

    const alertSpy = jest.spyOn(Alert, 'alert');

    // fireEvent.changeText(getByTestId('Voucher Amount ($)'), '-10');
    fireEvent.changeText(getByTestId('Points Required'), '-100');

    fireEvent.press(getByText('Create'));

    await waitFor(() => {
    //   expect(getByText('Invalid voucher inputs. Please check your input values.')).toBeDefined();
    expect(alertSpy).toHaveBeenCalledWith('Error!', 'Points Required cannot be Negative!');
    });
  });

  it('displays error alert for negative voucher percentage values', async () => {
    const { getByText, getByTestId } = render(
      <AuthProvider >
        <HomeScreen />
      </AuthProvider>
    );

    const alertSpy = jest.spyOn(Alert, 'alert');

    // fireEvent.changeText(getByTestId('Voucher Amount ($)'), '-10');
    fireEvent.changeText(getByTestId('Voucher Percentage'), '-10');

    fireEvent.press(getByText('Create'));

    await waitFor(() => {
    //   expect(getByText('Invalid voucher inputs. Please check your input values.')).toBeDefined();
    expect(alertSpy).toHaveBeenCalledWith('Error!', 'Voucher Percentage cannot be Negative!');
    });
  });


  it('displays error alert when no voucher image is selected', async () => {
    const { getByText, getByTestId } = render(
      <AuthProvider >
        <HomeScreen />
      </AuthProvider>
    );

    const alertSpy = jest.spyOn(Alert, 'alert');


    fireEvent.changeText(getByTestId('Voucher Amount ($)'), '10');
    fireEvent.changeText(getByTestId('Points Required'), '100');

    fireEvent.press(getByText('Create'));

    await waitFor(() => {
    //   expect(getByText('Please select a voucher image.')).toBeDefined();
    expect(alertSpy).toHaveBeenCalledWith('Error! Please Upload a valid Voucher Image', "WARNING: All Customers can see your uploaded image. The developers will not condone inappropriate images.");
    });
  });


// it('should create a voucher successfully', async () => {
//     // Render the HomeScreen component
//     const { getByText, getByTestId } = render(
//       <AuthProvider >
//         <HomeScreen />
//       </AuthProvider>
//     );

//     // Fill in the input fields
//     fireEvent.changeText(getByTestId('Voucher Amount ($)'), '10');
//     fireEvent.changeText(getByTestId('Points Required'), '100');
//     fireEvent.changeText(getByTestId('Voucher Description'), 'Test Voucher');

//     // Mock the image selection
//     fireEvent.press(getByText('Choose Image From Library'));
//     // const selectImageSpy = jest.spyOn(ImagePicker, 'launchImageLibraryAsync').mockResolvedValueOnce({ uri: 'mockedImageUri', cancelled: false });

//     // await waitFor(() =>
//     // //   expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalledTimes(1)
//     // // );

//     // Press the create button
//     fireEvent.press(getByText('Create'));

//     // Wait for the voucher to be created
//     await waitFor(() => {
//     //   expect(getByText('Image download URL: mockedImageUrl')).toBeDefined();
//       expect(firebase.firestore().collection().doc().set).toHaveBeenCalledWith({
//         isVoucher: true,
//         pointsRequired: '100',
//         sellerName: '',
//         sellerId: 'mockedUserId',
//         timeStamp: expect.anything(),
//         usedBy: [],
//         voucherAmount: '10',
//         voucherDescription: 'Test Voucher',
//         voucherId: expect.any(String),
//         voucherImage: 'mockedImageUrl',
//         voucherPercentage: '0',
//         voucherType: 'dollar',
//       });
//     });

//     // Check if the alert was called
//     expect(Alert.alert).toHaveBeenCalledWith('Success! Voucher created successfully!');
//   });

// test('should create a voucher successfully', async () => {
//     // Mock the necessary dependencies
//     jest.mock('expo-image-picker', () => ({
//       requestMediaLibraryPermissionsAsync: jest.fn().mockResolvedValue({ granted: true }),
//       launchImageLibraryAsync: jest.fn().mockResolvedValue({ uri: 'mockedImageUri', cancelled: false }),
//     }));
//     jest.mock('../../firebaseconfig', () => ({
//       firebase: {
//         firestore: jest.fn().mockReturnThis(),
//         collection: jest.fn().mockReturnThis(),
//         doc: jest.fn().mockReturnThis(),
//         set: jest.fn().mockResolvedValue(),
//       },
//     }));

//     // Render the HomeScreen component
//     const { getByText, getByTestId } = render(
//       <AuthProvider >
//         <HomeScreen />
//       </AuthProvider>);

//     // Input some values
//     fireEvent.changeText(getByTestId('Voucher Amount ($)'), '10');
//     fireEvent.changeText(getByTestId('Points Required'), '100');
//     fireEvent.changeText(getByTestId('Voucher Description'), 'Test voucher description');

//     // Mock the image selection
//     const selectImageSpy = jest.spyOn(ImagePicker, 'launchImageLibraryAsync').mockResolvedValueOnce({ uri: 'mockedImageUri', cancelled: false });

//     // Press the create button
//     fireEvent.press(getByText('Create'));

//     // Wait for the voucher creation to complete
//     await waitFor(() => {
//       expect(selectImageSpy).toHaveBeenCalledTimes(1);
//       expect(firebase.firestore().collection().doc().set).toHaveBeenCalledTimes(1);
//       expect(Alert.alert).toHaveBeenCalledWith('Success! Voucher created successfully!');
//       expect(getByTestId('Voucher Amount ($)').props.value).toBe('');
//       expect(getByTestId('Points Required').props.value).toBe('');
//       expect(getByTestId('Voucher Description').props.value).toBe('');
//     });
//   });

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
