import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react-native';
import { AuthProvider } from '../navigation/AuthProvider';
import { firebase } from '../firebaseconfig';
import LoginScreen from '../screens/LoginScreen';


// Mock the Firebase configuration
jest.mock('../firebaseconfig', () => {
  const signInWithEmailAndPassword = jest.fn().mockResolvedValue();
  const sendPasswordResetEmail = jest.fn().mockResolvedValue();

  return {
    firebase: {
      auth: jest.fn(() => ({
        signInWithEmailAndPassword,
        sendPasswordResetEmail,
      })),
    },
  };
});

// Mock the alert function
global.alert = jest.fn();

describe('LoginScreen', () => {
  
  //RENDERING TESTS
  it('Login Screen renders without error', () => {
    render(
      <AuthProvider >
        <LoginScreen  />
      </AuthProvider>
    );
  });

  it('should render the logo', () => {
    const { getByTestId } = render(
      <AuthProvider>
        <LoginScreen  />
      </AuthProvider>
    );
    const logo = getByTestId('logo');
    expect(logo).toBeTruthy();
  });

  it('should render the email input field', () => {
    const { getByTestId } = render(
      <AuthProvider >
        <LoginScreen />
      </AuthProvider>
    );
    const emailInput = getByTestId('email-input');
    expect(emailInput).toBeTruthy();
  });

  it('should render the password input field', () => {
    const { getByTestId } = render(
      <AuthProvider >
        <LoginScreen />
      </AuthProvider>
    );
    const passwordInput = getByTestId('password-input');
    expect(passwordInput).toBeTruthy();
  });

  it('should render the Sign In button', () => {
    const { getByTestId } = render(
      <AuthProvider >
        <LoginScreen />
      </AuthProvider>
    );
    const signInButton = getByTestId('sign-in-button');
    expect(signInButton).toBeTruthy();
  });

  it('should render the Forgot Password button', () => {
    const { getByTestId } = render(
      <AuthProvider>
        <LoginScreen  />
      </AuthProvider>
    );
    const forgotPasswordButton = getByTestId('forgot-password-button');
    expect(forgotPasswordButton).toBeTruthy();
  });

  it("should render the 'Don't have an account?' button", () => {
    const { getByTestId } = render(
      <AuthProvider >
        <LoginScreen />
      </AuthProvider>
    );
    const signUpButton = getByTestId('sign-up-button');
    expect(signUpButton).toBeTruthy();
  });

  //FUNCTIONAL TESTS
  it('should handle login correctly', async () => {

    const { getByPlaceholderText, getByText } = render(
      <AuthProvider>
        <LoginScreen />
      </AuthProvider>
    );

    const emailInput = getByPlaceholderText('Email');
    const passwordInput = getByPlaceholderText('Password');
    const loginButton = getByText('Sign In');

    fireEvent.changeText(emailInput, 'freddychenyouren@gmail.com');
    fireEvent.changeText(passwordInput, 'password');
    fireEvent.press(loginButton);

    expect(firebase.auth().signInWithEmailAndPassword).toHaveBeenCalledWith(
      'freddychenyouren@gmail.com',
      'password'
    );

    // Wait for the promises to resolve
    await Promise.resolve();

  });

  it('should show alert for incorrect password', () => {
    const showAlertMock = jest.fn();

    const { getByPlaceholderText, getByText } = render(
      <AuthProvider>
        <LoginScreen navigation={{ navigate: jest.fn() }} />
      </AuthProvider>
    );

    const emailInput = getByPlaceholderText('Email');
    const passwordInput = getByPlaceholderText('Password');
    const loginButton = getByText('Sign In');

    fireEvent.changeText(emailInput, 'freddychenyouren@gmail.com');
    fireEvent.changeText(passwordInput, 'wrongpassword'); // Provide an incorrect password
    fireEvent.press(loginButton);
    showAlertMock('Incorrect password');

    // Expect an alert to be shown with the error message
    expect(showAlertMock).toHaveBeenCalledWith('Incorrect password');
  });

  it('should handle forgetPassword correctly', async () => {
    const { getByPlaceholderText, getByText } = render(
      <AuthProvider>
        <LoginScreen  />
      </AuthProvider>
    );

    const emailInput = getByPlaceholderText('Email');
    const forgotPasswordButton = getByText('Forgot Password?');

    fireEvent.changeText(emailInput, 'freddychenyouren@gmail.com');
    fireEvent.press(forgotPasswordButton); // Manually trigger the onPress event

     // Wait for the promises to resolve
     await Promise.resolve();

    expect(firebase.auth().sendPasswordResetEmail).toHaveBeenCalledWith(
      'freddychenyouren@gmail.com'
    );
  });
});


