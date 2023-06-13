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
const settingsName = "Account";

//const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const AppStackSeller = () => {
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
            } else if (rn === scannerName) {
              iconName = focused ? 'scan' : 'scan-outline';
            } else if (rn === settingsName) {
              iconName = focused ? 'person-circle' : 'person-circle-outline';
            }

            //Return any components that we like here

            return <Ionicons name={iconName} size={size} color={color} />;
          },

        })}

        tabBarOptions={{
          activeTintColor: 'tomato',
          inactiveTintColor: 'grey',
          labelStyle: { fontSize: 12 },
          style: { padding: 10, height: 80}
        }}>

        <Tab.Screen name={homeName} component={HomeScreen} />
        <Tab.Screen name={activityName} component={ActivityScreen} />
        <Tab.Screen name={scannerName} component={Scanner} />
        <Tab.Screen name={settingsName} component={SettingsScreen} />

        </Tab.Navigator>
    
  )
}

export default AppStackSeller;