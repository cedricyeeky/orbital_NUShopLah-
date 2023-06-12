import { StyleSheet, Text, View, Button } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import React, { useContext, useEffect, useState } from 'react';
import { firebase } from '../../firebaseconfig';
import { FAB } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';

const HomeScreen = ({navigation}) => {
  //const navigation = useNavigation();
  const [firstName, setFirstName] = useState('')

  useEffect(() => {
    firebase.firestore().collection('users')
    .doc(firebase.auth().currentUser.uid).get()
    .then((snapshot) => {
      if (snapshot.exists) {
        setFirstName(snapshot.data().firstName)
      } else {
        console.log('User does not exist')
      }
    })
    .catch((error) => {
      console.log("Error getting user: ", error)
    })
  }, [])

  return (  
    <View style={styles.container}>
      <Text style={styles.text}>Welcome! {firstName}</Text>
      <FAB
        icon="qrcode-scan"
        style={styles.fab}
        label= 'Scan QR'
        onPress={() => navigation.navigate('Scan QR')}
      />
      {/* <Button title='Scan' onPress={() => navigation.navigate('Scan QR')}/> */}
    </View>
  )
}

export default HomeScreen;

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#f9fafd',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    text: {
      fontSize: 20,
      fontWeight: 'bold',

    },
    fab: {
      marginTop: 20,
      padding: 2,
      backgroundColor: 'white'
    },
})