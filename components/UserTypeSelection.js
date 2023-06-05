import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const UserTypeSelection = ({ selectedType, onTypeSelect }) => {
  const [selected, setSelected] = useState(selectedType);

  const handleTypeSelect = (type) => {
    setSelected(type);
    onTypeSelect(type);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Are you a Customer or Seller?</Text>
      <View style={styles.radioContainer}>
        <TouchableOpacity
          style={[styles.radioButton, selected === 'Customer' && styles.selectedRadioButton]}
          onPress={() => handleTypeSelect('Customer')}
        >
          <Text style={[styles.radioText, selected === 'Customer' && styles.selectedRadioText]}>{'Customer'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.radioButton, selected === 'Seller' && styles.selectedRadioButton]}
          onPress={() => handleTypeSelect('Seller')}
        >
          <Text style={[styles.radioText, selected === 'Seller' && styles.selectedRadioText]}>{'Seller'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default UserTypeSelection;

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: 'black',
  },

  label: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingtop: 10,
    paddingHorizontal: 50,
    marginHorizontal: 10,
  },
  selectedRadioButton: {
    backgroundColor: '#F07B10',
    borderRadius: 5,
    paddingVertical: 5,
  },
  radioText: {
    fontSize: 20,
    marginLeft: 0,
  },
  selectedRadioText: {
    color: 'white',
  },
});
