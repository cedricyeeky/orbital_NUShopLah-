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
    console.log("Activity Screen useEffect running...");

    if (user && user.uid) {
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
    } else {
      console.log("User has logged out! Stop fetching UID (Activity Screen)");
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
  
    //console.log(item);

    const roundedAmountPaid = Number(item.amountPaid.toFixed(2));

    const capitalizeFirstLetter = (string) => {
      if (!string) {
        return ''; // Return an empty string if the input is empty or undefined
      }
      return string.charAt(0).toUpperCase() + string.slice(1);
    };
    
    const capitalizedString = capitalizeFirstLetter(item.voucherType);

    //There are 2 types of Transaction Log: Points and Voucher Transaction

    if (item.transactionType == "Voucher Transaction") {
      if (item.voucherType === 'dollar') {
        return (
          <View style={styles.dollarVoucherTransactionContainer}>
            <Text style={{fontWeight: 'bold', marginBottom: 5, fontSize: 13, color: '#003D7C'}}>Transaction ID: {item.id}</Text>
            <Text style={styles.transactionText}>Seller: {item.sellerName}</Text>
            <Text style={styles.transactionText}>Amount Paid: ${roundedAmountPaid}</Text>
            <Text style={styles.transactionText}>Points Awarded: {item.pointsAwarded} Points</Text>
            <Text style={styles.transactionText}>Transaction Type: {item.transactionType}</Text>
            <Text style={styles.transactionText}>Voucher Type: {capitalizedString}</Text>
            <Text style={styles.transactionText}>Voucher Description: {item.voucherDescription}</Text>
            <Text style={styles.whiteSpaceTextOrange}>White Space.</Text>
            <Text style={{fontWeight: 'bold', fontSize: 13, color: 'white'}}>Date: {formattedTimestamp}</Text>
          </View>
        );
      } else {
        return (
          <View style={styles.percentageVoucherTransactionContainer}>
            <Text style={{fontWeight: 'bold', marginBottom: 5, fontSize: 13, color: '#003D7C'}}>Transaction ID: {item.id}</Text>
            <Text style={styles.transactionText}>Seller: {item.sellerName}</Text>
            <Text style={styles.transactionText}>Amount Paid: ${roundedAmountPaid}</Text>
            <Text style={styles.transactionText}>Points Awarded: {item.pointsAwarded} Points</Text>
            <Text style={styles.transactionText}>Transaction Type: {item.transactionType}</Text>
            <Text style={styles.transactionText}>Voucher Type: {capitalizedString}</Text>
            <Text style={styles.transactionText}>Voucher Description: {item.voucherDescription}</Text>
            <Text style={styles.whiteSpaceTextPink}>White Space.</Text>
            <Text style={{fontWeight: 'bold', fontSize: 13, color: 'white'}}>Date: {formattedTimestamp}</Text>
          </View>
        );
      }
    } else {
      return (
      <View style={styles.pointTransactionContainer}>
          <Text style={{fontWeight: 'bold', marginBottom: 5, fontSize: 13, color: '#f07b10'}}>Transaction ID: {item.id}</Text>
          <Text style={styles.transactionText}>Seller: {item.sellerName}</Text>
          <Text style={styles.transactionText}>Amount Paid: ${roundedAmountPaid}</Text>
          <Text style={styles.transactionText}>Points Awarded: {item.pointsAwarded} Points</Text>
          <Text style={styles.transactionText}>Transaction Type: {item.transactionType}</Text>
          <Text style={styles.whiteSpaceTextBlue}>White Space.</Text>
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

    totalSpent = Number(totalSpent.toFixed(2));
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

      )

      : (
        <Text style={styles.noTransactions}>No transactions found.</Text>
      )}

      <Text style={styles.whiteSpaceText}>White Space.</Text>


    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 0.95,
    padding: 20,
    backgroundColor: 'white',
  },
  dollarVoucherTransactionContainer: {
    padding: 30,
    marginVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f07b10',
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
  noTransactions: {
    fontSize: 16,
    textAlign: 'center',
  },
  percentageVoucherTransactionContainer: {
    padding: 30,
    marginVertical: 10,
    borderRadius: 20,
    backgroundColor: '#db7b98',
  },
  pointTransactionContainer: {
    padding: 30,
    marginVertical: 10,
    borderRadius: 20,
    backgroundColor: '#003D7C', 
  },
  transactionText: {
    fontSize: 15,
    marginBottom: 5,
    fontWeight: 'bold',
    color: 'white',
  },
  whiteSpaceText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  whiteSpaceTextBlue: {
    fontSize: 20,
    color: '#003d7c',
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

export default ActivityScreen;


