
import React, { useContext, useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthContext } from './AuthProvider';
import { firebase } from '../firebaseconfig';
import AuthStack from './AuthStack';
import AppStack from './AppStack';
import AppStackSeller from './AppStackSeller';

/**
 * Component that handles routing and navigation based on user authentication and type.
 * @returns {JSX.Element} JSX element representing the navigation container and associated stacks.
 */
const Routes = () => {
  const { user, setUser } = useContext(AuthContext);
  const [initializing, setInitializing] = useState(true);
  const [userType, setUserType] = useState('');

  /**
   * Retrieves the user's type from Firestore based on their UID.
   * @param {string} uid - User's unique identifier.
   * @returns {Promise<void>} A Promise that resolves when user type is retrieved.
   */
  const getUserType = async (uid) => {
    try {
      const userDoc = await firebase.firestore().collection('users').doc(uid).get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        setUserType(userData.userType);
      } else {
        console.log('User document does not exist');
        setUserType('');
      }
    } catch (error) {
      console.log('Error getting user type:', error);
      setUserType('');
    }
  };

  /**
   * Handles the change in authentication state.
   * @param {object} user - User object representing the authenticated user.
   * @returns {Promise<void>} A Promise that resolves when authentication state is handled.
   */
  const onAuthStateChanged = async (user) => {
    setUser(user);
    if (user) {
      try {
        await getUserType(user.uid);
        console.log("(Route.js) User Type Set, User Type is:", userType);
        //console.log("User Set, User is:", user);
        console.log("(Route.js) User UID:", user.uid);
      } catch (error) {
        console.log('Error getting user type:', error);
      }
    } else {
      setUserType('');
      console.log("User Type Reset, User Type is:", userType);
    }
    if (initializing) setInitializing(false);
  };

  useEffect(() => {
    const subscriber = firebase.auth().onAuthStateChanged(onAuthStateChanged);
    console.log("Subscriber:", subscriber);
    return () => subscriber(); // unsubscribe on unmount
  }, []);

  useEffect(() => {
    console.log("User Type has changed:", userType);
  }, [userType]); 

  if (initializing) return null;

  return (
    <NavigationContainer>
      {userType === 'Customer' ? (
        <AppStack />
      ) : userType === 'Seller' ? (
        <AppStackSeller />
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
};

export default Routes;


