// import React from 'react';
// import renderer from 'react-test-renderer';

// import LoginScreen from './LoginScreen';

// describe('<LoginScreen />', () => {
//   it('has 1 child', () => {
//     const tree = renderer.create(<LoginScreen />).toJSON();
//     expect(tree.children.length).toBe(1);
//   });
// });


// import React from 'react';
// import { render, fireEvent } from '@testing-library/react-native';
// import LoginScreen from './LoginScreen';

const React = require('react');
const { render, fireEvent } = require('@testing-library/react-native');
const LoginScreen = require('./LoginScreen');

describe('LoginScreen', () => {
  test('renders without error', () => {
    const { getByTestId } = render(<LoginScreen />);
    const loginScreen = getByTestId('login-screen');
    expect(loginScreen).toBeTruthy();
  });

  test('displays the logo', () => {
    const { getByTestId } = render(<LoginScreen />);
    const logo = getByTestId('logo');
    expect(logo).toBeTruthy();
  });

  test('can enter email and password', () => {
    const { getByTestId } = render(<LoginScreen />);
    const emailInput = getByTestId('email-input');
    const passwordInput = getByTestId('password-input');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');

    expect(emailInput.props.value).toBe('test@example.com');
    expect(passwordInput.props.value).toBe('password123');
  });

  test('can trigger login function', () => {
    const mockLogin = jest.fn();
    const { getByTestId } = render(<LoginScreen />, {
      authContext: { login: mockLogin },
    });
    const signInButton = getByTestId('sign-in-button');

    fireEvent.press(signInButton);

    expect(mockLogin).toHaveBeenCalled();
  });

  test('navigates to Signup screen', () => {
    const mockNavigate = jest.fn();
    const { getByTestId } = render(<LoginScreen navigation={{ navigate: mockNavigate }} />);
    const signupButton = getByTestId('signup-button');

    fireEvent.press(signupButton);

    expect(mockNavigate).toHaveBeenCalledWith('Signup');
  });
});
