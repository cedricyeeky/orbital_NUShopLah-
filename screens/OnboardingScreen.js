import React from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';

import Onboarding from 'react-native-onboarding-swiper';

const OnboardingScreen = ({navigation}) => {
    return (
        <Onboarding
        onSkip={() => navigation.replace("Login")}
        onDone={() => navigation.navigate("Login")}
        pages={[
          {
            backgroundColor: '#FED8B1',
            image: <Image 
            source={require('../assets/onboarding1.png')} 
            style={{
              resizeMode: "contain",
              height: 100,
              width: 200,
            }}
            />,
            title: 'Personal QR/Barcode',
            subtitle: 'Just 1 scan away from earning points',
          },
          {
            backgroundColor: '#FED8B1',
            image: <Image 
            source={require('../assets/onboarding2.png')} 
            style={{
              resizeMode: "contain",
              height: 100,
              width: 200,
            }}
            />,
            title: 'Exchange Points for Rewards',
            subtitle: 'Get rewarded as you shop',
          },
          {
            backgroundColor: '#FED8B1',
            image: <Image 
            source={require('../assets/onboarding3.png')} 
            style={{
              resizeMode: "contain",
              height: 100,
              width: 200,
            }}
            />,
            title: 'Climb up the loyalty tier',
            subtitle: 'Shop more, Earn more',
          },
          {
            backgroundColor: '#FED8B1',
            image: <Image 
            source={require('../assets/NUShopLah!.png')} 
            style={{
              resizeMode: "contain",
              height: 100,
              width: 200,
            }}
            />,
            title: 'Welcome to NUShopLah!',
            subtitle: '',
          },
        ]}
        />
    );
};

export default OnboardingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});