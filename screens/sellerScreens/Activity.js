import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { AuthContext } from '../../navigation/AuthProvider';
import { firebase } from '../../firebaseconfig';

const ActivityScreen = () => {
  const { user } = useContext(AuthContext);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    console.log("(Seller Activity) useEffect running...");

    if (user && user.uid) {
      const unsubscribe = firebase
      .firestore()
      .collection('transactions')
      .where('sellerId', '==', user.uid)
      .orderBy('timeStamp', 'desc')
      .onSnapshot((snapshot) => {
        const data = [];
        snapshot.forEach((doc) => {
          data.push({ id: doc.id, ...doc.data()} );
        });
        setTransactions(data);
      });

      return () => unsubscribe();
    } else {
      console.log("Seller has logged out!(Activity Screen)");
    }
  }, [user]);

  //Handle if timestamp from Firestore is lagging
  const getDateOfTransaction = (timestamp) => {
    if (timestamp) {
      return timestamp.toDate().toLocaleString();
    } else {
      console.log("timestamp does not exist for this transaction YET. Might be due to lagging. Try again a few seconds later")
    }
  }

  const renderItem = ({ item }) => {
    // Convert the Firestore Timestamp to a JavaScript Date object
    // Format the timestamp as a string
    const formattedTimestamp = getDateOfTransaction(item.timeStamp);

    const roundedAmountPaid = Number(item.amountPaid.toFixed(2));

    const capitalizeFirstLetter = (string) => {
      if (!string) {
        return ''; // Return an empty string if the input is empty or undefined
      }
      return string.charAt(0).toUpperCase() + string.slice(1);
    };
    
    const capitalizedString = capitalizeFirstLetter(item.voucherType);

    //Render According to Transaction Type
    if (item.pointsAwarded == 0) {
      return (
        <View style={styles.voucherTransactionContainer}>
          <Text style={{fontWeight: 'bold', marginBottom: 5, fontSize: 13, color: '#003D7C'}}>Transaction ID: {item.id}</Text>
          <Text style={styles.transactionText}>Customer: {item.customerName}</Text>
          <Text style={styles.transactionText}>Amount Paid: ${roundedAmountPaid}</Text>
          <Text style={styles.transactionText}>Points Awarded: {item.pointsAwarded} Points</Text>
          <Text style={styles.transactionText}>Transaction Type: {item.transactionType}</Text>
          <Text style={styles.transactionText}>Voucher Type: {capitalizedString}</Text>
          <Text style={styles.transactionText}>Voucher: {item.voucherDescription}</Text>
          <Text style={{fontWeight: 'bold', fontSize: 13, color: 'white'}}>Date: {formattedTimestamp}</Text>
        </View>
      );
    //points
    } else {
      return (
      <View style={styles.pointTransactionContainer}>
          <Text style={{fontWeight: 'bold', marginBottom: 5, fontSize: 13, color: '#f07b10'}}>Transaction ID: {item.id}</Text>
          <Text style={styles.transactionText}>Customer: {item.customerName}</Text>
          <Text style={styles.transactionText}>Amount Paid: ${roundedAmountPaid}</Text>
          <Text style={styles.transactionText}>Points Awarded: {item.pointsAwarded} Points</Text>
          <Text style={styles.transactionText}>Transaction Type: {item.transactionType}</Text>
          <Text style={{fontWeight: 'bold', fontSize: 13, color: 'white'}}>Date: {formattedTimestamp}</Text>
        </View>
      );
    }
  };

  const calculateTotalRevenue = () => {
    let totalRevenue = 0;
  
    transactions.forEach((transaction) => {
      totalRevenue += transaction.amountPaid;
    });

    totalRevenue = Number(totalRevenue.toFixed(2));
    console.log(totalRevenue);
  
    return totalRevenue;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Transaction History</Text>
      <Text style={styles.header2}>Total Revenue: ${calculateTotalRevenue()}</Text>
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
    flex: 0.95,
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
    marginLeft: 16,
  },
  header2: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 16,
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
