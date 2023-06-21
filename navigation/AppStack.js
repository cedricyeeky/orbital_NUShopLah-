import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';

//Screens for Customers to see
import HomeScreen from '../screens/customerScreens/HomeScreen';
import ActivityScreen from '../screens/customerScreens/Activity';
import IdScreen from '../screens/customerScreens/IdScreen';
import SettingsScreen from '../screens/customerScreens/SettingsScreen';

//Screen Names
const homeName = "Home";
const activityName = "Activity";
const idName = "Personal ID";
const accountName = "Account";

const Tab = createBottomTabNavigator();

const AppStack = () => {
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
          name={idName} 
          component={IdScreen}
          options={{
            tabBarActiveTintColor: '#f07b10',
            tabBarInactiveTintColor: 'white',
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;
              iconName = focused ? 'qr-code' : 'qr-code-outline';
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

export default AppStack;
