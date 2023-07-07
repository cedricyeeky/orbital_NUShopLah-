import React, { useContext, useEffect, useState } from 'react';
import { Alert, Button, Image, Dimensions, Modal, Pressable, View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import FormButton from '../../components/FormButton';
import { AuthContext } from '../../navigation/AuthProvider';
import { firebase } from '../../firebaseconfig';
 import { Card, Portal, PaperProvider, Searchbar } from 'react-native-paper';
import QRCode from 'react-native-qrcode-svg';
import QRCodeWithLogo from '../../components/QRCodeWithLogo';
// import { SearchBar } from '@rneui/themed';
// import { globalState } from 

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
    // const toggleModal = () => {
    //   globalState.showVoucherQRCodeModal = !globalState.showVoucherQRCodeModal;
    // }

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
      console.log("Homescreen useEffect running...");

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
        });

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

      } else {
        console.log("User has logged out! Stop fetching UID (Homescreen)");
      }
    }, [user])

    //For Vouchers
    useEffect(() => {
        // Fetch all vouchers from Firestore
        firebase
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
                const currentUserUid = firebase.auth().currentUser.uid;
                console.log("Voucher is:", voucher.voucherId);
                setRedeemedVoucher(voucher);
                toggleTrue();
                setIsUseNowButtonClicked(true);

                Alert.alert("Alert", "The QR Code will be valid for only 5 minutes!");

                // DISPLAY TIMER IN FUTURE
                
                //Automatically hide the voucher QR code modal after 5 minutes
                setTimeout(() => {
                  toggleFalse();
                  setIsUseNowButtonClicked(false);
                }, 5 * 60 * 1000); // 5 minutes in milliseconds

              },
            },
          ]
        );

      }
      
    };
  

    //Data for Voucher QR Code
    const generateQRCodeData = () => {
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
    };
    
    const filteredVouchers = vouchers.filter(voucher =>
      voucher.sellerName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <ScrollView>
        <View style={styles.container}>
          <Image
            source={require('../../assets/NUShopLah!-logo.png')}
            style={styles.logo}
          />
          <Text style={styles.text}>Welcome! {firstName}</Text>
          <Text style={styles.text}>Your Current Point Balance: {currentPoint}</Text>
          <Text style={styles.whiteSpaceText}>White Space.</Text>
          <FormButton buttonTitle='Logout' onPress={logout} />
          <Text style={styles.whiteSpaceText}>White Space.</Text>

          <Searchbar
            placeholder="Search Seller Name"
            onChangeText={onChangeSearch}
            value={searchQuery}
            style={styles.searchBar}
          />

          <Text style={styles.heading}>Available Vouchers</Text>
          <ScrollView>
            {/* Render available vouchers */}
            {filteredVouchers.map((voucher) => (
                <TouchableOpacity
                  key={voucher.voucherId}
                  // style={styles.voucherCard}
                  // onPress={() => redeemVoucher(voucher.voucherId)}
                >

                {voucher.voucherType === 'dollar' && (
                <View style={styles.dollarVoucherCard}>
                  <Card.Content>
                    <Image src={voucher.voucherImage} style={styles.voucherImage} />
                    <Text style={styles.voucherTitle}>Seller: {voucher.sellerName}</Text>
                    <Text style={styles.voucherSubtitle}>Seller ID: {voucher.sellerId}</Text>
                    <Text style={styles.voucherSubtitle2}>Seller ID: </Text>
                    <Text style={styles.voucherTitle}>Voucher Amount: {voucher.voucherAmount}</Text>
                    <Text style={styles.voucherSubtitle}>Cost: {voucher.pointsRequired} points</Text>
                    <Text style={styles.voucherSubtitle}>Description: {voucher.voucherDescription}</Text>
                    <Text style={styles.voucherStatus}>Not Redeemed yet. Click to redeem.</Text>
                    <FormButton
                      buttonTitle="USE NOW"
                      onPress={() => redeemVoucher(voucher)}
                    />
                  </Card.Content>
                </View>
                
                )}

                {voucher.voucherType === 'percentage' && (
                <View style={styles.percentageVoucherCard}>
                  <Card.Content>
                    <Image src={voucher.voucherImage} style={styles.voucherImage} />
                    <Text style={styles.voucherTitle}>Seller: {voucher.sellerName}</Text>
                    <Text style={styles.voucherSubtitle}>Seller ID: {voucher.sellerId}</Text>
                    <Text style={styles.voucherSubtitle3}>Seller ID: </Text>
                    <Text style={styles.voucherTitle}>Voucher Percentage: {voucher.voucherPercentage}</Text>
                    <Text style={styles.voucherSubtitle}>Cost: {voucher.pointsRequired} points</Text>
                    <Text style={styles.voucherSubtitle}>Description: {voucher.voucherDescription}</Text>
                    <Text style={styles.voucherStatus}>Not Redeemed yet. Click to redeem.</Text>
                    <FormButton
                      buttonTitle="USE NOW"
                      onPress={() => redeemVoucher(voucher)}
                    />
                  </Card.Content>
                </View>
                
                )}
                  
                </TouchableOpacity>
            ))}

            {/* Render redeemed vouchers */}
            {redeemedVouchers.map((voucher) => (
                <TouchableOpacity
                  key={voucher.voucherId}
                  style={styles.voucherCardRedeemed}
                  onError={() => console.log("Failed to Load Image.")}
                >

                {voucher.voucherType === 'dollar' && (
                  <View>
                    <Card.Content>
                      <Image source={{ uri: voucher.voucherImage }} style={styles.voucherImage} /> 
                      <Text style={styles.voucherTitle}>Seller: {voucher.sellerName}</Text>
                      <Text style={styles.voucherSubtitle}>Seller ID: {voucher.sellerId}</Text>
                      <Text style={styles.voucherSubtitle1}>Seller ID: </Text>
                      <Text style={styles.voucherTitle}>Voucher Amount: {voucher.voucherAmount}</Text>
                      <Text style={styles.voucherSubtitle}>Cost: {voucher.pointsRequired} points</Text>
                      <Text style={styles.voucherSubtitle}>Description: {voucher.voucherDescription}</Text>
                      <Text style={styles.voucherStatus}>Voucher Redeemed</Text>
                    </Card.Content>
                  </View>
                )}
                
                {voucher.voucherType === 'percentage' && (
                  <View>
                    <Card.Content>
                      <Image source={{ uri: voucher.voucherImage }} style={styles.voucherImage} /> 
                      <Text style={styles.voucherTitle}>Seller: {voucher.sellerName}</Text>
                      <Text style={styles.voucherSubtitle}>Seller ID: {voucher.sellerId}</Text>
                      <Text style={styles.voucherSubtitle1}>Seller ID: </Text>
                      <Text style={styles.voucherTitle}>Voucher Percentage: {voucher.voucherPercentage}</Text>
                      <Text style={styles.voucherSubtitle}>Cost: {voucher.pointsRequired} points</Text>
                      <Text style={styles.voucherSubtitle}>Description: {voucher.voucherDescription}</Text>
                      <Text style={styles.voucherStatus}>Voucher Redeemed</Text>
                    </Card.Content>
                  </View>
                )}

                </TouchableOpacity>
            ))}

          </ScrollView>
          {/* Modal for Voucher QR Code */}

          {isUseNowButtonClicked && (
                 
            <Modal
              visible={showVoucherQRCodeModal}
              animationType = "slide"
              transparent={true}
            >
              <View style={styles.modalContent}>
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>Scan the QR code below to redeem</Text>
                </View>
                <QRCodeWithLogo value={generateQRCodeData()} logo={logoImage} />
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
    container: {
        backgroundColor: '#fff',
        flex: 0.9,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    heading: {
      fontSize: 20,
      fontWeight: 'bold',
      marginVertical: 20,
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
    closeButtonText: {
      color: 'white',
      marginTop: 20,
      fontWeight: 'bold',
      padding: 15,
      backgroundColor: '#003d7c',
    },
    searchBar: {
      backgroundColor: '#f6eee3',
    },
    logo: {
      height: 150,
      width: '100%',
      resizeMode: 'contain',
    },
    qrCodeText: {
      fontSize: 60,
      marginBottom: 60,
      color: 'white',    
    },
    dollarVoucherCard: {
      backgroundColor: '#f07b10',
      borderRadius: 20,
      width: deviceWidth * 0.9,
      height: 600,
      padding: 16,
      marginVertical: 10,
    },
    percentageVoucherCard: {
      backgroundColor: '#db7b98',
      borderRadius: 20,
      width: deviceWidth * 0.9,
      height: 600,
      padding: 16,
      marginVertical: 10,
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
        padding: 16,
        marginVertical: 10,
        height: 600,
    },
    voucherTitle: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    voucherSubtitle: {
        color: '#FFF',
        fontSize: 14,
        marginBottom: 8,
    },
    voucherStatus: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: 'bold',
        marginTop: 8,
        marginBottom: 8,
    },
    whiteSpaceText: {
        fontSize: 16,
        color: '#fff',
        fontWeight: 'bold',
    },
});
