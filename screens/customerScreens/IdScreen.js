import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AuthContext } from '../../navigation/AuthProvider';
import { firebase } from '../../firebaseconfig';
import QRCode from 'react-native-qrcode-svg';
import * as Brightness from 'expo-brightness';

// const IdScreen = () => {
//     const {user, logout} = useContext(AuthContext)
//     const [firstName, setFirstName] = useState('')

//     useEffect(() => {
//         firebase.firestore().collection('users')
//         .doc(firebase.auth().currentUser.uid).get()
//         .then((snapshot) => {
//             if (snapshot.exists) {
//                 setFirstName(snapshot.data().firstName)
//             } else {
//                 console.log('User does not exist')
//             }
//         })
//     }, [])

//     return (
//         //Check how to render firstName of a customer
//         //QR Code Goes here
        
//         <View style={styles.container}>
//             <Text style={styles.text}>{firstName}'s Personal ID</Text>
//             <FormButton buttonTitle='Logout' onPress={() => logout()} />
//         </View>
//     );
// }

// export default IdScreen;

const IdScreen = () => {
    const { user } = useContext(AuthContext);
    const [currentPoint, setCurrentPoint] = useState(0);
    const [totalPoint, setTotalPoint] = useState(0);
    const [firstName, setFirstName] = useState('');
    const [previousBrightness, setPreviousBrightness] = useState(0);
  
    useEffect(() => {
      const fetchUserData = async () => {
        try {
          const userCollectionRef = firebase.firestore().collection('customer');
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
        <Text style={styles.title}>{firstName}'s ID</Text>
        <Text style={styles.label}>UID:</Text>
        <Text style={styles.text}>{user.uid}</Text>
        <Text style={styles.label}>Current Point Balance:</Text>
        <Text style={styles.text}>{currentPoint}</Text>
        <QRCode
          value={generateQRCodeData()}
          size={200}
          color="black"
          backgroundColor="white"
        />
      </View>
    );
  };
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 20,
    },
    label: {
      fontSize: 18,
      fontWeight: 'bold',
      marginTop: 10,
    },
    text: {
      fontSize: 16,
      marginBottom: 10,
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


