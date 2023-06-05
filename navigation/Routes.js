import 'react-native-gesture-handler';
import React, {useContext, useState, useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import { AuthContext } from './AuthProvider';
import { firebase } from '../firebaseconfig';
import AuthStack from './AuthStack';
import AppStack from './AppStack';


const Routes = () => {

    const {user, setUser} = useContext(AuthContext);
    const [initializing, setInitializing] = useState(true);

    const onAuthStateChanged = (user) => {
      setUser(user);
      if (initializing) setInitializing(false);
    }

    useEffect(() => {
    const subscriber = firebase.auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
    }, []);

    if (initializing) return null;

    return (<NavigationContainer>
        {user 
        ? <AppStack/>
        : <AuthStack/>}
    </NavigationContainer>
    );
};

export default Routes;