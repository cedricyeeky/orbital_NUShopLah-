import React, { useContext, useEffect, useState } from 'react';
import { Image, View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import FormButton from '../../components/FormButton';
import { AuthContext } from '../../navigation/AuthProvider';
import { firebase } from '../../firebaseconfig';
import { Card } from 'react-native-paper';


const HomeScreen = () => {
    const {user, logout} = useContext(AuthContext)
    const [currentPoint, setCurrentPoint] = useState(0);
    const [totalPoint, setTotalPoint] = useState(0);
    const [firstName, setFirstName] = useState('');

    //Vouchers
    const [vouchers, setVouchers] = useState([]);
    const [redeemedVouchers, setRedeemedVouchers] = useState([]);

    //For Customer Details
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


    }, [])

    //For Vouchers
    useEffect(() => {
        // Fetch all vouchers from Firestore
        firebase
          .firestore()
          .collection('vouchers')
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
      const redeemVoucher = (voucherId) => {
        // Alert.alert('You are about to redeeem this voucher');
        const currentUserUid = firebase.auth().currentUser.uid;
    
        // Update the 'usedBy' array of the voucher document in Firestore
        firebase
          .firestore()
          .collection('vouchers')
          .doc(voucherId)
          .update({
            usedBy: firebase.firestore.FieldValue.arrayUnion(currentUserUid),
          })
          .then(() => {
            console.log('Voucher redeemed successfully!');
          })
          .catch((error) => {
            console.log('Error redeeming voucher:', error);
          });
      };


    return (
        <ScrollView>
        <View style={styles.container}>
          <Card>
          <Card.Content>
            <Text style={styles.text}>Welcome! {firstName}</Text>
            <Text style={styles.text}>Your Current Point Balance: {currentPoint}</Text>
            <FormButton buttonTitle='Logout' onPress={() => logout()} />
          </Card.Content>
          </Card>

          <Text style={styles.heading}>Available Vouchers</Text>
            <ScrollView horizontal>
                {/* Render available vouchers */}
                {vouchers.map((voucher) => (
                    <TouchableOpacity
                    key={voucher.voucherId}
                    style={styles.voucherCard}
                    // onPress={() => redeemVoucher(voucher.voucherId)}
                    >
                    <Card.Content>
                        <Image source={{ uri: voucher.voucherImage }} style={styles.voucherImage} />
                        <Text>{console.log(voucher.voucherImage)}</Text>
                        <Text style={styles.voucherTitle}>Voucher Amount: {voucher.voucherAmount}</Text>
                        <Text style={styles.voucherSubtitle}>Cost: {voucher.pointsRequired} points</Text>
                        <Text style={styles.voucherSubtitle}>Description: {voucher.voucherDescription}</Text>
                        <Text style={styles.voucherStatus}>Not Redeemed yet. Click to redeem.</Text>
                        <FormButton
                          buttonTitle="REDEEM"
                          onPress={() => redeemVoucher(voucher.voucherId)}
                        />
                    </Card.Content>
                    </TouchableOpacity>
                ))}

                {/* Render redeemed vouchers */}
                {redeemedVouchers.map((voucher) => (
                    <TouchableOpacity
                    key={voucher.voucherId}
                    style={styles.voucherCardRedeemed}
                    onError={() => console.log("Failed to Load Image. But you don't need it anyways.")}
                    >
                    <Card.Content>
                        {/* TO BE SOLVED LATER. IT CANNOT RENDER. <Image source={{ uri: voucher.voucherImage }} style={styles.voucherImage} /> */}
                        <Text>{console.log(voucher.voucherImage)}</Text>
                        <Text style={styles.voucherTitle}>Voucher Amount: {voucher.voucherAmount}</Text>
                        <Text style={styles.voucherSubtitle}>Cost: {voucher.pointsRequired} points</Text>
                        <Text style={styles.voucherSubtitle}>Description: {voucher.voucherDescription}</Text>
                        <Text style={styles.voucherStatus}>Voucher Redeemed</Text>
                    </Card.Content>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
        </ScrollView>
    );
}

export default HomeScreen;

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#f9fafd',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    text: {
        fontSize: 20,
        color: '#333333',
    },
    heading: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
        marginTop: 20,
    },
    voucherCard: {
        backgroundColor: '#003D7C',
        borderRadius: 8,
        marginRight: 8,
        width: 400,
        height: 350,
        padding: 16,
    },
    voucherImage: {
        width: '100%',
        height: 120,
    },
    voucherCardRedeemed: {
        backgroundColor: '#828282',
        borderRadius: 8,
        marginRight: 8,
        width: 200,
        padding: 16,
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
 
