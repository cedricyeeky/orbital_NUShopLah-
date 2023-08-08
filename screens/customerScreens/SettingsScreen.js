/**
 * @file This file contains the SettingsScreen component, which displays user settings and loyalty information.
 * @module SettingsScreen
 */
import React, { useContext, useEffect, useState } from 'react';
import {Alert, Image, View, Text, StyleSheet, Dimensions } from 'react-native';
import { AuthContext } from '../../navigation/AuthProvider';
import { firebase } from '../../firebaseconfig';
import FormButton from '../../components/FormButton';
import { ScrollView } from 'react-native-gesture-handler';
import { Card, ProgressBar } from 'react-native-paper';

/**
 * Calculates the loyalty tier based on the total points.
 * @function
 * @param {number} points - The total points of the user.
 * @returns {string} - The loyalty tier ('Member', 'Silver', 'Gold', 'Platinum').
 */
export const calculateLoyaltyTier = (points) => {
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

/**
 * Calculates the remaining points needed to reach the next loyalty tier.
 * @function
 * @param {number} points - The total points of the user.
 * @returns {number} - The remaining points needed.
 */
export const calculateRemainingPoints = (points) => {
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

/**
 * Gets the background color based on the loyalty tier.
 * @function
 * @param {string} loyaltyTier - The loyalty tier ('Member', 'Silver', 'Gold', 'Platinum').
 * @returns {string} - The background color.
 */
export const getTierBackgroundColor = (loyaltyTier) => {
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

/**
 * Gets the image source based on the loyalty tier.
 * @function
 * @param {string} loyaltyTier - The loyalty tier ('Member', 'Silver', 'Gold', 'Platinum').
 * @returns {ImageSourcePropType} - The image source for the loyalty card.
 */
export const getImageSource = (loyaltyTier) => {
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

/**
 * The main SettingsScreen component.
 * @component
 * @returns {JSX.Element} - The rendered SettingsScreen component.
 */
const SettingsScreen = () => {
  const { user, logout } = useContext(AuthContext);
  const [totalPoint, setTotalPoint] = useState(0);
  const [currentPoint, setCurrentPoint] = useState(0);
  const [loyaltyTier, setLoyaltyTier] = useState('');
  const [remainingPoints, setRemainingPoints] = useState(0);
  const [firstName, setFirstName] = useState('');

  useEffect(() => {
    //console.log("SettingsScreen useEffect running...");

    if (user && user.uid) {
      firebase
      .firestore()
      .collection('users')
      .doc(firebase.auth().currentUser.uid)
      .get()
      .then((snapshot) => {
        if (snapshot.exists) {
          setFirstName(snapshot.data().firstName);
          console.log(firstName);
        } else {
          console.log('User does not exist');
        }
      })
      .catch((error) => {
        console.log('Error getting user:', error);
      });
    } else {
      console.log("User has logged out! Stop fetching UID (Settings Screen)");
    }
    
  }, [user]);

  // Change the password
  const changePassword = () => {
    firebase.auth().sendPasswordResetEmail(firebase.auth().currentUser.email)
    .then(() => {

      Alert.alert("Password Reset Email Sent!")
    }).catch((error) => {
      Alert.alert(error)
      console.log(error)
    })
  }

  useEffect(() => {
    if (user && user.uid) {
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
  
      //Exported
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
  
      //Exported
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
    } else {
      console.log("User logged out already. No need to fetch data (Settings Screen 2)");
    }

  }, [user]);

  //Exported
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


  // Diff card cover image source for diff loyalty tiers
  //Exported
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
    //<SafeAreaView style={{ flex: 1 }}> 
      <ScrollView>
        <View style={styles.container}>

          <Text 
            style={[styles.textWelcome, { fontSize: 20 }]}
            testID='TEST_ID_WELCOME'
          >
            Welcome! {firstName}
          </Text>

          <Text 
            style={[styles.textWelcome, { fontSize: 16 }]}
            testID='TEST_ID_INTRO'
          >
            Here is your NUShopLah! Loyalty Card!
          </Text>

          <Card 
            style={[styles.cardContainer, { backgroundColor: getTierBackgroundColor() }]}
            testID='TEST_ID_CARD'
          >
            
            <Image source={getImageSource()} 
                    style={styles.cardCover}
                    testID='TEST_ID_TIER_IMAGE'/>  
            <Card.Content 
              style={styles.cardContent}
              testID='TEST_ID_CARD_CONTENT'
            >

              <Text style={styles.text}>Total Points: {totalPoint}</Text>
              {/* {renderProgressBar()} */}
              {loyaltyTier !== 'Platinum' && (
                <><Text style={styles.label} testID='TEST_ID_REMAINING_TEXT'>
                  Remaining Points to {loyaltyTier === 'Member' ? 'Silver' : loyaltyTier === 'Silver' ? 'Gold' : 'Platinum'}:
                </Text>
                <Text style={styles.text}>
                    {remainingPoints}</Text></>
            )} 
            </Card.Content>
        </Card>

        <View >
            {benefitDescriptions.map((description, index) => (
              <View key={index} style={styles.bulletPointContainer} testID='TEST_ID_BENEFIT_DESCRIPTION'>
                <Text style={styles.bulletPoint}>{bullet}</Text>
                <Text style={styles.bulletPointText}>{description}</Text>
              </View>
            ))}
        </View>

          {/**Change Password Button */}
          <FormButton buttonTitle='Change Password' onPress={() => {changePassword()}} testID='TEST_ID_CHANGE_PASSWORD_BUTTON'/>

          <Text style={styles.whiteSpaceText}>White Space.</Text>
          <Text style={styles.whiteSpaceText}>White Space.</Text>
          <Text style={styles.whiteSpaceText}>White Space.</Text>

        </View>
      </ScrollView>
    //</SafeAreaView>
    
  );
};

const deviceWidth = Math.round(Dimensions.get('window').width);

const styles = StyleSheet.create({
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
    width: deviceWidth * 0.9,
    paddingHorizontal: 20,
    flex: 1,
  },
  cardContainer: {
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    marginBottom: 20,
    //width: deviceWidth - 30,
    flex: 1,
  },
  cardContent: {
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 0.85,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  container2: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  logoutContainer: {
    marginTop: 20,
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
  text: {
    fontSize: 16,
    marginBottom: 0,
    color: '#fff',
    fontWeight: 'bold',
  },
  textWelcome: {
    marginVertical: 15,
    color: 'black',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#fff',
  },
  tierDescription: {
    marginTop: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  whiteSpaceText: {
    fontSize: 16,
    marginBottom: 20,
    color: '#fff',
    fontWeight: 'bold',
  }
});

export default SettingsScreen;
