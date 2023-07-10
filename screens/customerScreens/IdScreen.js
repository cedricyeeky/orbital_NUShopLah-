import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { AuthContext } from '../../navigation/AuthProvider';
import { firebase } from '../../firebaseconfig';
import * as Brightness from 'expo-brightness';
import QRCodeWithLogo from '../../components/QRCodeWithLogo';
import { Card } from 'react-native-paper';
import { useNavigation, useIsFocused } from '@react-navigation/native';

const IdScreen = () => {
    const { user } = useContext(AuthContext);
    const [currentPoint, setCurrentPoint] = useState(0);
    const [totalPoint, setTotalPoint] = useState(0);
    const [firstName, setFirstName] = useState('');
    const [previousBrightness, setPreviousBrightness] = useState(0);
    const logoImage = require('../../assets/NUShopLah!.png');
    const navigation = useNavigation();
    const isFocused = useIsFocused();

    // useEffect(() => {
    //   if (isFocused && Platform.OS === 'ios') {
    //     Brightness.getBrightnessAsync().then((brightness) => {
    //       setPreviousBrightness(brightness);
    //       Brightness.setBrightnessAsync(1);
    //     });
    //   } else {
    //     Brightness.setBrightnessAsync(previousBrightness);
    //   }
    // }, [isFocused, previousBrightness]);

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
      } else {
        console.log("User has logged out already! Stop fetching user data (Id Screen 2)");
      }
    }, [user]);
  
  

    useEffect(() => {
      //Android devices face infinite repetition of this function because brightness level kept changing and functions kept being called.
      //console.log("IdScreen useEffect running...")

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

    // useEffect(() => {
    //   Brightness.setBrightnessAsync(1); // Set brightness to maximum when component mounts
    // }, []);
  
    const generateQRCodeData = () => {
      if (user && user.uid) {
        //Android devices face infinite repetition of this function because brightness level kept changing and functions kept being called.
        //console.log("Generate QR Code, User UID:", user.uid);
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
        console.log("(GenerateQRCodeData) User has logged out! No uid anymore")
      }
    };
  
    return (
      <View style={styles.container}>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.title}>{firstName}'s ID</Text>
            {/* <Text style={styles.label}>UID:</Text> */}
            {/* <Text style={styles.text}>{user.uid}</Text> */}
            <Text style={styles.label}>Current Point Balance:</Text>
            <Text style={styles.text}>{currentPoint}</Text>
            <QRCodeWithLogo value={generateQRCodeData()} logo={logoImage} />
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



