import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';

//Screens for Customers to see
import HomeScreen from '../screens/sellerScreens/HomeScreen';
import ActivityScreen from '../screens/sellerScreens/Activity';
import Scanner from '../screens/sellerScreens/Scanner';
import SettingsScreen from '../screens/sellerScreens/SettingsScreen';

//Screen Names
const homeName = "Home";
const activityName = "Activity";
const scannerName = "Scan QR";
const accountName = "Account";

//const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const AppStackSeller = () => {
    return (
    
      <Tab.Navigator 
        initialRouteName={homeName}
        screenOptions={{
          tabBarActiveTintColor: '#f07b10',
          tabBarInactiveTintColor: 'white',
          labelStyle: { fontSize: 14 },
          tabBarStyle: { 
            paddingTop: 23,
            position: 'absolute',
            bottom: 30,
            left: 20,
            right: 20,
            elevation: 0,
            backgroundColor: '#003d7c',
            borderRadius: 15,
            height: 90
          }

        }}
          
        >

        <Tab.Screen 
          name={homeName} 
          component={HomeScreen} 
          options={{
            tabBarActiveTintColor: '#f07b10',
            tabBarInactiveTintColor: 'white',
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;
              iconName = focused ? 'home' : 'home-outline';
              return <Ionicons name={iconName} size={size} color={color} />;
            }
            
          }}/>
        <Tab.Screen 
          name={activityName}
          component={ActivityScreen}
          options={{
            tabBarActiveTintColor: '#f07b10',
            tabBarInactiveTintColor: 'white',
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;
              iconName = focused ? 'receipt' : 'receipt-outline';
              return <Ionicons name={iconName} size={size} color={color} />;
            }
          }} />
        <Tab.Screen 
          name={scannerName} 
          component={Scanner}
          options={{
            tabBarActiveTintColor: '#f07b10',
            tabBarInactiveTintColor: 'white',
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;
              iconName = focused ? 'scan' : 'scan-outline';
              return <Ionicons name={iconName} size={size} color={color} />;
            }
          }} />
        <Tab.Screen 
          name={accountName} 
          component={SettingsScreen}
          options={{
            tabBarActiveTintColor: '#f07b10',
            tabBarInactiveTintColor: 'white',
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;
              iconName = focused ? 'person-circle' : 'person-circle-outline';
              return <Ionicons name={iconName} size={size} color={color} />;
            }
          }} />

        </Tab.Navigator>
    
  )
}

export default AppStackSeller;