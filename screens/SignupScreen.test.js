import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import SignupScreen from '../screens/SignupScreen';
import { AuthProvider } from '../navigation/AuthProvider';
import { firebase } from '../firebaseconfig';

// Mock the Firebase configuration
jest.mock('../firebaseconfig', () => {
  const createUserWithEmailAndPassword = jest.fn().mockResolvedValue();
  const sendEmailVerification = jest.fn().mockResolvedValue();
  const docSet = jest.fn().mockResolvedValue();

  return {
    firebase: {
      auth: jest.fn(() => ({
        createUserWithEmailAndPassword,
        currentUser: {
          sendEmailVerification,
        },
      })),
      firestore: jest.fn(() => ({
        collection: jest.fn().mockReturnThis(),
        doc: jest.fn().mockReturnThis(),
        set: docSet,
      })),
    },
  };
});

// Mock the alert function
global.alert = jest.fn();

describe('SignupScreen', () => {
  it('renders the signup screen correctly', () => {
    const { getByPlaceholderText, getByText } = render(
      <AuthProvider>
        <SignupScreen />
      </AuthProvider>
    );

    // Verify the presence of input fields and buttons
    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Enter your Full Name')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
    expect(getByPlaceholderText('Confirm Password')).toBeTruthy();
    expect(getByText('Sign Up')).toBeTruthy();
    expect(getByText('Have an account? Sign In')).toBeTruthy();
  });
  it('renders the email input field correctly', () => {
    const { getByPlaceholderText } = render(
      <AuthProvider>
        <SignupScreen />
      </AuthProvider>
    );

    // Verify the presence of the email input field
    expect(getByPlaceholderText('Email')).toBeTruthy();
  });

  it('renders the full name input field correctly', () => {
    const { getByPlaceholderText } = render(
      <AuthProvider>
        <SignupScreen />
      </AuthProvider>
    );

    // Verify the presence of the full name input field
    expect(getByPlaceholderText('Enter your Full Name')).toBeTruthy();
  });

  it('renders the password input field correctly', () => {
    const { getByPlaceholderText } = render(
      <AuthProvider>
        <SignupScreen />
      </AuthProvider>
    );

    // Verify the presence of the password input field
    expect(getByPlaceholderText('Password')).toBeTruthy();
  });

  it('renders the confirm password input field correctly', () => {
    const { getByPlaceholderText } = render(
      <AuthProvider>
        <SignupScreen />
      </AuthProvider>
    );

    // Verify the presence of the confirm password input field
    expect(getByPlaceholderText('Confirm Password')).toBeTruthy();
  });

  it('renders the sign up button correctly', () => {
    const { getByText } = render(
      <AuthProvider>
        <SignupScreen />
      </AuthProvider>
    );

    // Verify the presence of the sign up button
    expect(getByText('Sign Up')).toBeTruthy();
  });

  it('renders the sign in link correctly', () => {
    const { getByText } = render(
      <AuthProvider>
        <SignupScreen />
      </AuthProvider>
    );

    // Verify the presence of the sign in link
    expect(getByText('Have an account? Sign In')).toBeTruthy();
  });

  it('registers a user when signup button is pressed', async () => {
    const { getByPlaceholderText, getByText } = render(
      <AuthProvider>
        <SignupScreen />
      </AuthProvider>
    );

    // Mock user input
    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Enter your Full Name'), 'John Doe');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password');
    fireEvent.changeText(getByPlaceholderText('Confirm Password'), 'password');

    // Simulate signup button press
    fireEvent.press(getByText('Sign Up'));

    // Wait for the promises to resolve
    await Promise.resolve();

    // Verify that the necessary Firebase functions are called
    expect(firebase.auth().createUserWithEmailAndPassword).toHaveBeenCalledWith(
      'test@example.com',
      'password'
    );
    // expect(firebase.firestore().collection).toHaveBeenCalledWith('users');
    // expect(firebase.firestore().doc).toHaveBeenCalled();
    // expect(firebase.firestore().set).toHaveBeenCalledWith({
    //   firstName: 'John Doe',
    //   email: 'test@example.com',
    //   userType: 'Customer',
    //   currentPoint: 0,
    //   totalPoint: 0,
    //   amountPaid: 0,
    //   totalRevenue: 0,
    // });

    // Check console logs for success message
    // expect(console.log).toHaveBeenCalledWith('Verification email sent!');
  });

  it('sends email verification when signup is successful', async () => {
    const { getByPlaceholderText, getByText } = render(
      <AuthProvider>
        <SignupScreen />
      </AuthProvider>
    );

    // Mock user input
    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Enter your Full Name'), 'John Doe');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password');
    fireEvent.changeText(getByPlaceholderText('Confirm Password'), 'password');

    // Simulate signup button press
    fireEvent.press(getByText('Sign Up'));

    // Wait for the promises to resolve
    await Promise.resolve();

    // Verify that the email verification function is called
    expect(firebase.auth().currentUser.sendEmailVerification).toHaveBeenCalled();
  });
});
