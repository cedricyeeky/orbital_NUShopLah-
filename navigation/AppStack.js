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
    // return (
    //     <Stack.Navigator>
    //         <Stack.Screen name='Home' component={HomeScreen} />
    //     </Stack.Navigator>
    // );
    return (
    
        <Tab.Navigator 
          initialRouteName={homeName}
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;
              let rn = route.name;
  
              if (rn == homeName) {
                iconName = focused ? 'home' : 'home-outline';
              } else if (rn === activityName) {
                  iconName = focused ? 'receipt' : 'receipt-outline';
              } else if (rn === idName) {
                iconName = focused ? 'qr-code' : 'qr-code-outline';
              } else if (rn === accountName) {
                iconName = focused ? 'person-circle' : 'person-circle-outline';
              }
  
              //Return any components that we like here
  
              return <Ionicons name={iconName} size={size} color={color} />;
            },
  
          })}
          
          tabBarOptions={{
            activeTintColor: '#f07b10',
            inactiveTintColor: '#003d7c',
            labelStyle: { fontSize: 12 },
            style: { padding: 10, height: 80}
          }}>
  
          <Tab.Screen name={homeName} component={HomeScreen} />
          <Tab.Screen name={activityName} component={ActivityScreen} />
          <Tab.Screen name={idName} component={IdScreen} />
          <Tab.Screen name={accountName} component={SettingsScreen} />
  
        </Tab.Navigator>
    );
}

export default AppStack;
