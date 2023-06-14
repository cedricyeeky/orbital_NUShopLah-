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
        <Text style={{fontWeight: 'bold', marginBottom: 5, fontSize: 13, color: '#001b3a'}}>Transaction ID: {item.id}</Text>
        <Text style={styles.transactionText}>Seller: {item.sellerName}</Text>
        <Text style={styles.transactionText}>Amount Paid: {item.amountPaid}</Text>
        <Text style={styles.transactionText}>Points Awarded: {item.pointsAwarded}</Text>
        <Text style={{fontWeight: 'bold', fontSize: 18, color: '#001b3a'}}>Date: {formattedTimestamp}</Text>
      </View>
    );
  };
  

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Transaction History</Text>
      <Image 
        source={require('../../assets/orangeg.jpg')}
        style={StyleSheet.absoluteFillObject}
        blurRadius={50}
      />
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
    backgroundColor: '#fff',
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.3,
    shadowRadius: 30,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    
  },
  listContainer: {
    flexGrow: 1,
    
  },
  transactionContainer: {
    padding: 20,
    marginBottom: 20,
    borderRadius: 20,
    backgroundColor: 'rgba(52, 52, 52, 0.1)',
    
    
  },
  transactionText: {
    fontSize: 15,
    marginBottom: 5,
    fontWeight: 'bold',
  },
  noTransactions: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default ActivityScreen;


