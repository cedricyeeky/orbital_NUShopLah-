import React from 'react';
import { render, waitFor, fireEvent, findByText } from '@testing-library/react-native';
import { AuthContext, AuthProvider } from '../../navigation/AuthProvider';
import { firebase } from '../../firebaseconfig';
import SettingsScreen from './SettingsScreen';



jest.mock('../../firebaseconfig', () => ({
    firebase: {
      firestore: jest.fn().mockReturnValue({
        collection: jest.fn().mockReturnThis(),
        doc: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue({ exists: true, data: () => ({ firstName: 'John' }) }),
        onSnapshot: jest.fn().mockReturnValue({ data: () => ({ currentPoint: 100, totalPoint: 200 }) }),
      }),
      auth: jest.fn().mockReturnValue({
        currentUser: { uid: 'user-uid', email: 'test@example.com', firstName: 'John', currentPoint: 100, totalPoint: 200, },
        sendPasswordResetEmail: jest.fn().mockResolvedValue(),
      }),
    },
  }));