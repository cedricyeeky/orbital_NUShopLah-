// import React, { useContext, useEffect, useState } from 'react';
// import { View, Text, StyleSheet } from 'react-native';
// import FormButton from '../../components/FormButton';
// import { AuthContext } from '../../navigation/AuthProvider';
// import { firebase } from '../../firebaseconfig';

// const SettingsScreen = () => {
//     const {user, logout} = useContext(AuthContext)


//     return (
//         //Check how to render firstName of a customer
//         <View style={styles.container}>
//             <Text style={styles.text}>Settings Screen</Text>
//             <FormButton buttonTitle='Logout' onPress={() => logout()} />
//         </View>
//     );
// }

// export default SettingsScreen;

// const styles = StyleSheet.create({
//     container: {
//         backgroundColor: '#f9fafd',
//         flex: 1,
//         justifyContent: 'center',
//         alignItems: 'center',
//         padding: 20,
//     },
//     text: {
//         fontSize: 20,
//         color: '#333333',
//     }
// });

import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AuthContext } from '../../navigation/AuthProvider';
import { firebase } from '../../firebaseconfig';
import FormButton from '../../components/FormButton';

const SettingsScreen = () => {
  const { user } = useContext(AuthContext);
  const [totalPoint, setTotalPoint] = useState(0);
  const [currentPoint, setCurrentPoint] = useState(0);
  const [loyaltyTier, setLoyaltyTier] = useState('');
  const [remainingPoints, setRemainingPoints] = useState(0);
  const [firstName, setFirstName] = useState('');

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
        return 'silver';
      case 'Gold':
        return 'gold';
      case 'Platinum':
        return 'purple';
      default:
        return 'black';
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.cardContainer, { backgroundColor: getTierBackgroundColor() }]}>
        <Text style={styles.title}>{firstName}'s Account</Text>
        <Text style={styles.label}>Loyalty Tier:</Text>
        <Text style={styles.text}>{loyaltyTier}</Text>
        <Text style={styles.label}>Total Points:</Text>
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

      {/**Log Out Button */}
      <View style={styles.container}>
        <Text style={styles.text}>Log out here</Text>
        <FormButton buttonTitle='Logout' onPress={() => logout()} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  cardContainer: {
    width: '80%',
    padding: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#fff',
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#fff',
  },
  text: {
    fontSize: 16,
    marginBottom: 10,
    color: '#fff',
  },
});

export default SettingsScreen;
