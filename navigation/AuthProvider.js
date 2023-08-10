import React, {createContext, useState} from 'react';
import { firebase } from '../firebaseconfig';
import { Alert } from 'react-native';

export const AuthContext = createContext();

/**
 * Component responsible for managing authentication-related state and actions.
 * @param {object} props - React component props.
 * @param {React.ReactNode} props.children - Child components to be wrapped by the AuthProvider.
 * @returns {JSX.Element} JSX element wrapping the child components with authentication context.
 */
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
                    await firebase.auth().signInWithEmailAndPassword(email, password);
                } catch(e) {
                    console.log(e);
                    alert(e);
                }
            },
            register: async (email, password, firstName, userType, currentPoint, totalPoint, amountPaid, totalRevenue) => {
                try {
                    await firebase.auth().createUserWithEmailAndPassword(email, password)
                    .then(() => {
                        firebase.auth().currentUser.sendEmailVerification({
                            handleCodeInApp: true,
                            url: 'https://nushoplah.firebaseapp.com',
                        })
                        .then(() => {
                            Alert.alert('Verification email sent!', 'Please reload the app after verifying your email.')
                        })
                        .then(() => {
                            firebase.firestore().collection('users')
                                .doc(firebase.auth().currentUser.uid)
                                .set({
                                    amountPaid,
                                    currentPoint,
                                    firstName,
                                    email,
                                    totalPoint,
                                    userType,
                                }); 
                            
                        })
                    })
                    await firebase.auth().currentUser.reload();

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
