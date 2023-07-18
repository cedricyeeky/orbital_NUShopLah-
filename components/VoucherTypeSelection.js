import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const VoucherTypeSelection = ({ selectedType, onTypeSelect }) => {
  const [selected, setSelected] = useState(selectedType);

  const handleTypeSelect = (type) => {
    setSelected(type);
    onTypeSelect(type);
  };

  return (
    <View style={styles.container}>
      <View style={styles.radioContainer}>
        <TouchableOpacity
          style={[styles.radioButton, selected === 'dollar' && styles.selectedRadioButtonOrange]}
          onPress={() => handleTypeSelect('dollar')}
        >
          <Text style={[styles.radioText, selected === 'dollar' && styles.selectedRadioText]}>{'Dollar Voucher'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.radioButton, selected === 'percentage' && styles.selectedRadioButtonPink]}
          onPress={() => handleTypeSelect('percentage')}
        >
          <Text style={[styles.radioText, selected === 'percentage' && styles.selectedRadioText]}>{'Percentage Voucher'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default VoucherTypeSelection;

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: 'black',
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingtop: 10,
    paddingHorizontal: 20,
    padding: 10,
    // marginHorizontal: 10,
  },
  selectedRadioButtonOrange: {
    backgroundColor: '#F07B10',
    borderRadius: 20,
    paddingVertical: 10,
  },
  selectedRadioButtonPink: {
    backgroundColor: '#db7b98',
    borderRadius: 20,
    paddingVertical: 10,
  },
  radioText: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  selectedRadioText: {
    color: 'white',
  },
});
