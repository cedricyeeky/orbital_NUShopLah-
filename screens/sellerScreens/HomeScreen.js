import React, { useContext, useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View, Button, Pressable} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { firebase } from '../../firebaseconfig';
import { FAB, Card, TextInput } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import FormInput from '../../components/FormInput';

const HomeScreen = () => {
  const navigation = useNavigation();
  const [firstName, setFirstName] = useState('');
  const [voucherImage, setVoucherImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [voucherAmount, setVoucherAmount] = useState(0);
  const [pointsRequired, setPointsRequired] = useState(0);
  const [voucherDescription, setVoucherDescription] = useState('');

  useEffect(() => {
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
  }, []);

  const createVoucher = () => {
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
        () => {
          // Image upload complete, get the download URL
          const imagePath = imageRef.fullPath;
          // uploadTask.snapshot.ref
          //   .getDownloadURL()
          //   .then((downloadURL) => {
              // Create the voucher document in Firestore
              firebase
                .firestore()
                .collection('vouchers')
                .doc(voucherId)
                .set({
                  voucherId,
                  voucherImage: imagePath, 
                  voucherAmount,
                  voucherDescription,
                  pointsRequired,
                  usedBy: [], // Initialize the usedBy array as empty
                  sellerId: firebase.auth().currentUser.uid,
                  timeStamp: firebase.firestore.FieldValue.serverTimestamp(),
                })
                .then(() => {
                  console.log('Voucher created successfully!');
                  // Reset the input fields
                  setVoucherImage(null);
                  setVoucherAmount('');
                  setPointsRequired('');
                  setVoucherDescription('');
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
  
    if (!pickerResult.cancelled) {
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
    <View style={styles.container}>
      <Text style={styles.text}>Welcome! {firstName}</Text>

      {/* Create Voucher */}
      <Card style={styles.card}>
        <Card.Title title="Create Voucher" styles={fontSize=20}/>
        <Card.Content>
          {/* Input fields */}
          <TextInput
            style={styles.textInput}
            label="Voucher Amount"
            value={voucherAmount}
            keyboardType='number-pad'
            onChangeText={(text) => setVoucherAmount(text)}
          />
          
          <TextInput
            style={styles.textInput}
            label="Points Required"
            value={pointsRequired}
            keyboardType='number-pad'
            onChangeText={(text) => setPointsRequired(text)}
          />
          
          <TextInput
            style={styles.textInput}
            label="Voucher Description"
            value={voucherDescription}
            onChangeText={(text) => setVoucherDescription(text)}
          />


          {/* Upload voucher image */}
          <Pressable style={styles.button} onPress={selectImage}>
            <Text style={styles.text}>Choose Image From Library</Text>
          </Pressable>

          {/* Display selected image */}
          {voucherImage && (
            <Image source={{ uri: voucherImage.uri }} style={styles.selectedImage} />
          )}

        </Card.Content>
        <Card.Actions>
          <Pressable style={styles.button2} onPress={createVoucher}>
            <Text style={styles.text}>Create</Text>
          </Pressable>
          {/* <
            style={styles.button}
            title="Create" 
            onPress={createVoucher} /> */}
        </Card.Actions>
      </Card>

      <FAB
        icon="qrcode-scan"
        style={styles.fab}
        label="Scan QR"
        onPress={() => navigation.navigate('Scan QR')}
      />
    </View>
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
    margin: 10,
    backgroundColor: "#003D7C",
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
  },
  container: {
    backgroundColor: '#f9fafd',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  fab: {
    marginTop: 25,
    padding: 2,
    backgroundColor: 'white',
  },
  card: {
    width: '100%',
    marginTop: 20,
    backgroundColor: 'white',
  },
  selectedImage: {
    width: 200,
    height: 200,
    marginTop: 10,
    resizeMode: 'cover',
  },
  textInput: {
    backgroundColor: 'white',
  },
});

export default HomeScreen;
