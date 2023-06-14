import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { AuthContext } from '../../navigation/AuthProvider';
import { firebase } from '../../firebaseconfig';

const ActivityScreen = () => {
  const { user } = useContext(AuthContext);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const unsubscribe = firebase
      .firestore()
      .collection('transactions')
      .where('customerId', '==', user.uid)
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
  
    console.log(item);
    return (
      <View style={styles.transactionContainer}>
        <Text style={styles.transactionText}>Transaction ID: {item.id}</Text>
        <Text style={styles.transactionText}>Seller: {item.sellerName}</Text>
        <Text style={styles.transactionText}>Amount Paid: {item.amountPaid}</Text>
        <Text style={styles.transactionText}>Points Awarded: {item.pointsAwarded}</Text>
        <Text style={styles.transactionText}>Date: {formattedTimestamp}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Transaction History</Text>
      {transactions.length > 0 ? (
        <FlatList
          data={transactions}
          renderItem={renderItem}
          keyExtractor={(item) => item.transactionId}
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
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  listContainer: {
    flexGrow: 1,
  },
  transactionContainer: {
    backgroundColor: '#F0F0F0',
    padding: 10,
    marginBottom: 10,
  },
  transactionText: {
    fontSize: 16,
    marginBottom: 5,
  },
  noTransactions: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default ActivityScreen;


