import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, Dimensions } from 'react-native';
import { AuthContext } from '../../navigation/AuthProvider';
import { firebase } from '../../firebaseconfig';

const deviceWidth = Math.round(Dimensions.get('window').width);
const deviceHeight = Math.round(Dimensions.get('window').height);

const ActivityScreen = () => {
  const { user } = useContext(AuthContext);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const unsubscribe = firebase
      .firestore()
      .collection('transactions')
      .where('customerId', '==', user.uid)
      .orderBy('timeStamp', 'desc')
      .onSnapshot((snapshot) => {
        const data = [];
        snapshot.forEach((doc) => {
          data.push({ id: doc.id, ...doc.data() });
          
        });
        setTransactions(data);
      });

    return () => unsubscribe();
  }, [user]);

  const renderItem = ({ item }) => {
    // Convert the Firestore Timestamp to a JavaScript Date object
    const date = item.timeStamp.toDate();

    // Format the timestamp as a string
    const formattedTimestamp = date.toLocaleString();
  
    //console.log(item);

    //There are 2 types of Transaction Log: Points and Voucher Transaction

    if (item.pointsAwarded == 0) {
      return (
        <View style={styles.voucherTransactionContainer}>
          <Text style={{fontWeight: 'bold', marginBottom: 5, fontSize: 13, color: '#003D7C'}}>Transaction ID: {item.id}</Text>
          <Text style={styles.transactionText}>Seller: {item.sellerName}</Text>
          <Text style={styles.transactionText}>Amount Paid: ${item.amountPaid}</Text>
          <Text style={styles.transactionText}>Points Awarded: {item.pointsAwarded} Points</Text>
          <Text style={styles.transactionText}>Transaction Type: {item.transactionType}</Text>
          <Text style={styles.transactionText}>Voucher: {item.voucherDescription}</Text>
          <Text style={{fontWeight: 'bold', fontSize: 13, color: 'white'}}>Date: {formattedTimestamp}</Text>
        </View>
      );
    } else {
      return (
      <View style={styles.pointTransactionContainer}>
          <Text style={{fontWeight: 'bold', marginBottom: 5, fontSize: 13, color: '#f07b10'}}>Transaction ID: {item.id}</Text>
          <Text style={styles.transactionText}>Seller: {item.sellerName}</Text>
          <Text style={styles.transactionText}>Amount Paid: ${item.amountPaid}</Text>
          <Text style={styles.transactionText}>Points Awarded: {item.pointsAwarded} Points</Text>
          <Text style={styles.transactionText}>Transaction Type: {item.transactionType}</Text>
          <Text style={{fontWeight: 'bold', fontSize: 13, color: 'white'}}>Date: {formattedTimestamp}</Text>
        </View>
      );
    }
  };

  const calculateTotalSpent = () => {
    let totalSpent = 0;
  
    transactions.forEach((transaction) => {
      totalSpent += transaction.amountPaid;
    });
    console.log(totalSpent);
  
    return totalSpent;
  };
  

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Transaction History</Text>
      <Text style={styles.header2}>Total Spent: ${calculateTotalSpent()}</Text>
      {transactions.length > 0 ? (
        <FlatList
          data={transactions}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <Text style={styles.noTransactions}>No transactions found.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 0.9,
    padding: 20,
    backgroundColor: 'white',
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 10},
    shadowRadius: 30,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header2: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContainer: {
    flexGrow: 1,
    
  },
  pointTransactionContainer: {
    padding: 30,
    marginBottom: 30,
    borderRadius: 20,
    backgroundColor: '#003D7C',

    
  },
  voucherTransactionContainer: {
    padding: 30,
    marginBottom: 30,
    borderRadius: 20,
    backgroundColor: '#f07b10',
  },
  transactionText: {
    fontSize: 18,
    marginBottom: 5,
    fontWeight: 'bold',
    color: 'white',
  },
  noTransactions: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default ActivityScreen;


