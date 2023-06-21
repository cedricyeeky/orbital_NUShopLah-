import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, TouchableOpacity, Alert, ScrollView } from 'react-native';
import FormButton from '../../components/FormButton';
import { AuthContext } from '../../navigation/AuthProvider';
import { firebase } from '../../firebaseconfig';

const SettingsScreen = () => {
  const { user, logout } = useContext(AuthContext);
  const [vouchers, setVouchers] = useState([]);

  useEffect(() => {
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

  return (
    <ScrollView>
      <View style={styles.container}>
        <Text style={styles.text}>My Vouchers</Text>
        {vouchers.length > 0 ? (
            vouchers.map((voucher) => (
                <View
                    style={styles.voucherContainer}    
                >
                  <Text style={styles.voucherText}>Voucher ID: {voucher.id}</Text>
                  <Text style={styles.voucherText}>Description: {voucher.voucherDescription}</Text>
                  <Text style={styles.voucherText}>Value: {voucher.voucherAmount}</Text>
                  <Text style={styles.voucherText}>Created On: {voucher.timeStamp.toDate().toLocaleString()}</Text>
                    {/* <Text style={styles.cancelText} onPress={() => handleCancelVoucher(voucher.id)}> Cancel Voucher</Text> */}
                  <Pressable style={styles.button} onPress={() => handleCancelVoucher(voucher.id)}>
                    <Text style={styles.cancelText}>Cancel Voucher</Text>
                  </Pressable>
                  
                  {/* <TouchableOpacity 
                    onPress={() => handleCancelVoucher(voucher.id)}>
                    <Text style={styles.cancelText}>Cancel Voucher</Text>
                  </TouchableOpacity> */}
                </View>
            ))
        ) : (
            <Text style={styles.noVouchers}>No vouchers found.</Text>
        )}
        <FormButton buttonTitle="Logout" onPress={() => user?.uid && logout()} />
      </View>
    </ScrollView>
    
  );
};

const styles = StyleSheet.create({
  button: {
    marginHorizontal: 50,
    borderRadius: 10,
  },
  container: {
    backgroundColor: '#f9fafd',
    flex: 1,
    padding: 20,
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 20,
    marginLeft: 16,
  },
  voucherContainer: {
    backgroundColor: '#003d7c', //'#00B14F',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    padding: 20,
  },
  voucherText: {
    fontSize: 16,
    marginVertical: 5,
    color: 'white',
    fontWeight: 'bold',
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
  noVouchers: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 50,
  },
});

export default SettingsScreen;
