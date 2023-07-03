import React, {useContext, useState} from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import FormInput from '../components/FormInput';
import FormButton from '../components/FormButton';
import SocialButton from '../components/SocialButton';
import { AuthContext } from '../navigation/AuthProvider';
import { firebase } from '../firebaseconfig';

const LoginScreen = ({navigation}) => {
  const [email, setEmail] = useState()
  const [password, setPassword] = useState()

  const {login} = useContext(AuthContext)

  // Forget Password
  const forgetPassword = () => {
    firebase.auth().sendPasswordResetEmail(email) //this email is from the email input bar. check if it is correct
    .then(() => {
      alert("Password Reset Email Sent!")
      console.log("Password Reset Email Sent!")
    }).catch((error) => {
      alert(error)
    })
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image
        source={require('../assets/NUShopLah!-logo.png')}
        style={styles.logo}
      />
      <Text style={styles.text}>Login</Text>

      <FormInput
        labelValue={email}
        onChangeText={(userEmail) => setEmail(userEmail)}
        placeholderText="Email"
        iconType="user"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />

      <FormInput
        labelValue={password}
        onChangeText={(userPassword) => setPassword(userPassword)}
        placeholderText="Password"
        iconType="lock"
        secureTextEntry={true}
      />

      <FormButton
        buttonTitle="Sign In"
        onPress={() => login(email, password)}
      />

      <TouchableOpacity style={styles.forgotButton} onPress={() => {forgetPassword()}}>
        <Text style={styles.navButtonText}>Forgot Password?</Text>
      </TouchableOpacity>

      <SocialButton
        buttonTitle="Sign In with Google"
        btnType="google"
        color="#de4d41"
        backgroundColor="#f5e7ea"
        onPress={() => {}}
      /> 

      <TouchableOpacity style={styles.forgotButton} onPress={() => navigation.navigate('Signup')}> 
        <Text style={styles.navButtonText}>Don't have an account? Create here</Text>
      </TouchableOpacity>

    </ScrollView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  logo: {
    height: 250,
    width: 380,
    resizeMode: 'contain',
  },
  text: {
    fontSize: 28,
    marginBottom: 10,
    color: '#051d5f',
    fontWeight: 'bold',
  },
  navButton: {
    marginTop: 15,
  },
  forgotButton: {
    marginVertical: 35,
  },
  navButtonText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#2e64e5',
  },
});