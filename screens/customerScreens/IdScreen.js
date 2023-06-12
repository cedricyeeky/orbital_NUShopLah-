import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AuthContext } from '../../navigation/AuthProvider';
import { firebase } from '../../firebaseconfig';
import * as Brightness from 'expo-brightness';
import QRCodeWithLogo from '../../components/QRCodeWithLogo';
import { Card } from 'react-native-paper';

const IdScreen = () => {
    const { user } = useContext(AuthContext);
    const [currentPoint, setCurrentPoint] = useState(0);
    const [totalPoint, setTotalPoint] = useState(0);
    const [firstName, setFirstName] = useState('');
    const [previousBrightness, setPreviousBrightness] = useState();
    const logoImage = require('../../assets/NUShopLah!.png');
  
    useEffect(() => {
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

      //Increase screen brightness
        Brightness.getBrightnessAsync().then((brightness) => {
            setPreviousBrightness(brightness);
            Brightness.setBrightnessAsync(1);
        });
    
        // Restore screen brightness when unmounting the component
        return () => {
            Brightness.setBrightnessAsync(previousBrightness);
        };
    }, [user, previousBrightness]);
  

    useEffect(() => {
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
    }, [])
  
    const generateQRCodeData = () => {
      const qrCodeData = {
        uid: user.uid,
        currentPoint,
        totalPoint,
        amountPaid: 0,
      };
      return JSON.stringify(qrCodeData);
    };
  
    return (
      <View style={styles.container}>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.title}>{firstName}'s ID</Text>
            <Text style={styles.label}>UID:</Text>
            <Text style={styles.text}>{user.uid}</Text>
            <Text style={styles.label}>Current Point Balance:</Text>
            <Text style={styles.text}>{currentPoint}</Text>
            <QRCodeWithLogo value={generateQRCodeData()} logo={logoImage} />
          </Card.Content>
        </Card>
      </View>
    );
    // return (
    //   <View style={styles.container}>
    //     <Text style={styles.title}>{firstName}'s ID</Text>
    //     <Text style={styles.label}>UID:</Text>
    //     <Text style={styles.text}>{user.uid}</Text>
    //     <Text style={styles.label}>Current Point Balance:</Text>
    //     <Text style={styles.text}>{currentPoint}</Text>
    //     <QRCodeWithLogo
    //       value={generateQRCodeData()}
    //       logo={logoImage}
    //     />
    //   </View>
    // );
  };
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    card: {
      backgroundColor: '#ff914d',
      padding: 16,
    },
    title: {
      fontSize: 40,
      fontWeight: 'bold',
      marginBottom: 20,
      color: 'white',
      textAlign: 'center',
    },
    label: {
      fontSize: 18,
      fontWeight: 'bold',
      marginTop: 10,
      color: 'white',
    },
    text: {
      fontSize: 16,
      marginBottom: 10,
      color: 'white',
    },
  });
  
  export default IdScreen;

// const styles = StyleSheet.create({
//     container: {
//         backgroundColor: '#f9fafd',
//         flex: 1,
//         justifyContent: 'center',
//         alignItems: 'center',
//         padding: 20,
//     },
//     text: {
//         fontSize: 20,
//         color: '#333333',
//     }
// });


