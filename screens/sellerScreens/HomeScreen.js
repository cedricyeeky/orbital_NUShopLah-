import React, { useContext, useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View, Alert, Button, Pressable} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { firebase } from '../../firebaseconfig';
import { FAB, Card, TextInput, RadioButton, PaperProvider } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import FormInput from '../../components/FormInput';
import FormButton from '../../components/FormButton';
import { AuthContext } from '../../navigation/AuthProvider';
import { ScrollView } from 'react-native-gesture-handler';

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

  useEffect(() => {
    console.log("(Seller Home) useEffect running...");

    if (user && user.uid) {
      firebase
      .firestore()
      .collection('users')
      .doc(firebase.auth().currentUser.uid)
      .get()
      .then((snapshot) => {
        if (snapshot.exists) {
          setFirstName(snapshot.data().firstName);
        } else {
          console.log('User does not exist');
        }
      })
      .catch((error) => {
        console.log('Error getting user:', error);
      });
    } else {
      console.log("Seller has logged out! (Homescreen)");
    }
    
  }, [user]);

  const createVoucher = () => {
    //Added try-catch to handle negative voucherAmount input
    try {
      if (voucherAmount < 0) {
        Alert.alert('Error!', 'Voucher Amount cannot be Negative!');
        throw new Error('Error!, Voucher Amount cannot be Negative!');
      } else if (pointsRequired < 0) {
        Alert.alert('Error!', 'Points Required cannot be Negative!');
        throw new Error('Error!, Points Required cannot be Negative!');
      } else if (voucherImage == null) {
        Alert.alert('Error! Please Upload a valid Voucher Image', "WARNING: All Customers can see your uploaded image. The developers will not condone inappropriate images.");
        throw new Error('Error!, Please Upload a valid Voucher Image');
      } else {
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
              // Image upload complete, get the download URL
              // const imagePath = imageRef.fullPath;

              const downloadURL = await imageRef.getDownloadURL();
              console.log('Image download URL:', downloadURL);
              // uploadTask.snapshot.ref
              //   .getDownloadURL()
              //   .then((downloadURL) => {
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
                      setVoucherType('dollar');
                      setVoucherPercentage('');
                    })
                    .catch((error) => {
                      console.log('Error creating voucher:', error);
                      Alert.alert('Error!', 'Failed to create voucher.');
                    });
                
                // .catch((error) => {
                //   console.log('Error getting image download URL:', error);
                //   Alert.alert('Error!', 'Failed to create voucher.');
                // });
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
      }

    } catch (err) {
      console.log(err);
    }
    
  };
  

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
  // };


  return (
    <ScrollView>
      <View style={styles.container}>
          <Image
            source={require('../../assets/NUShopLah!-logo.png')}
            style={styles.logo}
          />
          <Text style={styles.text}>Welcome! {firstName}</Text>
          <FormButton buttonTitle='Logout' onPress={logout} />

      {/* Radio Buttons */}
      <View style={styles.radioContainer}>
        <View style={styles.radioButton}>
          <RadioButton
            value="dollar"
            status={voucherType === 'dollar' ? 'checked' : 'unchecked'}
            onPress={() => setVoucherType('dollar')}
          />
          <Text style={styles.radioLabel}>Dollar Voucher</Text>
        </View>
        <View style={styles.radioButton}>
          <RadioButton
            value="percentage"
            status={voucherType === 'percentage' ? 'checked' : 'unchecked'}
            onPress={() => setVoucherType('percentage')}
          />
          <Text style={styles.radioLabel}>Percentage Voucher</Text>
        </View>
      </View>

      {/* Render the selected card */}
      {voucherType === 'dollar' && (
        <Card style={styles.dollarCard}>
          <Card.Title title="Create Dollar Voucher" titleStyle={styles.titleVoucher}/>
          <Card.Content>
            {/* Input fields */}
            <TextInput
              style={styles.textInput1}
              label="Voucher Amount ($)"
              value={String(voucherAmount)}
              keyboardType='number-pad'
              onChangeText={(text) => setVoucherAmount(text)}
              selectionColor='white'
              cursorColor='white'
              activeUnderlineColor='white'
              outlineColor='white'
              activeOutlineColor='white'
              textColor='white'

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
              outlineColor='white'
              activeOutlineColor='white'
              textColor='white'
            />
            
            <TextInput
              style={styles.textInput1}
              label="Voucher Description"
              value={voucherDescription}
              onChangeText={(text) => setVoucherDescription(text)}
              selectionColor='white'
              cursorColor='white'
              activeUnderlineColor='white'
              outlineColor='white'
              activeOutlineColor='white'
              textColor='white'
            />


            {/* Upload voucher image */}
            <Pressable style={styles.button2} onPress={selectImage}>
              <Text style={styles.text1}>Choose Image From Library</Text>
            </Pressable>

            {/* Display selected image */}
            {voucherImage && (
              <Image source={{ uri: voucherImage.uri }} style={styles.selectedImage} />
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
      <Card style={styles.percentageCard}>
        <Card.Title title="Create Percentage Voucher" titleStyle={styles.titleVoucher}/>
        <Card.Content>
          {/* Input fields */}
          <TextInput
            contentStyle={styles.textInput2}
            label="Voucher Percentage (%)"
            value={String(voucherPercentage)}
            keyboardType='number-pad'
            onChangeText={(text) => setVoucherPercentage(text)}
            selectionColor='white'
            cursorColor='white'
            activeUnderlineColor='white'
            outlineColor='white'
            activeOutlineColor='white'
            textColor='white'
          />
          
          <TextInput
            contentStyle={styles.textInput2}
            label="Points Required"
            value={String(pointsRequired)}
            keyboardType='number-pad'
            onChangeText={(text) => setPointsRequired(text)}
            selectionColor='white'
            cursorColor='white'
            activeUnderlineColor='white'
            outlineColor='white'
            activeOutlineColor='white'
            textColor='white'
          />
          
          <TextInput
            contentStyle={styles.textInput2}
            label="Voucher Description"
            value={voucherDescription}
            onChangeText={(text) => setVoucherDescription(text)}
            selectionColor='white'
            cursorColor='white'
            activeUnderlineColor='white'
            outlineColor='white'
            activeOutlineColor='white'
            textColor='white'
          />


          {/* Upload voucher image */}
          <Pressable style={styles.button2} onPress={selectImage}>
            <Text style={styles.text1}>Choose Image From Library</Text>
          </Pressable>

          {/* Display selected image */}
          {voucherImage && (
            <Image source={{ uri: voucherImage.uri }} style={styles.selectedImage} />
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
        icon="qrcode-scan"
        style={styles.fab}
        label="Scan QR"
        onPress={() => navigation.navigate('Scan QR')}
      />

      <Text style={styles.whiteSpaceText}>White Space.</Text>
      <Text style={styles.whiteSpaceText}>White Space.</Text>

    </View>
    </ScrollView>
  );
};


const styles = StyleSheet.create({
  titleVoucher: {
    fontSize: 20,
    color: 'white',
    marginTop: 20,
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
    marginTop: 15,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  radioLabel: {
    marginLeft: 8,
  },
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
  text: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  text1: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  fab: {
    marginTop: 25,
    padding: 2,
    backgroundColor: 'white',
  },
  dollarCard: {
    width: '100%',
    marginTop: 10,
    backgroundColor: '#f07b10',
    color: 'white',
    borderRadius: 20,
    padding: 10,
  },
  percentageCard: {
    width: '100%',
    marginTop: 10,
    backgroundColor: '#db7b98',
    color: 'white',
    borderRadius: 20,
    padding: 10,
  },
  selectedImage: {
    width: 200,
    height: 200,
    marginTop: 10,
    resizeMode: 'cover',
  },
  textInput1: {
    backgroundColor: '#f07b10',  
  },
  textInput2: {
    backgroundColor: '#db7b98',
  },
  whiteSpaceText: {
    fontSize: 16,
    marginVertical: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  logo: {
    height: 150,
    width: '100%',
    resizeMode: 'contain',
  },
});

export default HomeScreen;
