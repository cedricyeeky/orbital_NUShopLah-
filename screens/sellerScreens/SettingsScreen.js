import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Image, TouchableOpacity, Alert, ScrollView } from 'react-native';
import FormButton from '../../components/FormButton';
import { AuthContext } from '../../navigation/AuthProvider';
import { firebase } from '../../firebaseconfig';

const SettingsScreen = () => {
  const { user, logout } = useContext(AuthContext);
  const [firstName, setFirstName] = useState('');
  const [vouchers, setVouchers] = useState([]);

  // Change the password
  const changePassword = () => {
    firebase.auth().sendPasswordResetEmail(firebase.auth().currentUser.email)
    .then(() => {
      alert("Password Reset Email Sent!")
    }).catch((error) => {
      alert(error)
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
      const unsubscribe = firebase
      .firestore()
      .collection('vouchers')
      .where('sellerId', '==', user.uid)
      .orderBy('timeStamp', 'desc')
      .onSnapshot((snapshot) => {
        const data = [];
        snapshot.forEach((doc) => {
          data.push({ id: doc.id, ...doc.data() });
        });
        setVouchers(data);
      });

      return () => unsubscribe();
    } else {
      console.log("Seller has logged out. No need to load vouchers (Activity Screen)")
    }
  }, [user]);

  const handleCancelVoucher = (voucherId) => {
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

  const deleteVoucher = (voucherId) => {
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

  const getDateOfVoucher = (timestamp) => {
    //console.log(timestamp);
    if (timestamp) {
      return timestamp.toDate().toLocaleString();
    } else {
      console.log("timestamp does not exist for this voucher YET. Might be due to lagging. Try again a few seconds later")
    }
  }

  return (
    <ScrollView>
      <View style={styles.container}>
        <Text style={styles.text}>My Vouchers</Text>
        {vouchers.length > 0 ? (
            vouchers.map((voucher) => (
              <View 
                key={voucher.id}  
                style={voucher.voucherType === 'dollar' ? styles.dollarVoucherContainer : styles.percentageVoucherContainer}
              >

              {voucher.voucherType === 'dollar' && (
              <View>
                {/* Render dollar voucher */}
                <Image source={{ uri: voucher.voucherImage }} style={styles.voucherImage} />
                <Text style={styles.voucherTextId}>Voucher ID: {voucher.id}</Text>
                <Text style={styles.voucherText}>Description: {voucher.voucherDescription}</Text>
                <Text style={styles.voucherText}>Value: ${voucher.voucherAmount}</Text>
                <Text style={styles.voucherText}>Points Required: {voucher.pointsRequired}</Text>
                <Text style={styles.whiteSpaceTextOrange}>White Space.</Text>
                <Text style={{fontWeight: 'bold', fontSize: 13, color: 'white'}}>Created On: {getDateOfVoucher(voucher.timeStamp)}</Text>
                <Pressable style={styles.button} onPress={() => handleCancelVoucher(voucher.id)}>
                  <Text style={styles.cancelText}>Cancel Voucher</Text>
                </Pressable>
              </View>
              )}
            
              {voucher.voucherType === 'percentage' && (
              <View>
                {/* Render percentage voucher */}
                <Image source={{ uri: voucher.voucherImage }} style={styles.voucherImage} />
                <Text style={styles.voucherTextId}>Voucher ID: {voucher.id}</Text>
                <Text style={styles.voucherText}>Description: {voucher.voucherDescription}</Text>
                <Text style={styles.voucherText}>Percentage: {voucher.voucherPercentage}%</Text>
                <Text style={styles.voucherText}>Points Required: {voucher.pointsRequired}</Text>
                <Text style={styles.whiteSpaceTextPink}>White Space.</Text>
                <Text style={{fontWeight: 'bold', fontSize: 13, color: 'white'}}>Created On: {getDateOfVoucher(voucher.timeStamp)}</Text>
                <Pressable style={styles.button} onPress={() => handleCancelVoucher(voucher.id)}>
                  <Text style={styles.cancelText}>Cancel Voucher</Text>
                </Pressable>
              </View>
              )}
                  
              </View>    
            ))
        ) : (
            <Text style={styles.noVouchers}>No vouchers found.</Text>
        )}
        {/**Change Password Button */}
        <View style={styles.passwordButton}>
          <FormButton buttonTitle='Change Password' onPress={() => {changePassword()}} />
        </View>

        <Text style={styles.whiteSpaceText}>White Space.</Text>
        <Text style={styles.whiteSpaceText}>White Space.</Text>


      </View>
    </ScrollView>
    
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
    padding: 20,
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
    padding: 30,
    marginVertical: 10,
  },
  noVouchers: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 50,
  },
  passwordButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentageVoucherContainer: {
    backgroundColor: '#db7b98',
    borderRadius: 20,
    marginVertical: 10,
    padding: 30,
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
    marginBottom: 20,
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
