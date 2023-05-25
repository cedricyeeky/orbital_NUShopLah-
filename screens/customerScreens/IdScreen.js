import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import FormButton from '../../components/FormButton';
import { AuthContext } from '../../navigation/AuthProvider';
import { firebase } from '../../firebaseconfig';
import QRCode from 'react-native-qrcode-svg';

const IdScreen = () => {
    const {user, logout} = useContext(AuthContext)
    const [name, setName] = useState('')

    useEffect(() => {
        firebase.firestore().collection('users')
        .doc(firebase.auth().currentUser.uid).get()
        .then((snapshot) => {
            if (snapshot.exists) {
                setName(snapshot.data())
            } else {
                console.log('User does not exist')
            }
        })
    }, [])

    return (
        //Check how to render firstName of a customer
        //QR Code Goes here
        
        <View style={styles.container}>
            <Text style={styles.text}>Personal ID</Text>
            <FormButton buttonTitle='Logout' onPress={() => logout()} />
        </View>
    );
}

export default IdScreen;

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