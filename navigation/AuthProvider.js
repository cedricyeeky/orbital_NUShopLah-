import React, {createContext, useState} from 'react';
import { firebase } from '../firebaseconfig';

export const AuthContext = createContext();

export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null)

    return (
        <AuthContext.Provider 
          value={{
            user,
            setUser,
            login: async (email, password) => {
                try {
                    console.log(email);
                    // console.log(firebase.auth().currentUser.emailVerified);
                    //console.log(user);
                    // if (firebase.auth().currentUser.emailVerified) {
                        // await firebase.auth().currentUser.reload();
                        await firebase.auth().signInWithEmailAndPassword(email, password);
                    // } else {
                    //     Alert.alert('Email unergoing verification', 'Please try again in a few minutes');
                    // }
                    
                } catch(e) {
                    console.log(e);
                    alert(e);
                }
            },
            register: async (email, password, firstName, {/** lastName */}, userType, currentPoint, totalPoint, amountPaid, totalRevenue) => {
                try {
                    // console.log('Registered User Type:', userType);
                    // await firebase.auth().createUserWithEmailAndPassword(email, password)
                    // .then(() => {
                    //     firebase.auth().currentUser.sendEmailVerification({
                    //         handleCodeInApp: true,
                    //         url: 'https://nushoplah.firebaseapp.com',
                    //     })
                    //     .then(() => {
                    //         alert('Verification email sent!')
                    //     })
                    //     .then(() => {
                    //         //Version 1: Store everything as "users"
                    //         firebase.firestore().collection('users')
                    //             .doc(firebase.auth().currentUser.uid)
                    //             .set({
                    //                 amountPaid,
                    //                 currentPoint,
                    //                 firstName,
                    //                 email,
                    //                 totalPoint,
                    //                 userType,
                    //                 // lastName,
                    //                 // totalRevenue,
                    //             }); 
                            
                    //     })
                    // })
                    
                    // await firebase.auth().createUserWithEmailAndPassword(email, password);
                    // await firebase.auth().currentUser.sendEmailVerification({
                    //             handleCodeInApp: true,
                    //             url: 'https://nushoplah.firebaseapp.com',
                    //         });
                    // await firebase.firestore().collection('users')
                    //                     .doc(firebase.auth().currentUser.uid)
                    //                     .set({
                    //                         amountPaid,
                    //                         currentPoint,
                    //                         firstName,
                    //                         email,
                    //                         totalPoint,
                    //                         userType,
                    //                         // lastName,
                    //                         // totalRevenue,
                    //                     }); 

                    await firebase.auth().createUserWithEmailAndPassword(email, password);

    // Send the verification email to the user
    await firebase.auth().currentUser.sendEmailVerification({
      handleCodeInApp: true,
      url: 'https://nushoplah.firebaseapp.com',
    });

    // Wait for the user to verify their email
    await firebase.auth().currentUser.reload();
    const user = firebase.auth().currentUser;

      await firebase.firestore().collection('users').doc(user.uid).set({
        amountPaid,
        currentPoint,
        firstName,
        email,
        totalPoint,
        userType,
        // lastName,
        // totalRevenue,
      });

      // Additional logic or actions after successful registration

        alert('Registration successful! Please check your email to verify your account.');

                } catch(e) {
                    console.log(e);
                    alert(e);
                }
            },
            logout: async () => {
                try {
                    await firebase.auth().signOut();
                } catch(e) {
                    console.log(e);
                    alert(e);
                }
            }
          }}
        >
            {children}
        </AuthContext.Provider>
    )
}
