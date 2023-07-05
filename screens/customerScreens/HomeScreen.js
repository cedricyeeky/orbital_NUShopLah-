import React, { useContext, useEffect, useState } from 'react';
import { Alert, Button, Image, Dimensions, Modal, Pressable, View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import FormButton from '../../components/FormButton';
import { AuthContext } from '../../navigation/AuthProvider';
import { firebase } from '../../firebaseconfig';
 import { Card, Portal, PaperProvider, Searchbar } from 'react-native-paper';
import QRCode from 'react-native-qrcode-svg';
import QRCodeWithLogo from '../../components/QRCodeWithLogo';
// import { SearchBar } from '@rneui/themed';

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
                  setShowVoucherQRCodeModal(true);
                  setIsUseNowButtonClicked(true);
  
                  Alert.alert("Alert", "The QR Code will be valid for only 5 minutes!");
  
                  // DISPLAY TIMER IN FUTURE
                  
                  //Automatically hide the voucher QR code modal after 5 minutes
                  setTimeout(() => {
                    setShowVoucherQRCodeModal(false);
                    setIsUseNowButtonClicked(false);
                  }, 5 * 60 * 1000); // 5 minutes in milliseconds
  
                  
                },
              },
            ]
          );

        }
        
      };
    
    const generateQRCodeData = () => {
      const qrCodeData = {
          voucherId: redeemedVoucher.voucherId,
          voucherAmount: redeemedVoucher.voucherAmount,
          pointsRequired: redeemedVoucher.pointsRequired,
          voucherDescription: redeemedVoucher.voucherDescription,
          customerId: firebase.auth().currentUser.uid,
          customerName: firstName,
          sellerId: redeemedVoucher.sellerId,
          isVoucher: true,
      };
      return JSON.stringify(qrCodeData);
    };
    
    const filteredVouchers = vouchers.filter(voucher =>
      voucher.sellerName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <ScrollView>
        <View style={styles.container}>
          <Searchbar
            placeholder="Search"
            onChangeText={onChangeSearch}
            value={searchQuery}
          />
          <Text style={styles.whiteSpaceText}>White Space.</Text>
          <Card>
            <Card.Content>
              <Text style={styles.text}>Welcome! {firstName}</Text>
              <Text style={styles.text}>Your Current Point Balance: {currentPoint}</Text>
              <FormButton buttonTitle='Logout' onPress={logout} />
              {/* <FormButton buttonTitle='Logout' onPress={() => firebase.auth().signOut()} /> */}
            </Card.Content>
          </Card>

          <Text style={styles.heading}>Available Vouchers</Text>
          <ScrollView>
            {/* Render available vouchers */}
            {filteredVouchers.map((voucher) => (
                <TouchableOpacity
                  key={voucher.voucherId}
                  style={styles.voucherCard}
                  // onPress={() => redeemVoucher(voucher.voucherId)}
                  >
                  <Card.Content>
                    <Image src={voucher.voucherImage} style={styles.voucherImage} />

                    <Text style={styles.voucherTitle}>Seller: {voucher.sellerName}</Text>
                    <Text style={styles.voucherSubtitle}>Seller ID: {voucher.sellerId}</Text>
                    <Text style={styles.voucherSubtitle1}>Seller ID: </Text>
                    <Text style={styles.voucherTitle}>Voucher Amount: {voucher.voucherAmount}</Text>
                    <Text style={styles.voucherSubtitle}>Cost: {voucher.pointsRequired} points</Text>
                    <Text style={styles.voucherSubtitle}>Description: {voucher.voucherDescription}</Text>
                    <Text style={styles.voucherStatus}>Not Redeemed yet. Click to redeem.</Text>
                    <FormButton
                      buttonTitle="USE NOW"
                      onPress={() => redeemVoucher(voucher)}
                    />
                  </Card.Content>
                </TouchableOpacity>
            ))}

            {/* Render redeemed vouchers */}
            {redeemedVouchers.map((voucher) => (
                <TouchableOpacity
                  key={voucher.voucherId}
                  style={styles.voucherCardRedeemed}
                  onError={() => console.log("Failed to Load Image.")}
                  >
                  <Card.Content>
                    <Image source={{ uri: voucher.voucherImage }} style={styles.voucherImage} /> 
                    <Text style={styles.voucherTitle}>Seller: {voucher.sellerName}</Text>
                    <Text style={styles.voucherSubtitle}>Seller ID: {voucher.sellerId}</Text>
                    <Text style={styles.voucherSubtitle2}>Seller ID: </Text>
                    <Text style={styles.voucherTitle}>Voucher Amount: {voucher.voucherAmount}</Text>
                    <Text style={styles.voucherSubtitle}>Cost: {voucher.pointsRequired} points</Text>
                    <Text style={styles.voucherSubtitle}>Description: {voucher.voucherDescription}</Text>
                    <Text style={styles.voucherStatus}>Voucher Redeemed</Text>
                  </Card.Content>
                </TouchableOpacity>
            ))}

          </ScrollView>
          {/* Modal for Voucher QR Code */}
          
            {/* {isUseNowButtonClicked && (
              <PaperProvider>
                <Portal>
                  <Modal
                    visible={showVoucherQRCodeModal}
                    onDismiss={() => setShowVoucherQRCodeModal(false)}
                    contentContainerStyle={styles.modalContainer}
                  >
                    <Text style={styles.qrCodeText}>Scan QR Code to Redeem</Text>
                    <QRCode
                      value={JSON.stringify({
                        voucherId: redeemedVoucher.voucherId,
                        voucherAmount: redeemedVoucher.voucherAmount,
                        pointsRequired: redeemedVoucher.pointsRequired,
                        voucherDescription: redeemedVoucher.voucherDescription,
                        customerId: firebase.auth().currentUser.uid,
                        customerName: firstName,
                        sellerId: redeemedVoucher.sellerId,
                        isVoucher: true,
                      })}
                      size={200}
                    />
                  </Modal>
                </Portal>
              </PaperProvider> 
              )} */}
              

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
                <Pressable onPress={() => setShowVoucherQRCodeModal(false)}>
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
    qrCodeText: {
      fontSize: 60,
      marginBottom: 60,
      color: 'white',
      
    },
    voucherCard: {
        backgroundColor: '#003D7C',
        borderRadius: 8,
        marginRight: 8,
        width: deviceWidth * 0.9,
        height: 600,
        padding: 16,
        marginVertical: 10,
    },
    voucherSubtitle1: {
      color: '#003d7c',
    },
    voucherSubtitle2: {
      color: '#828282',
    },
    voucherImage: {
        width: '100%',
        height: 250,
        marginBottom: 10,
    },
    voucherCardRedeemed: {
        backgroundColor: '#828282',
        borderRadius: 8,
        marginRight: 8,
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
      },
    whiteSpaceText: {
    
        fontSize: 16,
        color: '#fff',
        fontWeight: 'bold',
      },
});

// import React, { useEffect, useState } from 'react';
// import { View, ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
// import { firebase } from '../../firebaseconfig';
// import { Card } from 'react-native-paper';

// const HomeScreen = () => {
//   const [vouchers, setVouchers] = useState([]);
//   const [redeemedVouchers, setRedeemedVouchers] = useState([]);

//   useEffect(() => {
//     // Fetch all vouchers from Firestore
//     firebase
//       .firestore()
//       .collection('vouchers')
//       .onSnapshot((snapshot) => {
//         const vouchersData = [];
//         const redeemedVouchersData = [];

//         snapshot.forEach((doc) => {
//           const voucher = doc.data();
//           voucher.voucherId = doc.id;

//           if (voucher.usedBy.includes(firebase.auth().currentUser.uid)) {
//             redeemedVouchersData.push(voucher);
//           } else {
//             vouchersData.push(voucher);
//           }
//         });

//         setVouchers(vouchersData);
//         setRedeemedVouchers(redeemedVouchersData);
//       });
//   }, []);

//   const redeemVoucher = (voucherId) => {
//     const currentUserUid = firebase.auth().currentUser.uid;

//     // Update the 'usedBy' array of the voucher document in Firestore
//     firebase
//       .firestore()
//       .collection('vouchers')
//       .doc(voucherId)
//       .update({
//         usedBy: firebase.firestore.FieldValue.arrayUnion(currentUserUid),
//       })
//       .then(() => {
//         console.log('Voucher redeemed successfully!');
//       })
//       .catch((error) => {
//         console.log('Error redeeming voucher:', error);
//       });
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.heading}>Available Vouchers</Text>

//       <ScrollView horizontal>
//         {/* Render available vouchers */}
//         {vouchers.map((voucher) => (
//           <TouchableOpacity
//             key={voucher.voucherId}
//             style={styles.voucherCard}
//             onPress={() => redeemVoucher(voucher.voucherId)}
//           >
//             <Card.Content>
//               <Text style={styles.voucherTitle}>{voucher.voucherAmount}</Text>
//               <Text style={styles.voucherSubtitle}>{voucher.pointsRequired} points</Text>
//               <Text style={styles.voucherStatus}>Not Redeemed</Text>
//             </Card.Content>
//           </TouchableOpacity>
//         ))}

//         {/* Render redeemed vouchers */}
//         {redeemedVouchers.map((voucher) => (
//           <View key={voucher.voucherId} style={styles.voucherCard}>
//             <Card.Content>
//               <Text style={styles.voucherTitle}>{voucher.voucherAmount}</Text>
//               <Text style={styles.voucherSubtitle}>{voucher.pointsRequired} points</Text>
//               <Text style={styles.voucherStatus}>Redeemed</Text>
//             </Card.Content>
//           </View>
//         ))}
//       </ScrollView>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 16,
//   },
//   heading: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 16,
//   },
//   voucherCard: {
//     backgroundColor: '#003D7C',
//     borderRadius: 8,
//     marginRight: 8,
//     width: 200,
//     padding: 16,
//   },
//   voucherTitle: {
//     color: '#FFF',
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginBottom: 8,
//   },
 
