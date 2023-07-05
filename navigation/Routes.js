// correct version
import React, { useContext, useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthContext } from './AuthProvider';
import { firebase } from '../firebaseconfig';
import AuthStack from './AuthStack';
import AppStack from './AppStack';
import AppStackSeller from './AppStackSeller';

const Routes = () => {
  const { user, setUser } = useContext(AuthContext);
  const [initializing, setInitializing] = useState(true);
  const [userType, setUserType] = useState('');

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
  }, [userType]); // Add userType as a dependency

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


// //Version 1 
// import 'react-native-gesture-handler';
// import React, { useContext, useState, useEffect } from 'react';
// import { NavigationContainer } from '@react-navigation/native';
// import { AuthContext } from './AuthProvider';
// import { firebase } from '../firebaseconfig';
// import AuthStack from './AuthStack';
// import AppStack from './AppStack';
// import AppStackSeller from './AppStackSeller';

// const Routes = () => {
//   const {user, setUser} = useContext(AuthContext);
//   const [initializing, setInitializing] = useState(true);
//   const [userType, setUserType] = useState('');

//   const getUserData = async (uid, userType) => {
//     try {
//       const userCollectionRef = firebase.firestore().collection(userType);
//       const userData = await userCollectionRef.doc(uid).get();
//       if (userData.exists) {
//         return userData.data();
//       }
//       return null;
//     } catch (error) {
//       console.log('Error1 getting user data:', error);
//       return null;
//     }
//   };

//   const onAuthStateChanged = async (user) => {
//     setUser(user);
//     // setUserType(user.userType);
//     // console.log(user.uid.get().firstName);
//     if (user) {
//       try {
//         const userData = await getUserData(user.uid, user.userType);
//         if (userData != null) {
//           setUserType(user.userType);
//         } else {
//           console.log('User data does not exist 2');
//         }
//       } catch (error) {
//         console.log('Error2 getting user data:', error);
//       }
//     } else {
//       setUserType('');
//     }
//     if (initializing) setInitializing(false);
//   };

//   useEffect(() => {
//     const subscriber = firebase.auth().onAuthStateChanged(onAuthStateChanged);
//     return subscriber; // unsubscribe on unmount
//   }, []);

//   if (initializing) return null;

//   return (
//     <NavigationContainer>
//       {userType === 'Customer' ? (
//         <AppStack />
//       ) : userType === 'Seller' ? (
//         <AppStackSeller />
//       ) : (
//         <AuthStack />
//       )}
//     </NavigationContainer>
//   );
// };

// export default Routes;



//Version 2
// import 'react-native-gesture-handler';
// import React, { useContext, useState, useEffect } from 'react';
// import { NavigationContainer } from '@react-navigation/native';
// import { AuthContext } from './AuthProvider';
// import { firebase } from '../firebaseconfig';
// import AuthStack from './AuthStack';
// import AppStack from './AppStack';
// import AppStackSeller from './AppStackSeller';

// const Routes = () => {
//   const { user, setUser } = useContext(AuthContext);
//   const [initializing, setInitializing] = useState(true);
//   const [userType, setUserType] = useState('');

//   const getUserData = async (uid, userType) => {
//     try {
//       console.log(userType);
//       const userCollectionRef = firebase.firestore().collection(userType);
//       const userData = await userCollectionRef.doc(uid).get();
//       if (userData.exists) {
//         console.log('user data exists')
//         return userData.data();
//       }
//       return null;
//     } catch (error) {
//       console.log('Error2 getting user data:', error);
//       return null;
//     }
//   };

//   const onAuthStateChanged = async (user) => {
//     setUser(user);
//     console.log(user);
//     if (user) {
//       try {
//         console.log('user = ', user.userType);
//         const uT = user.userType;
//         const userData = await getUserData(user.uid, user.userType);
//         //if (userData) {
//         setUserType(user.userType);
//         //} else {
//           //console.log('User data does not exist');
//         //}
//       } catch (error) {
//         console.log('Error1 getting user data:', error);
//       }
//     } else {
//       setUserType('');
//     }
//     if (initializing) setInitializing(false);
//   };

//   useEffect(() => {
//     const subscriber = firebase.auth().onAuthStateChanged(onAuthStateChanged);
//     return subscriber; // unsubscribe on unmount
//   }, []);

//   if (initializing) return null;

//   console.log(userType);

//   return (
    
//     <NavigationContainer>
//       {user.userType == 'Customer' 
//       ? 
//       <AppStack />
//       : user.userType == 'Seller' 
//       ? <AppStackSeller />
//       : <AuthStack /> }
//     </NavigationContainer>
//   );
// };

// export default Routes;








// import 'react-native-gesture-handler';
// import React, {useContext, useState, useEffect} from 'react';
// import {NavigationContainer} from '@react-navigation/native';
// import { AuthContext } from './AuthProvider';
// import { firebase } from '../firebaseconfig';
// import AuthStack from './AuthStack';
// import AppStack from './AppStack';


// const Routes = () => {

//     const {user, setUser} = useContext(AuthContext);
//     const [initializing, setInitializing] = useState(true);

//     const onAuthStateChanged = (user) => {
//       setUser(user);
//       if (initializing) setInitializing(false);
//     }

//     useEffect(() => { 
//     const subscriber = firebase.auth().onAuthStateChanged(onAuthStateChanged);
//     return subscriber; // unsubscribe on unmount
//     }, []);

//     if (initializing) return null;

//     console.log(user);

//     return (<NavigationContainer>
        
//         {user 
//         ? <AppStack/>
//         : <AuthStack/>}
//     </NavigationContainer>
//     );
// };

// export default Routes;