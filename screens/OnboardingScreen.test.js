//VERSION 3?????????////////////
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import OnboardingScreen from './OnboardingScreen';

const navigationMock = {
  replace: jest.fn(),
  navigate: jest.fn(),
};

describe('OnboardingScreen', () => {
  it('Onboarding Screen renders without error', () => {
    render(<OnboardingScreen />);
  });

  it('should render the welcome text', () => {
    const { getByText } = render(<OnboardingScreen navigation={navigationMock} />);
    expect(getByText('Welcome to NUShopLah!')).toBeTruthy();
  });

  it('should render the Skip button', () => {
    const { getByTestId } = render(<OnboardingScreen navigation={navigationMock} />);
    expect(getByTestId('skip-button')).toBeTruthy();
  });

  it('should render the Next button', () => {
    const { getByTestId } = render(<OnboardingScreen navigation={navigationMock} />);
    expect(getByTestId('next-button')).toBeTruthy();
  });

  it('should render all dots that represent progress of Onboarding Screen', () => {
    const { getAllByTestId } = render(<OnboardingScreen navigation={navigationMock} />);
    const dots = getAllByTestId('dot-0');
    expect(dots.length).toBe(5);
  });

  // FUNCTIONAL TESTS

  it('should navigate to the Login screen when Skip button is pressed', () => {
    const { getByTestId } = render(
      <OnboardingScreen navigation={navigationMock} />
    );

    const skipButton = getByTestId('skip-button');
    fireEvent.press(skipButton);

    expect(navigationMock.replace).toHaveBeenCalledWith('Login');
  });

  // Next Button KIV: Mocking Next button is hard 
  // it('should swipe to the next onboarding screen when Next button is pressed', () => {
  //   const { getByTestId, getByText } = render(
  //     <OnboardingScreen navigation={navigationMock} />
  //   );
  
  //   const nextButton = getByTestId('next-button');
  //   fireEvent.press(nextButton); 
  
  //   const nextScreenTitle = getByText('Personal QR/Barcode'); // We are mocking from the first screen of OnboardingScreen
  //   expect(nextScreenTitle).toBeDefined();
  // });

  

  //Done button Test KIV: Current Test is at 
  // it('should navigate to the Login screen when Done button is pressed', () => {
  //   const { getByTestId } = render(
  //     <OnboardingScreen navigation={navigationMock} />
  //   );

  //   const doneButton = getByTestId('done-button');
  //   fireEvent.press(doneButton);

  //   expect(navigationMock.navigate).toHaveBeenCalledWith('Login');
  // });
});
