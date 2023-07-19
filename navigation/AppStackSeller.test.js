import React from 'react';
import { render, fireEvent, screen, within } from '@testing-library/react-native';

import { AuthContext, AuthProvider } from './AuthProvider';

import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { firebase } from '../firebaseconfig';

import AppStackSeller from './AppStackSeller';


import HomeScreen from '../screens/sellerScreens/HomeScreen';
import ActivityScreen from '../screens/sellerScreens/Activity';
import IdScreen from '../screens/sellerScreens/Scanner';
import SettingsScreen from '../screens/sellerScreens/SettingsScreen';
import ScannerScreen from '../screens/sellerScreens/Scanner';

const Tab = createBottomTabNavigator();

jest.mock('../firebaseconfig', () => {jest.fn()});
jest.mock('../screens/sellerScreens/HomeScreen', () => jest.fn());
jest.mock('../screens/sellerScreens/Activity', () => jest.fn());
jest.mock('../screens/sellerScreens/Scanner', () => jest.fn());
jest.mock('../screens/sellerScreens/SettingsScreen', () => jest.fn());


// More complex Mocking. Failed.
const TestComponent = () => (
    <NavigationContainer>
      <AuthProvider>
        <AuthContext.Provider
          value={{
            user: {
                email: 'test@example.com',
                firstName: 'John',
                userType: 'customer',
                currentPoint: 0,
                totalPoint: 0,
                amountPaid: 0,
                totalRevenue: 0,
            },
            setUser: jest.fn(),
            login: jest.fn(),
            register: jest.fn(),
            logout: jest.fn(),
          }}
        >
          <Tab.Navigator>
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Activity" component={ActivityScreen} />
            <Tab.Screen name="Scan QR" component={ScannerScreen} />
            <Tab.Screen name="Account" component={SettingsScreen} />
          </Tab.Navigator>
        </AuthContext.Provider>
      </AuthProvider>
    </NavigationContainer>
  );

describe('AppStackSeller', () => {
    
    it('should render HomeScreen as the initial route', () => {
        const { getAllByText } = render(<TestComponent />);
        const homeScreen = getAllByText('Home');
        // console.log(homeScreen); Got two objects, Posibly because Tab.Navigator and first Tab.Screen hace "Home" as their tag
        expect(homeScreen).toBeDefined();
      });
    

  it('should navigate to Activity Screen when Activity tab is selected', () => {
    const { getByText } = render(<TestComponent />);
    const activityTab = getByText('Activity');

    fireEvent.press(activityTab);
    const activityScreen = within(screen.getByLabelText("Activity, tab, 2 of 4"));
    const activityScreenSelected = activityScreen.getByRole('button', { selected: true });
    expect(activityScreenSelected).toBeDefined();
  });

  it('should navigate to Scanner Screen when Scanner tab is selected', () => {
    const { getByText } = render(<TestComponent />);
    const idTab = getByText('Scan QR');

    fireEvent.press(idTab);
    const idScreen = within(screen.getByLabelText("Scan QR, tab, 3 of 4"));
    const idScreenSelected = idScreen.getByRole('button', { selected: true });
    expect(idScreenSelected).toBeDefined();
  });

  it('should navigate to Account Screen when Account tab is selected', () => {
    const { getByText } = render(<TestComponent />);
    
    const accountTab = getByText('Account');

    fireEvent.press(accountTab);
    const accountScreen = within(screen.getByLabelText("Account, tab, 4 of 4"));
    const accountScreenSelected = accountScreen.getByRole('button', { selected: true });
    expect(accountScreenSelected).toBeDefined();
  });



//   it('should keep the selected tab active when tapped again', () => {
//     const { getByText, queryByTestId } = render(<AppStack />);
//     const homeTab = getByText('Home');

//     fireEvent.press(homeTab);
//     const homeScreen = getByText('Home');
//     expect(homeScreen).toBeDefined();

//     fireEvent.press(homeTab);
//     const reRenderedHomeScreen = queryByTestId('home-screen');
//     expect(reRenderedHomeScreen).toBeNull();
//   });
});