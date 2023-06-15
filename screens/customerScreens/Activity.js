import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image } from 'react-native';
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
        <Text style={{fontWeight: 'bold', marginBottom: 5, fontSize: 13, color: '#f07b10'}}>Transaction ID: {item.id}</Text>
        <Text style={styles.transactionText}>Seller: {item.sellerName}</Text>
        <Text style={styles.transactionText}>Amount Paid: ${item.amountPaid}</Text>
        <Text style={styles.transactionText}>Points Awarded: {item.pointsAwarded} Points</Text>
        <Text style={{fontWeight: 'bold', fontSize: 13, color: 'white'}}>Date: {formattedTimestamp}</Text>
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
    backgroundColor: 'white',
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.3,
    shadowRadius: 30,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
    
  },
  listContainer: {
    flexGrow: 1,
    
  },
  transactionContainer: {
    padding: 30,
    marginBottom: 30,
    borderRadius: 20,
    backgroundColor: '#003D7C',
    opacity: '0.9',
    
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


