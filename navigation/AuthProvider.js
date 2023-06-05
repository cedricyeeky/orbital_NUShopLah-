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
                    await firebase.auth().signInWithEmailAndPassword(email, password);
                } catch(e) {
                    console.log(e);
                }
            },
            register: async (email, password, firstName, lastName) => {
                try {
                    await firebase.auth().createUserWithEmailAndPassword(email, password)
                    .then(() => {
                        firebase.auth().currentUser.sendEmailVerification({
                            handleCodeInApp: true,
                            url: 'https://nushoplah.firebaseapp.com',
                        })
                        .then(() => {
                            alert('Verification email sent!')
                        })
                        .then(() => {
                            firebase.firestore().collection('users')
                            .doc(firebase.auth().currentUser.uid)
                            .set({
                                firstName,
                                lastName,
                                email,
                            })
                        })
                    })
                } catch(e) {
                    console.log(e);
                }
            },
            logout: async () => {
                try {
                    await firebase.auth().signOut();
                } catch(e) {
                    console.log(e);
                }
            }
          }}
        >
            {children}
        </AuthContext.Provider>
    )
}
