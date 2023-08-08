/**
 * @file This file contains components and functions related to the ActivityScreen, which displays transaction history for customers.
 * @module ActivityScreen
 */

import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, Dimensions } from 'react-native';
import { AuthContext } from '../../navigation/AuthProvider';
import { firebase } from '../../firebaseconfig';

const deviceWidth = Math.round(Dimensions.get('window').width);
const deviceHeight = Math.round(Dimensions.get('window').height);

/**
 * Fetches user transactions from Firestore and updates the state with the data.
 * 
 * @param {string} customerId - The ID of the customer whose transactions to fetch.
 * @param {Function} setTransactions - A state update function for transactions.
 * @returns {Function} - Unsubscribe function for the Firestore listener.
 */
export const fetchTransactions = (customerId, setTransactions) => {
  const unsubscribe = firebase
      .firestore()
      .collection('transactions')
      .where('customerId', '==', customerId)
      .orderBy('timeStamp', 'desc')
      .onSnapshot((snapshot) => {
        const data = [];
        snapshot.forEach((doc) => {
          data.push({ id: doc.id, ...doc.data() });
          
        });
        setTransactions(data);
      });
  return unsubscribe;
};

/**
 * Converts a Firestore Timestamp to a human-readable date string.
 * This also handles the case if timestamp from Firestore is lagging
 * 
 * @param {Timestamp} timestamp - The Firestore Timestamp to convert.
 * @returns {string} - The formatted date string.
 */
export const getDateOfTransaction = (timestamp) => {
  if (timestamp) {
    return timestamp.toDate().toLocaleString();
  } else {
    console.log("timestamp does not exist for this transaction YET. Might be due to lagging. Try again a few seconds later")
  }
}

/**
 * Capitalizes the first letter of a given string.
 * 
 * @param {string} string - The input string.
 * @returns {string} - The string with the first letter capitalized.
 */
export const capitalizeFirstLetter = (string) => {
  if (!string) {
    return ''; // Return an empty string if the input is empty or undefined
  }
  return string.charAt(0).toUpperCase() + string.slice(1);
};

/**
 * Calculates the total amount spent based on an array of transactions.
 * 
 * @param {Array} transactions - An array of transaction objects.
 * @returns {number} - The total amount spent.
 */
export const calculateTotalSpent = (transactions) => {
  let totalSpent = 0;

  transactions.forEach((transaction) => {
    totalSpent += transaction.amountPaid;
  });

  totalSpent = Number(totalSpent.toFixed(2));
  console.log(totalSpent);

  return totalSpent;
};

/**
 * Renders transaction items with appropriate styling and content.
 * 
 * @param {Object} item - The transaction item to render.
 * @returns {JSX.Element} - The rendered transaction component.
 */
export const renderItem = ({ item }) => {
  const formattedTimestamp = getDateOfTransaction(item.timeStamp);
  //console.log(item);
  const roundedAmountPaid = Number(item.amountPaid.toFixed(2));
  
  const capitalizedString = capitalizeFirstLetter(item.voucherType);

  //There are 2 types of Transaction Log: Points and Voucher Transaction

  if (item.transactionType == 'Voucher Transaction') {
    if (item.voucherType === 'dollar') {
      return (
        <View style={styles.dollarVoucherTransactionContainer} testID='TEST_ID_DOLLAR_VOUCHER_TRANSACTION'>
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
        <View style={styles.percentageVoucherTransactionContainer} testID='TEST_ID_PERCENTAGE_VOUCHER_TRANSACTION'>
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
    <View style={styles.pointTransactionContainer} testID='TEST_ID_POINT_TRANSACTION'>
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

const ActivityScreen = () => {
  const { user } = useContext(AuthContext);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    console.log("Activity Screen useEffect running...");

    if (user && user.uid) {
      const unsubscribe = fetchTransactions(user.uid, setTransactions);
      return () => unsubscribe();
    } else {
      console.log("User has logged out! Stop fetching UID (Activity Screen)");
    }
  }, [user]);

  //Exported
  const fetchTransactions = (customerId, setTransactions) => {
    const unsubscribe = firebase
        .firestore()
        .collection('transactions')
        .where('customerId', '==', customerId)
        .orderBy('timeStamp', 'desc')
        .onSnapshot((snapshot) => {
          const data = [];
          snapshot.forEach((doc) => {
            data.push({ id: doc.id, ...doc.data() });
            
          });
          setTransactions(data);
        });
    return unsubscribe;
  };

  //Exported
  const getDateOfTransaction = (timestamp) => {
    if (timestamp) {
      return timestamp.toDate().toLocaleString();
    } else {
      console.log("timestamp does not exist for this transaction YET. Might be due to lagging. Try again a few seconds later")
    }
  }

  //Exported
  const capitalizeFirstLetter = (string) => {
    if (!string) {
      return ''; // Return an empty string if the input is empty or undefined
    }
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const renderItem = ({ item }) => {
    const formattedTimestamp = getDateOfTransaction(item.timeStamp);
    //console.log(item);
    const roundedAmountPaid = Number(item.amountPaid.toFixed(2));
    
    const capitalizedString = capitalizeFirstLetter(item.voucherType);

    //There are 2 types of Transaction Log: Points and Voucher Transaction

    if (item.transactionType == 'Voucher Transaction') {
      if (item.voucherType === 'dollar') {
        return (
          <View style={styles.dollarVoucherTransactionContainer} testID='TEST_ID_DOLLAR_VOUCHER_TRANSACTION'>
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
          <View style={styles.percentageVoucherTransactionContainer} testID='TEST_ID_PERCENTAGE_VOUCHER_TRANSACTION'>
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
      <View style={styles.pointTransactionContainer} testID='TEST_ID_POINT_TRANSACTION'>
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

  //Exported
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
    flex: 1,
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


