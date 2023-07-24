import React from 'react';
import { Alert } from 'react-native';
import { render, waitFor, fireEvent, findByText } from '@testing-library/react-native';
import { AuthContext, AuthProvider } from '../../navigation/AuthProvider';
import { firebase } from '../../firebaseconfig';
import ScannerScreen, { handleQRCodeScan } from './Scanner';
import { calculateNewCurrentPoint, calculateNewTotalPoint, updateVoucherUsedByInFirestore, updateCurrentPointInFirestore, addVoucherTransactionInFirestore, addPointsTransactionInFirestore} from './Scanner';
import { Camera } from 'expo-camera';
import { NavigationContainer } from '@react-navigation/native';

jest.mock('expo-camera', () => ({
  Camera: {
    requestCameraPermissionsAsync: jest.fn(),
  },
}));


// Mock the Firestore implementation
const mockFirestore = {
  collection: jest.fn(() => mockFirestore),
  doc: jest.fn(() => mockFirestore),
  set: jest.fn(),
  add: jest.fn(),
  update: jest.fn(),
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
  FieldValue: jest.fn(() => mockFirestore),
  serverTimestamp: jest.fn(), 
  arrayUnion: jest.fn(),
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


describe('calculateNewCurrentPoint', () => {
  
  it('should calculate new current point correctly', () => {
    const TIER_STATUS_LIMIT = [500, 1500, 5000]; //Number of points required to move up to next Tier. For example, "500" indicates you can level up from "Member" to "Silver" Tier
    const POINT_MULTIPLIER = [1, 1.25, 1.5, 2]; //Member, Silver, Gold, Platinum respectively

    const currentPoint = 600;
    const amountPaid = 50;
    const expected = 663;

    const result = calculateNewCurrentPoint(currentPoint, amountPaid);

    expect(result).toBe(expected);
  });

});

describe('calculateNewTotalPoint', () => {
  it('should calculate new total point correctly', () => {
    const TIER_STATUS_LIMIT = [500, 1500, 5000]; //Number of points required to move up to next Tier. For example, "500" indicates you can level up from "Member" to "Silver" Tier
    const POINT_MULTIPLIER = [1, 1.25, 1.5, 2]; //Member, Silver, Gold, Platinum respectively
    
    const totalPoint = 600;
    const amountPaid = 50;
    const expected = 663;

    const result = calculateNewTotalPoint(totalPoint, amountPaid);

    expect(result).toBe(expected);
  });
});
    

describe('ScannerScreen', () => {
  beforeEach(() => {
    // Reset mocked functions before each test
    Camera.requestCameraPermissionsAsync.mockResolvedValueOnce({ status: 'granted' });
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should add a voucher transaction to Firestore', async () => {
    const mockVoucherData = {
      finalAmount: 100,
      customerId: 'mockCustomerId',
      customerName: 'Mock Customer',
      sellerId: 'mockSellerId',
      sellerName: 'Mock Seller',
      data: {
        isVoucher: true,
        voucherAmount: 5,
        voucherDescription: 'hi this is a voucher',
        voucherId: 'mock-voucher-id',
        voucherPercentage: 0,
        voucherType: 'Dollar',
      },
    };

    await addVoucherTransactionInFirestore(mockVoucherData);

    expect(firebase.firestore().collection).toHaveBeenCalledWith('transactions');
    expect(firebase.firestore().add).toHaveBeenCalledWith({
      amountPaid: mockVoucherData.finalAmount,
      customerId: mockVoucherData.customerId,
      customerName: mockVoucherData.customerName,
      pointsAwarded: 0,
      sellerId: mockVoucherData.sellerId,
      sellerName: mockVoucherData.sellerName,
      transactionType: 'Voucher Transaction',
      // timeStamp: expect.anything(),
      voucherAmount: mockVoucherData.data.voucherAmount,
      voucherDescription: mockVoucherData.data.voucherDescription,
      voucherId: mockVoucherData.data.voucherId,
      voucherPercentage: mockVoucherData.data.voucherPercentage,
      voucherType: mockVoucherData.data.voucherType,
      
    });
  });

  it('should add a points transaction to Firestore', async () => {
    const mockPointsData = {
      amountPaid: 50,
      customerId: 'mockCustomerId',
      customerName: 'Mock Customer',
      sellerId: 'mockSellerId',
      sellerName: 'Mock Seller',
      currentPoint: 100,
      newCurrentPoint: 150,
    };

    await addPointsTransactionInFirestore(mockPointsData);

    expect(firebase.firestore().collection).toHaveBeenCalledWith('transactions');
    expect(firebase.firestore().add).toHaveBeenCalledWith({
      amountPaid: mockPointsData.amountPaid,
      customerId: mockPointsData.customerId,
      customerName: mockPointsData.customerName,
      pointsAwarded: mockPointsData.newCurrentPoint - mockPointsData.currentPoint,
      sellerId: mockPointsData.sellerId,
      sellerName: mockPointsData.sellerName,
      // timeStamp: expect.anything(), 
      transactionType: 'Points Transaction',
      voucherAmount: 0,
    });
  });

  it('should update currentPoint for Points Transaction in Firestore', async () => {
    const mockCustomerId = 'mockCustomerId';
    const mockUpdatedCustomerCurrentPoint = 500;

    await updateCurrentPointInFirestore(mockCustomerId, mockUpdatedCustomerCurrentPoint);

    expect(firebase.firestore().collection).toHaveBeenCalledWith('users');
    expect(firebase.firestore().doc).toHaveBeenCalledWith(mockCustomerId);
    expect(firebase.firestore().update).toHaveBeenCalledWith({
      currentPoint: mockUpdatedCustomerCurrentPoint,
    });
  });


});


jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useContext: jest.fn(),
}));

const mockSetScanning = jest.fn();
const mockSetData = jest.fn();
const mockSetShowPromptModal = jest.fn();

// Mock the useState hooks
React.useState = jest.fn(() => [false, mockSetScanning]); // For "scanning" state
React.useContext = jest.fn(() => ({ user: { uid: 'sellerUserId' } })); // For "user" context

describe('ScannerScreen', () => {
  const createMockQRCodeData = (isVoucher, sellerId = null) => ({
    isVoucher,
    voucherId: 'mockVoucherId',
    voucherAmount: 100,
    pointsRequired: 50,
    voucherDescription: 'Mock Voucher',
    customerId: 'mockCustomerId',
    customerName: 'Mock Customer',
    sellerId,
  });

  it('should handle voucher QR code from the correct seller', async () => {
    // Arrange
    const mockQRCodeData = createMockQRCodeData(true, 'mockSellerId');
    const setScanning = jest.fn();
    const setData = jest.fn();
    const setShowPromptModal = jest.fn();
    const mockSeller = {
      uid: 'mockSellerId',
    }

    const alertSpy = jest.spyOn(Alert, 'alert');

    // Act
    await handleQRCodeScan({ data: JSON.stringify(mockQRCodeData) }, setScanning, setData, setShowPromptModal, mockSeller);

    // Assert
    expect(setScanning).toHaveBeenCalledWith(false);
    expect(setData).toHaveBeenCalledWith(mockQRCodeData);
    expect(setShowPromptModal).toHaveBeenCalledWith(true);
    expect(alertSpy).not.toHaveBeenCalled();
  });

  it('should handle personal ID QR code', async () => {
    // Arrange
    const mockQRCodeData = createMockQRCodeData(false);
    const setScanning = jest.fn();
    const setData = jest.fn();
    const setShowPromptModal = jest.fn();
    const mockSeller = {
      uid: 'mockSellerId',
    }

    const alertSpy = jest.spyOn(Alert, 'alert');

    // Act
    await handleQRCodeScan({ data: JSON.stringify(mockQRCodeData) }, setScanning, setData, setShowPromptModal, mockSeller);

    // Assert
    expect(setScanning).toHaveBeenCalledWith(false);
    expect(setData).toHaveBeenCalledWith(mockQRCodeData);
    expect(setShowPromptModal).toHaveBeenCalledWith(true);
    expect(alertSpy).not.toHaveBeenCalled();
  });

  // it('should handle invalid QR code', async () => {
  //   // Arrange
  //   const invalidQRCodeData = { invalidData: true };
  //   const setScanning = jest.fn();
  //   const setData = jest.fn();
  //   const setShowPromptModal = jest.fn();
  //   const mockSeller = {
  //     uid: 'mockSellerId',
  //   }

  //   const alertSpy = jest.spyOn(Alert, 'alert');

  //   // Act
  //   await handleQRCodeScan({ data: JSON.stringify(invalidQRCodeData) }, setScanning, setData, setShowPromptModal, mockSeller);

  //   // Assert
  //   expect(setScanning).toHaveBeenCalledWith(false);
  //   expect(setData).not.toHaveBeenCalled();
  //   expect(setShowPromptModal).not.toHaveBeenCalled();
  //   expect(alertSpy).toHaveBeenCalledWith('Error', 'Invalid QR code');
  // });

  it('should handle invalid voucher from other sellers', async () => {
    // Arrange
    const mockQRCodeData = createMockQRCodeData(true, 'otherSellerId');
    jest.spyOn(console, 'log').mockImplementation(() => {});
    const alertSpy = jest.spyOn(Alert, 'alert');
    const setScanning = jest.fn();
    const setData = jest.fn();
    const setShowPromptModal = jest.fn();
    const mockSeller = {
      uid: 'mockSellerId',
    }

    // Act
    await handleQRCodeScan({ data: JSON.stringify(mockQRCodeData) }, setScanning, setData, setShowPromptModal, mockSeller);

    // Assert
    expect(setScanning).toHaveBeenCalledWith(false);
    expect(setData).not.toHaveBeenCalled();
    expect(setShowPromptModal).not.toHaveBeenCalled();
    expect(alertSpy).toHaveBeenCalledWith('This voucher is from another seller! Otherwise, This voucher is Invalid!');
  });
  
});
