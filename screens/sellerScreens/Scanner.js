import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { firebase } from '../../firebaseconfig';
import { AuthContext } from '../../navigation/AuthProvider';

const ScannerScreen = () => {
  const { user } = useContext(AuthContext);
  const [scanning, setScanning] = useState(true);
  const [sellerName, setSellerName] = useState('');

  useEffect(() => {
    firebase.firestore().collection('users')
    .doc(firebase.auth().currentUser.uid).get()
    .then((snapshot) => {
      if (snapshot.exists) {
        setSellerName(snapshot.data().firstName)
      } else {
        console.log('User does not exist')
      }
    })
    .catch((error) => {
      console.log("Error getting user: ", error)
    })
  }, [])

  const handleQRCodeScan = async ({ data }) => {
    setScanning(false);
  
    try {
      const qrCodeData = JSON.parse(data);

      if (qrCodeData.isVoucher) {
        //VOUCHER QR CODE. Cannot Award Points.#000
        const { voucherId, voucherAmount, pointsRequired, voucherDescription, customerId, customerName, sellerId, isVoucher} = qrCodeData;
        console.log("Seller ID from QR Code", qrCodeData.sellerId);
        console.log(qrCodeData);
        console.log("Seller ID from Auth Context:", user.uid);

        if (qrCodeData.sellerId === user.uid) {
          // This Voucher is Indeed from the Seller who is creating it. And that the Cusstomer is using it at that Seller's store
          // Otherwise it will be like using Watson's voucher at Guardian.

          console.log("Here we want to know Original Price")
          const inputResult = await new Promise((resolve) => {
            Alert.prompt('Original Price', 'Enter the original Price Payable by the customer:', (text) => {
              resolve(parseInt(text, 10) || 0);
            });
          });
  
          const originalPrice = inputResult || 0;
          console.log(originalPrice);
  
          //Calculate Final Amount Payable by Customer AFTER Applying Voucher
          let finalAmount = originalPrice - qrCodeData.voucherAmount;
          finalAmount = (finalAmount < 0) ? 0 : finalAmount; //Make negative payables to 0
          console.log(finalAmount);

          // Update the 'usedBy' array of the voucher document in Firestore
          firebase
          .firestore()
          .collection('vouchers')
          .doc(voucherId)
          .update({
            usedBy: firebase.firestore.FieldValue.arrayUnion(customerId),
          }).then(() => {
            console.log('Voucher redeemed successfully!');
          })
          .catch((error) => {
            console.log('Error redeeming voucher:', error);
          });

          console.log("Now Deduct and Update Customer Current Point Balance")
          
          firebase.firestore().collection('users').doc(customerId).get()
          .then((snapshot) => {
            const customer = snapshot.data();
            const customerCurrentPoint = customer.currentPoint;
            const updatedCustomerCurrentPoint = customerCurrentPoint - qrCodeData.pointsRequired;
        
            firebase
              .firestore()
              .collection('users')
              .doc(customerId)
              .update({
                currentPoint: updatedCustomerCurrentPoint,
              })
              .then(() => {
                console.log('Customer Current Point Updated!');
              })
              .catch((error) => {
                console.log('Error updating points:', error);
              });
          })
          .catch((error) => {
            console.log('Error getting customer data:', error);
          });
        
          //Create a Transaction Log of type "Voucher Transaction"
          const transactionsCollectionRef = firebase.firestore().collection('transactions');
          const transactionDocRef = await transactionsCollectionRef.add({
            amountPaid: finalAmount,
            customerId: customerId,
            customerName: customerName,
            pointsAwarded: 0,
            sellerId: user.uid,
            sellerName: sellerName,
            timeStamp: firebase.firestore.FieldValue.serverTimestamp(),
            transactionType: "Voucher Transaction",
            voucherAmount: qrCodeData.voucherAmount,
            voucherId: qrCodeData.voucherId,
            voucherDescription: qrCodeData.voucherDescription,
          });

          // Show success message
          Alert.alert('Success', `${customerName} has successfully redeemed the Voucher and you will be paid $${finalAmount}`);
        } else {
          throw new Error("This QR Code is from other Sellers! Or it is not valid anymore!");
        }
      } else {
        //PERSONAL ID. Can Award Points.
        const { uid, firstName, currentPoint, totalPoint } = qrCodeData;

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
          // Create a new transaction document in the "Transactions" collection
          await userDocRef.update({
            currentPoint: newCurrentPoint,
            totalPoint: newTotalPoint,
          });
  
          const transactionsCollectionRef = firebase.firestore().collection('transactions');
          const transactionDocRef = await transactionsCollectionRef.add({
            amountPaid,
            customerId: uid,
            customerName: firstName,
            pointsAwarded: newCurrentPoint - currentPoint,
            sellerId: user.uid,
            sellerName: sellerName,
            timeStamp: firebase.firestore.FieldValue.serverTimestamp(),
            transactionType: "Points Transaction",
            voucherAmount: 0,
          });
    
          // Show success message
          Alert.alert('Success', `Customer's current point: ${newCurrentPoint}\nTotal point: ${newTotalPoint}`);
        } else {
          Alert.alert('Error', 'User data not found');
        }
      }
      
    } catch (error) {
      if (error.message === 'Points cannot be negative!') {
        Alert.alert('Error', 'Points cannot be negative! Please ensure amount paid is correct.');
      } else if (error.message === "This QR Code is from other Sellers! Or it is not valid anymore!") {
        console.log('This voucher is from another seller! Otherwise, This voucher is Invalid!');
        Alert.alert('This voucher is from another seller! Otherwise, This voucher is Invalid!');
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

