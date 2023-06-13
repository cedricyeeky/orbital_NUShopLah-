// import { StyleSheet, Text, View, Button } from 'react-native'
// import { useNavigation } from '@react-navigation/native'
// import React, { useContext, useEffect, useState } from 'react';
// import { firebase } from '../../firebaseconfig';
// import { FAB } from 'react-native-paper';
// import Ionicons from 'react-native-vector-icons/Ionicons';

// const ActivityScreen = ({navigation}) => {
//   //const navigation = useNavigation();
//   const [firstName, setFirstName] = useState('')

//   useEffect(() => {
//     firebase.firestore().collection('users')
//     .doc(firebase.auth().currentUser.uid).get()
//     .then((snapshot) => {
//       if (snapshot.exists) {
//         setFirstName(snapshot.data().firstName)
//       } else {
//         console.log('User does not exist')
//       }
//     })
//     .catch((error) => {
//       console.log("Error getting user: ", error)
//     })
//   }, [])

//   return (  
//     <View style={styles.container}>
//       <Text style={styles.text}>Welcome! {firstName} This is Activity Page. You can View your Transaction History here~</Text>
//     </View>
//   )
// }

// export default ActivityScreen;

// const styles = StyleSheet.create({
//     container: {
//         backgroundColor: '#f9fafd',
//         flex: 1,
//         justifyContent: 'center',
//         alignItems: 'center',
//         padding: 20,
//     },
//     text: {
//       fontSize: 20,
//       fontWeight: 'bold',

//     },
//     fab: {
//       marginTop: 20,
//       padding: 2,
//       backgroundColor: 'white'
//     },
// })

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
      .where('sellerId', '==', user.uid)
      .onSnapshot((snapshot) => {
        const data = [];
        snapshot.forEach((doc) => {
          data.push({ id: doc.id, ...doc.data()} );
        });
        setTransactions(data);
      });

    return () => unsubscribe();
  }, [user]);

  const renderItem = ({ item }) => {

    return (
      <View style={styles.transactionContainer}>
        <Text style={styles.transactionText}>Transaction ID: {item.id}</Text>
        <Text style={styles.transactionText}>Customer: {item.customerName}</Text>
        <Text style={styles.transactionText}>Amount Received: {item.amountPaid}</Text>
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
