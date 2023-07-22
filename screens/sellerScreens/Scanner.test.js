import React from 'react';
import { render, waitFor, fireEvent, findByText } from '@testing-library/react-native';
import { AuthContext, AuthProvider } from '../../navigation/AuthProvider';
import { firebase } from '../../firebaseconfig';
import ScannerScreen from './Scanner';
import { calculateNewCurrentPoint, calculateNewTotalPoint, handleNavigationFocus} from './Scanner';
import { Camera } from 'expo-camera';
import { NavigationContainer } from '@react-navigation/native';



jest.mock('expo-camera', () => ({
  Camera: {
    requestCameraPermissionsAsync: jest.fn(),
  },
}));

// Mock firebase and firestore
jest.mock('../../firebaseconfig', () => ({
  firebase: {
    firestore: jest.fn().mockReturnValue({
      collection: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      onSnapshot: jest.fn().mockImplementation((callback) => {
        const mockSnapshot = {
          forEach: (cb) => {
            const mockDoc = {
              id: 'mockDocId',
              data: () => ({
                // Mock data properties for a transaction
                id: 'mockTransactionId',
                sellerId: 'mockSellerId',
                timeStamp: { toDate: () => new Date('2023-07-16T09:30:00') },
                amountPaid: 10.5,
                // Add more mock data properties as needed
              }),
            };
            cb(mockDoc);
          },
        };
        callback(mockSnapshot);
        return jest.fn(); // Mock unsubscribe function
      }),
    }),
  },
}));


describe('ScannerScreen', () => {
  beforeEach(() => {
    // Reset mocked functions before each test
    Camera.requestCameraPermissionsAsync.mockResolvedValueOnce({ status: 'granted' });
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('calculates new current point correctly', () => {
    const TIER_STATUS_LIMIT = [500, 1500, 5000]; //Number of points required to move up to next Tier. For example, "500" indicates you can level up from "Member" to "Silver" Tier
    const POINT_MULTIPLIER = [1, 1.25, 1.5, 2]; //Member, Silver, Gold, Platinum respectively

    const currentPoint = 600;
    const amountPaid = 50;
    const expected = 663;

    const result = calculateNewCurrentPoint(currentPoint, amountPaid);

    expect(result).toBe(expected);
  });

  it('calculates new total point correctly', () => {
    const TIER_STATUS_LIMIT = [500, 1500, 5000]; //Number of points required to move up to next Tier. For example, "500" indicates you can level up from "Member" to "Silver" Tier
    const POINT_MULTIPLIER = [1, 1.25, 1.5, 2]; //Member, Silver, Gold, Platinum respectively
    
    const totalPoint = 600;
    const amountPaid = 50;
    const expected = 663;

    const result = calculateNewTotalPoint(totalPoint, amountPaid);

    expect(result).toBe(expected);
  });

  



  
});
