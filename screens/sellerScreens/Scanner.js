import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, Modal, Pressable, Dimensions } from 'react-native';
import { Camera } from 'expo-camera';
import { firebase } from '../../firebaseconfig';
import { AuthContext } from '../../navigation/AuthProvider';
import FormInput from '../../components/FormInput';
import FormButton from '../../components/FormButton';
import {showVoucherQRCodeModal, toggleModal} from '../customerScreens/HomeScreen';
import { useNavigation } from '@react-navigation/native';

export const updateCurrentPointInFirestore = async (customerId, updatedCustomerCurrentPoint) => {
  try {
    await firebase.firestore().collection('users').doc(customerId).update({
      currentPoint: updatedCustomerCurrentPoint,
    });

    console.log('Customer Current Point Updated!');
  } catch (error) {
    console.log('Error updating points:', error);
  }
};

export const addPointsTransactionInFirestore = async ({
  amountPaid,
  customerId,
  customerName,
  sellerId,
  sellerName,
  currentPoint,
  newCurrentPoint,
}) => {
  const transactionsCollectionRef = firebase.firestore().collection('transactions');
  await transactionsCollectionRef.add({
    amountPaid: amountPaid,
    customerId: customerId,
    customerName: customerName,
    pointsAwarded: newCurrentPoint - currentPoint,
    sellerId: sellerId,
    sellerName: sellerName,
    // timeStamp: firebase.firestore.FieldValue.serverTimestamp(),
    transactionType: "Points Transaction",
    voucherAmount: 0,
  });
};

export const addVoucherTransactionInFirestore = async ({
  finalAmount,
  customerId,
  customerName,
  sellerId,
  sellerName,
  data,
}) => {
  const transactionsCollectionRef = firebase.firestore().collection('transactions');
  await transactionsCollectionRef.add({
    amountPaid: finalAmount,
    customerId: customerId,
    customerName: customerName,
    pointsAwarded: 0,
    sellerId: sellerId,
    sellerName: sellerName,
    // timeStamp: firebase.firestore.FieldValue.serverTimestamp(),
    transactionType: "Voucher Transaction",
    voucherAmount: data.voucherAmount,
    voucherDescription: data.voucherDescription,
    voucherId: data.voucherId,
    voucherPercentage: data.voucherPercentage,
    voucherType: data.voucherType,
  });
};

const TIER_STATUS_LIMIT = [500, 1500, 5000]; //Number of points required to move up to next Tier. For example, "500" indicates you can level up from "Member" to "Silver" Tier
const POINT_MULTIPLIER = [1, 1.25, 1.5, 2]; //Member, Silver, Gold, Platinum respectively

 export const calculateNewCurrentPoint = (currentPoint, amountPaid) => {
  let newCurrentPoint = 0;
  //Member
  if (currentPoint < TIER_STATUS_LIMIT[0]) {
    newCurrentPoint = Math.round(currentPoint + amountPaid * POINT_MULTIPLIER[0]);
  } else if (currentPoint >= TIER_STATUS_LIMIT[0] && currentPoint < TIER_STATUS_LIMIT[1]) {
    newCurrentPoint = Math.round(currentPoint + amountPaid * POINT_MULTIPLIER[1]) ;
  } else if (currentPoint >= TIER_STATUS_LIMIT[1] && currentPoint < TIER_STATUS_LIMIT[2]) {
    newCurrentPoint = Math.round(currentPoint + amountPaid * POINT_MULTIPLIER[2]);
  } else {
    newCurrentPoint = Math.round(currentPoint + amountPaid * POINT_MULTIPLIER[3]);
  }
  return newCurrentPoint;
}

export const calculateNewTotalPoint = (totalPoint, amountPaid) => {
  let newTotalPoint = 0;
  //Member
  if (totalPoint < TIER_STATUS_LIMIT[0]) {
    newTotalPoint = Math.round(totalPoint + amountPaid * POINT_MULTIPLIER[0]);
  } else if (totalPoint >= TIER_STATUS_LIMIT[0] && totalPoint < TIER_STATUS_LIMIT[1]) {
    newTotalPoint = Math.round(totalPoint + amountPaid * POINT_MULTIPLIER[1]) ;
  } else if (totalPoint >= TIER_STATUS_LIMIT[1] && totalPoint < TIER_STATUS_LIMIT[2]) {
    newTotalPoint = Math.round(totalPoint + amountPaid * POINT_MULTIPLIER[2]);
  } else {
    newTotalPoint = Math.round(totalPoint + amountPaid * POINT_MULTIPLIER[3]);
  }
  return newTotalPoint;
}

export const handleQRCodeScan = async ({ data }, setScanning, setData, setShowPromptModal, user) => {
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
        
        setData(qrCodeData);
        setShowPromptModal(true);  
      } else {
        throw new Error("This QR Code is from other Sellers! Or it is not valid anymore!");
      }
    } else {
      //PERSONAL ID. Can Award Points.
      setData(qrCodeData); //Parsed version
      setShowPromptModal(true);
      
    }
    
  } catch (err) {
    if (err.message === 'Points cannot be negative!') {
      Alert.alert('Error', 'Points cannot be negative! Please ensure amount paid is correct.');
    } else if (err.message === "This QR Code is from other Sellers! Or it is not valid anymore!") {
      console.log('This voucher is from another seller! Otherwise, This voucher is Invalid!');
      Alert.alert('This voucher is from another seller! Otherwise, This voucher is Invalid!');
    } else {
      console.log('Error scanning QR code:', err);
      Alert.alert('Error', 'Invalid QR code');
    }
  }
};

const ScannerScreen = () => {
  const { user } = useContext(AuthContext);
  const [scanning, setScanning] = useState(false);
  const [sellerName, setSellerName] = useState('');
  const [hasCameraPermission, setHasCameraPermission] = useState(true);
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [data, setData] = useState(null); //QR Code Data
  const [originalPrice, setOriginalPrice] = useState(0);
  const navigation = useNavigation();

  useEffect(() => {
    console.log("(Seller Scan QR) useEffect running...")
    if (user && user.uid) {
      const fetchUserData = async () => {
        try {
          const snapshot = await firebase
            .firestore()
            .collection('users')
            .doc(firebase.auth().currentUser.uid)
            .get();
    
          if (snapshot.exists) {
            setSellerName(snapshot.data().firstName);
          } else {
            console.log('User does not exist');
            Alert.alert('User does not exist');
          }
        } catch (err) {
          console.log('Error getting user:', err);
        }
      };
    
      const requestCameraPermission = async () => {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasCameraPermission(status === 'granted');
        setScanning(true);
        if (status !== 'granted') {
          // Prompt the user to enable camera permission
          await Camera.requestCameraPermissionsAsync();
        }
      };
    
      fetchUserData();
      requestCameraPermission();
      
    } else {
      console.log("Seller has logged out (Scan QR Screen)");
    }
    
  }, [user]);

  useEffect(() => {
    const focusListener = navigation.addListener('focus', () => {
      // Handle camera activation when the screen comes into focus
      setScanning(true);
    });

    const blurListener = navigation.addListener('blur', () => {
      // Handle camera deactivation when the screen loses focus
      setScanning(false);
    });

    return () => {
      // Cleanup function when component unmounts or navigation listener is removed
      focusListener();
      blurListener();
    };
  }, [navigation]);

  const handleTransaction = async (originalPrice) => {
    if (data.isVoucher) {
      if (data.voucherType === 'dollar') {
        console.log("original price is: ", originalPrice);
        const { 
          customerId, 
          customerName,
          isVoucher,
          voucherId, 
          voucherAmount,
          voucherDescription, 
          voucherPercentage,
          voucherType, 
          pointsRequired, 
          sellerId, 
          showVoucherQRCodeModal, //Modal in Customer Screen must be tracked
              } = data;
        
        //let customerModal = Boolean(data.showVoucherQRCodeModal);

        let finalAmount = Number((originalPrice - data.voucherAmount).toFixed(2));
        
        finalAmount = (finalAmount < 0) ? 0 : finalAmount; //Make negative payables to 0
        console.log("Absolute Voucher Final Amount:", finalAmount);

        console.log("Now Deduct and Update Customer Current Point Balance")
      
        firebase.firestore().collection('users').doc(customerId).get()
        .then((snapshot) => {
          const customer = snapshot.data();
          const customerCurrentPoint = customer.currentPoint;
          const updatedCustomerCurrentPoint = customerCurrentPoint - data.pointsRequired;
      
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
          voucherAmount: data.voucherAmount,
          voucherDescription: data.voucherDescription,
          voucherId: data.voucherId,
          voucherPercentage: data.voucherPercentage,
          voucherType: data.voucherType,
        });

        // Show success message
        Alert.alert('Success', `${customerName} has successfully redeemed the Voucher and you will be paid $${finalAmount}`);

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

        
        console.log("Customer Modal:", showVoucherQRCodeModal);
        setShowPromptModal(false);
        setOriginalPrice(0);
      } else {
        console.log("Using a Percentage Voucher");
        console.log("original price is: ", originalPrice);
        const { voucherId, voucherAmount, pointsRequired, voucherDescription, customerId, customerName, sellerId, isVoucher, voucherPercentage} = data;
        
        let voucherPercentageTrimmed = data.voucherPercentage;
        console.log("voucher percentage:", voucherPercentageTrimmed);
        let finalAmount = originalPrice * ( (100 - parseFloat(voucherPercentageTrimmed, 10)) / 100); 
        console.log("After parsing, finalAmount:", finalAmount);
        finalAmount = Number(finalAmount.toFixed(2));
        finalAmount = (finalAmount < 0) ? 0 : finalAmount; //Make negative payables to 0
        console.log("After rounding to 2dp, finalAmount:", finalAmount);

      console.log("Now Deduct and Update Customer Current Point Balance")
      
      firebase.firestore().collection('users').doc(customerId).get()
      .then((snapshot) => {
        const customer = snapshot.data();
        const customerCurrentPoint = customer.currentPoint;
        const updatedCustomerCurrentPoint = customerCurrentPoint - data.pointsRequired;
    
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
        voucherAmount: data.voucherAmount,
        voucherDescription: data.voucherDescription,
        voucherId: data.voucherId,
        voucherPercentage: data.voucherPercentage,
        voucherType: data.voucherType,
      });

      // Show success message
      Alert.alert('Success', `${customerName} has successfully redeemed the Voucher and you will be paid $${finalAmount}`);

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

      //Reset state variables
      // toggleModal(); // Customer Side Voucher QR Should disappear
      console.log("Customer Modal:", showVoucherQRCodeModal);
      setShowPromptModal(false);
      setOriginalPrice(0);
      }
      
      
    } else {
        const { uid, firstName, currentPoint, totalPoint } = data;
        let amountPaid = parseFloat(originalPrice, 10);
        console.log(amountPaid);
    
        // Calculate new points
        const newCurrentPoint = calculateNewCurrentPoint(currentPoint, amountPaid);
        //console.log("Updated Current Point:" , newCurrentPoint);
        const newTotalPoint = calculateNewTotalPoint(totalPoint, amountPaid);
        //console.log("Updated Total Point:" , newTotalPoint);

        //Round Amount Paid to 2dp to for the creation of Transaction Log
        amountPaid = Number(amountPaid.toFixed(2));
        
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
            amountPaid: amountPaid,
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
          Alert.alert('Success Points Transaction', `Customer's current point: ${newCurrentPoint}\nTotal point: ${newTotalPoint}`);

          //Reset State Variable
          setShowPromptModal(false);
          setOriginalPrice(0);

        } else {
          Alert.alert('Error', 'User data not found');
        }
    }
      
  }
  
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
          
          setData(qrCodeData);
          setShowPromptModal(true);  
        } else {
          throw new Error("This QR Code is from other Sellers! Or it is not valid anymore!");
        }
      } else {
        //PERSONAL ID. Can Award Points.
        setData(qrCodeData); //Parsed version
        setShowPromptModal(true);
        
      }
      
    } catch (err) {
      if (err.message === 'Points cannot be negative!') {
        Alert.alert('Error', 'Points cannot be negative! Please ensure amount paid is correct.');
      } else if (err.message === "This QR Code is from other Sellers! Or it is not valid anymore!") {
        console.log('This voucher is from another seller! Otherwise, This voucher is Invalid!');
        Alert.alert('This voucher is from another seller! Otherwise, This voucher is Invalid!');
      } else {
        console.log('Error scanning QR code:', err);
        Alert.alert('Error', 'Invalid QR code', err);
      }
    }
  };
  

  const handleScanAgain = async () => {
      setScanning(true);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Scanner</Text>
      {(scanning)  ? (
        <Camera
          onBarCodeScanned={handleQRCodeScan}
          style={StyleSheet.absoluteFillObject}
          testID="camera"
        >
        <View style={styles.mask}>
            <View style={styles.squareContainer}>
              <View style={styles.square} />
              <View style={[styles.corner, styles.cornerTopLeft]} />
              <View style={[styles.corner, styles.cornerTopRight]} />
              <View style={[styles.corner, styles.cornerBottomLeft]} />
              <View style={[styles.corner, styles.cornerBottomRight]} />
            </View>
        </View>
        </Camera>
      ) : (
        <View>
          <TouchableOpacity style={styles.scanAgainButton} onPress={handleScanAgain}>
            <Text style={styles.buttonText}>Scan?</Text>
          </TouchableOpacity>
        </View>
      )}

      
                 
      <Modal
        visible={showPromptModal}
        animationType = "slide"
        transparent={true}
      >
        <View style={styles.modalContent}>
          <View style={styles.titleContainer}>
              <Text style={styles.title}>Input Original Price Payable:</Text>
          </View>

          <FormInput
            labelValue={String(originalPrice)}
            onChangeText={(price) => setOriginalPrice(price)}
            placeholderText="Enter Original Price"
            iconType="creditcard"
            keyboardType="numeric"
            autoCapitalize="none"
            autoCorrect={false}
          />
          
          <FormButton
            buttonTitle="Submit"
            onPress={() => handleTransaction(originalPrice)}
          />
          
          <Pressable style={styles.button1} onPress={() => setShowPromptModal(false)}>
            <Text style={styles.closeButtonText}>Cancel</Text>
          </Pressable>
        </View>
      </Modal>
                       
    </View>
  );
};



const styles = StyleSheet.create({
  button1: {
    marginTop: 20,
    backgroundColor: "red",
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderWidth: 10,
    borderColor: '#f07b10',
    transform: [{ rotate: '180deg' }],
    fontWeight: 'bold',
    borderRadius: 3,
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 0,
    borderLeftWidth: 0,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: 0,
    borderRightWidth: 0,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 0,
    borderRightWidth: 0,
  },
  mask: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalContent: {
    height: '100%',
    width: '100%',
    backgroundColor: '#f07b10',
    borderTopRightRadius: 18,
    borderTopLeftRadius: 18,
    position: 'absolute',
    bottom: 0,
    alignItems: 'center', 
  },
  scanAgainButton: {
    backgroundColor: '#f07b10',
    padding: 10,
    marginTop: 20,
    borderRadius: 5,
  },
  squareContainer: {
    position: 'relative',
    width: 280,
    height: 280,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: 'rgba(0, 0, 0, 0)',
  },
  square: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0)',
    borderColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  titleContainer: {
    height: '16%',
    backgroundColor: '#f07b10',
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 50,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default ScannerScreen;

