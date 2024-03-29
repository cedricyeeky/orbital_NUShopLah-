/**
 * @file This file contains components and functions related to the HomeScreen, which allows sellers to create vouchers.
 * @module HomeScreen
 */

import React, { useContext, useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View, Alert, Button, Pressable, TouchableOpacity} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { firebase } from '../../firebaseconfig';
import { FAB, Card, TextInput, RadioButton, PaperProvider } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import FormInput from '../../components/FormInput';
import FormButton from '../../components/FormButton';
import { AuthContext } from '../../navigation/AuthProvider';
import { ScrollView } from 'react-native-gesture-handler';
import VoucherTypeSelection from '../../components/VoucherTypeSelection';
import { Ionicons } from '@expo/vector-icons';

/**
 * Creates a voucher in Firestore.
 *
 * @param {object} voucherData - The data for the voucher.
 * @returns {Promise<string>} - The ID of the created voucher.
 */
export const createVoucherInFirestore = async (voucherData) => {
  // try {
    const voucherId = firebase.firestore().collection('vouchers').doc().id;
    console.log("voucherId:", voucherId);

    await firebase.firestore().collection('vouchers').doc(voucherId).set({
      ...voucherData,
      voucherId
      // timeStamp: firebase.firestore.FieldValue.serverTimestamp(),
      // sellerId: firebase.auth().currentUser.uid,
    });

    console.log('Voucher created successfully!');
    return voucherId; 
  // } catch (error) {
  //   console.log('Error creating voucher:', error);
  //   throw new Error('Failed to create voucher.');
  // }
};

/**
 * Represents the Home Screen for sellers to create vouchers.
 *
 * @returns {JSX.Element} - JSX element representing the Home Screen.
 */
const HomeScreen = () => {
  const navigation = useNavigation();
  const { user, logout } = useContext(AuthContext)
  const [firstName, setFirstName] = useState('');
  const [voucherImage, setVoucherImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [voucherAmount, setVoucherAmount] = useState(''); //Code somehow reads this as a String. We then TypeCast into Integer
  const [pointsRequired, setPointsRequired] = useState(''); //Code somehow reads this as a String. We then TypeCast into Integer
  const [voucherDescription, setVoucherDescription] = useState('');
  const [checked, setChecked] = React.useState('first');
  const [voucherType, setVoucherType] = useState('dollar');
  const [voucherPercentage, setVoucherPercentage] = useState('');
  const [selectedOption, setSelectedOption] = useState(null);

  

  useEffect(() => {
    console.log("(Seller Home) useEffect running...");

    
    if (user && user.uid) {
      const fetchUserData = async () => {
        try {
          const userCollectionRef = firebase.firestore().collection('users');
          const userData = await userCollectionRef.doc(user.uid).get();
          if (userData.exists) {
            const { firstName } = userData.data();
            setFirstName(firstName);
          }
        } catch (error) {
          console.log('Error fetching user data:', error);
        }
      };

      fetchUserData();

    } else {
        console.log("Seller has logged out! (Homescreen)");
    } 
    
  }, [user]);

  /**
   * Creates a voucher based on the provided input values.
   * Handles the creation of a voucher document in Firestore and the upload of voucher image to Firebase Storage.
   * Displays alerts for error and success messages.
   */
  const createVoucher = () => {
    //Added try-catch to handle negative voucherAmount input
    try {
      if (voucherType === 'dollar') {
        if (voucherAmount < 0 || voucherAmount == '') {
          Alert.alert('Error!', 'Voucher Amount must be non-negative!');
          throw new Error('Error!, Voucher Amount must be non-negative!');
        } 
      } else {
        if (voucherPercentage < 0 || voucherPercentage == '') {
          Alert.alert('Error!', 'Voucher Percentage must be non-negative!');
          throw new Error('Error!, Voucher Percentage must be non-negative!');
        } 
      }

      if (pointsRequired < 0 || pointsRequired == '') {
        Alert.alert('Error!', 'Points Required must be non-negative!');
        throw new Error('Error!, Points Required must be non-negative!');
      } else if (voucherDescription == '') {
        Alert.alert('Error!', 'Please fill in a Voucher Description!' );
        throw new Error('Error!, Voucher Description must be filled in!');
      } else if (voucherImage == null) {
        Alert.alert('Error! Please Upload a valid Voucher Image', "WARNING: All Customers can see your uploaded image. The developers will not condone inappropriate images.");
        throw new Error('Error!, Please Upload a valid Voucher Image');
      }

        // Generate a unique voucher ID
        const voucherId = firebase.firestore().collection('vouchers').doc().id;
        console.log("voucherId:", voucherId);
      
        // Get a reference to the Firebase Storage bucket
        const storageRef = firebase.storage().ref();
        console.log('storageRef:', storageRef);
      
        // Create a reference to the voucher image file in the Storage bucket
        const imageRef = storageRef.child(`voucherImages/${voucherId}`);
        console.log('imageRef:', imageRef);
      
        // Convert the voucher image URI to a Blob object
        const xhr = new XMLHttpRequest();
        xhr.onload = async () => {
          const blob = xhr.response;
      
          // Upload the image file to Firebase Storage
          const uploadTask = imageRef.put(blob);
      
          // Listen for upload progress or completion
          uploadTask.on(
            firebase.storage.TaskEvent.STATE_CHANGED,
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              console.log(`Upload progress: ${progress}%`);
            },
            (error) => {
              console.log('Error uploading image:', error);
            },
            async () => {

              const downloadURL = await imageRef.getDownloadURL();
              console.log('Image download URL:', downloadURL);

                  // Create the voucher document in Firestore
                  firebase
                    .firestore()
                    .collection('vouchers')
                    .doc(voucherId)
                    .set({
                      isVoucher: true,
                      pointsRequired,
                      sellerName: firstName,
                      sellerId: firebase.auth().currentUser.uid,
                      timeStamp: firebase.firestore.FieldValue.serverTimestamp(),
                      usedBy: [], // Initialize the usedBy array as empty
                      voucherAmount: voucherType === 'percentage' ? "0" : voucherAmount,
                      voucherDescription,
                      voucherId,
                      voucherImage: downloadURL, 
                      voucherPercentage: voucherType === 'percentage' ? voucherPercentage : "0",
                      voucherType,
                    })
                    .then(() => {
                      console.log('Voucher created successfully!');
                      Alert.alert('Success! Voucher created successfully!');
                      // Reset the input fields
                      setVoucherImage(null);
                      setVoucherAmount('');
                      setPointsRequired('');
                      setVoucherDescription('');
                      setVoucherPercentage('');
                    })
                    .catch((error) => {
                      console.log('Error creating voucher:', error);
                      Alert.alert('Error!', 'Failed to create voucher.');
                    });

            }
          );
        };
        xhr.onerror = (error) => {
          console.log('Error creating Blob:', error);
        };
        xhr.responseType = 'blob';
        xhr.open('GET', voucherImage.uri, true);
        xhr.send();

        Alert.alert('Voucher Created', 'Your voucher has been successfully created!')
      

    } catch (err) {
      console.log(err);
    }
    
  };
  
  /**
   * Prompts the user to select an image from the device's media library.
   * Requests media library permissions and opens the image picker dialog.
   * If an image is selected, updates the state with the selected image URI.
   * @returns {Promise<void>} A promise that resolves when the image is selected.
   */
  const selectImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
  
    if (permissionResult.granted === false) {
      console.log('Camera roll permission denied');
      return;
    }
  
    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
  
    if (!pickerResult.canceled) {
      console.log(pickerResult.uri);
      setVoucherImage({ uri: pickerResult.uri });
    }
  }

  /**
   * Uploads the selected voucher image to Firebase Storage.
   * Fetches the image as a blob and stores it in the storage bucket.
   * Updates the state to indicate uploading progress and completion.
   * @returns {Promise<void>} A promise that resolves when the image is uploaded.
   */
  const uploadImage = async () => {
      setUploading(true);
      const response = await fetch(voucherImage.uri)
      const blob = await response.blob();
      const fileName = voucherImage.uri.substring(voucherImage.uri.lastIndexOf('/')+1);
      var ref = firebase.storage().ref().child(fileName).put(blob);

      try {
        await ref; 
      } catch (error) {
        console.log(error);
      }
      setUploading(false);
      Alert.alert('Voucher Image Uploaded!');
      setVoucherImage(null);
    }

  return (
    <ScrollView>
      <View style={styles.container} testID="test-id-container">
          <Image
            source={require('../../assets/NUShopLah!-logo.png')}
            style={styles.logo}
          />
          <Text style={styles.text}>Welcome! {firstName}</Text>
          <FormButton buttonTitle='Logout' onPress={logout} />

      
      

      <Text style={styles.radioButtonTitle}>Create your Voucher here!</Text>

      <VoucherTypeSelection 
        selectedType={voucherType} 
        onTypeSelect={setVoucherType}
        dollarTestId="dollar-voucher-button" 
        percentageTestId="percentage-voucher-button"  
      /> 

      {/* Render the selected card */}
      {voucherType === 'dollar' && (
        <Card style={styles.dollarCard} testID="dollar-card">
          <Card.Title title="Dollar Voucher" titleStyle={styles.titleVoucher} testID="dollar-card"/>
          <Card.Content>
            {/* Input fields */}
            <TextInput
              style={styles.textInput1}
              label="Voucher Amount ($)"
              value={String(voucherAmount)}
              keyboardType='numeric'
              onChangeText={(text) => setVoucherAmount(text)}
              selectionColor='white'
              cursorColor='white'
              activeUnderlineColor='white'
              textColor='white'
              testID='Voucher Amount ($)'
            />
            
            <TextInput
              style={styles.textInput1}
              label="Points Required"
              value={String(pointsRequired)}
              keyboardType='number-pad'
              onChangeText={(text) => setPointsRequired(text)}
              selectionColor='white'
              cursorColor='white'
              activeUnderlineColor='white'
              textColor='white'
              testID='Points Required'
            />
            
            <TextInput
              style={styles.textInput1}
              label="Voucher Description"
              value={voucherDescription}
              onChangeText={(text) => setVoucherDescription(text)}
              selectionColor='white'
              cursorColor='white'
              activeUnderlineColor='white'
              textColor='white'
              multiline= {true}
              testID='Voucher Description'
            />


            {/* Upload voucher image */}
            <Pressable style={styles.button2} onPress={selectImage} testID='voucher-image-button'>
              <Text style={styles.text1}>Choose Image From Library</Text>
            </Pressable>

            {/* Display selected image */}
            {voucherImage && (
              <Image 
                source={{ uri: voucherImage.uri }} 
                style={styles.selectedImage}
                testID='selected-image' />
            )}

          </Card.Content>
          <Card.Actions>
            <Pressable style={styles.button2} onPress={createVoucher}>
              <Text style={styles.text1}>Create</Text>

            </Pressable>
          </Card.Actions>
        </Card>
      

      )}

      {voucherType === 'percentage' && (
      <Card style={styles.percentageCard} testID="pecentage-card">
        <Card.Title title="Percentage Voucher" titleStyle={styles.titleVoucher}/>
        <Card.Content>
          {/* Input fields */}
          <TextInput
            style={styles.textInput2}
            label="Voucher Percentage (%)"
            value={String(voucherPercentage)}
            keyboardType='numeric'
            onChangeText={(text) => setVoucherPercentage(text)}
            selectionColor='white'
            cursorColor='white'
            activeUnderlineColor='white'
            textColor='white'
            testID='Voucher Percentage'
          />
          
          <TextInput
            style={styles.textInput2}
            label="Points Required"
            value={String(pointsRequired)}
            keyboardType='number-pad'
            onChangeText={(text) => setPointsRequired(text)}
            selectionColor='white'
            cursorColor='white'
            activeUnderlineColor='white'
            textColor='white'
            testID='Points Required'
          />
          
          <TextInput
            style={styles.textInput2}
            label="Voucher Description"
            value={voucherDescription}
            onChangeText={(text) => setVoucherDescription(text)}
            selectionColor='white'
            cursorColor='white'
            activeUnderlineColor='white'
            textColor='white'
            multiline={true}
            testID='Voucher Description'
          />


          {/* Upload voucher image */}
          <Pressable style={styles.button2} onPress={selectImage}>
            <Text style={styles.text1}>Choose Image From Library</Text>
          </Pressable>

          {/* Display selected image */}
          {voucherImage && (
            <Image 
              source={{ uri: voucherImage.uri }} 
              style={styles.selectedImage} 
              testID="selected-image"
            />
          )}

        </Card.Content>
        <Card.Actions>
          <Pressable style={styles.button2} onPress={createVoucher}>
            <Text style={styles.text1}>Create</Text>

          </Pressable>
        </Card.Actions>
      </Card>

      )}

      <FAB
        icon={() => <Ionicons name="scan-outline" size={20}/>}
        style={styles.fab}
        label="Scan QR"
        onPress={() => navigation.navigate('Scan QR')}
        color='#003d7c'
      />

      


      <Text style={styles.whiteSpaceText}>White Space.</Text>
      <Text style={styles.whiteSpaceText}>White Space.</Text>

    </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  button: {
    marginTop: 20,
    backgroundColor: "#f07b10",
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    marginHorizontal: 40,
  },
  button2: {
    marginTop: 30,
    backgroundColor: "#003D7C",
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
  },
  container: {
    backgroundColor: '#fff',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dollarCard: {
    width: '100%',
    marginTop: 10,
    backgroundColor: '#f07b10',
    color: 'white',
    borderRadius: 20,
    padding: 10,
  },
  fab: {
    marginTop: 25,
    padding: 2,
    backgroundColor: 'white',
  },
  logo: {
    height: 150,
    width: '100%',
    resizeMode: 'contain',
  },
  percentageCard: {
    width: '100%',
    marginTop: 10,
    backgroundColor: '#db7b98',
    color: 'white',
    borderRadius: 20,
    padding: 10,
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
    marginTop: 15,
    width: '80%',
    fontSize: 12,
    justifyContent: 'center',
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  radioButtonTitle: {
    marginTop: 40,
    marginBottom: 5,
    fontSize: 20,
    fontWeight: 'bold',
  },
  radioLabel: {
    marginLeft:20,
  },
  selectedImage: {
    width: 200,
    height: 200,
    marginTop: 10,
    resizeMode: 'cover',
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  text1: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  textInput1: {
    backgroundColor: '#f07b10',  
  },
  textInput2: {
    backgroundColor: '#db7b98',
  },
  titleVoucher: {
    fontSize: 20,
    color: 'white',
    marginTop: 20,
  },
  whiteSpaceText: {
    fontSize: 16,
    marginVertical: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default HomeScreen;
