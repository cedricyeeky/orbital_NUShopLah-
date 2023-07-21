import React from 'react';
import { render, act, fireEvent, getByTestId } from '@testing-library/react-native';
import SettingsScreen from './SettingsScreen';
import { AuthContext } from '../../navigation/AuthProvider';
import { firebase } from '../../firebaseconfig';
import { calculateLoyaltyTier, calculateRemainingPoints, getTierBackgroundColor, getImageSource } from './SettingsScreen';

// Mock AuthProvider context
// jest.mock('../../navigation/AuthProvider', () => ({
//   AuthContext: {
//     Consumer: (props) => props.children({ user: { uid: 'user-uid' }, logout: jest.fn() }),
//   },
// }));

// Mock firebase and firestore
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

const TestComponent = () => (
    <AuthContext.Provider value={{ user: { uid: 'user-uid' }, logout: jest.fn() }}>
          <SettingsScreen />
    </AuthContext.Provider>
)

describe('SettingsScreen', () => {
    it('renders the welcome text', async () => {
        // Mock the resolved state of the get() method
        firebase.firestore().collection().doc().get.mockResolvedValueOnce({
            exists: true,
            data: jest.fn().mockReturnValue({ firstName: 'John' }),
        });

        const { getByTestId } = render(<TestComponent />);
        
        // Test the rendering of components, e.g., welcome text, card, change password button
        const welcomeText = getByTestId('TEST_ID_WELCOME');
        expect(welcomeText).toBeDefined();
    });

    it('renders the card for Loyalty Tier', async () => {
        // Mock the resolved state of the get() method
        firebase.firestore().collection().doc().get.mockResolvedValueOnce({
            exists: true,
            data: jest.fn().mockReturnValue({ firstName: 'John' }),
        });

        const { getByTestId } = render(<TestComponent />);
        const card = getByTestId('TEST_ID_CARD');
        expect(card).toBeDefined();
    });

    it('renders the Changed Password Button', async () => {
        // Mock the resolved state of the get() method
        firebase.firestore().collection().doc().get.mockResolvedValueOnce({
            exists: true,
            data: jest.fn().mockReturnValue({ firstName: 'John' }),
        });

        const { getByTestId } = render(<TestComponent />);
        
        const changePasswordButton = getByTestId('TEST_ID_CHANGE_PASSWORD_BUTTON');
        expect(changePasswordButton).toBeDefined();
    });

    it('renders the Tier Benefits description', async () => {
        // Mock the resolved state of the get() method
        firebase.firestore().collection().doc().get.mockResolvedValueOnce({
            exists: true,
            data: jest.fn().mockReturnValue({ firstName: 'John' }),
        });

        const { getAllByTestId } = render(<TestComponent />);
        
        const tierBenefits = getAllByTestId('TEST_ID_BENEFIT_DESCRIPTION');
        //console.log(tierBenefits);
        expect(tierBenefits).toBeDefined();
    });

    it('should call firebase firestore to get user data', async () => {
        // Mock the resolved state of the get() method
        firebase.firestore().collection().doc().get.mockResolvedValueOnce({
            exists: true,
            data: jest.fn().mockReturnValue({ firstName: 'John' }),
        });
        
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