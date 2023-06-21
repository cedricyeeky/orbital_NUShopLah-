import React, { useContext, useEffect, useState } from 'react';
import { Image, View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { AuthContext } from '../../navigation/AuthProvider';
import { firebase } from '../../firebaseconfig';
import FormButton from '../../components/FormButton';
import { Card, ProgressBar } from 'react-native-paper';

const SettingsScreen = () => {
  const { user, logout } = useContext(AuthContext);
  const [totalPoint, setTotalPoint] = useState(0);
  const [currentPoint, setCurrentPoint] = useState(0);
  const [loyaltyTier, setLoyaltyTier] = useState('');
  const [remainingPoints, setRemainingPoints] = useState(0);
  const [firstName, setFirstName] = useState('');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    
    const fetchUserData = async () => {
      try {
        const userCollectionRef = firebase.firestore().collection('users');
        const userData = await userCollectionRef.doc(user.uid).get();
        if (userData.exists) {
          const { totalPoint } = userData.data();
          setTotalPoint(totalPoint);
          setLoyaltyTier(calculateLoyaltyTier(totalPoint));
          setRemainingPoints(calculateRemainingPoints(totalPoint));
        }
      } catch (error) {
        console.log('Error fetching user data:', error);
      }
    };

    const calculateLoyaltyTier = (points) => {
      if (points >= 5000) {
        return 'Platinum';
      } else if (points >= 1500) {
        return 'Gold';
      } else if (points >= 500) {
        return 'Silver';
      } else {
        return 'Member';
      }
    };

    const calculateRemainingPoints = (points) => {
      if (points >= 5000) {
        return 0;
      } else if (points >= 1500) {
        return 5000 - points;
      } else if (points >= 500) {
        return 1500 - points;
      } else {
        return 500 - points;
      }
    };

    // Create a Firestore listener for the user's document
    const userCollectionRef = firebase.firestore().collection('users');
    const userDocRef = userCollectionRef.doc(user.uid);
    const unsubscribe = userDocRef.onSnapshot((snapshot) => {
    const userData = snapshot.data();
    if (userData) {
      const { currentPoint: updatedCurrentPoint, totalPoint: updatedTotalPoint } = userData;
      setCurrentPoint(updatedCurrentPoint);
      setTotalPoint(updatedTotalPoint);
      fetchUserData();
      }
    });

    fetchUserData();

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
  }, [user]);

  const getTierBackgroundColor = () => {
    switch (loyaltyTier) {
      case 'Silver':
        return '#c0c0c0';
      case 'Gold':
        return '#ffd51e';
      case 'Platinum':
        return '#800080';
      default:
        return 'black';
    }
  };

  let benefitDescriptions = [];
  const bullet = '\u2022'; // Unicode character for bullet symbol

  const tierBenefitDescriptions = () => {
    
  
    switch (loyaltyTier) {
      case 'Silver':
        benefitDescriptions = [
          'Earn Points at 1.25X Speed! For every $1 spent, you earn 1.25 NUShopLah! Point!',
          'Gain more NUShopLah! Points to level up to higher Tiers!',
          'More privileges coming your way! Stay Updated!',
          // Add more benefit descriptions as needed
        ];
        break;
      case 'Gold':
        benefitDescriptions = [
          'Earn Points at 1.5X Speed! For every $1 spent, you earn 1.5 NUShopLah! Point! ',
          'Gain more NUShopLah! Points to level up to higher Tiers!',
          'More privileges coming your way! Stay Updated!',
          // Add more benefit descriptions as needed
        ];
        break;
      case 'Platinum':
        benefitDescriptions = [
          'Earn Points at 2X Speed! For every $1 spent, you earn 2 NUShopLah! Point!',
          'More privileges coming your way! Stay Updated!',
          // Add more benefit descriptions as needed
        ];
        break;
      default:
        benefitDescriptions = [
          //Member
          'Gain more NUShopLah! Points to level up to higher Tiers!',
          // Add more benefit descriptions as needed
        ];
        break;
    }
  };
  
  tierBenefitDescriptions(); // Call the function to populate the benefitDescriptions array

  const handleFeedbackSubmit = () => {
    // Save feedback to Firestore or perform desired action
    console.log('Feedback submitted:', feedback);
    setFeedback('');
  };

  // Diff card cover image source for diff loyalty tiers
  const getImageSource = () => {
    switch (loyaltyTier) {
      case 'Silver':
        return require('../../assets/silverCard.png');
      case 'Gold':
        return require('../../assets/goldCard.png');
      case 'Platinum':
        return require('../../assets/platinumCard.png');
      default:
        return require('../../assets/memberCard.png');
    }
  };

  // Render Pogress Bar function
  const renderProgressBar = () => {
    if (loyaltyTier != 'Platinum') {
      // Calculate the progress percentage based on the loyalty tier and current points
      const progress = calculateProgress();

      return (
        <ProgressBar progress={progress} color="#6200EE" style={styles.progressBar} />
      );
    }

    return null;
  };

  // Calculate Progress used in renderProgressBar()
  const calculateProgress = () => {
    // Calculate the progress percentage based on the loyalty tier and current points
    switch (loyaltyTier) {
      case 'Silver':
        return (totalPoint - 500) / (totalPoint + remainingPoints);
      case 'Gold':
        return (totalPoint - 5000) / (totalPoint + remainingPoints);
      default:
        return totalPoint / (totalPoint + remainingPoints);
    }
  };

  const handleLogout = () => {
    if (user && user.uid) {
      logout();
    } else {
      // Handle the case when the user object is null or uid is not available
      console.log('User object is null or uid is not available');
    }
  };

  return (
    <ScrollView>
      <View style={styles.container}>
        <Text style={[styles.textWelcome, { fontSize: 20 }]}>Welcome! {firstName}</Text>
        <Text style={[styles.textWelcome, { fontSize: 16 }]}>Here is your NUShopLah! Loyalty Card!</Text>
        <Card style={[styles.cardContainer, { backgroundColor: getTierBackgroundColor() }]}>
          <Image source={getImageSource()} 
                  style={styles.cardCover}/>  
          <Card.Content style={styles.cardContent}>
            <Text style={styles.text}>Total Points: {totalPoint}</Text>
            {/* {renderProgressBar()} */}
            {loyaltyTier !== 'Platinum' && (
              <><Text style={styles.label}>
                Remaining Points to {loyaltyTier === 'Member' ? 'Silver' : loyaltyTier === 'Silver' ? 'Gold' : 'Platinum'}:
              </Text><Text style={styles.text}>
                  {remainingPoints}</Text></>
          )} 
          </Card.Content>
      </Card>
      <View >
          {benefitDescriptions.map((description, index) => (
            <View key={index} style={styles.bulletPointContainer}>
              <Text style={styles.bulletPoint}>{bullet}</Text>
              <Text style={styles.bulletPointText}>{description}</Text>
            </View>
          ))}
      </View>


      {/* <View style={styles.container}>
        <Text style={styles.name}>{firstName}'s Account</Text>
        <View style={[styles.cardContainer, { backgroundColor: getTierBackgroundColor() }]}>
          
          <Text style={styles.label}>NUShopLah! Loyalty Tier:</Text>
          <Text style={styles.title}>{loyaltyTier}</Text>
          <Text style={styles.label}>Total NUShopLah! Points:</Text>
          <Text style={styles.text}>{totalPoint}</Text>
          {loyaltyTier !== 'Platinum' && (
            <View>
              <Text style={styles.label}>
                Remaining Points to {loyaltyTier === 'Member' ? 'Silver' : loyaltyTier === 'Silver' ? 'Gold' : 'Platinum'}:
              </Text>
              <Text style={styles.text}>{remainingPoints}</Text>
            </View>
          )}
        </View>

        <View>
          {benefitDescriptions.map((description, index) => (
            <View key={index} style={styles.bulletPointContainer}>
              <Text style={styles.bulletPoint}>{bullet}</Text>
              <Text style={styles.bulletPointText}>{description}</Text>
            </View>
          ))}
        </View> */}

        {/* <View style={styles.feedbackContainer}>
          <Text style={styles.label}>Share Feedback</Text>
          <TextInput
            style={styles.input}
            placeholder="Share your feedback with us! We would love to serve you better!"
            value={feedback}
            onChangeText={setFeedback}
            multiline
          />
          <TouchableOpacity style={styles.feedbackButton} onPress={handleFeedbackSubmit}>
            <Text style={styles.buttonText}>Submit Feedback</Text>
          </TouchableOpacity>
        </View> */}

        {/**Log Out Button */}
        <View style={styles.container}>
          <FormButton buttonTitle='Logout' onPress={handleLogout} />
        </View>
      </View>
    </ScrollView>
  );
};

const deviceWidth = Math.round(Dimensions.get('window').width);
const offset = 40;
const radius = 20;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  logoutContainer: {
    marginTop: 20,
  },
  bulletPointContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    marginHorizontal: 30,
  },
  bulletPoint: {
    marginRight: 10,
    fontSize: 18,
    color: 'grey',
  },
  bulletPointText: {
    fontSize: 16,
    color: 'grey',
  },
  cardCover: {
    resizeMode: 'contain',
    width: deviceWidth - 80,
  },
  cardContainer: {
    padding: 20,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    marginBottom: 30,
    width: deviceWidth - 30,
  },
  cardContent: {
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedbackButton: {
    backgroundColor: 'blue',
    padding: 10,
    marginTop: 20,
    borderRadius: 5,
  },
  feedbackContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  input: {
    width: '100%',
    height: 100,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    padding: 10,
    textAlignVertical: 'top',
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#fff',
  },
  name: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    backgroundColor: 'blue',
    borderRadius: 25,
    padding: 50,
    margin: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#fff',
  },
  text: {
    fontSize: 16,
    marginBottom: 10,
    color: '#fff',
    fontWeight: 'bold',
  },
  textWelcome: {
    margin: 20,
    color: 'black',
    fontWeight: 'bold',
  },
  tierDescription: {
    marginTop: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  
});

export default SettingsScreen;
