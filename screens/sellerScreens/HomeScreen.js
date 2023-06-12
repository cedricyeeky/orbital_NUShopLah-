import { StyleSheet, Text, View, Button } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import React, { useContext, useEffect, useState } from 'react';
import { firebase } from '../../firebaseconfig';


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
      <Button title='Scan' onPress={() => navigation.navigate('Scan QR')}/>
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
})