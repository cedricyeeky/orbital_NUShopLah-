import { StyleSheet, Text, View, Button } from 'react-native'
import React from 'react'
import { useNavigation } from '@react-navigation/native'



const HomeScreen = () => {
  const navigation = useNavigation();
  return (  
    <View style={styles.container}>
      <Text>Seller HomeScreen</Text>
      <Button title='Scan' onPress={() => navigation.navigate("Scanner")}/>
    </View>
  )
}

export default HomeScreen;

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#f9fafd',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
})