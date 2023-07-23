import React from 'react';
import { render, fireEvent, waitFor, getByTestId, getByText } from '@testing-library/react-native';
import { AuthProvider, AuthContext } from '../../navigation/AuthProvider';
import HomeScreen from './HomeScreen';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { createVoucherInFirestore } from './HomeScreen';
// import { firebase } from '../../firebaseconfig';


jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn().mockResolvedValue({ granted: true }),
  launchImageLibraryAsync: jest.fn().mockResolvedValue({
    cancelled: false,
    uri: 'mocked-image-uri',
  }),
  MediaTypeOptions: {
    Images: 'image',
  },
}));
// Mock Firebase dependencies
jest.mock('@react-navigation/native');

// Mock the Firestore implementation
const mockFirestore = {
  collection: jest.fn(() => mockFirestore),
  doc: jest.fn(() => mockFirestore),
  set: jest.fn(),
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
  FieldValue: {
    serverTimestamp: jest.fn(() => 'mocked-server-timestamp'), // Return a mocked server timestamp value
  },
};


jest.mock('../../firebaseconfig', () => ({
    
      firebase: {
        firestore: jest.fn(() => mockFirestore),
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
        <HomeScreen />
  </AuthContext.Provider>
)


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

  it('should render without error', () => {
    const { getByText } = render(
      <AuthProvider>
        <HomeScreen />
      </AuthProvider>
    );
  });

  it('should render welcome message with user firstName displayed', async () => {
    const { getByText, getByTestId } = render(
        <TestComponent />
      );

    await waitFor(() => getByTestId('test-id-container'));

    expect(getByText('Welcome! John')).toBeTruthy();


  });

  it('should render Voucher Amount input for Dollar Voucher creation card', () => {
    const { getByTestId } = render(
        <AuthProvider >
          <HomeScreen />
        </AuthProvider>
      );

    fireEvent.press(getByTestId('dollar-voucher-button'));

    expect(getByTestId('Voucher Amount ($)')).toBeDefined();
  });

  it('should render Points Required input for voucher creation card', () => {
    const { getByTestId } = render(
        <AuthProvider >
          <HomeScreen />
        </AuthProvider>
      );

    fireEvent.press(getByTestId('dollar-voucher-button'));

    expect(getByTestId('Points Required')).toBeDefined();
  });

  it('should render Voucher Description input', () => {
    const { getByTestId } = render(
        <AuthProvider >
          <HomeScreen />
        </AuthProvider>
      );

    fireEvent.press(getByTestId('dollar-voucher-button'));

    expect(getByTestId('Voucher Description')).toBeDefined();
  });

  it('should render Voucher Percentage input for Percentage Voucher creation card', () => {
    const { getByTestId } = render(
        <AuthProvider >
          <HomeScreen />
        </AuthProvider>
      );

    fireEvent.press(getByTestId('percentage-voucher-button'));

    expect(getByTestId('Voucher Percentage')).toBeDefined();
  });

  it('should display error alert for negative Voucher Amount input values for Dollar Voucher creation card', async () => {
    const { getByText, getByTestId } = render(
      <AuthProvider >
        <HomeScreen />
      </AuthProvider>
    );

    fireEvent.press(getByTestId('dollar-voucher-button'));

    const alertSpy = jest.spyOn(Alert, 'alert');

    fireEvent.changeText(getByTestId('Voucher Amount ($)'), '-10');

    fireEvent.press(getByText('Create'));

    await waitFor(() => {
    expect(alertSpy).toHaveBeenCalledWith('Error!', 'Voucher Amount must be non-negative!');
    });
  });

  it('should display error alert for empty (no input) Voucher Amount input values for Dollar Voucher creation card', async () => {
    const { getByText, getByTestId } = render(
      <AuthProvider >
        <HomeScreen />
      </AuthProvider>
    );

    fireEvent.press(getByTestId('dollar-voucher-button'));

    const alertSpy = jest.spyOn(Alert, 'alert');

    fireEvent.changeText(getByTestId('Voucher Amount ($)'), '');

    fireEvent.press(getByText('Create'));

    await waitFor(() => {
    expect(alertSpy).toHaveBeenCalledWith('Error!', 'Voucher Amount must be non-negative!');
    });
  });

  it('should display error alert for negative Points Required input values for voucher creation card', async () => {
    const { getByText, getByTestId } = render(
      <AuthProvider >
        <HomeScreen />
      </AuthProvider>
    );

    fireEvent.press(getByTestId('dollar-voucher-button'));

    const alertSpy = jest.spyOn(Alert, 'alert');

    fireEvent.changeText(getByTestId('Voucher Amount ($)'), '10');
    fireEvent.changeText(getByTestId('Points Required'), '-100');

    fireEvent.press(getByText('Create'));

    await waitFor(() => {
    //   expect(getByText('Invalid voucher inputs. Please check your input values.')).toBeDefined();
    expect(alertSpy).toHaveBeenCalledWith('Error!', 'Points Required must be non-negative!');
    });
  });

  it('should display error alert for empty (no input) Points Required input values for voucher creation card', async () => {
    const { getByText, getByTestId } = render(
      <AuthProvider >
        <HomeScreen />
      </AuthProvider>
    );

    fireEvent.press(getByTestId('dollar-voucher-button'));

    const alertSpy = jest.spyOn(Alert, 'alert');

    fireEvent.changeText(getByTestId('Voucher Amount ($)'), '10');
    fireEvent.changeText(getByTestId('Points Required'), '');

    fireEvent.press(getByText('Create'));

    await waitFor(() => {
    //   expect(getByText('Invalid voucher inputs. Please check your input values.')).toBeDefined();
    expect(alertSpy).toHaveBeenCalledWith('Error!', 'Points Required must be non-negative!');
    });
  });

  it('should display error alert for negative Voucher Percentage input values for Percentage Voucher creation card', async () => {
    const { getByText, getByTestId } = render(
      <AuthProvider >
        <HomeScreen />
      </AuthProvider>
    );

    fireEvent.press(getByTestId('percentage-voucher-button'));

    const alertSpy = jest.spyOn(Alert, 'alert');

    // fireEvent.changeText(getByTestId('Voucher Amount ($)'), '-10');
    fireEvent.changeText(getByTestId('Voucher Percentage'), '-10');

    fireEvent.press(getByText('Create'));

    await waitFor(() => {
    //   expect(getByText('Invalid voucher inputs. Please check your input values.')).toBeDefined();
    expect(alertSpy).toHaveBeenCalledWith('Error!', 'Voucher Percentage must be non-negative!');
    });
  });

  it('should display error alert for empty (no input) Voucher Percentage input values for Percentage Voucher creation card', async () => {
    const { getByText, getByTestId } = render(
      <AuthProvider >
        <HomeScreen />
      </AuthProvider>
    );

    fireEvent.press(getByTestId('percentage-voucher-button'));

    const alertSpy = jest.spyOn(Alert, 'alert');

    // fireEvent.changeText(getByTestId('Voucher Amount ($)'), '-10');
    fireEvent.changeText(getByTestId('Voucher Percentage'), '');

    fireEvent.press(getByText('Create'));

    await waitFor(() => {
    //   expect(getByText('Invalid voucher inputs. Please check your input values.')).toBeDefined();
    expect(alertSpy).toHaveBeenCalledWith('Error!', 'Voucher Percentage must be non-negative!');
    });
  });


  it('should display error alert when no Voucher Image is selected for voucher creation card', async () => {
    const { getByText, getByTestId } = render(
      <AuthProvider >
        <HomeScreen />
      </AuthProvider>
    );

    fireEvent.press(getByTestId('dollar-voucher-button'));

    const alertSpy = jest.spyOn(Alert, 'alert');


    fireEvent.changeText(getByTestId('Voucher Amount ($)'), '10');
    fireEvent.changeText(getByTestId('Points Required'), '100');
    fireEvent.changeText(getByTestId('Voucher Description'), 'hi this is a voucher');

    fireEvent.press(getByText('Create'));

    await waitFor(() => {
    expect(alertSpy).toHaveBeenCalledWith('Error! Please Upload a valid Voucher Image', "WARNING: All Customers can see your uploaded image. The developers will not condone inappropriate images.");
    });
  });


  it('should ask for permission upon press of Choose Image from library button', async () => {
    const { getByText, getByTestId } = render(
      <AuthProvider >
        <HomeScreen />
      </AuthProvider>
    );

    fireEvent.press(getByTestId('dollar-voucher-button'));
    


    fireEvent.press(getByTestId('voucher-image-button'));
    
    expect(ImagePicker.requestMediaLibraryPermissionsAsync).toHaveBeenCalled();

    
  });

  it('should launch library after granting image access permissions', async () => {
    const { getByText, getByTestId } = render(
      <AuthProvider >
        <HomeScreen />
      </AuthProvider>
    );

    fireEvent.press(getByTestId('dollar-voucher-button'));
    

    fireEvent.press(getByTestId('voucher-image-button'));

    expect(ImagePicker.requestMediaLibraryPermissionsAsync).toHaveBeenCalled();
    expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalled();

  });

    it('should store the voucher details in Firestore', async () => {
      const voucherData = {
        isVoucher: true,
        pointsRequired: 100,
        sellerName: 'John Doe',
        usedBy: [],
        voucherAmount: 50,
        voucherDescription: 'Test voucher',
        voucherImage: 'mocked-image-url',
        voucherPercentage: 0,
        voucherType: 'dollar',
        timeStamp: 'mocked-server-timestamp',
        sellerId: 'mocked-current-user-id',
      };
  
      const voucherId = await createVoucherInFirestore(voucherData);
  
      // Expect that the Firestore collection method is called with the correct data
      expect(mockFirestore.collection).toHaveBeenCalledWith('vouchers');
      expect(mockFirestore.collection('vouchers').doc).toHaveBeenCalledWith(voucherId);
      expect(mockFirestore.collection('vouchers').doc().set).toHaveBeenCalledWith({
        ...voucherData,
        voucherId
      });
    });

  });

  



  describe('Log out button', () => {

    it('should log out the user', () => {
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
