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
                    alert(e);
                }
            },
            register: async (email, password, firstName, lastName, userType) => {
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
                            //Check if user is Customer or Seller
                            if(userType == 'Customer') {
                                firebase.firestore().collection('customer')
                                .doc(firebase.auth().currentUser.uid)
                                .set({
                                    firstName,
                                    lastName,
                                    email,
                                    userType,
                                    currentPoint,
                                    totalPoint,
                                    amountPaid,
                                })
                            } else {
                                //UserType is Seller
                                firebase.firestore().collection('seller')
                                .doc(firebase.auth().currentUser.uid)
                                .set({
                                    firstName,
                                    lastName,
                                    email,
                                    userType,
                                    totalRevenue,
                                })
                            }
                            
                        })
                    })
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
