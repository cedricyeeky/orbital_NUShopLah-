/**
 * @file This file contains the HomeScreen component, which displays the main interface for the app's home page.
 * @module HomeScreen
 */

import React, { useContext, useEffect, useState } from 'react';
import { Alert, Button, Image, Dimensions, Modal, Pressable, View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import FormButton from '../../components/FormButton';
import { AuthContext } from '../../navigation/AuthProvider';
import { firebase } from '../../firebaseconfig';
import { Card, Searchbar } from 'react-native-paper';
import QRCodeWithLogo from '../../components/QRCodeWithLogo';
import { Ionicons } from '@expo/vector-icons';

/**
 * Handles voucher redemption and displays an alert.
 * @function
 * @param {Object} voucher - The voucher to be redeemed.
 * @param {Function} setRedeemedVoucher - A state setter to update the currently redeemed voucher.
 * @param {Function} toggleTrue - A function to toggle a boolean state variable to true.
 * @param {Function} setIsUseNowButtonClicked - A state setter to update the "Use Now" button click status.
 * @param {Function} toggleFalse - A function to toggle a boolean state variable to false.
 * @returns {void}
 */
export const handleVoucherRedemption = (voucher, setRedeemedVoucher, toggleTrue, setIsUseNowButtonClicked, toggleFalse) => {
  console.log("Voucher is:", voucher.voucherId);
  setRedeemedVoucher(voucher);
  toggleTrue();
  setIsUseNowButtonClicked(true);

  Alert.alert(
    "Alert",
    "Show the Voucher QR Code to the Seller to redeem this Voucher"
  );
}

/**
 * Retrieves voucher data from the Firestore database. They should be sorted by sellerName.
 * Redeemed vouchers should be rendered after the available vouchers
 * @async
 * @function
 * @returns {Promise<{vouchersData: Array, redeemedVouchersData: Array}>} - The retrieved sorted voucher data.
 */
export const retrieveVoucherData = async () => {
  try {
    const snapshot = await firebase
      .firestore()
      .collection('vouchers')
      .orderBy('sellerName', 'asc')
      .get();

    const vouchersData = [];
    const redeemedVouchersData = [];

    snapshot.forEach((doc) => {
      const voucher = doc.data();
      voucher.voucherId = doc.id;

      if (voucher.usedBy.includes(firebase.auth().currentUser.uid)) {
        redeemedVouchersData.push(voucher);
      } else {
        vouchersData.push(voucher);
      }
    });

    return { vouchersData, redeemedVouchersData };
  } catch (error) {
    console.log('Error retrieving voucher data:', error);
    return { vouchersData: [], redeemedVouchersData: [] };
  }
};

/**
 * Fetches available vouchers from Firestore and sets state variables.
 * @function
 * @param {Function} setVouchers - A state setter to update the available vouchers.
 * @param {Function} setRedeemedVouchers - A state setter to update the redeemed vouchers.
 * @returns {Function} - An unsubscribe function to stop the Firestore listener.
 */
export const fetchAvailableVouchers = (setVouchers, setRedeemedVouchers) => {
  const unsubscribe = firebase
  .firestore()
  .collection('vouchers')
  .orderBy('sellerName', 'asc')
  .onSnapshot((snapshot) => {
    const vouchersData = [];
    const redeemedVouchersData = [];

    snapshot.forEach((doc) => {
      const voucher = doc.data();
      voucher.voucherId = doc.id;

      if (voucher.usedBy.includes(firebase.auth().currentUser.uid)) {
        redeemedVouchersData.push(voucher);
      } else {
        vouchersData.push(voucher);
      }
    });

    setVouchers(vouchersData);
    setRedeemedVouchers(redeemedVouchersData);
  });

  return unsubscribe;
};

/**
 * Generates QR code data for voucher redemption.
 * @function
 * @param {Object} user - The user object.
 * @param {string} firstName - The user's first name.
 * @param {Object} redeemedVoucher - The redeemed voucher object.
 * @returns {string|null} - The JSON stringified QR code data or null if user is logged out.
 */
export const generateQRCodeData = (user, firstName, redeemedVoucher) => {
  if (user && user.uid) {
    const qrCodeData = {
        customerId: firebase.auth().currentUser.uid,
        customerName: firstName,
        pointsRequired: redeemedVoucher.pointsRequired,
        isVoucher: true,
        sellerId: redeemedVoucher.sellerId,
        voucherAmount: redeemedVoucher.voucherAmount,
        voucherDescription: redeemedVoucher.voucherDescription,
        voucherId: redeemedVoucher.voucherId,
        voucherPercentage: redeemedVoucher.voucherPercentage,
        voucherType: redeemedVoucher.voucherType,
    };
    return JSON.stringify(qrCodeData);
  } else {
    console.log("User has logged out. (generateQRCode Data)");
  }
};

/**
 * Filters vouchers based on search query.
 * @function
 * @param {Array} vouchers - The array of vouchers to filter.
 * @param {string} searchQuery - The search query string.
 * @returns {Array} - The filtered vouchers.
 */
export const filteredVouchers = (vouchers, searchQuery) => {
  return vouchers.filter((voucher) =>
    voucher.sellerName.toLowerCase().includes(searchQuery.toLowerCase())
  );
};

/**
 * The main HomeScreen component.
 * @component
 * @returns {JSX.Element} - The rendered HomeScreen component.
 */
const HomeScreen = () => {
    const {user, logout} = useContext(AuthContext)
    const [currentPoint, setCurrentPoint] = useState(0);
    const [totalPoint, setTotalPoint] = useState(0);
    const [firstName, setFirstName] = useState('');
    const logoImage = require('../../assets/NUShopLah!.png');

    //Modal
    const [showVoucherQRCodeModal, setShowVoucherQRCodeModal] = useState(false);

    const toggleModal = () => {
      setShowVoucherQRCodeModal(!showVoucherQRCodeModal);
    };

    const toggleFalse = () => {
      setShowVoucherQRCodeModal(false);
    }
    
    const toggleTrue = () => {
      setShowVoucherQRCodeModal(true);
    }

    //Vouchers
    const [vouchers, setVouchers] = useState([]);
    const [redeemedVouchers, setRedeemedVouchers] = useState([]);
    const [redeemedVoucher, setRedeemedVoucher] = useState(null);
    const [isUseNowButtonClicked, setIsUseNowButtonClicked] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const onChangeSearch = query => setSearchQuery(query);

    //For Customer Details
    useEffect(() => {
      //console.log("Homescreen useEffect running...");

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
          setShowVoucherQRCodeModal(false);
          }
        });

        fetchUserData();

      } else {
        console.log("User has logged out! Stop fetching UID (Homescreen)");
      }
    }, [user])

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
        console.log("User has logged out! Stop fetching UID (HomeScreen)")
      }
    }, [user])

    //For Vouchers
    useEffect(() => {
        if (user && user.uid) {
          const unsubscribe = fetchAvailableVouchers(setVouchers, setRedeemedVouchers);
          return () => unsubscribe();
        } else {
          console.log("User has logged out!");
        }
    }, []);

    //Function to handle redeem vouchers for Customers
    const redeemVoucher = (voucher) => {

      //Checks if user is logged in.
      const currentUser = firebase.auth().currentUser;
      if (!currentUser) {
        console.log("User is not logged in!");
        return;
      }
      
      if (voucher.pointsRequired > currentPoint) {
        Alert.alert("Warning", "Insufficient Point Balance!");
      } else {
        // Confirm with the user if they want to redeem the voucher
        Alert.alert(
          'Redeem Voucher',
          'Are you sure you want to redeem this voucher?',
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Confirm',
              onPress: () => {
                handleVoucherRedemption(voucher, setRedeemedVoucher, toggleTrue, setIsUseNowButtonClicked, toggleFalse);
              },
            },
          ]
        );

      }
      
    };

    //Data for Voucher QR Code
    //Exported
    const generateQRCodeData = () => {
      if (user && user.uid) {
        const qrCodeData = {
            customerId: firebase.auth().currentUser.uid,
            customerName: firstName,
            pointsRequired: redeemedVoucher.pointsRequired,
            isVoucher: true,
            sellerId: redeemedVoucher.sellerId,
            voucherAmount: redeemedVoucher.voucherAmount,
            voucherDescription: redeemedVoucher.voucherDescription,
            voucherId: redeemedVoucher.voucherId,
            voucherPercentage: redeemedVoucher.voucherPercentage,
            voucherType: redeemedVoucher.voucherType,
        };
        return JSON.stringify(qrCodeData);
      } else {
        console.log("User has logged out. (generateQRCode Data)");
      }
    };
    //const generateQRCodeData = (user, firstName, redeemedVoucher);
    
    //const filteredVouchers(vouchers, searchQuery);
    const filteredVouchers = vouchers.filter(voucher => 
      voucher.sellerName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <ScrollView>
        <View style={styles.container} testID='TEST_ID_CONTAINER'>
          <Image 
            source={require('../../assets/NUShopLah!-logo.png')}
            style={styles.logo}
            testID='logo'
          />
          <Text style={styles.text}>Welcome! {firstName}</Text>
          <Text style={styles.text}>Your Current Point Balance: {currentPoint}</Text>
          <Text style={styles.whiteSpaceText}>White Space.</Text>
          <FormButton buttonTitle='Logout' onPress={logout} />
          <Text style={styles.whiteSpaceText}>White Space.</Text>

          {Platform.OS === "android" && (
            <Searchbar
            placeholder="Search Seller Name"
            onChangeText={onChangeSearch}
            value={searchQuery}
            style={styles.searchBar}
            icon={() => <Ionicons name="search" size={20} />}
            clearIcon={() => <Ionicons name="close" size={20} />}
            />
          )}

          <Text style={styles.heading}>Available Vouchers</Text>
          <View>
            {/* Render available vouchers */}
            {filteredVouchers.map((voucher) => (
                <View
                  key={voucher.voucherId}
                >

                {voucher.voucherType === 'dollar' && (
                <View style={styles.dollarVoucherCard}>
                  <Card.Content testID='TEST_ID_DOLLAR_VOUCHER_CARD'>
                    <Image src={voucher.voucherImage} style={styles.voucherImage} />
                    <Text style={styles.voucherTitle}>Seller: {voucher.sellerName}</Text>
                    <Text style={styles.voucherTitle1}>Seller ID: {voucher.sellerId}</Text>
                    <Text style={styles.voucherSubtitle2}>Seller ID: </Text>
                    <Text style={styles.voucherTitle}>Voucher Amount: {voucher.voucherAmount}</Text>
                    <Text style={styles.voucherTitle}>Cost: {voucher.pointsRequired} points</Text>
                    <Text style={styles.voucherTitle}>Description: {voucher.voucherDescription}</Text>
                    <Text style={styles.voucherSubtitle2}>Seller ID: </Text>
                    <Text style={styles.voucherStatus}>Not Redeemed yet. Click to redeem.</Text>
                    <View style={styles.useNow}>
                      <FormButton
                        buttonTitle="USE NOW"
                        onPress={() => redeemVoucher(voucher)}
                      />
                    </View>
                  </Card.Content>
                </View>
                
                )}

                {voucher.voucherType === 'percentage' && (
                <View style={styles.percentageVoucherCard}>
                  <Card.Content testID='TEST_ID_PERCENTAGE_VOUCHER_CARD'>
                    <Image src={voucher.voucherImage} style={styles.voucherImage} />
                    <Text style={styles.voucherTitle}>Seller: {voucher.sellerName}</Text>
                    <Text style={styles.voucherTitle1}>Seller ID: {voucher.sellerId}</Text>
                    <Text style={styles.voucherSubtitle3}>Seller ID: </Text>
                    <Text style={styles.voucherTitle}>Voucher Percentage: {voucher.voucherPercentage}</Text>
                    <Text style={styles.voucherTitle}>Cost: {voucher.pointsRequired} points</Text>
                    <Text style={styles.voucherTitle}>Description: {voucher.voucherDescription}</Text>
                    <Text style={styles.voucherSubtitle3}>Seller ID: </Text>
                    <Text style={styles.voucherStatus}>Not Redeemed yet. Click to redeem.</Text>
                    <View style={styles.useNow}>
                      <FormButton
                        buttonTitle="USE NOW"
                        onPress={() => redeemVoucher(voucher)}
                      />
                    </View>
                  </Card.Content>
                </View>
                
                )}
                  
                </View>
            ))}

            {/* Render redeemed vouchers */}
            {redeemedVouchers.map((voucher) => (
                <View
                  key={voucher.voucherId}
                  style={styles.voucherCardRedeemed}
                  onError={() => console.log("Failed to Load Image.")}
                >

                {voucher.voucherType === 'dollar' && (
                  <View>
                    <Card.Content testID='TEST_ID_REDEEMED_DOLLAR_VOUCHER_CARD'>
                      <Image source={{ uri: voucher.voucherImage }} style={styles.voucherImage} /> 
                      <Text style={styles.voucherTitle}>Seller: {voucher.sellerName}</Text>
                      <Text style={styles.voucherTitle1}>Seller ID: {voucher.sellerId}</Text>
                      <Text style={styles.voucherSubtitle1}>Seller ID: </Text>
                      <Text style={styles.voucherTitle}>Voucher Amount: {voucher.voucherAmount}</Text>
                      <Text style={styles.voucherTitle}>Cost: {voucher.pointsRequired} points</Text>
                      <Text style={styles.voucherTitle}>Description: {voucher.voucherDescription}</Text>
                      <Text style={styles.voucherSubtitle1}>Seller ID: </Text>
                      <Text style={styles.voucherStatus}>Voucher Redeemed</Text>
                    </Card.Content>
                  </View>
                )}
                
                {voucher.voucherType === 'percentage' && (
                  <View>
                    <Card.Content testID='TEST_ID_REDEEMED_PERCENTAGE_VOUCHER_CARD'>
                      <Image source={{ uri: voucher.voucherImage }} style={styles.voucherImage} /> 
                      <Text style={styles.voucherTitle}>Seller: {voucher.sellerName}</Text>
                      <Text style={styles.voucherTitle1}>Seller ID: {voucher.sellerId}</Text>
                      <Text style={styles.voucherSubtitle1}>Seller ID: </Text>
                      <Text style={styles.voucherTitle}>Voucher Percentage: {voucher.voucherPercentage}</Text>
                      <Text style={styles.voucherTitle}>Cost: {voucher.pointsRequired} points</Text>
                      <Text style={styles.voucherTitle}>Description: {voucher.voucherDescription}</Text>
                      <Text style={styles.voucherSubtitle1}>Seller ID: </Text>
                      <Text style={styles.voucherStatus}>Voucher Redeemed</Text>
                    </Card.Content>
                  </View>
                )}

                </View>
            ))}

          </View>
          
          {/* Modal for Voucher QR Code */}
          {isUseNowButtonClicked && (
                 
            <Modal
              visible={showVoucherQRCodeModal}
              animationType = "slide"
              transparent={true}
              testID='TEST_ID_VOUCHER_QR_CODE_MODAL'
            >
              <View style={styles.modalContent}>
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>Scan the QR code below to redeem</Text>
                </View>
                <QRCodeWithLogo value={generateQRCodeData()} logo={logoImage} testID='TEST_ID_VOUCHER_QR_CODE'/>
                <Pressable onPress={() => toggleFalse()}>
                  <Text style={styles.closeButtonText}>Cancel (Voucher will not be voided)</Text>
                </Pressable>
              </View>
            </Modal>
                  
              )} 

          <Text style={styles.whiteSpaceText}>White Space.</Text>
          <Text style={styles.whiteSpaceText}>White Space.</Text>
          <Text style={styles.whiteSpaceText}>White Space.</Text>
          <Text style={styles.whiteSpaceText}>White Space.</Text>
          <Text style={styles.whiteSpaceText}>White Space.</Text>
        </View>
      
      </ScrollView>
    );
}

export default HomeScreen;

const deviceWidth = Math.round(Dimensions.get('window').width);

const styles = StyleSheet.create({
    closeButtonText: {
      color: 'white',
      marginTop: 20,
      fontWeight: 'bold',
      padding: 15,
      backgroundColor: '#003d7c',
    },
    container: {
        backgroundColor: '#fff',
        flex: 0.9,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    dollarVoucherCard: {
      backgroundColor: '#f07b10',
      borderRadius: 20,
      width: deviceWidth * 0.9,
      padding: 20,
      marginVertical: 10,
    },
    heading: {
      fontSize: 20,
      fontWeight: 'bold',
      marginVertical: 20,
    },
    logo: {
      height: 150,
      width: '100%',
      resizeMode: 'contain',
    },
    modalContent: {
      height: '50%',
      width: '100%',
      backgroundColor: '#f07b10',
      borderTopRightRadius: 18,
      borderTopLeftRadius: 18,
      position: 'absolute',
      bottom: 0,
      alignItems: 'center', 
    },
    percentageVoucherCard: {
      backgroundColor: '#db7b98',
      borderRadius: 20,
      width: deviceWidth * 0.9,
      padding: 20,
      marginVertical: 10,
    },
    qrCodeText: {
      fontSize: 60,
      marginBottom: 60,
      color: 'white',    
    },
    searchBar: {
      backgroundColor: '#f6eee3',
    },
    text: {
        fontSize: 20,
        color: '#333333',
        fontWeight: 'bold',
    },
    titleContainer: {
      height: '16%',
      backgroundColor: '#f07b10',
      borderTopRightRadius: 10,
      borderTopLeftRadius: 10,
      paddingHorizontal: 20,
      flexDirection: 'row',
      alignItems: 'center',
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      color: 'white',
    },
    useNow: {
      alignItems: 'center',
    },
    voucherSubtitle1: {
      color: '#828282',
    },
    voucherSubtitle2: {
      color: '#f07b10',
    },
    voucherSubtitle3: {
      color: '#db7b98',
    },
    voucherImage: {
        width: '100%',
        height: 250,
        marginVertical: 15,
    },
    voucherCardRedeemed: {
        backgroundColor: '#828282',
        borderRadius: 20,
        width: deviceWidth * 0.9,
        padding: 20,
        marginVertical: 10,
    },
    voucherTitle: {
        color: '#FFF',
        fontSize: 15,
        fontWeight: 'bold',
        marginVertical: 5,
    },
    voucherTitle1: {
      color: '#003d7c',
      fontSize: 12,
      fontWeight: 'bold',
      marginVertical: 5,
    },
    voucherStatus: {
        color: '#FFF',
        fontSize: 15,
        fontWeight: 'bold',
        marginVertical: 12,
        textAlign: 'center',
    },
    whiteSpaceText: {
        fontSize: 16,
        color: '#fff',
        fontWeight: 'bold',
    },
});
