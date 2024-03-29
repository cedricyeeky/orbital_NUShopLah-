/**
 * @file This file contains the IdScreen component, which displays the user's ID information and QR code.
 * @module IdScreen
 */

import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { AuthContext } from '../../navigation/AuthProvider';
import { firebase } from '../../firebaseconfig';
import QRCodeWithLogo from '../../components/QRCodeWithLogo';
import { Card } from 'react-native-paper';

/**
 * Generates QR code data for the user's ID.
 * @function
 * @param {string} uid - The user's unique identifier.
 * @param {string} firstName - The user's first name.
 * @param {number} currentPoint - The user's current point balance.
 * @param {number} totalPoint - The user's total point balance.
 * @returns {string|null} - The JSON stringified QR code data or null if user is logged out.
 */
export const generateQRCodeData = (uid, firstName, currentPoint, totalPoint) => {
  if (uid) {
    const qrCodeData = {
      uid: uid,
      firstName,
      currentPoint,
      totalPoint,
      amountPaid: 0,
      isVoucher: false,
    };
    return JSON.stringify(qrCodeData);
  } else {
    console.log("(GenerateQRCodeData) User has logged out! No uid anymore");
    return null; // Return null or an appropriate value when the user is logged out
  }
};

/**
 * Sets up a Firestore listener for user data updates. 
 * Updates user current point and total point balances after any chanages occur.
 * @function
 * @param {Object} user - The user object.
 * @param {Function} setCurrentPoint - A state setter to update the current point balance.
 * @param {Function} setTotalPoint - A state setter to update the total point balance.
 * @returns {Function} - An unsubscribe function to stop the Firestore listener.
 */
export const startFirestoreListener = (user, setCurrentPoint, setTotalPoint) => {
  const userCollectionRef = firebase.firestore().collection('users');
  const userDocRef = userCollectionRef.doc(user.uid);
  const unsubscribe = userDocRef.onSnapshot((snapshot) => {
    const userData = snapshot.data();
    if (userData) {
      const { currentPoint: updatedCurrentPoint, totalPoint: updatedTotalPoint } = userData;
      setCurrentPoint(updatedCurrentPoint);
      setTotalPoint(updatedTotalPoint);
    }
  });
  return unsubscribe;
};

/**
 * The main IdScreen component.
 * @component
 * @returns {JSX.Element} - The rendered IdScreen component.
 */
const IdScreen = () => {
    const { user } = useContext(AuthContext);
    const [currentPoint, setCurrentPoint] = useState(0);
    const [totalPoint, setTotalPoint] = useState(0);
    const [firstName, setFirstName] = useState('');
    const logoImage = require('../../assets/NUShopLah!.png');

    useEffect(() => {
      //console.log("IdScreen useEffect fetchUserData running...")
      if (user && user.uid) {
        const fetchUserData = async () => {
          try {
            const userCollectionRef = firebase.firestore().collection('users');
            const userData = await userCollectionRef.doc(user.uid).get();
            if (userData.exists) {
              const { currentPoint, totalPoint } = userData.data();
              setCurrentPoint(currentPoint);
              setTotalPoint(totalPoint);
            }
          } catch (error) {
            console.log('Error fetching user data:', error);
          }
        };
  
        // Create a Firestore listener for the user's document
        // Exported
        const userCollectionRef = firebase.firestore().collection('users');
        const userDocRef = userCollectionRef.doc(user.uid);
        const unsubscribe = userDocRef.onSnapshot((snapshot) => {
        const userData = snapshot.data();
        if (userData) {
          const { currentPoint: updatedCurrentPoint, totalPoint: updatedTotalPoint } = userData;
          setCurrentPoint(updatedCurrentPoint);
          setTotalPoint(updatedTotalPoint);
          }
        });
    
        fetchUserData();
        //startFirestoreListener(user, setCurrentPoint, setTotalPoint);
      } else {
        console.log("User has logged out already! Stop fetching user data (Id Screen 2)");
      }
    }, [user]);
  
    useEffect(() => {
      if (user && user.uid) {
        firebase.firestore().collection('users')
        .doc(firebase.auth().currentUser.uid).get()
        .then((snapshot) => {
            if (snapshot.exists) {
                setFirstName(snapshot.data().firstName)
            } else {
                console.log('User does not exist')
            }
        })
        .catch((error) => {
            console.log("Error getting user: ", error)
        })
      } else {
        console.log("User has logged out! Stop fetching UID (IdScreen)")
      }
    }, [user])

    //generateQRCodeData = (user.uid, firstName, currentPoint, totalPoint);
    const generateQRCodeData = () => {
      if (user && user.uid) {
        const qrCodeData = {
          uid: user.uid,
          firstName,
          currentPoint,
          totalPoint,
          amountPaid: 0,
          isVoucher: false,
        };
      return JSON.stringify(qrCodeData);
      } else {
        console.log("(GenerateQRCodeData) User has logged out! No uid anymore");
      }
    };
  
    return (
      <View 
        style={styles.container}
        testID='TEST_ID_CONTAINER'
      >
        <Card 
          style={styles.card}
          testID='TEST_ID_CARD'
        >
          <Card.Content>
            <Text style={styles.title}>{firstName}'s ID</Text>
            <Text style={styles.label}>Current Point Balance:</Text>
            <Text style={styles.text}>{currentPoint}</Text>
            <QRCodeWithLogo 
              value={generateQRCodeData()} 
              logo={logoImage}
              testID='qrcode-component' />
          </Card.Content>
        </Card>
      </View>
    );
  };
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#003d7c',
    },
    card: {
      backgroundColor: '#f07b10',
      padding: 16,
      borderRadius: 20,
    },
    label: {
      fontSize: 18,
      fontWeight: 'bold',
      marginTop: 10,
      color: 'white',
    },
    title: {
      fontSize: 40,
      fontWeight: 'bold',
      marginBottom: 20,
      color: 'white',
      textAlign: 'center',
    },
    text: {
      fontSize: 16,
      marginBottom: 10,
      color: 'white',
    },
  });
  
  export default IdScreen;



