// import React, { useState, useEffect } from 'react';
// import { Text, View, StyleSheet, Button } from 'react-native';
// import { BarCodeScanner } from 'expo-barcode-scanner';

// export default function Scanner() {
//   const [hasPermission, setHasPermission] = useState(null);
//   const [scanned, setScanned] = useState(false);

//   useEffect(() => {
//     (async () => {
//       const { status } = await BarCodeScanner.requestPermissionsAsync();
//       setHasPermission(status === 'granted');
//     })();
//   }, []);

//   const handleBarCodeScanned = ({ type, data }) => {
//     setScanned(true);
//     alert(`Bar code with type ${type} and data ${data} has been scanned!`);
//   };

//   if (hasPermission === null) {
//     return <Text>Requesting for camera permission</Text>;
//   }
//   if (hasPermission === false) {
//     return <Text>No access to camera</Text>;
//   }

//   return (
//     <View style={styles.container}>
//       <BarCodeScanner
//         onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
//         style={StyleSheet.absoluteFillObject}
//       />
//       {scanned && <Button title={'Tap to Scan Again'} onPress={() => setScanned(false)} />}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     flexDirection: 'column',
//     justifyContent: 'center',
//   },
// });

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { firebase } from '../../firebaseconfig';

const ScannerScreen = () => {
  const [scanning, setScanning] = useState(true);

  // useEffect(() => {
  //   // Stop scanning after 10 seconds
  //   const timer = setTimeout(() => {
  //     setScanning(false);
  //   }, 10000);

  //   return () => clearTimeout(timer);
  // }, []);

  const handleQRCodeScan = async ({ data }) => {
    setScanning(false);

    try {
      const qrCodeData = JSON.parse(data);
      const { uid, currentPoint, totalPoint } = qrCodeData;

      // Prompt for amountPaid input
      const inputResult = await new Promise((resolve) => {
        Alert.prompt('Amount Paid', 'Enter the amount paid by the customer:', (text) => {
          resolve(parseInt(text, 10) || 0);
        });
      });

      const amountPaid = inputResult || 0;

      // Update customer's data in Firestore
      const userCollectionRef = firebase.firestore().collection('users');
      const userDocRef = userCollectionRef.doc(uid);
      const userData = await userDocRef.get();
      if (userData.exists) {
        // Prompt for amountPaid input
        // let amountPaid = 0;
        // Alert.prompt('Amount Paid', 'Enter the amount paid by the customer:', (text) => {
        //   amountPaid = parseInt(text, 10) || 0;
        // });

        const { currentPoint: prevCurrentPoint, totalPoint: prevTotalPoint } = userData.data();
        const newCurrentPoint = prevCurrentPoint + amountPaid * 2;
        const newTotalPoint = prevTotalPoint + amountPaid * 2;
        await userDocRef.update({
          currentPoint: newCurrentPoint,
          totalPoint: newTotalPoint,
        });

        // Show success message
        Alert.alert('Success', `Customer's current point: ${newCurrentPoint}\nTotal point: ${newTotalPoint}`);
      } else {
        Alert.alert('Error', 'User data not found');
      }
    } catch (error) {
      console.log('Error scanning QR code:', error);
      Alert.alert('Error', 'Invalid QR code');
    }
  };

  const handleScanAgain = async () => {
    setScanning(true);
  }

  return (
    <View style={styles.container}>
    <Text style={styles.title}>Scanner</Text>
    {scanning ? (
      <BarCodeScanner
        onBarCodeScanned={handleQRCodeScan}
        style={StyleSheet.absoluteFillObject}
      />
    ) : (
      
      <View>
        <TouchableOpacity style={styles.scanAgainButton} onPress={handleScanAgain}>
          <Text style={styles.buttonText}>Scan Again?</Text>
        </TouchableOpacity>
      </View>
      // <Text style={styles.message}>Scanning timeout</Text><View>
      //       <Button style={styles.scanAgainButton}
      //         onPress={() => handleScanAgain}>
      //         Scan Again?
      //       </Button>
      //     </View>
    )}
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
  scanAgainButton: {
    backgroundColor: 'blue',
    padding: 10,
    marginTop: 20,
    borderRadius: 5,
  },
  message: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default ScannerScreen;
