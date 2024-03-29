/**
 * @module SettingsScreen
 * @description A React Native screen component for sellers to view their created vouchers, and also delete them permanently and change password.
 */

import React, { useContext, useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, Image, TouchableOpacity, Alert, ScrollView } from 'react-native';
import FormButton from '../../components/FormButton';
import { AuthContext } from '../../navigation/AuthProvider';
import { firebase } from '../../firebaseconfig';

/**
 * Returns a formatted string representing the date of a voucher's timestamp.
 *
 * @param {firebase.firestore.Timestamp} timestamp - The timestamp of the voucher.
 * @returns {string} - The formatted date string.
 */
export const getDateOfVoucher = (timestamp) => {
  //console.log(timestamp);
  if (timestamp) {
    return timestamp.toDate().toLocaleString();
  } else {
    console.log("timestamp does not exist for this voucher YET. Might be due to lagging. Try again a few seconds later")
  }
}

/**
 * Displays a confirmation dialog to cancel a voucher.
 *
 * @param {string} voucherId - The ID of the voucher to be canceled.
 */
export const handleCancelVoucher = (voucherId) => {
  Alert.alert(
    'Cancel Voucher',
    'Are you sure you want to cancel this voucher?',
    [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Confirm',
        onPress: () => deleteVoucher(voucherId),
        style: 'destructive',
      },
    ],
    { cancelable: true }
  );
};

/**
 * Deletes a voucher from Firestore.
 *
 * @param {string} voucherId - The ID of the voucher to be deleted.
 */
export const deleteVoucher = (voucherId) => {
  firebase
    .firestore()
    .collection('vouchers')
    .doc(voucherId)
    .delete()
    .then(() => {
      console.log('Voucher deleted successfully.');
    })
    .catch((error) => {
      console.log('Error deleting voucher:', error);
    });
};

/**
 * Fetches vouchers for a seller from Firestore.
 *
 * @param {string} sellerId - The ID of the seller whose vouchers are to be fetched.
 * @param {Function} setVouchers - A state setter function to update the vouchers state.
 * @returns {Function} - A function to unsubscribe from the Firestore listener.
 */
export const fetchVouchers = (sellerId, setVouchers) => {
  const unsubscribe = firebase
      .firestore()
      .collection('vouchers')
      .where('sellerId', '==', sellerId)
      .orderBy('timeStamp', 'desc')
      .onSnapshot((snapshot) => {
        const data = [];
        snapshot.forEach((doc) => {
          data.push({ id: doc.id, ...doc.data() });
        });
        setVouchers(data);
      });

  return unsubscribe;
}

/**
 * Renders a voucher item in a FlatList.
 *
 * @param {Object} item - The voucher item to be rendered.
 * @returns {JSX.Element} - The JSX element representing the voucher item.
 */
export const renderItem = ({ item }) => {

  if (item.voucherType === 'dollar') {
    return (
      <View style={styles.dollarVoucherContainer} testID="TEST_ID_DOLLAR_VOUCHER">
                <Image source={{ uri: item.voucherImage }} style={styles.voucherImage} />
                <Text style={styles.voucherTextId}>Voucher ID: {item.id}</Text>
                <Text style={styles.voucherText}>Description: {item.voucherDescription}</Text>
                <Text style={styles.voucherText}>Value: ${item.voucherAmount}</Text>
                <Text style={styles.voucherText}>Points Required: {item.pointsRequired}</Text>
                <Text style={styles.whiteSpaceTextOrange}>White Space.</Text>
                <Text style={{fontWeight: 'bold', fontSize: 13, color: 'white'}}>Created On: {getDateOfVoucher(item.timeStamp)}</Text>
                <Pressable style={styles.button} onPress={() => handleCancelVoucher(item.id)}>
                  <Text style={styles.cancelText}>Cancel Voucher</Text>
                </Pressable>
              </View>
    );
  } else {
    return (
      <View style={styles.percentageVoucherContainer} testID="TEST_ID_PERCENTAGE_VOUCHER">
                <Image source={{ uri: item.voucherImage }} style={styles.voucherImage} />
                <Text style={styles.voucherTextId}>Voucher ID: {item.id}</Text>
                <Text style={styles.voucherText}>Description: {item.voucherDescription}</Text>
                <Text style={styles.voucherText}>Percentage: {item.voucherPercentage}%</Text>
                <Text style={styles.voucherText}>Points Required: {item.pointsRequired}</Text>
                <Text style={styles.whiteSpaceTextPink}>White Space.</Text>
                <Text style={{fontWeight: 'bold', fontSize: 13, color: 'white'}}>Created On: {getDateOfVoucher(item.timeStamp)}</Text>
                <Pressable style={styles.button} onPress={() => handleCancelVoucher(item.id)}>
                  <Text style={styles.cancelText}>Cancel Voucher</Text>
                </Pressable>
              </View>
    );
  }
};

/**
 * Represents the seller's settings screen.
 *
 * @returns {JSX.Element} - The JSX element representing the seller's settings screen.
 */
const SettingsScreen = () => {
  const { user, logout } = useContext(AuthContext);
  const [firstName, setFirstName] = useState('');
  const [vouchers, setVouchers] = useState([]);
  const [isBottomReached, setIsBottomReached] = useState(false);

  const changePassword = () => {
    firebase.auth().sendPasswordResetEmail(firebase.auth().currentUser.email)
    .then(() => {
      Alert.alert("Password Reset Email Sent!")
    }).catch((error) => {
      Alert.alert(error)
    })
  }

  useEffect(() => {
    console.log("(Seller Accounts) useEffect1 running...");
    if (user && user.uid) {
      firebase
      .firestore()
      .collection('users')
      .doc(firebase.auth().currentUser.uid)
      .get()
      .then((snapshot) => {
        if (snapshot.exists) {
          setFirstName(snapshot.data().firstName);
          console.log(firstName);
        } else {
          console.log('User does not exist');
        }
      })
      .catch((error) => {
        console.log('Error getting user:', error);
      });
    } else {
      console.log("Seller has logged out. (Activity Screen)");
    }
  }, [user]);

  useEffect(() => {
    console.log("(Seller Account) sorting vouchers useEffect running...");
    if (user && user.uid) {

      const unsubscribe = fetchVouchers(user.uid, setVouchers);

      return () => unsubscribe();
    } else {
      console.log("Seller has logged out. No need to load vouchers (Activity Screen)")
    }
  }, [user]);

  return (
      <View style={styles.container}>
        <Text style={styles.text}>My Vouchers</Text>
        {vouchers.length > 0 ? (
        <FlatList
          data={vouchers}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />

        ) : (
          <Text style={styles.noVouchers}>No Vouchers found.</Text>
        )}

            <View>
              <View style={styles.passwordButton}>
                <FormButton buttonTitle="Change Password" onPress={() => {changePassword()}} testID="TEST_ID_CHANGE_PASSWORD_BUTTON" />
              </View>
            </View>

      </View>
   
  );
};

const styles = StyleSheet.create({
  button: {
    marginHorizontal: 20,
    borderRadius: 10,
  },
  cancelText: {
    marginTop: 20,
    marginHorizontal: 20,
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 20,
    textAlign: 'center',
  },
  container: {
    backgroundColor: '#fff',
    padding: 15,
    flex: 0.9,
  },
  container1: {
    backgroundColor: '#f9fafd',
    padding: 20,
    flex: 0.9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dollarVoucherContainer: {
    backgroundColor: '#f07b10',
    borderRadius: 20,
    padding: 20,
    marginVertical: 10,
  },
  listContainer: {
    flexGrow: 1,
  },
  noVouchers: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 50,
  },
  passwordButton: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  percentageVoucherContainer: {
    backgroundColor: '#db7b98',
    borderRadius: 20,
    marginVertical: 10,
    padding: 20,
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 20,
    marginLeft: 16,
  },
  voucherImage: {
    width: '100%',
    height: 250,
    marginBottom: 10,
  },
  voucherText: {
    fontSize: 15,
    marginVertical: 5,
    color: 'white',
    fontWeight: 'bold',
  },
  voucherTextId: {
    fontSize: 13,
    marginVertical: 5,
    color: '#003d7c',
    fontWeight: 'bold',
  },
  whiteSpaceText: {
    fontSize: 16,
    marginBottom: 8,
    color: '#fff',
    fontWeight: 'bold',
  },
  whiteSpaceTextOrange: {
    fontSize: 20,
    color: '#f07b10',
    fontWeight: 'bold',
  },
  whiteSpaceTextPink: {
    fontSize: 20,
    color: '#db7b98',
    fontWeight: 'bold',
  },
});

export default SettingsScreen;
