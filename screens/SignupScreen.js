import React, {useContext, useState} from 'react';
import {ScrollView, Text, TouchableOpacity, Platform, StyleSheet, View} from 'react-native';
import FormInput from '../components/FormInput';
import FormButton from '../components/FormButton';
import SocialButton from '../components/SocialButton';
import { AuthContext } from '../navigation/AuthProvider';
import UserTypeSelection from '../components/UserTypeSelection';

const SignupScreen = ({navigation}) => {
  const [email, setEmail] = useState()
  const [password, setPassword] = useState()
  const [confirmPassword, setConfirmPassword] = useState()
  const [firstName, setFirstName] = useState()
  // const [lastName, setLastName] = useState() 
  const [userType, setUserType] = useState('Customer'); // Default user type is 'Customer'
  const [currentPoint, setCurrentPoint] = useState(0);
  const [totalPoint, setTotalPoint] = useState(0);
  const [amountPaid, setAmountPaid] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0); 
  
  // currentPoint, totalPoint, amountPaid, totalRevenue
  const {register} = useContext(AuthContext);

  return (
    <ScrollView>
      <View style={styles.container}>
        <Text style={styles.text}>Create an account</Text>

        <FormInput
          labelValue={email}
          onChangeText={(userEmail) => setEmail(userEmail)}
          placeholderText="Email"
          iconType="mail"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <FormInput
          labelValue={firstName}
          onChangeText={(firstName) => setFirstName(firstName)}
          placeholderText="Enter your Full Name"
          iconType="user"
          autoCorrect={false}
        />

        {/* <FormInput
          labelValue={lastName}
          onChangeText={(lastName) => setLastName(lastName)}
          placeholderText="Last Name"
          iconType="user"
          autoCorrect={false}
        /> */}

        <FormInput
          labelValue={password}
          onChangeText={(userPassword) => setPassword(userPassword)}
          placeholderText="Password"
          iconType="lock"
          secureTextEntry={true}
        />

        <FormInput
          labelValue={confirmPassword}
          onChangeText={(userPassword) => setConfirmPassword(userPassword)}
          placeholderText="Confirm Password"
          iconType="lock"
          secureTextEntry={true}
        />

        {/* <UserTypeSelection selectedType={userType} onTypeSelect={(userType) => setUserType(userType)} />  */}
        <UserTypeSelection selectedType={userType} onTypeSelect={setUserType} /> 

        {/**Register takes in: email, password, firstName, lastName,
         *  userType = Customer (by default) || Seller, currentPoint = 0, TotalPoint = 0, amountPaid = 0 */}
        <FormButton
          buttonTitle="Sign Up"
          onPress={() => register(email, password, firstName, {/**lastName */}, userType, currentPoint, totalPoint, amountPaid, totalRevenue)}
        />

        {/* <SocialButton
        buttonTitle="Sign Up with Google"
        btnType="google"
        color="#de4d41"
        backgroundColor="#f5e7ea"
        onPress={() => {}}
        /> */}

        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate('Login')}>
          <Text style={styles.navButtonText}>Have an account? Sign In</Text>
        </TouchableOpacity>

        <Text style={styles.whiteSpaceText}>White Space.</Text>
        <Text style={styles.whiteSpaceText}>White Space.</Text>
        <Text style={styles.whiteSpaceText}>White Space.</Text>
        <Text style={styles.whiteSpaceText}>White Space.</Text>
      </View>
    </ScrollView>
  );
};

export default SignupScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    fontSize: 28,
    marginBottom: 10,
    color: '#051d5f',
    fontWeight: 'bold',
  },
  navButton: {
    marginVertical: 25,
  },
  navButtonText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#2e64e5',
  },
  textPrivate: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 35,
    justifyContent: 'center',
  },
  color_textPrivate: {
    fontSize: 13,
    fontWeight: '400',
    color: 'grey',
  },
  whiteSpaceText: {
    fontSize: 16,
    marginBottom: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
});