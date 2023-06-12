import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import FormButton from '../../components/FormButton';
import { AuthContext } from '../../navigation/AuthProvider';
import { firebase } from '../../firebaseconfig';
import { Card } from 'react-native-paper';

const HomeScreen = () => {
    const {user, logout} = useContext(AuthContext)
    const [currentPoint, setCurrentPoint] = useState(0);
    const [totalPoint, setTotalPoint] = useState(0);
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
        });

        // Create a Firestore listener for the user's document
        const userCollectionRef = firebase.firestore().collection('users');
        const userDocRef = userCollectionRef.doc(user.uid);
        const unsubscribe = userDocRef.onSnapshot((snapshot) => {
        const userData = snapshot.data();
        if (userData) {
          const { currentPoint: updatedCurrentPoint, totalPoint: updatedTotalPoint } = userData;
          setCurrentPoint(updatedCurrentPoint);
          setTotalPoint(updatedTotalPoint);
          }
        });


    }, [])


    return (
        <View style={styles.container}>
          <Card>
          <Card.Content>
            <Text style={styles.text}>Welcome! {firstName}</Text>
            <Text style={styles.text}>Your Current Point Balance: {currentPoint}</Text>
            <FormButton buttonTitle='Logout' onPress={() => logout()} />
          </Card.Content>
          </Card>
        </View>
        // <View style={styles.container}>
        //     <Text style={styles.text}>Welcome! {firstName}</Text>
        //     <Text style={styles.text}>Your Current Point Balance: {currentPoint} </Text>
        //     <FormButton buttonTitle='Logout' onPress={() => logout()} />
        // </View>
    );
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
        color: '#333333',
        
    }
});

