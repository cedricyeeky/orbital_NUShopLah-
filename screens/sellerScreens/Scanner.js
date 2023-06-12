import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { firebase } from '../../firebaseconfig';

const ScannerScreen = () => {
  const [scanning, setScanning] = useState(true);

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
  
      // Calculate new points
      const newCurrentPoint = currentPoint + amountPaid * 2;
      const newTotalPoint = totalPoint + amountPaid * 2;
  
      // Check if points are negative
      if (newCurrentPoint < 0 || newTotalPoint < 0) {
        throw new Error('Points cannot be negative!');
      }
  
      // Update customer's data in Firestore
      const userCollectionRef = firebase.firestore().collection('users');
      const userDocRef = userCollectionRef.doc(uid);
      const userData = await userDocRef.get();
      if (userData.exists) {
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
      if (error.message === 'Points cannot be negative!') {
        Alert.alert('Error', 'Points cannot be negative! Please ensure amount paid is correct.');
      } else {
        console.log('Error scanning QR code:', error);
        Alert.alert('Error', 'Invalid QR code');
      }
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
